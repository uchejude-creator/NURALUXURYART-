import {
  createTestimonialAction,
  deleteTestimonialAction,
  updateTestimonialAction,
} from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type AdminTestimonial = {
  id: string;
  customer_name: string;
  location: string | null;
  rating: number;
  quote: string;
  artwork_title: string | null;
  is_published: boolean;
  sort_order: number;
};

type AdminTestimonialsPageProps = {
  searchParams?: Promise<{
    error?: string;
    updated?: string;
  }>;
};

const ratingOptions = [5, 4, 3, 2, 1];

function PageNotice({ error, updated }: { error?: string; updated?: string }) {
  if (!error && !updated) {
    return null;
  }

  const isError = Boolean(error);
  const message = error
    ? error
    : updated === "created"
      ? "Testimonial created and storefront refreshed."
      : updated === "deleted"
        ? "Testimonial removed and storefront refreshed."
        : "Testimonial saved and storefront refreshed.";

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
  rows = 4,
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
        required
        defaultValue={defaultValue ?? ""}
        className="mt-2 w-full resize-none rounded-card border border-gallery-white/15 bg-ink px-3 py-3 text-sm normal-case leading-6 tracking-normal text-gallery-white outline-none transition-colors placeholder:text-gallery-white/25 focus:border-gold"
      />
    </label>
  );
}

function RatingSelect({ defaultValue = 5 }: { defaultValue?: number }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white/60">
      Rating
      <select
        name="rating"
        defaultValue={defaultValue}
        className="mt-2 min-h-11 w-full rounded-card border border-gallery-white/15 bg-ink px-3 text-sm normal-case tracking-normal text-gallery-white outline-none transition-colors focus:border-gold"
      >
        {ratingOptions.map((rating) => (
          <option key={rating} value={rating}>
            {rating} star{rating === 1 ? "" : "s"}
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

function TestimonialForm({ testimonial }: { testimonial: AdminTestimonial }) {
  return (
    <form
      action={updateTestimonialAction}
      className="grid gap-5 rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5 lg:grid-cols-[1fr_0.42fr] lg:p-6"
    >
      <input type="hidden" name="id" value={testimonial.id} />
      <div className="grid gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Collector Note
          </p>
          <h3 className="mt-2 font-serif text-4xl leading-none">{testimonial.customer_name}</h3>
        </div>
        <TextArea name="quote" label="Quote" defaultValue={testimonial.quote} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="customerName"
            label="Collector name"
            defaultValue={testimonial.customer_name}
            required
          />
          <Field name="location" label="Location" defaultValue={testimonial.location} />
          <Field
            name="artworkTitle"
            label="Artwork title"
            defaultValue={testimonial.artwork_title}
          />
          <Field name="sortOrder" label="Sort order" defaultValue={testimonial.sort_order} />
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-card border border-gallery-white/10 bg-ink/35 p-4">
        <RatingSelect defaultValue={testimonial.rating} />
        <Checkbox
          name="isPublished"
          label="Published on storefront"
          defaultChecked={testimonial.is_published}
        />
        <button
          type="submit"
          className="min-h-11 rounded-full bg-gold px-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          Save note
        </button>
        <button
          type="submit"
          formAction={deleteTestimonialAction}
          className="min-h-11 rounded-full border border-gallery-white/15 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white transition-colors hover:border-red-300/60 hover:text-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-200"
        >
          Delete
        </button>
      </div>
    </form>
  );
}

export default async function AdminTestimonialsPage({ searchParams }: AdminTestimonialsPageProps) {
  const { email, supabase } = await requireAdmin();
  const params = await searchParams;
  const { data } = await supabase
    .from("testimonials")
    .select("id,customer_name,location,rating,quote,artwork_title,is_published,sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  const testimonials = (data ?? []) as AdminTestimonial[];
  const publishedCount = testimonials.filter((testimonial) => testimonial.is_published).length;

  return (
    <main
      data-workspace-shell
      className="min-h-screen bg-ink px-6 pb-20 pt-32 text-gallery-white lg:px-10 lg:pt-40"
    >
      <section className="mx-auto max-w-site">
        <AdminNav email={email} />

        <PageNotice error={params?.error} updated={params?.updated} />

        <section className="mb-8 grid gap-5 rounded-card border border-gallery-white/10 bg-gallery-white/[0.035] p-5 lg:grid-cols-[1fr_0.7fr] lg:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Collector Notes
            </p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl font-light leading-tight sm:text-6xl">
              Edit the rotating testimonials beneath Our Story.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:self-end">
            {[
              ["Total notes", testimonials.length],
              ["Published", publishedCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-card border border-gallery-white/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                  {label}
                </p>
                <p className="mt-4 font-serif text-5xl font-light leading-none">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5 lg:p-7">
          <div className="border-b border-gallery-white/10 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              New Testimonial
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light sm:text-5xl">
              Add a collector note
            </h2>
          </div>
          <form action={createTestimonialAction} className="mt-6 grid gap-4 lg:grid-cols-2">
            <Field name="customerName" label="Collector name" placeholder="Amara O." required />
            <Field name="location" label="Location" placeholder="Ikoyi, Lagos" />
            <Field name="artworkTitle" label="Artwork title" placeholder="Crowned Silence" />
            <Field name="sortOrder" label="Sort order" placeholder="60" />
            <RatingSelect />
            <Checkbox name="isPublished" label="Published on storefront" defaultChecked />
            <div className="lg:col-span-2">
              <TextArea
                name="quote"
                label="Quote"
                defaultValue="The artwork brought texture, presence, and quiet elegance into our home."
              />
            </div>
            <button
              type="submit"
              className="min-h-12 rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white lg:col-span-2"
            >
              Create testimonial
            </button>
          </form>
        </section>

        <div className="mt-8 flex flex-col gap-4 border-b border-gallery-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Existing Notes
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light">Manage testimonials</h2>
          </div>
          <p className="text-sm text-gallery-white/50">{testimonials.length} record(s)</p>
        </div>

        <div className="mt-6 space-y-5">
          {testimonials.map((testimonial) => (
            <TestimonialForm key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </section>
    </main>
  );
}
