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
  gallery_images: AdminGalleryImage[] | null;
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

type AdminGalleryImage = {
  src?: unknown;
  alt?: unknown;
};

type GalleryImageSlot = {
  src: string;
  alt: string;
};

const availabilityOptions = ["available", "on-request", "reserved", "sold"];
const galleryImageSlotCount = 3;

type AdminArtworksPageProps = {
  searchParams?: Promise<{
    error?: string;
    updated?: string;
  }>;
};

function formatStatus(value: string) {
  return value.replaceAll("-", " ");
}

function getAvailabilityClasses(value: string) {
  if (value === "sold") {
    return "border-gallery-white/15 bg-gallery-white/10 text-gallery-white/60";
  }

  if (value === "reserved" || value === "on-request") {
    return "border-gold/30 bg-gold/10 text-gold";
  }

  return "border-emerald-300/25 bg-emerald-500/10 text-emerald-100";
}

function PageNotice({ error, updated }: { error?: string; updated?: string }) {
  if (!error && !updated) {
    return null;
  }

  const isError = Boolean(error);
  const message = error
    ? error
    : updated === "created"
      ? "Artwork created and storefront refreshed."
      : "Artwork saved and storefront refreshed.";

  return (
    <div
      className={`mb-6 rounded-card border px-5 py-4 text-sm leading-6 ${
        isError
          ? "border-red-300/35 bg-red-950/30 text-gallery-white"
          : "border-gold/35 bg-gold/10 text-gallery-white"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}

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

function ImageUploadField() {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white/60">
      Upload new image
      <input
        name="imageUpload"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="mt-2 w-full rounded-card border border-dashed border-gallery-white/20 bg-ink px-3 py-3 text-sm normal-case tracking-normal text-gallery-white file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.16em] file:text-ink hover:file:bg-gallery-white"
      />
      <span className="mt-2 block text-[0.65rem] font-normal normal-case leading-5 tracking-normal text-gallery-white/45">
        JPG, PNG, or WebP. Uploading a file replaces the image URL.
      </span>
    </label>
  );
}

function GalleryImageUploadField({ index }: { index: number }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white/60">
      Upload view {index}
      <input
        name={`galleryImageUpload${index}`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="mt-2 w-full rounded-card border border-dashed border-gallery-white/20 bg-ink px-3 py-3 text-sm normal-case tracking-normal text-gallery-white file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.16em] file:text-ink hover:file:bg-gallery-white"
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

function getGalleryImageSlots(images: AdminGalleryImage[] | null | undefined): GalleryImageSlot[] {
  const galleryImages = Array.isArray(images) ? images : [];

  return Array.from({ length: galleryImageSlotCount }, (_, index) => {
    const image = galleryImages[index];

    return {
      src: typeof image?.src === "string" ? image.src : "",
      alt: typeof image?.alt === "string" ? image.alt : "",
    };
  });
}

function GalleryImageFields({ images }: { images?: GalleryImageSlot[] }) {
  const slots =
    images ??
    Array.from({ length: galleryImageSlotCount }, () => ({
      src: "",
      alt: "",
    }));

  return (
    <div className="grid gap-4 rounded-card border border-gallery-white/10 bg-gallery-white/[0.03] p-4 md:col-span-2 lg:col-span-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
          Product page gallery
        </p>
        <p className="mt-2 text-sm leading-6 text-gallery-white/50">
          The main artwork image stays first. Add up to three optional extra views for the thumbnails
          on the artwork detail page.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {slots.map((slot, index) => {
          const slotNumber = index + 1;

          return (
            <div
              key={slotNumber}
              className="grid gap-3 rounded-card border border-gallery-white/10 bg-ink/50 p-3"
            >
              <input
                type="hidden"
                name={`currentGalleryImageSrc${slotNumber}`}
                value={slot.src}
              />
              <div className="relative aspect-square overflow-hidden rounded-card bg-charcoal">
                {slot.src ? (
                  <Image
                    src={slot.src}
                    alt={slot.alt || "Artwork gallery view"}
                    fill
                    sizes="14rem"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gallery-white/35">
                    Optional view {slotNumber}
                  </div>
                )}
              </div>
              <Field
                name={`galleryImageSrc${slotNumber}`}
                label={`View ${slotNumber} URL`}
                defaultValue={slot.src}
              />
              <GalleryImageUploadField index={slotNumber} />
              <Field
                name={`galleryImageAlt${slotNumber}`}
                label={`View ${slotNumber} alt text`}
                defaultValue={slot.alt}
                placeholder="Describe this artwork view"
              />
              {slot.src ? (
                <Checkbox name={`galleryImageRemove${slotNumber}`} label="Remove this view" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
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
      encType="multipart/form-data"
      className="grid gap-6 rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.16)] lg:grid-cols-[16rem_1fr] lg:p-6"
    >
      <input type="hidden" name="id" value={artwork.id} />
      <input type="hidden" name="currentImageSrc" value={artwork.image_src} />
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-ink">
          <Image
            src={artwork.image_src}
            alt={artwork.image_alt}
            fill
            sizes="16rem"
            className="object-cover"
          />
        </div>
        <div className="mt-4 space-y-3">
          <span
            className={`inline-flex rounded-full border px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${getAvailabilityClasses(
              artwork.availability,
            )}`}
          >
            {formatStatus(artwork.availability)}
          </span>
          <p className="text-sm font-semibold text-gallery-white">
            {artwork.price ? formatCurrency(artwork.price) : "Available on request"}
          </p>
          <p className="break-all text-xs leading-5 text-gallery-white/35">{artwork.slug}</p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex flex-col gap-4 border-b border-gallery-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
              Artwork record
            </p>
            <h3 className="mt-2 font-serif text-4xl leading-none">{artwork.title}</h3>
          </div>
          <button
            type="submit"
            className="min-h-11 rounded-full bg-gold px-7 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Save artwork
          </button>
        </div>

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
          <Field name="imageSrc" label="Image URL" defaultValue={artwork.image_src} />
          <ImageUploadField />
          <Field name="imageAlt" label="Image alt text" defaultValue={artwork.image_alt} required />
          <GalleryImageFields images={getGalleryImageSlots(artwork.gallery_images)} />
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
      </div>
    </form>
  );
}

export default async function AdminArtworksPage({ searchParams }: AdminArtworksPageProps) {
  const { email, supabase } = await requireAdmin();
  const params = await searchParams;
  const [{ data: collectionsData }, { data: artworksData }] = await Promise.all([
    supabase
      .from("artwork_collections")
      .select("id,title,slug")
      .order("sort_order", { ascending: true }),
    supabase
      .from("artworks")
      .select(
        "id,legacy_id,title,slug,collection_id,medium,description,price,availability,image_src,image_alt,gallery_images,materials,dimensions,origin,framing,care_notes,is_featured,is_signature,is_published,sort_order",
      )
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true }),
  ]);

  const collections = (collectionsData ?? []) as AdminCollection[];
  const artworks = (artworksData ?? []) as AdminArtwork[];
  const publishedCount = artworks.filter((artwork) => artwork.is_published).length;
  const signatureCount = artworks.filter((artwork) => artwork.is_signature).length;

  return (
    <main
      data-workspace-shell
      className="min-h-screen bg-ink px-6 pb-20 pt-32 text-gallery-white lg:px-10 lg:pt-40"
    >
      <section className="mx-auto max-w-site">
        <AdminNav email={email} />

        <PageNotice error={params?.error} updated={params?.updated} />

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          {[
            ["Total artworks", artworks.length],
            ["Published", publishedCount],
            ["Signature", signatureCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                {label}
              </p>
              <p className="mt-4 font-serif text-5xl font-light leading-none">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5 lg:p-7">
          <div className="grid gap-4 border-b border-gallery-white/10 pb-6 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
                Catalog Studio
              </p>
              <h2 className="mt-3 font-serif text-4xl font-light sm:text-5xl">Add New Artwork</h2>
            </div>
            <p className="text-sm leading-7 text-gallery-white/60 lg:self-end">
              Upload a new image or paste an existing Supabase image URL. Published artworks appear
              on the storefront after save.
            </p>
          </div>
          <form
            action={createArtworkAction}
            encType="multipart/form-data"
            className="mt-6 grid gap-4 lg:grid-cols-2"
          >
            <Field name="title" label="Title" placeholder="New artwork title" required />
            <Field name="slug" label="Slug" placeholder="new-artwork-title" />
            <CollectionSelect collections={collections} />
            <AvailabilitySelect />
            <Field name="medium" label="Medium" placeholder="Hand-painted Turkish artwork" />
            <Field name="price" label="Price (NGN)" placeholder="250000" />
            <Field
              name="imageSrc"
              label="Image URL"
              placeholder="https://... or upload a file"
            />
            <ImageUploadField />
            <Field name="imageAlt" label="Image alt text" placeholder="Describe the artwork" />
            <GalleryImageFields />
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

        <div className="mt-8 flex flex-col gap-4 border-b border-gallery-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Current Catalog
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light">Edit existing artworks</h2>
          </div>
          <p className="text-sm text-gallery-white/50">{artworks.length} record(s)</p>
        </div>

        <div className="mt-6 space-y-5">
          {artworks.map((artwork) => (
            <ArtworkForm key={artwork.id} artwork={artwork} collections={collections} />
          ))}
        </div>
      </section>
    </main>
  );
}
