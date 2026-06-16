"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

function redirectToLogin(error: string) {
  window.location.replace(`/admin/login?error=${encodeURIComponent(error)}`);
}

export function AdminAuthLinkRedirect() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const next = getSafeNext(url.searchParams.get("next"));
    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type") ?? "email";
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
    const hashError =
      hashParams.get("error_description") ?? hashParams.get("error") ?? url.searchParams.get("error");
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    if (hashError) {
      redirectToLogin(hashError);
      return;
    }

    if (code) {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("code", code);
      callbackUrl.searchParams.set("next", next);
      router.replace(callbackUrl.toString());
      return;
    }

    if (tokenHash) {
      const confirmUrl = new URL("/auth/confirm", window.location.origin);
      confirmUrl.searchParams.set("token_hash", tokenHash);
      confirmUrl.searchParams.set("type", type);
      confirmUrl.searchParams.set("next", next);
      router.replace(confirmUrl.toString());
      return;
    }

    if (!accessToken || !refreshToken) {
      return;
    }

    const sessionAccessToken = accessToken;
    const sessionRefreshToken = refreshToken;
    let isActive = true;

    async function setSessionAndRedirect() {
      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: sessionAccessToken,
        refresh_token: sessionRefreshToken,
      });

      if (!isActive) {
        return;
      }

      if (error) {
        redirectToLogin("The sign-in link is invalid or has expired.");
        return;
      }

      router.replace(next);
    }

    void setSessionAndRedirect();

    return () => {
      isActive = false;
    };
  }, [router]);

  return null;
}
