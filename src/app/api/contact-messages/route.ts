import { NextResponse } from "next/server";

import { sendContactEmails } from "@/lib/email/templates";
import { getPublicSupabaseClient } from "@/lib/supabase/public";

type ContactPayload = {
  company?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  topic?: unknown;
  message?: unknown;
  submittedAt?: unknown;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOPICS = new Set([
  "Artwork availability",
  "Custom order request",
  "Delivery and installation",
  "Pricing and checkout",
  "General enquiry",
]);
const SPAM_PHRASES = [
  "add email capture",
  "boost your seo",
  "get you more leads",
  "improve your product page seo",
  "lead generation",
  "more leads",
  "quick chat",
  "seo and",
];

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function successResponse() {
  return NextResponse.json({ ok: true });
}

function looksLikeSpam(message: string) {
  const normalized = message.toLowerCase();

  return SPAM_PHRASES.some((phrase) => normalized.includes(phrase));
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return errorResponse("The message could not be read.");
  }

  const honeypot = cleanText(payload.company, 120);
  const submittedAt = typeof payload.submittedAt === "number" ? payload.submittedAt : 0;
  const name = cleanText(payload.name, 160);
  const email = cleanText(payload.email, 254).toLowerCase();
  const phone = cleanText(payload.phone, 60);
  const topic = cleanText(payload.topic, 120);
  const message = cleanText(payload.message, 2000);

  if (honeypot || (submittedAt > 0 && Date.now() - submittedAt < 2500)) {
    return successResponse();
  }

  if (name.length < 2) {
    return errorResponse("Please enter your name.");
  }

  if (!EMAIL_PATTERN.test(email)) {
    return errorResponse("Please enter a valid email address.");
  }

  if (phone && phone.length < 5) {
    return errorResponse("Please enter a valid phone or WhatsApp number.");
  }

  if (!TOPICS.has(topic)) {
    return errorResponse("Please choose a contact topic.");
  }

  if (message.length < 8) {
    return errorResponse("Please share a little more detail.");
  }

  if (looksLikeSpam(`${name} ${email} ${topic} ${message}`)) {
    return successResponse();
  }

  const { error } = await getPublicSupabaseClient().from("contact_messages").insert({
    customer_name: name,
    customer_email: email,
    customer_phone: phone || null,
    topic,
    message,
    status: "new",
    source: "website",
  });

  if (error) {
    console.error(error);
    return errorResponse("We could not save your message. Please try again.", 500);
  }

  await sendContactEmails({
    name,
    email,
    phone,
    topic,
    message,
  });

  return successResponse();
}
