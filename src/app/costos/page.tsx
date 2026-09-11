import CostosDashboard from "@/components/CostosDashboard";

export const metadata = {
  title: "Costos — Relicario",
  description: "Análisis de costos, ads y utilidad del relicario.",
  robots: { index: false, follow: false },
};

export default function CostosPage() {
  return <CostosDashboard />;
}
