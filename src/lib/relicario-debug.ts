import sharp from "sharp";
import type { BoundingBox, PhotoAnalysis } from "@/lib/relicario-crop";

function svgBox(
  box: BoundingBox,
  color: string,
  label: string,
) {
  const x = Math.round(box.x);
  const y = Math.round(box.y);
  const w = Math.max(1, Math.round(box.w));
  const h = Math.max(1, Math.round(box.h));
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${color}" stroke-width="3"/>`,
    `<text x="${x + 6}" y="${Math.max(16, y + 18)}" fill="${color}" font-size="16" font-family="sans-serif">${label}</text>`,
  ].join("");
}

export async function drawDebugOverlay(image: Buffer, analysis: PhotoAnalysis) {
  const parts: string[] = [];
  analysis.faces.forEach((face, index) => {
    parts.push(
      svgBox(
        { x: face.x, y: face.y, w: face.width, h: face.height },
        "#22c55e",
        `cara ${index + 1}`,
      ),
    );
  });
  if (analysis.groupBoundingBox) {
    parts.push(svgBox(analysis.groupBoundingBox, "#f97316", "grupo"));
  }
  if (analysis.idealCrop) {
    parts.push(svgBox(analysis.idealCrop, "#06b6d4", "1:1 ideal"));
  }
  if (analysis.needsOutpainting && analysis.idealCrop) {
    parts.push(svgBox(analysis.idealCrop, "#e11d48", "outpaint"));
  } else if (analysis.crop) {
    parts.push(svgBox(analysis.crop, "#2563eb", "crop"));
  }

  const svg = Buffer.from(
    `<svg width="${analysis.width}" height="${analysis.height}" xmlns="http://www.w3.org/2000/svg">${parts.join("")}</svg>`,
  );

  return sharp(image)
    .composite([{ input: svg, top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export function serializeAnalysis(analysis: PhotoAnalysis) {
  return {
    width: analysis.width,
    height: analysis.height,
    faces: analysis.faces,
    groupBoundingBox: analysis.groupBoundingBox,
    expandedBox: analysis.expandedBox,
    idealCrop: analysis.idealCrop,
    crop: analysis.crop,
    needsOutpainting: analysis.needsOutpainting,
    needsUpscale: analysis.needsUpscale,
    detectionFailed: analysis.detectionFailed,
    quality: analysis.quality,
    decision: analysis.decision,
    finalSide: analysis.crop
      ? Math.round(Math.max(analysis.crop.w, analysis.crop.h))
      : null,
  };
}
