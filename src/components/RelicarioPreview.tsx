"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import RelicarioPhotoEditor, {
  exportRelicarioEdit,
} from "@/components/RelicarioPhotoEditor";
import LlaveroUpsellModal from "@/components/LlaveroUpsellModal";
import { RELICARIO, RELICARIO_HERO, RELICARIO_LLAVERO } from "@/lib/relicario-spec";
import type { PhotoBox, PhotoPan } from "@/lib/relicario-pan";
import {
  LANDING_GALLERY,
  overlaySrc,
  type GalleryItem,
} from "@/lib/relicario-finish";
import {
  LLAVERO_ADDON_ID,
  formatClp,
  toggleAddon,
} from "@/lib/addons";
import {
  BEFORE_CHECKOUT_EVENT,
  checkoutHref,
  checkoutTotals,
  requestCheckout,
  type BeforeCheckoutDetail,
  type CheckoutFrom,
} from "@/lib/checkout";
import { useProjectLocal } from "@/components/ProjectLocalProvider";
import {
  LOCAL_PROJECT_DEFAULT,
  readLocalProject,
  writeLocalProject,
} from "@/lib/local-project";

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

type OverlayHole = {
  src: string;
  seedXRatio: number;
  seedYRatio: number;
  alphaCut: number;
};

const holeMaskCache = new Map<string, Promise<HoleMask>>();

function getHoleMask(overlay: OverlayHole): Promise<HoleMask> {
  const cached = holeMaskCache.get(overlay.src);
  if (cached) return cached;
  const pending = buildHoleMask(overlay);
  holeMaskCache.set(overlay.src, pending);
  return pending;
}

async function buildHoleMask(overlay: OverlayHole): Promise<HoleMask> {
  const base = await loadImage(overlay.src);
  const width = base.naturalWidth;
  const height = base.naturalHeight;
  const tmp = document.createElement("canvas");
  tmp.width = width;
  tmp.height = height;
  const ctx = tmp.getContext("2d");
  if (!ctx) throw new Error("No se pudo leer el relicario");

  ctx.drawImage(base, 0, 0);
  const { data } = ctx.getImageData(0, 0, width, height);

  const seedX = Math.round(width * overlay.seedXRatio);
  const seedY = Math.round(height * overlay.seedYRatio);
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
    if (data[i * 4 + 3] >= overlay.alphaCut) continue;
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

const RELICARIO_OVERLAY: OverlayHole = {
  src: RELICARIO.src,
  seedXRatio: RELICARIO.hole.seedXRatio,
  seedYRatio: RELICARIO.hole.seedYRatio,
  alphaCut: RELICARIO.hole.alphaCut,
};

const LLAVERO_OVERLAY: OverlayHole = {
  src: RELICARIO_LLAVERO.src,
  seedXRatio: RELICARIO_LLAVERO.hole.seedXRatio,
  seedYRatio: RELICARIO_LLAVERO.hole.seedYRatio,
  alphaCut: RELICARIO_LLAVERO.hole.alphaCut,
};

export default function RelicarioPreview() {
  const { tienda, setTienda } = useProjectLocal();
  const finish = tienda.finish;
  const showLlavero = tienda.selected.includes(LLAVERO_ADDON_ID);
  const [catalogId, setCatalogId] = useState("hero");
  const viewingLlavero = catalogId === "llavero" || catalogId === "llavero-ref";
  const totals = checkoutTotals(tienda);
  const [result, setResult] = useState<string | null>(null);
  const [llaveroPreview, setLlaveroPreview] = useState<string | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [checkoutFrom, setCheckoutFrom] = useState<CheckoutFrom>("wow");
  const [preview, setPreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [modalIn, setModalIn] = useState(false);
  const [heroIn, setHeroIn] = useState(false);
  const [revealTick, setRevealTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [debugOverlay, setDebugOverlay] = useState<string | null>(null);
  const [photo, setPhoto] = useState<ImageBitmap | null>(null);
  const [goldImage, setGoldImage] = useState<HTMLImageElement | null>(null);
  const [silverImage, setSilverImage] = useState<HTMLImageElement | null>(null);
  const [llaveroImage, setLlaveroImage] = useState<HTMLImageElement | null>(null);
  const baseImage = finish === "dorado" ? goldImage : silverImage;
  const [hole, setHole] = useState<HoleMask | null>(null);
  const [llaveroHole, setLlaveroHole] = useState<HoleMask | null>(null);
  const [crop, setCrop] = useState<PhotoBox | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState<PhotoPan>({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const exportTimer = useRef<number>(0);
  const prevFinish = useRef(finish);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadImage(overlaySrc("dorado")),
      loadImage(overlaySrc("plateado")),
      getHoleMask(RELICARIO_OVERLAY),
      loadImage(RELICARIO_LLAVERO.src),
      getHoleMask(LLAVERO_OVERLAY),
    ]).then(([gold, silver, mask, llavero, llaveroMask]) => {
      if (!cancelled) {
        setGoldImage(gold);
        setSilverImage(silver);
        setHole(mask);
        setLlaveroImage(llavero);
        setLlaveroHole(llaveroMask);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (prevFinish.current === finish) return;
    prevFinish.current = finish;
    setCatalogId(finish);
  }, [finish]);

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

  useEffect(() => {
    if (!open) {
      setModalIn(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => setModalIn(true));
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!result || revealTick === 0) {
      setHeroIn(false);
      return;
    }
    setHeroIn(false);
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setHeroIn(true));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [result, revealTick]);

  const hideModal = (after?: () => void) => {
    setModalIn(false);
    window.setTimeout(() => {
      setOpen(false);
      after?.();
    }, 220);
  };

  const openModal = () => {
    setPreview(result);
    setError(null);
    setOpen(true);
  };

  useEffect(() => {
    const onOpenPhoto = () => {
      setPreview(result);
      setError(null);
      setOpen(true);
    };
    window.addEventListener("relicario:open-photo", onOpenPhoto);
    return () => window.removeEventListener("relicario:open-photo", onOpenPhoto);
  }, [result]);

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

  const composeOn = async (
    base: HTMLImageElement,
    mask: HoleMask,
    nextScale: number,
    nextPan: PhotoPan,
  ) => {
    if (!photo) return null;
    return exportRelicarioEdit(photo, base, mask, crop, nextScale, nextPan);
  };

  const composeCurrent = async () => {
    if (!photo || !baseImage || !hole) return preview;
    const url = await composeOn(baseImage, hole, scale, pan);
    if (!url) return preview;
    setPreview((current) => {
      if (current && current !== result && current !== url) URL.revokeObjectURL(current);
      return url;
    });
    return url;
  };

  const composeDisplay = async () => {
    if (!photo) return null;
    if (viewingLlavero && llaveroImage && llaveroHole) {
      return composeOn(llaveroImage, llaveroHole, 1, { x: 0, y: 0 });
    }
    if (!baseImage || !hole) return null;
    return composeOn(baseImage, hole, scale, pan);
  };

  const apply = async () => {
    const src = (await composeDisplay()) ?? (await composeCurrent()) ?? preview;
    if (!src) return;
    setResult((current) => {
      if (current && current !== src) URL.revokeObjectURL(current);
      return src;
    });
    hideModal(() => {
      setCatalogId(finish);
      setRevealTick((tick) => tick + 1);
    });
  };

  useEffect(() => {
    if (!photo || !result || !baseImage || !hole) return;
    let cancelled = false;
    composeDisplay().then((url) => {
      if (cancelled || !url) return;
      setResult((current) => {
        if (current && current !== url) URL.revokeObjectURL(current);
        return url;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [viewingLlavero, finish, baseImage]);

  useEffect(() => {
    if (!photo || !llaveroImage || !llaveroHole) return;
    let cancelled = false;
    composeOn(llaveroImage, llaveroHole, 1, { x: 0, y: 0 }).then((url) => {
      if (cancelled || !url) return;
      setLlaveroPreview((current) => {
        if (current && current !== url) URL.revokeObjectURL(current);
        return url;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [photo, crop, llaveroImage, llaveroHole]);

  useEffect(() => {
    const onBefore = (event: Event) => {
      if (!result || showLlavero) return;
      const custom = event as CustomEvent<BeforeCheckoutDetail>;
      event.preventDefault();
      openUpsell(custom.detail?.from ?? "wow");
    };
    window.addEventListener(BEFORE_CHECKOUT_EVENT, onBefore);
    return () => window.removeEventListener(BEFORE_CHECKOUT_EVENT, onBefore);
  }, [result, showLlavero]);

  const close = () => {
    if (loading) return;
    hideModal(() => {
      setError(null);
      setPreview((current) => {
        if (current && current !== result) URL.revokeObjectURL(current);
        return result;
      });
    });
  };

  const openUpsell = (from: CheckoutFrom) => {
    setCheckoutFrom(from);
    setUpsellOpen(true);
  };

  const goToCheckout = (href: string) => {
    router.push(href);
  };

  const goToBuy = () => {
    requestCheckout("wow", goToCheckout);
  };

  const persistLlavero = () => {
    const selected = tienda.selected.includes(LLAVERO_ADDON_ID)
      ? tienda.selected
      : toggleAddon(tienda.selected, LLAVERO_ADDON_ID);
    const next = { ...tienda, selected };
    writeLocalProject({
      ...(readLocalProject() ?? LOCAL_PROJECT_DEFAULT),
      tienda: next,
    });
    setTienda(next);
  };

  const finishUpsell = (add: boolean) => {
    if (add) persistLlavero();
    setUpsellOpen(false);
    const href = checkoutHref(checkoutFrom);
    window.setTimeout(() => {
      router.push(href);
    }, 0);
  };

  const pickGallery = (item: GalleryItem) => {
    setCatalogId(item.id);
    if (item.finish) {
      setTienda((current) => ({ ...current, finish: item.finish! }));
    }
  };

  const selectedGalleryItem = LANDING_GALLERY.find(
    (item) => item.id === catalogId,
  );
  const catalogSrc =
    catalogId === "llavero-ref"
        ? "/relicario-llavero-referencia.png"
        : catalogId === "llavero"
          ? "/images/relicario-llavero-editorial.png"
          : selectedGalleryItem?.src ?? RELICARIO_HERO.src;
  const showResultOnMain =
    Boolean(result) &&
    (viewingLlavero || catalogId === "dorado" || catalogId === "plateado");

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
      <div className="flex flex-col gap-2">
        <div className="relative aspect-[3/2] overflow-hidden bg-white">
          <Image
            src={catalogSrc}
            alt={
              viewingLlavero
                ? "Llavero de acero inoxidable"
                : catalogId === "hero"
                  ? "Relicario dorado puesto"
                  : `Relicario ${finish}`
            }
            width={
              catalogId === "hero" ? RELICARIO_HERO.width : RELICARIO.width
            }
            height={
              catalogId === "hero" ? RELICARIO_HERO.height : RELICARIO.height
            }
            preload
            className={`pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ease-out ${
              showResultOnMain && heroIn ? "opacity-0" : "opacity-100"
            }`}
          />
          {showResultOnMain && result ? (
            <img
              src={result}
              alt={
                viewingLlavero
                  ? "Tu foto en el llavero"
                  : "Tu foto en el relicario"
              }
              className={`pointer-events-none absolute inset-0 h-full w-full bg-white object-contain transition-all duration-700 ease-out ${
                heroIn ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
              }`}
            />
          ) : null}
        </div>

        <div className="flex gap-1.5">
          {LANDING_GALLERY.map((item) => {
            const active = catalogId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => pickGallery(item)}
                aria-pressed={active}
                className="flex w-14 flex-col gap-0.5 text-left"
              >
                <span
                  className={`relative aspect-square overflow-hidden border bg-white ${
                    active
                      ? "border-zinc-900 ring-1 ring-zinc-900/15"
                      : "border-zinc-200 hover:border-zinc-400"
                  }`}
                >
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                </span>
                <span
                  className={`text-[10px] leading-tight ${
                    active ? "font-semibold text-zinc-900" : "text-zinc-500"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {result ? (
        <div
          className={`flex flex-col gap-3 transition-all duration-700 ease-out ${
            heroIn ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <button
            onClick={goToBuy}
            className="primary-button w-full px-6"
          >
            Comprar este relicario · {formatClp(totals.total)}
          </button>
          <div className="flex items-center justify-center gap-4 text-sm">
            <button
              onClick={openModal}
              className="font-medium text-zinc-700 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline"
            >
              Cambiar foto
            </button>
            <button
              onClick={downloadResult}
              className="font-medium text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-800 hover:underline"
            >
              Descargar
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
                setRevealTick(0);
                setDebugInfo(null);
                setDebugOverlay(null);
                setLlaveroPreview((current) => {
                  if (current) URL.revokeObjectURL(current);
                  return null;
                });
                if (catalogId === "llavero" || catalogId === "llavero-ref") {
                  setCatalogId(finish);
                }
              }}
              className="font-medium text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-700 hover:underline"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={openModal}
          className="w-full border border-dashed border-[var(--color-border)] bg-white px-6 py-3 font-display text-xs tracking-[0.12em] uppercase transition-colors hover:border-black"
        >
          + Simular con tu foto
        </button>
      )}

      {open && (
        <div
          className={`fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] transition-opacity duration-200 editorial:items-center editorial:p-6 ${
            modalIn ? "opacity-100" : "opacity-0"
          }`}
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-modal-title"
            className={`flex max-h-[94svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[4px] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)] transition-all duration-200 editorial:max-h-[90vh] editorial:rounded-[4px] editorial:shadow-[0_20px_70px_rgba(0,0,0,0.28)] ${
              modalIn ? "translate-y-0 opacity-100 editorial:scale-100" : "translate-y-4 opacity-0 editorial:translate-y-0 editorial:scale-[0.98]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5 border-b border-[var(--color-border)] px-5 py-5 editorial:px-7 editorial:py-6">
              <div>
                <p className="editorial-label text-[var(--color-accent-caption)]">
                  Personaliza tu joya
                </p>
                <h2 id="photo-modal-title" className="mt-2 font-product text-[24px] leading-tight font-bold tracking-[-0.02em]">
                  {photo || preview ? "Tu relicario" : "Sube tu foto"}
                </h2>
                <p className="mt-2 max-w-[50ch] text-sm leading-5 text-[var(--color-text-muted)]">
                  {loading
                    ? LOADING_STAGES[loadingStage]
                    : photo
                      ? "Arrastra la foto para moverla. Usa + / − para agrandar o achicar."
                      : "Sube una foto. La encuadramos en el corazón y después la puedes ajustar."}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={loading}
                className="flex size-11 shrink-0 items-center justify-center border border-[var(--color-border)] text-black/45 transition-colors hover:border-black hover:text-black disabled:opacity-40"
                aria-label="Cerrar"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-5 editorial:px-7">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              {loading ? (
              <div className="relative my-5 overflow-hidden bg-[var(--color-editorial)]">
                <img
                  src={overlaySrc(finish)}
                  alt="Generando relicario"
                  className="max-h-[50vh] w-full object-contain opacity-80"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/75">
                  <span className="size-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-black" />
                  <p className="font-display text-xs tracking-[0.14em] uppercase">
                    {LOADING_STAGES[loadingStage]}
                  </p>
                </div>
              </div>
            ) : photo && baseImage && hole ? (
              <div className="min-h-0">
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
                className="my-5 flex min-h-[260px] w-full flex-col items-center justify-center gap-3 border border-dashed border-black/30 bg-[var(--color-editorial)] px-6 py-12 text-center transition-colors hover:border-black hover:bg-[var(--color-cream)]"
              >
                <span className="flex size-12 items-center justify-center rounded-full border border-[var(--color-accent)] text-xl" aria-hidden>+</span>
                <span className="font-display text-xs tracking-[0.16em] uppercase">Seleccionar una foto</span>
                <span className="max-w-[30ch] text-sm leading-5 text-[var(--color-text-muted)]">JPG, PNG o HEIC · Busca una imagen nítida y bien iluminada</span>
              </button>
            )}

            {error && (
              <p className="mb-4 border-l-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-[var(--color-border)] bg-white px-5 py-4 editorial:px-7 editorial:py-5">
              <button
                onClick={close}
                disabled={loading}
                className="min-h-11 border border-[var(--color-border)] px-4 font-display text-xs tracking-[0.1em] uppercase transition-colors hover:border-black disabled:opacity-40"
              >
                Cancelar
              </button>
              {(preview || photo || error) && (
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={loading}
                  className="min-h-11 border border-[var(--color-border)] px-4 font-display text-xs tracking-[0.1em] uppercase transition-colors hover:border-black disabled:opacity-60"
                >
                  Elegir otra
                </button>
              )}
              <button
                onClick={downloadResult}
                disabled={!preview || loading}
                className="min-h-11 border border-[var(--color-border)] px-4 font-display text-xs tracking-[0.1em] uppercase transition-colors hover:border-black disabled:cursor-not-allowed disabled:opacity-35"
              >
                Descargar
              </button>
              <button
                onClick={apply}
                disabled={!preview || loading}
                className="primary-button col-span-2 mt-1 px-4"
              >
                Usar esta foto
              </button>
            </div>
          </div>
        </div>
      )}

      <LlaveroUpsellModal
        open={upsellOpen}
        image={llaveroPreview}
        alreadyFreeShipping={totals.gratis}
        onAdd={() => finishUpsell(true)}
        onSkip={() => finishUpsell(false)}
        onClose={() => setUpsellOpen(false)}
      />
    </div>
  );
}
