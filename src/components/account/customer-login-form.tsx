"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccounts = {
  id: {
    initialize: (options: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
      use_fedcm_for_prompt?: boolean;
    }) => void;
    renderButton: (
      parent: HTMLElement,
      options: {
        theme: "outline" | "filled_blue" | "filled_black";
        size: "large" | "medium" | "small";
        type: "standard" | "icon";
        shape: "pill" | "rectangular" | "circle" | "square";
        text: "continue_with" | "signin_with" | "signup_with";
        logo_alignment: "left" | "center";
        width: number;
      },
    ) => void;
    cancel: () => void;
  };
};

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

function loadGoogleIdentityScript() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Google sign-in failed to load.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google sign-in failed to load."));
    document.head.appendChild(script);
  });
}

type CustomerLoginFormProps = {
  error?: string;
  next?: string;
  signedOut?: boolean;
};

export function CustomerLoginForm({ error, next = "/account", signedOut }: CustomerLoginFormProps) {
  const [googleMessage, setGoogleMessage] = useState("");
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  const displayMessage =
    googleMessage ||
    error ||
    (signedOut ? "You have been signed out of your collector account." : "");
  const displayStatus = googleMessage || error ? "error" : signedOut ? "success" : "idle";

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    let mounted = true;

    loadGoogleIdentityScript()
      .then(() => {
        if (!mounted || !window.google?.accounts?.id || !googleButtonRef.current) {
          return;
        }

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
          callback: async (response) => {
            setGoogleMessage("");

            if (!response.credential) {
              setGoogleMessage("Google sign-in could not be completed. Please try again.");
              return;
            }

            const supabase = createClient();
            const { error: signInError } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
            });

            if (signInError) {
              setGoogleMessage("Google sign-in could not be completed. Please try again.");
              return;
            }

            router.replace(next);
            router.refresh();
          },
        });

        const buttonWidth = Math.min(
          Math.max(Math.floor(googleButtonRef.current.getBoundingClientRect().width), 280),
          420,
        );

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "left",
          width: buttonWidth,
        });
      })
      .catch(() => {
        if (mounted) {
          setGoogleMessage("Google sign-in is not available right now. Please try again shortly.");
        }
      });

    return () => {
      mounted = false;
      window.google?.accounts?.id.cancel();
    };
  }, [googleClientId, next, router]);

  return (
    <div className="mt-8 space-y-5">
      {googleClientId ? (
        <div
          ref={googleButtonRef}
          className="flex min-h-13 w-full items-center justify-center rounded-full bg-gallery-white"
          aria-label="Continue with Google"
        />
      ) : (
        <p className="rounded-card border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink">
          Google sign-in is being configured. You can still checkout without an account.
        </p>
      )}

      {displayMessage ? (
        <p
          className={`rounded-card border px-4 py-3 text-sm leading-6 ${
            displayStatus === "success"
              ? "border-gold/40 bg-gold/10 text-ink"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {displayMessage}
        </p>
      ) : null}
    </div>
  );
}
