"use client";

import { useEffect } from "react";

import { useCart } from "@/components/cart/cart-context";

export function ClearCartOnSuccess({ enabled }: { enabled: boolean }) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (enabled) {
      clearCart();
    }
  }, [clearCart, enabled]);

  return null;
}
