export type ArtworkAvailability = "available" | "on-request" | "reserved" | "sold";

export type ArtworkGalleryImage = {
  src: string;
  alt: string;
  label: string;
  fit?: "contain" | "cover";
  position?: string;
};

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
  materials?: string | null;
  dimensions?: string | null;
  origin?: string | null;
  framing?: string | null;
  careNotes?: string | null;
  galleryImages?: ArtworkGalleryImage[];
  featured?: boolean;
  signature?: boolean;
};

export type ArtworkCollection = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  sortOrder?: number;
};
