import { notFound } from "next/navigation";

import { ArtworkCard } from "@/components/artwork/artwork-card";
import { collections } from "@/data/collections";
import { featuredArtworks } from "@/data/featured-artworks";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = collections.find((item) => item.slug === slug);

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
  const collection = collections.find((item) => item.slug === slug);

  if (!collection) {
    notFound();
  }

  const artworks = featuredArtworks.filter((artwork) => artwork.collectionSlug === slug);

  return (
    <main className="min-h-screen bg-cream px-6 py-20 text-ink lg:px-10">
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
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      </div>
    </main>
  );
}
