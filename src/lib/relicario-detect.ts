import sharp from "sharp";
import { analyzeSilhouette, layoutInOriginal } from "@/lib/relicario-frame";
import type { DetectedFace } from "@/lib/relicario-crop";

type Blob = { x: number; y: number; w: number; h: number; area: number };

function findBlobs(
  data: Buffer | Uint8Array,
  width: number,
  height: number,
  alphaMin = 24,
): Blob[] {
  const visited = new Uint8Array(width * height);
  const blobs: Blob[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = y * width + x;
      if (visited[start] || data[start * 4 + 3] <= alphaMin) continue;

      let minX = x;
      let minY = y;
      let maxX = x;
      let maxY = y;
      let area = 0;
      const stack = [x, y];
      visited[start] = 1;

      while (stack.length) {
        const cy = stack.pop() as number;
        const cx = stack.pop() as number;
        area += 1;
        if (cx < minX) minX = cx;
        if (cy < minY) minY = cy;
        if (cx > maxX) maxX = cx;
        if (cy > maxY) maxY = cy;
        const next = [
          cx + 1, cy, cx - 1, cy, cx, cy + 1, cx, cy - 1,
        ];
        for (let i = 0; i < next.length; i += 2) {
          const nx = next[i];
          const ny = next[i + 1];
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const ni = ny * width + nx;
          if (visited[ni] || data[ni * 4 + 3] <= alphaMin) continue;
          visited[ni] = 1;
          stack.push(nx, ny);
        }
      }

      blobs.push({
        x: minX,
        y: minY,
        w: maxX - minX + 1,
        h: maxY - minY + 1,
        area,
      });
    }
  }

  return blobs;
}

function blobToFace(blob: Blob): DetectedFace {
  const group = blob.w / Math.max(blob.h, 1) >= 1.08;
  const height = Math.max(8, blob.h * (group ? 0.58 : 0.4));
  return {
    x: blob.x,
    y: blob.y,
    width: blob.w,
    height,
    confidence: 0.8,
  };
}

export function facesFromSilhouette(
  data: Buffer | Uint8Array,
  width: number,
  height: number,
): DetectedFace[] {
  const minArea = width * height * 0.004;
  const blobs = findBlobs(data, width, height).filter((blob) => blob.area >= minArea);

  if (blobs.length >= 2) {
    return blobs.map(blobToFace);
  }

  const layout = analyzeSilhouette(data, width, height);
  if (!layout) return [];

  return [
    {
      x: layout.head.x,
      y: layout.head.y,
      width: layout.head.w,
      height: layout.head.h,
      confidence: 0.85,
    },
  ];
}

export async function facesFromCutout(
  png: Buffer,
  origW: number,
  origH: number,
): Promise<DetectedFace[]> {
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const faces = facesFromSilhouette(data, info.width, info.height);
  if (!faces.length) return [];

  const layout = {
    person: { x: 0, y: 0, w: info.width, h: info.height },
    head: { x: 0, y: 0, w: 1, h: 1 },
    faceCx: 0,
    group: false,
  };
  const mapped = layoutInOriginal(layout, origW, origH, info.width, info.height);
  const sx = mapped.person.w / Math.max(info.width, 1);
  const sy = mapped.person.h / Math.max(info.height, 1);

  return faces.map((face) => ({
    x: face.x * sx,
    y: face.y * sy,
    width: face.width * sx,
    height: face.height * sy,
    confidence: face.confidence,
  }));
}
