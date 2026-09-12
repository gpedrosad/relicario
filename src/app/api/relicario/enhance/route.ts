import { enhancePortrait } from "@/lib/replicate";

export const maxDuration = 180;

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("image");

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
    const { bytes, contentType } = await enhancePortrait(buffer);

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo generar el retrato";
    console.error("relicario/enhance", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
