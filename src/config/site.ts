export const siteConfig = {
  name: "NURALUXURYART",
  url: "https://nuraluxuryart.com",
  description:
    "Luxury hand-painted artworks from Turkey, curated for refined interiors, collectors, and gallery-led spaces.",
  tagline: "Hand-painted in Turkey, curated for the world.",
  locale: "en",
  currency: "NGN",
  contact: {
    email: "nuraluxuryng@gmail.com",
    phone: "+234 706 941 1946",
    phoneHref: "tel:+2347069411946",
    whatsappHref: "https://wa.me/2347069411946",
    location: "Lagos, Nigeria",
    responseTime: "Collector enquiries are usually answered within one business day.",
  },
  nav: [
    { label: "Shop", href: "/#featured-artworks" },
    { label: "Gallery", href: "/#curated-collections" },
    { label: "Our Story", href: "/#our-story" },
    { label: "Contact", href: "/contact" },
  ],
  footerGroups: [
    {
      title: "Company",
      links: [
        { label: "About NURALUXURYART", href: "/#our-story" },
        { label: "Our Story", href: "/#our-story" },
        { label: "Custom Orders", href: "/#collector-care" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Gallery",
      links: [
        { label: "Acrylic Statements", href: "/collections/acrylic-statements" },
        { label: "Abstract Editions", href: "/collections/abstract-editions" },
        { label: "Interior Gallery Pieces", href: "/collections/interior-gallery-pieces" },
        { label: "Our Works", href: "/collections/our-works" },
      ],
    },
    {
      title: "Collector Care",
      links: [
        { label: "Shipping & Returns", href: "/shipping-returns" },
        { label: "Authenticity", href: "/authenticity" },
        { label: "Care Guide", href: "/care-guide" },
      ],
    },
  ],
  socialLinks: [
    { label: "Instagram", href: "https://www.instagram.com/nuraluxury_ng?igsh=N2w4ZXRpZW8zOXdo" },
    { label: "TikTok", href: "https://www.tiktok.com/@nuraluxuryart?_r=1&_t=ZS-974Y8NtS31Q" },
    { label: "WhatsApp", href: "https://wa.me/2347069411946" },
  ],
} as const;
