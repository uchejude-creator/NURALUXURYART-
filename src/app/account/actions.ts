"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getConfiguredSiteUrl } from "@/lib/site-url";
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
  const redirectOrigin = getConfiguredSiteUrl();

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
  const redirectOrigin = getConfiguredSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${redirectOrigin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirect("/account/login?error=Google%20sign-in%20could%20not%20be%20started.%20Please%20try%20again.");
  }

  redirect(data.url);
}

export async function signOutCustomer() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/account/login?signedOut=1");
}
