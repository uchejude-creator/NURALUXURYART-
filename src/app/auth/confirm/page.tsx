import type { Metadata } from "next";
import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Confirm Admin Login",
  description: "Complete secure NURALUXURYART admin access.",
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
    return "/admin";
  }

  return value;
}

async function confirmAuthLink(formData: FormData) {
  "use server";

  const tokenHash = String(formData.get("tokenHash") ?? "");
  const type = String(formData.get("type") ?? "email") as EmailOtpType;
  const next = getSafeNext(String(formData.get("next") ?? "/admin"));

  if (!tokenHash) {
    redirect("/admin/login?error=Request+a+fresh+admin+sign-in+link.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    redirect("/admin/login?error=The+sign-in+link+is+invalid+or+has+expired.");
  }

  redirect(next);
}

export default async function AuthConfirmPage({ searchParams }: AuthConfirmPageProps) {
  const params = await searchParams;
  const tokenHash = params?.token_hash ?? "";
  const next = getSafeNext(params?.next);
  const type = params?.type ?? "email";

  if (!tokenHash) {
    redirect("/admin/login?error=Request+a+fresh+admin+sign-in+link.");
  }

  return (
    <main
      data-workspace-shell
      className="min-h-screen bg-ink px-6 pb-20 pt-36 text-gallery-white lg:px-10 lg:pt-44"
    >
      <section className="mx-auto max-w-xl rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.28)] lg:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
          NURALUXURYART Admin
        </p>
        <h1 className="mt-6 font-serif text-5xl font-light leading-none sm:text-7xl">
          Confirm your secure sign-in.
        </h1>
        <p className="mt-6 text-sm leading-7 text-gallery-white/70">
          Finish the admin login from this trusted browser. This extra click keeps email scanners
          from using the one-time link before you do.
        </p>

        <form action={confirmAuthLink} className="mt-8">
          <input type="hidden" name="tokenHash" value={tokenHash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="flex min-h-13 w-full items-center justify-center rounded-full bg-gold px-8 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Continue to admin
          </button>
        </form>
      </section>
    </main>
  );
}
