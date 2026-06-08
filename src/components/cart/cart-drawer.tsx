"use client";

import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import { routes } from "@/lib/routes";

import { useCart } from "./cart-context";

export function CartDrawer() {
  const { closeCart, decrementItem, incrementItem, isCartOpen, itemCount, items, removeItem, total } =
    useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-ink/60 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={closeCart}
      />
      <aside
        className={`fixed right-0 top-0 z-[80] flex h-dvh w-[min(100vw,28rem)] flex-col bg-gallery-white text-ink shadow-2xl transition-transform duration-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Shopping cart"
        aria-hidden={!isCartOpen}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              Collector Cart
            </p>
            <h2 className="mt-1 font-serif text-3xl">Selected Artworks</h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-2xl leading-none transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col justify-center text-center">
              <p className="font-serif text-4xl">Your cart is quiet.</p>
              <p className="mt-4 text-sm leading-7 text-stone">
                Add artworks from the gallery and keep your selected pieces together before
                requesting purchase details.
              </p>
              <Link
                href="/#featured-artworks"
                onClick={closeCart}
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-gallery-white"
              >
                Shop artworks
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.id} className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-ink/10 pb-6">
                  <Link
                    href={routes.artwork(item.slug)}
                    onClick={closeCart}
                    className="relative aspect-[4/5] overflow-hidden rounded-card bg-charcoal"
                  >
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="6rem"
                      className="object-cover"
                    />
                  </Link>
                  <div>
                    <h3 className="font-serif text-2xl leading-none">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-stone">{item.medium}</p>
                    {item.price ? (
                      <p className="mt-2 text-sm font-semibold">{formatCurrency(item.price)}</p>
                    ) : (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                        On request
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decrementItem(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 transition-colors hover:border-gold hover:text-gold"
                        aria-label={`Reduce quantity for ${item.title}`}
                      >
                        −
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => incrementItem(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 transition-colors hover:border-gold hover:text-gold"
                        aria-label={`Increase quantity for ${item.title}`}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-xs font-semibold uppercase tracking-[0.16em] text-stone transition-colors hover:text-gold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-ink/10 px-6 py-6">
          <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-stone">
            <span>{itemCount} selected</span>
            <span className="font-semibold text-ink">{formatCurrency(total)}</span>
          </div>
          <Link
            href={routes.checkout}
            onClick={closeCart}
            className="mt-5 flex min-h-13 items-center justify-center rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Continue to checkout
          </Link>
          <p className="mt-4 text-center text-xs leading-5 text-stone">
            Paystack checkout will be connected after the purchase flow is approved.
          </p>
        </div>
      </aside>
    </>
  );
}
