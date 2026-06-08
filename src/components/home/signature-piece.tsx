import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Reveal } from "@/components/motion/reveal";
import type { Artwork } from "@/types/artwork";
import { formatCurrency } from "@/lib/format";
import { routes } from "@/lib/routes";

type SignaturePieceProps = {
  artwork: Artwork;
};

export function SignaturePiece({ artwork }: SignaturePieceProps) {
  return (
    <section id="signature-piece" className="bg-charcoal px-6 py-20 text-gallery-white lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <Reveal>
          <Link
            href={routes.artwork(artwork.slug)}
            aria-label={`View ${artwork.title}`}
            className="group relative mx-auto block aspect-[4/5] w-full max-w-[34rem] overflow-hidden rounded-card border border-gold/20 bg-ink shadow-[0_30px_90px_rgba(0,0,0,0.28)]"
          >
            <Image
              src={artwork.imageSrc}
              alt={artwork.imageAlt}
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-contain p-3 transition duration-700 group-hover:scale-[1.02]"
              priority
            />
          </Link>
        </Reveal>

        <Reveal className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Signature Piece
          </p>
          <h2 className="mt-6 font-serif text-5xl font-light leading-[0.95] tracking-tight sm:text-7xl">
            {artwork.title}
          </h2>
          <div className="mt-6 flex items-center gap-4 text-sm text-gallery-white/70">
            <span className="h-px w-10 bg-gold" aria-hidden="true" />
            <span>{artwork.medium}</span>
          </div>
          <p className="mt-8 text-base leading-8 text-gallery-white/78">{artwork.description}</p>
          {artwork.price ? (
            <p className="mt-6 text-2xl font-semibold text-gallery-white">
              {formatCurrency(artwork.price)}
            </p>
          ) : null}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <AddToCartButton artwork={artwork} className="sm:min-w-56" />
            <Link
              href={routes.artwork(artwork.slug)}
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-gallery-white/25 px-8 text-xs font-semibold uppercase tracking-[0.22em] text-gallery-white transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              View Signature Piece
            </Link>
            <Link
              href="/#contact"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-gallery-white/25 px-8 text-xs font-semibold uppercase tracking-[0.22em] text-gallery-white transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Request Custom Order
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
