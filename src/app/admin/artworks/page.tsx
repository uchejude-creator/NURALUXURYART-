import Image from "next/image";

import { createArtworkAction, updateArtworkAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

type AdminCollection = {
  id: string;
  title: string;
  slug: string;
};

type AdminArtwork = {
  id: string;
  legacy_id: string | null;
  title: string;
  slug: string;
  collection_id: string | null;
  medium: string;
  description: string;
  price: number | null;
  availability: string;
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
};

const availabilityOptions = ["available", "on-request", "reserved", "sold"];

function Field({
  defaultValue,
  label,
  name,
  placeholder,
  required,
}: {
  defaultValue?: string | number | null;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white/60">
      {label}
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="mt-2 min-h-11 w-full rounded-card border border-gallery-white/15 bg-ink px-3 text-sm normal-case tracking-normal text-gallery-white outline-none transition-colors placeholder:text-gallery-white/25 focus:border-gold"
      />
    </label>
  );
}

function TextArea({
  defaultValue,
  label,
  name,
  rows = 3,
}: {
  defaultValue?: string | null;
  label: string;
  name: string;
  rows?: number;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white/60">
      {label}
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full resize-none rounded-card border border-gallery-white/15 bg-ink px-3 py-3 text-sm normal-case leading-6 tracking-normal text-gallery-white outline-none transition-colors placeholder:text-gallery-white/25 focus:border-gold"
      />
    </label>
  );
}

function CollectionSelect({
  collections,
  defaultValue,
}: {
  collections: AdminCollection[];
  defaultValue?: string | null;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white/60">
      Collection
      <select
        name="collectionId"
        defaultValue={defaultValue ?? collections[0]?.id}
        className="mt-2 min-h-11 w-full rounded-card border border-gallery-white/15 bg-ink px-3 text-sm normal-case tracking-normal text-gallery-white outline-none transition-colors focus:border-gold"
      >
        {collections.map((collection) => (
          <option key={collection.id} value={collection.id}>
            {collection.title}
          </option>
        ))}
      </select>
    </label>
  );
}

function AvailabilitySelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white/60">
      Availability
      <select
        name="availability"
        defaultValue={defaultValue ?? "available"}
        className="mt-2 min-h-11 w-full rounded-card border border-gallery-white/15 bg-ink px-3 text-sm normal-case tracking-normal text-gallery-white outline-none transition-colors focus:border-gold"
      >
        {availabilityOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  defaultChecked,
  label,
  name,
}: {
  defaultChecked?: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-gallery-white/70">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-gold"
      />
      {label}
    </label>
  );
}

function ArtworkForm({
  artwork,
  collections,
}: {
  artwork: AdminArtwork;
  collections: AdminCollection[];
}) {
  return (
    <form
      action={updateArtworkAction}
      className="grid gap-5 rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5 lg:grid-cols-[14rem_1fr]"
    >
      <input type="hidden" name="id" value={artwork.id} />
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-ink">
          <Image
            src={artwork.image_src}
            alt={artwork.image_alt}
            fill
            sizes="14rem"
            className="object-cover"
          />
        </div>
        <p className="mt-4 text-sm font-semibold text-gallery-white">
          {artwork.price ? formatCurrency(artwork.price) : "Available on request"}
        </p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold">{artwork.availability}</p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="title" label="Title" defaultValue={artwork.title} required />
          <Field name="slug" label="Slug" defaultValue={artwork.slug} required />
          <Field name="legacyId" label="Cart ID" defaultValue={artwork.legacy_id ?? artwork.slug} />
          <CollectionSelect collections={collections} defaultValue={artwork.collection_id} />
          <Field name="medium" label="Medium" defaultValue={artwork.medium} required />
          <Field name="price" label="Price (NGN)" defaultValue={artwork.price ?? ""} />
          <AvailabilitySelect defaultValue={artwork.availability} />
          <Field name="sortOrder" label="Sort order" defaultValue={artwork.sort_order} />
        </div>
        <TextArea name="description" label="Description" defaultValue={artwork.description} rows={3} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field name="imageSrc" label="Image path" defaultValue={artwork.image_src} required />
          <Field name="imageAlt" label="Image alt text" defaultValue={artwork.image_alt} required />
          <Field name="materials" label="Materials" defaultValue={artwork.materials} />
          <Field name="dimensions" label="Dimensions" defaultValue={artwork.dimensions} />
          <Field name="origin" label="Origin" defaultValue={artwork.origin ?? "Hand-painted in Turkey"} />
          <Field name="framing" label="Framing" defaultValue={artwork.framing} />
        </div>
        <TextArea name="careNotes" label="Care notes" defaultValue={artwork.care_notes} rows={2} />
        <div className="flex flex-wrap gap-5">
          <Checkbox name="isFeatured" label="Featured" defaultChecked={artwork.is_featured} />
          <Checkbox name="isSignature" label="Signature" defaultChecked={artwork.is_signature} />
          <Checkbox name="isPublished" label="Published" defaultChecked={artwork.is_published} />
        </div>
        <button
          type="submit"
          className="min-h-12 rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white"
        >
          Save artwork
        </button>
      </div>
    </form>
  );
}

export default async function AdminArtworksPage() {
  const { email, supabase } = await requireAdmin();
  const [{ data: collectionsData }, { data: artworksData }] = await Promise.all([
    supabase
      .from("artwork_collections")
      .select("id,title,slug")
      .order("sort_order", { ascending: true }),
    supabase
      .from("artworks")
      .select(
        "id,legacy_id,title,slug,collection_id,medium,description,price,availability,image_src,image_alt,materials,dimensions,origin,framing,care_notes,is_featured,is_signature,is_published,sort_order",
      )
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true }),
  ]);

  const collections = (collectionsData ?? []) as AdminCollection[];
  const artworks = (artworksData ?? []) as AdminArtwork[];

  return (
    <main className="min-h-screen bg-ink px-6 pb-20 pt-32 text-gallery-white lg:px-10 lg:pt-40">
      <section className="mx-auto max-w-site">
        <AdminNav email={email} />

        <section className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5">
          <h2 className="font-serif text-4xl">Add New Artwork</h2>
          <form action={createArtworkAction} className="mt-6 grid gap-4 lg:grid-cols-2">
            <Field name="title" label="Title" placeholder="New artwork title" required />
            <Field name="slug" label="Slug" placeholder="new-artwork-title" />
            <CollectionSelect collections={collections} />
            <AvailabilitySelect />
            <Field name="medium" label="Medium" placeholder="Hand-painted Turkish artwork" />
            <Field name="price" label="Price (NGN)" placeholder="250000" />
            <Field name="imageSrc" label="Image path" placeholder="/images/artworks/name.jpg" />
            <Field name="imageAlt" label="Image alt text" placeholder="Describe the artwork" />
            <TextArea name="description" label="Description" rows={3} />
            <TextArea name="careNotes" label="Care notes" rows={3} />
            <Field name="materials" label="Materials" placeholder="Acrylic paint on textured canvas" />
            <Field name="dimensions" label="Dimensions" placeholder="120 x 180 cm" />
            <Field name="origin" label="Origin" placeholder="Hand-painted in Turkey" />
            <Field name="framing" label="Framing" placeholder="Framed" />
            <Field name="sortOrder" label="Sort order" placeholder="100" />
            <div className="flex flex-wrap gap-5">
              <Checkbox name="isFeatured" label="Featured" defaultChecked />
              <Checkbox name="isSignature" label="Signature" />
              <Checkbox name="isPublished" label="Published" defaultChecked />
            </div>
            <button
              type="submit"
              className="min-h-12 rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white lg:col-span-2"
            >
              Create artwork
            </button>
          </form>
        </section>

        <div className="mt-8 space-y-5">
          {artworks.map((artwork) => (
            <ArtworkForm key={artwork.id} artwork={artwork} collections={collections} />
          ))}
        </div>
      </section>
    </main>
  );
}
