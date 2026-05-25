import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://nuraluxuryart.vercel.app"),
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
