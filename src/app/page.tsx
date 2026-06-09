import { HomePage } from "@/components/home/home-page";
import { getCollections, getFeaturedArtworks, getSignatureArtwork } from "@/lib/catalog";

export const revalidate = 60;

export default async function Home() {
  const [collections, featuredArtworks, signatureArtwork] = await Promise.all([
    getCollections(),
    getFeaturedArtworks(),
    getSignatureArtwork(),
  ]);

  return (
    <HomePage
      collections={collections}
      featuredArtworks={featuredArtworks}
      signatureArtwork={signatureArtwork}
    />
  );
}
