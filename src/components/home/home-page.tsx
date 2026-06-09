import type { Artwork, ArtworkCollection } from "@/types/artwork";

import { ArtworkCard } from "../artwork/artwork-card";
import { CollectionCard } from "../artwork/collection-card";
import { HeroSection } from "./hero-section";
import { SectionShell } from "./section-shell";
import { SignaturePiece } from "./signature-piece";
import { StorySection } from "./story-section";

type HomePageProps = {
  collections: ArtworkCollection[];
  featuredArtworks: Artwork[];
  signatureArtwork: Artwork;
};

export function HomePage({ collections, featuredArtworks, signatureArtwork }: HomePageProps) {
  return (
    <main>
      <HeroSection />

      <SectionShell
        id="curated-collections"
        title="Curated Collections"
        intro="Explore limited edition art selections designed for collectors, interiors, and modern gallery walls."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {collections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="featured-artworks"
        title="Featured Artworks"
        intro="Selected pieces curated for refined interiors, collectors, and contemporary gallery walls."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      </SectionShell>

      <SignaturePiece artwork={signatureArtwork} />

      <StorySection />

      <SectionShell
        id="collector-care"
        title="Collector Care"
        intro="Every NURALUXURYART piece is selected with care, from the artists who create it to the interiors it is made to elevate."
      />
    </main>
  );
}
