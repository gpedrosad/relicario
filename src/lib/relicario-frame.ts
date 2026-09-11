import sharp from "sharp";
import { RELICARIO_REPLICATE } from "@/lib/relicario-spec";

export type Box = { x: number; y: number; w: number; h: number };

export type PersonLayout = {
  person: Box;
  head: Box;
  faceCx: number;
  group: boolean;
};

export type FramePlan = {
  originalImageSize: [number, number];
  originalImageLocation: [number, number];
  coversCanvas: boolean;
  fit: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function scaleBox(box: Box, sx: number, sy: number): Box {
  return {
    x: box.x * sx,
    y: box.y * sy,
    w: box.w * sx,
    h: box.h * sy,
  };
}

/**
 * Estima la cabeza a partir de la silueta, no de una foto concreta.
 * Cuerpo entero → zoom a cabeza. Selfie apretado → la cabeza ya es casi todo.
 * Varias personas → se trata el grupo entero.
 */
export function analyzeSilhouette(
  data: Buffer | Uint8Array,
  width: number,
  height: number,
  alphaMin = 24,
): PersonLayout | null {
  const rowMin = new Int32Array(height).fill(width);
  const rowMax = new Int32Array(height).fill(-1);
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      if (data[(row + x) * 4 + 3] <= alphaMin) continue;
      found = true;
      if (x < rowMin[y]) rowMin[y] = x;
      if (x > rowMax[y]) rowMax[y] = x;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (!found) return null;

  const person: Box = {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
  };
  const group = person.w / Math.max(person.h, 1) >= 1.08;

  let mass = 0;
  let massX = 0;
  const faceEnd = minY + Math.round(person.h * (group ? 0.5 : 0.34));
  for (let y = minY; y < faceEnd; y++) {
    if (rowMax[y] < 0) continue;
    const w = rowMax[y] - rowMin[y] + 1;
    massX += ((rowMin[y] + rowMax[y]) / 2) * w;
    mass += w;
  }
  const faceCx = mass > 0 ? massX / mass : minX + person.w / 2;

  const band = Math.max(3, Math.round(person.h * 0.14));
  let topWidth = 0;
  for (let y = minY; y < minY + band && y <= maxY; y++) {
    if (rowMax[y] >= 0) {
      topWidth = Math.max(topWidth, rowMax[y] - rowMin[y] + 1);
    }
  }
  if (topWidth < 8) topWidth = person.w * 0.5;

  const searchTo = minY + Math.round(person.h * 0.55);
  let flareY = -1;
  for (let y = minY + band; y < searchTo; y++) {
    if (rowMax[y] < 0) continue;
    const w = rowMax[y] - rowMin[y] + 1;
    if (w > topWidth * 1.22) {
      flareY = y;
      break;
    }
  }

  const ovalHead = topWidth * 1.2;
  let headH: number;
  if (group) {
    headH = person.h * 0.58;
  } else if (flareY > 0) {
    headH = flareY - minY;
  } else if (person.h > ovalHead * 2.5) {
    headH = ovalHead;
  } else if (person.h < ovalHead * 1.45) {
    headH = person.h * 0.62;
  } else {
    headH = Math.min(ovalHead, person.h * 0.5);
  }

  headH = clamp(headH, person.h * 0.12, person.h * 0.62);
  const headW = clamp(topWidth * 1.06, person.w * 0.35, person.w);

  const head: Box = {
    x: clamp(faceCx - headW / 2, person.x, person.x + person.w - headW),
    y: person.y,
    w: headW,
    h: headH,
  };

  return { person, head, faceCx, group };
}

export async function analyzeCutout(png: Buffer): Promise<PersonLayout | null> {
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return analyzeSilhouette(data, info.width, info.height);
}

export function layoutInOriginal(
  layout: PersonLayout,
  origW: number,
  origH: number,
  cutoutW: number,
  cutoutH: number,
): PersonLayout {
  const sx = origW / Math.max(cutoutW, 1);
  const sy = origH / Math.max(cutoutH, 1);
  return {
    person: scaleBox(layout.person, sx, sy),
    head: scaleBox(layout.head, sx, sy),
    faceCx: layout.faceCx * sx,
    group: layout.group,
  };
}

function fallbackLayout(origW: number, origH: number): PersonLayout {
  // Sin detección fiable se conserva la foto completa en la zona segura.
  // Inventar la ubicación de una cabeza puede recortar personas reales.
  return {
    person: { x: 0, y: 0, w: origW, h: origH },
    head: { x: 0, y: 0, w: origW, h: origH },
    faceCx: origW / 2,
    group: true,
  };
}

/**
 * Encaja a las personas enteras en la zona ancha del corazón.
 * La silueta detectada y el espacio reservado para completar pelo quedan dentro
 * del hueco; la escala es uniforme, sin deformar ni mover personas por separado.
 */
export function frameForHeart(
  origW: number,
  origH: number,
  layout: PersonLayout | null,
  targetW: number,
  targetH: number,
  safeArea?: Box,
): FramePlan {
  const heart = RELICARIO_REPLICATE.heart;
  const safe = safeArea ?? {
    x: targetW * (1 - heart.maxHeadWidth) / 2,
    y: targetH * heart.headTop,
    w: targetW * heart.maxHeadWidth,
    h: targetH * (heart.chinMax - heart.headTop),
  };
  const subject = layout ?? fallbackLayout(origW, origH);
  const { head, faceCx, group, person } = subject;
  const bounds = subjectBounds(subject);

  let fit = Math.min(
    safe.w / Math.max(bounds.w, 1),
    safe.h / Math.max(bounds.h, 1),
  );
  const maxSide = 4500;
  fit = Math.min(fit, maxSide / origW, maxSide / origH);

  const faceY = head.y + head.h * heart.eyesInHead;
  const subjectCx = group ? person.x + person.w / 2 : faceCx;

  let locX = safe.x + safe.w / 2 - subjectCx * fit;
  let locY = targetH * heart.faceCenterY - faceY * fit;

  const mapped = (box: Box) => ({
    x: box.x * fit + locX,
    y: box.y * fit + locY,
    w: box.w * fit,
    h: box.h * fit,
  });

  const shiftIntoSafe = () => {
    const body = mapped(bounds);
    if (body.x < safe.x) locX += safe.x - body.x;
    if (body.x + body.w > safe.x + safe.w) {
      locX += safe.x + safe.w - (body.x + body.w);
    }
    if (body.y < safe.y) locY += safe.y - body.y;
    if (body.y + body.h > safe.y + safe.h) {
      locY += safe.y + safe.h - (body.y + body.h);
    }
    const crown = mapped(head).y;
    if (crown < safe.y) locY += safe.y - crown;
  };
  shiftIntoSafe();
  shiftIntoSafe();

  const scaledW = origW * fit;
  const scaledH = origH * fit;
  const originalImageSize: [number, number] = [
    Math.max(1, Math.round(scaledW)),
    Math.max(1, Math.round(scaledH)),
  ];
  const originalImageLocation: [number, number] = [
    Math.round(locX),
    Math.round(locY),
  ];

  const coversCanvas =
    originalImageLocation[0] <= 0 &&
    originalImageLocation[1] <= 0 &&
    originalImageLocation[0] + originalImageSize[0] >= targetW &&
    originalImageLocation[1] + originalImageSize[1] >= targetH;

  return { originalImageSize, originalImageLocation, coversCanvas, fit };
}

/** Incluye el espacio reservado para completar pelo por encima de la foto. */
export function subjectBounds(layout: PersonLayout): Box {
  const x = Math.min(layout.person.x, layout.head.x);
  const y = Math.min(layout.person.y, layout.head.y);
  return {
    x, y,
    w: Math.max(layout.person.x + layout.person.w, layout.head.x + layout.head.w) - x,
    h: Math.max(layout.person.y + layout.person.h, layout.head.y + layout.head.h) - y,
  };
}
