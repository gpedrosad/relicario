export const FINISHES = ["dorado", "plateado"] as const;
export type RelicarioFinish = (typeof FINISHES)[number];

export const FINISH_DEFAULT: RelicarioFinish = "dorado";

export const FINISH_LABEL: Record<RelicarioFinish, string> = {
  dorado: "Dorado",
  plateado: "Plateado",
};

export const RELICARIO_DORADO_SRC = "/relicario-colgante.png";
export const RELICARIO_PLATA_SRC = "/relicario-colgante-plata.png";
export const RELICARIO_DORADO_EDITORIAL_SRC = "/images/relicario-dorado-editorial-wide.png";
export const RELICARIO_PLATA_EDITORIAL_SRC = "/images/relicario-plateado-editorial-wide.png";

export function isRelicarioFinish(value: unknown): value is RelicarioFinish {
  return value === "dorado" || value === "plateado";
}

export function overlaySrc(finish: RelicarioFinish) {
  return finish === "dorado" ? RELICARIO_DORADO_SRC : RELICARIO_PLATA_SRC;
}

export type GalleryItem = {
  id: string;
  src: string;
  label: string;
  finish?: RelicarioFinish;
};

export const LANDING_GALLERY: readonly GalleryItem[] = [
  {
    id: "hero",
    src: "/relicario-hero.jpg",
    label: "Puesto",
  },
  {
    id: "dorado",
    src: RELICARIO_DORADO_EDITORIAL_SRC,
    label: "Dorado",
    finish: "dorado",
  },
  {
    id: "plateado",
    src: RELICARIO_PLATA_EDITORIAL_SRC,
    label: "Plateado",
    finish: "plateado",
  },
];
