"use client";

import Script from "next/script";
import { useActionState, useCallback, useEffect, useRef, useState, useTransition } from "react";

import {
  sendCustomerLoginLink,
  signInWithGoogleCredential,
  type CustomerLoginState,
  type GoogleLoginState,
} from "@/app/account/actions";

const initialState: CustomerLoginState = {
  status: "idle",
  message: "",
};

const initialGoogleState: GoogleLoginState = {
  status: "idle",
  message: "",
};

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccounts = {
  accounts: {
    id: {
      cancel: () => void;
      initialize: (options: {
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        callback: (response: GoogleCredentialResponse) => void;
        client_id: string;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          logo_alignment?: "left" | "center";
          shape?: "pill" | "rectangular" | "circle" | "square";
          size?: "large" | "medium" | "small";
          text?: "signin_with" | "signup_with" | "continue_with" | "signin";
          theme?: "outline" | "filled_blue" | "filled_black";
          width?: number;
        },
      ) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

type CustomerLoginFormProps = {
  error?: string;
  next?: string;
  signedOut?: boolean;
};

export function CustomerLoginForm({ error, next = "/account", signedOut }: CustomerLoginFormProps) {
  const [state, formAction, pending] = useActionState(sendCustomerLoginLink, initialState);
  const [googleState, setGoogleState] = useState(initialGoogleState);
  const [googleReady, setGoogleReady] = useState(false);
  const [googlePending, startGoogleTransition] = useTransition();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleCredential = useCallback(
    (response: GoogleCredentialResponse) => {
      const credential = response.credential ?? "";

      if (!credential) {
        setGoogleState({
          status: "error",
          message: "Google sign-in was cancelled. Please try again.",
        });
        return;
      }

      startGoogleTransition(() => {
        setGoogleState(initialGoogleState);

        void signInWithGoogleCredential(credential, next)
          .then((result) => {
            if (result?.status === "error") {
              setGoogleState(result);
            }
          })
          .catch(() => {
            setGoogleState({
              status: "error",
              message: "Google sign-in could not be completed. Please try again.",
            });
          });
      });
    },
    [next],
  );

  useEffect(() => {
    if (!googleClientId || !googleReady || !googleButtonRef.current || !window.google?.accounts.id) {
      return;
    }

    const buttonHost = googleButtonRef.current;
    buttonHost.innerHTML = "";

    window.google.accounts.id.initialize({
      auto_select: false,
      cancel_on_tap_outside: true,
      callback: handleGoogleCredential,
      client_id: googleClientId,
    });

    window.google.accounts.id.renderButton(buttonHost, {
      logo_alignment: "center",
      shape: "pill",
      size: "large",
      text: "continue_with",
      theme: "outline",
      width: Math.min(buttonHost.offsetWidth || 420, 420),
    });

    return () => {
      window.google?.accounts.id.cancel();
    };
  }, [googleReady, handleGoogleCredential]);

  const displayMessage =
    state.message ||
    error ||
    (signedOut ? "You have been signed out of your collector account." : "");
  const displayStatus = state.message ? state.status : error ? "error" : signedOut ? "success" : "idle";

  return (
    <div className="mt-8 space-y-5">
      {googleClientId ? (
        <>
          <Script src="https://accounts.google.com/gsi/client" async defer onLoad={() => setGoogleReady(true)} />
          <div className="rounded-full border border-ink/15 bg-gallery-white px-2 py-1 transition-colors hover:border-gold focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-gold">
            <div
              ref={googleButtonRef}
              className="flex min-h-11 w-full justify-center [&>div]:!w-full [&_iframe]:!mx-auto [&_iframe]:!w-full"
            />
          </div>
          {googlePending ? (
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-stone/70">
              Completing Google sign-in...
            </p>
          ) : null}
        </>
      ) : (
        <div className="rounded-card border border-gold/30 bg-gold/10 px-4 py-3 text-sm leading-6 text-ink">
          Google sign-in needs the public Google client ID before it can go live.
        </div>
      )}

      {googleState.message ? (
        <p className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
          {googleState.message}
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-ink/12" />
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-stone/70">
          Or use email
        </span>
        <span className="h-px flex-1 bg-ink/12" />
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="customer-email" className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
            Email address
          </label>
          <input
            id="customer-email"
            name="email"
            type="email"
            required
            placeholder="collector@example.com"
            className="mt-3 min-h-13 w-full rounded-card border border-ink/15 bg-transparent px-4 text-sm text-ink outline-none transition-colors placeholder:text-stone/45 focus:border-gold"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="flex min-h-13 w-full items-center justify-center rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Sending sign-in link..." : "Send secure sign-in link"}
        </button>
      </form>

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
