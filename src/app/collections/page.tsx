import { CollectionCard } from "@/components/artwork/collection-card";
import { collections } from "@/data/collections";

export const metadata = {
  title: "Collections",
  description: "Explore NURALUXURYART hand-painted artwork collections.",
};

export default function CollectionsPage() {
  return (
    <main className="min-h-screen bg-cream px-6 py-20 text-ink lg:px-10">
      <div className="mx-auto max-w-site">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-gold">
          Gallery
        </p>
        <h1 className="font-serif text-6xl font-light tracking-tight sm:text-8xl">
          Collections
        </h1>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {collections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </div>
      </div>
    </main>
  );
}
