import Link from "next/link";

import { NewsletterForm } from "@/components/layout/newsletter-form";
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
          <NewsletterForm />
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
