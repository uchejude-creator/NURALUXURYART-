"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type ScrollPosition = {
  left: number;
  top: number;
};

function getLocationKey() {
  return `${window.location.pathname}${window.location.search}`;
}

function scrollInstantlyTo(position: ScrollPosition) {
  try {
    window.scrollTo({ ...position, behavior: "instant" });
  } catch {
    window.scrollTo(position.left, position.top);
  }
}

function scheduleScroll(action: () => void) {
  const animationFrames: number[] = [];
  const timeouts: number[] = [];

  action();

  const firstFrame = window.requestAnimationFrame(() => {
    action();
    animationFrames.push(window.requestAnimationFrame(action));
  });

  animationFrames.push(firstFrame);
  timeouts.push(window.setTimeout(action, 0));
  timeouts.push(window.setTimeout(action, 120));
  timeouts.push(window.setTimeout(action, 350));

  return () => {
    animationFrames.forEach((id) => window.cancelAnimationFrame(id));
    timeouts.forEach((id) => window.clearTimeout(id));
  };
}

export function ScrollRestoration() {
  const pathname = usePathname();
  const hasMounted = useRef(false);
  const isBackOrForwardNavigation = useRef(false);
  const lastSavedLocationKey = useRef<string | null>(null);
  const previousLocationKey = useRef<string | null>(null);
  const savedPositions = useRef(new Map<string, ScrollPosition>());

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const saveCurrentPosition = () => {
      const locationKey = getLocationKey();

      savedPositions.current.set(locationKey, {
        left: window.scrollX,
        top: window.scrollY,
      });
      lastSavedLocationKey.current = locationKey;
    };

    const handleLinkCapture = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a[href]");

      if (!(link instanceof HTMLAnchorElement) || link.origin !== window.location.origin) {
        return;
      }

      saveCurrentPosition();
    };

    const handlePopState = () => {
      if (previousLocationKey.current) {
        savedPositions.current.set(previousLocationKey.current, {
          left: window.scrollX,
          top: window.scrollY,
        });
        lastSavedLocationKey.current = previousLocationKey.current;
      }

      isBackOrForwardNavigation.current = true;
    };

    document.addEventListener("click", handleLinkCapture, true);
    window.addEventListener("pagehide", saveCurrentPosition);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleLinkCapture, true);
      window.removeEventListener("pagehide", saveCurrentPosition);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const locationKey = getLocationKey();
    const previousKey = previousLocationKey.current;

    if (previousKey && previousKey !== locationKey && lastSavedLocationKey.current !== previousKey) {
      savedPositions.current.set(previousKey, {
        left: window.scrollX,
        top: window.scrollY,
      });
      lastSavedLocationKey.current = previousKey;
    }

    previousLocationKey.current = locationKey;

    const navigation =
      typeof performance !== "undefined" && typeof performance.getEntriesByType === "function"
        ? (performance.getEntriesByType("navigation")[0] as
            | PerformanceNavigationTiming
            | undefined)
        : undefined;

    if (!hasMounted.current) {
      hasMounted.current = true;

      if (navigation?.type === "reload") {
        return scheduleScroll(() => scrollInstantlyTo({ left: 0, top: 0 }));
      }

      return;
    }

    if (window.location.hash) {
      const hash = window.location.hash.slice(1);

      return scheduleScroll(() => {
        document.getElementById(decodeURIComponent(hash))?.scrollIntoView();
      });
    }

    if (isBackOrForwardNavigation.current) {
      isBackOrForwardNavigation.current = false;

      return scheduleScroll(() => {
        scrollInstantlyTo(savedPositions.current.get(locationKey) ?? { left: 0, top: 0 });
      });
    }

    return scheduleScroll(() => scrollInstantlyTo({ left: 0, top: 0 }));
  }, [pathname]);

  return null;
}
