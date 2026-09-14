import { RELICARIO_PRECIO, RELICARIO_PRECIO_TACHADO } from "@/lib/addons";

export const product = {
  id: "relicario-corazon",
  name: "Relicario personalizado con foto",
  priceClp: RELICARIO_PRECIO,
  compareAtPriceClp: RELICARIO_PRECIO_TACHADO,
  rating: 4.9,
  reviewCount: 0,
  eyebrow: "Lo importante, siempre cerca",
  description: "Sube la foto. La ves en el corazón. Si te gusta, la compras.",
  images: [
    { src: "/relicario-hero.jpg", alt: "Relicario dorado puesto" },
    { src: "/relicario-colgante.png", alt: "Relicario dorado" },
    { src: "/relicario-colgante-plata.png", alt: "Relicario plateado" },
  ],
} as const;
