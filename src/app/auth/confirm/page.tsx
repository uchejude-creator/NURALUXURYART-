import type { Metadata } from "next";
import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Confirm Sign In",
  description: "Complete secure NURALUXURYART access.",
};

type AuthConfirmPageProps = {
  searchParams?: Promise<{
    next?: string;
    token_hash?: string;
    type?: EmailOtpType;
  }>;
};

function getSafeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }

  return value;
}

function isAdminNext(next: string) {
  return next === "/admin" || next.startsWith("/admin/");
}

function getFailurePath(next: string) {
  return isAdminNext(next) ? "/admin/login" : "/account/login";
}

function getFailureMessage(next: string, message: string) {
  return `${getFailurePath(next)}?error=${encodeURIComponent(message)}`;
}

function getVerifyPath({
  tokenHash,
  type,
  next,
}: {
  tokenHash: string;
  type: EmailOtpType;
  next: string;
}) {
  const searchParams = new URLSearchParams({
    token_hash: tokenHash,
    type,
    next,
  });

  return `/auth/verify?${searchParams.toString()}`;
}

export default async function AuthConfirmPage({ searchParams }: AuthConfirmPageProps) {
  const params = await searchParams;
  const tokenHash = params?.token_hash ?? "";
  const next = getSafeNext(params?.next);
  const type = params?.type ?? "email";
  const isCustomerAccess = !isAdminNext(next);

  if (!tokenHash) {
    redirect(getFailureMessage(next, "Request a fresh sign-in link."));
  }

  if (isCustomerAccess) {
    redirect(getVerifyPath({ tokenHash, type, next }));
  }

  return (
    <main
      data-workspace-shell
      className="min-h-screen bg-ink px-6 pb-20 pt-36 text-gallery-white lg:px-10 lg:pt-44"
    >
      <section className="mx-auto max-w-xl rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.28)] lg:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
          {isCustomerAccess ? "NURALUXURYART Collector" : "NURALUXURYART Admin"}
        </p>
        <h1 className="mt-6 font-serif text-5xl font-light leading-none sm:text-7xl">
          {isCustomerAccess ? "Confirm your collector access." : "Confirm your secure sign-in."}
        </h1>
        <p className="mt-6 text-sm leading-7 text-gallery-white/70">
          {isCustomerAccess
            ? "Finish signing in from this trusted browser. This extra click keeps email scanners from using your one-time link before you do."
            : "Finish the admin login from this trusted browser. This extra click keeps email scanners from using the one-time link before you do."}
        </p>

        <form action="/auth/verify" method="post" className="mt-8">
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="flex min-h-13 w-full items-center justify-center rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            {isCustomerAccess ? "Continue to account" : "Continue to admin"}
          </button>
        </form>
      </section>
    </main>
  );
}
