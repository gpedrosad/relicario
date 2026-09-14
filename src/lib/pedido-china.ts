import { ADDONS } from "@/lib/addons";
import { COSTO_BOLSA, COSTO_CAJA } from "@/lib/costos";

/** Primer vuelo de prueba. Decisión: docs/learn/decisiones.md */
export const PEDIDO_CHINA_PIEZAS = 50;

export type LineaPedido = {
  id: string;
  name: string;
  qty: number;
  attachPct: number;
  origin: "china" | "chile";
  note: string;
  unitCost?: number;
};

function pedir(piezas: number, attachPct: number, spare = 0) {
  const demanda = Math.ceil((Math.max(0, piezas) * Math.max(0, attachPct)) / 100);
  return Math.min(Math.max(0, piezas), demanda + Math.max(0, spare));
}

/**
 * Qué viaja en el primer avión vs qué se hace en Chile.
 * Attach: tesorería de un test, no un forecast de escala.
 * La caja rígida solo viaja para el pack. No hay caja suelta.
 */
export function armarPedidoChina(piezas = PEDIDO_CHINA_PIEZAS): {
  piezas: number;
  china: LineaPedido[];
  chile: LineaPedido[];
  totalUnidadesChina: number;
  totalCostoConocidoChina: number;
} {
  const cadena = ADDONS.find((item) => item.id === "cadena-premium");
  const pack = ADDONS.find((item) => item.id === "pack-regalo");
  const segunda = ADDONS.find((item) => item.id === "segunda-foto");
  const tarjeta = ADDONS.find((item) => item.id === "tarjeta");
  const foto = ADDONS.find((item) => item.id === "foto-extra");
  const express = ADDONS.find((item) => item.id === "entrega-prioritaria");

  const china: LineaPedido[] = [
    {
      id: "relicario",
      name: "Relicario + cadena estándar",
      qty: piezas,
      attachPct: 100,
      origin: "china",
      note: "Un SKU de metal. Las versiones (memorial, pareja…) son packaging local.",
    },
    {
      id: "cadena-premium",
      name: cadena?.name ?? "Cadena premium",
      qty: pedir(piezas, 20, 2),
      attachPct: 20,
      origin: "china",
      note: "20% de attach + 2 de falla. Si pega más, el segundo vuelo tarda 10 días.",
    },
    {
      id: "caja-rigida",
      name: `Caja rígida (${pack?.name ?? "pack regalo"})`,
      qty: pedir(piezas, 20, 2),
      attachPct: 20,
      origin: "china",
      unitCost: COSTO_CAJA,
      note: "Solo el pack. Misma demanda que la bolsa. No hay caja suelta.",
    },
    {
      id: "bolsa-regalo",
      name: "Bolsa de tela (pack regalo)",
      qty: pedir(piezas, 20, 2),
      attachPct: 20,
      origin: "china",
      unitCost: COSTO_BOLSA,
      note: "Solo el pack lleva bolsa. Tarjeta del pack se imprime acá.",
    },
  ];

  const chile: LineaPedido[] = [
    {
      id: "segunda-foto",
      name: segunda?.name ?? "Segunda foto",
      qty: 0,
      attachPct: 25,
      origin: "chile",
      note: "Misma pieza, dos papeles. Se imprime a pedido (~25% de las ventas).",
    },
    {
      id: "tarjeta",
      name: tarjeta?.name ?? "Tarjeta",
      qty: 0,
      attachPct: 35,
      origin: "chile",
      note: "Sola o dentro del pack. Imprimir a pedido; no viaja.",
    },
    {
      id: "foto-extra",
      name: foto?.name ?? "Foto extra",
      qty: 0,
      attachPct: 12,
      origin: "chile",
      note: "Copias chicas locales. ~6 de 50 si se venden todas.",
    },
    {
      id: "entrega-prioritaria",
      name: express?.name ?? "Entrega prioritaria",
      qty: 0,
      attachPct: 10,
      origin: "chile",
      note: "Courier, no hay SKU.",
    },
  ];

  return {
    piezas,
    china,
    chile,
    totalUnidadesChina: china.reduce((sum, row) => sum + row.qty, 0),
    totalCostoConocidoChina: china.reduce(
      (sum, row) => sum + (row.unitCost ?? 0) * row.qty,
      0,
    ),
  };
}
