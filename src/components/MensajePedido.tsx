"use client";

type MensajePedidoProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Campo opcional de nota del pedido. Fuera de la landing por ahora; se reengancha cuando haga falta. */
export default function MensajePedido({ value, onChange }: MensajePedidoProps) {
  return (
    <label className="block">
      <span className="font-display text-xs tracking-[0.18em] uppercase">
        Mensaje para tu pedido <span className="normal-case tracking-normal text-black/40">(opcional)</span>
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        maxLength={160}
        placeholder="Cuéntanos si es un regalo o deja una indicación…"
        className="mt-3 w-full resize-none border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition-colors focus:border-black"
      />
    </label>
  );
}
