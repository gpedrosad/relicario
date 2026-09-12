/**
 * Especificaciones medidas de los assets del relicario.
 * Fuente de verdad para componer la foto del usuario sobre `reli.png`.
 *
 * Coordenadas: origen (0, 0) arriba-izquierda. Unidades en píxeles.
 * Si se reemplaza `public/reli.png`, volver a medir el hueco y actualizar este archivo.
 */

export const RELICARIO = {
  src: "/reli.png",
  file: "public/reli.png",
  width: 1536,
  height: 1024,
  aspect: "3:2",
  format: "png",
  colorSpace: "srgb",
  hasAlpha: true,
  densityDpi: 72,
  /** Fuera del relicario, en el PNG final. */
  background: "#ffffff",
  /** Hueco del corazón cuando la foto no cubre: marfil, papel de foto. */
  paper: "#F3EDE4",
  paperRgb: { r: 243, g: 237, b: 228 },
  exportMime: "image/png",
  /**
   * Hueco del corazón derecho, medido con flood-fill desde el seed.
   * El recorte real se detecta en runtime; estos valores son la referencia esperada.
   */
  hole: {
    seedXRatio: 0.727,
    seedYRatio: 0.605,
    /** Píxeles con alpha < alphaCut se consideran hueco. */
    alphaCut: 16,
    minX: 847,
    minY: 345,
    maxX: 1397,
    maxY: 836,
    width: 551,
    height: 492,
    pixels: 184_409,
    centroid: { x: 1117.1, y: 554.9 },
  },
  /** 1.0: el canvas ya tiene el ratio del hueco; un cover extra recorta la cabeza. */
  coverScale: 1,
  /**
   * Tamaño de las caras detectadas dentro del recorte (y del hueco).
   * Evita el zoom 1:1 que las deja gigantes.
   */
  faceScale: {
    maxHeight: 0.34,
    maxWidth: 0.56,
    targetHeight: 0.26,
    minHeight: 0.18,
    centerY: 0.43,
  },
  /**
   * Insert cuadrado de referencia (no se usa para colocar).
   * El resto del corazón queda marfil. No es una máscara de corazón.
   */
  insert: {
    x: 279,
    y: 266,
    width: 493,
    height: 492,
    pngX: 987,
    pngY: 478,
    pngWidth: 247,
    pngHeight: 246,
    /** Lado interno de la foto 1:1 antes de pegarla en el insert. */
    outputSide: 512,
  },
  /**
   * Márgenes sobre el bounding box de caras, como fracción del propio box.
   * horizontal se aplica a ambos lados.
   */
  cropMargins: {
    full: { horizontal: 0.65, top: 0.5, bottom: 1.0 },
    min: { horizontal: 0.5, top: 0.4, bottom: 0.8 },
    /** Personas lejos: menos aire, más zoom a las caras. */
    close: { horizontal: 0.16, top: 0.2, bottom: 0.32 },
  },
} as const;

export const RELICARIO_REPLICATE = {
  /** Silueta para ubicar cabezas. No regenera caras. */
  cutoutModel: "bria/remove-background",
  /** Solo si el crop 1:1 no cabe. Override: REPLICATE_OUTPAINT_MODEL. */
  outpaintModel: "black-forest-labs/flux-fill-dev",
  /** Vacío: upscale local (sharp). Override: REPLICATE_UPSCALE_MODEL. */
  upscaleModel: "",
  /**
   * Retrato canónico para CUALQUIER foto. Fracciones del canvas de salida.
   * Medido en reli.png: el centro del hueco no existe hasta y≈428 (17% del alto).
   * Ahí está la hendidura de oro; la cabeza tiene que quedar debajo.
   */
  heart: {
    /** Hasta aquí el centro es marco, no hueco. */
    dip: 0.17,
    /** Margen visible entre la coronilla y la hendidura. */
    headTop: 0.27,
    /** Zona candidata para el borde inferior del grupo completo. */
    minSubjectBottom: 0.5,
    maxSubjectBottom: 0.9,
    /** Distancia mínima respecto al metal, sobre el lado menor del insert. */
    edgeMargin: 0.035,
    /** Ojos / centro de cara (bajo la hendidura, en la parte ancha). */
    faceCenterY: 0.43,
    /** Ojos relativos a la caja de la cabeza. */
    eyesInHead: 0.45,
    /** Límite inferior de la zona de referencia; el ajuste completo optimiza hasta 90%. */
    chinMax: 0.65,
    /** Ancho de referencia cuando no se proporciona la máscara medida. */
    maxHeadWidth: 0.7,
  },
  /** Zonas: docs/relicario-areas.md. El hueco vacío es RELICARIO.paper. */
} as const;

export const RELICARIO_HERO = {
  src: "/RELICARIO1.jpg",
  file: "public/RELICARIO1.jpg",
  width: 1024,
  height: 1024,
  format: "jpeg",
} as const;

/** No usar para composite: no tiene canal alpha; el hueco es un damero rasterizado. */
export const RELICARIO_LEGACY = {
  src: "/imagenrelicario.png",
  file: "public/imagenrelicario.png",
  width: 1536,
  height: 1024,
  hasAlpha: false,
} as const;
