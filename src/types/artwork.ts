export type ArtworkAvailability = "available" | "on-request" | "reserved" | "sold";

export type Artwork = {
  id: string;
  title: string;
  slug: string;
  collectionSlug: string;
  medium: string;
  description: string;
  price: number | null;
  currency: "NGN";
  availability: ArtworkAvailability;
  imageSrc: string;
  imageAlt: string;
  featured?: boolean;
  signature?: boolean;
};

export type ArtworkCollection = {
  title: string;
  slug: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};
