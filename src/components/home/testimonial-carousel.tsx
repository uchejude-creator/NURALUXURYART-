"use client";

import { useEffect, useMemo, useState } from "react";

import { Reveal } from "@/components/motion/reveal";
import type { Testimonial } from "@/types/testimonial";

type TestimonialCarouselProps = {
  testimonials: Testimonial[];
};

function StarRating({ rating }: { rating: number }) {
  const count = Math.min(Math.max(Math.round(rating), 1), 5);

  return (
    <span className="flex gap-1 text-gold" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-3.5 w-3.5 fill-current ${index < count ? "" : "text-gallery-white/18"}`}
        >
          <path d="m10 1.6 2.5 5.1 5.6.8-4.1 4 1 5.6-5-2.7-5 2.7 1-5.6-4.1-4 5.6-.8L10 1.6Z" />
        </svg>
      ))}
    </span>
  );
}

function TestimonialCard({
  isDuplicate,
  testimonial,
}: {
  isDuplicate?: boolean;
  testimonial: Testimonial;
}) {
  return (
    <article
      aria-hidden={isDuplicate}
      className="testimonial-review-card flex min-h-72 w-full shrink-0 flex-col justify-between rounded-card border border-gallery-white/10 bg-gallery-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:w-[24rem] lg:w-[28rem]"
    >
      <div>
        <StarRating rating={testimonial.rating} />
        <blockquote className="testimonial-review-text mt-7 font-serif text-3xl font-light leading-tight text-gallery-white sm:text-4xl">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
      </div>
      <footer className="mt-8 border-t border-gallery-white/10 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
          {testimonial.customerName}
        </p>
        <p className="mt-2 text-sm text-gallery-white/50">
          {[testimonial.location, testimonial.artworkTitle].filter(Boolean).join(" / ")}
        </p>
      </footer>
    </article>
  );
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const loopedTestimonials = useMemo(() => [...testimonials, ...testimonials], [testimonials]);
  const activeTestimonial = testimonials[activeIndex] ?? testimonials[0];

  useEffect(() => {
    if (testimonials.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section
      id="collector-notes"
      className="overflow-hidden bg-ink py-20 text-gallery-white lg:py-28"
      aria-labelledby="collector-notes-heading"
    >
      <div className="mx-auto max-w-site px-6 lg:px-10">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Collector Notes
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1fr] lg:items-end">
            <h2
              id="collector-notes-heading"
              className="font-serif text-5xl font-light leading-none sm:text-7xl"
            >
              What Collectors Say
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-gallery-white/62 lg:justify-self-end">
              Refined homes, private collectors, and interior-led spaces sharing the quiet impact of
              hand-painted Turkish art.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="testimonial-mobile-stage mx-auto mt-12 max-w-sm px-6 sm:hidden">
        {activeTestimonial ? (
          <div key={activeTestimonial.id} className="testimonial-mobile-card">
            <TestimonialCard testimonial={activeTestimonial} />
          </div>
        ) : null}

        <div className="mt-6 flex justify-center gap-2" aria-label="Select testimonial">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? "w-8 bg-gold" : "w-2 bg-gallery-white/30"
              }`}
              aria-label={`Show testimonial from ${testimonial.customerName}`}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>
      </div>

      <div className="testimonial-marquee mt-12 hidden sm:block" aria-label="Customer testimonials">
        <div className="testimonial-track gap-4 px-6 lg:px-10">
          {loopedTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={`${testimonial.id}-${index}`}
              isDuplicate={index >= testimonials.length}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
