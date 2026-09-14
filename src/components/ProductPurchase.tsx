"use client";

import { useRouter } from "next/navigation";
import { useProjectLocal } from "@/components/ProjectLocalProvider";
import {
  RELICARIO_PRECIO,
  RELICARIO_PRECIO_TACHADO,
  formatClp,
} from "@/lib/addons";
import { checkoutTotals, ENVIO_GRATIS_DESDE, requestCheckout } from "@/lib/checkout";
import { FINISHES, FINISH_LABEL, type RelicarioFinish } from "@/lib/relicario-finish";
import { product } from "@/lib/product";

export default function ProductPurchase() {
  const { tienda, setTienda, photoReady } = useProjectLocal();
  const router = useRouter();
  const landing = checkoutTotals({ selected: [] });
  const discount = Math.round((1 - RELICARIO_PRECIO / RELICARIO_PRECIO_TACHADO) * 100);

  const setFinish = (finish: RelicarioFinish) => {
    setTienda((current) => (current.finish === finish ? current : { ...current, finish }));
  };

  const openPhoto = () => window.dispatchEvent(new Event("relicario:open-photo"));
  const goToBuy = () => requestCheckout("comprar", (href) => router.push(href));

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="editorial-label text-[var(--color-accent-caption)]">{product.eyebrow}</p>
        <h1 className="mt-3 font-product text-[25px] leading-[1.2] font-bold tracking-normal">
          {product.name}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-product text-[26px] font-bold">{formatClp(RELICARIO_PRECIO)}</span>
          <span className="text-base text-black/40 line-through">{formatClp(RELICARIO_PRECIO_TACHADO)}</span>
          <span className="bg-[var(--color-badge-bg)] px-2 py-1 font-display text-[10px] tracking-[0.12em] text-[var(--color-badge-text)] uppercase">
            Ahorra {discount}%
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="tracking-[0.1em] text-[var(--color-accent)]" aria-hidden>★★★★★</span>
          <span className="text-[var(--color-text-muted)]">Producto nuevo · primeras unidades</span>
        </div>
      </div>

      <p className="text-[17px] leading-7 text-[var(--color-text-muted)]">{product.description}</p>

      {!photoReady ? (
        <div>
          <button type="button" onClick={openPhoto} className="primary-button w-full px-5">
            Simular con tu foto
          </button>
          <p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">
            Pruébalo gratis antes de decidir. Sin compromiso.
          </p>
        </div>
      ) : null}

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

      <section className={`border p-5 ${photoReady ? "border-black bg-[var(--color-editorial)]" : "border-dashed border-[var(--color-border)] bg-[var(--color-editorial)]"}`}>
        <p className="font-display text-xs tracking-[0.18em] uppercase">
          {photoReady ? "Foto lista" : "Tu foto"}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
          {photoReady
            ? "Ya está en el corazón. Si te gusta, cómpralo. Si no, cámbiala."
            : "Súbela y comprueba el encuadre. Solo para armar tu pieza. No la publicamos."}
        </p>
        <button
          type="button"
          onClick={openPhoto}
          className="mt-4 min-h-11 w-full border border-black bg-white px-4 font-display text-xs tracking-[0.12em] uppercase transition-colors hover:bg-black hover:text-white"
        >
          {photoReady ? "Cambiar foto" : "+ Subir foto"}
        </button>
      </section>

      <p className="text-sm text-[var(--color-text-muted)]">
        5 a 7 días hábiles, hecha con tu foto. Envío {formatClp(landing.envio)} ·
        gratis desde {formatClp(ENVIO_GRATIS_DESDE)}.
      </p>

      <div id="comprar">
        {photoReady ? (
          <button type="button" onClick={goToBuy} className="primary-button w-full px-5">
            Comprar este relicario · {formatClp(landing.total)}
          </button>
        ) : (
          <p className="border-y border-[var(--color-border)] py-4 text-center text-sm leading-6 text-[var(--color-text-muted)]">
            Primero prueba tu foto. La opción de compra aparece cuando veas el resultado.
          </p>
        )}
        <ul className="mt-5 grid grid-cols-2 border-y border-[var(--color-border)] text-black">
          {["Acero inoxidable", "Garantía de 30 días", "Preparado a mano", "Despachos en Chile"].map((benefit, index) => (
            <li
              key={benefit}
              className={`flex min-h-[72px] items-center gap-3 py-3 ${index % 2 === 0 ? "pr-3" : "border-l border-[var(--color-border)] pl-4"} ${index > 1 ? "border-t border-[var(--color-border)]" : ""}`}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-cream)] text-[var(--color-accent-caption)]" aria-hidden>
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7 12 3 3 7-7" />
                </svg>
              </span>
              <span className="font-display text-[10px] leading-4 tracking-[0.12em] uppercase editorial:text-[11px]">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
