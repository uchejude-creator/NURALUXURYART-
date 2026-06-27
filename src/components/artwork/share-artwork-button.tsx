"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ShareArtworkButtonProps = {
  path: string;
  title: string;
};

export function ShareArtworkButton({ path, title }: ShareArtworkButtonProps) {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const artworkUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return path;
    }

    return new URL(path, window.location.origin).toString();
  }, [path]);

  const shareText = `View ${title} from NURALUXURYART: ${artworkUrl}`;
  const encodedShareText = encodeURIComponent(shareText);
  const whatsappShareUrl = `https://wa.me/?text=${encodedShareText}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodedShareText}`;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function showMessage(value: string) {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 2400);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(artworkUrl);
      showMessage("Link copied");
      setIsOpen(false);
    } catch {
      showMessage("Copy unavailable");
    }
  }

  async function openNativeShare() {
    if (typeof navigator === "undefined" || !("share" in navigator)) {
      showMessage("Share unavailable");
      return;
    }

    try {
      await navigator.share({
        title,
        text: `View ${title} from NURALUXURYART.`,
        url: artworkUrl,
      });
      showMessage("Shared");
      setIsOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      showMessage("Share unavailable");
    }
  }

  return (
    <div ref={wrapperRef} className="relative flex items-center gap-3">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-gold hover:bg-gold hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        aria-label={`Share ${title}`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M8.8 13.2 15.3 17M15.2 7 8.8 10.8M19 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM9 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm10 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-14 z-40 w-64 rounded-card border border-ink/10 bg-gallery-white p-2 text-ink shadow-[0_24px_70px_rgba(0,0,0,0.2)]"
        >
          <p className="px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold">
            Share artwork
          </p>
          <a
            role="menuitem"
            href={whatsappShareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center justify-between rounded-card px-3 text-sm font-medium transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            onClick={() => setIsOpen(false)}
          >
            WhatsApp
            <span
              aria-hidden="true"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-gold"
            >
              Open
            </span>
          </a>
          <a
            role="menuitem"
            href={xShareUrl}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-11 items-center justify-between rounded-card px-3 text-sm font-medium transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            onClick={() => setIsOpen(false)}
          >
            X
            <span
              aria-hidden="true"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-gold"
            >
              Open
            </span>
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={openNativeShare}
            className="flex min-h-11 w-full items-center justify-between rounded-card px-3 text-left text-sm font-medium transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            More options
            <span
              aria-hidden="true"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-gold"
            >
              +
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="flex min-h-11 w-full items-center justify-between rounded-card px-3 text-left text-sm font-medium transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Copy link
            <span
              aria-hidden="true"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-gold"
            >
              Copy
            </span>
          </button>
        </div>
      ) : null}

      <span
        aria-live="polite"
        className="min-w-20 text-xs font-semibold uppercase tracking-[0.18em] text-gold"
      >
        {message}
      </span>
    </div>
  );
}
