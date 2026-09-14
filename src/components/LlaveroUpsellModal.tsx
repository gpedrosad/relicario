"use client";

import { useEffect } from "react";
import Image from "next/image";
import { formatClp, LLAVERO_PRECIO } from "@/lib/addons";
import { ENVIO_COBRADO } from "@/lib/checkout";

type LlaveroUpsellModalProps = {
  open: boolean;
  image: string | null;
  alreadyFreeShipping: boolean;
  onAdd: () => void;
  onSkip: () => void;
  onClose: () => void;
};

export default function LlaveroUpsellModal({
  open,
  image,
  alreadyFreeShipping,
  onAdd,
  onSkip,
  onClose,
}: LlaveroUpsellModalProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="upsell-backdrop fixed inset-0 z-[60] flex items-end justify-center overflow-hidden bg-black/55 p-0 backdrop-blur-[2px] editorial:items-center editorial:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="llavero-upsell-title"
        aria-modal="true"
        className="upsell-dialog relative grid max-h-[94svh] w-full max-w-[880px] overflow-auto rounded-t-[4px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)] editorial:grid-cols-[1.08fr_0.92fr] editorial:overflow-hidden editorial:rounded-[4px] editorial:shadow-[0_20px_70px_rgba(0,0,0,0.28)]"
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

        <div className="relative min-h-[245px] bg-[var(--color-editorial)] editorial:min-h-[560px]">
          <Image
            src={image ?? "/images/relicario-llavero-editorial.png"}
            alt={image ? "Tu foto aplicada en el llavero" : "Llavero de acero inoxidable"}
            fill
            sizes="(min-width: 590px) 475px, 100vw"
            unoptimized={Boolean(image)}
            className="absolute inset-0 h-full w-full object-contain p-4 editorial:p-7"
          />
          <div className="absolute bottom-4 left-4 border border-[var(--color-accent)] bg-white/90 px-3 py-2 font-display text-[10px] tracking-[0.16em] uppercase backdrop-blur editorial:bottom-6 editorial:left-6">
            Misma foto · nueva pieza
          </div>
        </div>

        <div className="flex flex-col px-5 pb-5 pt-7 editorial:min-h-[560px] editorial:px-9 editorial:pb-8 editorial:pt-12">
          <p className="editorial-label text-[var(--color-accent-caption)]">
            {alreadyFreeShipping ? "Completa tu recuerdo" : "Desbloquea envío gratis"}
          </p>
          <h2 id="llavero-upsell-title" className="mt-3 max-w-[14ch] font-product text-[27px] leading-[1.12] font-bold tracking-[-0.025em] editorial:text-[34px]">
            Tu foto, también en tus llaves
          </h2>
          <p className="mt-4 text-[16px] leading-7 text-[var(--color-text-muted)]">
            Aprovecha la imagen que ya preparamos y llévala en un llavero de acero inoxidable.
          </p>

          <div className="mt-6 flex items-baseline justify-between border-y border-[var(--color-border)] py-4">
            <span className="font-display text-xs tracking-[0.14em] uppercase">Llavero personalizado</span>
            <strong className="font-product text-xl">{formatClp(LLAVERO_PRECIO)}</strong>
          </div>

          {!alreadyFreeShipping && (
            <div className="mt-5 border-l-2 border-[var(--color-success)] bg-[#eef6f1] px-4 py-3 text-sm leading-5 text-[var(--color-success)]">
              <strong className="block font-semibold">Tu envío queda en $0</strong>
              Ahorras los {formatClp(ENVIO_COBRADO)} del despacho al agregarlo.
            </div>
          )}

          <ul className="mt-5 grid gap-2 text-sm text-[var(--color-text-muted)]">
            <li><span className="mr-2 text-[var(--color-accent-caption)]">✓</span>Usamos la misma foto, sin volver a subirla</li>
            <li><span className="mr-2 text-[var(--color-accent-caption)]">✓</span>Acero inoxidable resistente</li>
          </ul>

          <div className="mt-7 editorial:mt-auto editorial:pt-8">
            <button type="button" onClick={onAdd} className="primary-button w-full px-4">
              Agregar llavero · {formatClp(LLAVERO_PRECIO)}
            </button>
            <button type="button" onClick={onSkip} className="mt-2 min-h-11 w-full px-4 font-display text-[11px] tracking-[0.12em] text-[var(--color-text-muted)] uppercase underline decoration-black/20 underline-offset-4 transition-colors hover:text-black">
              Continuar sin llavero
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
