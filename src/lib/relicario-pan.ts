export type PhotoBox = { x: number; y: number; w: number; h: number };
export type PhotoHole = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};
export type PhotoPan = { x: number; y: number };

export const PHOTO_EDIT = {
  minScale: 0.55,
  maxScale: 2.8,
  step: 0.1,
} as const;

export function holeSize(hole: PhotoHole) {
  return {
    w: hole.maxX - hole.minX + 1,
    h: hole.maxY - hole.minY + 1,
  };
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function clampScale(scale: number) {
  return clamp(scale, PHOTO_EDIT.minScale, PHOTO_EDIT.maxScale);
}

export function photoView(
  photoW: number,
  photoH: number,
  crop: PhotoBox | null,
): PhotoBox {
  if (crop && crop.w > 0 && crop.h > 0) return crop;
  return { x: 0, y: 0, w: photoW, h: photoH };
}

export function photoPlacement(
  photoW: number,
  photoH: number,
  hole: PhotoHole,
  crop: PhotoBox | null,
  scale: number,
  pan: PhotoPan,
) {
  const view = photoView(photoW, photoH, crop);
  const { w: holeW, h: holeH } = holeSize(hole);
  const s = Math.max(holeW / view.w, holeH / view.h) * scale;
  return {
    dx: hole.minX + (holeW - view.w * s) / 2 - view.x * s + pan.x,
    dy: hole.minY + (holeH - view.h * s) / 2 - view.y * s + pan.y,
    dw: photoW * s,
    dh: photoH * s,
    s,
  };
}

/** Si la foto cubre el hueco, no deja ver el marfil. Si no, mantiene overlap. */
export function clampPan(
  photoW: number,
  photoH: number,
  hole: PhotoHole,
  crop: PhotoBox | null,
  scale: number,
  pan: PhotoPan,
): PhotoPan {
  const origin = photoPlacement(photoW, photoH, hole, crop, scale, {
    x: 0,
    y: 0,
  });
  const { w: holeW, h: holeH } = holeSize(hole);
  const covers = origin.dw >= holeW - 0.5 && origin.dh >= holeH - 0.5;
  if (covers) {
    return {
      x: clamp(pan.x, hole.minX + holeW - origin.dw - origin.dx, hole.minX - origin.dx),
      y: clamp(pan.y, hole.minY + holeH - origin.dh - origin.dy, hole.minY - origin.dy),
    };
  }
  const slack = 48;
  return {
    x: clamp(
      pan.x,
      hole.minX - origin.dw + slack - origin.dx,
      hole.minX + holeW - slack - origin.dx,
    ),
    y: clamp(
      pan.y,
      hole.minY - origin.dh + slack - origin.dy,
      hole.minY + holeH - slack - origin.dy,
    ),
  };
}
