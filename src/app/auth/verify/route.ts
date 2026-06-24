import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getSafeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

function getFailurePath(next: string) {
  return next.startsWith("/account") ? "/account/login" : "/admin/login";
}

function getFailureRedirect(requestUrl: URL, next: string, message: string) {
  const url = new URL(getFailurePath(next), requestUrl.origin);
  url.searchParams.set("error", message);

  if (next.startsWith("/account")) {
    url.searchParams.set("next", next);
  }

  return NextResponse.redirect(url);
}

async function verifyAuthLink({
  requestUrl,
  tokenHash,
  type,
  next,
}: {
  requestUrl: URL;
  tokenHash: string;
  type: EmailOtpType;
  next: string;
}) {
  if (!tokenHash) {
    return getFailureRedirect(requestUrl, next, "Request a fresh sign-in link.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    return getFailureRedirect(requestUrl, next, "The sign-in link is invalid or has expired.");
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = getSafeNext(requestUrl.searchParams.get("next"));
  const tokenHash = requestUrl.searchParams.get("token_hash") ?? "";
  const type = (requestUrl.searchParams.get("type") ?? "email") as EmailOtpType;

  return verifyAuthLink({ requestUrl, tokenHash, type, next });
}

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const next = getSafeNext(String(formData.get("next") ?? "/admin"));
  const tokenHash = String(formData.get("token_hash") ?? formData.get("tokenHash") ?? "");
  const type = String(formData.get("type") ?? "email") as EmailOtpType;

  return verifyAuthLink({ requestUrl, tokenHash, type, next });
}
