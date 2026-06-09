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
    description: "Edit artwork titles, prices, materials, image paths, and availability.",
  },
  {
    href: "/admin/orders",
    title: "Checkout Requests",
    description: "Review customer selections, delivery details, and purchase status.",
  },
  {
    href: "/admin/messages",
    title: "Collector Messages",
    description: "Read contact enquiries and manage newsletter interest.",
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
    <main className="min-h-screen bg-ink px-6 pb-20 pt-32 text-gallery-white lg:px-10 lg:pt-40">
      <section className="mx-auto max-w-site">
        <AdminNav email={email} />

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Artworks", artworkCount],
            ["Checkout requests", orderCount],
            ["Messages", messageCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-gold">
                {label}
              </p>
              <p className="mt-5 font-serif text-6xl font-light">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-7 transition-[border-color,transform] hover:-translate-y-1 hover:border-gold"
            >
              <h2 className="font-serif text-4xl">{card.title}</h2>
              <p className="mt-5 text-sm leading-7 text-gallery-white/62">{card.description}</p>
              <span className="mt-8 inline-flex text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Open
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
