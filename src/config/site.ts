export const siteConfig = {
  name: "NURALUXURYART",
  url: "https://nuraluxuryart.vercel.app",
  description:
    "Luxury hand-painted artworks from Turkey, curated for refined interiors, collectors, and gallery-led spaces.",
  tagline: "Hand-painted in Turkey, curated for the world.",
  locale: "en",
  currency: "NGN",
  contact: {
    email: "hello@nuraluxuryart.com",
    phone: "+234 000 000 0000",
    phoneHref: "tel:+2340000000000",
    whatsappHref: "https://wa.me/2340000000000",
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
    { label: "Instagram", href: "/contact" },
    { label: "Facebook", href: "/contact" },
    { label: "TikTok", href: "/contact" },
    { label: "X", href: "/contact" },
    { label: "WhatsApp", href: "/contact" },
  ],
} as const;
