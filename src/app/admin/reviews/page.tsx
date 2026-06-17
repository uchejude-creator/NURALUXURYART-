import { headers } from "next/headers";
import Link from "next/link";

import {
  createReviewInvitationAction,
  deleteCustomerReviewAction,
  moderateCustomerReviewAction,
  updateCustomerReviewAction,
} from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { CopyReviewLinkButton } from "@/components/admin/copy-review-link-button";
import { requireAdmin } from "@/lib/admin";
import { routes } from "@/lib/routes";
import { getPublicOrigin } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type CustomerReview = {
  id: string;
  review_token: string;
  customer_name: string;
  customer_email: string;
  location: string | null;
  artwork_title: string | null;
  rating: number | null;
  quote: string | null;
  status: "invited" | "pending" | "approved" | "rejected";
  sort_order: number;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
};

type AdminReviewsPageProps = {
  searchParams?: Promise<{
    error?: string;
    updated?: string;
  }>;
};

const ratingOptions = [5, 4, 3, 2, 1];
const statusOptions = ["invited", "pending", "approved", "rejected"] as const;

async function getBaseUrl() {
  const requestHeaders = await headers();
  return getPublicOrigin(requestHeaders.get("origin"));
}

function formatStatus(status: CustomerReview["status"]) {
  return status.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function PageNotice({ error, updated }: { error?: string; updated?: string }) {
  if (!error && !updated) {
    return null;
  }

  const isError = Boolean(error);
  const message = error
    ? error
    : updated === "invited"
      ? "Private review invitation created."
      : updated === "approved"
        ? "Review approved and eligible for the homepage carousel."
        : updated === "rejected"
          ? "Review rejected and hidden from the storefront."
          : updated === "deleted"
            ? "Review deleted."
            : "Review saved.";

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
  type = "text",
}: {
  defaultValue?: string | number | null;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white/60">
      {label}
      <input
        type={type}
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
  placeholder,
}: {
  defaultValue?: string | null;
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white/60">
      {label}
      <textarea
        name={name}
        rows={5}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-card border border-gallery-white/15 bg-ink px-3 py-3 text-sm normal-case leading-6 tracking-normal text-gallery-white outline-none transition-colors placeholder:text-gallery-white/25 focus:border-gold"
      />
    </label>
  );
}

function RatingSelect({ defaultValue = 5 }: { defaultValue?: number | null }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white/60">
      Rating
      <select
        name="rating"
        defaultValue={defaultValue ?? 5}
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

function StatusBadge({ status }: { status: CustomerReview["status"] }) {
  const tone =
    status === "approved"
      ? "border-emerald-300/35 bg-emerald-950/30 text-emerald-100"
      : status === "pending"
        ? "border-gold/35 bg-gold/10 text-gold"
        : status === "rejected"
          ? "border-red-300/35 bg-red-950/30 text-red-100"
          : "border-gallery-white/15 bg-gallery-white/[0.04] text-gallery-white/65";

  return (
    <span className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${tone}`}>
      {formatStatus(status)}
    </span>
  );
}

function ModerateButton({
  id,
  status,
}: {
  id: string;
  status: "approved" | "rejected";
}) {
  return (
    <form action={moderateCustomerReviewAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={`min-h-10 w-full rounded-full px-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
          status === "approved"
            ? "bg-gold text-ink hover:bg-gallery-white focus-visible:outline-gold"
            : "border border-gallery-white/15 text-gallery-white hover:border-red-300/60 hover:text-red-100 focus-visible:outline-red-200"
        }`}
      >
        {status === "approved" ? "Approve" : "Reject"}
      </button>
    </form>
  );
}

function ReviewCard({ baseUrl, review }: { baseUrl: string; review: CustomerReview }) {
  const reviewLink = `${baseUrl}${routes.review(review.review_token)}`;

  return (
    <article className="grid gap-5 rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5 lg:grid-cols-[1fr_18rem] lg:p-6">
      <form action={updateCustomerReviewAction} className="grid gap-4">
        <input type="hidden" name="id" value={review.id} />
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={review.status} />
          <span className="text-xs uppercase tracking-[0.2em] text-gallery-white/45">
            Created {formatDate(review.created_at)}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            {review.artwork_title || "NURALUXURYART artwork"}
          </p>
          <h3 className="mt-2 font-serif text-4xl leading-none">{review.customer_name}</h3>
        </div>

        <TextArea
          name="quote"
          label="Customer review"
          defaultValue={review.quote}
          placeholder="The collector review will appear here after submission."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            name="customerName"
            label="Customer name"
            defaultValue={review.customer_name}
            required
          />
          <Field
            name="customerEmail"
            label="Customer email"
            type="email"
            defaultValue={review.customer_email}
            required
          />
          <Field name="location" label="Location" defaultValue={review.location} />
          <Field name="artworkTitle" label="Artwork title" defaultValue={review.artwork_title} />
          <Field name="sortOrder" label="Sort order" defaultValue={review.sort_order} />
          <RatingSelect defaultValue={review.rating} />
        </div>

        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white/60">
          Moderation status
          <select
            name="status"
            defaultValue={review.status}
            className="mt-2 min-h-11 w-full rounded-card border border-gallery-white/15 bg-ink px-3 text-sm normal-case tracking-normal text-gallery-white outline-none transition-colors focus:border-gold"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="min-h-11 rounded-full bg-gold px-6 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          Save review
        </button>
      </form>

      <aside className="flex flex-col gap-4 rounded-card border border-gallery-white/10 bg-ink/35 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            Private link
          </p>
          <p className="mt-3 break-all text-xs leading-5 text-gallery-white/55">{reviewLink}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyReviewLinkButton link={reviewLink} />
            <Link
              href={reviewLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center rounded-full border border-gallery-white/15 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-gallery-white transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Open
            </Link>
          </div>
        </div>

        <dl className="space-y-3 border-t border-gallery-white/10 pt-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-[0.2em] text-gallery-white/35">Submitted</dt>
            <dd className="mt-1 text-gallery-white/70">{formatDate(review.submitted_at)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.2em] text-gallery-white/35">Approved</dt>
            <dd className="mt-1 text-gallery-white/70">{formatDate(review.approved_at)}</dd>
          </div>
        </dl>

        <div className="grid gap-2 border-t border-gallery-white/10 pt-4">
          <ModerateButton id={review.id} status="approved" />
          <ModerateButton id={review.id} status="rejected" />
          <form action={deleteCustomerReviewAction}>
            <input type="hidden" name="id" value={review.id} />
            <button
              type="submit"
              className="min-h-10 w-full rounded-full border border-gallery-white/15 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-gallery-white transition-colors hover:border-red-300/60 hover:text-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
            >
              Delete
            </button>
          </form>
        </div>
      </aside>
    </article>
  );
}

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const [{ email, supabase }, params, baseUrl] = await Promise.all([
    requireAdmin(),
    searchParams,
    getBaseUrl(),
  ]);

  const { data } = await supabase
    .from("customer_reviews")
    .select(
      "id,review_token,customer_name,customer_email,location,artwork_title,rating,quote,status,sort_order,submitted_at,approved_at,created_at",
    )
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as CustomerReview[];
  const counts = statusOptions.map((status) => [
    status,
    reviews.filter((review) => review.status === status).length,
  ]);

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
              Verified Reviews
            </p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl font-light leading-tight sm:text-6xl">
              Invite real collectors and approve what appears publicly.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:self-end">
            {counts.map(([status, count]) => (
              <div key={status} className="rounded-card border border-gallery-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  {formatStatus(String(status) as CustomerReview["status"])}
                </p>
                <p className="mt-3 font-serif text-4xl font-light leading-none">{count}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5 lg:p-7">
          <div className="border-b border-gallery-white/10 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              New Invitation
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light sm:text-5xl">
              Create a private review link
            </h2>
          </div>
          <form action={createReviewInvitationAction} className="mt-6 grid gap-4 lg:grid-cols-2">
            <Field name="customerName" label="Customer name" placeholder="Amara O." required />
            <Field
              name="customerEmail"
              label="Customer email"
              type="email"
              placeholder="collector@example.com"
              required
            />
            <Field name="location" label="Location" placeholder="Lagos, Nigeria" />
            <Field name="artworkTitle" label="Artwork title" placeholder="Golden Arc Reverie" />
            <Field name="sortOrder" label="Sort order" placeholder="50" />
            <button
              type="submit"
              className="min-h-12 rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white lg:self-end"
            >
              Create review link
            </button>
          </form>
        </section>

        <div className="mt-8 flex flex-col gap-4 border-b border-gallery-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Moderation Queue
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light">Manage customer reviews</h2>
          </div>
          <p className="text-sm text-gallery-white/50">{reviews.length} record(s)</p>
        </div>

        <div className="mt-6 space-y-5">
          {reviews.length ? (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} baseUrl={baseUrl} />
            ))
          ) : (
            <div className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-8 text-gallery-white/65">
              No review invitations yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
