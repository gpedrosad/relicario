"use client";

import { useEffect, useState } from "react";
import { formatClp, LLAVERO_PRECIO } from "@/lib/addons";
import { ENVIO_COBRADO } from "@/lib/checkout";
import { RELICARIO_LLAVERO } from "@/lib/relicario-spec";

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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/75 p-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="llavero-upsell-title"
        aria-modal="true"
        className={`flex max-h-[92vh] w-full max-w-lg flex-col overflow-y-auto rounded-3xl bg-white shadow-2xl transition-all duration-200 ${
          visible ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative shrink-0 bg-zinc-950 px-5 pb-5 pt-4 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            {alreadyFreeShipping
              ? "Misma foto, otro relicario"
              : "Gana envío gratis"}
          </p>
          <h2
            id="llavero-upsell-title"
            className="mt-2 max-w-[18rem] text-2xl font-bold tracking-tight"
          >
            Tu foto ya está lista en el llavero
          </h2>
        </div>

        <div className="bg-white px-4 pt-2">
          <div className="relative mx-auto aspect-[3/2] max-h-[38vh] w-full overflow-hidden rounded-2xl bg-white">
            {image ? (
              <img
                src={image}
                alt="Tu foto en el llavero"
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                src={RELICARIO_LLAVERO.src}
                alt="Llavero de acero inoxidable"
                className="h-full w-full object-contain"
              />
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 px-5 py-5">
          {alreadyFreeShipping ? (
            <p className="text-sm leading-relaxed text-zinc-600">
              El mismo recuerdo, para las llaves. Acero inoxidable ·{" "}
              {formatClp(LLAVERO_PRECIO)}.
            </p>
          ) : (
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              <p className="font-semibold">
                Agregalo y el envío pasa de {formatClp(ENVIO_COBRADO)} a $0
              </p>
              <p className="mt-1 text-emerald-800">
                Llavero {formatClp(LLAVERO_PRECIO)} · la misma foto, en acero.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onAdd}
            className="w-full rounded-full bg-zinc-900 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Agregar llavero · {formatClp(LLAVERO_PRECIO)}
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-sm font-medium text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-800 hover:underline"
          >
            Seguir sin llavero
          </button>
        </div>
      </div>
    </div>
  );
}
