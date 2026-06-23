import type { Artwork, ArtworkGalleryImage } from "@/types/artwork";

export function getArtworkGalleryImages(artwork: Artwork): ArtworkGalleryImage[] {
  const mainImage: ArtworkGalleryImage = {
    src: artwork.imageSrc,
    alt: artwork.imageAlt,
    label: "Full view",
    fit: "contain",
    position: "center",
  };

  if (artwork.galleryImages?.length) {
    return [mainImage, ...artwork.galleryImages];
  }

  return [
    mainImage,
    {
      src: artwork.imageSrc,
      alt: `Close texture detail of ${artwork.title}`,
      label: "Texture detail",
      fit: "cover",
      position: "50% 42%",
    },
    {
      src: artwork.imageSrc,
      alt: `Frame and edge detail of ${artwork.title}`,
      label: "Frame detail",
      fit: "cover",
      position: "50% 18%",
    },
  ];
}
