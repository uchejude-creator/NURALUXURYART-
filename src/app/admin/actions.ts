"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { getPublicOrigin } from "@/lib/site-url";
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
const REVIEW_STATUSES = new Set(["invited", "pending", "approved", "rejected"]);
const AVAILABILITY = new Set(["available", "on-request", "reserved", "sold"]);
const ARTWORK_IMAGE_BUCKET = "artwork-media";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

function cleanInteger(value: FormDataEntryValue | null, fallback: number) {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number.parseInt(value.replace(/[^\d-]/g, ""), 10);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanRating(value: FormDataEntryValue | null) {
  return Math.min(Math.max(cleanInteger(value, 5), 1), 5);
}

function reviewStatusNeedsContent(status: string) {
  return status === "pending" || status === "approved";
}

function getImageFile(value: FormDataEntryValue | null) {
  if (typeof File === "undefined" || !(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
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

function refreshTestimonials() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/testimonials");
}

function refreshCustomerReviews() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/orders");
}

async function uploadArtworkImage({
  file,
  slug,
  supabase,
}: {
  file: File;
  slug: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
}) {
  const extension = IMAGE_EXTENSIONS[file.type];

  if (!extension) {
    throw new Error("Upload a JPG, PNG, or WebP artwork image.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Artwork images must be 10 MB or smaller.");
  }

  const imageBuffer = Buffer.from(await file.arrayBuffer());
  const objectPath = `artworks/${slug}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(ARTWORK_IMAGE_BUCKET).upload(objectPath, imageBuffer, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return supabase.storage.from(ARTWORK_IMAGE_BUCKET).getPublicUrl(objectPath).data.publicUrl;
}

async function resolveArtworkImage({
  fallback,
  formData,
  slug,
  supabase,
}: {
  fallback: string;
  formData: FormData;
  slug: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
}) {
  const imageFile = getImageFile(formData.get("imageUpload"));

  if (imageFile) {
    return uploadArtworkImage({ file: imageFile, slug, supabase });
  }

  return cleanText(formData.get("imageSrc"), 1000) || fallback;
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
  const redirectOrigin = getPublicOrigin(requestHeaders.get("origin"));

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${redirectOrigin}/auth/confirm?next=/admin`,
      shouldCreateUser: false,
    },
  });

  if (error) {
    return {
      status: error.message.toLowerCase().includes("rate limit") ? "error" : "success",
      message: error.message.toLowerCase().includes("rate limit")
        ? "Please wait a moment before requesting another login link."
        : "If this address is an active admin, check your email for the secure sign-in link.",
    };
  }

  return {
    status: "success",
    message: "If this address is an active admin, check your email for the secure sign-in link.",
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

  let imageSrc: string;

  try {
    imageSrc = await resolveArtworkImage({
      fallback: "https://xuhwuwdsamnisvxezobh.supabase.co/storage/v1/object/public/artwork-media/artworks/crowned-silence.jpg",
      formData,
      slug,
      supabase,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed.";
    redirect(`/admin/artworks?error=${encodeURIComponent(message)}`);
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
    image_src: imageSrc,
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

  let imageSrc: string;

  try {
    imageSrc = await resolveArtworkImage({
      fallback: cleanText(formData.get("currentImageSrc"), 1000),
      formData,
      slug,
      supabase,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed.";
    redirect(`/admin/artworks?error=${encodeURIComponent(message)}`);
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
      image_src: imageSrc,
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

export async function createTestimonialAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const customerName = cleanText(formData.get("customerName"), 160);
  const quote = cleanText(formData.get("quote"), 700);

  if (!customerName || quote.length < 8) {
    redirect("/admin/testimonials?error=missing-testimonial-fields");
  }

  const { error } = await supabase.from("testimonials").insert({
    customer_name: customerName,
    location: cleanOptionalText(formData.get("location"), 160),
    rating: cleanRating(formData.get("rating")),
    quote,
    artwork_title: cleanOptionalText(formData.get("artworkTitle"), 180),
    is_published: formData.has("isPublished"),
    sort_order: cleanInteger(formData.get("sortOrder"), 100),
  });

  if (error) {
    redirect(`/admin/testimonials?error=${encodeURIComponent(error.message)}`);
  }

  refreshTestimonials();
  redirect("/admin/testimonials?updated=created");
}

export async function updateTestimonialAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = cleanText(formData.get("id"), 80);
  const customerName = cleanText(formData.get("customerName"), 160);
  const quote = cleanText(formData.get("quote"), 700);

  if (!id || !customerName || quote.length < 8) {
    redirect("/admin/testimonials?error=missing-testimonial-fields");
  }

  const { error } = await supabase
    .from("testimonials")
    .update({
      customer_name: customerName,
      location: cleanOptionalText(formData.get("location"), 160),
      rating: cleanRating(formData.get("rating")),
      quote,
      artwork_title: cleanOptionalText(formData.get("artworkTitle"), 180),
      is_published: formData.has("isPublished"),
      sort_order: cleanInteger(formData.get("sortOrder"), 100),
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/testimonials?error=${encodeURIComponent(error.message)}`);
  }

  refreshTestimonials();
  redirect("/admin/testimonials?updated=saved");
}

export async function deleteTestimonialAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = cleanText(formData.get("id"), 80);

  if (!id) {
    redirect("/admin/testimonials?error=missing-testimonial-id");
  }

  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) {
    redirect(`/admin/testimonials?error=${encodeURIComponent(error.message)}`);
  }

  refreshTestimonials();
  redirect("/admin/testimonials?updated=deleted");
}

export async function createReviewInvitationAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const customerName = cleanText(formData.get("customerName"), 160);
  const customerEmail = cleanText(formData.get("customerEmail"), 254).toLowerCase();
  const artworkTitle = cleanOptionalText(formData.get("artworkTitle"), 180);

  if (!customerName || !customerEmail.includes("@")) {
    redirect("/admin/reviews?error=missing-review-invitation-fields");
  }

  const { error } = await supabase.from("customer_reviews").insert({
    customer_name: customerName,
    customer_email: customerEmail,
    location: cleanOptionalText(formData.get("location"), 160),
    artwork_title: artworkTitle,
    status: "invited",
    sort_order: cleanInteger(formData.get("sortOrder"), 100),
  });

  if (error) {
    redirect(`/admin/reviews?error=${encodeURIComponent(error.message)}`);
  }

  refreshCustomerReviews();
  redirect("/admin/reviews?updated=invited");
}

export async function createReviewInvitationFromOrderItemAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const requestId = cleanText(formData.get("requestId"), 80);
  const itemId = cleanText(formData.get("itemId"), 80);

  if (!requestId || !itemId) {
    redirect("/admin/orders?error=missing-review-order-fields");
  }

  const [{ data: request, error: requestError }, { data: item, error: itemError }] =
    await Promise.all([
      supabase
        .from("checkout_requests")
        .select("id,customer_name,customer_email,delivery_city,delivery_state")
        .eq("id", requestId)
        .maybeSingle(),
      supabase
        .from("checkout_request_items")
        .select("id,request_id,title")
        .eq("id", itemId)
        .eq("request_id", requestId)
        .maybeSingle(),
    ]);

  if (requestError || itemError || !request || !item) {
    redirect("/admin/orders?error=review-source-not-found");
  }

  const location = [request.delivery_city, request.delivery_state].filter(Boolean).join(", ") || null;
  const { error } = await supabase.from("customer_reviews").insert({
    checkout_request_id: request.id,
    checkout_request_item_id: item.id,
    customer_name: request.customer_name,
    customer_email: request.customer_email,
    location,
    artwork_title: item.title,
    status: "invited",
    sort_order: 50,
  });

  if (error) {
    redirect(`/admin/orders?error=${encodeURIComponent(error.message)}`);
  }

  refreshCustomerReviews();
  redirect("/admin/orders?updated=review-link");
}

export async function updateCustomerReviewAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = cleanText(formData.get("id"), 80);
  const status = cleanText(formData.get("status"), 40);
  const customerName = cleanText(formData.get("customerName"), 160);
  const customerEmail = cleanText(formData.get("customerEmail"), 254).toLowerCase();
  const quote = cleanOptionalText(formData.get("quote"), 900);
  const rating = formData.get("rating") ? cleanRating(formData.get("rating")) : null;

  if (!id || !REVIEW_STATUSES.has(status) || !customerName || !customerEmail.includes("@")) {
    redirect("/admin/reviews?error=missing-review-fields");
  }

  if (reviewStatusNeedsContent(status) && (!rating || !quote)) {
    redirect("/admin/reviews?error=review-content-required");
  }

  const { error } = await supabase
    .from("customer_reviews")
    .update({
      customer_name: customerName,
      customer_email: customerEmail,
      location: cleanOptionalText(formData.get("location"), 160),
      artwork_title: cleanOptionalText(formData.get("artworkTitle"), 180),
      rating,
      quote,
      status,
      sort_order: cleanInteger(formData.get("sortOrder"), 100),
      approved_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/reviews?error=${encodeURIComponent(error.message)}`);
  }

  refreshCustomerReviews();
  redirect("/admin/reviews?updated=saved");
}

export async function moderateCustomerReviewAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = cleanText(formData.get("id"), 80);
  const status = cleanText(formData.get("status"), 40);

  if (!id || !["approved", "rejected"].includes(status)) {
    redirect("/admin/reviews?error=invalid-review-status");
  }

  if (status === "approved") {
    const { data: review, error: reviewError } = await supabase
      .from("customer_reviews")
      .select("rating,quote")
      .eq("id", id)
      .maybeSingle();

    if (reviewError || !review?.rating || !review.quote) {
      redirect("/admin/reviews?error=review-content-required");
    }
  }

  const { error } = await supabase
    .from("customer_reviews")
    .update({
      status,
      approved_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/reviews?error=${encodeURIComponent(error.message)}`);
  }

  refreshCustomerReviews();
  redirect(`/admin/reviews?updated=${status}`);
}

export async function deleteCustomerReviewAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = cleanText(formData.get("id"), 80);

  if (!id) {
    redirect("/admin/reviews?error=missing-review-id");
  }

  const { error } = await supabase.from("customer_reviews").delete().eq("id", id);

  if (error) {
    redirect(`/admin/reviews?error=${encodeURIComponent(error.message)}`);
  }

  refreshCustomerReviews();
  redirect("/admin/reviews?updated=deleted");
}
