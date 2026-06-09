"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminLoginState = {
  status: "idle" | "success" | "error";
  message: string;
};

const CHECKOUT_STATUSES = new Set([
  "new",
  "contacted",
  "invoice_sent",
  "paid",
  "fulfilled",
  "cancelled",
]);

const MESSAGE_STATUSES = new Set(["new", "reviewed", "replied", "closed"]);
const AVAILABILITY = new Set(["available", "on-request", "reserved", "sold"]);

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanOptionalText(value: FormDataEntryValue | null, maxLength: number) {
  const text = cleanText(value, maxLength);
  return text.length ? text : null;
}

function cleanPrice(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number.parseInt(value.replace(/[^\d]/g, ""), 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function refreshStorefront() {
  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/artworks/[slug]", "page");
  revalidatePath("/collections/[slug]", "page");
}

export async function sendAdminLoginLink(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = cleanText(formData.get("email"), 254).toLowerCase();

  if (!email.includes("@")) {
    return {
      status: "error",
      message: "Enter the admin email address.",
    };
  }

  const supabase = await createClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? siteConfig.url;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/admin`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  return {
    status: "success",
    message: "Check your email for the secure admin sign-in link.",
  };
}

export async function signOutAdmin() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createArtworkAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = cleanText(formData.get("title"), 160);
  const slug = slugify(cleanText(formData.get("slug"), 160) || title);
  const collectionId = cleanText(formData.get("collectionId"), 80);
  const availability = cleanText(formData.get("availability"), 40);

  if (!title || !slug || !collectionId || !AVAILABILITY.has(availability)) {
    redirect("/admin/artworks?error=missing-artwork-fields");
  }

  const { error } = await supabase.from("artworks").insert({
    legacy_id: slug,
    title,
    slug,
    collection_id: collectionId,
    medium: cleanText(formData.get("medium"), 220) || "Hand-painted Turkish artwork",
    description:
      cleanText(formData.get("description"), 1200) ||
      "A hand-painted NURALUXURYART piece curated for refined interiors.",
    price: cleanPrice(formData.get("price")),
    currency: "NGN",
    availability,
    image_src: cleanText(formData.get("imageSrc"), 500) || "/images/artworks/crowned-silence.jpg",
    image_alt:
      cleanText(formData.get("imageAlt"), 500) ||
      `Hand-painted artwork titled ${title} from NURALUXURYART`,
    materials: cleanOptionalText(formData.get("materials"), 500),
    dimensions: cleanOptionalText(formData.get("dimensions"), 120),
    origin: cleanText(formData.get("origin"), 180) || "Hand-painted in Turkey",
    framing: cleanOptionalText(formData.get("framing"), 220),
    care_notes: cleanOptionalText(formData.get("careNotes"), 700),
    is_featured: formData.has("isFeatured"),
    is_signature: formData.has("isSignature"),
    is_published: formData.has("isPublished"),
    sort_order: Number.parseInt(cleanText(formData.get("sortOrder"), 8), 10) || 100,
  });

  if (error) {
    redirect(`/admin/artworks?error=${encodeURIComponent(error.message)}`);
  }

  refreshStorefront();
  redirect("/admin/artworks?updated=created");
}

export async function updateArtworkAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = cleanText(formData.get("id"), 80);
  const title = cleanText(formData.get("title"), 160);
  const slug = slugify(cleanText(formData.get("slug"), 160) || title);
  const collectionId = cleanText(formData.get("collectionId"), 80);
  const availability = cleanText(formData.get("availability"), 40);

  if (!id || !title || !slug || !collectionId || !AVAILABILITY.has(availability)) {
    redirect("/admin/artworks?error=missing-artwork-fields");
  }

  const { error } = await supabase
    .from("artworks")
    .update({
      legacy_id: cleanOptionalText(formData.get("legacyId"), 120) ?? slug,
      title,
      slug,
      collection_id: collectionId,
      medium: cleanText(formData.get("medium"), 220),
      description: cleanText(formData.get("description"), 1200),
      price: cleanPrice(formData.get("price")),
      availability,
      image_src: cleanText(formData.get("imageSrc"), 500),
      image_alt: cleanText(formData.get("imageAlt"), 500),
      materials: cleanOptionalText(formData.get("materials"), 500),
      dimensions: cleanOptionalText(formData.get("dimensions"), 120),
      origin: cleanText(formData.get("origin"), 180) || "Hand-painted in Turkey",
      framing: cleanOptionalText(formData.get("framing"), 220),
      care_notes: cleanOptionalText(formData.get("careNotes"), 700),
      is_featured: formData.has("isFeatured"),
      is_signature: formData.has("isSignature"),
      is_published: formData.has("isPublished"),
      sort_order: Number.parseInt(cleanText(formData.get("sortOrder"), 8), 10) || 100,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/artworks?error=${encodeURIComponent(error.message)}`);
  }

  refreshStorefront();
  redirect("/admin/artworks?updated=saved");
}

export async function updateCheckoutStatusAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = cleanText(formData.get("id"), 80);
  const status = cleanText(formData.get("status"), 40);

  if (!id || !CHECKOUT_STATUSES.has(status)) {
    redirect("/admin/orders?error=invalid-status");
  }

  const { error } = await supabase.from("checkout_requests").update({ status }).eq("id", id);

  if (error) {
    redirect(`/admin/orders?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/orders");
  redirect("/admin/orders?updated=status");
}

export async function updateContactStatusAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = cleanText(formData.get("id"), 80);
  const status = cleanText(formData.get("status"), 40);

  if (!id || !MESSAGE_STATUSES.has(status)) {
    redirect("/admin/messages?error=invalid-status");
  }

  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);

  if (error) {
    redirect(`/admin/messages?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/messages");
  redirect("/admin/messages?updated=status");
}
