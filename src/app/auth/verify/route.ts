import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const FALLBACK_EMAIL_TYPES: EmailOtpType[] = ["email", "signup", "magiclink"];

function getSafeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }

  return value;
}

function isAdminNext(next: string) {
  return next === "/admin" || next.startsWith("/admin/");
}

function getFailurePath(next: string) {
  return isAdminNext(next) ? "/admin/login" : "/account/login";
}

function getFailureRedirect(requestUrl: URL, next: string, message: string) {
  const url = new URL(getFailurePath(next), requestUrl.origin);
  url.searchParams.set("error", message);

  if (!isAdminNext(next)) {
    url.searchParams.set("next", next);
  }

  return NextResponse.redirect(url);
}

function getCandidateTypes(type: EmailOtpType) {
  return [type, ...FALLBACK_EMAIL_TYPES.filter((candidate) => candidate !== type)];
}

async function verifyOtpWithFallback(tokenHash: string, type: EmailOtpType) {
  const supabase = await createClient();
  let lastError: unknown = null;

  for (const candidateType of getCandidateTypes(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: candidateType,
    });

    if (!error) {
      return null;
    }

    lastError = error;
  }

  return lastError;
}

async function exchangeCodeForSession(code: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  return error;
}

async function verifyAuthLink({
  code,
  requestUrl,
  tokenHash,
  type,
  next,
}: {
  code?: string;
  requestUrl: URL;
  tokenHash: string;
  type: EmailOtpType;
  next: string;
}) {
  if (code) {
    const error = await exchangeCodeForSession(code);

    if (error) {
      return getFailureRedirect(requestUrl, next, "The sign-in link is invalid or has expired.");
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  if (!tokenHash) {
    return getFailureRedirect(requestUrl, next, "Request a fresh sign-in link.");
  }

  const error = await verifyOtpWithFallback(tokenHash, type);

  if (error) {
    return getFailureRedirect(requestUrl, next, "The sign-in link is invalid or has expired.");
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = getSafeNext(requestUrl.searchParams.get("next"));
  const code = requestUrl.searchParams.get("code") ?? "";
  const tokenHash = requestUrl.searchParams.get("token_hash") ?? "";
  const type = (requestUrl.searchParams.get("type") ?? "email") as EmailOtpType;
  const confirmUrl = new URL("/auth/confirm", requestUrl.origin);
  confirmUrl.searchParams.set("next", next);

  if (code) {
    confirmUrl.searchParams.set("code", code);
  }

  if (tokenHash) {
    confirmUrl.searchParams.set("token_hash", tokenHash);
    confirmUrl.searchParams.set("type", type);
  }

  return NextResponse.redirect(confirmUrl);
}

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const next = getSafeNext(String(formData.get("next") ?? "/account"));
  const code = String(formData.get("code") ?? "");
  const tokenHash = String(formData.get("token_hash") ?? formData.get("tokenHash") ?? "");
  const type = String(formData.get("type") ?? "email") as EmailOtpType;

  return verifyAuthLink({ code, requestUrl, tokenHash, type, next });
}
