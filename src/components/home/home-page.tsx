import { collections } from "@/data/collections";
import { featuredArtworks, signatureArtwork } from "@/data/featured-artworks";

import { ArtworkCard } from "../artwork/artwork-card";
import { CollectionCard } from "../artwork/collection-card";
import { SiteFooter } from "../layout/site-footer";
import { SiteHeader } from "../layout/site-header";
import { HeroSection } from "./hero-section";
import { SectionShell } from "./section-shell";

export function HomePage() {
  return (
    <>
      <SiteHeader />
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

        <SectionShell
          id="signature-piece"
          eyebrow="Signature Piece"
          title={signatureArtwork.title}
          intro="A textured composition of blue, ivory, and muted gold, selected for interiors that need presence, calm, and quiet distinction."
        />

        <SectionShell
          id="our-story"
          eyebrow="Our Story"
          title="Hand-Painted in Turkey, Curated for the World"
          intro="NURALUXURYART began in Istanbul, born from a lifelong love for art and a deep appreciation for the city’s rich creative spirit. Today, exclusive hand-painted collections are still created in Turkey with quality materials and paints, then made available through our Lagos presence."
        />

        <SectionShell
          id="collector-care"
          title="Collector Care"
          intro="Every NURALUXURYART piece is selected with care, from the artists who create it to the interiors it is made to elevate."
        />
      </main>
      <SiteFooter />
    </>
  );
}
