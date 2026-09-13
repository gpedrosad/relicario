export const RELICARIO_PRECIO = 34_990;
export const RELICARIO_PRECIO_TACHADO = 49_990;
export const LLAVERO_ADDON_ID = "llavero";
export const LLAVERO_PRECIO = 8_990;

export type Addon = {
  id: string;
  name: string;
  description: string;
  price: number;
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
    id: "caja-premium",
    name: "Caja de regalo premium",
    description: "Rígida, con espuma o terciopelo.",
    price: 4_990,
    conflictsWith: ["pack-regalo"],
  },
  {
    id: "tarjeta",
    name: "Tarjeta personalizada",
    description: "Mensaje impreso con un diseño cuidado.",
    price: 1_990,
    conflictsWith: ["pack-regalo"],
  },
  {
    id: "foto-extra",
    name: "Foto impresa extra",
    description: "2 o 3 copias pequeñas de respaldo.",
    price: 2_000,
  },
  {
    id: "pack-regalo",
    name: "Pack regalo listo",
    description: "Caja, tarjeta y bolsa. Listo para entregar.",
    price: 5_990,
    conflictsWith: ["caja-premium", "tarjeta"],
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
