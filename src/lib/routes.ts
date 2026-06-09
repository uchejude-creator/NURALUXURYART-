export const routes = {
  home: "/",
  collections: "/collections",
  collection: (slug: string) => `/collections/${slug}`,
  artwork: (slug: string) => `/artworks/${slug}`,
  checkout: "/checkout",
  contact: "/contact",
  authenticity: "/authenticity",
  careGuide: "/care-guide",
  privacy: "/privacy-policy",
  shippingReturns: "/shipping-returns",
} as const;
