import { enhanceDebugPayload, enhancePortrait } from "@/lib/replicate";

export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("image");
    const debug =
      form.get("debug") === "1" ||
      process.env.RELICARIO_DEBUG === "1";

    if (!(file instanceof File)) {
      return Response.json({ error: "Sube una imagen" }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return Response.json({ error: "Formato no soportado" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return Response.json({ error: "La imagen es demasiado pesada" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await enhancePortrait(buffer, { debug });

    if (debug) {
      return Response.json(enhanceDebugPayload(result), {
        headers: { "Cache-Control": "no-store" },
      });
    }

    return new Response(new Uint8Array(result.bytes), {
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "no-store",
        "X-Relicario-Decision": result.analysis.decision,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo generar el retrato";
    console.error("relicario/enhance", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
