"use client";

import { useEffect, useState } from "react";
import { useProjectLocal } from "@/components/ProjectLocalProvider";
import { ADDONS, formatClp } from "@/lib/addons";

export default function HeaderCart() {
  const { tienda, setTienda } = useProjectLocal();
  const [open, setOpen] = useState(false);
  const extras = ADDONS.filter((addon) => tienda.selected.includes(addon.id));
  const hasExtras = extras.length > 0;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const resetExtras = () => {
    setTienda((current) =>
      current.selected.length === 0 ? current : { ...current, selected: [] },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex size-11 items-center justify-end"
        aria-label="Ver extras del pedido"
      >
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M5 8h14l-1 12H6L5 8Z" />
          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </svg>
        {hasExtras ? (
          <span className="absolute right-0 top-1.5 size-2.5 rounded-full bg-[var(--color-cart-dot)]" />
        ) : null}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] editorial:items-center editorial:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-modal-title"
            className="relative w-full max-w-md overflow-hidden rounded-t-[4px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)] editorial:rounded-[4px] editorial:shadow-[0_20px_70px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5 border-b border-[var(--color-border)] px-5 py-5">
              <div>
                <p className="editorial-label text-[var(--color-accent-caption)]">Tu pedido</p>
                <h2 id="cart-modal-title" className="mt-2 font-product text-[24px] leading-tight font-bold tracking-[-0.02em]">
                  Extras agregados
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-11 shrink-0 items-center justify-center border border-[var(--color-border)] text-black/45 transition-colors hover:border-black hover:text-black"
                aria-label="Cerrar"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-5">
              {hasExtras ? (
                <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                  {extras.map((addon) => (
                    <li key={addon.id} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                      <span>{addon.name}</span>
                      <span className="shrink-0 font-medium">{formatClp(addon.price)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                  No hay extras. El relicario se elige al comprar.
                </p>
              )}
            </div>

            {hasExtras ? (
              <div className="border-t border-[var(--color-border)] px-5 py-4">
                <button type="button" onClick={resetExtras} className="primary-button w-full px-4">
                  Quitar extras
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
