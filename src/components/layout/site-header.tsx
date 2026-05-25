"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";

function BrandWordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="shrink-0 font-serif text-[0.82rem] uppercase tracking-[0.18em] text-gallery-white transition-colors hover:text-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold min-[380px]:text-[0.98rem] min-[380px]:tracking-[0.24em] sm:text-3xl sm:tracking-[0.34em]"
      aria-label="NURALUXURYART home"
    >
      <span>NURA</span>
      <span className="text-gold">LUXURYART</span>
    </Link>
  );
}

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full text-gallery-white transition-colors duration-300 ${
        isScrolled ? "bg-ink/55 shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="relative z-20 mx-auto flex h-20 max-w-site items-center justify-between px-7 sm:px-10 lg:h-24 lg:px-16">
        <BrandWordmark />

        <nav aria-label="Primary navigation" className="hidden items-center gap-10 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-gallery-white transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="mobile-menu-toggle h-10 w-10 flex-col items-center justify-center gap-1.5 text-gallery-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((value) => !value)}
        >
          <span
            className={`h-0.5 w-5 bg-current transition-transform ${
              isMenuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span className={`h-0.5 w-5 bg-current transition-opacity ${isMenuOpen ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-5 bg-current transition-transform ${
              isMenuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`fixed right-0 top-0 z-10 h-dvh w-[min(82vw,22rem)] border-l border-gallery-white/10 bg-ink/95 px-8 pb-10 pt-28 shadow-2xl backdrop-blur-xl transition-transform duration-300 md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav aria-label="Mobile navigation">
          <ul className="space-y-6">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-semibold uppercase tracking-[0.26em] text-gallery-white transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
