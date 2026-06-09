"use client";

import { useEffect } from "react";

export function ScrollRestoration() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const resetToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    resetToTop();
    requestAnimationFrame(resetToTop);
    window.setTimeout(resetToTop, 0);
  }, []);

  return null;
}
