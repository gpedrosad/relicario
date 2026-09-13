"use client";

import { useEffect, useRef, useState } from "react";
import { RELICARIO } from "@/lib/relicario-spec";
import {
  PHOTO_EDIT,
  clampPan,
  clampScale,
  photoPlacement,
  type PhotoBox,
  type PhotoHole,
  type PhotoPan,
} from "@/lib/relicario-pan";

type HoleMask = PhotoHole & { canvas: HTMLCanvasElement };

let hintDismissed = false;

function MoveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4" />
    </svg>
  );
}

type Props = {
  photo: ImageBitmap;
  base: HTMLImageElement;
  hole: HoleMask;
  crop: PhotoBox | null;
  scale: number;
  pan: PhotoPan;
  onTransform: (next: { scale: number; pan: PhotoPan }) => void;
};

function eventPoint(event: { clientX: number; clientY: number }, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / Math.max(rect.width, 1)) * canvas.width,
    y: ((event.clientY - rect.top) / Math.max(rect.height, 1)) * canvas.height,
  };
}

function paint(
  canvas: HTMLCanvasElement,
  photo: ImageBitmap,
  base: HTMLImageElement,
  hole: HoleMask,
  crop: PhotoBox | null,
  scale: number,
  pan: PhotoPan,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { dx, dy, dw, dh } = photoPlacement(
    photo.width,
    photo.height,
    hole,
    crop,
    scale,
    pan,
  );
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = RELICARIO.paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(photo, dx, dy, dw, dh);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(hole.canvas, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(base, 0, 0);
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = RELICARIO.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";
}

export default function RelicarioPhotoEditor({
  photo,
  base,
  hole,
  crop,
  scale,
  pan,
  onTransform,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    pan: PhotoPan;
  } | null>(null);
  const pinchRef = useRef<{
    ids: [number, number];
    distance: number;
    scale: number;
  } | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const [showHint, setShowHint] = useState(false);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const panRef = useRef(pan);
  panRef.current = pan;

  const applyScale = (nextScale: number, nextPan = panRef.current) => {
    const clamped = clampScale(nextScale);
    onTransform({
      scale: clamped,
      pan: clampPan(photo.width, photo.height, hole, crop, clamped, nextPan),
    });
  };
  const applyScaleRef = useRef(applyScale);
  applyScaleRef.current = applyScale;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = RELICARIO.width;
    canvas.height = RELICARIO.height;
    paint(canvas, photo, base, hole, crop, scale, pan);
  }, [photo, base, hole, crop, scale, pan]);

  useEffect(() => {
    if (hintDismissed) return;
    setShowHint(false);
    const timer = window.setTimeout(() => {
      if (!hintDismissed) setShowHint(true);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [photo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -1 : 1;
      applyScaleRef.current(scaleRef.current + direction * PHOTO_EDIT.step);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    const point = eventPoint(event, canvas);
    pointersRef.current.set(event.pointerId, point);
    if (pointersRef.current.size === 2) {
      const points = [...pointersRef.current.values()];
      pinchRef.current = {
        ids: [...pointersRef.current.keys()] as [number, number],
        distance: Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y),
        scale,
      };
      dragRef.current = null;
      return;
    }
    dragRef.current = {
      pointerId: event.pointerId,
      x: point.x,
      y: point.y,
      pan,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = eventPoint(event, canvas);
    if (pointersRef.current.has(event.pointerId)) {
      pointersRef.current.set(event.pointerId, point);
    }
    if (pinchRef.current && pointersRef.current.size >= 2) {
      const points = [...pointersRef.current.values()];
      const distance = Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y,
      );
      if (pinchRef.current.distance > 8) {
        applyScale(pinchRef.current.scale * (distance / pinchRef.current.distance));
      }
      return;
    }
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (
      showHint &&
      Math.hypot(point.x - drag.x, point.y - drag.y) > 10
    ) {
      hintDismissed = true;
      setShowHint(false);
    }
    onTransform({
      scale,
      pan: clampPan(photo.width, photo.height, hole, crop, scale, {
        x: drag.pan.x + (point.x - drag.x),
        y: drag.pan.y + (point.y - drag.y),
      }),
    });
  };

  const endPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
    if (pinchRef.current?.ids.includes(event.pointerId)) pinchRef.current = null;
  };

  const holeLeft =
    ((RELICARIO.hole.minX + RELICARIO.hole.width / 2) / RELICARIO.width) * 100;
  const holeTop =
    ((RELICARIO.hole.minY + RELICARIO.hole.height / 2) / RELICARIO.height) * 100;

  return (
    <div className="mt-4">
      <div className="flex justify-center">
        <div
          className="relative w-full max-h-[36vh]"
          style={{
            aspectRatio: `${RELICARIO.width} / ${RELICARIO.height}`,
            maxWidth: "min(100%, calc(36vh * 1.5))",
          }}
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full cursor-grab touch-none rounded-xl bg-white active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
          />
          {showHint && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${holeLeft}%`, top: `${holeTop}%` }}
            >
              <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                <MoveIcon />
                Arrastra para ajustar
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => applyScale(scale - PHOTO_EDIT.step)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-xl font-semibold text-zinc-800 hover:border-zinc-500"
          aria-label="Achicar foto"
        >
          −
        </button>
        <p className="min-w-16 text-center text-sm font-medium text-zinc-600">
          {Math.round(scale * 100)}%
        </p>
        <button
          type="button"
          onClick={() => applyScale(scale + PHOTO_EDIT.step)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-xl font-semibold text-zinc-800 hover:border-zinc-500"
          aria-label="Agrandar foto"
        >
          +
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500">
        Arrastra para mover. Pellizca, rueda o usa + / − para el tamaño.
      </p>
    </div>
  );
}

export async function exportRelicarioEdit(
  photo: ImageBitmap,
  base: HTMLImageElement,
  hole: HoleMask,
  crop: PhotoBox | null,
  scale: number,
  pan: PhotoPan,
) {
  const canvas = document.createElement("canvas");
  canvas.width = RELICARIO.width;
  canvas.height = RELICARIO.height;
  paint(canvas, photo, base, hole, crop, scale, pan);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("No se pudo exportar"))),
      RELICARIO.exportMime,
    );
  });
  return URL.createObjectURL(blob);
}
