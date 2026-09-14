"use client";

import Image from "next/image";
import { useProjectLocal } from "@/components/ProjectLocalProvider";
import {
  ADDONS,
  FEATURED_OFFER_IDS,
  LLAVERO_ADDON_ID,
  SEGUNDA_UNIDAD_ID,
  formatClp,
  isFeaturedOffer,
  toggleAddon,
} from "@/lib/addons";
import { checkoutTotals } from "@/lib/checkout";

export default function PedidoAddons() {
  const { tienda, setTienda } = useProjectLocal();
  const selected = tienda.selected;
  const shippingFree = checkoutTotals(tienda).gratis;

  const onToggle = (id: string) => {
    setTienda((current) => ({
      ...current,
      selected: toggleAddon(current.selected, id),
    }));
  };

  const featured = FEATURED_OFFER_IDS.map((id) =>
    ADDONS.find((item) => item.id === id),
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));

  const others = ADDONS.filter(
    (addon) => addon.id !== LLAVERO_ADDON_ID && !isFeaturedOffer(addon.id),
  );

  return (
    <section>
      <p className="editorial-label text-[var(--color-accent-caption)]">Antes de pagar</p>
      <h2 className="mt-2 font-product text-[24px] leading-tight font-bold tracking-[-0.02em]">
        Completa tu pedido
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
        {shippingFree
          ? "Ya va con envío gratis. Puedes sumar el segundo relicario o el pack para regalo."
          : "El segundo relicario a $19.990 deja el envío gratis. El pack es para regalar."}{" "}
        El llavero ya se ofreció al comprar.
      </p>

      <ul className="mt-6 flex flex-col gap-3">
        {featured.map((addon) => {
          const checked = selected.includes(addon.id);
          return (
            <li key={addon.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 border p-4 text-sm ${
                  checked
                    ? "border-black bg-[var(--color-editorial)]"
                    : "border-[var(--color-border)] bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(addon.id)}
                  className="mt-1 size-4 accent-black"
                />
                {addon.image ? (
                  <span className="relative size-14 shrink-0 overflow-hidden border border-[var(--color-border)] bg-white">
                    <Image src={addon.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="font-medium">{addon.name}</strong>
                    {addon.id === SEGUNDA_UNIDAD_ID ? (
                      <span className="bg-[var(--color-badge-bg)] px-2 py-0.5 font-display text-[10px] tracking-[0.12em] text-[var(--color-badge-text)] uppercase">
                        Envío gratis
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[var(--color-text-muted)]">
                    {addon.description}
                  </span>
                  <span className="mt-2 flex flex-wrap items-baseline gap-2">
                    <span className="font-medium">+{formatClp(addon.price)}</span>
                    {addon.compareAtPrice ? (
                      <span className="text-xs text-black/40 line-through">
                        {formatClp(addon.compareAtPrice)}
                      </span>
                    ) : null}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {others.length > 0 ? (
        <ul className="mt-6 flex flex-col divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {others.map((addon) => (
            <li key={addon.id}>
              <label className="flex cursor-pointer items-start justify-between gap-3 py-3 text-sm">
                <span className="flex min-w-0 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(addon.id)}
                    onChange={() => onToggle(addon.id)}
                    className="mt-1 size-4 accent-black"
                  />
                  <span>
                    <strong className="font-medium">{addon.name}</strong>
                    <span className="block text-[var(--color-text-muted)]">{addon.description}</span>
                  </span>
                </span>
                <span className="shrink-0">+{formatClp(addon.price)}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
