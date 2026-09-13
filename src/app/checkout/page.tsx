import { Suspense } from "react";
import ShopifyCheckout from "@/components/ShopifyCheckout";

export const metadata = {
  title: "Checkout — Relicario",
  description: "Simulación del checkout de Shopify. No cobra.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Suspense>
      <ShopifyCheckout />
    </Suspense>
  );
}
