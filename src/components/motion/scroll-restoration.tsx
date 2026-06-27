"use client";

import { useEffect } from "react";

export function ScrollRestoration() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "auto";
    }

    const navigation =
      typeof performance !== "undefined" && typeof performance.getEntriesByType === "function"
        ? (performance.getEntriesByType("navigation")[0] as
            | PerformanceNavigationTiming
            | undefined)
        : undefined;

    if (navigation?.type !== "reload") {
      return;
    }

    const resetToTop = () => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } catch {
        window.scrollTo(0, 0);
      }
    };

    resetToTop();
    const scheduleFrame =
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame.bind(window)
        : (callback: FrameRequestCallback) => window.setTimeout(callback, 16);

    scheduleFrame(resetToTop);
    window.setTimeout(resetToTop, 0);
  }, []);

  return null;
}
