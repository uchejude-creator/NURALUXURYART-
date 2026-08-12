import { NextResponse } from "next/server";

import { verifyAndRecordPaystackPayment } from "@/lib/checkout-payments";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();

  try {
    if (!verifyPaystackWebhookSignature(rawBody, request.headers.get("x-paystack-signature"))) {
      return NextResponse.json({ error: "Invalid Paystack signature." }, { status: 401 });
    }
  } catch (error) {
    console.error("Paystack webhook signature verification failed", error);
    return NextResponse.json({ error: "Webhook verification unavailable." }, { status: 500 });
  }

  let event: PaystackWebhookEvent;

  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    try {
      await verifyAndRecordPaystackPayment(event.data.reference);
    } catch (error) {
      console.error("Paystack webhook payment recording failed", error);
      return NextResponse.json({ error: "Payment recording failed." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
