import Image from "next/image";
import Link from "next/link";
import { ADS_CREATIVES, ADS_FUNNEL } from "@/lib/ads-meta";

export const metadata = {
  title: "Ads Meta — Relicario",
  description: "Creatividades y textos para Meta, por paso del funnel.",
  robots: { index: false, follow: false },
};

export default function AdsPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="bg-announcement px-4 py-2.5 text-center text-[12px] font-semibold tracking-[0.12em] text-white uppercase">
        Interna · noindex · textos para pegar en Meta
      </div>

      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto grid h-[74px] max-w-[1120px] grid-cols-[1fr_auto_1fr] items-center px-4">
          <Link href="/" className="justify-self-start text-sm text-[var(--color-text-muted)] hover:text-black">
            Volver
          </Link>
          <p className="justify-self-center font-display text-[24px] tracking-[0.18em] uppercase">
            Relicario
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-4 py-10 editorial:px-8">
        <p className="editorial-label text-[var(--color-accent-caption)]">Meta</p>
        <h1 className="mt-2 font-product text-[28px] leading-tight font-bold tracking-[-0.02em]">
          Creatividades y textos
        </h1>
        <p className="mt-3 max-w-[52ch] text-sm leading-6 text-[var(--color-text-muted)]">
          Un anuncio por tarjeta. Primary, titular y descripción para pegar.
          Las frases con nombre son copy de creativo, no compras reales.
        </p>

        {ADS_FUNNEL.map((stage) => {
          const items = ADS_CREATIVES.filter((item) => item.funnel === stage.id);
          return (
            <section key={stage.id} className="mt-14">
              <p className="editorial-label text-[var(--color-accent-caption)]">
                Paso {stage.step}
              </p>
              <h2 className="mt-2 font-product text-[22px] font-bold tracking-[-0.02em]">
                {stage.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">{stage.job}</p>

              <ul className="mt-8 grid gap-10">
                {items.map((ad) => (
                  <li
                    key={ad.id}
                    className="grid gap-6 border-t border-[var(--color-border)] pt-8 editorial:grid-cols-[minmax(0,20rem)_1fr]"
                  >
                    <div>
                      <p className="text-xs tracking-[0.12em] text-[var(--color-text-muted)] uppercase">
                        {ad.file}
                      </p>
                      <div className="relative mt-3 aspect-square overflow-hidden border border-[var(--color-border)] bg-[var(--color-editorial)]">
                        <Image
                          src={ad.src}
                          alt={ad.onImage}
                          fill
                          sizes="(min-width: 590px) 320px, 100vw"
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <dl className="grid gap-4 text-sm">
                      <div>
                        <dt className="editorial-label text-[var(--color-accent-caption)]">En la foto</dt>
                        <dd className="mt-2 font-medium">{ad.onImage}</dd>
                      </div>
                      <div>
                        <dt className="editorial-label text-[var(--color-accent-caption)]">Primary</dt>
                        <dd className="mt-2 leading-6">{ad.primary}</dd>
                      </div>
                      <div>
                        <dt className="editorial-label text-[var(--color-accent-caption)]">Titular</dt>
                        <dd className="mt-2 font-medium">{ad.headline}</dd>
                      </div>
                      <div>
                        <dt className="editorial-label text-[var(--color-accent-caption)]">Descripción</dt>
                        <dd className="mt-2">{ad.description}</dd>
                      </div>
                      <div>
                        <dt className="editorial-label text-[var(--color-accent-caption)]">CTA Meta</dt>
                        <dd className="mt-2">{ad.cta}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}
