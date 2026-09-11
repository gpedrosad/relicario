"use client";

import { useMemo, useState } from "react";
import {
  CONVERSION_PRESETS,
  CPA_PRESETS,
  CPC_PRESETS,
  COSTOS_DEFAULT,
  DIAS_MES,
  IVA_PCT,
  HEALTH_LABEL,
  OBJETIVO_PRESETS,
  PAUTA_PRESETS,
  TICKET_PRESETS,
  VENTAS_DIA_PRESETS,
  analizarCostos,
  aplicarFunnel,
  aplicarMargen,
  clp,
  fmtNum,
  sinIva,
  comisionTotalPct,
  escenarioCpa,
  escenarioTicket,
  fmtPct,
  fmtRoas,
  serieVolumen,
  type CostosAnalisis,
  type CostosInput,
  type Health,
  type LineaCosto,
} from "@/lib/costos";

const HEALTH_CLASS: Record<Health, string> = {
  excelente: "bg-emerald-50 text-emerald-800",
  sano: "bg-sky-50 text-sky-800",
  justo: "bg-amber-50 text-amber-900",
  riesgo: "bg-orange-50 text-orange-800",
  quiebre: "bg-rose-50 text-rose-800",
};

const HEALTH_DOT: Record<Health, string> = {
  excelente: "bg-emerald-600",
  sano: "bg-sky-600",
  justo: "bg-amber-500",
  riesgo: "bg-orange-500",
  quiebre: "bg-rose-600",
};

const HEALTH_BANNER: Record<Health, string> = {
  excelente: "border-emerald-400 bg-emerald-200 text-emerald-950",
  sano: "border-sky-400 bg-sky-200 text-sky-950",
  justo: "border-amber-500 bg-amber-300 text-amber-950",
  riesgo: "border-orange-500 bg-orange-400 text-orange-950",
  quiebre: "border-rose-700 bg-rose-600 text-white",
};

const INDICATOR: Record<
  Health,
  { card: string; label: string; value: string; hint: string; badge: string; dot: string }
> = {
  excelente: {
    card: "border-emerald-400 bg-emerald-200",
    label: "text-emerald-800",
    value: "text-emerald-950",
    hint: "text-emerald-900/80",
    badge: "bg-emerald-900 text-emerald-50",
    dot: "bg-emerald-50",
  },
  sano: {
    card: "border-sky-400 bg-sky-200",
    label: "text-sky-800",
    value: "text-sky-950",
    hint: "text-sky-900/80",
    badge: "bg-sky-900 text-sky-50",
    dot: "bg-sky-50",
  },
  justo: {
    card: "border-amber-500 bg-amber-300",
    label: "text-amber-900",
    value: "text-amber-950",
    hint: "text-amber-950/75",
    badge: "bg-amber-950 text-amber-50",
    dot: "bg-amber-200",
  },
  riesgo: {
    card: "border-orange-600 bg-orange-400",
    label: "text-orange-950",
    value: "text-orange-950",
    hint: "text-orange-950/80",
    badge: "bg-orange-950 text-orange-50",
    dot: "bg-orange-200",
  },
  quiebre: {
    card: "border-rose-800 bg-rose-600",
    label: "text-rose-50",
    value: "text-white",
    hint: "text-rose-100",
    badge: "bg-white text-rose-700",
    dot: "bg-rose-600",
  },
};

const LINEAS_TABLA = [
  "pieza",
  "envio",
  "empaque",
  "comision",
  "ia",
  "devoluciones",
  "cpc",
  "conversion",
  "ads",
  "utilidad",
] as const;

export default function CostosDashboard() {
  const [input, setInput] = useState<CostosInput>(COSTOS_DEFAULT);
  const analisis = useMemo(() => analizarCostos(input), [input]);
  const cpaRows = useMemo(
    () =>
      withCurrent(CPA_PRESETS, Math.round(input.cpa), 1).map((cpa) => ({
        key: cpa,
        analisis: escenarioCpa(input, cpa),
      })),
    [input],
  );
  const ticketRows = useMemo(
    () =>
      withCurrent(TICKET_PRESETS, input.ticket, 1).map((ticket) => ({
        key: ticket,
        analisis: escenarioTicket(input, ticket),
      })),
    [input],
  );
  const volumenRows = useMemo(() => serieVolumen(input), [input]);

  const set = <K extends keyof CostosInput>(key: K, value: CostosInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }));
  };
  const totalPartes = analisis.partesPeso.reduce((sum, part) => sum + part.amount, 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="text-lg font-bold tracking-tight">
            Relicario
          </a>
          <nav className="flex items-center gap-4 text-sm text-zinc-600">
            <a href="/" className="hover:text-zinc-900">
              Tienda
            </a>
            <span className="font-medium text-zinc-900">Costos</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Análisis sin IVA ({IVA_PCT}%)
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Qué tan sano es el relicario
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
              Los supuestos se escriben como los ves (góndola o factura, con
              IVA). Utilidad, CPA y gráficos van sobre la base neta. El IVA se
              declara, no es margen.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInput(COSTOS_DEFAULT)}
            className="self-start rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
          >
            Volver a supuestos
          </button>
        </div>

        <section
          className={`rounded-2xl border px-5 py-4 shadow-sm transition-colors duration-500 ${HEALTH_BANNER[analisis.saludModelo]}`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <HealthBadge health={analisis.saludModelo} onTone />
            <p className="text-sm font-semibold">{analisis.lecturaModelo}</p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
          <form className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Supuestos
            </h2>

            <Field
              label="Ticket"
              hint="Con IVA"
              value={input.ticket}
              onChange={(value) => set("ticket", value)}
              step={1000}
            />
            <PresetRow
              values={TICKET_PRESETS}
              current={input.ticket}
              onPick={(value) => set("ticket", value)}
            />

            <Field
              label="Pieza"
              hint="Con IVA, puesto Chile"
              value={input.pieza}
              onChange={(value) => set("pieza", value)}
              step={100}
            />
            <Field
              label="Envío que cobra"
              value={input.envioCobrado}
              onChange={(value) => set("envioCobrado", value)}
              step={500}
            />
            <Field
              label="Courier que paga"
              value={input.courier}
              onChange={(value) => set("courier", value)}
              step={500}
            />
            <Field
              label="Empaque"
              value={input.empaque}
              onChange={(value) => set("empaque", value)}
              step={100}
            />
            <Field
              label="Shopify"
              hint="Pago externo"
              value={input.shopifyPct}
              onChange={(value) => set("shopifyPct", value)}
              step={0.1}
              suffix="%"
            />
            <Field
              label="Mercado Pago"
              hint="3,19% + IVA"
              value={input.mercadoPagoPct}
              onChange={(value) => set("mercadoPagoPct", value)}
              step={0.1}
              suffix="%"
            />
            <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-600">
              Comisión total {fmtPct(comisionTotalPct(input) / 100, 1)} de la
              venta (ticket + envío): Shopify 2% por pasarela externa + Mercado
              Pago ~3,80% efectivo.
            </p>
            <Field
              label="Devoluciones"
              value={input.devolucionesPct}
              onChange={(value) => set("devolucionesPct", value)}
              step={0.5}
              suffix="%"
            />
            <Field
              label="Previews de IA / venta"
              value={input.previewsPorVenta}
              onChange={(value) => set("previewsPorVenta", value)}
              step={1}
            />
            <Field
              label="Costo por preview"
              value={input.costoPreview}
              onChange={(value) => set("costoPreview", value)}
              step={10}
            />

            <Field
              label="Ventas por día"
              hint={`${analisis.ventasMesDia} al mes`}
              value={input.ventasDia}
              onChange={(value) => set("ventasDia", value)}
              step={1}
            />
            <PresetRow
              values={VENTAS_DIA_PRESETS}
              current={input.ventasDia}
              onPick={(value) => set("ventasDia", value)}
            />

            <Field
              label="CPC"
              hint="Con IVA"
              value={input.cpc}
              onChange={(value) => setInput((current) => aplicarFunnel(current, { cpc: value }))}
              step={10}
            />
            <PresetRow
              values={CPC_PRESETS}
              current={input.cpc}
              onPick={(value) => setInput((current) => aplicarFunnel(current, { cpc: value }))}
            />
            <Field
              label="Conversión web"
              hint="Clic → compra"
              value={input.conversionWebPct}
              onChange={(value) =>
                setInput((current) => aplicarFunnel(current, { conversionWebPct: value }))
              }
              step={0.1}
              suffix="%"
            />
            <PresetRow
              values={CONVERSION_PRESETS}
              current={input.conversionWebPct}
              onPick={(value) =>
                setInput((current) => aplicarFunnel(current, { conversionWebPct: value }))
              }
            />
            <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-zinc-600">
              CPA {clp(analisis.cpa)} = {clp(analisis.cpc)} ÷{" "}
              {fmtPct(input.conversionWebPct / 100, 1)} (CPC sin IVA).{" "}
              {analisis.clicksPorVenta > 0
                ? `${fmtNum(analisis.clicksPorVenta, 1)} clics por venta`
                : "Subí la conversión para calcular el CPA"}
              {analisis.clicksDia > 0
                ? ` · ${fmtNum(analisis.clicksDia, 0)} clics/día`
                : ""}
              .
            </p>
            <Field
              label="CPA ads"
              hint="Sale de CPC ÷ conversión"
              value={Math.round(analisis.cpa)}
              onChange={(value) => setInput((current) => aplicarFunnel(current, { cpa: value }))}
              step={500}
            />
            <PresetRow
              values={CPA_PRESETS}
              current={Math.round(analisis.cpa)}
              onPick={(value) => setInput((current) => aplicarFunnel(current, { cpa: value }))}
            />

            <Field
              label="Pauta mensual"
              value={input.pautaMensual}
              onChange={(value) => set("pautaMensual", value)}
              step={50_000}
            />
            <PresetRow
              values={PAUTA_PRESETS}
              current={input.pautaMensual}
              onPick={(value) => set("pautaMensual", value)}
            />

            <Field
              label="Objetivo de utilidad"
              value={input.objetivoUtilidad}
              onChange={(value) => set("objetivoUtilidad", value)}
              step={100_000}
            />
            <PresetRow
              values={OBJETIVO_PRESETS}
              current={input.objetivoUtilidad}
              onPick={(value) => set("objetivoUtilidad", value)}
            />
          </form>

          <div className="flex flex-col gap-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat
                label="Cliente paga"
                value={clp(analisis.cobroCliente)}
                hint={`Con IVA. Base neta ${clp(analisis.ingreso)}`}
              />
              <Stat
                label="Contribución"
                value={clp(analisis.contribucion)}
                hint={`${fmtPct(analisis.margenContribPct)} del ingreso neto · techo de ads`}
                health={linea(analisis, "contribucion")?.health}
              />
              <Stat
                label="Utilidad / venta"
                value={clp(analisis.utilidad)}
                hint={`${fmtPct(analisis.margenUtilidadPct)} del ingreso neto`}
                health={linea(analisis, "utilidad")?.health}
              />
              <Stat
                label="CPA de quiebre"
                value={clp(analisis.quiebreCpa)}
                hint={`ROAS ${fmtRoas(analisis.roas)}`}
                health={linea(analisis, "ads")?.health}
              />
            </div>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-base font-semibold">Utilidad y margen</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Sobre la base neta {clp(analisis.ingreso)}. Hoy el modelo deja{" "}
                {clp(analisis.utilidad)} ({fmtPct(analisis.margenUtilidadPct)} del
                ingreso neto).
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {analisis.capasMargen.map((capa) => {
                  const tone = INDICATOR[capa.health];
                  return (
                    <div
                      key={capa.id}
                      className={`rounded-xl border px-4 py-3 transition-colors duration-300 ${tone.card}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-medium ${tone.label}`}>
                          {capa.label}
                        </p>
                        <HealthBadge health={capa.health} onTone />
                      </div>
                      <p className={`mt-2 text-xl font-bold tracking-tight ${tone.value}`}>
                        {fmtPct(capa.margenPct, 0)}
                      </p>
                      <p className={`text-sm font-semibold ${tone.value}`}>
                        {clp(capa.utilidad)}
                      </p>
                      <p className={`mt-1 text-xs ${tone.hint}`}>{capa.note}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-base font-semibold">A dónde se va cada peso</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Sobre el cobro al cliente. Incluye el 1% de devoluciones en
                pieza, courier y reserva.
              </p>
              <div className="mt-4 flex h-10 overflow-hidden rounded-full bg-zinc-100">
                {analisis.partesPeso.map((part) => (
                  <div
                    key={part.id}
                    title={`${part.label}: ${clp(part.amount)}`}
                    className="h-full"
                    style={{
                      width: `${(part.amount / totalPartes) * 100}%`,
                      background: part.color,
                    }}
                  />
                ))}
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {analisis.partesPeso.map((part) => (
                  <li
                    key={part.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="flex items-center gap-2 text-zinc-600">
                      <span
                        className="size-2.5 rounded-sm"
                        style={{ background: part.color }}
                      />
                      {part.label}
                    </span>
                    <span className="font-medium">
                      {clp(part.amount)}{" "}
                      <span className="text-zinc-400">
                        {fmtPct(part.amount / analisis.ingreso)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-base font-semibold">Salud de cada costo</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="pb-2 font-medium">Ítem</th>
                      <th className="pb-2 font-medium">Monto</th>
                      <th className="pb-2 font-medium">% del cobro</th>
                      <th className="pb-2 font-medium">Salud</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LINEAS_TABLA.map((id) => {
                      const row = linea(analisis, id);
                      if (!row) return null;
                      return (
                        <tr key={id} className="border-t border-zinc-100">
                          <td className="py-3">
                            <div className="font-medium">{row.label}</div>
                            <div className="text-xs text-zinc-500">{row.note}</div>
                          </td>
                          <td className="py-3 font-medium">
                            {id === "conversion"
                              ? fmtPct(row.amount / 100, 1)
                              : clp(row.amount)}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-100">
                                <div
                                  className={`h-full ${HEALTH_DOT[row.health]}`}
                                  style={{
                                    width: `${Math.min(100, Math.abs(row.pctCobro) * 100)}%`,
                                  }}
                                />
                              </div>
                              {fmtPct(row.pctCobro)}
                            </div>
                          </td>
                          <td className="py-3">
                            <HealthBadge health={row.health} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold">Utilidad según CPA</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Mismos costos, distinta pauta por venta. La barra activa es el CPA
              que estás usando.
            </p>
            <ScenarioBars
              rows={cpaRows}
              activeKey={Math.round(analisis.cpa)}
              formatAxis={(cpa) => clp(cpa)}
              onPick={(cpa) =>
                setInput((current) => aplicarFunnel(current, { cpa }))
              }
            />
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold">Utilidad según ticket</h2>
            <p className="mt-1 text-sm text-zinc-500">
              CPA fijo en {clp(analisis.cpa)}. Un ticket más alto no baja solo el
              ads: hay que medirlo.
            </p>
            <ScenarioBars
              rows={ticketRows}
              activeKey={input.ticket}
              formatAxis={(ticket) => clp(ticket)}
              onPick={(ticket) => set("ticket", ticket)}
            />
          </article>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">
                Ingreso, publicidad y utilidad según ventas al día
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Mes de {DIAS_MES} días. Tocá una venta/día o el gráfico para
                cambiar el ritmo.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Stat
              label="Ingreso / día"
              value={clp(analisis.ingresoDia)}
              hint={`${input.ventasDia} × ${clp(analisis.ingreso)}`}
            />
            <Stat
              label="Utilidad / día"
              value={clp(analisis.utilidadDia)}
              hint={`${input.ventasDia} × ${clp(analisis.utilidad)} · ${fmtPct(analisis.margenUtilidadPct)} del ingreso neto`}
              health={linea(analisis, "utilidad")?.health}
            />
            <Stat
              label="Ingreso / mes"
              value={clp(analisis.ingresoMesDia)}
              hint={`${analisis.ventasMesDia} ventas`}
            />
              <Stat
                label="Publicidad / mes"
                value={clp(analisis.pautaMesDia)}
                hint={`${analisis.ventasMesDia} × ${clp(analisis.cpa)}`}
                health={linea(analisis, "ads")?.health}
              />
            <Stat
              label="Utilidad / mes"
              value={clp(analisis.utilidadMesDia)}
                hint={`${fmtPct(analisis.margenUtilidadPct)} del ingreso neto`}
              health={linea(analisis, "utilidad")?.health}
            />
            <Stat
              label="Margen"
              value={fmtPct(analisis.margenUtilidadPct)}
              hint="del ingreso neto"
              health={linea(analisis, "utilidad")?.health}
            />
          </div>

          <VolumeChart
            rows={volumenRows}
            current={input.ventasDia}
            onPick={(value) => set("ventasDia", value)}
          />

          <div className="mt-6 grid gap-5 border-t border-zinc-100 pt-5 sm:grid-cols-2 xl:grid-cols-4">
            <RangeSlider
              id="slider-ventas"
              label="Ventas"
              hint="Por día"
              value={input.ventasDia}
              min={1}
              max={Math.max(10, input.ventasDia)}
              step={1}
              format={(value) => `${fmtNum(value, 0)} / día`}
              onChange={(value) => set("ventasDia", value)}
            />
            <RangeSlider
              id="slider-cpc"
              label="CPC"
              hint="Con IVA"
              value={input.cpc}
              min={Math.min(50, input.cpc)}
              max={Math.max(800, input.cpc)}
              step={10}
              format={(value) => clp(value)}
              onChange={(value) =>
                setInput((current) => aplicarFunnel(current, { cpc: value }))
              }
            />
            <RangeSlider
              id="slider-conversion"
              label="Conversión"
              hint="Clic → compra"
              value={input.conversionWebPct}
              min={Math.min(0.3, input.conversionWebPct)}
              max={Math.max(8, input.conversionWebPct)}
              step={0.1}
              format={(value) => `${fmtNum(value, 1)}%`}
              onChange={(value) =>
                setInput((current) =>
                  aplicarFunnel(current, { conversionWebPct: value }),
                )
              }
            />
            <RangeSlider
              id="slider-margen"
              label="Margen"
              hint="del ingreso neto"
              value={Number((analisis.margenUtilidadPct * 100).toFixed(1))}
              min={Math.min(-20, Number((analisis.margenUtilidadPct * 100).toFixed(1)))}
              max={Math.max(
                40,
                Number((analisis.margenContribPct * 100).toFixed(1)),
              )}
              step={0.1}
              format={(value) => `${fmtNum(value, 1)}%`}
              onChange={(value) =>
                setInput((current) => aplicarMargen(current, value))
              }
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold">Mes con esta pauta</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-zinc-500">Ventas</dt>
                <dd className="text-xl font-semibold">{analisis.ventasMes}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Utilidad del mes</dt>
                <dd className="text-xl font-semibold">
                  {clp(analisis.utilidadMes)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Ingreso neto</dt>
                <dd className="font-medium">
                  {clp(analisis.ventasMes * analisis.ingreso)}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Stock en piezas</dt>
                <dd className="font-medium">
                  {clp(analisis.ventasMes * sinIva(input.pieza))}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold">
              Para ganar {clp(input.objetivoUtilidad)}
            </h2>
            {analisis.ventasParaObjetivo === null ? (
              <p className="mt-4 text-sm text-rose-700">
                Con este CPA no hay utilidad. No se llega al objetivo.
              </p>
            ) : (
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-zinc-500">Ventas necesarias</dt>
                  <dd className="text-xl font-semibold">
                    {analisis.ventasParaObjetivo}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Pauta a gastar</dt>
                  <dd className="text-xl font-semibold">
                    {clp(analisis.pautaParaObjetivo ?? 0)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Facturación</dt>
                  <dd className="font-medium">
                    {clp(analisis.ventasParaObjetivo * analisis.ingreso)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Capital en stock</dt>
                  <dd className="font-medium">
                    {clp(analisis.stockParaObjetivo ?? 0)}
                  </dd>
                </div>
              </dl>
            )}
          </article>
        </section>

        <p className="text-xs leading-relaxed text-zinc-400">
          Base sin IVA {IVA_PCT}%. Ticket, pieza, courier, empaque, CPC y pauta
          se ingresan con IVA y se netean. La comisión 5,8% se cobra sobre el
          total con IVA (Shopify 2% + Mercado Pago 3,19% + IVA ≈ 3,80%). La IA
          (Replicate) no lleva IVA chileno. No incluye creativos, agencia ni tu
          tiempo. Detalle en{" "}
          <span className="font-mono">docs/costos-relicario.md</span>.
        </p>
      </main>
    </div>
  );
}

function linea(analisis: CostosAnalisis, id: string): LineaCosto | undefined {
  return analisis.lineas.find((item) => item.id === id);
}

function withCurrent(presets: number[], current: number, epsilon: number) {
  if (!Number.isFinite(current)) return presets;
  if (presets.some((value) => Math.abs(value - current) <= epsilon)) {
    return presets;
  }
  return [...presets, current].sort((a, b) => a - b);
}

function ScenarioBars({
  rows,
  activeKey,
  epsilon = 1,
  formatAxis,
  onPick,
}: {
  rows: { key: number; analisis: CostosAnalisis }[];
  activeKey: number;
  epsilon?: number;
  formatAxis: (key: number) => string;
  onPick: (key: number) => void;
}) {
  const maxUtilidad = Math.max(
    1,
    ...rows.map((row) => Math.abs(row.analisis.utilidad)),
  );

  return (
    <div className="mt-6 flex h-64 items-stretch gap-3">
      {rows.map((row) => {
        const height = (Math.abs(row.analisis.utilidad) / maxUtilidad) * 100;
        const active = Math.abs(row.key - activeKey) <= epsilon;
        return (
          <button
            key={row.key}
            type="button"
            onClick={() => onPick(row.key)}
            className="flex min-h-0 flex-1 flex-col items-center gap-2"
          >
            <span className="text-xs font-medium text-zinc-600">
              {clp(row.analisis.utilidad)}
            </span>
            <div className="relative min-h-0 w-full flex-1">
              <div
                className={`absolute inset-x-0 bottom-0 rounded-t-md ${
                  row.analisis.utilidad < 0
                    ? "bg-rose-400"
                    : active
                      ? "bg-zinc-900"
                      : "bg-zinc-300 hover:bg-zinc-400"
                }`}
                style={{ height: `${Math.max(height, 4)}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500">{formatAxis(row.key)}</span>
            <HealthBadge
              health={linea(row.analisis, "utilidad")?.health ?? "justo"}
            />
          </button>
        );
      })}
    </div>
  );
}

type VolumenPunto = {
  ventasDia: number;
  ingresoMes: number;
  pautaMes: number;
  utilidadMes: number;
};

const VOLUME_SERIES = [
  { key: "ingresoMes", label: "Ingreso", color: "#18181b" },
  { key: "pautaMes", label: "Publicidad", color: "#7c3aed" },
  { key: "utilidadMes", label: "Utilidad", color: "#059669" },
] as const;

function VolumeChart({
  rows,
  current,
  onPick,
}: {
  rows: VolumenPunto[];
  current: number;
  onPick: (value: number) => void;
}) {
  const width = 720;
  const height = 260;
  const pad = { top: 16, right: 16, bottom: 36, left: 64 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const values = rows.flatMap((row) => [row.ingresoMes, row.pautaMes, row.utilidadMes]);
  const maxY = Math.max(1, ...values);
  const minY = Math.min(0, ...values);
  const spanY = maxY - minY || 1;
  const x = (index: number) =>
    pad.left + (rows.length <= 1 ? innerW / 2 : (index / (rows.length - 1)) * innerW);
  const y = (value: number) => pad.top + ((maxY - value) / spanY) * innerH;
  const line = (key: keyof Omit<VolumenPunto, "ventasDia">) =>
    rows.map((row, index) => `${x(index)},${y(row[key])}`).join(" ");
  const ticks = [minY, (minY + maxY) / 2, maxY];
  const activeIndex = rows.findIndex((row) => row.ventasDia === current);
  const active = rows[activeIndex] ?? rows[0];
  const zeroY = y(0);
  const seriesValues = active
    ? {
        ingresoMes: clp(active.ingresoMes),
        pautaMes: clp(active.pautaMes),
        utilidadMes: clp(active.utilidadMes),
      }
    : null;

  return (
    <div className="mt-6">
      <div className="mb-3 flex flex-wrap gap-2">
        {VOLUME_SERIES.map((serie) => (
          <span
            key={serie.key}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs"
          >
            <span
              className="inline-flex items-center"
              aria-hidden
            >
              <span
                className="h-0.5 w-5 rounded-full"
                style={{ backgroundColor: serie.color }}
              />
              <span
                className="-ml-1 size-2.5 rounded-full border-2 border-white"
                style={{ backgroundColor: serie.color }}
              />
            </span>
            <span className="font-semibold text-zinc-800">{serie.label}</span>
            {seriesValues ? (
              <span className="tabular-nums text-zinc-500">
                {seriesValues[serie.key]}
              </span>
            ) : null}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-64 w-full"
        role="img"
        aria-label="Ingreso, publicidad y utilidad mensual según ventas por día"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="#e4e4e7"
            />
            <text
              x={pad.left - 8}
              y={y(tick) + 4}
              textAnchor="end"
              className="fill-zinc-400"
              fontSize="10"
            >
              {clp(tick)}
            </text>
          </g>
        ))}
        {minY < 0 ? (
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={zeroY}
            y2={zeroY}
            stroke="#a1a1aa"
            strokeDasharray="4 4"
          />
        ) : null}
        {VOLUME_SERIES.map((serie) => (
          <polyline
            key={serie.key}
            fill="none"
            stroke={serie.color}
            strokeWidth="2.5"
            points={line(serie.key)}
          />
        ))}
        {rows.map((row, index) => {
          const selected = index === activeIndex;
          return (
            <g key={row.ventasDia}>
              <circle
                cx={x(index)}
                cy={y(row.ingresoMes)}
                r={selected ? 4.5 : 3}
                fill="#18181b"
              />
              <circle
                cx={x(index)}
                cy={y(row.pautaMes)}
                r={selected ? 4.5 : 3}
                fill="#7c3aed"
              />
              <circle
                cx={x(index)}
                cy={y(row.utilidadMes)}
                r={selected ? 4.5 : 3}
                fill={row.utilidadMes < 0 ? "#e11d48" : "#059669"}
              />
              <text
                x={x(index)}
                y={height - 12}
                textAnchor="middle"
                className={selected ? "fill-zinc-900" : "fill-zinc-400"}
                fontSize="10"
                fontWeight={selected ? 600 : 400}
              >
                {row.ventasDia}
              </text>
            </g>
          );
        })}
        {rows.map((row, index) => (
          <rect
            key={`hit-${row.ventasDia}`}
            x={x(index) - innerW / rows.length / 2}
            y={pad.top}
            width={innerW / rows.length}
            height={innerH}
            fill="transparent"
            className="cursor-pointer"
            onClick={() => onPick(row.ventasDia)}
            title={`${row.ventasDia} ventas/día · ingreso ${clp(row.ingresoMes)} · publicidad ${clp(row.pautaMes)} · utilidad ${clp(row.utilidadMes)}`}
            aria-label={`${row.ventasDia} ventas al día, ingreso ${clp(row.ingresoMes)}, publicidad ${clp(row.pautaMes)}, utilidad ${clp(row.utilidadMes)}`}
          />
        ))}
      </svg>
    </div>
  );
}

function HealthBadge({
  health,
  onTone = false,
}: {
  health: Health;
  onTone?: boolean;
}) {
  const tone = INDICATOR[health];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        onTone ? tone.badge : HEALTH_CLASS[health]
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${onTone ? tone.dot : HEALTH_DOT[health]}`}
      />
      {HEALTH_LABEL[health]}
    </span>
  );
}

function Stat({
  label,
  value,
  hint,
  health,
}: {
  label: string;
  value: string;
  hint: string;
  health?: Health;
}) {
  const tone = health ? INDICATOR[health] : null;
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors duration-300 ${
        tone ? tone.card : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={`text-xs font-medium uppercase tracking-wide ${
            tone ? tone.label : "text-zinc-500"
          }`}
        >
          {label}
        </p>
        {health ? <HealthBadge health={health} onTone /> : null}
      </div>
      <p
        className={`mt-2 text-2xl font-bold tracking-tight ${
          tone ? tone.value : "text-zinc-900"
        }`}
      >
        {value}
      </p>
      <p className={`mt-1 text-xs ${tone ? tone.hint : "text-zinc-500"}`}>
        {hint}
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  step,
  suffix,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  step: number;
  suffix?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-sm">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-medium">{label}</span>
        {hint ? <span className="text-xs text-zinc-400">{hint}</span> : null}
      </span>
      <span className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 font-mono text-sm outline-none focus:border-zinc-400"
        />
        {suffix ? <span className="text-zinc-500">{suffix}</span> : null}
      </span>
    </label>
  );
}

function RangeSlider({
  id,
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  const safe = Number.isFinite(value) ? value : min;
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">
          {label}
          {hint ? (
            <span className="ml-2 text-xs font-normal text-zinc-400">{hint}</span>
          ) : null}
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums">
          {format(safe)}
        </span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={safe}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900"
      />
      <span className="flex justify-between text-[11px] text-zinc-400">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </span>
    </label>
  );
}

function PresetRow({
  values,
  current,
  onPick,
}: {
  values: number[];
  current: number;
  onPick: (value: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => {
        const active = value === current;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onPick(value)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              active
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {value >= 1000 ? clp(value) : value}
          </button>
        );
      })}
    </div>
  );
}
