import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Secure NURALUXURYART admin access.",
};

type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getAdminSession();
  const params = await searchParams;

  if (session) {
    redirect("/admin");
  }

  return (
    <main
      data-workspace-shell
      className="min-h-screen bg-ink px-6 pb-20 pt-36 text-gallery-white lg:px-10 lg:pt-44"
    >
      <section className="mx-auto grid max-w-5xl overflow-hidden rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] shadow-[0_30px_90px_rgba(0,0,0,0.28)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-gallery-white/10 p-7 lg:border-b-0 lg:border-r lg:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            NURALUXURYART Admin
          </p>
          <h1 className="mt-6 font-serif text-5xl font-light leading-none sm:text-7xl">
            Enter the gallery office.
          </h1>
          <p className="mt-6 text-sm leading-7 text-gallery-white/70">
            Use an active admin email to manage artworks, collector enquiries, image uploads,
            and checkout requests.
          </p>
          <div className="mt-8 grid gap-3 text-xs uppercase tracking-[0.18em] text-gallery-white/45">
            <span className="rounded-full border border-gallery-white/10 px-4 py-3">
              Supabase Auth
            </span>
            <span className="rounded-full border border-gallery-white/10 px-4 py-3">
              Admin allowlist
            </span>
            <span className="rounded-full border border-gallery-white/10 px-4 py-3">
              Secure media edits
            </span>
          </div>
        </div>

        <div className="p-7 lg:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Secure sign-in
          </p>
          <p className="mt-4 text-sm leading-7 text-gallery-white/58">
            We will email a one-time link. The link opens a confirmation page first, then takes
            you into the admin workspace.
          </p>
          <AdminLoginForm
            initialMessage={
              params?.error
                ? {
                    status: "error",
                    message: params.error,
                  }
                : undefined
            }
          />
        </div>
      </section>
    </main>
  );
}
