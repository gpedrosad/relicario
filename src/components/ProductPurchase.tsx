"use client";

import { useMemo, useState } from "react";
import {
  ADDONS,
  RELICARIO_PRECIO,
  RELICARIO_PRECIO_TACHADO,
  VERSIONES,
  addonsTotal,
  formatClp,
  toggleAddon,
  versionById,
} from "@/lib/addons";

export default function ProductPurchase() {
  const [selected, setSelected] = useState<string[]>([]);
  const [versionId, setVersionId] = useState(VERSIONES[0].id);
  const version = versionById(versionId);
  const extras = useMemo(() => addonsTotal(selected), [selected]);
  const total = RELICARIO_PRECIO + extras;
  const discount = Math.round(
    (1 - RELICARIO_PRECIO / RELICARIO_PRECIO_TACHADO) * 100,
  );

  const onToggle = (id: string) => {
    setSelected((current) => toggleAddon(current, id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Relicario de plata
        </h1>
      </div>

      <p className="text-lg leading-relaxed text-zinc-600">{version.blurb}</p>

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-4xl font-bold">{formatClp(total)}</span>
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
        <li>✓ Plata de ley 925</li>
        <li>✓ Envío gratis en 24-48h</li>
        <li>✓ Devolución garantizada 30 días</li>
      </ul>

      <section id="extras" className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Versión
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Mismo relicario. Cambia el packaging, la tarjeta y el tono.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {VERSIONES.map((item) => {
              const active = item.id === versionId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setVersionId(item.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Extras
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Súmale lo que quieras. El pack regalo reemplaza caja y tarjeta sueltas.
          </p>
          <ul className="mt-3 divide-y divide-zinc-100 rounded-2xl border border-zinc-200">
            {ADDONS.map((addon) => {
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
        <button className="flex-1 rounded-full bg-zinc-900 px-8 py-4 font-semibold text-white transition-colors hover:bg-zinc-700">
          Comprar ahora · {formatClp(total)}
        </button>
        <button className="flex-1 rounded-full border border-zinc-200 px-8 py-4 font-semibold transition-colors hover:border-zinc-400">
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
