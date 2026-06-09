import type { Metadata } from "next";
import Link from "next/link";

import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Care Guide",
  description:
    "Care guidance for NURALUXURYART hand-painted artworks, including placement, cleaning, handling, and storage.",
};

const careSections = [
  {
    title: "Placement",
    body: "Hang artwork away from direct sunlight, heavy moisture, kitchen steam, and strong air-conditioning flow. A stable interior helps preserve color, texture, and surface finish.",
  },
  {
    title: "Cleaning",
    body: "Dust gently with a clean, dry microfiber cloth or soft artist brush. Do not use water, alcohol, polish, household cleaners, or scented sprays on the artwork surface.",
  },
  {
    title: "Handling",
    body: "Lift framed pieces from both sides with clean, dry hands. Avoid pressing the canvas, painted surface, corners, or frame joints when moving the artwork.",
  },
  {
    title: "Storage",
    body: "Store upright in a dry room, protected with soft breathable wrapping. Avoid stacking artworks face-to-face or leaving them on bare floors.",
  },
  {
    title: "Installation",
    body: "Use wall fixings appropriate for the artwork weight and wall type. Large pieces should be installed by an experienced handler or interior installer.",
  },
  {
    title: "Restoration",
    body: "Contact NURALUXURYART before attempting repairs, repainting, varnishing, or chemical cleaning. Unapproved repairs can permanently affect the artwork.",
  },
];

export default function CareGuidePage() {
  return (
    <main className="bg-cream text-ink">
      <section className="px-6 pb-16 pt-32 lg:px-10 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-site">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Care Guide
          </p>
          <h1 className="mt-6 max-w-5xl font-serif text-6xl font-light leading-[0.95] tracking-tight sm:text-8xl">
            Keep the surface calm, protected, and beautifully present.
          </h1>
          <p className="mt-8 max-w-3xl text-base leading-8 text-stone">
            NURALUXURYART pieces are hand-painted objects with texture, surface
            depth, and interior presence. Treat them with the care you would give
            a gallery piece: gentle handling, stable placement, and no harsh
            cleaning products.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-10 lg:pb-28">
        <div className="mx-auto grid max-w-site gap-5 md:grid-cols-2 lg:grid-cols-3">
          {careSections.map((section, index) => (
            <article
              key={section.title}
              className="rounded-card border border-ink/10 bg-gallery-white p-7 shadow-[0_24px_70px_rgba(13,13,13,0.05)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-none">{section.title}</h2>
              <p className="mt-5 text-sm leading-7 text-stone">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-charcoal px-6 py-16 text-gallery-white lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-site gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Before You Clean
            </p>
            <h2 className="mt-6 max-w-3xl font-serif text-5xl font-light leading-none sm:text-7xl">
              When in doubt, ask before touching the surface.
            </h2>
          </div>
          <div>
            <p className="text-sm leading-7 text-gallery-white/72">
              If an artwork arrives with a concern, or if you notice a surface
              issue after installation, contact us with clear photos before
              using any product or attempting a repair.
            </p>
            <Link
              href={routes.contact}
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Speak with the gallery
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
