"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import RelicarioPhotoEditor, {
  exportRelicarioEdit,
} from "@/components/RelicarioPhotoEditor";
import { RELICARIO, RELICARIO_HERO } from "@/lib/relicario-spec";
import type { PhotoBox, PhotoPan } from "@/lib/relicario-pan";

const LOADING_STAGES = [
  "Analizando foto...",
  "Preparando encuadre...",
  "Mejorando foto...",
  "Generando vista previa...",
];

type DebugInfo = {
  analysis: {
    decision: string;
    quality: string;
    needsOutpainting: boolean;
    needsUpscale: boolean;
    detectionFailed: boolean;
    width: number;
    height: number;
    faces: { x: number; y: number; width: number; height: number }[];
    groupBoundingBox: { x: number; y: number; w: number; h: number } | null;
    idealCrop: { x: number; y: number; w: number; h: number } | null;
    crop: { x: number; y: number; w: number; h: number } | null;
    finalSide: number | null;
  };
  overlay: string | null;
  outputSide: number;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

type HoleMask = {
  canvas: HTMLCanvasElement;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

let holeMaskPromise: Promise<HoleMask> | null = null;

async function getHoleMask(): Promise<HoleMask> {
  if (!holeMaskPromise) {
    holeMaskPromise = buildHoleMask();
  }
  return holeMaskPromise;
}

async function buildHoleMask(): Promise<HoleMask> {
  const base = await loadImage(RELICARIO.src);
  const width = base.naturalWidth;
  const height = base.naturalHeight;
  const tmp = document.createElement("canvas");
  tmp.width = width;
  tmp.height = height;
  const ctx = tmp.getContext("2d");
  if (!ctx) throw new Error("No se pudo leer el relicario");

  ctx.drawImage(base, 0, 0);
  const { data } = ctx.getImageData(0, 0, width, height);

  const seedX = Math.round(width * RELICARIO.hole.seedXRatio);
  const seedY = Math.round(height * RELICARIO.hole.seedYRatio);
  const visited = new Uint8Array(width * height);
  const stack = [seedX, seedY];
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  while (stack.length) {
    const y = stack.pop() as number;
    const x = stack.pop() as number;
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const i = y * width + x;
    if (visited[i]) continue;
    if (data[i * 4 + 3] >= RELICARIO.hole.alphaCut) continue;
    visited[i] = 1;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext("2d");
  if (!maskCtx) throw new Error("No se pudo crear la máscara");

  const maskData = maskCtx.createImageData(width, height);
  for (let i = 0; i < visited.length; i++) {
    maskData.data[i * 4 + 3] = visited[i] ? 255 : 0;
  }
  maskCtx.putImageData(maskData, 0, 0);

  return { canvas: maskCanvas, minX, minY, maxX, maxY };
}

async function loadOrientedBitmap(file: File) {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

async function prepareUpload(file: File) {
  const bitmap = await loadOrientedBitmap(file);
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo preparar la foto");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("No se pudo comprimir"))),
      "image/jpeg",
      0.92,
    );
  });

  return new File([blob], "retrato.jpg", { type: "image/jpeg" });
}

function isDebugEnabled() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("debug");
}

function fileFromBase64(base64: string, type: string, name: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type });
}

async function frameOnServer(file: File, debug: boolean) {
  const body = new FormData();
  body.append("image", file);
  if (debug) body.append("debug", "1");

  const response = await fetch("/api/relicario/enhance", {
    method: "POST",
    body,
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: string;
    crop?: PhotoBox | null;
    width?: number;
    height?: number;
    debug?: DebugInfo | null;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "No se pudo encuadrar la foto");
  }

  return {
    crop: payload?.crop ?? null,
    debug: payload?.debug ?? null,
  };
}

export default function RelicarioPreview() {
  const [result, setResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [debugOverlay, setDebugOverlay] = useState<string | null>(null);
  const [photo, setPhoto] = useState<ImageBitmap | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [hole, setHole] = useState<HoleMask | null>(null);
  const [crop, setCrop] = useState<PhotoBox | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState<PhotoPan>({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const exportTimer = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadImage(RELICARIO.src), getHoleMask()]).then(([image, mask]) => {
      if (!cancelled) {
        setBaseImage(image);
        setHole(mask);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => {
      setLoadingStage((current) =>
        Math.min(current + 1, LOADING_STAGES.length - 1),
      );
    }, 2500);
    return () => window.clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (!photo || !baseImage || !hole) return;
    window.clearTimeout(exportTimer.current);
    exportTimer.current = window.setTimeout(() => {
      exportRelicarioEdit(photo, baseImage, hole, crop, scale, pan).then((url) => {
        setPreview((current) => {
          if (current && current !== result) URL.revokeObjectURL(current);
          return url;
        });
      });
    }, 60);
    return () => window.clearTimeout(exportTimer.current);
  }, [photo, baseImage, hole, crop, scale, pan, result]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setError(null);
    setLoadingStage(0);
    setLoading(true);
    setDebugInfo(null);
    setDebugOverlay((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setPreview((current) => {
      if (current && current !== result) URL.revokeObjectURL(current);
      return null;
    });

    try {
      const prepared = await prepareUpload(file);
      const framed = await frameOnServer(prepared, isDebugEnabled());
      const bitmap = await loadOrientedBitmap(prepared);
      setPhoto((current) => {
        current?.close();
        return bitmap;
      });
      setCrop(framed.crop);
      setScale(1);
      setPan({ x: 0, y: 0 });
      setDebugInfo(framed.debug);
      if (framed.debug?.overlay) {
        const overlayFile = fileFromBase64(
          framed.debug.overlay,
          "image/png",
          "debug.png",
        );
        setDebugOverlay(URL.createObjectURL(overlayFile));
      }
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "No se pudo ajustar la foto";
      setError(message);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const composeCurrent = async () => {
    if (!photo || !baseImage || !hole) return preview;
    const url = await exportRelicarioEdit(photo, baseImage, hole, crop, scale, pan);
    setPreview((current) => {
      if (current && current !== result && current !== url) URL.revokeObjectURL(current);
      return url;
    });
    return url;
  };

  const apply = async () => {
    const src = (await composeCurrent()) ?? preview;
    if (!src) return;
    setResult((current) => {
      if (current && current !== src) URL.revokeObjectURL(current);
      return src;
    });
    setOpen(false);
  };

  const close = () => {
    if (loading) return;
    setOpen(false);
    setError(null);
    setPreview((current) => {
      if (current && current !== result) URL.revokeObjectURL(current);
      return result;
    });
  };

  const downloadResult = async () => {
    const src = (await composeCurrent()) ?? preview ?? result;
    if (!src) return;
    const link = document.createElement("a");
    link.href = src;
    link.download = "relicario-con-mi-foto.png";
    link.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl bg-zinc-50">
        {result ? (
          <img
            src={result}
            alt="Tu foto en el relicario"
            className="h-full w-full bg-white object-contain"
          />
        ) : (
          <Image
            src={RELICARIO_HERO.src}
            alt="Relicario de plata"
            width={RELICARIO_HERO.width}
            height={RELICARIO_HERO.height}
            preload
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setPreview(result);
            setError(null);
            setOpen(true);
          }}
          className="flex-1 rounded-full border border-zinc-300 px-6 py-3 font-semibold text-zinc-800 transition-colors hover:border-zinc-500"
        >
          {result ? "Cambiar foto" : "Simular con tu foto"}
        </button>
        {result && (
          <>
            <button
              onClick={downloadResult}
              className="flex-1 rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-zinc-700"
            >
              Descargar resultado
            </button>
            <button
              onClick={() => {
                URL.revokeObjectURL(result);
                if (preview && preview !== result) URL.revokeObjectURL(preview);
                if (debugOverlay) URL.revokeObjectURL(debugOverlay);
                photo?.close();
                setPhoto(null);
                setCrop(null);
                setScale(1);
                setPan({ x: 0, y: 0 });
                setResult(null);
                setPreview(null);
                setDebugInfo(null);
                setDebugOverlay(null);
              }}
              className="rounded-full px-4 py-3 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800"
            >
              Quitar
            </button>
          </>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={close}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold tracking-tight">
              {photo || preview ? "Tu relicario" : "Sube tu foto"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {loading
                ? LOADING_STAGES[loadingStage]
                : photo
                  ? "Arrastra la foto para moverla. Usa + / − para agrandar o achicar."
                  : "Sube una foto. La encuadramos en el corazón y después la puedes ajustar."}
            </p>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {loading ? (
              <div className="relative mt-4 overflow-hidden rounded-xl bg-white">
                <img
                  src={RELICARIO.src}
                  alt="Generando relicario"
                  className="max-h-[50vh] w-full object-contain opacity-80"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70">
                  <span className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
                  <p className="text-sm font-medium text-zinc-800">
                    {LOADING_STAGES[loadingStage]}
                  </p>
                </div>
              </div>
            ) : photo && baseImage && hole ? (
              <div className="mt-0 min-h-0 flex-1 overflow-auto">
                <RelicarioPhotoEditor
                  photo={photo}
                  base={baseImage}
                  hole={hole}
                  crop={crop}
                  scale={scale}
                  pan={pan}
                  onTransform={({ scale: nextScale, pan: nextPan }) => {
                    setScale(nextScale);
                    setPan(nextPan);
                  }}
                />
                {debugInfo && (
                  <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
                    <p className="font-semibold text-zinc-800">
                      Debug: {debugInfo.analysis.decision}
                    </p>
                    <p className="mt-1">
                      {debugInfo.analysis.width}×{debugInfo.analysis.height}
                      {debugInfo.analysis.finalSide
                        ? ` → ${debugInfo.analysis.finalSide}×${debugInfo.analysis.finalSide}`
                        : ""}
                      {` · calidad ${debugInfo.analysis.quality}`}
                      {debugInfo.analysis.detectionFailed ? " · sin caras" : ""}
                      {debugInfo.analysis.needsOutpainting ? " · outpaint" : ""}
                      {debugInfo.analysis.needsUpscale ? " · upscale" : ""}
                    </p>
                    <p className="mt-1">
                      caras {debugInfo.analysis.faces.length}
                      {debugInfo.analysis.groupBoundingBox
                        ? ` · grupo ${Math.round(debugInfo.analysis.groupBoundingBox.w)}×${Math.round(debugInfo.analysis.groupBoundingBox.h)}`
                        : ""}
                      {debugInfo.analysis.idealCrop
                        ? ` · 1:1 ${Math.round(debugInfo.analysis.idealCrop.w)}`
                        : ""}
                    </p>
                    {debugOverlay && (
                      <img
                        src={debugOverlay}
                        alt="Cajas de encuadre"
                        className="mt-2 max-h-48 w-full rounded-lg object-contain"
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 px-6 py-16 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-500 hover:text-zinc-800"
              >
                <span className="text-2xl">+</span>
                Haz clic para elegir una foto
              </button>
            )}

            {error && (
              <p className="mt-3 text-center text-sm text-red-600">{error}</p>
            )}

            <div className="mt-5 flex shrink-0 flex-wrap gap-3">
              <button
                onClick={close}
                disabled={loading}
                className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 font-semibold text-zinc-600 transition-colors hover:border-zinc-400 disabled:opacity-40"
              >
                Cancelar
              </button>
              {(preview || photo || error) && (
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={loading}
                  className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 font-semibold text-zinc-700 transition-colors hover:border-zinc-400 disabled:opacity-60"
                >
                  Elegir otra
                </button>
              )}
              <button
                onClick={downloadResult}
                disabled={!preview || loading}
                className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 font-semibold text-zinc-700 transition-colors hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Descargar
              </button>
              <button
                onClick={apply}
                disabled={!preview || loading}
                className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
