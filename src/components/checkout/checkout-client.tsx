"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { useCart } from "@/components/cart/cart-context";
import { formatCurrency } from "@/lib/format";
import { routes } from "@/lib/routes";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; requestId: string }
  | { status: "error"; message: string };

export function CheckoutClient() {
  const { clearCart, decrementItem, incrementItem, itemCount, items, removeItem, total } = useCart();
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setSubmitState({ status: "submitting" });

    try {
      const response = await fetch("/api/checkout-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            note: formData.get("note"),
          },
          items,
        }),
      });

      const result = (await response.json()) as { requestId?: string; error?: string };

      if (!response.ok || !result.requestId) {
        throw new Error(result.error ?? "We could not save your checkout request.");
      }

      setSubmitState({ status: "success", requestId: result.requestId });
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : "We could not save your checkout request.",
      });
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-cream px-6 pb-20 pt-32 text-ink lg:px-10 lg:pt-40">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Checkout
          </p>
          <h1 className="mt-5 font-serif text-5xl font-light leading-none sm:text-7xl">
            Your cart is quiet.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-stone">
            Add artworks from the gallery and return here to review your selection before
            requesting payment details.
          </p>
          <Link
            href="/#featured-artworks"
            className="mt-9 inline-flex min-h-13 items-center justify-center rounded-full bg-gold px-9 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Shop artworks
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream px-6 pb-20 pt-32 text-ink lg:px-10 lg:pt-40">
      <section className="mx-auto max-w-site">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">Checkout</p>
        <div className="mt-5 grid gap-12 lg:grid-cols-[1fr_0.78fr] lg:items-start">
          <div>
            <h1 className="font-serif text-5xl font-light leading-none sm:text-7xl">
              Review Your Selection
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone">
              Confirm the artworks you are interested in. Paystack payment will be connected
              after the checkout details are approved.
            </p>

            <ul className="mt-10 space-y-6">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="grid gap-5 border-b border-ink/10 pb-6 sm:grid-cols-[8rem_1fr]"
                >
                  <Link
                    href={routes.artwork(item.slug)}
                    className="relative aspect-[4/5] overflow-hidden rounded-card bg-charcoal"
                  >
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="8rem"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-serif text-3xl leading-none">{item.title}</h2>
                      <p className="mt-2 text-sm text-stone">{item.medium}</p>
                      <p className="mt-3 text-sm font-semibold">
                        {item.price ? formatCurrency(item.price) : "Available on request"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decrementItem(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/20 transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                        aria-label={`Reduce quantity for ${item.title}`}
                      >
                        -
                      </button>
                      <span className="min-w-7 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementItem(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/20 transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                        aria-label={`Increase quantity for ${item.title}`}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs font-semibold uppercase tracking-[0.16em] text-stone transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-card bg-ink p-6 text-gallery-white lg:sticky lg:top-32">
            <h2 className="font-serif text-4xl">Collector Details</h2>
            <div className="mt-6 space-y-3 border-b border-gallery-white/10 pb-6 text-sm">
              <div className="flex items-center justify-between text-gallery-white/70">
                <span>{itemCount} selected</span>
                <span className="font-semibold text-gallery-white">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs leading-5 text-gallery-white/55">
                Final delivery and availability will be confirmed before payment.
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="checkout-name"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-gold"
                >
                  Full name
                </label>
                <input
                  id="checkout-name"
                  name="name"
                  required
                  className="mt-2 min-h-12 w-full border border-gallery-white/25 bg-transparent px-4 text-sm outline-none transition-colors focus:border-gold"
                />
              </div>
              <div>
                <label
                  htmlFor="checkout-email"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-gold"
                >
                  Email address
                </label>
                <input
                  id="checkout-email"
                  name="email"
                  type="email"
                  required
                  className="mt-2 min-h-12 w-full border border-gallery-white/25 bg-transparent px-4 text-sm outline-none transition-colors focus:border-gold"
                />
              </div>
              <div>
                <label
                  htmlFor="checkout-phone"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-gold"
                >
                  Phone or WhatsApp
                </label>
                <input
                  id="checkout-phone"
                  name="phone"
                  required
                  className="mt-2 min-h-12 w-full border border-gallery-white/25 bg-transparent px-4 text-sm outline-none transition-colors focus:border-gold"
                />
              </div>
              <div>
                <label
                  htmlFor="checkout-note"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-gold"
                >
                  Delivery note
                </label>
                <textarea
                  id="checkout-note"
                  name="note"
                  rows={4}
                  className="mt-2 w-full resize-none border border-gallery-white/25 bg-transparent px-4 py-3 text-sm outline-none transition-colors focus:border-gold"
                  placeholder="City, preferred delivery timing, or custom request"
                />
              </div>
              <button
                type="submit"
                disabled={submitState.status === "submitting"}
                className="flex min-h-13 w-full items-center justify-center rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                {submitState.status === "submitting"
                  ? "Saving Selection..."
                  : "Request Checkout Details"}
              </button>
              <button
                type="button"
                onClick={clearCart}
                className="flex min-h-12 w-full items-center justify-center rounded-full border border-gallery-white/20 px-8 text-xs font-semibold uppercase tracking-[0.22em] text-gallery-white transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Clear Selection
              </button>
              {submitState.status === "success" ? (
                <p className="rounded-card border border-gold/35 bg-gold/10 px-4 py-3 text-sm leading-6 text-gallery-white">
                  Your selection has been saved. Request reference:{" "}
                  <span className="font-semibold">{submitState.requestId.slice(0, 8)}</span>.
                  We will connect Paystack payment after the checkout flow is approved.
                </p>
              ) : null}
              {submitState.status === "error" ? (
                <p className="rounded-card border border-red-300/35 bg-red-950/30 px-4 py-3 text-sm leading-6 text-gallery-white">
                  {submitState.message}
                </p>
              ) : null}
            </form>
          </aside>
        </div>
      </section>
    </main>
  );
}
