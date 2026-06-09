import Link from "next/link";

import { siteConfig } from "@/config/site";
import { routes } from "@/lib/routes";

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-ink text-gallery-white">
      <div className="mx-auto grid max-w-site gap-12 px-6 py-16 lg:grid-cols-[1.2fr_0.9fr] lg:px-10 lg:py-24">
        <div className="grid gap-10 sm:grid-cols-3">
          {siteConfig.footerGroups.map((group) => (
            <nav key={group.title} aria-label={`${group.title} links`}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.32em] text-gold">
                {group.title}
              </h2>
              <ul className="mt-6 space-y-4 text-sm text-gallery-white/70">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}-${link.href}`}>
                    <Link className="transition-colors hover:text-gold" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <section aria-labelledby="newsletter-heading" className="max-w-xl">
          <h2 id="newsletter-heading" className="font-serif text-3xl">
            Stay Inspired, Stay Refined
          </h2>
          <p className="mt-5 text-sm leading-7 text-gallery-white/70">
            Receive new artwork releases, collector notes, and private gallery updates
            from {siteConfig.name}.
          </p>
          <form className="mt-8 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              placeholder="Email address"
              className="min-h-12 flex-1 border border-gallery-white/30 bg-transparent px-4 text-sm text-gallery-white outline-none transition-colors placeholder:text-gallery-white/35 focus:border-gold"
            />
            <button
              type="submit"
              className="min-h-12 bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Subscribe
            </button>
          </form>
          <div className="mt-8 flex flex-wrap gap-4 text-xs uppercase tracking-[0.24em] text-gallery-white/60">
            {siteConfig.socialLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-gold">
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mx-auto flex max-w-site flex-col gap-4 border-t border-gallery-white/10 px-6 py-8 text-xs uppercase tracking-[0.2em] text-gallery-white/45 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>© 2026 {siteConfig.name}. All rights reserved.</p>
        <Link href={routes.privacy} className="hover:text-gold">
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
