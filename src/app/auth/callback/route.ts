import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

function getSafeNext(value: string | null, fallback = "/admin") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function getFailurePath(next: string) {
  return next.startsWith("/account") ? "/account/login" : "/admin/login";
}

function getLoginRedirect(requestUrl: URL, error: string, next: string) {
  const url = new URL(getFailurePath(next), requestUrl.origin);
  url.searchParams.set("error", error);
  if (next.startsWith("/account")) {
    url.searchParams.set("next", next);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = getSafeNext(requestUrl.searchParams.get("next"));
  const authError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error") ??
    requestUrl.searchParams.get("error_code");

  if (authError) {
    return getLoginRedirect(requestUrl, authError, next);
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return getLoginRedirect(requestUrl, "The sign-in link is invalid or has expired.", next);
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return getLoginRedirect(requestUrl, "The sign-in link is invalid or has expired.", next);
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  return getLoginRedirect(
    requestUrl,
    next.startsWith("/account")
      ? "Request a fresh sign-in link."
      : "Request a fresh admin sign-in link.",
    next,
  );
}
