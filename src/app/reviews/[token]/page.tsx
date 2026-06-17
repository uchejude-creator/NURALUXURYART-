import type { Metadata } from "next";
import Link from "next/link";

import { submitCustomerReviewAction } from "@/app/reviews/[token]/actions";
import { siteConfig } from "@/config/site";
import { routes } from "@/lib/routes";
import { getPublicSupabaseClient } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Collector Review",
  description:
    "Share a private NURALUXURYART collector review for a verified artwork purchase.",
};

type ReviewInvitation = {
  review_token: string;
  customer_name: string;
  artwork_title: string | null;
  status: "invited" | "pending";
};

type ReviewPageProps = {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ error?: string }>;
};

const ratingOptions = [5, 4, 3, 2, 1];

async function getInvitation(token: string) {
  const { data, error } = await getPublicSupabaseClient().rpc("get_review_invitation", {
    p_token: token,
  });

  if (error || !Array.isArray(data)) {
    return null;
  }

  return (data[0] ?? null) as ReviewInvitation | null;
}

function ErrorNotice({ error }: { error?: string }) {
  if (!error) {
    return null;
  }

  return (
    <div
      role="alert"
      className="mb-6 rounded-card border border-red-300/30 bg-red-950/25 px-5 py-4 text-sm leading-6 text-gallery-white"
    >
      Please choose a rating and write a review of at least 8 characters. If the link has already
      been used, contact the gallery for help.
    </div>
  );
}

function UnavailableState() {
  return (
    <section className="mx-auto max-w-3xl rounded-card border border-gallery-white/10 bg-gallery-white/[0.045] p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.24)] sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
        Review Link
      </p>
      <h1 className="mt-5 font-serif text-5xl font-light leading-none sm:text-7xl">
        This private review link is unavailable.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-gallery-white/62">
        It may have already been submitted or the token may be incorrect. Speak with the gallery if
        you need a fresh review invitation.
      </p>
      <Link
        href={routes.contact}
        className="mt-8 inline-flex min-h-12 items-center rounded-full bg-gold px-7 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
        Contact the gallery
      </Link>
    </section>
  );
}

function PendingState({ invitation }: { invitation: ReviewInvitation }) {
  return (
    <section className="mx-auto max-w-3xl rounded-card border border-gallery-white/10 bg-gallery-white/[0.045] p-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.24)] sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
        Review Received
      </p>
      <h1 className="mt-5 font-serif text-5xl font-light leading-none sm:text-7xl">
        Thank you, {invitation.customer_name}.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-gallery-white/62">
        Your note for {invitation.artwork_title || "your NURALUXURYART piece"} is awaiting gallery
        approval before it appears publicly.
      </p>
      <Link
        href={routes.home}
        className="mt-8 inline-flex min-h-12 items-center rounded-full border border-gallery-white/15 px-7 text-xs font-semibold uppercase tracking-[0.2em] text-gallery-white transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
        Return to gallery
      </Link>
    </section>
  );
}

export default async function ReviewPage({ params, searchParams }: ReviewPageProps) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const invitation = await getInvitation(token);

  return (
    <main className="min-h-screen bg-ink px-6 py-28 text-gallery-white lg:px-10 lg:py-36">
      <div className="mx-auto max-w-site">
        <Link
          href={routes.home}
          className="mb-10 inline-flex text-xs font-semibold uppercase tracking-[0.24em] text-gallery-white/55 transition-colors hover:text-gold"
        >
          {siteConfig.name}
        </Link>

        {!invitation ? (
          <UnavailableState />
        ) : invitation.status === "pending" ? (
          <PendingState invitation={invitation} />
        ) : (
          <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.045] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.22)] sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
                Verified Collector Review
              </p>
              <h1 className="mt-5 font-serif text-5xl font-light leading-none sm:text-7xl">
                Share your experience.
              </h1>
              <p className="mt-6 text-sm leading-7 text-gallery-white/62">
                Your review helps future collectors understand how the artwork lives in a real
                space. It will only appear publicly after gallery approval.
              </p>
              <div className="mt-8 rounded-card border border-gold/25 bg-gold/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                  Artwork
                </p>
                <p className="mt-2 font-serif text-3xl">
                  {invitation.artwork_title || "NURALUXURYART artwork"}
                </p>
                <p className="mt-2 text-sm text-gallery-white/55">
                  Private link for {invitation.customer_name}
                </p>
              </div>
            </div>

            <form
              action={submitCustomerReviewAction}
              className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.045] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.22)] sm:p-8"
            >
              <input type="hidden" name="token" value={token} />
              <ErrorNotice error={query?.error} />

              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-[0.24em] text-gallery-white/62">
                  Rating
                </legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-5">
                  {ratingOptions.map((rating) => (
                    <label
                      key={rating}
                      className="flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-gallery-white/12 px-4 text-sm font-semibold text-gallery-white transition-colors has-[:checked]:border-gold has-[:checked]:bg-gold has-[:checked]:text-ink"
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        defaultChecked={rating === 5}
                        className="sr-only"
                      />
                      {rating} star{rating === 1 ? "" : "s"}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.24em] text-gallery-white/62">
                Location
                <input
                  name="location"
                  placeholder="Lagos, Nigeria"
                  className="mt-3 min-h-12 w-full rounded-card border border-gallery-white/12 bg-ink px-4 text-sm normal-case tracking-normal text-gallery-white outline-none placeholder:text-gallery-white/25 focus:border-gold"
                />
              </label>

              <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.24em] text-gallery-white/62">
                Your review
                <textarea
                  name="quote"
                  required
                  minLength={8}
                  maxLength={900}
                  rows={7}
                  placeholder="Tell us how the artwork feels in your space..."
                  className="mt-3 w-full resize-none rounded-card border border-gallery-white/12 bg-ink px-4 py-4 text-sm normal-case leading-7 tracking-normal text-gallery-white outline-none placeholder:text-gallery-white/25 focus:border-gold"
                />
              </label>

              <button
                type="submit"
                className="mt-7 min-h-12 w-full rounded-full bg-gold px-7 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Submit review
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
