"use client";

import Image from "next/image";
import { useState } from "react";

import type { ArtworkGalleryImage } from "@/types/artwork";

type ArtworkGalleryProps = {
  artworkTitle: string;
  images: ArtworkGalleryImage[];
};

export function ArtworkGallery({ artworkTitle, images }: ArtworkGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];
  const selectedFit = selectedImage.fit ?? "contain";

  return (
    <section aria-label={`${artworkTitle} image gallery`} className="w-full">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[42rem] overflow-hidden rounded-card bg-charcoal shadow-[0_30px_80px_rgba(15,15,13,0.12)]">
        <Image
          key={`${selectedImage.src}-${selectedImage.label}`}
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={`${selectedFit === "contain" ? "object-contain p-3" : "object-cover"} transition-transform duration-500`}
          style={{ objectPosition: selectedImage.position ?? "center" }}
          loading="eager"
        />
      </div>

      <div
        className="mt-4 flex gap-3 overflow-x-auto pb-1"
        role="list"
        aria-label="Artwork view options"
      >
        {images.map((image, index) => {
          const isSelected = index === selectedIndex;

          return (
            <button
              key={`${image.src}-${image.label}-${index}`}
              type="button"
              aria-label={`Show ${image.label.toLowerCase()} for ${artworkTitle}`}
              aria-pressed={isSelected}
              onClick={() => setSelectedIndex(index)}
              className={`group h-20 w-20 shrink-0 rounded-card border p-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:h-24 sm:w-24 ${
                isSelected
                  ? "border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(202,162,74,0.55)]"
                  : "border-ink/10 bg-gallery-white hover:border-gold/70"
              }`}
            >
              <span className="relative block h-full w-full overflow-hidden rounded-[0.35rem] bg-charcoal">
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="8rem"
                  className={`${image.fit === "contain" ? "object-contain p-1" : "object-cover"} transition-transform duration-500 group-hover:scale-[1.03]`}
                  style={{ objectPosition: image.position ?? "center" }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
