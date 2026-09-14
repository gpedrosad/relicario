import { Suspense } from "react";
import CompletarPedido from "@/components/CompletarPedido";

export const metadata = {
  title: "Completa tu pedido — Relicario",
  description: "Suma extras antes de pagar.",
  robots: { index: false, follow: false },
};

export default function CompletarPage() {
  return (
    <Suspense>
      <CompletarPedido />
    </Suspense>
  );
}
