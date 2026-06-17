import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type CountResult = {
  count: number | null;
};

async function getCount(query: PromiseLike<CountResult>) {
  const { count } = await query;
  return count ?? 0;
}

const cards = [
  {
    href: "/admin/artworks",
    title: "Catalog",
    description: "Edit artwork titles, prices, availability, materials, and Supabase-hosted images.",
    meta: "Artwork operations",
  },
  {
    href: "/admin/testimonials",
    title: "Testimonials",
    description: "Curate collector notes, ratings, and published reviews for the homepage carousel.",
    meta: "Social proof",
  },
  {
    href: "/admin/orders",
    title: "Checkout Requests",
    description: "Review customer selections, delivery details, and purchase status.",
    meta: "Collector pipeline",
  },
  {
    href: "/admin/messages",
    title: "Collector Messages",
    description: "Read contact enquiries and manage newsletter interest.",
    meta: "Inbox and leads",
  },
];

export default async function AdminPage() {
  const { email, supabase } = await requireAdmin();
  const [artworkCount, orderCount, messageCount] = await Promise.all([
    getCount(supabase.from("artworks").select("*", { count: "exact", head: true })),
    getCount(supabase.from("checkout_requests").select("*", { count: "exact", head: true })),
    getCount(supabase.from("contact_messages").select("*", { count: "exact", head: true })),
  ]);

  return (
    <main
      data-workspace-shell
      className="min-h-screen bg-ink px-6 pb-20 pt-32 text-gallery-white lg:px-10 lg:pt-40"
    >
      <section className="mx-auto max-w-site">
        <AdminNav email={email} />

        <section className="mb-8 grid gap-5 rounded-card border border-gallery-white/10 bg-gallery-white/[0.035] p-5 lg:grid-cols-[1.2fr_0.8fr] lg:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Operational Snapshot
            </p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl font-light leading-tight sm:text-6xl">
              Manage the gallery without touching code.
            </h2>
          </div>
          <p className="text-sm leading-7 text-gallery-white/62 lg:self-end">
            Keep artwork data, collector enquiries, checkout requests, and media updates in one
            controlled workspace. Changes to published artworks revalidate the storefront.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Artworks", artworkCount, "Catalog records"],
            ["Checkout requests", orderCount, "Collector orders"],
            ["Messages", messageCount, "Contact inbox"],
          ].map(([label, value, caption]) => (
            <div
              key={label}
              className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-gold">
                {label}
              </p>
              <p className="mt-5 font-serif text-6xl font-light leading-none">{value}</p>
              <p className="mt-3 text-sm text-gallery-white/50">{caption}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-7 transition-[border-color,transform] hover:-translate-y-1 hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                {card.meta}
              </p>
              <h2 className="font-serif text-4xl">{card.title}</h2>
              <p className="mt-5 text-sm leading-7 text-gallery-white/62">{card.description}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Open <span aria-hidden="true">+</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
