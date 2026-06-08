import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { featuredArtworks, signatureArtwork } from "@/data/featured-artworks";
import { formatCurrency } from "@/lib/format";

const artworks = [...featuredArtworks, signatureArtwork];

type ArtworkPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return artworks.map((artwork) => ({ slug: artwork.slug }));
}

export async function generateMetadata({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const artwork = artworks.find((item) => item.slug === slug);

  if (!artwork) {
    return {};
  }

  return {
    title: artwork.title,
    description: `${artwork.title} by NURALUXURYART. ${artwork.medium}.`,
  };
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const artwork = artworks.find((item) => item.slug === slug);

  if (!artwork) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-cream px-6 pb-20 pt-32 text-ink lg:px-10 lg:pt-40">
      <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[42rem] overflow-hidden rounded-card bg-charcoal">
          <Image
            src={artwork.imageSrc}
            alt={artwork.imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain p-3"
            priority
          />
        </div>
        <section>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Artwork
          </p>
          <h1 className="font-serif text-6xl font-light tracking-tight sm:text-8xl">
            {artwork.title}
          </h1>
          <p className="mt-6 text-base leading-8 text-stone">{artwork.medium}</p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone">
            {artwork.description}
          </p>
          {artwork.price ? (
            <p className="mt-4 text-2xl font-semibold">{formatCurrency(artwork.price)}</p>
          ) : (
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-gold">
              Available on request
            </p>
          )}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <AddToCartButton artwork={artwork} className="sm:min-w-52" />
            <Link
              href="/#contact"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/25 px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Request purchase
            </Link>
          </div>
          <Link
            href="/#featured-artworks"
            className="mt-8 inline-flex text-xs font-semibold uppercase tracking-[0.22em] text-gold transition-colors hover:text-ink"
          >
            ← Back to artworks
          </Link>
        </section>
      </div>
    </main>
  );
}
