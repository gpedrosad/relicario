export const RELICARIO_PRECIO = 34_990;
export const RELICARIO_PRECIO_TACHADO = 49_990;
export const LLAVERO_ADDON_ID = "llavero";
export const LLAVERO_PRECIO = 8_990;
export const PACK_REGALO_ID = "pack-regalo";
export const PACK_REGALO_PRECIO = 2_990;
export const PACK_REGALO_SRC = "/images/pack-regalo.jpg";
export const SEGUNDA_UNIDAD_ID = "segunda-unidad";
export const SEGUNDA_UNIDAD_PRECIO = 19_990;
export const FEATURED_OFFER_IDS = [SEGUNDA_UNIDAD_ID, PACK_REGALO_ID] as const;

export type Addon = {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  conflictsWith?: readonly string[];
};

/** Precio de vitrina, dentro del rango de cada extra. */
export const ADDONS: readonly Addon[] = [
  {
    id: LLAVERO_ADDON_ID,
    name: "Llavero con tu foto",
    description: "La misma foto, lista en un llavero de acero inoxidable.",
    price: LLAVERO_PRECIO,
  },
  {
    id: SEGUNDA_UNIDAD_ID,
    name: "Segundo relicario",
    description: "Otra pieza, mismo acabado. Suma envío gratis.",
    price: SEGUNDA_UNIDAD_PRECIO,
    compareAtPrice: RELICARIO_PRECIO,
    image: "/relicario-colgante.png",
  },
  {
    id: "segunda-foto",
    name: "Segunda foto",
    description: "Una imagen en cada lado del relicario.",
    price: 2_990,
  },
  {
    id: "cadena-premium",
    name: "Cadena premium",
    description: "Más gruesa, más larga o con mejor terminación.",
    price: 5_990,
  },
  {
    id: "tarjeta",
    name: "Tarjeta personalizada",
    description: "Mensaje impreso con un diseño cuidado.",
    price: 1_990,
  },
  {
    id: "foto-extra",
    name: "Foto impresa extra",
    description: "2 o 3 copias pequeñas de respaldo.",
    price: 2_000,
  },
  {
    id: PACK_REGALO_ID,
    name: "Pack para regalo",
    description: "Caja rígida y bolsa. Listo para entregar.",
    price: PACK_REGALO_PRECIO,
    compareAtPrice: 6_990,
    image: PACK_REGALO_SRC,
  },
  {
    id: "entrega-prioritaria",
    name: "Entrega prioritaria",
    description: "Producción y despacho más rápido.",
    price: 3_990,
  },
] as const;

export function toggleAddon(
  selected: readonly string[],
  id: string,
): string[] {
  const addon = ADDONS.find((item) => item.id === id);
  if (!addon) return [...selected];

  if (selected.includes(id)) {
    return selected.filter((item) => item !== id);
  }

  const blocked = new Set(addon.conflictsWith ?? []);
  return [
    ...selected.filter((item) => {
      if (blocked.has(item)) return false;
      const other = ADDONS.find((entry) => entry.id === item);
      return !other?.conflictsWith?.includes(id);
    }),
    id,
  ];
}

export function isFeaturedOffer(id: string) {
  return (FEATURED_OFFER_IDS as readonly string[]).includes(id);
}

export function addonsTotal(selected: readonly string[]) {
  return selected.reduce((sum, id) => {
    const addon = ADDONS.find((item) => item.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);
}

export function formatClp(value: number) {
  const sign = value < 0 ? "-" : "";
  const grouped = Math.round(Math.abs(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}$${grouped}`;
}
