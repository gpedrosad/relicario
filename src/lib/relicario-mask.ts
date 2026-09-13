import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { RELICARIO } from "@/lib/relicario-spec";
import { RELICARIO_REPLICATE } from "@/lib/relicario-spec";
import type { Box } from "@/lib/relicario-frame";

type HoleMask = {
  width: number;
  height: number;
  inside: Uint8Array;
};

let holePromise: Promise<HoleMask> | null = null;

async function loadHole(): Promise<HoleMask> {
  // Literales: si el path es dinámico, Turbopack traza todo el repo en el server bundle.
  const file = path.join(process.cwd(), "public", "relicario-colgante-plata.png");
  const { data, info } = await sharp(await readFile(file))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const seedX = Math.round(w * RELICARIO.hole.seedXRatio);
  const seedY = Math.round(h * RELICARIO.hole.seedYRatio);
  const inside = new Uint8Array(w * h);
  const q: number[] = [];

  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (inside[i]) return;
    if (data[i * 4 + 3] >= RELICARIO.hole.alphaCut) return;
    inside[i] = 1;
    q.push(x, y);
  };

  push(seedX, seedY);
  for (let qi = 0; qi < q.length; ) {
    const x = q[qi++];
    const y = q[qi++];
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  return { width: w, height: h, inside };
}

function photoRect(
  loc: [number, number],
  size: [number, number],
  targetW: number,
  targetH: number,
) {
  const left = Math.max(0, loc[0]);
  const top = Math.max(0, loc[1]);
  const width = Math.min(size[0] - Math.max(0, -loc[0]), targetW - left);
  const height = Math.min(size[1] - Math.max(0, -loc[1]), targetH - top);
  return { left, top, width, height };
}

async function heartOnCanvas(targetW: number, targetH: number) {
  if (!holePromise) holePromise = loadHole();
  const hole = await holePromise;
  const { minX, minY, width: holeW, height: holeH } = RELICARIO.hole;
  const raw = Buffer.alloc(holeW * holeH);

  for (let y = 0; y < holeH; y++) {
    for (let x = 0; x < holeW; x++) {
      const src = (minY + y) * hole.width + (minX + x);
      raw[y * holeW + x] = hole.inside[src] ? 255 : 0;
    }
  }

  return sharp(raw, {
    raw: { width: holeW, height: holeH, channels: 1 },
  })
    .resize(targetW, targetH, { kernel: sharp.kernel.nearest })
    // Sharp convierte a sRGB por defecto; los bucles requieren un byte por píxel.
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

/** Blanco = hueco del corazón (2×). */
export async function heartKeepMask(targetW: number, targetH: number) {
  const { data, info } = await heartOnCanvas(targetW, targetH);
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
    .png()
    .toBuffer();
}

/**
 * Mayor rectángulo dentro del hueco real.
 * No se ancla a la hendidura: si el top es el dip, el ancho queda de sello.
 */
export async function heartSafeArea(targetW: number, targetH: number, subject?: Box): Promise<Box> {
  const { data } = await heartOnCanvas(targetW, targetH);
  const heart = RELICARIO_REPLICATE.heart;
  const margin = Math.ceil(Math.min(targetW, targetH) * heart.edgeMargin);
  const center = Math.floor(targetW / 2);
  const rowLeft = new Int32Array(targetH).fill(-1);
  const rowRight = new Int32Array(targetH).fill(-1);
  for (let y = 0; y < targetH; y++) {
    if (!data[y * targetW + center]) continue;
    let left = center;
    let right = center;
    while (left > 0 && data[y * targetW + left - 1]) left--;
    while (right < targetW - 1 && data[y * targetW + right + 1]) right++;
    if (right - left < margin * 2) continue;
    rowLeft[y] = left + margin;
    rowRight[y] = right - margin;
  }

  let dip = 0;
  while (dip < targetH && !data[dip * targetW + center]) dip++;
  const minY = Math.max(Math.ceil(targetH * heart.headTop), dip + margin);
  const maxY = Math.floor(targetH * (subject ? heart.maxSubjectBottom : heart.chinMax));
  const subW = Math.max(subject?.w ?? 1, 1);
  const subH = Math.max(subject?.h ?? 1, 1);

  let best: Box | null = null;
  let bestScore = 0;
  for (let y1 = minY; y1 <= maxY; y1++) {
    if (rowLeft[y1] < 0 || rowRight[y1] <= rowLeft[y1]) continue;
    let left = 0;
    let right = targetW;
    for (let y0 = y1; y0 >= minY; y0--) {
      if (rowLeft[y0] < 0 || rowRight[y0] <= rowLeft[y0]) break;
      left = Math.max(left, rowLeft[y0]);
      right = Math.min(right, rowRight[y0]);
      const width = right - left;
      const height = y1 - y0 + 1;
      if (width < 8 || height < 8) continue;
      const score = subject
        ? Math.min(width / subW, height / subH)
        : width * height;
      if (score > bestScore) {
        bestScore = score;
        best = { x: left, y: y0, w: width, h: height };
      }
    }
  }
  if (!best) throw new Error("Hueco del relicario inválido");
  return best;
}

/**
 * Mayor rectángulo dentro de TODO el hueco (solo margen al metal).
 * Sirve para contain de la foto completa, no para un retrato bajo la hendidura.
 */
export async function largestFitRect(
  targetW: number,
  targetH: number,
  photoW: number,
  photoH: number,
): Promise<Box> {
  const { data } = await heartOnCanvas(targetW, targetH);
  const margin = Math.ceil(
    Math.min(targetW, targetH) * RELICARIO_REPLICATE.heart.edgeMargin,
  );
  const center = Math.floor(targetW / 2);
  const rowLeft = new Int32Array(targetH).fill(-1);
  const rowRight = new Int32Array(targetH).fill(-1);
  for (let y = 0; y < targetH; y++) {
    if (!data[y * targetW + center]) continue;
    let left = center;
    let right = center;
    while (left > 0 && data[y * targetW + left - 1]) left--;
    while (right < targetW - 1 && data[y * targetW + right + 1]) right++;
    if (right - left < margin * 2) continue;
    rowLeft[y] = left + margin;
    rowRight[y] = right - margin;
  }

  let minY = 0;
  while (minY < targetH && rowLeft[minY] < 0) minY++;
  let maxY = targetH - 1;
  while (maxY > minY && rowLeft[maxY] < 0) maxY--;

  const subW = Math.max(photoW, 1);
  const subH = Math.max(photoH, 1);
  let best: Box | null = null;
  let bestScore = 0;
  for (let y1 = minY; y1 <= maxY; y1++) {
    if (rowLeft[y1] < 0 || rowRight[y1] <= rowLeft[y1]) continue;
    let left = 0;
    let right = targetW;
    for (let y0 = y1; y0 >= minY; y0--) {
      if (rowLeft[y0] < 0 || rowRight[y0] <= rowLeft[y0]) break;
      left = Math.max(left, rowLeft[y0]);
      right = Math.min(right, rowRight[y0]);
      const width = right - left;
      const height = y1 - y0 + 1;
      if (width < 8 || height < 8) continue;
      const score = Math.min(width / subW, height / subH);
      if (score > bestScore) {
        bestScore = score;
        best = { x: left, y: y0, w: width, h: height };
      }
    }
  }
  if (!best) throw new Error("Hueco del relicario inválido");
  return best;
}

/** Filas del hueco real, incluidas las dos mitades separadas por la hendidura. */
export async function heartOutline(targetW: number, targetH: number) {
  const { data } = await heartOnCanvas(targetW, targetH);
  const rows: { y: number; spans: [number, number][] }[] = [];
  for (let step = 0; step <= 20; step++) {
    const y = Math.round((targetH - 1) * step / 20);
    const spans: [number, number][] = [];
    for (let x = 0; x < targetW; x++) {
      if (!data[y * targetW + x]) continue;
      const start = x;
      while (x + 1 < targetW && data[y * targetW + x + 1]) x++;
      spans.push([start, x]);
    }
    rows.push({ y, spans });
  }
  return rows;
}

/**
 * Blanco = generar (dentro del corazón, fuera de la foto).
 * Negro = no tocar (persona + fuera del corazón).
 */
export async function heartGenerateMask(
  loc: [number, number],
  size: [number, number],
  targetW: number,
  targetH: number,
) {
  const { data, info } = await heartOnCanvas(targetW, targetH);
  const mask = Buffer.from(data);
  const rect = photoRect(loc, size, info.width, info.height);
  for (let y = rect.top; y < rect.top + rect.height; y++) {
    for (let x = rect.left; x < rect.left + rect.width; x++) {
      if (x < 0 || y < 0 || x >= info.width || y >= info.height) continue;
      mask[y * info.width + x] = 0;
    }
  }

  let generate = false;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] > 200) {
      generate = true;
      break;
    }
  }

  const png = await sharp(mask, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
    .png()
    .toBuffer();

  return { png, generate };
}

export async function flattenOutsideHeart(
  image: Buffer,
  targetW: number,
  targetH: number,
) {
  const { data, info } = await heartOnCanvas(targetW, targetH);
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i++) {
    const o = i * 4;
    rgba[o] = RELICARIO.paperRgb.r;
    rgba[o + 1] = RELICARIO.paperRgb.g;
    rgba[o + 2] = RELICARIO.paperRgb.b;
    rgba[o + 3] = data[i];
  }
  const clip = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  return sharp(image)
    .resize(targetW, targetH, { fit: "fill" })
    .composite([{ input: clip, blend: "dest-in" }])
    .flatten({ background: RELICARIO.paperRgb })
    .png()
    .toBuffer();
}
