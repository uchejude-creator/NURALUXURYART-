"use client";

import { FormEvent, useRef, useState } from "react";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function ContactForm({ topics }: { topics: readonly string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          topic: formData.get("topic"),
          message: formData.get("message"),
        }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "We could not save your message.");
      }

      formRef.current?.reset();
      setSubmitState({
        status: "success",
        message: "Your message has been saved. We will respond with collector guidance soon.",
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : "We could not save your message.",
      });
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.22)] sm:grid-cols-2 sm:p-7"
    >
      <div>
        <label
          htmlFor="contact-name"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-gallery-white/70"
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          className="mt-3 min-h-12 w-full rounded-card border border-gallery-white/20 bg-transparent px-4 text-sm text-gallery-white outline-none transition-colors placeholder:text-gallery-white/35 focus:border-gold"
        />
      </div>
      <div>
        <label
          htmlFor="contact-email"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-gallery-white/70"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="mt-3 min-h-12 w-full rounded-card border border-gallery-white/20 bg-transparent px-4 text-sm text-gallery-white outline-none transition-colors placeholder:text-gallery-white/35 focus:border-gold"
        />
      </div>
      <div>
        <label
          htmlFor="contact-phone"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-gallery-white/70"
        >
          Phone or WhatsApp
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          placeholder="+234..."
          className="mt-3 min-h-12 w-full rounded-card border border-gallery-white/20 bg-transparent px-4 text-sm text-gallery-white outline-none transition-colors placeholder:text-gallery-white/35 focus:border-gold"
        />
      </div>
      <div>
        <label
          htmlFor="contact-topic"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-gallery-white/70"
        >
          Topic
        </label>
        <select
          id="contact-topic"
          name="topic"
          className="mt-3 min-h-12 w-full rounded-card border border-gallery-white/20 bg-ink px-4 text-sm text-gallery-white outline-none transition-colors focus:border-gold"
          defaultValue={topics[0]}
        >
          {topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label
          htmlFor="contact-message"
          className="text-xs font-semibold uppercase tracking-[0.22em] text-gallery-white/70"
        >
          Question
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder="Tell us the artwork, room, color mood, size, or question you have in mind."
          className="mt-3 w-full resize-none rounded-card border border-gallery-white/20 bg-transparent px-4 py-4 text-sm leading-6 text-gallery-white outline-none transition-colors placeholder:text-gallery-white/35 focus:border-gold"
        />
      </div>
      <button
        type="submit"
        disabled={submitState.status === "submitting"}
        className="min-h-13 bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-65 sm:col-span-2"
      >
        {submitState.status === "submitting" ? "Sending..." : "Send question"}
      </button>
      {submitState.status === "success" || submitState.status === "error" ? (
        <p
          className={`rounded-card px-4 py-3 text-sm leading-6 sm:col-span-2 ${
            submitState.status === "success"
              ? "border border-gold/35 bg-gold/10 text-gallery-white"
              : "border border-red-300/35 bg-red-950/30 text-gallery-white"
          }`}
        >
          {submitState.message}
        </p>
      ) : null}
    </form>
  );
}
