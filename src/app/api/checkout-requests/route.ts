import { NextResponse } from "next/server";

import { sendCheckoutRequestEmails } from "@/lib/email/templates";

type CheckoutItemInput = {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  medium?: unknown;
  price?: unknown;
  quantity?: unknown;
  imageSrc?: unknown;
};

type CheckoutPayload = {
  customer?: {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    deliveryPreference?: unknown;
    deliveryCountry?: unknown;
    deliveryState?: unknown;
    deliveryCity?: unknown;
    deliveryAddress?: unknown;
    deliveryLandmark?: unknown;
    note?: unknown;
  };
  items?: CheckoutItemInput[];
};

const DELIVERY_OPTIONS = new Set([
  "Lagos delivery",
  "Pickup or gallery consultation",
  "Outside Lagos delivery",
]);

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://xuhwuwdsamnisvxezobh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_-G9JTK2ef--s_X0UE-ipSg_BAQeJ_PT";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizePrice(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null;
}

function normalizeQuantity(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return 1;
  }

  return Math.min(Math.max(value, 1), 99);
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function insertIntoSupabase(table: string, body: unknown) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Failed to insert ${table}`);
  }
}

export async function POST(request: Request) {
  let payload: CheckoutPayload;

  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return errorResponse("The checkout request could not be read.");
  }

  const customerName = cleanText(payload.customer?.name, 160);
  const customerEmail = cleanText(payload.customer?.email, 254).toLowerCase();
  const customerPhone = cleanText(payload.customer?.phone, 60);
  const deliveryPreference = cleanText(payload.customer?.deliveryPreference, 80);
  const deliveryCountry = cleanText(payload.customer?.deliveryCountry, 120);
  const deliveryState = cleanText(payload.customer?.deliveryState, 120);
  const deliveryCity = cleanText(payload.customer?.deliveryCity, 160);
  const deliveryAddress = cleanText(payload.customer?.deliveryAddress, 500);
  const deliveryLandmark = cleanText(payload.customer?.deliveryLandmark, 220);
  const deliveryNote = cleanText(payload.customer?.note, 1000);

  if (customerName.length < 2) {
    return errorResponse("Please enter your full name.");
  }

  if (!EMAIL_PATTERN.test(customerEmail)) {
    return errorResponse("Please enter a valid email address.");
  }

  if (customerPhone.length < 5) {
    return errorResponse("Please enter a valid phone or WhatsApp number.");
  }

  if (!DELIVERY_OPTIONS.has(deliveryPreference)) {
    return errorResponse("Please choose a delivery preference.");
  }

  if (deliveryCountry.length < 2) {
    return errorResponse("Please enter the delivery country.");
  }

  if (deliveryState.length < 2) {
    return errorResponse("Please enter the delivery state.");
  }

  if (deliveryCity.length < 2) {
    return errorResponse("Please enter the delivery city or area.");
  }

  if (deliveryAddress.length < 8) {
    return errorResponse("Please enter the full delivery address.");
  }

  const items = Array.isArray(payload.items) ? payload.items.slice(0, 20) : [];

  if (items.length === 0) {
    return errorResponse("Please add at least one artwork before checkout.");
  }

  const requestId = crypto.randomUUID();
  const checkoutItems = items
    .map((item) => {
      const artworkId = cleanText(item.id, 120);
      const artworkSlug = cleanText(item.slug, 160);
      const title = cleanText(item.title, 220);
      const medium = cleanText(item.medium, 220);
      const price = normalizePrice(item.price);
      const quantity = normalizeQuantity(item.quantity);

      if (!artworkId || !artworkSlug || !title || !medium) {
        return null;
      }

      return {
        request_id: requestId,
        artwork_id: artworkId,
        artwork_slug: artworkSlug,
        title,
        medium,
        price,
        quantity,
        image_src: cleanText(item.imageSrc, 500) || null,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (checkoutItems.length === 0) {
    return errorResponse("The selected artworks could not be verified.");
  }

  const itemCount = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = checkoutItems.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0,
  );

  try {
    await insertIntoSupabase("checkout_requests", {
      id: requestId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      delivery_preference: deliveryPreference,
      delivery_country: deliveryCountry,
      delivery_state: deliveryState,
      delivery_city: deliveryCity,
      delivery_address: deliveryAddress,
      delivery_landmark: deliveryLandmark || null,
      delivery_note: deliveryNote || null,
      item_count: itemCount,
      total_amount: totalAmount,
      currency: "NGN",
      status: "new",
      source: "website",
    });

    await insertIntoSupabase("checkout_request_items", checkoutItems);
  } catch (error) {
    console.error(error);
    return errorResponse("We could not save your checkout request. Please try again.", 500);
  }

  await sendCheckoutRequestEmails({
    requestId,
    customerName,
    customerEmail,
    customerPhone,
    deliveryPreference,
    deliveryCountry,
    deliveryState,
    deliveryCity,
    deliveryAddress,
    deliveryLandmark: deliveryLandmark || null,
    deliveryNote: deliveryNote || null,
    items: checkoutItems,
    totalAmount,
  });

  return NextResponse.json({ requestId });
}
