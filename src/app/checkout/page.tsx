import type { Metadata } from "next";

import { CheckoutClient } from "@/components/checkout/checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review selected NURALUXURYART pieces before requesting purchase details.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
