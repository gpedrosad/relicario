import HeaderCart from "@/components/HeaderCart";
import ProductPurchase from "@/components/ProductPurchase";
import RelicarioPreview from "@/components/RelicarioPreview";
import StickyATC from "@/components/StickyATC";

const steps = [
  { number: "01", title: "Sube tu foto", text: "Elige ese momento que no quieres olvidar." },
  { number: "02", title: "La hacemos tuya", text: "Ajustamos la imagen y preparamos tu pieza a mano." },
  { number: "03", title: "Lleva el recuerdo", text: "Recíbelo listo para usar o regalar." },
];

// Contenido inicial: ajustar plazos y políticas cuando estén definidos.
const faqs = [
  {
    question: "¿Qué tipo de foto funciona mejor?",
    answer: "Una foto nítida, con buena luz y el rostro al centro. Después puedes moverla y ampliarla.",
  },
  {
    question: "¿Puedo ver cómo quedará antes de comprar?",
    answer: "Sí. Al subirla la ves dentro del relicario y la ajustas hasta que te guste.",
  },
  {
    question: "¿Puedo usar una foto con varias personas o mascotas?",
    answer: "Sí, si se ven claras. En grupos, mejor una foto con un poco de distancia.",
  },
  {
    question: "¿De qué material es el relicario?",
    answer: "Acero inoxidable, en acabado dorado o plateado.",
  },
  {
    question: "¿Cuánto demora la preparación y el envío?",
    answer: "Cada pieza se hace con tu foto. El plazo lo ves al confirmar, según comuna y envío.",
  },
  {
    question: "¿Puedo llevar dos relicarios?",
    answer: "Sí. La segunda unidad cuesta $19.990 y deja el envío gratis.",
  },
  {
    question: "¿Viene listo para regalar?",
    answer: "Al confirmar puedes agregar el pack (caja y bolsa) a $2.990, o una tarjeta.",
  },
  {
    question: "¿Puedo cambiar la foto después de hacer el pedido?",
    answer: "Escríbenos pronto. Si ya empezó la personalización, puede que no se pueda.",
  },
  {
    question: "¿Qué pasa si mi pedido llega con un problema?",
    answer: "Escríbenos con fotos del pedido y lo revisamos.",
  },
  {
    question: "¿Cómo debo cuidar mi relicario?",
    answer: "Guárdalo seco, lejos de agua, perfume y cremas. Límpialo con un paño seco.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="bg-announcement px-4 py-2.5 text-center text-[12px] font-semibold tracking-[0.12em] text-white uppercase">
        Envíos a todo Chile · Gratis desde $42.990
      </div>

      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto grid h-[74px] max-w-[1280px] grid-cols-[44px_1fr_44px] items-center px-4 editorial:h-[92px] editorial:px-8">
          <a href="#como-funciona" className="flex size-11 items-center justify-start editorial:hidden" aria-label="Cómo funciona">
            <span className="flex w-5 flex-col gap-1.5" aria-hidden>
              <span className="h-px w-full bg-black" />
              <span className="h-px w-full bg-black" />
            </span>
          </a>
          <a href="#producto" className="col-start-2 justify-self-center font-display text-[24px] tracking-[0.18em] uppercase editorial:text-[30px]">
            Relicario
          </a>
          <HeaderCart />
        </div>
      </header>

      <main>
        <section id="producto" className="mx-auto grid max-w-[1280px] editorial:grid-cols-2 editorial:items-start">
          <div className="min-w-0 bg-[var(--color-editorial)] px-4 py-0 editorial:sticky editorial:top-0 editorial:px-8 editorial:py-12 wide:px-16">
            <RelicarioPreview />
          </div>
          <div id="buy-box" className="px-5 py-9 editorial:px-10 editorial:py-14 wide:px-20 wide:py-20">
            <ProductPurchase />
          </div>
        </section>

        <section id="como-funciona" className="bg-warm px-5 py-16 editorial:px-8 editorial:py-20">
          <div className="mx-auto max-w-[1120px]">
            <p className="editorial-label text-[var(--color-accent-caption)]">Así de simple</p>
            <h2 className="editorial-title mt-4 max-w-[12ch] text-[36px] editorial:text-[48px]">Tu historia, hecha joya</h2>
            <div className="mt-10 grid gap-px bg-[#d9d2c8] editorial:grid-cols-3">
              {steps.map((step) => (
                <article key={step.number} className="bg-warm px-1 py-7 editorial:px-8 editorial:py-10">
                  <span className="font-display text-xs tracking-[0.2em] text-[var(--color-accent-caption)]">{step.number}</span>
                  <h3 className="mt-5 font-display text-[19px] tracking-[0.14em] uppercase">{step.title}</h3>
                  <p className="mt-3 max-w-[27ch] text-[16px] leading-7 text-[var(--color-text-muted)]">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="preguntas" className="bg-white px-5 py-16 editorial:px-8 editorial:py-24">
          <div className="mx-auto grid max-w-[1120px] gap-10 editorial:grid-cols-[0.78fr_1.22fr] editorial:gap-20">
            <div className="editorial:self-start">
              <p className="editorial-label text-[var(--color-accent-caption)]">Antes de elegir</p>
              <h2 className="editorial-title mt-4 max-w-[10ch] text-[36px] editorial:text-[48px]">Preguntas frecuentes</h2>
              <p className="mt-5 max-w-[34ch] text-[16px] leading-7 text-[var(--color-text-muted)]">
                Foto, material, envío y cuidado.
              </p>
            </div>

            <div className="border-t border-black">
              {faqs.map((faq, index) => (
                <details key={faq.question} className="group border-b border-[var(--color-border)]">
                  <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-5 py-4 marker:content-none">
                    <span className="flex items-baseline gap-4">
                      <span className="hidden min-w-6 font-display text-[10px] tracking-[0.12em] text-[var(--color-accent-caption)] editorial:inline">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[16px] leading-6 font-medium editorial:text-[17px]">
                        {faq.question}
                      </span>
                    </span>
                    <span className="flex size-8 shrink-0 items-center justify-center font-display text-xl font-light transition-transform duration-200 group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <div className="pb-6 pr-8 editorial:pl-10 editorial:pr-14">
                    <p className="text-[16px] leading-7 text-[var(--color-text-muted)]">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-footer px-5 py-16 text-white editorial:px-8 editorial:py-20">
          <div className="mx-auto max-w-[1120px] text-center">
            <div className="text-[var(--color-accent)]" aria-label="Cinco estrellas">★★★★★</div>
            <h2 className="editorial-title mx-auto mt-5 max-w-[16ch] text-[34px] editorial:text-[46px]">Creado para guardar lo irrepetible</h2>
            <p className="mx-auto mt-5 max-w-[56ch] text-[16px] leading-7 text-[var(--color-on-dark-muted)]">
              Acero inoxidable, personalización con tu foto y preparación cuidada en cada pedido.
            </p>
            <div className="mx-auto mt-10 grid max-w-[820px] gap-3 editorial:grid-cols-3">
              {["Acero inoxidable", "30 días de garantía", "Despachos en Chile"].map((item) => (
                <div key={item} className="border border-white/15 px-4 py-5 font-display text-xs tracking-[0.15em] uppercase">
                  <span className="mr-2 text-[var(--color-verified)]">✓</span>{item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-footer px-5 pb-28 pt-12 text-white editorial:px-8 editorial:pb-12">
        <div className="mx-auto grid max-w-[1120px] gap-10 editorial:grid-cols-2">
          <div>
            <p className="editorial-label text-[var(--color-accent-soft)]">Escríbenos</p>
            <a href="mailto:hola@relicario.cl" className="mt-4 inline-block text-xl underline decoration-white/30 underline-offset-8">hola@relicario.cl</a>
          </div>
          <nav className="grid grid-cols-2 gap-4 text-sm text-[var(--color-on-dark-muted)] editorial:justify-self-end editorial:text-right" aria-label="Información">
            <a href="#producto">Producto</a><a href="#como-funciona">Cómo funciona</a>
            <a href="#preguntas">Preguntas frecuentes</a><a id="envios" href="#envios">Envíos Chile</a>
            <a id="devoluciones" href="#devoluciones">Devoluciones</a>
          </nav>
        </div>
        <p className="mx-auto mt-12 max-w-[1120px] text-xs text-white/40">© {new Date().getFullYear()} Relicario · Hecho para guardar lo que importa.</p>
      </footer>

      <StickyATC />
    </div>
  );
}
