import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for NURALUXURYART checkout requests, collector enquiries, newsletter updates, and website data.",
};

const sections = [
  {
    title: "Information we collect",
    body: "When you contact us, join our updates, or request checkout details, we may collect your name, email address, phone or WhatsApp number, delivery location, selected artworks, order notes, and messages you send to us.",
  },
  {
    title: "How we use it",
    body: "We use this information to answer enquiries, confirm artwork availability, prepare checkout and delivery guidance, respond to custom order requests, and share gallery updates where you have chosen to receive them.",
  },
  {
    title: "Checkout and payments",
    body: "Checkout requests are used to prepare a collector order before payment. When Paystack payment is connected, payment details will be handled by Paystack and its secure payment systems.",
  },
  {
    title: "Service providers",
    body: "We may use trusted service providers such as Supabase for checkout request storage, Vercel for website hosting, and payment or messaging tools needed to operate the store.",
  },
  {
    title: "Marketing updates",
    body: "If you subscribe to updates, we may send new artwork releases, collector notes, and gallery announcements. You can ask us to stop sending these updates at any time.",
  },
  {
    title: "Your choices",
    body: "You may contact us to ask about the personal information connected to your enquiry or checkout request, or to request correction of inaccurate details.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-cream text-ink">
      <section className="px-6 pb-16 pt-32 lg:px-10 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-site">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Policy
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-6xl font-light leading-[0.95] tracking-tight sm:text-8xl">
            Privacy Policy
          </h1>
          <p className="mt-8 max-w-3xl text-base leading-8 text-stone">
            NURALUXURYART respects the privacy of collectors, interior lovers,
            and visitors who use our website. This policy explains the
            information we collect and how we use it to support enquiries,
            checkout requests, delivery coordination, and gallery updates.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-10 lg:pb-28">
        <div className="mx-auto grid max-w-site gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-card border border-ink/10 bg-gallery-white p-7 shadow-[0_24px_70px_rgba(13,13,13,0.05)]"
            >
              <h2 className="font-serif text-4xl leading-none">{section.title}</h2>
              <p className="mt-5 text-sm leading-7 text-stone">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink px-6 py-16 text-gallery-white lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-site gap-8 lg:grid-cols-[0.75fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Contact
            </p>
            <h2 className="mt-6 font-serif text-5xl font-light leading-none sm:text-7xl">
              Questions about your data?
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-gallery-white/72">
            Email {siteConfig.contact.email} with privacy questions or requests
            connected to your enquiry, checkout request, or newsletter
            subscription. We will respond with care and verify the request where
            needed.
          </p>
        </div>
      </section>
    </main>
  );
}
