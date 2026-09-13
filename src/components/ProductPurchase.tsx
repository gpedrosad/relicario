"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectLocal } from "@/components/ProjectLocalProvider";
import {
  ADDONS,
  LLAVERO_ADDON_ID,
  RELICARIO_PRECIO,
  RELICARIO_PRECIO_TACHADO,
  addonsTotal,
  formatClp,
  toggleAddon,
} from "@/lib/addons";
import { checkoutTotals, ENVIO_GRATIS_DESDE, requestCheckout } from "@/lib/checkout";
import {
  FINISHES,
  FINISH_LABEL,
  type RelicarioFinish,
} from "@/lib/relicario-finish";

export default function ProductPurchase() {
  const { tienda, setTienda } = useProjectLocal();
  const selected = tienda.selected;
  const extras = useMemo(() => addonsTotal(selected), [selected]);
  const subtotal = RELICARIO_PRECIO + extras;
  const { envio, gratis, falta, total } = checkoutTotals({ selected });
  const discount = Math.round(
    (1 - RELICARIO_PRECIO / RELICARIO_PRECIO_TACHADO) * 100,
  );

  const router = useRouter();
  const [buyPulse, setBuyPulse] = useState(false);

  useEffect(() => {
    const onFocus = () => {
      setBuyPulse(true);
      window.setTimeout(() => setBuyPulse(false), 1400);
    };
    window.addEventListener("relicario:focus-buy", onFocus);
    return () => window.removeEventListener("relicario:focus-buy", onFocus);
  }, []);

  const onToggle = (id: string) => {
    setTienda((current) => ({
      ...current,
      selected: toggleAddon(current.selected, id),
    }));
  };

  const setFinish = (finish: RelicarioFinish) => {
    setTienda((current) =>
      current.finish === finish ? current : { ...current, finish },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Relicario de acero inoxidable
        </h1>
      </div>

      <p className="text-lg leading-relaxed text-zinc-600">
        Sube tu foto y mírala dentro del relicario. Pieza única hecha a mano,
        perfecta para guardar lo más valioso o para regalar.
      </p>

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-4xl font-bold">{formatClp(subtotal)}</span>
        {extras === 0 ? (
          <>
            <span className="text-lg text-zinc-400 line-through">
              {formatClp(RELICARIO_PRECIO_TACHADO)}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              -{discount}%
            </span>
          </>
        ) : (
          <span className="text-sm text-zinc-500">
            Relicario {formatClp(RELICARIO_PRECIO)} + extras {formatClp(extras)}
          </span>
        )}
      </div>

      <ul className="flex flex-col gap-2 text-sm text-zinc-600">
        <li>✓ Acero inoxidable · dorado o plateado</li>
        <li>
          {gratis
            ? "✓ Envío gratis desbloqueado"
            : `Envío ${formatClp(envio)} · gratis desde ${formatClp(ENVIO_GRATIS_DESDE)}`}
        </li>
        <li>✓ Devolución garantizada 30 días</li>
      </ul>

      <div
        className={`rounded-2xl px-4 py-3 text-sm ${
          gratis
            ? "bg-emerald-50 text-emerald-800"
            : "bg-zinc-50 text-zinc-600"
        }`}
      >
        {gratis ? (
          <p className="font-medium">Envío gratis en este pedido.</p>
        ) : (
          <>
            <p>
              Te faltan <span className="font-semibold">{formatClp(falta)}</span>{" "}
              para envío gratis. Súmale extras.
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-zinc-900"
                style={{
                  width: `${Math.min(100, (subtotal / ENVIO_GRATIS_DESDE) * 100)}%`,
                }}
              />
            </div>
          </>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Acabado
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Mismo relicario. Elige el color del metal.
          </p>
        </div>
        <div className="flex gap-2">
          {FINISHES.map((id) => {
            const active = tienda.finish === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFinish(id)}
                aria-pressed={active}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                }`}
              >
                <span
                  className="size-4 rounded-full border border-black/10"
                  style={{
                    background:
                      id === "dorado" ? "#c4a35a" : "#c8ccd0",
                  }}
                  aria-hidden
                />
                {FINISH_LABEL[id]}
              </button>
            );
          })}
        </div>
      </section>

      <section id="extras" className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Extras
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Súmale lo que quieras. El pack regalo reemplaza caja y tarjeta sueltas.
          </p>
          <ul className="mt-3 divide-y divide-zinc-100 rounded-2xl border border-zinc-200">
            {ADDONS.filter((addon) => addon.id !== LLAVERO_ADDON_ID).map(
              (addon) => {
              const checked = selected.includes(addon.id);
              return (
                <li key={addon.id}>
                  <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-zinc-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(addon.id)}
                      className="mt-1 size-4 accent-zinc-900"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-medium text-zinc-900">
                          {addon.name}
                        </span>
                        <span className="shrink-0 text-sm font-semibold text-zinc-800">
                          +{formatClp(addon.price)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm text-zinc-500">
                        {addon.description}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div id="comprar" className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => requestCheckout("comprar", (href) => router.push(href))}
          className={`flex-1 rounded-full bg-zinc-900 px-8 py-4 font-semibold text-white transition-all duration-500 hover:bg-zinc-700 ${
            buyPulse ? "scale-[1.02] ring-4 ring-zinc-900/20" : "scale-100 ring-0"
          }`}
        >
          Comprar ahora · {formatClp(total)}
        </button>
        <button
          type="button"
          onClick={() => requestCheckout("carrito", (href) => router.push(href))}
          className="flex-1 rounded-full border border-zinc-200 px-8 py-4 font-semibold transition-colors hover:border-zinc-400"
        >
          Añadir al carrito
        </button>
      </div>

      <p className="text-xs text-zinc-400">
        Stock limitado · Pedido mínimo 1 unidad
        {selected.length > 0
          ? ` · ${selected.length} extra${selected.length === 1 ? "" : "s"}`
          : ""}
      </p>
    </div>
  );
}
