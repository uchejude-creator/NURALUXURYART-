"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import type { Artwork } from "@/types/artwork";

const CART_STORAGE_KEY = "nuraluxuryart-cart-v1";
const CART_CHANGE_EVENT = "nuraluxuryart-cart-change";

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

function getCartSnapshot() {
  return JSON.stringify(getStoredCartItems());
}

function getServerCartSnapshot() {
  return "[]";
}

function parseCartSnapshot(snapshot: string): CartItem[] {
  try {
    const parsedCart = JSON.parse(snapshot) as unknown;

    return Array.isArray(parsedCart) ? (parsedCart as CartItem[]) : [];
  } catch {
    return [];
  }
}

function subscribeToCartStore(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CART_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CART_CHANGE_EVENT, onStoreChange);
  };
}

function writeStoredCartItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
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
  const cartSnapshot = useSyncExternalStore(
    subscribeToCartStore,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const items = useMemo(() => parseCartSnapshot(cartSnapshot), [cartSnapshot]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const updateItems = useCallback((updater: (currentItems: CartItem[]) => CartItem[]) => {
    writeStoredCartItems(updater(getStoredCartItems()));
  }, []);

  const addItem = useCallback((artwork: Artwork) => {
    updateItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === artwork.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === artwork.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...currentItems, artworkToCartItem(artwork)];
    });
  }, [updateItems]);

  const decrementItem = useCallback((id: string) => {
    updateItems((currentItems) =>
      currentItems
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  }, [updateItems]);

  const incrementItem = useCallback((id: string) => {
    updateItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, [updateItems]);

  const removeItem = useCallback((id: string) => {
    updateItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, [updateItems]);

  const clearCart = useCallback(() => {
    writeStoredCartItems([]);
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
