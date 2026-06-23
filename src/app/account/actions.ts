"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getPublicOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export type CustomerLoginState = {
  status: "idle" | "success" | "error";
  message: string;
};

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getSafeNext(value: FormDataEntryValue | string | null | undefined) {
  const next = typeof value === "string" ? value : "";

  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/admin")) {
    return "/account";
  }

  return next;
}

function getAccountLoginRedirect(error: string, next = "/account") {
  const url = new URL("/account/login", "https://nuraluxuryart.com");
  url.searchParams.set("error", error);
  url.searchParams.set("next", getSafeNext(next));
  return `${url.pathname}${url.search}`;
}

export async function sendCustomerLoginLink(
  _previousState: CustomerLoginState,
  formData: FormData,
): Promise<CustomerLoginState> {
  const email = cleanText(formData.get("email"), 254).toLowerCase();
  const next = getSafeNext(formData.get("next"));

  if (!email.includes("@")) {
    return {
      status: "error",
      message: "Enter a valid email address.",
    };
  }

  const supabase = await createClient();
  const requestHeaders = await headers();
  const redirectOrigin = getPublicOrigin(requestHeaders.get("origin"));

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${redirectOrigin}/auth/confirm?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message.toLowerCase().includes("rate limit")
        ? "Please wait a moment before requesting another sign-in link."
        : "We could not send the sign-in link. Please try again.",
    };
  }

  return {
    status: "success",
    message: "Check your email for the secure sign-in link.",
  };
}

export async function signInWithGoogle(formData: FormData) {
  const next = getSafeNext(formData.get("next"));
  const supabase = await createClient();
  const requestHeaders = await headers();
  const redirectOrigin = getPublicOrigin(requestHeaders.get("origin"));

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${redirectOrigin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) {
    redirect(getAccountLoginRedirect("Google sign-in is not ready yet. Please use email sign-in.", next));
  }

  redirect(data.url);
}

export async function signOutCustomer() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/account/login?signedOut=1");
}
