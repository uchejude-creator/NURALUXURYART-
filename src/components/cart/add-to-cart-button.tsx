"use client";

import { useEffect, useState } from "react";

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
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (!isAdded) {
      return;
    }

    const timeoutId = window.setTimeout(() => setIsAdded(false), 1400);

    return () => window.clearTimeout(timeoutId);
  }, [isAdded]);

  const variantClassName =
    variant === "outline"
      ? "border border-ink/35 text-ink hover:border-gold hover:text-gold"
      : variant === "compact"
        ? "border border-ink/25 text-ink hover:border-gold hover:text-gold"
        : "bg-gold text-ink shadow-[0_14px_30px_rgba(211,179,52,0.2)] hover:bg-ink hover:text-gallery-white";

  return (
    <button
      type="button"
      onClick={() => {
        addItem(artwork);
        setIsAdded(true);
      }}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[0.66rem] font-bold uppercase tracking-[0.18em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${variantClassName} ${className}`}
      aria-live="polite"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="mr-2 h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6.5 8.5h11l-.7 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6.5 8.5Z" />
        <path d="M9 8.5a3 3 0 0 1 6 0" />
      </svg>
      {isAdded ? "Added" : label}
    </button>
  );
}
