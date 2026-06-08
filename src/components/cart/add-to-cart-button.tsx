"use client";

import type { Artwork } from "@/types/artwork";

import { useCart } from "./cart-context";

type AddToCartButtonProps = {
  artwork: Artwork;
  label?: string;
  variant?: "gold" | "outline" | "compact";
  className?: string;
};

export function AddToCartButton({
  artwork,
  label = "Add to cart",
  variant = "gold",
  className = "",
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCart();

  const variantClassName =
    variant === "outline"
      ? "border border-ink/35 text-ink hover:border-gold hover:text-gold"
      : variant === "compact"
        ? "border border-ink/25 text-ink hover:border-gold hover:text-gold"
        : "bg-gold text-ink hover:bg-ink hover:text-gallery-white";

  return (
    <button
      type="button"
      onClick={() => {
        addItem(artwork);
        openCart();
      }}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-6 text-[0.66rem] font-bold uppercase tracking-[0.18em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${variantClassName} ${className}`}
    >
      {label}
    </button>
  );
}
