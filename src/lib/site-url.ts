import { siteConfig } from "@/config/site";

export function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getConfiguredSiteUrl() {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? siteConfig.url);
}

export function isLocalOrigin(value: string | null) {
  if (!value) {
    return false;
  }

  try {
    const { hostname } = new URL(value);

    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

export function getPublicOrigin(requestOrigin: string | null) {
  if (!requestOrigin || isLocalOrigin(requestOrigin)) {
    return getConfiguredSiteUrl();
  }

  return stripTrailingSlash(requestOrigin);
}
