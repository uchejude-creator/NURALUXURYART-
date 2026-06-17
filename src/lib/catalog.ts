import { collections as fallbackCollections } from "@/data/collections";
import { featuredArtworks as fallbackFeaturedArtworks, signatureArtwork } from "@/data/featured-artworks";
import { fallbackTestimonials } from "@/data/testimonials";
import { getPublicSupabaseClient } from "@/lib/supabase/public";
import type { Artwork, ArtworkAvailability, ArtworkCollection } from "@/types/artwork";
import type { Testimonial } from "@/types/testimonial";

type CollectionRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_src: string;
  image_alt: string;
  sort_order: number;
  is_active: boolean;
};

type ArtworkRow = {
  id: string;
  legacy_id: string | null;
  title: string;
  slug: string;
  medium: string;
  description: string;
  price: number | null;
  currency: "NGN";
  availability: ArtworkAvailability;
  image_src: string;
  image_alt: string;
  materials: string | null;
  dimensions: string | null;
  origin: string | null;
  framing: string | null;
  care_notes: string | null;
  is_featured: boolean;
  is_signature: boolean;
  is_published: boolean;
  sort_order: number;
  artwork_collections?:
    | {
        slug: string;
      }
    | {
        slug: string;
      }[]
    | null;
};

type TestimonialRow = {
  id: string;
  customer_name: string;
  location: string | null;
  rating: number;
  quote: string;
  artwork_title: string | null;
  is_published: boolean;
  sort_order: number;
};

function getPublicClient() {
  return getPublicSupabaseClient();
}

function mapCollection(row: CollectionRow): ArtworkCollection {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    imageSrc: row.image_src,
    imageAlt: row.image_alt,
    sortOrder: row.sort_order,
  };
}

function mapArtwork(row: ArtworkRow): Artwork {
  const collection = Array.isArray(row.artwork_collections)
    ? row.artwork_collections[0]
    : row.artwork_collections;

  return {
    id: row.legacy_id ?? row.id,
    title: row.title,
    slug: row.slug,
    collectionSlug: collection?.slug ?? "our-works",
    medium: row.medium,
    description: row.description,
    price: row.price,
    currency: row.currency,
    availability: row.availability,
    imageSrc: row.image_src,
    imageAlt: row.image_alt,
    materials: row.materials,
    dimensions: row.dimensions,
    origin: row.origin,
    framing: row.framing,
    careNotes: row.care_notes,
    featured: row.is_featured,
    signature: row.is_signature,
  };
}

function mapTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    customerName: row.customer_name,
    location: row.location,
    rating: row.rating,
    quote: row.quote,
    artworkTitle: row.artwork_title,
    sortOrder: row.sort_order,
  };
}

async function safeQuery<T>(query: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  try {
    const { data, error } = await query;

    if (error) {
      console.warn("Supabase catalog query failed:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Supabase catalog query failed:", error);
    return null;
  }
}

export async function getCollections() {
  const data = await safeQuery<CollectionRow[]>(
    getPublicClient()
      .from("artwork_collections")
      .select("id,title,slug,description,image_src,image_alt,sort_order,is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true }),
  );

  return data?.length ? data.map(mapCollection) : fallbackCollections;
}

export async function getCollectionBySlug(slug: string) {
  const data = await safeQuery<CollectionRow>(
    getPublicClient()
      .from("artwork_collections")
      .select("id,title,slug,description,image_src,image_alt,sort_order,is_active")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle(),
  );

  return data ? mapCollection(data) : fallbackCollections.find((collection) => collection.slug === slug);
}

async function getPublishedArtworks() {
  const data = await safeQuery<ArtworkRow[]>(
    getPublicClient()
      .from("artworks")
      .select(
        "id,legacy_id,title,slug,medium,description,price,currency,availability,image_src,image_alt,materials,dimensions,origin,framing,care_notes,is_featured,is_signature,is_published,sort_order,artwork_collections(slug)",
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true }),
  );

  return data?.length ? data.map(mapArtwork) : [...fallbackFeaturedArtworks, signatureArtwork];
}

export async function getFeaturedArtworks() {
  const artworks = await getPublishedArtworks();
  const featured = artworks.filter((artwork) => artwork.featured);

  return featured.length ? featured : fallbackFeaturedArtworks;
}

export async function getSignatureArtwork() {
  const artworks = await getPublishedArtworks();

  return artworks.find((artwork) => artwork.signature) ?? signatureArtwork;
}

export async function getArtworkBySlug(slug: string) {
  const data = await safeQuery<ArtworkRow>(
    getPublicClient()
      .from("artworks")
      .select(
        "id,legacy_id,title,slug,medium,description,price,currency,availability,image_src,image_alt,materials,dimensions,origin,framing,care_notes,is_featured,is_signature,is_published,sort_order,artwork_collections(slug)",
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle(),
  );

  if (data) {
    return mapArtwork(data);
  }

  return [...fallbackFeaturedArtworks, signatureArtwork].find((artwork) => artwork.slug === slug);
}

export async function getArtworksByCollectionSlug(collectionSlug: string) {
  const artworks = await getPublishedArtworks();

  return artworks.filter((artwork) => artwork.collectionSlug === collectionSlug);
}

export async function getTestimonials() {
  const data = await safeQuery<TestimonialRow[]>(
    getPublicClient()
      .from("testimonials")
      .select("id,customer_name,location,rating,quote,artwork_title,is_published,sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
  );

  return data?.length ? data.map(mapTestimonial) : fallbackTestimonials;
}

export function getFallbackArtworkSlugs() {
  return [...fallbackFeaturedArtworks, signatureArtwork].map((artwork) => ({
    slug: artwork.slug,
  }));
}

export function getFallbackCollectionSlugs() {
  return fallbackCollections.map((collection) => ({
    slug: collection.slug,
  }));
}
