import { HomePage } from "@/components/home/home-page";
import {
  getCollections,
  getFeaturedArtworks,
  getSignatureArtwork,
  getTestimonials,
} from "@/lib/catalog";

export const revalidate = 60;

export default async function Home() {
  const [collections, featuredArtworks, signatureArtwork, testimonials] = await Promise.all([
    getCollections(),
    getFeaturedArtworks(),
    getSignatureArtwork(),
    getTestimonials(),
  ]);

  return (
    <HomePage
      collections={collections}
      featuredArtworks={featuredArtworks}
      signatureArtwork={signatureArtwork}
      testimonials={testimonials}
    />
  );
}
