"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { formatClp, LLAVERO_PRECIO } from "@/lib/addons";
import { ENVIO_COBRADO } from "@/lib/checkout";

type LlaveroUpsellModalProps = {
  open: boolean;
  image: string | null;
  alreadyFreeShipping: boolean;
  totalWithLlavero: number;
  onAdd: () => void;
  onSkip: () => void;
  onClose: () => void;
};

export default function LlaveroUpsellModal({
  open,
  image,
  alreadyFreeShipping,
  totalWithLlavero,
  onAdd,
  onSkip,
  onClose,
}: LlaveroUpsellModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ) ?? [],
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    const focusFrame = window.requestAnimationFrame(() => addButtonRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => previousFocus?.focus());
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="upsell-backdrop fixed inset-0 z-[60] flex items-end justify-center overflow-hidden bg-black/55 p-0 backdrop-blur-[2px] editorial:items-center editorial:p-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-labelledby="llavero-upsell-title"
        aria-describedby="llavero-upsell-description"
        aria-modal="true"
        className="upsell-dialog relative flex max-h-[94svh] w-full max-w-[880px] flex-col overflow-hidden rounded-t-[4px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)] editorial:grid editorial:grid-cols-[1.08fr_0.92fr] editorial:rounded-[4px] editorial:shadow-[0_20px_70px_rgba(0,0,0,0.28)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center border border-black/10 bg-white/90 text-black/50 backdrop-blur transition-colors hover:border-black hover:text-black editorial:right-5 editorial:top-5"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="relative h-[210px] shrink-0 bg-[var(--color-editorial)] editorial:h-auto editorial:min-h-[560px]">
          {image ? (
            <>
              <Image
                src={image}
                alt="Tu foto aplicada en el llavero plateado"
                fill
                sizes="(min-width: 590px) 475px, 100vw"
                unoptimized
                className="absolute inset-0 h-full w-full object-contain p-3 editorial:p-7"
              />
              <div className="absolute bottom-3 left-4 border border-[var(--color-accent)] bg-white/90 px-3 py-2 font-display text-[10px] tracking-[0.16em] uppercase backdrop-blur editorial:bottom-6 editorial:left-6">
                Tu foto · nueva pieza
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <span className="size-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-black" aria-hidden />
              <p className="font-display text-[11px] tracking-[0.14em] uppercase">
                Preparando tu vista previa
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">Usaremos la foto que acabas de ajustar.</p>
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden editorial:min-h-[560px]">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-6 editorial:px-9 editorial:pt-10">
            <p className="editorial-label text-[var(--color-accent-caption)]">
              {alreadyFreeShipping ? "Completa tu recuerdo" : "Envío gratis con tu pedido"}
            </p>
            <h2 id="llavero-upsell-title" className="mt-3 max-w-[16ch] font-product text-[27px] leading-[1.12] font-bold tracking-[-0.025em] editorial:text-[34px]">
              Agrega un llavero con la misma foto
            </h2>
            <p id="llavero-upsell-description" className="mt-3 text-[15px] leading-6 text-[var(--color-text-muted)] editorial:text-[16px] editorial:leading-7">
              Ya está lista: no tienes que volver a subirla ni ajustarla.
            </p>

            <div className="mt-5 border-y border-[var(--color-border)] py-3 text-sm">
              <div className="flex items-baseline justify-between gap-4 py-1.5">
                <span>Llavero plateado personalizado</span>
                <strong className="font-product text-base">+{formatClp(LLAVERO_PRECIO)}</strong>
              </div>
              {!alreadyFreeShipping ? (
                <div className="flex items-baseline justify-between gap-4 py-1.5 text-[var(--color-success)]">
                  <span>Envío gratis</span>
                  <strong className="font-product text-base">−{formatClp(ENVIO_COBRADO)}</strong>
                </div>
              ) : null}
              <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-[var(--color-border)] pt-3">
                <span className="font-display text-[11px] tracking-[0.12em] uppercase">Total de tu pedido</span>
                <strong className="font-product text-xl">{formatClp(totalWithLlavero)}</strong>
              </div>
            </div>

            <ul className="mt-4 grid gap-2 text-sm text-[var(--color-text-muted)]">
              <li><span className="mr-2 text-[var(--color-accent-caption)]">✓</span>La misma foto, sin repetir el proceso</li>
              <li><span className="mr-2 text-[var(--color-accent-caption)]">✓</span>Acero inoxidable en acabado plateado</li>
            </ul>
          </div>

          <div className="shrink-0 border-t border-[var(--color-border)] bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 editorial:px-9 editorial:pb-7">
            <button ref={addButtonRef} type="button" onClick={onAdd} className="primary-button w-full px-4">
              Agregar llavero y continuar
            </button>
            <button type="button" onClick={onSkip} className="mt-2 min-h-11 w-full px-4 font-display text-[11px] tracking-[0.12em] text-[var(--color-text-muted)] uppercase underline decoration-black/20 underline-offset-4 transition-colors hover:text-black">
              No, continuar solo con el relicario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
