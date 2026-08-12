import type { Metadata } from "next";
import Link from "next/link";

import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { formatCurrency } from "@/lib/format";
import { routes } from "@/lib/routes";
import { verifyAndRecordPaystackPayment } from "@/lib/checkout-payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Checkout Complete",
  description: "Confirm your NURALUXURYART Paystack payment status.",
};

type CheckoutCompletePageProps = {
  searchParams: Promise<{
    reference?: string | string[];
    trxref?: string | string[];
  }>;
};

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatPaymentAmount(amountSubunit: number | undefined, currency: string | undefined) {
  if (typeof amountSubunit !== "number") {
    return null;
  }

  return formatCurrency(Math.round(amountSubunit / 100), currency ?? "NGN");
}

export default async function CheckoutCompletePage({ searchParams }: CheckoutCompletePageProps) {
  const resolvedSearchParams = await searchParams;
  const reference =
    firstSearchParam(resolvedSearchParams.reference) ??
    firstSearchParam(resolvedSearchParams.trxref) ??
    "";

  let title = "We could not verify this payment.";
  let message =
    "The payment reference was missing. Please contact collector care if money left your account.";
  let amount: string | null = null;
  let requestLabel: string | null = null;
  let isSuccess = false;

  if (reference) {
    try {
      const result = await verifyAndRecordPaystackPayment(reference);
      amount = formatPaymentAmount(result.amountSubunit, result.currency);
      requestLabel = result.requestId ? result.requestId.slice(0, 8) : null;

      if (result.status === "success") {
        title = "Payment verified.";
        message =
          "Your Paystack payment has been confirmed. Our collector care team will follow up with delivery handling and final fulfilment details.";
        isSuccess = true;
      } else if (result.status === "pending") {
        title = "Payment is still pending.";
        message =
          "Paystack has not marked this payment as successful yet. We will keep checking through the webhook and you can contact us with the reference below.";
      } else if (result.status === "mismatch") {
        title = "Payment needs manual review.";
        message =
          "Paystack confirmed a payment, but the verified amount or currency did not match the order. We will review this before fulfilment.";
      } else if (result.status === "not_found") {
        title = "Reference not linked to an order.";
        message =
          "Paystack returned this payment reference, but it was not found on a saved checkout request. Please contact us with the reference below.";
      } else {
        title = "Payment was not successful.";
        message =
          "Paystack did not mark this transaction as successful. You can try checkout again or contact collector care for help.";
      }
    } catch (error) {
      console.error(error);
      title = "Payment verification is unavailable.";
      message =
        "We could not reach the payment verification system just now. Please contact collector care with your Paystack reference.";
    }
  }

  return (
    <main className="min-h-screen bg-cream px-6 pb-20 pt-32 text-ink lg:px-10 lg:pt-40">
      <ClearCartOnSuccess enabled={isSuccess} />
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
          Paystack Checkout
        </p>
        <h1 className="mt-5 font-serif text-5xl font-light leading-none sm:text-7xl">
          {title}
        </h1>
        <p className="mt-6 text-base leading-8 text-stone">{message}</p>

        <div className="mt-9 rounded-card border border-ink/10 bg-gallery-white p-6 shadow-[0_24px_70px_rgba(25,24,21,0.06)]">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
                Reference
              </dt>
              <dd className="mt-2 break-all font-semibold text-ink">{reference || "Not provided"}</dd>
            </div>
            {requestLabel ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
                  Request
                </dt>
                <dd className="mt-2 font-semibold text-ink">{requestLabel}</dd>
              </div>
            ) : null}
            {amount ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
                  Verified amount
                </dt>
                <dd className="mt-2 font-semibold text-ink">{amount}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href={routes.account}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            View account
          </Link>
          <Link
            href={routes.contact}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink/15 px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Contact collector care
          </Link>
        </div>
      </section>
    </main>
  );
}
