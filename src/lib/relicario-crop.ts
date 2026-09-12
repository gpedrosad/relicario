export type BoundingBox = { x: number; y: number; w: number; h: number };

export type CropMargins = {
  horizontal: number;
  top: number;
  bottom: number;
};

export type DetectedFace = {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
};

export type PhotoQuality = "good" | "acceptable" | "poor";

export type PipelineDecision =
  | "crop"
  | "crop+upscale"
  | "outpaint"
  | "outpaint+upscale"
  | "cover";

export function containInBox(
  photoW: number,
  photoH: number,
  box: BoundingBox,
): BoundingBox & { scale: number } {
  const scale = Math.min(box.w / Math.max(photoW, 1), box.h / Math.max(photoH, 1));
  const w = Math.max(1, photoW * scale);
  const h = Math.max(1, photoH * scale);
  return {
    x: box.x + (box.w - w) / 2,
    y: box.y + (box.h - h) / 2,
    w,
    h,
    scale,
  };
}

export type PhotoAnalysis = {
  width: number;
  height: number;
  faces: DetectedFace[];
  groupBoundingBox: BoundingBox | null;
  expandedBox: BoundingBox | null;
  idealCrop: BoundingBox | null;
  crop: BoundingBox | null;
  needsOutpainting: boolean;
  needsUpscale: boolean;
  detectionFailed: boolean;
  quality: PhotoQuality;
  decision: PipelineDecision;
};

export type CropPlanOptions = {
  outputSide: number;
  margins: { full: CropMargins; min: CropMargins; close: CropMargins };
};

/** Caras chicas respecto a la foto → márgenes más justos. */
export function marginsForFaceDistance(
  group: BoundingBox,
  imgW: number,
  imgH: number,
  margins: { min: CropMargins; close: CropMargins },
): CropMargins {
  const span = Math.max(group.w / Math.max(imgW, 1), group.h / Math.max(imgH, 1));
  const far = 0.07;
  const near = 0.28;
  const t = clamp((span - far) / (near - far), 0, 1);
  const mix = (a: number, b: number) => a + (b - a) * t;
  return {
    horizontal: mix(margins.close.horizontal, margins.min.horizontal),
    top: mix(margins.close.top, margins.min.top),
    bottom: mix(margins.close.bottom, margins.min.bottom),
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function unionFaces(faces: DetectedFace[]): BoundingBox | null {
  if (!faces.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const face of faces) {
    minX = Math.min(minX, face.x);
    minY = Math.min(minY, face.y);
    maxX = Math.max(maxX, face.x + face.width);
    maxY = Math.max(maxY, face.y + face.height);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function expandBox(box: BoundingBox, margins: CropMargins): BoundingBox {
  const padX = box.w * margins.horizontal;
  const padTop = box.h * margins.top;
  const padBottom = box.h * margins.bottom;
  return {
    x: box.x - padX,
    y: box.y - padTop,
    w: box.w + padX * 2,
    h: box.h + padTop + padBottom,
  };
}

export function smallestSquare(box: BoundingBox): BoundingBox {
  const side = Math.max(box.w, box.h, 1);
  return {
    x: box.x + box.w / 2 - side / 2,
    y: box.y + box.h / 2 - side / 2,
    w: side,
    h: side,
  };
}

export function centerSquare(imgW: number, imgH: number): BoundingBox {
  const side = Math.min(imgW, imgH);
  return {
    x: (imgW - side) / 2,
    y: (imgH - side) / 2,
    w: side,
    h: side,
  };
}

/** Mueve el cuadrado para que quepa y siga cubriendo `mustContain`. */
export function shiftSquareIntoImage(
  square: BoundingBox,
  mustContain: BoundingBox,
  imgW: number,
  imgH: number,
): BoundingBox | null {
  if (square.w > imgW + 0.5 || square.h > imgH + 0.5) return null;
  if (mustContain.w > imgW + 0.5 || mustContain.h > imgH + 0.5) return null;

  const minX = Math.max(0, mustContain.x + mustContain.w - square.w);
  const maxX = Math.min(imgW - square.w, mustContain.x);
  const minY = Math.max(0, mustContain.y + mustContain.h - square.h);
  const maxY = Math.min(imgH - square.h, mustContain.y);
  if (minX > maxX + 0.5 || minY > maxY + 0.5) return null;

  return {
    x: clamp(square.x, minX, maxX),
    y: clamp(square.y, minY, maxY),
    w: square.w,
    h: square.h,
  };
}

export function roundBox(
  box: BoundingBox,
  imgW?: number,
  imgH?: number,
): BoundingBox {
  let x = Math.round(box.x);
  let y = Math.round(box.y);
  let w = Math.max(1, Math.round(box.w));
  let h = Math.max(1, Math.round(box.h));
  if (imgW != null) {
    x = clamp(x, 0, Math.max(0, imgW - 1));
    w = Math.min(w, imgW - x);
  }
  if (imgH != null) {
    y = clamp(y, 0, Math.max(0, imgH - 1));
    h = Math.min(h, imgH - y);
  }
  return { x, y, w, h };
}

function decide(
  needsOutpainting: boolean,
  needsUpscale: boolean,
): PipelineDecision {
  if (needsOutpainting && needsUpscale) return "outpaint+upscale";
  if (needsOutpainting) return "outpaint";
  if (needsUpscale) return "crop+upscale";
  return "crop";
}

/** Mueve el rectángulo para que quepa y siga cubriendo `mustContain`. */
export function shiftRectIntoImage(
  rect: BoundingBox,
  mustContain: BoundingBox,
  imgW: number,
  imgH: number,
): BoundingBox | null {
  if (rect.w > imgW + 0.5 || rect.h > imgH + 0.5) return null;
  if (mustContain.w > rect.w + 0.5 || mustContain.h > rect.h + 0.5) return null;

  const minX = Math.max(0, mustContain.x + mustContain.w - rect.w);
  const maxX = Math.min(imgW - rect.w, mustContain.x);
  const minY = Math.max(0, mustContain.y + mustContain.h - rect.h);
  const maxY = Math.min(imgH - rect.h, mustContain.y);
  if (minX > maxX + 0.5 || minY > maxY + 0.5) return null;

  return {
    x: clamp(rect.x, minX, maxX),
    y: clamp(rect.y, minY, maxY),
    w: rect.w,
    h: rect.h,
  };
}

export type FaceScale = {
  maxHeight: number;
  maxWidth: number;
  targetHeight: number;
  minHeight: number;
  centerY: number;
};

function largestAspectRect(
  imgW: number,
  imgH: number,
  aspect: number,
  focus: BoundingBox,
  centerY: number,
): BoundingBox {
  let w: number;
  let h: number;
  if (imgW / Math.max(imgH, 1) >= aspect) {
    h = imgH;
    w = h * aspect;
  } else {
    w = imgW;
    h = w / Math.max(aspect, 0.001);
  }
  const cx = focus.x + focus.w / 2;
  const cy = focus.y + focus.h / 2;
  return {
    x: clamp(cx - w / 2, 0, Math.max(0, imgW - w)),
    y: clamp(cy - centerY * h, 0, Math.max(0, imgH - h)),
    w,
    h,
  };
}

/**
 * Recorte al ratio del hueco. Las caras no superan maxHeight/maxWidth.
 */
export function frameFacesForHole(
  width: number,
  height: number,
  faces: DetectedFace[],
  targetW: number,
  targetH: number,
  scale: FaceScale,
): BoundingBox | null {
  const group = unionFaces(faces);
  if (!group) return null;

  const aspect = targetW / Math.max(targetH, 1);
  const minH = group.h / Math.max(scale.maxHeight, 0.05);
  const minW = group.w / Math.max(scale.maxWidth, 0.05);
  const neededH = Math.max(minH, minW / aspect);
  const targetHpx = group.h / Math.max(scale.targetHeight, 0.05);
  const maxH = group.h / Math.max(scale.minHeight, 0.05);
  const cropH = Math.max(neededH, Math.min(targetHpx, maxH));
  const cropW = cropH * aspect;

  if (cropW > width + 0.5 || cropH > height + 0.5) {
    return roundBox(
      largestAspectRect(width, height, aspect, group, scale.centerY),
      width,
      height,
    );
  }

  const cx = group.x + group.w / 2;
  const cy = group.y + group.h / 2;
  const ideal = {
    x: cx - cropW / 2,
    y: cy - scale.centerY * cropH,
    w: cropW,
    h: cropH,
  };
  const placed =
    shiftRectIntoImage(ideal, group, width, height) ??
    {
      x: clamp(ideal.x, 0, width - cropW),
      y: clamp(ideal.y, 0, height - cropH),
      w: cropW,
      h: cropH,
    };
  return roundBox(placed, width, height);
}

/** Recorte 1:1 alrededor de las caras, siempre dentro de la foto. Sin outpaint. */
export function faceZoomCrop(
  width: number,
  height: number,
  faces: DetectedFace[],
  options: CropPlanOptions,
): BoundingBox | null {
  if (!faces.length) return null;
  const group = unionFaces(faces);
  if (!group) return null;

  const padding = marginsForFaceDistance(group, width, height, options.margins);
  const expanded = expandBox(group, padding);
  const placed =
    shiftSquareIntoImage(smallestSquare(expanded), expanded, width, height) ??
    shiftSquareIntoImage(smallestSquare(group), group, width, height);
  if (placed) return roundBox(placed, width, height);

  const ideal = smallestSquare(expanded);
  const clipped = roundBox(ideal, width, height);
  if (clipped.w < 16 || clipped.h < 16) return null;
  return clipped;
}

export function planSquarePhoto(
  width: number,
  height: number,
  faces: DetectedFace[],
  options: CropPlanOptions,
): PhotoAnalysis {
  const { outputSide, margins } = options;

  if (!faces.length) {
    const crop = centerSquare(width, height);
    const needsUpscale = crop.w < outputSide;
    return {
      width,
      height,
      faces,
      groupBoundingBox: null,
      expandedBox: null,
      idealCrop: crop,
      crop,
      needsOutpainting: false,
      needsUpscale,
      detectionFailed: true,
      quality: needsUpscale ? "poor" : "acceptable",
      decision: decide(false, needsUpscale),
    };
  }

  const group = unionFaces(faces);
  if (!group) {
    return planSquarePhoto(width, height, [], options);
  }

  const expandedFull = expandBox(group, margins.full);
  const expandedMin = expandBox(group, margins.min);
  const idealCrop = smallestSquare(expandedFull);

  const placed =
    shiftSquareIntoImage(idealCrop, expandedFull, width, height) ??
    shiftSquareIntoImage(smallestSquare(expandedMin), expandedMin, width, height) ??
    shiftSquareIntoImage(smallestSquare(group), group, width, height);

  if (placed) {
    const needsUpscale = placed.w < outputSide;
    const quality: PhotoQuality = needsUpscale
      ? placed.w < 256
        ? "poor"
        : "acceptable"
      : "good";
    return {
      width,
      height,
      faces,
      groupBoundingBox: group,
      expandedBox: expandedFull,
      idealCrop,
      crop: placed,
      needsOutpainting: false,
      needsUpscale,
      detectionFailed: false,
      quality,
      decision: decide(false, needsUpscale),
    };
  }

  const needsUpscale = idealCrop.w < outputSide;
  return {
    width,
    height,
    faces,
    groupBoundingBox: group,
    expandedBox: expandedFull,
    idealCrop,
    crop: idealCrop,
    needsOutpainting: true,
    needsUpscale,
    detectionFailed: false,
    quality: "poor",
    decision: decide(true, needsUpscale),
  };
}
