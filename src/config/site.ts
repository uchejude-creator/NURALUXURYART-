export const siteConfig = {
  name: "NURALUXURYART",
  url: "https://nuraluxuryart.vercel.app",
  description:
    "Luxury hand-painted artworks from Turkey, curated for refined interiors, collectors, and gallery-led spaces.",
  tagline: "Hand-painted in Turkey, curated for the world.",
  locale: "en",
  currency: "NGN",
  nav: [
    { label: "Shop", href: "#featured-artworks" },
    { label: "Gallery", href: "#curated-collections" },
    { label: "Our Story", href: "#our-story" },
    { label: "Contact", href: "#contact" },
  ],
  footerGroups: [
    {
      title: "Company",
      links: [
        { label: "About NURALUXURYART", href: "#our-story" },
        { label: "Our Story", href: "#our-story" },
        { label: "Custom Orders", href: "#collector-care" },
        { label: "Contact", href: "#contact" },
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
    { label: "Instagram", href: "#" },
    { label: "Facebook", href: "#" },
    { label: "TikTok", href: "#" },
    { label: "X", href: "#" },
    { label: "WhatsApp", href: "#" },
  ],
} as const;
