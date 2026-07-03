import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

const FALLBACK_EMAIL_TYPES: EmailOtpType[] = ["email", "signup", "magiclink"];

function getSafeNext(value: string | null, fallback = "/account") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function isAdminNext(next: string) {
  return next === "/admin" || next.startsWith("/admin/");
}

function getFailurePath(next: string) {
  return isAdminNext(next) ? "/admin/login" : "/account/login";
}

function getLoginRedirect(requestUrl: URL, error: string, next: string) {
  const url = new URL(getFailurePath(next), requestUrl.origin);
  url.searchParams.set("error", error);
  if (!isAdminNext(next)) {
    url.searchParams.set("next", next);
  }
  return NextResponse.redirect(url);
}

function getCandidateTypes(type: EmailOtpType) {
  return [type, ...FALLBACK_EMAIL_TYPES.filter((candidate) => candidate !== type)];
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
    let lastError: unknown = null;

    for (const candidateType of getCandidateTypes(type)) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: candidateType,
      });

      if (!error) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }

      lastError = error;
    }

    if (lastError) {
      return getLoginRedirect(requestUrl, "The sign-in link is invalid or has expired.", next);
    }
  }

  return getLoginRedirect(
    requestUrl,
    isAdminNext(next) ? "Request a fresh admin sign-in link." : "Request a fresh sign-in link.",
    next,
  );
}
