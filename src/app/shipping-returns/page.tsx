import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Shipping, delivery, handling, and return guidance for NURALUXURYART hand-painted artworks.",
};

const shippingNotes = [
  {
    title: "Lagos availability",
    body: "Selected artworks are made available through our Lagos presence. Delivery timing is confirmed after checkout request review and artwork availability checks.",
  },
  {
    title: "Protected handling",
    body: "Artwork delivery is arranged with careful packaging and handling based on size, frame, surface texture, and destination needs.",
  },
  {
    title: "Outside Lagos",
    body: "For destinations outside Lagos, delivery cost and timing are confirmed before payment because artwork size and handling requirements can vary.",
  },
];

const returnRules = [
  "Report delivery damage or order concerns within 24 hours of receiving the artwork, with clear photos of the packaging and the piece.",
  "Artwork must remain in its delivered condition while the concern is reviewed.",
  "Returns are not accepted for artwork broken, scratched, altered, mishandled, or damaged by the customer after delivery.",
  "Custom orders, commissioned pieces, and specially sourced artworks may be final sale unless otherwise agreed in writing before payment.",
];

export default function ShippingReturnsPage() {
  return (
    <main className="bg-cream text-ink">
      <section className="px-6 pb-16 pt-32 lg:px-10 lg:pb-24 lg:pt-40">
        <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[0.85fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Shipping & Returns
            </p>
            <h1 className="mt-6 max-w-4xl font-serif text-6xl font-light leading-[0.95] tracking-tight sm:text-8xl">
              Careful delivery for collectible pieces.
            </h1>
          </div>
          <p className="max-w-2xl text-base leading-8 text-stone lg:ml-auto">
            Because every NURALUXURYART piece is hand-painted and often framed,
            checkout requests are reviewed before payment. This allows us to
            confirm availability, delivery location, handling requirements, and
            final delivery cost where needed.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-10 lg:pb-28">
        <div className="mx-auto grid max-w-site gap-5 lg:grid-cols-3">
          {shippingNotes.map((note) => (
            <article
              key={note.title}
              className="rounded-card border border-ink/10 bg-gallery-white p-7 shadow-[0_24px_70px_rgba(13,13,13,0.05)]"
            >
              <h2 className="font-serif text-4xl leading-none">{note.title}</h2>
              <p className="mt-5 text-sm leading-7 text-stone">{note.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink px-6 py-16 text-gallery-white lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[0.78fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Return Conditions
            </p>
            <h2 className="mt-6 max-w-2xl font-serif text-5xl font-light leading-none sm:text-7xl">
              Transparent rules before payment.
            </h2>
          </div>
          <div>
            <ul className="space-y-5">
              {returnRules.map((rule) => (
                <li
                  key={rule}
                  className="border-b border-gallery-white/15 pb-5 text-sm leading-7 text-gallery-white/75"
                >
                  {rule}
                </li>
              ))}
            </ul>
            <Link
              href={routes.contact}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Ask about delivery
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
