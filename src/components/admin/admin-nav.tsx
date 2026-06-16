import Link from "next/link";

import { signOutAdmin } from "@/app/admin/actions";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/artworks", label: "Artworks" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/messages", label: "Messages" },
];

export function AdminNav({ email }: { email: string }) {
  return (
    <div className="mb-10 overflow-hidden rounded-card border border-gallery-white/10 bg-gallery-white/[0.035] shadow-[0_30px_90px_rgba(0,0,0,0.22)]">
      <div className="grid gap-8 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Admin Workspace
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl font-light leading-none text-gallery-white sm:text-7xl">
            Gallery Control
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em]">
            <span className="rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-gold">
              Active session
            </span>
            <span className="max-w-full truncate text-gallery-white/55">{email}</span>
          </div>
        </div>

        <form action={signOutAdmin} className="lg:justify-self-end">
          <button
            type="submit"
            className="min-h-11 rounded-full bg-gold px-5 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-gallery-white/10 bg-ink/35 p-3">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="min-h-10 rounded-full border border-gallery-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-gallery-white/70 transition-colors hover:border-gold hover:bg-gold/10 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
