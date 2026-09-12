import sharp from "sharp";
import { RELICARIO } from "@/lib/relicario-spec";

/** Foto encuadrada a cover del hueco: píxeles originales, sin blur ni viñeta. */
export async function placePhotoCover(
  image: Buffer,
  targetW: number,
  targetH: number,
) {
  return {
    png: await sharp(image)
      .resize(targetW, targetH, { fit: "cover", position: "centre" })
      .png()
      .toBuffer(),
    dest: { x: 0, y: 0, w: targetW, h: targetH },
  };
}

/**
 * Pega la foto sobre marfil. Lo que no cubre queda papel, no bordes estirados.
 */
export async function placePhotoAndExtend(
  image: Buffer,
  size: [number, number],
  loc: [number, number],
  targetW: number,
  targetH: number,
) {
  const paper = {
    create: {
      width: targetW,
      height: targetH,
      channels: 3 as const,
      background: RELICARIO.paper,
    },
  };
  const resized = await sharp(image)
    .resize(size[0], size[1], { fit: "fill" })
    .png()
    .toBuffer();

  const extractLeft = Math.max(0, -loc[0]);
  const extractTop = Math.max(0, -loc[1]);
  const extractW = Math.min(size[0] - extractLeft, targetW - Math.max(0, loc[0]));
  const extractH = Math.min(size[1] - extractTop, targetH - Math.max(0, loc[1]));
  if (extractW <= 0 || extractH <= 0) {
    return sharp(paper).png().toBuffer();
  }

  const input = await sharp(resized)
    .extract({
      left: extractLeft,
      top: extractTop,
      width: extractW,
      height: extractH,
    })
    .png()
    .toBuffer();

  return sharp(paper)
    .composite([
      {
        input,
        left: Math.max(0, loc[0]),
        top: Math.max(0, loc[1]),
      },
    ])
    .png()
    .toBuffer();
}

/** Outpainting: la foto queda visible como referencia y completamente protegida. */
export async function photoOutpaintInput(
  placed: Buffer,
  loc: [number, number],
  size: [number, number],
) {
  const { width = 0, height = 0 } = await sharp(placed).metadata();
  const mask = Buffer.alloc(width * height, 255);
  const left = Math.max(0, loc[0]);
  const right = Math.min(width, loc[0] + size[0]);
  for (let y = Math.max(0, loc[1]); y < Math.min(height, loc[1] + size[1]); y++) {
    if (right > left) mask.fill(0, y * width + left, y * width + right);
  }
  return {
    image: placed,
    mask: await sharp(mask, { raw: { width, height, channels: 1 } }).png().toBuffer(),
  };
}

/** Suaviza sólo el fondo en el borde de la foto; la silueta conserva sus píxeles. */
export async function blendPhotoBackground(original: Buffer, cutout: Buffer | null) {
  if (!cutout) return original;
  const { data, info } = await sharp(original).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const alpha = await sharp(cutout).ensureAlpha().extractChannel("alpha").raw().toBuffer();
  const feather = Math.max(1, Math.round(Math.min(info.width, info.height) * 0.06));
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = y * info.width + x;
      if (alpha[i] > 0) continue;
      const edge = Math.min(x, y, info.width - x - 1, info.height - y - 1);
      data[i * 4 + 3] = Math.round(255 * Math.min(1, edge / feather));
    }
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

/** La IA recibe solamente el contexto del fondo; la persona se repone después. */
export async function backgroundFillInput(
  placed: Buffer,
  cutoutOnCanvas: Buffer,
  missingMask: Buffer,
  heartMask: Buffer,
) {
  const { data: pixels, info } = await sharp(placed)
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const alpha = await sharp(cutoutOnCanvas).ensureAlpha()
    .extractChannel("alpha").raw().toBuffer();
  const stride = info.width + 1;
  const summed = new Uint32Array(stride * (info.height + 1));
  for (let y = 0; y < info.height; y++) {
    let row = 0;
    for (let x = 0; x < info.width; x++) {
      row += alpha[y * info.width + x] > 8 ? 1 : 0;
      summed[(y + 1) * stride + x + 1] = summed[y * stride + x + 1] + row;
    }
  }
  const missing = await sharp(missingMask).greyscale().raw().toBuffer();
  const heart = await sharp(heartMask).greyscale().raw().toBuffer();
  const mask = Buffer.alloc(missing.length);
  for (let i = 0; i < mask.length; i++) {
    const x = i % info.width;
    const y = Math.floor(i / info.width);
    const left = Math.max(0, x - 16);
    const right = Math.min(info.width, x + 17);
    const top = Math.max(0, y - 16);
    const bottom = Math.min(info.height, y + 17);
    const subject = summed[bottom * stride + right] - summed[top * stride + right]
      - summed[bottom * stride + left] + summed[top * stride + left] > 0;
    if (subject) {
      // Quitar también el pelo y sus bordes impide que el modelo los prolongue.
      pixels[i * info.channels] = 255;
      pixels[i * info.channels + 1] = 255;
      pixels[i * info.channels + 2] = 255;
    }
    // Generar hasta los bordes del canvas: un exterior blanco protegido provoca
    // halos y parches blancos dentro del corazón. El recorte se hace al final.
    mask[i] = subject || missing[i] || !heart[i] ? 255 : 0;
  }
  return {
    image: await sharp(pixels, { raw: info }).png().toBuffer(),
    mask: await sharp(mask, {
      raw: { width: info.width, height: info.height, channels: 1 },
    }).png().toBuffer(),
  };
}
