import sharp from "sharp";
import { dataUri, outputToImage } from "@/lib/replicate-client";

export type UpscaleInput = {
  image: Buffer;
  targetSide: number;
};

export type UpscaleResult = {
  bytes: Buffer;
  model: string;
};

export interface ImageUpscaleProvider {
  upscale(input: UpscaleInput): Promise<UpscaleResult>;
}

type ReplicateRunner = {
  run: (
    model: `${string}/${string}` | `${string}/${string}:${string}`,
    options: { input: Record<string, unknown> },
  ) => Promise<unknown>;
};

export function resolveUpscaleModel() {
  return process.env.REPLICATE_UPSCALE_MODEL?.trim() || "";
}

export function createSharpUpscaleProvider(): ImageUpscaleProvider {
  return {
    async upscale(input) {
      const bytes = await sharp(input.image)
        .resize(input.targetSide, input.targetSide, {
          fit: "cover",
          kernel: "lanczos3",
        })
        .png()
        .toBuffer();
      return { bytes, model: "sharp" };
    },
  };
}

export function createReplicateUpscaleProvider(
  runner: ReplicateRunner,
): ImageUpscaleProvider {
  const model = resolveUpscaleModel();
  if (!model) return createSharpUpscaleProvider();

  return {
    async upscale(input) {
      const output = await runner.run(model as `${string}/${string}`, {
        input: {
          image: dataUri(input.image, "image/png"),
          scale: 2,
        },
      });
      const result = await outputToImage(output);
      const bytes = await sharp(result.bytes)
        .resize(input.targetSide, input.targetSide, { fit: "cover" })
        .png()
        .toBuffer();
      return { bytes, model };
    },
  };
}

export async function upscaleIfNeeded(
  image: Buffer,
  targetSide: number,
  provider: ImageUpscaleProvider,
) {
  const meta = await sharp(image).metadata();
  const side = Math.min(meta.width ?? 0, meta.height ?? 0);
  if (side >= targetSide) {
    if (side === targetSide) return image;
    return sharp(image)
      .resize(targetSide, targetSide, { fit: "cover" })
      .png()
      .toBuffer();
  }
  return (await provider.upscale({ image, targetSide })).bytes;
}
