import sharp from "sharp";
import type { BoundingBox } from "@/lib/relicario-crop";
import { RELICARIO } from "@/lib/relicario-spec";
import { dataUri, outputToImage } from "@/lib/replicate-client";
import { buildSquareOutpaintPrompt } from "@/lib/relicario-prompt";

export type OutpaintInput = {
  image: Buffer;
  mask: Buffer;
  prompt: string;
  targetWidth: number;
  targetHeight: number;
};

export type OutpaintResult = {
  bytes: Buffer;
  contentType: string;
  model: string;
};

export interface ImageOutpaintProvider {
  outpaint(input: OutpaintInput): Promise<OutpaintResult>;
}

type ReplicateRunner = {
  run: (
    model: `${string}/${string}` | `${string}/${string}:${string}`,
    options: { input: Record<string, unknown> },
  ) => Promise<unknown>;
};

export function resolveOutpaintModel() {
  return (
    process.env.REPLICATE_OUTPAINT_MODEL?.trim() ||
    "black-forest-labs/flux-fill-dev"
  );
}

export function createReplicateOutpaintProvider(
  runner: ReplicateRunner,
): ImageOutpaintProvider {
  return {
    async outpaint(input) {
      const model = resolveOutpaintModel();
      const output = await runner.run(model as `${string}/${string}`, {
        input: {
          image: dataUri(input.image, "image/png"),
          mask: dataUri(input.mask, "image/png"),
          prompt: input.prompt,
          output_format: "png",
        },
      });
      const result = await outputToImage(output);
      return { ...result, model };
    },
  };
}

/**
 * Canvas 1:1 con la foto original intacta. La máscara es blanca solo
 * donde faltan píxeles (convención habitual: blanco = generar).
 */
export async function squareOutpaintCanvas(
  image: Buffer,
  imgW: number,
  imgH: number,
  crop: BoundingBox,
) {
  const side = Math.max(1, Math.round(Math.max(crop.w, crop.h)));
  const pasteX = Math.round(-crop.x);
  const pasteY = Math.round(-crop.y);
  const canvas = await sharp({
    create: {
      width: side,
      height: side,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: image,
        left: pasteX,
        top: pasteY,
      },
    ])
    .png()
    .toBuffer();

  const mask = Buffer.alloc(side * side, 255);
  const left = Math.max(0, pasteX);
  const top = Math.max(0, pasteY);
  const right = Math.min(side, pasteX + imgW);
  const bottom = Math.min(side, pasteY + imgH);
  for (let y = top; y < bottom; y++) {
    if (right > left) mask.fill(0, y * side + left, y * side + right);
  }

  return {
    canvas,
    mask: await sharp(mask, {
      raw: { width: side, height: side, channels: 1 },
    })
      .png()
      .toBuffer(),
    side,
    pasteX,
    pasteY,
  };
}

/** Reponer los píxeles originales encima del resultado del modelo. */
export async function protectOriginalPixels(
  generated: Buffer,
  original: Buffer,
  pasteX: number,
  pasteY: number,
  side: number,
) {
  return sharp(generated)
    .resize(side, side, { fit: "fill" })
    .composite([
      {
        input: original,
        left: pasteX,
        top: pasteY,
      },
    ])
    .png()
    .toBuffer();
}

/** Si no hay modelo o falla: cuadrado con original intacto y marfil. */
export async function padSquareWithPaper(
  image: Buffer,
  imgW: number,
  imgH: number,
  crop: BoundingBox,
) {
  const side = Math.max(1, Math.round(Math.max(crop.w, crop.h)));
  const paper = {
    create: {
      width: side,
      height: side,
      channels: 3 as const,
      background: RELICARIO.paper,
    },
  };
  return sharp(paper)
    .composite([
      {
        input: image,
        left: Math.round(-crop.x),
        top: Math.round(-crop.y),
      },
    ])
    .png()
    .toBuffer();
}

export async function outpaintPhoto(options: {
  image: Buffer;
  imgW: number;
  imgH: number;
  crop: BoundingBox;
  provider?: ImageOutpaintProvider | null;
  targetAspectRatio?: number;
  preserveOriginal?: boolean;
}) {
  const crop = options.crop;
  const prepared = await squareOutpaintCanvas(
    options.image,
    options.imgW,
    options.imgH,
    crop,
  );

  if (!options.provider) {
    return padSquareWithPaper(options.image, options.imgW, options.imgH, crop);
  }

  const result = await options.provider.outpaint({
    image: prepared.canvas,
    mask: prepared.mask,
    prompt: buildSquareOutpaintPrompt(),
    targetWidth: prepared.side,
    targetHeight: prepared.side,
  });

  if (options.preserveOriginal === false) return result.bytes;
  return protectOriginalPixels(
    result.bytes,
    options.image,
    prepared.pasteX,
    prepared.pasteY,
    prepared.side,
  );
}
