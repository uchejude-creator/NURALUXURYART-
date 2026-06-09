import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/config/site";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Speak with NURALUXURYART about hand-painted Turkish artworks, custom orders, Lagos availability, and collector purchase support.",
};

const supportCards = [
  {
    eyebrow: "Fastest response",
    title: "Speak with the gallery",
    body: "Call or WhatsApp us for artwork availability, pricing guidance, delivery questions, and custom order conversations.",
    href: siteConfig.contact.whatsappHref,
    cta: "Start WhatsApp chat",
    icon: "chat",
  },
  {
    eyebrow: "Email support",
    title: "Send a collector note",
    body: "Share the artwork title, room size, preferred color mood, or installation need and we will guide you calmly.",
    href: `mailto:${siteConfig.contact.email}?subject=NURALUXURYART%20collector%20enquiry`,
    cta: siteConfig.contact.email,
    icon: "mail",
  },
  {
    eyebrow: "Cart support",
    title: "Need help with your cart?",
    body: "Review selected pieces before checkout, adjust quantities, and keep the artworks you are considering in one place.",
    href: routes.checkout,
    cta: "Review selected artworks",
    icon: "cart",
  },
] as const;

const enquiryTopics = [
  "Artwork availability",
  "Custom order request",
  "Delivery and installation",
  "Pricing and checkout",
];

function SupportIcon({ icon }: { icon: (typeof supportCards)[number]["icon"] }) {
  if (icon === "mail") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 6.5h16v11H4z" />
        <path d="m4.5 7 7.5 6 7.5-6" />
      </svg>
    );
  }

  if (icon === "cart") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6.5 8.5h11l-.7 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6.5 8.5Z" />
        <path d="M9 8.5a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.5 18.5v-11a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-3.5 3Z" />
      <path d="M9 9.5h6" />
      <path d="M9 12.5h4" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <main className="bg-cream text-ink">
      <section className="px-6 pb-16 pt-32 lg:px-10 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-site">
          <div className="grid gap-10 border-b border-ink/10 pb-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
                Contact Us
              </p>
              <h1 className="mt-6 max-w-4xl font-serif text-6xl font-light leading-[0.95] tracking-tight sm:text-8xl">
                How can we help you collect?
              </h1>
            </div>
            <div className="max-w-2xl lg:ml-auto">
              <p className="text-base leading-8 text-stone">
                Speak with NURALUXURYART about hand-painted artworks from Turkey,
                custom pieces, Lagos availability, collector care, delivery, or
                checkout guidance.
              </p>
              <div className="mt-8 grid gap-3 text-sm text-stone sm:grid-cols-2">
                <Link
                  href={`mailto:${siteConfig.contact.email}`}
                  className="rounded-card border border-ink/10 bg-gallery-white px-5 py-4 shadow-[0_18px_45px_rgba(13,13,13,0.04)] transition-colors hover:border-gold hover:text-ink"
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                    Email
                  </span>
                  <span className="mt-2 block">{siteConfig.contact.email}</span>
                </Link>
                <Link
                  href={siteConfig.contact.phoneHref}
                  className="rounded-card border border-ink/10 bg-gallery-white px-5 py-4 shadow-[0_18px_45px_rgba(13,13,13,0.04)] transition-colors hover:border-gold hover:text-ink"
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                    Phone
                  </span>
                  <span className="mt-2 block">{siteConfig.contact.phone}</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {supportCards.map((card) => {
              const isExternal = card.href.startsWith("http");

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group flex min-h-72 flex-col justify-between rounded-card border border-ink/10 bg-gallery-white p-7 shadow-[0_24px_70px_rgba(13,13,13,0.05)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_32px_90px_rgba(13,13,13,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                >
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
                        {card.eyebrow}
                      </p>
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/12 text-gold transition-colors group-hover:bg-gold group-hover:text-ink">
                        <SupportIcon icon={card.icon} />
                      </span>
                    </div>
                    <h2 className="mt-8 font-serif text-4xl leading-none">
                      {card.title}
                    </h2>
                    <p className="mt-5 text-sm leading-7 text-stone">{card.body}</p>
                  </div>
                  <span className="mt-8 inline-flex text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors group-hover:text-gold">
                    {card.cta}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-16 text-gallery-white lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Ask a Question
            </p>
            <h2 className="mt-6 max-w-2xl font-serif text-5xl font-light leading-[0.98] sm:text-7xl">
              Tell us what you are looking for.
            </h2>
            <p className="mt-7 max-w-xl text-sm leading-7 text-gallery-white/70">
              Include the artwork name if you have one, or describe the interior,
              size, color mood, and budget. {siteConfig.contact.responseTime}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              {enquiryTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-gallery-white/15 px-4 py-2 text-xs uppercase tracking-[0.18em] text-gallery-white/70"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <ContactForm topics={enquiryTopics} />
        </div>
      </section>
    </main>
  );
}
