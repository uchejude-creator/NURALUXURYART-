import Link from "next/link";

import { routes } from "@/lib/routes";
import type { ArtworkCollection } from "@/types/artwork";

type CollectionCardProps = {
  collection: ArtworkCollection;
};

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <article className="rounded-card border border-ink/10 bg-gallery-white p-6">
      <h3 className="font-serif text-3xl">
        <Link href={routes.collection(collection.slug)} className="hover:text-gold">
          {collection.title}
        </Link>
      </h3>
      <p className="mt-4 text-sm leading-7 text-stone">{collection.description}</p>
      <Link
        href={routes.collection(collection.slug)}
        className="mt-6 inline-flex text-xs font-semibold uppercase tracking-[0.22em] text-ink underline decoration-gold"
      >
        View Collection
      </Link>
    </article>
  );
}
