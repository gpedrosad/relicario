import Replicate from "replicate";

export function getReplicateToken() {
  const token = process.env.REPLICATE_API_TOKEN?.trim();
  if (!token) {
    throw new Error("Falta REPLICATE_API_TOKEN en .env.local");
  }
  return token;
}

export function createReplicateClient() {
  return new Replicate({ auth: getReplicateToken() });
}

function firstOutput(output: unknown): unknown {
  return Array.isArray(output) ? output[0] : output;
}

function asUrlString(value: unknown): string | null {
  if (typeof value === "string" && /^https?:\/\//.test(value)) return value;
  if (value instanceof URL) return value.href;
  return null;
}

export async function outputToImage(output: unknown) {
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

export function dataUri(bytes: Buffer, mime: string) {
  return `data:${mime};base64,${bytes.toString("base64")}`;
}
