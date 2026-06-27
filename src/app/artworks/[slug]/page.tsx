import { notFound } from "next/navigation";
import Link from "next/link";

import { ArtworkGallery } from "@/components/artwork/artwork-gallery";
import { ShareArtworkButton } from "@/components/artwork/share-artwork-button";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { siteConfig } from "@/config/site";
import { getArtworkGalleryImages } from "@/lib/artwork-gallery";
import { getArtworkBySlug, getFallbackArtworkSlugs } from "@/lib/catalog";
import { formatCurrency } from "@/lib/format";
import { routes } from "@/lib/routes";

type ArtworkPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export function generateStaticParams() {
  return getFallbackArtworkSlugs();
}

export async function generateMetadata({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    return {};
  }

  const [primaryImage] = getArtworkGalleryImages(artwork);
  const previewImage = primaryImage?.src ?? siteConfig.ogImage;
  const description = `${artwork.title} by NURALUXURYART. ${artwork.medium}.`;

  return {
    title: artwork.title,
    description,
    openGraph: {
      title: `${artwork.title} | NURALUXURYART`,
      description,
      url: routes.artwork(artwork.slug),
      siteName: siteConfig.name,
      images: [
        {
          url: previewImage,
          alt: `${artwork.title} from NURALUXURYART`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${artwork.title} | NURALUXURYART`,
      description,
      images: [previewImage],
    },
  };
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    notFound();
  }

  const galleryImages = getArtworkGalleryImages(artwork);

  return (
    <main className="min-h-screen bg-cream px-6 pb-20 pt-32 text-ink lg:px-10 lg:pt-40">
      <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <ArtworkGallery artworkTitle={artwork.title} images={galleryImages} />
        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Artwork
            </p>
            <ShareArtworkButton path={routes.artwork(artwork.slug)} title={artwork.title} />
          </div>
          <h1 className="font-serif text-6xl font-light tracking-tight sm:text-8xl">
            {artwork.title}
          </h1>
          <p className="mt-6 text-base leading-8 text-stone">{artwork.medium}</p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone">
            {artwork.description}
          </p>
          <dl className="mt-8 grid gap-4 border-y border-ink/10 py-6 text-sm text-stone sm:grid-cols-2">
            {artwork.materials ? (
              <div>
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold">
                  Materials
                </dt>
                <dd className="mt-2">{artwork.materials}</dd>
              </div>
            ) : null}
            {artwork.dimensions ? (
              <div>
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold">
                  Dimensions
                </dt>
                <dd className="mt-2">{artwork.dimensions}</dd>
              </div>
            ) : null}
            {artwork.origin ? (
              <div>
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold">
                  Origin
                </dt>
                <dd className="mt-2">{artwork.origin}</dd>
              </div>
            ) : null}
            {artwork.framing ? (
              <div>
                <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-gold">
                  Framing
                </dt>
                <dd className="mt-2">{artwork.framing}</dd>
              </div>
            ) : null}
          </dl>
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
              href={routes.contact}
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
