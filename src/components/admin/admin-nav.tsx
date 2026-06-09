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
    <div className="mb-10 flex flex-col gap-5 border-b border-gallery-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
          Admin Panel
        </p>
        <h1 className="mt-4 font-serif text-5xl font-light leading-none text-gallery-white sm:text-7xl">
          Gallery Control
        </h1>
        <p className="mt-4 text-sm text-gallery-white/55">{email}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-gallery-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-gallery-white/75 transition-colors hover:border-gold hover:text-gold"
          >
            {link.label}
          </Link>
        ))}
        <form action={signOutAdmin}>
          <button
            type="submit"
            className="rounded-full bg-gold px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-gallery-white"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
