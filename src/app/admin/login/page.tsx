import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Secure NURALUXURYART admin access.",
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-ink px-6 pb-20 pt-32 text-gallery-white lg:px-10 lg:pt-40">
      <section className="mx-auto max-w-xl rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
          NURALUXURYART Admin
        </p>
        <h1 className="mt-6 font-serif text-5xl font-light leading-none sm:text-7xl">
          Enter the gallery office.
        </h1>
        <p className="mt-6 text-sm leading-7 text-gallery-white/70">
          Use an allowlisted admin email to manage artworks, collector enquiries,
          and checkout requests.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
