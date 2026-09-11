import ProductPurchase from "@/components/ProductPurchase";
import RelicarioPreview from "@/components/RelicarioPreview";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <header className="border-b border-zinc-100 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-bold tracking-tight">Relicario</span>
          <nav className="flex items-center gap-4 text-sm text-zinc-600">
            <a href="#producto" className="hover:text-zinc-900">
              Producto
            </a>
            <a href="#extras" className="hover:text-zinc-900">
              Extras
            </a>
            <a href="#comprar" className="hover:text-zinc-900">
              Comprar
            </a>
            <a href="/costos" className="hover:text-zinc-900">
              Costos
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <section
          id="producto"
          className="grid items-start gap-10 md:grid-cols-2"
        >
          <div className="md:sticky md:top-8">
            <RelicarioPreview />
          </div>
          <ProductPurchase />
        </section>
      </main>

      <footer className="border-t border-zinc-100 px-6 py-6">
        <p className="mx-auto max-w-5xl text-center text-sm text-zinc-400">
          © {new Date().getFullYear()} Relicario — Todos los derechos
          reservados
        </p>
      </footer>
    </div>
  );
}
