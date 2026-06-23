import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutCustomer } from "@/app/account/actions";
import { siteConfig } from "@/config/site";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Collector Account",
  description: "Manage your NURALUXURYART collector access and shopping details.",
};

function getDisplayName(metadata: Record<string, unknown> | undefined, email?: string) {
  const fullName = metadata?.full_name ?? metadata?.name;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }

  return email?.split("@")[0] ?? "Collector";
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${routes.accountLogin}?next=${encodeURIComponent(routes.account)}`);
  }

  const displayName = getDisplayName(user.user_metadata as Record<string, unknown> | undefined, user.email);

  return (
    <main className="bg-cream px-6 pb-20 pt-32 text-ink sm:px-10 lg:px-16 lg:pt-40">
      <section className="mx-auto max-w-site">
        <div className="grid gap-8 rounded-card border border-ink/10 bg-gallery-white p-7 shadow-[0_28px_90px_rgba(25,24,21,0.08)] lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Collector Account
            </p>
            <h1 className="mt-6 font-serif text-5xl font-light leading-none sm:text-7xl">
              Welcome, {displayName}.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-stone">
              Your private collector area is ready. As NURALUXURYART grows, this is where saved
              orders, review invitations, checkout details, and private artwork notes will live.
            </p>
          </div>

          <div className="rounded-card border border-ink/10 bg-cream p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
              Signed in as
            </p>
            <p className="mt-3 break-words font-serif text-3xl leading-tight text-ink">
              {user.email}
            </p>
            <form action={signOutCustomer} className="mt-6">
              <button
                type="submit"
                className="min-h-12 rounded-full border border-ink/20 px-7 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:border-gold hover:text-stone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href={routes.collections}
            className="rounded-card border border-ink/10 bg-gallery-white p-6 transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
              Gallery
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light">Continue collecting</h2>
            <p className="mt-3 text-sm leading-6 text-stone">
              Browse curated hand-painted Turkish artworks for refined interiors.
            </p>
          </Link>

          <Link
            href={routes.checkout}
            className="rounded-card border border-ink/10 bg-gallery-white p-6 transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
              Cart
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light">Review selected pieces</h2>
            <p className="mt-3 text-sm leading-6 text-stone">
              Return to your cart and prepare an order request when you are ready.
            </p>
          </Link>

          <Link
            href={routes.contact}
            className="rounded-card border border-ink/10 bg-gallery-white p-6 transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
              Concierge
            </p>
            <h2 className="mt-4 font-serif text-3xl font-light">Speak with us</h2>
            <p className="mt-3 text-sm leading-6 text-stone">
              Ask about sizing, custom requests, delivery, or availability in Lagos.
            </p>
          </Link>
        </div>

        <p className="mt-8 text-xs leading-6 text-stone/70">
          Need help now? Contact {siteConfig.contact.email} or WhatsApp {siteConfig.contact.phone}.
        </p>
      </section>
    </main>
  );
}
