import { revalidatePath } from "next/cache";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  isPaystackReference,
  type PaystackVerifyData,
  verifyPaystackTransaction,
} from "@/lib/paystack";

type CheckoutPaymentRow = {
  id: string;
  currency: string | null;
  status: string | null;
  total_amount: number | null;
};

export type CheckoutPaymentResult = {
  amountSubunit?: number;
  currency?: string;
  message: string;
  paymentStatus: string;
  reference: string;
  requestId?: string;
  status: "success" | "pending" | "failed" | "mismatch" | "not_found";
};

const pendingStatuses = new Set(["ongoing", "pending", "processing", "queued"]);
const failedStatuses = new Set(["abandoned", "failed", "reversed"]);

function normalizePaymentStatus(status: string | null | undefined) {
  const normalized = status?.toLowerCase() ?? "pending";

  if (normalized === "success" || pendingStatuses.has(normalized) || failedStatuses.has(normalized)) {
    return normalized;
  }

  return "pending";
}

function getPaidAt(data: PaystackVerifyData) {
  return data.paid_at ?? data.paidAt ?? null;
}

function isAmountMatch(request: CheckoutPaymentRow, data: PaystackVerifyData) {
  if (typeof request.total_amount !== "number" || typeof data.amount !== "number") {
    return false;
  }

  return request.total_amount * 100 === data.amount;
}

function isCurrencyMatch(request: CheckoutPaymentRow, data: PaystackVerifyData) {
  return (request.currency ?? "NGN").toUpperCase() === (data.currency ?? "NGN").toUpperCase();
}

export async function verifyAndRecordPaystackPayment(reference: string): Promise<CheckoutPaymentResult> {
  if (!isPaystackReference(reference)) {
    return {
      message: "The Paystack reference is invalid.",
      paymentStatus: "failed",
      reference,
      status: "failed",
    };
  }

  const verifiedPayment = await verifyPaystackTransaction(reference);
  const supabase = getSupabaseAdminClient();
  const { data: checkoutRequest, error: requestError } = await supabase
    .from("checkout_requests")
    .select("id,total_amount,currency,status")
    .eq("paystack_reference", reference)
    .maybeSingle<CheckoutPaymentRow>();

  if (requestError) {
    throw new Error(requestError.message);
  }

  if (!checkoutRequest) {
    return {
      amountSubunit: verifiedPayment.amount,
      currency: verifiedPayment.currency,
      message: "No checkout request was found for this Paystack reference.",
      paymentStatus: normalizePaymentStatus(verifiedPayment.status),
      reference,
      status: "not_found",
    };
  }

  const paymentStatus = normalizePaymentStatus(verifiedPayment.status);
  const baseUpdate = {
    payment_amount_subunit: verifiedPayment.amount ?? null,
    payment_currency: verifiedPayment.currency ?? "NGN",
    payment_provider: "paystack",
    payment_status: paymentStatus,
    payment_verified_at: new Date().toISOString(),
    paystack_channel: verifiedPayment.channel ?? null,
    paystack_gateway_response:
      verifiedPayment.gateway_response ?? verifiedPayment.message ?? null,
    paystack_transaction_id:
      verifiedPayment.id === null || verifiedPayment.id === undefined
        ? null
        : String(verifiedPayment.id),
  };

  if (paymentStatus === "success") {
    if (!isAmountMatch(checkoutRequest, verifiedPayment) || !isCurrencyMatch(checkoutRequest, verifiedPayment)) {
      const { error } = await supabase
        .from("checkout_requests")
        .update({
          ...baseUpdate,
          payment_status: "failed",
          paystack_gateway_response: "Paystack amount or currency did not match the checkout request.",
        })
        .eq("id", checkoutRequest.id);

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath("/admin/orders");
      revalidatePath("/account");

      return {
        amountSubunit: verifiedPayment.amount,
        currency: verifiedPayment.currency,
        message: "Paystack confirmed payment, but the amount or currency did not match this order.",
        paymentStatus: "failed",
        reference,
        requestId: checkoutRequest.id,
        status: "mismatch",
      };
    }

    const { error } = await supabase
      .from("checkout_requests")
      .update({
        ...baseUpdate,
        paid_at: getPaidAt(verifiedPayment),
        status: "paid",
      })
      .eq("id", checkoutRequest.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/orders");
    revalidatePath("/account");

    return {
      amountSubunit: verifiedPayment.amount,
      currency: verifiedPayment.currency,
      message: "Payment verified successfully.",
      paymentStatus,
      reference,
      requestId: checkoutRequest.id,
      status: "success",
    };
  }

  const { error } = await supabase
    .from("checkout_requests")
    .update(baseUpdate)
    .eq("id", checkoutRequest.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account");

  return {
    amountSubunit: verifiedPayment.amount,
    currency: verifiedPayment.currency,
    message:
      pendingStatuses.has(paymentStatus)
        ? "Payment is still pending with Paystack."
        : "Paystack did not mark this payment as successful.",
    paymentStatus,
    reference,
    requestId: checkoutRequest.id,
    status: failedStatuses.has(paymentStatus) ? "failed" : "pending",
  };
}
