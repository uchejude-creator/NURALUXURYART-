import Link from "next/link";

import type { Artwork } from "@/types/artwork";
import { formatCurrency } from "@/lib/format";
import { routes } from "@/lib/routes";

type ArtworkCardProps = {
  artwork: Artwork;
};

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <article className="rounded-card bg-gallery-white p-5">
      <Link href={routes.artwork(artwork.slug)} aria-label={`View ${artwork.title}`}>
        <div className="aspect-square rounded-card bg-charcoal" aria-hidden="true" />
      </Link>
      <h3 className="mt-5 font-serif text-2xl">
        <Link href={routes.artwork(artwork.slug)} className="hover:text-gold">
          {artwork.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-stone">{artwork.medium}</p>
      {artwork.price ? <p className="mt-2 font-semibold">{formatCurrency(artwork.price)}</p> : null}
    </article>
  );
}
