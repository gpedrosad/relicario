"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import HeaderCart from "@/components/HeaderCart";
import PedidoAddons from "@/components/PedidoAddons";
import { useProjectLocal } from "@/components/ProjectLocalProvider";
import { formatClp } from "@/lib/addons";
import {
  ENVIO_GRATIS_DESDE,
  checkoutHref,
  checkoutLines,
  checkoutTotals,
  parseCheckoutFrom,
} from "@/lib/checkout";

export default function CompletarPedido() {
  const searchParams = useSearchParams();
  const from = parseCheckoutFrom(searchParams.get("from")) ?? "comprar";
  const { tienda, ready } = useProjectLocal();
  const lines = checkoutLines(tienda);
  const totals = checkoutTotals(tienda);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="bg-announcement px-4 py-2.5 text-center text-[12px] font-semibold tracking-[0.12em] text-white uppercase">
        Envíos a todo Chile · Gratis desde $42.990
      </div>

      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto grid h-[74px] max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-4 editorial:h-[92px] editorial:px-8">
          <Link
            href="/"
            className="justify-self-start text-sm text-[var(--color-text-muted)] hover:text-black"
          >
            Volver
          </Link>
          <Link
            href="/"
            className="justify-self-center font-display text-[24px] tracking-[0.18em] uppercase editorial:text-[30px]"
          >
            Relicario
          </Link>
          <div className="justify-self-end">
            <HeaderCart />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[880px] gap-10 px-4 py-10 editorial:px-8 editorial:py-14">
        <section>
          <p className="editorial-label text-[var(--color-accent-caption)]">Tu relicario</p>
          <h1 className="mt-2 font-product text-[28px] leading-tight font-bold tracking-[-0.02em]">
            Revisa y suma extras
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            Esto es tuyo. El pago es el siguiente paso.
          </p>
          <ul className="mt-6 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {lines.map((line) => (
              <li key={line.id} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                <span>
                  <span className="block font-medium">{line.name}</span>
                  <span className="text-[var(--color-text-muted)]">{line.detail}</span>
                </span>
                <span className="shrink-0">{formatClp(line.price)}</span>
              </li>
            ))}
          </ul>
        </section>

        <PedidoAddons />

        <section className="border border-[var(--color-border)] bg-[var(--color-editorial)] p-5">
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Subtotal</dt>
              <dd>{ready ? formatClp(totals.subtotal) : "…"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Envío</dt>
              <dd>{totals.gratis ? "Gratis" : formatClp(totals.envio)}</dd>
            </div>
            {!totals.gratis ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                Gratis desde {formatClp(ENVIO_GRATIS_DESDE)}. Te faltan {formatClp(totals.falta)}.
              </p>
            ) : null}
            <div className="mt-2 flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{ready ? formatClp(totals.total) : "…"}</dd>
            </div>
          </dl>

          <Link href={checkoutHref(from)} className="primary-button mt-6 flex w-full items-center justify-center">
            Ir a pagar
          </Link>
          <p className="mt-3 text-center text-xs text-[var(--color-text-muted)]">
            El pago se hace en Shopify. Ahí no se pueden agregar extras.
          </p>
        </section>
      </main>
    </div>
  );
}
