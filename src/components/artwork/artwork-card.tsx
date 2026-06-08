import Link from "next/link";
import Image from "next/image";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Reveal } from "@/components/motion/reveal";
import type { Artwork } from "@/types/artwork";
import { formatCurrency } from "@/lib/format";
import { routes } from "@/lib/routes";

type ArtworkCardProps = {
  artwork: Artwork;
};

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <Reveal className="h-full">
      <article className="group flex h-full flex-col">
        <Link href={routes.artwork(artwork.slug)} aria-label={`View ${artwork.title}`}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-card bg-charcoal">
            <Image
              src={artwork.imageSrc}
              alt={artwork.imageAlt}
              fill
              sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="flex flex-1 flex-col rounded-b-card px-1 pb-5 pt-5">
          <div>
            <h3 className="font-serif text-2xl">
              <Link href={routes.artwork(artwork.slug)} className="hover:text-gold">
                {artwork.title}
              </Link>
            </h3>
            {artwork.price ? (
              <p className="mt-2 text-sm font-semibold">{formatCurrency(artwork.price)}</p>
            ) : null}
            <p className="mt-1 text-sm text-stone">{artwork.medium}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-stone">{artwork.description}</p>
          <div className="mt-auto flex flex-col gap-3 pt-5 min-[420px]:flex-row">
            <AddToCartButton artwork={artwork} variant="compact" className="flex-1" />
            <Link
              href={routes.artwork(artwork.slug)}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-ink/25 px-6 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              View piece
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
