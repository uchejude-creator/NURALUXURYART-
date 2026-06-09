import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { routes } from "@/lib/routes";

const storyHighlights = [
  "Hand-painted in Turkey",
  "Quality materials and paints",
  "Available through Lagos",
  "Curated for the world",
];

export function StorySection() {
  return (
    <section id="our-story" className="overflow-hidden px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal className="order-2 lg:order-1">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Our Story
          </p>
          <h2 className="max-w-4xl font-serif text-5xl font-light leading-[0.98] tracking-tight text-ink sm:text-7xl">
            Hand-Painted in Turkey, Curated for the World
          </h2>
          <div className="mt-8 space-y-6 text-base leading-8 text-stone">
            <p>
              NURALUXURYART began in Istanbul, born from a lifelong love for art
              and a deep appreciation for the city&apos;s rich creative spirit.
              What started as a moment of inspiration while on vacation grew into
              a dedicated art business in Turkey.
            </p>
            <p>
              Our exclusive hand-painted collections are still created in Turkey
              by experienced artists using quality materials and paints, then
              made available through our Lagos presence for collectors, interior
              lovers, and refined homes.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 border-y border-ink/10 py-7 text-xs font-semibold uppercase tracking-[0.22em] text-ink sm:grid-cols-2">
            {storyHighlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
                {highlight}
              </li>
            ))}
          </ul>

          <Link
            href={routes.contact}
            className="mt-10 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-gold transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Speak with us
            <span aria-hidden="true">→</span>
          </Link>
        </Reveal>

        <Reveal className="order-1 lg:order-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-charcoal shadow-[0_30px_90px_rgba(13,13,13,0.16)] sm:aspect-[5/4] lg:aspect-[4/3]">
            <Image
              src="/images/brand/story-gallery.jpeg"
              alt="NURALUXURYART gallery setting with hand-painted artworks and framed pieces"
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
