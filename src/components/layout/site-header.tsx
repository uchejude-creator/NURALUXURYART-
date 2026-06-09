"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { siteConfig } from "@/config/site";
import { useCart } from "@/components/cart/cart-context";
import { routes } from "@/lib/routes";

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
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const { itemCount, isCartOpen, openCart } = useCart();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 24);
      setIsHeaderHidden(
        currentScrollY > lastScrollY.current &&
          currentScrollY > 140 &&
          !isMenuOpen &&
          !isCartOpen,
      );
      lastScrollY.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isCartOpen, isMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const isTransparent = isHomePage && !isScrolled && !isMenuOpen;

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full text-gallery-white transition-[transform,background-color,box-shadow] duration-300 ${
        isHeaderHidden ? "-translate-y-full" : "translate-y-0"
      } ${
        isTransparent ? "bg-transparent" : "bg-ink/78 shadow-[0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
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

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href={routes.checkout}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gallery-white transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:hidden"
            aria-label={`Review cart with ${itemCount} selected artwork${itemCount === 1 ? "" : "s"}`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6.5 8.5h11l-.7 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6.5 8.5Z" />
              <path d="M9 8.5a3 3 0 0 1 6 0" />
            </svg>
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.62rem] font-bold text-ink">
                {itemCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-gallery-white transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:flex"
            aria-label={`Open shopping cart with ${itemCount} selected artwork${itemCount === 1 ? "" : "s"}`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6.5 8.5h11l-.7 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6.5 8.5Z" />
              <path d="M9 8.5a3 3 0 0 1 6 0" />
            </svg>
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.62rem] font-bold text-ink">
                {itemCount}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 text-gallery-white transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:hidden"
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
      </div>

      <div
        className={`fixed right-0 top-20 z-10 h-[calc(100dvh-5rem)] w-[min(82vw,22rem)] border-l border-gallery-white/10 bg-ink/95 px-8 py-10 shadow-2xl backdrop-blur-xl transition-transform duration-300 md:hidden ${
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
