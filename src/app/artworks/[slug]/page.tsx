import { notFound } from "next/navigation";

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
    <main className="min-h-screen bg-cream px-6 py-20 text-ink lg:px-10">
      <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div className="aspect-square rounded-card bg-charcoal" aria-label={artwork.imageAlt} />
        <section>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Artwork
          </p>
          <h1 className="font-serif text-6xl font-light tracking-tight sm:text-8xl">
            {artwork.title}
          </h1>
          <p className="mt-6 text-base leading-8 text-stone">{artwork.medium}</p>
          {artwork.price ? (
            <p className="mt-4 text-2xl font-semibold">{formatCurrency(artwork.price)}</p>
          ) : (
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-gold">
              Available on request
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
