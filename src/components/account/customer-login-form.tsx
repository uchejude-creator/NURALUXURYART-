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
          className="flex min-h-13 w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-gallery-white px-8 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:border-gold hover:text-stone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
            <path
              fill="#4285F4"
              d="M22.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h6a5.2 5.2 0 0 1-2.2 3.4v2.8h3.6c2.1-2 3.2-4.8 3.2-8Z"
            />
            <path
              fill="#34A853"
              d="M12 23c3 0 5.5-1 7.4-2.8l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1a6.6 6.6 0 0 1-6.2-4.6H2.1v2.9A11 11 0 0 0 12 23Z"
            />
            <path
              fill="#FBBC05"
              d="M5.8 13.9a6.6 6.6 0 0 1 0-4.2V6.8H2.1a11 11 0 0 0 0 10l3.7-2.9Z"
            />
            <path
              fill="#EA4335"
              d="M12 5.3c1.6 0 3.1.6 4.3 1.7l3.2-3.2A10.8 10.8 0 0 0 12 1 11 11 0 0 0 2.1 6.8l3.7 2.9A6.6 6.6 0 0 1 12 5.3Z"
            />
          </svg>
          Continue with Google
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
