export type CostosInput = {
  ticket: number;
  pieza: number;
  envioCobrado: number;
  courier: number;
  empaque: number;
  shopifyPct: number;
  mercadoPagoPct: number;
  devolucionesPct: number;
  previewsPorVenta: number;
  costoPreview: number;
  cpc: number;
  conversionWebPct: number;
  cpa: number;
  pautaMensual: number;
  objetivoUtilidad: number;
  ventasDia: number;
};

export const COSTOS_DEFAULT: CostosInput = {
  ticket: 34_990,
  pieza: 4_500,
  envioCobrado: 2_000,
  courier: 4_000,
  empaque: 1_500,
  shopifyPct: 2,
  mercadoPagoPct: 3.8,
  devolucionesPct: 1,
  previewsPorVenta: 4,
  costoPreview: 100,
  cpc: 200,
  conversionWebPct: 1,
  cpa: 16_807,
  pautaMensual: 800_000,
  objetivoUtilidad: 1_000_000,
  ventasDia: 2,
};

export const TICKET_PRESETS = [24_990, 29_990, 34_990, 39_990, 44_990, 49_990];
export const CPA_PRESETS = [6_000, 9_000, 12_000, 15_000, 20_000];
export const PAUTA_PRESETS = [300_000, 500_000, 800_000, 1_000_000, 2_000_000];
export const OBJETIVO_PRESETS = [250_000, 500_000, 1_000_000, 2_000_000, 5_000_000];
export const VENTAS_DIA_PRESETS = [1, 2, 3, 5, 8, 10];
export const CPC_PRESETS = [150, 200, 250, 300, 400, 600];
export const CONVERSION_PRESETS = [1, 1.5, 2, 2.5, 3, 5];
export const DIAS_MES = 30;
export const IVA_PCT = 19;

export function sinIva(bruto: number) {
  return Math.max(0, bruto) / (1 + IVA_PCT / 100);
}

export function comisionTotalPct(input: Pick<CostosInput, "shopifyPct" | "mercadoPagoPct">) {
  return Math.max(0, input.shopifyPct) + Math.max(0, input.mercadoPagoPct);
}

export function cpaDesdeAds(cpc: number, conversionWebPct: number) {
  const conversion = Math.max(0, conversionWebPct) / 100;
  if (conversion <= 0) return Number.POSITIVE_INFINITY;
  return Math.max(0, cpc) / conversion;
}

export function conversionDesdeCpa(cpc: number, cpa: number) {
  if (cpa <= 0) return 0;
  return (Math.max(0, cpc) / cpa) * 100;
}

export function aplicarFunnel(
  input: CostosInput,
  cambio: Partial<Pick<CostosInput, "cpc" | "conversionWebPct" | "cpa">>,
): CostosInput {
  const next = { ...input, ...cambio };
  if (cambio.cpa !== undefined && cambio.conversionWebPct === undefined) {
    next.conversionWebPct = conversionDesdeCpa(sinIva(next.cpc), cambio.cpa);
  }
  const derivado = cpaDesdeAds(sinIva(next.cpc), next.conversionWebPct);
  next.cpa = Number.isFinite(derivado) ? derivado : 0;
  return next;
}

export function aplicarMargen(input: CostosInput, margenPct: number): CostosInput {
  const row = analizarCostos(input);
  const techo = row.ingreso > 0 ? row.contribucion / row.ingreso : 0;
  const objetivo = Number.isFinite(margenPct) ? margenPct / 100 : 0;
  const acotado = Math.min(objetivo, techo);
  const cpa = row.contribucion - row.ingreso * acotado;
  return aplicarFunnel(input, { cpa: Math.max(0, cpa) });
}

export type Health = "excelente" | "sano" | "justo" | "riesgo" | "quiebre";

export const HEALTH_LABEL: Record<Health, string> = {
  excelente: "Excelente",
  sano: "Sano",
  justo: "Justo",
  riesgo: "Riesgo",
  quiebre: "Quiebre",
};

const HEALTH_RANK: Record<Health, number> = {
  excelente: 0,
  sano: 1,
  justo: 2,
  riesgo: 3,
  quiebre: 4,
};

export function worstHealth(...items: Health[]): Health {
  return items.reduce((a, b) => (HEALTH_RANK[b] > HEALTH_RANK[a] ? b : a));
}

function band(
  value: number,
  cuts: [number, number, number, number],
  higherIsBetter: boolean,
): Health {
  const levels: Health[] = ["excelente", "sano", "justo", "riesgo", "quiebre"];
  if (!Number.isFinite(value)) return "quiebre";
  const steps = higherIsBetter
    ? [value >= cuts[0], value >= cuts[1], value >= cuts[2], value >= cuts[3]]
    : [value <= cuts[0], value <= cuts[1], value <= cuts[2], value <= cuts[3]];
  const index = steps.findIndex(Boolean);
  return levels[index === -1 ? 4 : index];
}

export type LineaCosto = {
  id: string;
  label: string;
  amount: number;
  pctCobro: number;
  health: Health;
  note: string;
};

export type CostosAnalisis = {
  cobroCliente: number;
  ingreso: number;
  ingresoNeto: number;
  comision: number;
  ia: number;
  piezaNeta: number;
  courierTotal: number;
  envioNeto: number;
  reservaDevolucion: number;
  contribucion: number;
  utilidad: number;
  costoVariable: number;
  quiebreCpa: number;
  roas: number;
  ventasMes: number;
  utilidadMes: number;
  ventasMesDia: number;
  ingresoDia: number;
  utilidadDia: number;
  ingresoMesDia: number;
  utilidadMesDia: number;
  pautaMesDia: number;
  cpc: number;
  conversionWebPct: number;
  cpa: number;
  clicksPorVenta: number;
  clicksDia: number;
  clicksMes: number;
  ventasParaObjetivo: number | null;
  pautaParaObjetivo: number | null;
  stockParaObjetivo: number | null;
  margenContribPct: number;
  margenUtilidadPct: number;
  cpaSobreContribPct: number;
  saludModelo: Health;
  lecturaModelo: string;
  lineas: LineaCosto[];
  partesPeso: { id: string; label: string; amount: number; color: string }[];
  capasMargen: CapaMargen[];
};

export type CapaMargen = {
  id: string;
  label: string;
  utilidad: number;
  margenPct: number;
  health: Health;
  note: string;
};

export function analizarCostos(input: CostosInput): CostosAnalisis {
  const r = Math.max(0, input.devolucionesPct) / 100;
  const cobroCliente = Math.max(0, input.ticket) + Math.max(0, input.envioCobrado);
  const ticketNeto = sinIva(input.ticket);
  const envioCobradoNeto = sinIva(input.envioCobrado);
  const ingreso = ticketNeto + envioCobradoNeto;
  const pieza = sinIva(input.pieza);
  const courier = sinIva(input.courier);
  const empaque = sinIva(input.empaque);
  const cpcNeto = sinIva(input.cpc);
  const comisionPct = comisionTotalPct(input);
  const comision = cobroCliente * (comisionPct / 100);
  const ia = Math.max(0, input.previewsPorVenta) * Math.max(0, input.costoPreview);
  const ingresoNeto = ingreso * (1 - r);
  const piezaNeta = pieza * (1 - r);
  const courierTotal = courier * (1 + r);
  const costoVariable = piezaNeta + courierTotal + empaque + comision + ia;
  const contribucion = ingresoNeto - costoVariable;
  const reservaDevolucion = ingreso * r + courier * r;
  const cpaRaw = cpaDesdeAds(cpcNeto, input.conversionWebPct);
  const cpa = Number.isFinite(cpaRaw) ? cpaRaw : 0;
  const conversion = Math.max(0, input.conversionWebPct) / 100;
  const clicksPorVenta = conversion > 0 ? 1 / conversion : 0;
  const utilidad = contribucion - cpa;
  const envioNeto = courier - envioCobradoNeto;
  const quiebreCpa = contribucion;
  const roas = cpa > 0 ? ingreso / cpa : Infinity;
  const ventasMes =
    cpa > 0 ? Math.floor(sinIva(input.pautaMensual) / cpa) : 0;
  const utilidadMes = ventasMes * utilidad;
  const ventasDia = Math.max(0, input.ventasDia);
  const ventasMesDia = ventasDia * DIAS_MES;
  const ingresoDia = ventasDia * ingreso;
  const utilidadDia = ventasDia * utilidad;
  const ingresoMesDia = ventasMesDia * ingreso;
  const utilidadMesDia = ventasMesDia * utilidad;
  const pautaMesDia = ventasMesDia * Math.max(0, cpa);
  const clicksDia = ventasDia * clicksPorVenta;
  const clicksMes = ventasMesDia * clicksPorVenta;
  const ventasParaObjetivo =
    utilidad > 0 ? Math.ceil(Math.max(0, input.objetivoUtilidad) / utilidad) : null;
  const pautaParaObjetivo =
    ventasParaObjetivo !== null ? ventasParaObjetivo * cpa : null;
  const stockParaObjetivo =
    ventasParaObjetivo !== null ? ventasParaObjetivo * pieza : null;

  const denom = ingreso > 0 ? ingreso : 1;
  const pct = (amount: number) => amount / denom;
  const margenContribPct = contribucion / denom;
  const margenUtilidadPct = utilidad / denom;
  const cpaSobreContribPct =
    contribucion > 0 ? cpa / contribucion : cpa > 0 ? Infinity : 0;

  const healthUtilidad = band(margenUtilidadPct, [0.3, 0.2, 0.1, 0], true);
  const healthContrib = band(margenContribPct, [0.55, 0.4, 0.25, 0.1], true);
  const healthCpa = band(
    Number.isFinite(cpaSobreContribPct) ? cpaSobreContribPct : 9,
    [0.45, 0.65, 0.85, 1],
    false,
  );
  const healthRoas = band(Number.isFinite(roas) ? roas : 0, [4, 3, 2.2, 1.6], true);
  const healthPieza = band(pct(pieza), [0.15, 0.22, 0.3, 0.4], false);
  const healthComision = band(comisionPct, [4, 6, 8, 12], false);
  const healthIa = band(pct(ia), [0.02, 0.05, 0.08, 0.12], false);
  const healthDev = band(input.devolucionesPct, [2, 5, 8, 15], false);
  const healthEnvio = band(pct(Math.max(0, envioNeto)), [0.06, 0.1, 0.15, 0.22], false);
  const healthEmpaque = band(pct(empaque), [0.03, 0.05, 0.08, 0.12], false);
  const healthCpc = band(cpcNeto, [200, 400, 700, 1_200], false);
  const healthConversion = band(input.conversionWebPct, [5, 2.5, 1.5, 0.8], true);

  const saludModelo = worstHealth(healthUtilidad, healthCpa);
  const lecturaModelo = leerModelo(saludModelo, utilidad, quiebreCpa, cpa);

  const despuesPieza = ingresoNeto - piezaNeta;
  const despuesLogistica = despuesPieza - courierTotal - empaque;
  const capasMargen: CapaMargen[] = [
    {
      id: "bruto",
      label: "Después de la pieza",
      utilidad: despuesPieza,
      margenPct: pct(despuesPieza),
      health: band(pct(despuesPieza), [0.7, 0.55, 0.4, 0.25], true),
      note: "Ingreso neto menos el relicario.",
    },
    {
      id: "logistica",
      label: "Después de envío y empaque",
      utilidad: despuesLogistica,
      margenPct: pct(despuesLogistica),
      health: band(pct(despuesLogistica), [0.55, 0.4, 0.25, 0.1], true),
      note: "Menos courier e empaque.",
    },
    {
      id: "contribucion",
      label: "Contribución (antes de ads)",
      utilidad: contribucion,
      margenPct: margenContribPct,
      health: healthContrib,
      note: "Menos comisión, IA y devoluciones.",
    },
    {
      id: "neto",
      label: "Utilidad (después de ads)",
      utilidad,
      margenPct: margenUtilidadPct,
      health: healthUtilidad,
      note: "Lo que queda de verdad.",
    },
  ];

  const lineas: LineaCosto[] = [
    {
      id: "ticket",
      label: "Ticket",
      amount: ticketNeto,
      pctCobro: pct(ticketNeto),
      health: healthContrib,
      note: `Góndola ${clp(input.ticket)} con IVA. Base ${clp(ticketNeto)}.`,
    },
    {
      id: "pieza",
      label: "Pieza",
      amount: pieza,
      pctCobro: pct(pieza),
      health: healthPieza,
      note: `Factura ${clp(input.pieza)} con IVA. Neto ${clp(pieza)}.`,
    },
    {
      id: "envio",
      label: "Envío neto",
      amount: envioNeto,
      pctCobro: pct(envioNeto),
      health: healthEnvio,
      note: `Cobra ${clp(envioCobradoNeto)} y paga ${clp(courier)}, ambos sin IVA.`,
    },
    {
      id: "empaque",
      label: "Empaque",
      amount: empaque,
      pctCobro: pct(empaque),
      health: healthEmpaque,
      note: "Cajita, relleno, sticker.",
    },
    {
      id: "comision",
      label: "Comisión",
      amount: comision,
      pctCobro: pct(comision),
      health: healthComision,
      note: `Shopify ${fmtPct(input.shopifyPct / 100, 1)} + Mercado Pago ${fmtPct(input.mercadoPagoPct / 100, 1)} (3,19% + IVA). Total ${fmtPct(comisionPct / 100, 1)} sobre el cobro con IVA.`,
    },
    {
      id: "ia",
      label: "IA",
      amount: ia,
      pctCobro: pct(ia),
      health: healthIa,
      note: `${input.previewsPorVenta} previews × ${clp(input.costoPreview)}.`,
    },
    {
      id: "devoluciones",
      label: "Devoluciones",
      amount: reservaDevolucion,
      pctCobro: pct(reservaDevolucion),
      health: healthDev,
      note: "Reserva: reembolso + envío de vuelta. La pieza se recupera.",
    },
    {
      id: "cpc",
      label: "CPC",
      amount: cpcNeto,
      pctCobro: pct(cpcNeto),
      health: healthCpc,
      note: `Factura ${clp(input.cpc)} con IVA. Neto ${clp(cpcNeto)}.`,
    },
    {
      id: "conversion",
      label: "Conversión web",
      amount: input.conversionWebPct,
      pctCobro: conversion,
      health: healthConversion,
      note:
        clicksPorVenta > 0
          ? `${fmtNum(clicksPorVenta, 1)} clics por venta.`
          : "Sin conversión no hay ventas de ads.",
    },
    {
      id: "ads",
      label: "Ads (CPA)",
      amount: cpa,
      pctCobro: pct(cpa),
      health: healthCpa,
      note: `CPA = CPC neto ÷ conversión = ${clp(cpcNeto)} ÷ ${fmtPct(conversion, 1)}. ${fmtPct(Number.isFinite(cpaSobreContribPct) ? cpaSobreContribPct : 0)} del margen de contribución.`,
    },
    {
      id: "utilidad",
      label: "Utilidad",
      amount: utilidad,
      pctCobro: pct(utilidad),
      health: healthUtilidad,
      note: "Sin IVA, después de costos y ads.",
    },
    {
      id: "contribucion",
      label: "Contribución (techo ads)",
      amount: contribucion,
      pctCobro: pct(contribucion),
      health: healthContrib,
      note: "Máximo CPA antes de perder plata.",
    },
    {
      id: "roas",
      label: "ROAS",
      amount: Number.isFinite(roas) ? roas : 0,
      pctCobro: Number.isFinite(roas) ? roas : 0,
      health: healthRoas,
      note: "Ingreso sin IVA ÷ CPA sin IVA.",
    },
  ];

  const partesPeso = [
    { id: "pieza", label: "Pieza", amount: piezaNeta, color: "#3f3f46" },
    { id: "courier", label: "Courier", amount: courierTotal, color: "#71717a" },
    { id: "empaque", label: "Empaque", amount: empaque, color: "#a1a1aa" },
    { id: "comision", label: "Comisión", amount: comision, color: "#d4d4d8" },
    { id: "ia", label: "IA", amount: ia, color: "#e4e4e7" },
    { id: "ads", label: "Ads", amount: Math.max(0, cpa), color: "#0f766e" },
    {
      id: "utilidad",
      label: utilidad >= 0 ? "Utilidad" : "Pérdida",
      amount: Math.abs(utilidad),
      color: utilidad >= 0 ? "#059669" : "#e11d48",
    },
  ].filter((part) => part.amount > 0);

  return {
    cobroCliente,
    ingreso,
    ingresoNeto,
    comision,
    ia,
    piezaNeta,
    courierTotal,
    envioNeto,
    reservaDevolucion,
    contribucion,
    utilidad,
    costoVariable,
    quiebreCpa,
    roas,
    ventasMes,
    utilidadMes,
    ventasMesDia,
    ingresoDia,
    utilidadDia,
    ingresoMesDia,
    utilidadMesDia,
    pautaMesDia,
    cpc: cpcNeto,
    conversionWebPct: input.conversionWebPct,
    cpa,
    clicksPorVenta,
    clicksDia,
    clicksMes,
    ventasParaObjetivo,
    pautaParaObjetivo,
    stockParaObjetivo,
    margenContribPct,
    margenUtilidadPct,
    cpaSobreContribPct,
    saludModelo,
    lecturaModelo,
    lineas,
    partesPeso,
    capasMargen,
  };
}

function leerModelo(
  salud: Health,
  utilidad: number,
  quiebre: number,
  cpa: number,
): string {
  if (salud === "quiebre" || utilidad < 0) {
    return `Cada venta pierde ${clp(Math.abs(utilidad))}. El CPA tiene que bajar de ${clp(Math.max(0, quiebre))}.`;
  }
  if (salud === "riesgo") {
    return `Quedan ${clp(utilidad)} por venta. Un CPA un poco más caro y se apaga el margen.`;
  }
  if (salud === "justo") {
    return `Aguanta, pero sin holgura: ${clp(utilidad)} por venta. No escalas hasta bajar ads.`;
  }
  if (salud === "sano") {
    return `Modelo sano. ${clp(utilidad)} por venta y el quiebre está en ${clp(quiebre)}.`;
  }
  return `Holgado. Ads se come ${clp(cpa)} y todavía quedan ${clp(utilidad)} por venta.`;
}

export function escenarioCpa(input: CostosInput, cpa: number) {
  return analizarCostos(aplicarFunnel(input, { cpa }));
}

export function escenarioTicket(input: CostosInput, ticket: number) {
  return analizarCostos({ ...input, ticket });
}

export function serieVolumen(input: CostosInput) {
  const tope = Math.max(10, Math.ceil(Math.max(0, input.ventasDia) + 2));
  return Array.from({ length: tope }, (_, index) => {
    const ventasDia = index + 1;
    const row = analizarCostos({ ...input, ventasDia });
    return {
      ventasDia,
      ingresoMes: row.ingresoMesDia,
      pautaMes: row.pautaMesDia,
      utilidadMes: row.utilidadMesDia,
    };
  });
}

function agruparMiles(value: number, digits = 0) {
  const [entero, decimal] = Math.abs(value).toFixed(digits).split(".");
  const conPuntos = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimal ? `${conPuntos},${decimal}` : conPuntos;
}

export function fmtNum(value: number, digits = 0) {
  const n = Number.isFinite(value) ? value : 0;
  return `${n < 0 ? "-" : ""}${agruparMiles(n, digits)}`;
}

export function clp(value: number) {
  const rounded = Math.round(Number.isFinite(value) ? value : 0);
  return `${rounded < 0 ? "-" : ""}$${agruparMiles(rounded)}`;
}

export function fmtPct(value: number, digits = 1) {
  const pct = (Number.isFinite(value) ? value : 0) * 100;
  const fixed = pct.toFixed(digits === 0 ? 0 : digits);
  const [entero, decimal] = fixed.split(".");
  const cuerpo = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decimal === undefined ? `${cuerpo}%` : `${cuerpo},${decimal}%`;
}

export function fmtRoas(value: number) {
  if (!Number.isFinite(value)) return "∞";
  const fixed = value.toFixed(1);
  const [entero, decimal] = fixed.split(".");
  return `${entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decimal}×`;
}
