"use client";

import { useActionState } from "react";

import { sendAdminLoginLink, type AdminLoginState } from "@/app/admin/actions";

const initialState: AdminLoginState = {
  status: "idle",
  message: "",
};

type AdminLoginFormProps = {
  initialMessage?: AdminLoginState;
};

export function AdminLoginForm({ initialMessage }: AdminLoginFormProps) {
  const [state, formAction, pending] = useActionState(
    sendAdminLoginLink,
    initialMessage ?? initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
          Admin email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="mt-3 min-h-13 w-full rounded-card border border-gallery-white/20 bg-transparent px-4 text-sm text-gallery-white outline-none transition-colors placeholder:text-gallery-white/35 focus:border-gold"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-13 w-full items-center justify-center rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Sending secure link..." : "Send secure login link"}
      </button>
      {state.message ? (
        <p
          className={`rounded-card border px-4 py-3 text-sm leading-6 ${
            state.status === "success"
              ? "border-gold/35 bg-gold/10 text-gallery-white"
              : "border-red-300/35 bg-red-950/30 text-gallery-white"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
