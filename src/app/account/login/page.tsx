import type { Metadata } from "next";
import Link from "next/link";

import { CustomerLoginForm } from "@/components/account/customer-login-form";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Collector Sign In",
  description: "Sign in to your NURALUXURYART collector account with Google or email.",
};

type AccountLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
    signedOut?: string;
  }>;
};

function getSafeNext(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/admin")) {
    return "/account";
  }

  return value;
}

export default async function AccountLoginPage({ searchParams }: AccountLoginPageProps) {
  const params = await searchParams;
  const next = getSafeNext(params?.next);

  return (
    <main className="bg-cream px-6 pb-20 pt-32 text-ink sm:px-10 lg:px-16 lg:pt-40">
      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-card border border-ink/10 bg-gallery-white shadow-[0_28px_90px_rgba(25,24,21,0.09)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-ink px-7 py-10 text-gallery-white lg:px-10 lg:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Collector Access
          </p>
          <h1 className="mt-6 font-serif text-5xl font-light leading-none sm:text-7xl">
            Enter your private gallery.
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-gallery-white/70">
            Sign in to keep your collector details close as NURALUXURYART grows into a fuller
            shopping experience with saved orders, review invitations, and private artwork notes.
          </p>
          <div className="mt-8 grid gap-3 text-xs uppercase tracking-[0.18em] text-gallery-white/50 sm:grid-cols-3 lg:grid-cols-1">
            <span className="rounded-full border border-gallery-white/10 px-4 py-3">
              Google or email
            </span>
            <span className="rounded-full border border-gallery-white/10 px-4 py-3">
              Secure Supabase Auth
            </span>
            <span className="rounded-full border border-gallery-white/10 px-4 py-3">
              No password to remember
            </span>
          </div>
        </div>

        <div className="p-7 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone">
            Sign in or create account
          </p>
          <h2 className="mt-4 font-serif text-4xl font-light leading-tight sm:text-5xl">
            Continue as a NURALUXURYART collector.
          </h2>
          <p className="mt-4 text-sm leading-7 text-stone">
            Use the same email you use for enquiries or checkout requests so future order details
            can be connected cleanly.
          </p>

          <CustomerLoginForm
            error={params?.error}
            next={next}
            signedOut={params?.signedOut === "1"}
          />

          <p className="mt-7 text-xs leading-6 text-stone/75">
            By continuing, you agree to receive a secure one-time sign-in link from NURALUXURYART.
            For purchase questions, visit{" "}
            <Link href={routes.contact} className="font-semibold text-ink underline">
              Contact
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
