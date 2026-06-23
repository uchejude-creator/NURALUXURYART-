import { siteConfig } from "@/config/site";
import { getAdminNotifyEmail, sendEmailSafely } from "@/lib/email/service";

type CheckoutEmailItem = {
  title: string;
  medium: string;
  price: number | null;
  quantity: number;
  image_src?: string | null;
};

type CheckoutEmailInput = {
  requestId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryPreference: string;
  deliveryCountry: string;
  deliveryState: string;
  deliveryCity: string;
  deliveryAddress: string;
  deliveryLandmark: string | null;
  deliveryNote: string | null;
  items: CheckoutEmailItem[];
  totalAmount: number;
};

type ContactEmailInput = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
};

type ReviewInvitationInput = {
  customerName: string;
  customerEmail: string;
  artworkTitle: string | null;
  reviewUrl: string;
};

const brand = {
  gold: "#d6b33f",
  charcoal: "#111111",
  ink: "#24211c",
  muted: "#6b6258",
  cream: "#f7f1e8",
  line: "#ded3c4",
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Available on request";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function textFromHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/(h1|h2|h3|li)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderButton(label: string, href: string) {
  return `
    <p style="margin:28px 0 0;">
      <a href="${escapeHtml(href)}" style="display:inline-block;background:${brand.gold};color:${brand.charcoal};font:700 12px Arial,sans-serif;letter-spacing:1.6px;text-transform:uppercase;text-decoration:none;padding:15px 22px;border-radius:999px;">
        ${escapeHtml(label)}
      </a>
    </p>
  `;
}

function renderField(label: string, value: unknown) {
  if (!value) {
    return "";
  }

  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${brand.line};font:700 11px Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:${brand.muted};vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;border-bottom:1px solid ${brand.line};font:400 15px Arial,sans-serif;color:${brand.ink};vertical-align:top;">${escapeHtml(value)}</td>
    </tr>
  `;
}

function renderLayout({
  preview,
  kicker,
  title,
  intro,
  content,
}: {
  preview: string;
  kicker?: string;
  title: string;
  intro?: string;
  content: string;
}) {
  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:${brand.cream};color:${brand.ink};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${brand.cream};padding:34px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fffaf2;border:1px solid ${brand.line};border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:34px 34px 26px;border-bottom:1px solid ${brand.line};">
                <p style="margin:0 0 24px;font:700 11px Arial,sans-serif;letter-spacing:5px;text-transform:uppercase;color:${brand.gold};">NURALUXURYART</p>
                ${kicker ? `<p style="margin:0 0 12px;font:700 11px Arial,sans-serif;letter-spacing:1.8px;text-transform:uppercase;color:${brand.muted};">${escapeHtml(kicker)}</p>` : ""}
                <h1 style="margin:0;font:400 38px Georgia,serif;line-height:1.08;color:${brand.ink};">${escapeHtml(title)}</h1>
                ${intro ? `<p style="margin:18px 0 0;font:400 16px/1.7 Arial,sans-serif;color:${brand.muted};">${escapeHtml(intro)}</p>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:30px 34px 36px;font:400 15px/1.7 Arial,sans-serif;color:${brand.ink};">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 34px;background:${brand.charcoal};color:#f6efe4;">
                <p style="margin:0;font:400 12px/1.6 Arial,sans-serif;color:#d6cbbb;">
                  ${escapeHtml(siteConfig.tagline)}<br />
                  ${escapeHtml(siteConfig.contact.email)} | ${escapeHtml(siteConfig.contact.phone)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderItems(items: CheckoutEmailItem[]) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0 0;border-collapse:collapse;">
      ${items
        .map(
          (item) => `
            <tr>
              <td style="padding:13px 0;border-bottom:1px solid ${brand.line};">
                <strong style="display:block;font:400 19px Georgia,serif;color:${brand.ink};">${escapeHtml(item.title)}</strong>
                <span style="display:block;margin-top:3px;font:400 13px Arial,sans-serif;color:${brand.muted};">${escapeHtml(item.medium)} | Qty ${escapeHtml(item.quantity)}</span>
              </td>
              <td align="right" style="padding:13px 0;border-bottom:1px solid ${brand.line};font:700 14px Arial,sans-serif;color:${brand.ink};white-space:nowrap;">
                ${escapeHtml(formatMoney(item.price))}
              </td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}

export async function sendContactEmails(input: ContactEmailInput) {
  const adminHtml = renderLayout({
    preview: `New ${input.topic} enquiry from ${input.name}.`,
    kicker: "Collector Enquiry",
    title: "New website message",
    intro: "A collector has sent a message from the NURALUXURYART contact page.",
    content: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        ${renderField("Name", input.name)}
        ${renderField("Email", input.email)}
        ${renderField("Phone", input.phone)}
        ${renderField("Topic", input.topic)}
        ${renderField("Message", input.message)}
      </table>
    `,
  });

  const customerHtml = renderLayout({
    preview: "We received your NURALUXURYART enquiry.",
    kicker: "Message Received",
    title: `Thank you, ${input.name}`,
    intro:
      "Your enquiry has reached our collector care desk. We will review the details and respond with thoughtful guidance.",
    content: `
      <p style="margin:0 0 16px;">For urgent artwork availability or delivery questions, you can also reach us on WhatsApp:</p>
      ${renderButton("Speak with us on WhatsApp", siteConfig.contact.whatsappHref)}
    `,
  });

  await Promise.all([
    sendEmailSafely("contact-admin", {
      to: getAdminNotifyEmail(),
      replyTo: input.email,
      subject: `New NURALUXURYART enquiry: ${input.topic}`,
      html: adminHtml,
      text: textFromHtml(adminHtml),
    }),
    sendEmailSafely("contact-customer", {
      to: input.email,
      subject: "We received your NURALUXURYART enquiry",
      html: customerHtml,
      text: textFromHtml(customerHtml),
    }),
  ]);
}

export async function sendCheckoutRequestEmails(input: CheckoutEmailInput) {
  const deliverySummary = [
    input.deliveryAddress,
    input.deliveryCity,
    input.deliveryState,
    input.deliveryCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const adminHtml = renderLayout({
    preview: `New checkout request from ${input.customerName}.`,
    kicker: "Priority Order Request",
    title: "New artwork checkout request",
    intro: "A collector has submitted delivery details and selected artworks for purchase follow-up.",
    content: `
      <p style="margin:0 0 12px;"><strong>Request ID:</strong> ${escapeHtml(input.requestId)}</p>
      ${renderItems(input.items)}
      <p style="margin:18px 0 26px;font:700 17px Arial,sans-serif;color:${brand.ink};">Estimated total: ${escapeHtml(formatMoney(input.totalAmount))}</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        ${renderField("Collector", input.customerName)}
        ${renderField("Email", input.customerEmail)}
        ${renderField("Phone", input.customerPhone)}
        ${renderField("Delivery", input.deliveryPreference)}
        ${renderField("Address", deliverySummary)}
        ${renderField("Landmark", input.deliveryLandmark)}
        ${renderField("Note", input.deliveryNote)}
      </table>
    `,
  });

  const customerHtml = renderLayout({
    preview: "Your artwork request has been received.",
    kicker: "Checkout Request",
    title: "Your request is with our collector care team",
    intro:
      "We received your selected artwork request. Our team will confirm availability, delivery handling, and the secure payment next step before final purchase.",
    content: `
      ${renderItems(input.items)}
      <p style="margin:18px 0 20px;font:700 17px Arial,sans-serif;color:${brand.ink};">Estimated total: ${escapeHtml(formatMoney(input.totalAmount))}</p>
      <p style="margin:0;">Delivery noted for ${escapeHtml(deliverySummary)}.</p>
      ${renderButton("Speak with collector care", siteConfig.contact.whatsappHref)}
    `,
  });

  await Promise.all([
    sendEmailSafely("checkout-admin", {
      to: getAdminNotifyEmail(),
      replyTo: input.customerEmail,
      subject: `New NURALUXURYART checkout request: ${input.customerName}`,
      html: adminHtml,
      text: textFromHtml(adminHtml),
    }),
    sendEmailSafely("checkout-customer", {
      to: input.customerEmail,
      subject: "Your NURALUXURYART artwork request was received",
      html: customerHtml,
      text: textFromHtml(customerHtml),
    }),
  ]);
}

export async function sendNewsletterWelcomeEmail(email: string) {
  const html = renderLayout({
    preview: "Welcome to the NURALUXURYART collector list.",
    kicker: "Collector List",
    title: "Stay inspired, stay refined",
    intro:
      "You are now on the NURALUXURYART collector list for new hand-painted Turkish artwork releases, gallery notes, and private collection updates.",
    content: `
      <p style="margin:0 0 16px;">We will keep updates considered and occasional, with a focus on pieces that bring texture, presence, and timeless elegance into refined interiors.</p>
      ${renderButton("Explore current artworks", `${siteConfig.url}/#featured-artworks`)}
    `,
  });

  await sendEmailSafely("newsletter-welcome", {
    to: email,
    subject: "Welcome to the NURALUXURYART collector list",
    html,
    text: textFromHtml(html),
  });
}

export async function sendReviewInvitationEmail(input: ReviewInvitationInput) {
  const artworkTitle = input.artworkTitle || "your NURALUXURYART piece";
  const html = renderLayout({
    preview: "Share your NURALUXURYART experience.",
    kicker: "Review Request",
    title: `How did ${artworkTitle} feel in your space?`,
    intro:
      "Thank you for collecting with NURALUXURYART. Your private review helps future collectors understand the presence, texture, and service behind the work.",
    content: `
      <p style="margin:0 0 16px;">Hello ${escapeHtml(input.customerName)}, we would be grateful for a short rating and note about your experience.</p>
      ${renderButton("Leave a private review", input.reviewUrl)}
    `,
  });

  await sendEmailSafely("review-invitation", {
    to: input.customerEmail,
    subject: "Share your NURALUXURYART experience",
    html,
    text: textFromHtml(html),
  });
}
