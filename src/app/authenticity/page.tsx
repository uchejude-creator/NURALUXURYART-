import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Authenticity",
  description:
    "How NURALUXURYART verifies hand-painted Turkish artworks, artist sourcing, materials, and collector documentation.",
};

const commitments = [
  {
    title: "Hand-painted in Turkey",
    body: "Each artwork is sourced from our Turkish production network and selected for visible brushwork, texture, composition, and interior presence.",
  },
  {
    title: "Experienced artists",
    body: "We work with artists and studio partners who understand scale, material control, finish quality, and the expectations of refined collectors.",
  },
  {
    title: "Quality materials and paints",
    body: "Pieces are reviewed for stable canvas or panel construction, clean finishing, intentional texture, and paint quality before they are listed.",
  },
  {
    title: "Collector documentation",
    body: "Where applicable, artwork details such as title, medium, dimensions, price, and purchase reference are recorded for collector confidence.",
  },
];

const details = [
  "Artwork title and collection category",
  "Medium, surface, and finish notes",
  "Dimensions or scale guidance where confirmed",
  "Purchase date, request reference, and delivery notes",
];

export default function AuthenticityPage() {
  return (
    <main className="bg-cream text-ink">
      <section className="px-6 pb-16 pt-32 lg:px-10 lg:pb-24 lg:pt-40">
        <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[0.85fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Collector Care
            </p>
            <h1 className="mt-6 max-w-4xl font-serif text-6xl font-light leading-[0.95] tracking-tight sm:text-8xl">
              Authenticity with a gallery eye.
            </h1>
          </div>
          <p className="max-w-2xl text-base leading-8 text-stone lg:ml-auto">
            NURALUXURYART presents hand-painted artworks created in Turkey and
            curated through our Lagos presence for collectors, interiors, and
            gallery-led spaces. Every piece is selected for material quality,
            craftsmanship, and the emotional presence it brings to a room.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-10 lg:pb-28">
        <div className="mx-auto grid max-w-site gap-5 md:grid-cols-2 lg:grid-cols-4">
          {commitments.map((item) => (
            <article
              key={item.title}
              className="rounded-card border border-ink/10 bg-gallery-white p-6 shadow-[0_24px_70px_rgba(13,13,13,0.05)]"
            >
              <h2 className="font-serif text-3xl leading-none">{item.title}</h2>
              <p className="mt-5 text-sm leading-7 text-stone">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink px-6 py-16 text-gallery-white lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              What We Record
            </p>
            <h2 className="mt-6 max-w-2xl font-serif text-5xl font-light leading-none sm:text-7xl">
              Details that support the purchase.
            </h2>
          </div>
          <div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {details.map((detail) => (
                <li
                  key={detail}
                  className="border-b border-gallery-white/15 pb-4 text-sm leading-7 text-gallery-white/75"
                >
                  {detail}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-7 text-gallery-white/65">
              If you have a question about an artwork&apos;s origin, material,
              availability, or purchase record, speak with the gallery before
              checkout. We will review the piece and share the information we
              have on file.
            </p>
            <Link
              href={routes.contact}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Ask about authenticity
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-site border-t border-ink/10 pt-10">
          <p className="max-w-3xl text-sm leading-7 text-stone">
            Authenticity notes are based on NURALUXURYART&apos;s sourcing,
            production, and purchase records. For formal valuations, insurance,
            or independent appraisal needs, collectors may request additional
            documentation or consult a qualified art specialist.
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
            {siteConfig.tagline}
          </p>
        </div>
      </section>
    </main>
  );
}
