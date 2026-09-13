import {
  ADDONS,
  RELICARIO_PRECIO,
  addonsTotal,
} from "@/lib/addons";
import type { TiendaLocal } from "@/lib/local-project";
import { FINISH_DEFAULT, FINISH_LABEL, isRelicarioFinish } from "@/lib/relicario-finish";

export const ENVIO_COBRADO = 2_000;
/** Subtotal que desbloquea envío gratis: relicario + llavero, o ~$8.000 en extras. */
export const ENVIO_GRATIS_DESDE = 42_990;

export type CheckoutFrom = "wow" | "comprar" | "carrito";

export const CHECKOUT_FROM_LABEL: Record<CheckoutFrom, string> = {
  wow: "Comprar este relicario",
  comprar: "Comprar ahora",
  carrito: "Añadir al carrito",
};

export function parseCheckoutFrom(value: string | null): CheckoutFrom | null {
  if (value === "wow" || value === "comprar" || value === "carrito") {
    return value;
  }
  return null;
}

export function checkoutHref(from: CheckoutFrom) {
  return `/checkout?from=${from}`;
}

export const BEFORE_CHECKOUT_EVENT = "relicario:before-checkout";

export type BeforeCheckoutDetail = {
  from: CheckoutFrom;
};

/** Si alguien cancela el evento (modal del llavero), no navega. */
export function requestCheckout(
  from: CheckoutFrom,
  navigate: (href: string) => void,
) {
  if (typeof window === "undefined") {
    navigate(checkoutHref(from));
    return;
  }
  const allowed = window.dispatchEvent(
    new CustomEvent<BeforeCheckoutDetail>(BEFORE_CHECKOUT_EVENT, {
      cancelable: true,
      detail: { from },
    }),
  );
  if (allowed) navigate(checkoutHref(from));
}

export type CheckoutLine = {
  id: string;
  name: string;
  detail: string;
  price: number;
};

export function checkoutLines(tienda: TiendaLocal): CheckoutLine[] {
  const extras = tienda.selected.flatMap((id) => {
    const addon = ADDONS.find((item) => item.id === id);
    if (!addon) return [];
    return [
      {
        id: addon.id,
        name: addon.name,
        detail: "Extra",
        price: addon.price,
      },
    ];
  });

  return [
    {
      id: "relicario",
      name: "Relicario de acero inoxidable",
      detail: `Acabado ${FINISH_LABEL[isRelicarioFinish(tienda.finish) ? tienda.finish : FINISH_DEFAULT]} · pieza con tu foto`,
      price: RELICARIO_PRECIO,
    },
    ...extras,
  ];
}

export function envioPorSubtotal(subtotal: number) {
  const falta = Math.max(0, ENVIO_GRATIS_DESDE - subtotal);
  const gratis = falta === 0;
  return {
    envio: gratis ? 0 : ENVIO_COBRADO,
    gratis,
    falta,
  };
}

export function checkoutTotals(tienda: Pick<TiendaLocal, "selected">) {
  const subtotal = RELICARIO_PRECIO + addonsTotal(tienda.selected);
  const { envio, gratis, falta } = envioPorSubtotal(subtotal);
  return {
    subtotal,
    envio,
    gratis,
    falta,
    total: subtotal + envio,
  };
}
