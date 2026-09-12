import sharp from "sharp";
import {
  frameFacesForHole,
  type DetectedFace,
  type PhotoAnalysis,
} from "@/lib/relicario-crop";
import { facesFromCutout } from "@/lib/relicario-detect";
import { placePhotoCover } from "@/lib/relicario-background";
import { flattenOutsideHeart } from "@/lib/relicario-mask";
import { drawDebugOverlay, serializeAnalysis } from "@/lib/relicario-debug";
import { RELICARIO, RELICARIO_REPLICATE } from "@/lib/relicario-spec";
import {
  createReplicateClient,
  dataUri,
  getReplicateToken,
  outputToImage,
} from "@/lib/replicate-client";

export { getReplicateToken };

export type EnhancePortraitResult = {
  bytes: Buffer;
  contentType: string;
  analysis: PhotoAnalysis;
  debugOverlay?: Buffer;
};

async function detectPeople(image: Buffer, origW: number, origH: number) {
  if (!process.env.REPLICATE_API_TOKEN?.trim()) {
    return { faces: [] as DetectedFace[], cutout: null as Buffer | null };
  }
  try {
    const replicate = createReplicateClient();
    const cutoutModel =
      process.env.REPLICATE_CUTOUT_MODEL?.trim() ||
      RELICARIO_REPLICATE.cutoutModel;
    const cutout = await replicate.run(cutoutModel as `${string}/${string}`, {
      input: { image: dataUri(image, "image/png"), preserve_alpha: true },
    });
    const cutoutImage = await outputToImage(cutout);
    return {
      faces: await facesFromCutout(cutoutImage.bytes, origW, origH),
      cutout: cutoutImage.bytes,
    };
  } catch (error) {
    console.error("relicario/cutout", error);
    return { faces: [] as DetectedFace[], cutout: null as Buffer | null };
  }
}

async function cropToFaces(
  image: Buffer,
  origW: number,
  origH: number,
  faces: DetectedFace[],
  targetW: number,
  targetH: number,
) {
  const zoom = frameFacesForHole(
    origW,
    origH,
    faces,
    targetW,
    targetH,
    RELICARIO.faceScale,
  );
  if (!zoom) {
    return { image, width: origW, height: origH, crop: null as null };
  }
  const cropped = await sharp(image)
    .extract({
      left: zoom.x,
      top: zoom.y,
      width: zoom.w,
      height: zoom.h,
    })
    .png()
    .toBuffer();
  return { image: cropped, width: zoom.w, height: zoom.h, crop: zoom };
}

function analysisForCover(
  width: number,
  height: number,
  faces: DetectedFace[],
  zoom: { x: number; y: number; w: number; h: number } | null,
  dest: { x: number; y: number; w: number; h: number },
): PhotoAnalysis {
  return {
    width,
    height,
    faces,
    groupBoundingBox: zoom,
    expandedBox: zoom,
    idealCrop: zoom,
    crop: dest,
    needsOutpainting: false,
    needsUpscale: Math.min(width, height) < RELICARIO.insert.outputSide,
    detectionFailed: faces.length === 0,
    quality: faces.length ? "good" : "acceptable",
    decision: "cover",
  };
}

export async function enhancePortrait(
  image: Buffer,
  options?: { debug?: boolean },
): Promise<EnhancePortraitResult> {
  image = await sharp(image).rotate().flatten({ background: "#ffffff" }).png().toBuffer();
  const meta = await sharp(image).metadata();
  const origW = meta.width ?? 0;
  const origH = meta.height ?? 0;
  if (!origW || !origH) {
    throw new Error("No se pudo leer la foto");
  }

  const { faces } = await detectPeople(image, origW, origH);
  const targetW = RELICARIO.hole.width * 2;
  const targetH = RELICARIO.hole.height * 2;
  const zoomed = await cropToFaces(image, origW, origH, faces, targetW, targetH);
  const { png, dest } = await placePhotoCover(zoomed.image, targetW, targetH);
  const bytes = await flattenOutsideHeart(png, targetW, targetH);
  const analysis = analysisForCover(origW, origH, faces, zoomed.crop, dest);

  return {
    bytes,
    contentType: "image/png",
    analysis,
    debugOverlay: options?.debug
      ? await drawDebugOverlay(image, analysis)
      : undefined,
  };
}

export function enhanceDebugPayload(
  result: EnhancePortraitResult,
) {
  return {
    image: result.bytes.toString("base64"),
    contentType: result.contentType,
    debug: {
      analysis: serializeAnalysis(result.analysis),
      overlay: result.debugOverlay?.toString("base64") ?? null,
      insert: RELICARIO.insert,
      outputSide: RELICARIO.insert.outputSide,
    },
  };
}
