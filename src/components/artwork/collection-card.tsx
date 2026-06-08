import Link from "next/link";
import Image from "next/image";

import { Reveal } from "@/components/motion/reveal";
import { routes } from "@/lib/routes";
import type { ArtworkCollection } from "@/types/artwork";

type CollectionCardProps = {
  collection: ArtworkCollection;
};

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Reveal>
      <article className="group relative min-h-[28rem] overflow-hidden rounded-card bg-ink text-gallery-white">
        <Image
          src={collection.imageSrc}
          alt={collection.imageAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
        <div className="relative z-10 flex min-h-[28rem] flex-col justify-end p-7">
          <h3 className="max-w-sm font-serif text-4xl leading-none">
            <Link href={routes.collection(collection.slug)} className="hover:text-gold">
              {collection.title}
            </Link>
          </h3>
          <p className="mt-4 max-w-sm text-sm leading-7 text-gallery-white/75">
            {collection.description}
          </p>
          <Link
            href={routes.collection(collection.slug)}
            className="mt-6 inline-flex w-fit rounded-full border border-gallery-white/35 px-6 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-gallery-white transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            View Collection
          </Link>
        </div>
      </article>
    </Reveal>
  );
}
