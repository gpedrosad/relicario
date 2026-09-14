import HeaderCart from "@/components/HeaderCart";
import HeaderSimulationLink from "@/components/HeaderSimulationLink";
import ProductPurchase from "@/components/ProductPurchase";
import RelicarioPreview from "@/components/RelicarioPreview";
import SimulationSteps from "@/components/SimulationSteps";
import SimulatorTextLink from "@/components/SimulatorTextLink";
import StickyATC from "@/components/StickyATC";

const faqs = [
  {
    question: "¿Qué tipo de foto funciona mejor?",
    answer: "Una foto nítida, con buena luz y el rostro al centro. Después puedes moverla y ampliarla.",
    simulateLabel: "Probar una foto",
  },
  {
    question: "¿Puedo ver cómo quedará antes de comprar?",
    answer: "Sí. Al subirla la ves dentro del relicario y la ajustas hasta que te guste.",
    simulateLabel: "Abrir el simulador",
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
    answer: "5 a 7 días hábiles, hecha con tu foto. El envío suma según comuna.",
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

      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto grid h-[74px] max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-4 editorial:h-[92px] editorial:px-8">
          <HeaderSimulationLink />
          <a href="#producto" className="col-start-2 justify-self-center font-display text-[24px] tracking-[0.18em] uppercase editorial:text-[30px]">
            Relicario
          </a>
          <div className="col-start-3 justify-self-end">
            <HeaderCart />
          </div>
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
            <SimulationSteps />
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
                    {faq.simulateLabel ? (
                      <SimulatorTextLink label={faq.simulateLabel} />
                    ) : null}
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
