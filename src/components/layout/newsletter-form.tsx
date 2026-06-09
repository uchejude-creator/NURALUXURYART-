"use client";

import { FormEvent, useRef, useState } from "react";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function NewsletterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
        }),
      });

      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "We could not save your subscription.");
      }

      formRef.current?.reset();
      setSubmitState({
        status: "success",
        message: result.message ?? "You are on the collector list.",
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : "We could not save your subscription.",
      });
    }
  }

  return (
    <>
      <form ref={formRef} className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Email address"
          className="min-h-12 flex-1 border border-gallery-white/30 bg-transparent px-4 text-sm text-gallery-white outline-none transition-colors placeholder:text-gallery-white/35 focus:border-gold"
        />
        <button
          type="submit"
          disabled={submitState.status === "submitting"}
          className="min-h-12 bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-65"
        >
          {submitState.status === "submitting" ? "Saving..." : "Subscribe"}
        </button>
      </form>
      {submitState.status === "success" || submitState.status === "error" ? (
        <p
          className={`mt-4 rounded-card px-4 py-3 text-sm leading-6 ${
            submitState.status === "success"
              ? "border border-gold/35 bg-gold/10 text-gallery-white"
              : "border border-red-300/35 bg-red-950/30 text-gallery-white"
          }`}
        >
          {submitState.message}
        </p>
      ) : null}
    </>
  );
}
