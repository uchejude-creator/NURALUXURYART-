import { NextResponse } from "next/server";

import { getPublicSupabaseClient } from "@/lib/supabase/public";

type NewsletterPayload = {
  email?: unknown;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let payload: NewsletterPayload;

  try {
    payload = (await request.json()) as NewsletterPayload;
  } catch {
    return errorResponse("The subscription could not be read.");
  }

  const email = cleanText(payload.email, 254).toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    return errorResponse("Please enter a valid email address.");
  }

  const { error } = await getPublicSupabaseClient().from("newsletter_subscribers").insert({
    email,
    status: "active",
    source: "website",
  });

  if (error?.code === "23505") {
    return NextResponse.json({
      ok: true,
      message: "You are already on the collector list.",
    });
  }

  if (error) {
    console.error(error);
    return errorResponse("We could not save your subscription. Please try again.", 500);
  }

  return NextResponse.json({
    ok: true,
    message: "You are on the collector list.",
  });
}
