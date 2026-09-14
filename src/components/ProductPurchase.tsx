"use client";

import { useMemo, useState } from "react";
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
import { checkoutTotals, ENVIO_GRATIS_DESDE } from "@/lib/checkout";
import { FINISHES, FINISH_LABEL, type RelicarioFinish } from "@/lib/relicario-finish";
import { product } from "@/lib/product";

export default function ProductPurchase() {
  const { tienda, setTienda } = useProjectLocal();
  const [note, setNote] = useState("");
  const selected = tienda.selected;
  const extras = useMemo(() => addonsTotal(selected), [selected]);
  const subtotal = RELICARIO_PRECIO + extras;
  const { envio, gratis, falta, total } = checkoutTotals({ selected });
  const discount = Math.round((1 - RELICARIO_PRECIO / RELICARIO_PRECIO_TACHADO) * 100);

  const onToggle = (id: string) => {
    setTienda((current) => ({ ...current, selected: toggleAddon(current.selected, id) }));
  };

  const setFinish = (finish: RelicarioFinish) => {
    setTienda((current) => current.finish === finish ? current : { ...current, finish });
  };

  const openPhoto = () => window.dispatchEvent(new Event("relicario:open-photo"));

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="editorial-label text-[var(--color-accent-caption)]">{product.eyebrow}</p>
        <h1 className="mt-3 font-product text-[30px] leading-[1.15] font-bold tracking-[-0.02em] wide:text-[36px]">
          {product.name}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-product text-[26px] font-bold">{formatClp(subtotal)}</span>
          {extras === 0 && <span className="text-base text-black/40 line-through">{formatClp(RELICARIO_PRECIO_TACHADO)}</span>}
          {extras === 0 && <span className="bg-[var(--color-badge-bg)] px-2 py-1 font-display text-[10px] tracking-[0.12em] text-[var(--color-badge-text)] uppercase">Ahorra {discount}%</span>}
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="tracking-[0.1em] text-[var(--color-accent)]" aria-hidden>★★★★★</span>
          <span className="text-[var(--color-text-muted)]">Producto nuevo · primeras unidades</span>
        </div>
      </div>

      <p className="text-[17px] leading-7 text-[var(--color-text-muted)]">{product.description}</p>

      <section className="border-t border-[var(--color-border)] pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xs tracking-[0.18em] uppercase">Elige tu acabado</h2>
          <span className="text-sm text-[var(--color-text-muted)]">{FINISH_LABEL[tienda.finish]}</span>
        </div>
        <div className="mt-4 flex gap-5">
          {FINISHES.map((id) => {
            const active = tienda.finish === id;
            return (
              <button key={id} type="button" onClick={() => setFinish(id)} aria-pressed={active} className="flex min-h-11 items-center gap-2.5 text-sm">
                <span className={`size-9 rounded-full border border-black/15 ${active ? "ring-2 ring-black ring-offset-2" : ""}`} style={{ background: id === "dorado" ? "#d4af6e" : "#c8ccd0" }} aria-hidden />
                {FINISH_LABEL[id]}
              </button>
            );
          })}
        </div>
      </section>

      <section className="border border-dashed border-[var(--color-border)] bg-[var(--color-editorial)] p-5">
        <p className="font-display text-xs tracking-[0.18em] uppercase">Tu foto</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">Súbela y comprueba el encuadre dentro del corazón antes de comprar.</p>
        <button type="button" onClick={openPhoto} className="mt-4 min-h-11 w-full border border-black bg-white px-4 font-display text-xs tracking-[0.12em] uppercase transition-colors hover:bg-black hover:text-white">
          + Subir foto
        </button>
      </section>

      <label className="block">
        <span className="font-display text-xs tracking-[0.18em] uppercase">Mensaje para tu pedido <span className="normal-case tracking-normal text-black/40">(opcional)</span></span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={160} placeholder="Cuéntanos si es un regalo o deja una indicación…" className="mt-3 w-full resize-none border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition-colors focus:border-black" />
      </label>

      <details id="extras" className="group border-y border-[var(--color-border)] py-1">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-display text-xs tracking-[0.18em] uppercase">
          Completa tu regalo <span className="text-lg font-normal transition-transform group-open:rotate-45">+</span>
        </summary>
        <div className="pb-4">
          {ADDONS.filter((addon) => addon.id !== LLAVERO_ADDON_ID).map((addon) => (
            <label key={addon.id} className="flex cursor-pointer items-start gap-3 border-t border-[var(--color-border)] py-3 text-sm">
              <input type="checkbox" checked={selected.includes(addon.id)} onChange={() => onToggle(addon.id)} className="mt-1 size-4 accent-black" />
              <span className="flex-1"><strong className="font-medium">{addon.name}</strong><span className="block text-[var(--color-text-muted)]">{addon.description}</span></span>
              <span>+{formatClp(addon.price)}</span>
            </label>
          ))}
        </div>
      </details>

      <div className={`px-4 py-3 text-sm ${gratis ? "bg-[#eef6f1] text-[var(--color-success)]" : "bg-[var(--color-editorial)] text-[var(--color-text-muted)]"}`}>
        {gratis ? "✓ Envío gratis desbloqueado" : <>Te faltan <strong>{formatClp(falta)}</strong> para envío gratis. <span className="block text-xs">Envío actual {formatClp(envio)} · gratis desde {formatClp(ENVIO_GRATIS_DESDE)}</span></>}
      </div>

      <div id="comprar">
        <button type="button" onClick={openPhoto} className="primary-button w-full px-5">
          Subir foto y añadir · {formatClp(total)}
        </button>
        <ul className="mt-4 grid gap-2 text-sm text-[var(--color-text-muted)] editorial:grid-cols-2">
          <li>✓ Acero inoxidable</li>
          <li>✓ Garantía de 30 días</li>
          <li>✓ Preparado a mano</li>
          <li>✓ Despachos en Chile</li>
        </ul>
      </div>
    </div>
  );
}
