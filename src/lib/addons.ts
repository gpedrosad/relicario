export const RELICARIO_PRECIO = 34_990;
export const RELICARIO_PRECIO_TACHADO = 49_990;

export type Addon = {
  id: string;
  name: string;
  description: string;
  price: number;
  conflictsWith?: readonly string[];
};

export type RelicarioVersion = {
  id: string;
  name: string;
  blurb: string;
};

/** Precio de vitrina, dentro del rango de cada extra. */
export const ADDONS: readonly Addon[] = [
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

export const VERSIONES: readonly RelicarioVersion[] = [
  {
    id: "clasica",
    name: "Clásica",
    blurb: "Sube tu foto y mírala dentro del relicario. Pieza única hecha a mano, perfecta para guardar lo más valioso o para regalar.",
  },
  {
    id: "memorial",
    name: "Memorial",
    blurb: "Presentación más sobria para recordar a un familiar o a una mascota. El relicario es el mismo; cambia el tono de la caja y la tarjeta.",
  },
  {
    id: "pareja",
    name: "Pareja",
    blurb: "El mismo relicario, con packaging, tarjeta y mensaje pensados para dos.",
  },
  {
    id: "madre",
    name: "Madre",
    blurb: "El mismo relicario, con packaging y tarjeta para mamá.",
  },
  {
    id: "hija",
    name: "Hija",
    blurb: "El mismo relicario, con packaging y tarjeta para una hija.",
  },
  {
    id: "mascota",
    name: "Mascota",
    blurb: "El mismo relicario, con packaging y tarjeta para recordar a tu mascota.",
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

export function versionById(id: string) {
  return VERSIONES.find((item) => item.id === id) ?? VERSIONES[0];
}
