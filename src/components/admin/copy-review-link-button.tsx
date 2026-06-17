"use client";

import { useState } from "react";

type CopyReviewLinkButtonProps = {
  link: string;
};

export function CopyReviewLinkButton({ link }: CopyReviewLinkButtonProps) {
  const [label, setLabel] = useState("Copy link");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setLabel("Copied");
      window.setTimeout(() => setLabel("Copy link"), 1800);
    } catch {
      setLabel("Copy failed");
      window.setTimeout(() => setLabel("Copy link"), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      className="min-h-10 rounded-full border border-gallery-white/15 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-gallery-white transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      {label}
    </button>
  );
}
