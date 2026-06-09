"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Artwork } from "@/types/artwork";

const CART_STORAGE_KEY = "nuraluxuryart-cart-v1";

export type CartItem = {
  id: string;
  title: string;
  slug: string;
  imageSrc: string;
  imageAlt: string;
  price: number | null;
  medium: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  isCartOpen: boolean;
  addItem: (artwork: Artwork) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function getStoredCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsedCart = storedCart ? (JSON.parse(storedCart) as unknown) : [];

    return Array.isArray(parsedCart) ? (parsedCart as CartItem[]) : [];
  } catch {
    return [];
  }
}

function artworkToCartItem(artwork: Artwork): CartItem {
  return {
    id: artwork.id,
    title: artwork.title,
    slug: artwork.slug,
    imageSrc: artwork.imageSrc,
    imageAlt: artwork.imageAlt,
    price: artwork.price,
    medium: artwork.medium,
    quantity: 1,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getStoredCartItems);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const addItem = useCallback((artwork: Artwork) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === artwork.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === artwork.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...currentItems, artworkToCartItem(artwork)];
    });
  }, []);

  const decrementItem = useCallback((id: string) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const incrementItem = useCallback((id: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

    return {
      items,
      itemCount,
      total,
      isCartOpen,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
    };
  }, [addItem, clearCart, decrementItem, incrementItem, isCartOpen, items, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
