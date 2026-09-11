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
  const file = path.join(process.cwd(), RELICARIO.file);
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

/** Rectángulo para las cabezas, contenido en el hueco real con margen al metal. */
export async function heartSafeArea(targetW: number, targetH: number, subject?: Box): Promise<Box> {
  const { data } = await heartOnCanvas(targetW, targetH);
  const heart = RELICARIO_REPLICATE.heart;
  const margin = Math.ceil(Math.min(targetW, targetH) * 0.035);
  const center = Math.floor(targetW / 2);
  let dip = 0;
  while (dip < targetH && !data[dip * targetW + center]) dip++;
  const top = Math.max(Math.ceil(targetH * heart.headTop), dip + margin);
  const bottom = Math.floor(targetH * (subject ? 0.9 : heart.chinMax));
  let left = 0;
  let right = targetW - 1;
  let best: Box | null = null;
  let bestScale = 0;
  for (let y = top - margin; y <= bottom + margin; y++) {
    let rowLeft = center;
    let rowRight = center;
    if (y >= targetH || !data[y * targetW + center]) {
      if (subject && best) break;
      throw new Error("El PNG no tiene espacio suficiente para el retrato");
    }
    while (rowLeft > 0 && data[y * targetW + rowLeft - 1]) rowLeft--;
    while (rowRight < targetW - 1 && data[y * targetW + rowRight + 1]) rowRight++;
    left = Math.max(left, rowLeft + margin);
    right = Math.min(right, rowRight - margin);
    const candidateBottom = y - margin;
    if (subject && candidateBottom >= targetH * 0.5 && right > left) {
      const candidate = { x: left, y: top, w: right - left, h: candidateBottom - top };
      const scale = Math.min(candidate.w / Math.max(subject.w, 1), candidate.h / Math.max(subject.h, 1));
      if (scale > bestScale) {
        best = candidate;
        bestScale = scale;
      }
    }
  }
  if (best) return best;
  if (right <= left || bottom <= top) throw new Error("Hueco del relicario inválido");
  return { x: left, y: top, w: right - left, h: bottom - top };
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
    rgba[o] = 255;
    rgba[o + 1] = 255;
    rgba[o + 2] = 255;
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
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
}
