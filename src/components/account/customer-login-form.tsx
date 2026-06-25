"use client";

import { useActionState } from "react";

import {
  sendCustomerLoginLink,
  signInWithGoogle,
  type CustomerLoginState,
} from "@/app/account/actions";

const initialState: CustomerLoginState = {
  status: "idle",
  message: "",
};

type CustomerLoginFormProps = {
  error?: string;
  next?: string;
  signedOut?: boolean;
};

export function CustomerLoginForm({ error, next = "/account", signedOut }: CustomerLoginFormProps) {
  const [state, formAction, pending] = useActionState(sendCustomerLoginLink, initialState);

  const displayMessage =
    state.message ||
    error ||
    (signedOut ? "You have been signed out of your collector account." : "");
  const displayStatus = state.message ? state.status : error ? "error" : signedOut ? "success" : "idle";

  return (
    <div className="mt-8 space-y-5">
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="group flex min-h-13 w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-gallery-white px-6 text-sm font-semibold text-ink shadow-[0_18px_40px_rgba(25,24,21,0.06)] transition-colors hover:border-gold hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
            <path
              fill="#4285F4"
              d="M21.6 12.23c0-.78-.07-1.53-.2-2.23H12v4.22h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.51Z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.7 0 4.97-.9 6.62-2.26l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H3.05v2.58A10 10 0 0 0 12 22Z"
            />
            <path
              fill="#FBBC05"
              d="M6.4 14.08A6 6 0 0 1 6.08 12c0-.72.12-1.42.32-2.08V7.34H3.05A10 10 0 0 0 2 12c0 1.61.39 3.14 1.05 4.66l3.35-2.58Z"
            />
            <path
              fill="#EA4335"
              d="M12 5.8c1.47 0 2.8.51 3.84 1.5l2.86-2.86A9.57 9.57 0 0 0 12 2a10 10 0 0 0-8.95 5.34L6.4 9.92C7.2 7.56 9.4 5.8 12 5.8Z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </form>

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
