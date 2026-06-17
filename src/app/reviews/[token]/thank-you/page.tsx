import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Review Received",
  description: "Your NURALUXURYART review has been received for gallery approval.",
};

export default function ReviewThankYouPage() {
  return (
    <main className="min-h-screen bg-ink px-6 py-28 text-gallery-white lg:px-10 lg:py-36">
      <section className="mx-auto max-w-3xl rounded-card border border-gallery-white/10 bg-gallery-white/[0.045] p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.24)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
          Review Submitted
        </p>
        <h1 className="mt-5 font-serif text-5xl font-light leading-none sm:text-7xl">
          Thank you for the collector note.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-gallery-white/62">
          Your review is now awaiting NURALUXURYART approval. Once approved, it can appear in the
          collector notes carousel on the homepage.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={routes.home}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-7 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Return to gallery
          </Link>
          <Link
            href={routes.contact}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-gallery-white/15 px-7 text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Speak with us
          </Link>
        </div>
      </section>
    </main>
  );
}
