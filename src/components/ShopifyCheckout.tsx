"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProjectLocal } from "@/components/ProjectLocalProvider";
import { formatClp } from "@/lib/addons";
import {
  CHECKOUT_FROM_LABEL,
  ENVIO_GRATIS_DESDE,
  checkoutLines,
  checkoutTotals,
  parseCheckoutFrom,
} from "@/lib/checkout";
import { LLAVERO_ADDON_ID } from "@/lib/addons";
import { RELICARIO_LLAVERO } from "@/lib/relicario-spec";
import { overlaySrc } from "@/lib/relicario-finish";

export default function ShopifyCheckout() {
  const searchParams = useSearchParams();
  const from = parseCheckoutFrom(searchParams.get("from"));
  const { tienda, ready } = useProjectLocal();
  const lines = checkoutLines(tienda);
  const totals = checkoutTotals(tienda);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a]">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-950">
        Simulación de Shopify. Acá iría el checkout real. No cobra.
        {from ? (
          <span className="mt-1 block font-medium sm:mt-0 sm:ml-2 sm:inline">
            Entrada: {CHECKOUT_FROM_LABEL[from]}
          </span>
        ) : null}
      </div>

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Relicario
          </Link>
          <p className="flex items-center gap-1.5 text-xs text-zinc-500">
            <LockIcon />
            Checkout
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <section className="bg-white px-4 py-8 sm:px-8 lg:px-10">
          <nav className="mb-8 flex flex-wrap gap-x-2 text-xs text-zinc-400">
            <span>Carrito</span>
            <span>›</span>
            <span>Información</span>
            <span>›</span>
            <span>Envío</span>
            <span>›</span>
            <span className="font-medium text-zinc-800">Pago</span>
          </nav>

          <form
            className="flex flex-col gap-8"
            onSubmit={(event) => event.preventDefault()}
          >
            <fieldset className="flex flex-col gap-3">
              <legend className="text-base font-semibold">Contacto</legend>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Correo electrónico"
                className="h-12 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-800"
              />
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-base font-semibold">Entrega</legend>
              <input
                name="country"
                defaultValue="Chile"
                readOnly
                className="h-12 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-600"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="firstName"
                  placeholder="Nombre"
                  autoComplete="given-name"
                  className="h-12 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-800"
                />
                <input
                  name="lastName"
                  placeholder="Apellidos"
                  autoComplete="family-name"
                  className="h-12 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-800"
                />
              </div>
              <input
                name="address"
                placeholder="Dirección"
                autoComplete="street-address"
                className="h-12 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-800"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="city"
                  placeholder="Comuna"
                  autoComplete="address-level2"
                  className="h-12 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-800"
                />
                <input
                  name="region"
                  placeholder="Región"
                  autoComplete="address-level1"
                  className="h-12 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-800"
                />
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-base font-semibold">Envío</legend>
              <label className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-50 px-4 py-3 text-sm">
                <span>
                  <span className="block font-medium">Estándar</span>
                  <span className="text-zinc-500">2 a 5 días hábiles</span>
                </span>
                <span className="font-medium">
                  {totals.gratis ? "Gratis" : formatClp(totals.envio)}
                </span>
              </label>
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-base font-semibold">Pago</legend>
              <label className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-50 px-4 py-3 text-sm">
                <span>
                  <span className="block font-medium">Mercado Pago</span>
                  <span className="text-zinc-500">
                    Débito, crédito, cuotas o transferencia
                  </span>
                </span>
                <span className="rounded bg-[#009ee3] px-2 py-0.5 text-[11px] font-semibold text-white">
                  MP
                </span>
              </label>
            </fieldset>

            <button
              type="button"
              disabled
              className="h-12 rounded-md bg-zinc-900 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-80"
            >
              Pagar ahora · {ready ? formatClp(totals.total) : "…"}
            </button>

            <Link
              href="/#comprar"
              className="text-center text-sm text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline"
            >
              Volver a la tienda
            </Link>
          </form>
        </section>

        <aside className="border-t border-zinc-200 bg-[#f1f1f1] px-4 py-8 sm:px-8 lg:border-t-0 lg:border-l">
          <h2 className="sr-only">Resumen del pedido</h2>
          <ul className="flex flex-col gap-4">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center gap-3">
                {line.id === "relicario" || line.id === LLAVERO_ADDON_ID || line.image ? (
                  <span className="relative size-16 overflow-hidden rounded-md border border-zinc-200 bg-white">
                    <Image
                      src={
                        line.id === LLAVERO_ADDON_ID
                          ? RELICARIO_LLAVERO.src
                          : line.id === "relicario"
                            ? overlaySrc(tienda.finish)
                            : (line.image ?? "")
                      }
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </span>
                ) : (
                  <span className="flex size-16 items-center justify-center rounded-md border border-zinc-200 bg-white text-xs text-zinc-400">
                    Extra
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{line.name}</span>
                  <span className="block text-xs text-zinc-500">
                    {line.detail}
                  </span>
                </span>
                <span className="text-sm">{formatClp(line.price)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-8 flex flex-col gap-2 border-t border-zinc-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Subtotal</dt>
              <dd>{ready ? formatClp(totals.subtotal) : "…"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Envío</dt>
              <dd>{totals.gratis ? "Gratis" : formatClp(totals.envio)}</dd>
            </div>
            {!totals.gratis ? (
              <p className="text-xs text-zinc-500">
                Gratis desde {formatClp(ENVIO_GRATIS_DESDE)}. Te faltan{" "}
                {formatClp(totals.falta)}.
              </p>
            ) : null}
            <div className="mt-2 flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>
                <span className="mr-1 text-xs font-normal text-zinc-400">
                  CLP
                </span>
                {ready ? formatClp(totals.total) : "…"}
              </dd>
            </div>
          </dl>
        </aside>
      </main>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7.5V5.2a3 3 0 0 1 6 0v2.3"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="3.4"
        y="7.5"
        width="9.2"
        height="6.3"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
