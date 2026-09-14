export type AdsFunnelStep = {
  id: string;
  step: string;
  title: string;
  job: string;
};

/** Mismos pasos que docs/funnel-landing.md, agrupados para Meta. */
export const ADS_FUNNEL: readonly AdsFunnelStep[] = [
  {
    id: "llegada",
    step: "0",
    title: "Llegada",
    job: "Parar el scroll. El anuncio es el wow: cara en el corazón.",
  },
  {
    id: "foto",
    step: "2–6",
    title: "Subir la foto",
    job: "Bajar el miedo. Se ve puesta, llega lista, no se publica.",
  },
  {
    id: "intencion",
    step: "7",
    title: "Intención",
    job: "Una frase de alguien. El clic es subir la foto, no el collar.",
  },
] as const;

export type AdsCreative = {
  id: string;
  file: string;
  src: string;
  funnel: AdsFunnelStep["id"];
  onImage: string;
  primary: string;
  headline: string;
  description: string;
  cta: string;
};

export const ADS_CREATIVES: readonly AdsCreative[] = [
  {
    id: "ad-01",
    file: "ad-01-por-fuera-ella.png",
    src: "/images/ADS/ad-01-por-fuera-ella.png",
    funnel: "llegada",
    onImage: "Por fuera, collar. Por dentro, ella.",
    primary:
      "Por fuera es un collar. Por dentro está ella. Sube la foto y mírala en el corazón antes de comprar.",
    headline: "Relicario con tu foto",
    description: "Acero · 5 a 7 días",
    cta: "Más información",
  },
  {
    id: "ad-04",
    file: "ad-04-lo-importante-cerca.png",
    src: "/images/ADS/ad-04-lo-importante-cerca.png",
    funnel: "llegada",
    onImage: "Lo importante, siempre cerca.",
    primary:
      "Lo importante, siempre cerca. Sube la foto. La ves en el corazón. Si te gusta, la compras.",
    headline: "Lo importante, siempre cerca",
    description: "No publicamos tu foto",
    cta: "Más información",
  },
  {
    id: "ad-05",
    file: "ad-05-tus-tesoros.png",
    src: "/images/ADS/ad-05-tus-tesoros.png",
    funnel: "llegada",
    onImage: "Tus tesoros, siempre cerca del corazón.",
    primary: "Dos caras, un corazón. Tus tesoros no se quedan en el celular.",
    headline: "Tus tesoros, cerca",
    description: "Relicario con foto",
    cta: "Más información",
  },
  {
    id: "ad-06",
    file: "ad-06-fotos-celular.png",
    src: "/images/ADS/ad-06-fotos-celular.png",
    funnel: "foto",
    onImage: "Hay fotos que no merecen quedarse en el celular.",
    primary:
      "Hay fotos que no merecen quedarse en el celular. Súbela y mírala en el relicario. Solo para armar tu pieza. No la publicamos.",
    headline: "Saca esa foto del celular",
    description: "La ves antes de comprar",
    cta: "Más información",
  },
  {
    id: "ad-07",
    file: "ad-07-fotos-celular-mano.png",
    src: "/images/ADS/ad-07-fotos-celular-mano.png",
    funnel: "foto",
    onImage: "Hay fotos que no merecen quedarse en el celular.",
    primary:
      "Esa foto ya está en tu galería. Súbela. La ves en el corazón. Si te gusta, la compras.",
    headline: "Del celular al corazón",
    description: "5 a 7 días hábiles",
    cta: "Más información",
  },
  {
    id: "ad-02",
    file: "ad-02-te-llega-con-foto.png",
    src: "/images/ADS/ad-02-te-llega-con-foto.png",
    funnel: "foto",
    onImage: "Sin armar nada. Te llega con la foto.",
    primary:
      "No lo armas tú. Subes la foto en la web y te llega listo, con ella puesta. 5 a 7 días hábiles.",
    headline: "Te llega con la foto",
    description: "Sube la foto en la web",
    cta: "Más información",
  },
  {
    id: "ad-08",
    file: "ad-08-testimonio-camila.png",
    src: "/images/ADS/ad-08-testimonio-camila.png",
    funnel: "intencion",
    onImage: "“Lo abro y ahí está mi hijo.” — Camila",
    primary:
      "Lo abro y ahí está mi hijo. Sube la foto. La ves en el corazón antes de comprar.",
    headline: "Lo abro y está mi hijo",
    description: "Relicario con foto",
    cta: "Más información",
  },
  {
    id: "ad-09",
    file: "ad-09-testimonio-camila-abierto.png",
    src: "/images/ADS/ad-09-testimonio-camila-abierto.png",
    funnel: "intencion",
    onImage: "“Lo abro y ahí está mi hijo.” — Camila",
    primary: "La misma frase, relicario abierto. El clic es ver la tuya puesta.",
    headline: "Lo abro y está mi hijo",
    description: "Míralo en el corazón",
    cta: "Más información",
  },
  {
    id: "ad-10",
    file: "ad-10-testimonio-fernanda.png",
    src: "/images/ADS/ad-10-testimonio-fernanda.png",
    funnel: "intencion",
    onImage: "Se lo regalé… y no se lo saca. — Fernanda",
    primary: "Se lo regalé y no se lo saca. Pack listo para entregar, si quieres.",
    headline: "Se lo regalé. No se lo saca.",
    description: "Listo en 5 a 7 días",
    cta: "Más información",
  },
  {
    id: "ad-11",
    file: "ad-11-testimonio-daniela.png",
    src: "/images/ADS/ad-11-testimonio-daniela.png",
    funnel: "intencion",
    onImage: "“Nuestra foto, siempre conmigo.” — Daniela",
    primary: "Nuestra foto, siempre conmigo. Sube la de ustedes y mírala en el corazón.",
    headline: "Nuestra foto, siempre conmigo",
    description: "No publicamos tu foto",
    cta: "Más información",
  },
  {
    id: "ad-12",
    file: "ad-12-testimonio-rosa.png",
    src: "/images/ADS/ad-12-testimonio-rosa.png",
    funnel: "intencion",
    onImage: "“El nieto en el cuello de abuela.” — Rosa",
    primary: "El nieto en el cuello de abuela. Sube la foto. Te llega puesta.",
    headline: "El nieto, siempre cerca",
    description: "Relicario con foto",
    cta: "Más información",
  },
];
