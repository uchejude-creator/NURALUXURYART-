import crypto from "node:crypto";

const PAYSTACK_API_BASE_URL = "https://api.paystack.co";
const PAYSTACK_REFERENCE_PATTERN = /^[A-Za-z0-9.\-=]+$/;
const KOBO_PER_NAIRA = 100;

type PaystackEnvelope<T> = {
  status: boolean;
  message?: string;
  data?: T;
};

export type PaystackInitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackVerifyData = {
  id?: string | number;
  status?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  paid_at?: string | null;
  paidAt?: string | null;
  channel?: string | null;
  gateway_response?: string | null;
  message?: string | null;
  customer?: {
    email?: string | null;
  } | null;
};

type InitializeTransactionInput = {
  amount: number;
  callbackUrl: string;
  email: string;
  metadata: Record<string, unknown>;
  reference: string;
};

function getPaystackSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  }

  return secretKey;
}

async function readPaystackResponse<T>(response: Response) {
  let body: PaystackEnvelope<T>;

  try {
    body = (await response.json()) as PaystackEnvelope<T>;
  } catch {
    throw new Error("Paystack returned an unreadable response.");
  }

  if (!response.ok || !body.status || !body.data) {
    throw new Error(body.message || "Paystack could not complete the request.");
  }

  return body.data;
}

export function hasPaystackConfig() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

export function createPaystackReference(requestId: string) {
  const compactId = requestId.replace(/[^A-Za-z0-9]/g, "").slice(0, 18);

  return `nla-${Date.now()}-${compactId}`;
}

export function isPaystackReference(value: string) {
  return value.length > 0 && value.length <= 120 && PAYSTACK_REFERENCE_PATTERN.test(value);
}

export function toPaystackSubunit(amount: number) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Paystack amount must be a positive whole NGN amount.");
  }

  return amount * KOBO_PER_NAIRA;
}

export async function initializePaystackTransaction({
  amount,
  callbackUrl,
  email,
  metadata,
  reference,
}: InitializeTransactionInput) {
  const data = await readPaystackResponse<PaystackInitializeData>(
    await fetch(`${PAYSTACK_API_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        callback_url: callbackUrl,
        currency: "NGN",
        email,
        metadata,
        reference,
      }),
      cache: "no-store",
    }),
  );

  if (!data.authorization_url || !data.access_code || !data.reference) {
    throw new Error("Paystack did not return a checkout link.");
  }

  return data;
}

export async function verifyPaystackTransaction(reference: string) {
  if (!isPaystackReference(reference)) {
    throw new Error("Invalid Paystack transaction reference.");
  }

  return readPaystackResponse<PaystackVerifyData>(
    await fetch(`${PAYSTACK_API_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${getPaystackSecretKey()}`,
      },
      cache: "no-store",
    }),
  );
}

export function verifyPaystackWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha512", getPaystackSecretKey())
    .update(rawBody)
    .digest("hex");
  const expected = Buffer.from(expectedSignature, "hex");
  const received = Buffer.from(signature, "hex");

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
