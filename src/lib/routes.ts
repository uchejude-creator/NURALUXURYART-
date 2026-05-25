export const routes = {
  home: "/",
  collections: "/collections",
  collection: (slug: string) => `/collections/${slug}`,
  artwork: (slug: string) => `/artworks/${slug}`,
  privacy: "/privacy-policy",
} as const;
