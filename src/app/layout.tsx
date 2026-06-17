import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { AdminAuthLinkRedirect } from "@/components/auth/admin-auth-link-redirect";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-context";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StorefrontChromeGuard } from "@/components/layout/storefront-chrome-guard";
import { ScrollRestoration } from "@/components/motion/scroll-restoration";
import { siteConfig } from "@/config/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "NURALUXURYART | Luxury Hand-Painted Art",
    template: "%s | NURALUXURYART",
  },
  description:
    "NURALUXURYART offers hand-painted Turkish artworks curated for refined interiors, collectors, and gallery-led spaces.",
  keywords: [
    "NURALUXURYART",
    "luxury art",
    "hand-painted Turkish artwork",
    "acrylic art",
    "gallery art",
    "collectible artwork",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <AdminAuthLinkRedirect />
          <ScrollRestoration />
          <StorefrontChromeGuard>
            <SiteHeader />
          </StorefrontChromeGuard>
          {children}
          <StorefrontChromeGuard>
            <SiteFooter />
            <CartDrawer />
          </StorefrontChromeGuard>
        </CartProvider>
      </body>
    </html>
  );
}
