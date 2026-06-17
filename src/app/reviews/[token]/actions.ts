"use server";

import { redirect } from "next/navigation";

import { getPublicSupabaseClient } from "@/lib/supabase/public";

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanRating(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return 5;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 5) : 5;
}

export async function submitCustomerReviewAction(formData: FormData) {
  const token = cleanText(formData.get("token"), 80);
  const rating = cleanRating(formData.get("rating"));
  const quote = cleanText(formData.get("quote"), 900);
  const location = cleanText(formData.get("location"), 160);

  if (!token || quote.length < 8) {
    redirect(`/reviews/${token || "missing"}?error=missing-fields`);
  }

  const { data, error } = await getPublicSupabaseClient().rpc("submit_customer_review", {
    p_token: token,
    p_rating: rating,
    p_quote: quote,
    p_location: location || null,
  });

  if (error || data !== true) {
    redirect(`/reviews/${token}?error=${encodeURIComponent(error?.message || "review-not-accepted")}`);
  }

  redirect(`/reviews/${token}/thank-you`);
}
