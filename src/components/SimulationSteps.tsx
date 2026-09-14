"use client";

const steps = [
  {
    number: "01",
    title: "Sube tu foto",
    text: "Elige ese momento que no quieres olvidar.",
  },
  {
    number: "02",
    title: "Mírala en el relicario",
    text: "Comprueba cómo se ve dentro del corazón antes de decidir.",
  },
  {
    number: "03",
    title: "Ajusta el encuadre",
    text: "Muévela y amplíala hasta que quede como quieres.",
  },
  {
    number: "04",
    title: "Lleva el recuerdo",
    text: "Cuando te guste el resultado, puedes comprar tu pieza.",
  },
];

const openSimulator = () => {
  window.dispatchEvent(new Event("relicario:open-photo"));
};

export default function SimulationSteps() {
  return (
    <div className="mt-10 grid gap-px bg-[#d9d2c8] editorial:grid-cols-2 wide:grid-cols-4">
      {steps.map((step) => (
        <button
          key={step.number}
          type="button"
          onClick={openSimulator}
          className="bg-warm px-1 py-7 text-left transition-colors hover:bg-white focus-visible:relative editorial:px-8 editorial:py-10"
          aria-label={`${step.title}. Abrir simulador`}
        >
          <span className="font-display text-xs tracking-[0.2em] text-[var(--color-accent-caption)]">
            {step.number}
          </span>
          <h3 className="mt-5 font-display text-[19px] tracking-[0.14em] uppercase">
            {step.title}
          </h3>
          <p className="mt-3 max-w-[27ch] text-[16px] leading-7 text-[var(--color-text-muted)]">
            {step.text}
          </p>
        </button>
      ))}
    </div>
  );
}
