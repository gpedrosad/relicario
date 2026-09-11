import Replicate from "replicate";
import sharp from "sharp";
import {
  analyzeCutout,
  frameForHeart,
  layoutInOriginal,
  subjectBounds,
  type PersonLayout,
} from "@/lib/relicario-frame";
import { placePhotoAndExtend, photoOutpaintInput } from "@/lib/relicario-background";
import { buildRelicarioPrompt } from "@/lib/relicario-prompt";
import {
  flattenOutsideHeart,
  heartGenerateMask,
  heartSafeArea,
} from "@/lib/relicario-mask";
import { RELICARIO, RELICARIO_REPLICATE } from "@/lib/relicario-spec";

export function getReplicateToken() {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    throw new Error("Falta REPLICATE_API_TOKEN en .env.local");
  }
  return token;
}

function firstOutput(output: unknown): unknown {
  return Array.isArray(output) ? output[0] : output;
}

function asUrlString(value: unknown): string | null {
  if (typeof value === "string" && /^https?:\/\//.test(value)) return value;
  if (value instanceof URL) return value.href;
  return null;
}

async function outputToImage(output: unknown) {
  const item = firstOutput(output);

  if (item && typeof item === "object" && "blob" in item) {
    const blobFn = (item as { blob?: unknown }).blob;
    if (typeof blobFn === "function") {
      const blob = (await blobFn.call(item)) as Blob;
      const bytes = Buffer.from(await blob.arrayBuffer());
      const contentType = blob.type.startsWith("image/")
        ? blob.type
        : "image/png";
      if (bytes.length === 0) {
        throw new Error("Replicate devolvió una imagen vacía");
      }
      return { bytes, contentType };
    }
  }

  let imageUrl = asUrlString(item);

  if (!imageUrl && item && typeof item === "object" && "url" in item) {
    const url = (item as { url: unknown }).url;
    imageUrl = asUrlString(typeof url === "function" ? url.call(item) : url);
  }

  if (!imageUrl) {
    throw new Error("Replicate no devolvió una imagen");
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("No se pudo descargar la imagen de Replicate");
  }

  const contentType = response.headers.get("content-type") ?? "image/png";
  const bytes = Buffer.from(await response.arrayBuffer());
  return { bytes, contentType };
}

function dataUri(bytes: Buffer, mime: string) {
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

async function photoLayer(
  image: Buffer,
  size: [number, number],
  loc: [number, number],
  targetW: number,
  targetH: number,
) {
  const resized = await sharp(image)
    .resize(size[0], size[1], { fit: "fill" })
    .toBuffer();

  const left = Math.max(0, -loc[0]);
  const top = Math.max(0, -loc[1]);
  const overlayW = Math.min(size[0] - left, targetW - Math.max(0, loc[0]));
  const overlayH = Math.min(size[1] - top, targetH - Math.max(0, loc[1]));
  if (overlayW <= 0 || overlayH <= 0) return null;

  const overlay = await sharp(resized)
    .extract({ left, top, width: overlayW, height: overlayH })
    .png()
    .toBuffer();

  return {
    overlay,
    left: Math.max(0, loc[0]),
    top: Math.max(0, loc[1]),
  };
}

export async function enhancePortrait(image: Buffer) {
  const replicate = new Replicate({ auth: getReplicateToken() });
  // Una única orientación y fuente opaca para detección, encuadre y protección.
  image = await sharp(image).rotate().flatten({ background: "#ffffff" }).png().toBuffer();
  const imageUri = dataUri(image, "image/png");
  const meta = await sharp(image).metadata();
  const origW = meta.width ?? 0;
  const origH = meta.height ?? 0;
  if (!origW || !origH) {
    throw new Error("No se pudo leer la foto");
  }

  const targetW = RELICARIO.hole.width * 2;
  const targetH = RELICARIO.hole.height * 2;

  let layout: PersonLayout | null = null;
  try {
    const cutoutModel =
      process.env.REPLICATE_CUTOUT_MODEL?.trim() ||
      RELICARIO_REPLICATE.cutoutModel;
    const cutout = await replicate.run(cutoutModel as `${string}/${string}`, {
      input: { image: imageUri, preserve_alpha: true },
    });
    const cutoutImage = await outputToImage(cutout);
    const cutoutMeta = await sharp(cutoutImage.bytes).metadata();
    const analyzed = await analyzeCutout(cutoutImage.bytes);
    if (analyzed) {
      layout = layoutInOriginal(
        analyzed,
        origW,
        origH,
        cutoutMeta.width ?? origW,
        cutoutMeta.height ?? origH,
      );
    }
  } catch (error) {
    console.error("relicario/cutout", error);
  }

  const completeTop = !layout || layout.head.y <= 1;
  const frameLayout = layout && completeTop ? {
    ...layout,
    head: { ...layout.head, y: layout.head.y - layout.head.h * 0.3, h: layout.head.h * 1.3 },
  } : layout;
  const safeArea = await heartSafeArea(targetW, targetH, frameLayout
    ? subjectBounds(frameLayout)
    : { x: 0, y: 0, w: origW, h: origH });
  const { originalImageSize, originalImageLocation } = frameForHeart(
    origW,
    origH,
    frameLayout,
    targetW,
    targetH,
    safeArea,
  );

  const placed = await placePhotoAndExtend(
    image,
    originalImageSize,
    originalImageLocation,
    targetW,
    targetH,
  );

  const { generate } = await heartGenerateMask(
    originalImageLocation,
    originalImageSize,
    targetW,
    targetH,
  );

  let portrait = placed;
  if (generate) {
    const fill = await photoOutpaintInput(placed, originalImageLocation, originalImageSize);
    const prompt = buildRelicarioPrompt({ completeTop });
    const fillModel =
      process.env.REPLICATE_FILL_MODEL?.trim() ||
      RELICARIO_REPLICATE.fillModel;
    const filled = await replicate.run(fillModel as `${string}/${string}`, {
      input: {
        prompt,
        image: dataUri(fill.image, "image/png"),
        mask: dataUri(fill.mask, "image/png"),
        prompt_upsampling: false,
        output_format: "png",
      },
    });
    const out = await outputToImage(filled);
    portrait = await sharp(out.bytes)
      .resize(targetW, targetH, { fit: "fill" })
      .png()
      .toBuffer();

    const original = await photoLayer(
      image,
      originalImageSize,
      originalImageLocation,
      targetW,
      targetH,
    );
    if (original) {
      portrait = await sharp(portrait)
        .composite([
          { input: original.overlay, left: original.left, top: original.top },
        ])
        .png()
        .toBuffer();
    }
  }

  const bytes = await flattenOutsideHeart(portrait, targetW, targetH);
  return { bytes, contentType: "image/png" };
}
