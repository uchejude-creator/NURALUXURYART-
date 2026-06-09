import { notFound } from "next/navigation";

import { ArtworkCard } from "@/components/artwork/artwork-card";
import {
  getArtworksByCollectionSlug,
  getCollectionBySlug,
  getFallbackCollectionSlugs,
} from "@/lib/catalog";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export function generateStaticParams() {
  return getFallbackCollectionSlugs();
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return {};
  }

  return {
    title: collection.title,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const artworks = await getArtworksByCollectionSlug(slug);

  return (
    <main className="min-h-screen bg-cream px-6 pb-20 pt-32 text-ink lg:px-10 lg:pt-40">
      <div className="mx-auto max-w-site">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-gold">
          Collection
        </p>
        <h1 className="font-serif text-6xl font-light tracking-tight sm:text-8xl">
          {collection.title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-stone">
          {collection.description}
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {artworks.length ? (
            artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)
          ) : (
            <p className="rounded-card border border-ink/10 bg-gallery-white p-8 text-stone">
              This collection is being prepared. Speak with us for available pieces.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
