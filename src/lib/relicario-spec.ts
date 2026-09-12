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
  /** Fondo del PNG original: transparente (RGBA 0,0,0,0). El resultado se pinta blanco. */
  background: "#ffffff",
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
  /** El canvas usa el mismo ratio del hueco (551×492 ≈ 1.12). */
  photoFit: {
    aspectRatio: "1.12",
    focalX: 0.5,
    focalY: 0.5,
  },
} as const;

export const RELICARIO_REPLICATE = {
  cutoutModel: "bria/remove-background",
  fillModel: "black-forest-labs/flux-fill-pro",
  validationModel: "ultralytics/yolov8s-worldv2:96a016a98290d3ff1f3ed8942c916379701c84da9b6d5b19a107b1f86cdc97f5",
  maxFillAttempts: 2,
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
  /** Reglas de generación: relicario-prompt.ts. Zonas: docs/relicario-areas.md. */
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
