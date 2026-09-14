"use client";

export default function HeaderSimulationLink() {
  const openPhoto = () => {
    window.dispatchEvent(new Event("relicario:open-photo"));
  };

  return (
    <button
      type="button"
      onClick={openPhoto}
      className="min-h-11 justify-self-start font-display text-[10px] tracking-[0.14em] uppercase underline decoration-black/25 underline-offset-4 transition-colors hover:decoration-black editorial:text-xs"
      aria-label="Simular el relicario con tu foto"
    >
      <span className="editorial:hidden">Tu foto</span>
      <span className="hidden editorial:inline">Simular</span>
    </button>
  );
}
