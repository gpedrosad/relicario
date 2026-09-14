"use client";

export default function SimulatorTextLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("relicario:open-photo"))}
      className="mt-4 inline-flex min-h-11 items-center gap-2 font-display text-xs tracking-[0.12em] uppercase underline decoration-black/25 underline-offset-4 transition-colors hover:decoration-black"
    >
      {label} <span aria-hidden>→</span>
    </button>
  );
}
