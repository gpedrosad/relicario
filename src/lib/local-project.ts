import { ADDONS, VERSIONES } from "@/lib/addons";
import { aplicarFunnel, COSTOS_DEFAULT, type CostosInput } from "@/lib/costos";

export const LOCAL_PROJECT_KEY = "relicario.local.v1";

export type TiendaLocal = {
  selected: string[];
  versionId: string;
};

export type LocalProject = {
  costos: CostosInput;
  tienda: TiendaLocal;
};

export const TIENDA_DEFAULT: TiendaLocal = {
  selected: [],
  versionId: VERSIONES[0].id,
};

export const LOCAL_PROJECT_DEFAULT: LocalProject = {
  costos: COSTOS_DEFAULT,
  tienda: TIENDA_DEFAULT,
};

const ADDON_IDS = new Set(ADDONS.map((item) => item.id));
const VERSION_IDS = new Set(VERSIONES.map((item) => item.id));
const COSTOS_KEYS = Object.keys(COSTOS_DEFAULT) as (keyof CostosInput)[];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function parseCostos(raw: unknown): CostosInput {
  const saved = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const next = { ...COSTOS_DEFAULT };
  for (const key of COSTOS_KEYS) {
    if (isFiniteNumber(saved[key])) next[key] = saved[key];
  }
  return aplicarFunnel(next, {
    cpc: next.cpc,
    conversionWebPct: next.conversionWebPct,
  });
}

export function parseTienda(raw: unknown): TiendaLocal {
  const saved = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const selected = Array.isArray(saved.selected)
    ? saved.selected.filter((id): id is string => typeof id === "string" && ADDON_IDS.has(id))
    : [];
  const versionId =
    typeof saved.versionId === "string" && VERSION_IDS.has(saved.versionId)
      ? saved.versionId
      : TIENDA_DEFAULT.versionId;
  return { selected, versionId };
}

export function parseLocalProject(raw: unknown): LocalProject {
  const saved = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    costos: parseCostos(saved.costos),
    tienda: parseTienda(saved.tienda),
  };
}

export function readLocalProject(): LocalProject | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_PROJECT_KEY);
    if (!raw) return null;
    return parseLocalProject(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeLocalProject(project: LocalProject) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_PROJECT_KEY, JSON.stringify(project));
  } catch {
    // Quota or private mode: keep working in memory.
  }
}
