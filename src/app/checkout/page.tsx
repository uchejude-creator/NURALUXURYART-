import type { Metadata } from "next";

import { CheckoutClient, type CheckoutProfile } from "@/components/checkout/checkout-client";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review selected NURALUXURYART pieces before secure Paystack checkout.",
};

export const dynamic = "force-dynamic";

type CustomerProfileRow = CheckoutProfile;

function getUserFullName(metadata: Record<string, unknown> | undefined) {
  const fullName = metadata?.full_name ?? metadata?.name;

  return typeof fullName === "string" && fullName.trim() ? fullName.trim() : null;
}

function createCheckoutProfile(
  profile: CustomerProfileRow | null,
  fallback: { email?: string | null; fullName?: string | null },
): CheckoutProfile | null {
  if (!profile && !fallback.email && !fallback.fullName) {
    return null;
  }

  return {
    address: profile?.address ?? null,
    city: profile?.city ?? null,
    country: profile?.country ?? null,
    delivery_notes: profile?.delivery_notes ?? null,
    email: profile?.email ?? fallback.email ?? null,
    full_name: profile?.full_name ?? fallback.fullName ?? null,
    phone: profile?.phone ?? null,
    state: profile?.state ?? null,
  };
}

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let savedProfile: CheckoutProfile | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("full_name,email,phone,address,city,state,country,delivery_notes")
      .eq("user_id", user.id)
      .maybeSingle<CustomerProfileRow>();

    savedProfile = createCheckoutProfile(profile, {
      email: user.email ?? null,
      fullName: getUserFullName(user.user_metadata as Record<string, unknown> | undefined),
    });
  }

  return <CheckoutClient savedProfile={savedProfile} />;
}
