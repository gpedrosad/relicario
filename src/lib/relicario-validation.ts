import type { Box } from "@/lib/relicario-frame";

export type SubjectDetection = { label: string; confidence: number; box: Box };

/** Se descarta la imagen anotada del detector; sólo se utiliza su JSON. */
export function normalizeDetections(output: unknown) {
  if (!output || typeof output !== "object" || !("json_str" in output)
    || typeof output.json_str !== "string") {
    throw new Error("No se pudo verificar el contenido del relleno");
  }
  let values: unknown;
  try { values = JSON.parse(output.json_str); } catch {
    throw new Error("No se pudo verificar el contenido del relleno");
  }
  if (!Array.isArray(values)) throw new Error("No se pudo verificar el contenido del relleno");
  return { detections: values.map(value => ({
    label: value?.name,
    confidence: value?.confidence,
    bbox: [value?.box?.x1, value?.box?.y1, value?.box?.x2, value?.box?.y2],
  })) };
}

/** Sólo se aceptan detecciones estructuradas; una respuesta inválida no aprueba la foto. */
export function addedSubjects(output: unknown, originalPhoto: Box): SubjectDetection[] {
  if (!output || typeof output !== "object" || !("detections" in output)
    || !Array.isArray(output.detections)) {
    throw new Error("No se pudo verificar el contenido del relleno");
  }
  const added: SubjectDetection[] = [];
  for (const value of output.detections) {
    if (!value || typeof value.label !== "string" || !Number.isFinite(value.confidence)
      || !Array.isArray(value.bbox) || value.bbox.length !== 4
      || !value.bbox.every((n: unknown) => typeof n === "number" && Number.isFinite(n))) {
      throw new Error("No se pudo verificar el contenido del relleno");
    }
    if (value.confidence < 0.25 || !/person|face|human/i.test(value.label)) continue;
    const [x1, y1, x2, y2] = value.bbox as number[];
    if (x2 <= x1 || y2 <= y1) continue;
    const overlapW = Math.max(0, Math.min(x2, originalPhoto.x + originalPhoto.w) - Math.max(x1, originalPhoto.x));
    const overlapH = Math.max(0, Math.min(y2, originalPhoto.y + originalPhoto.h) - Math.max(y1, originalPhoto.y));
    const originalFraction = overlapW * overlapH / ((x2 - x1) * (y2 - y1));
    // Una cara debe existir mayormente en la foto. Un cuerpo puede prolongarse
    // más allá del borde, pero debe estar anclado al contenido original.
    const minimumOriginal = /face/i.test(value.label) ? 0.6 : 0.15;
    if (originalFraction < minimumOriginal) {
      added.push({ label: value.label, confidence: value.confidence,
        box: { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } });
    }
  }
  return added;
}
