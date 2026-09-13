import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Replicate from "replicate";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const python = "/tmp/relicario-img/bin/python";
const py = join(root, "scripts/llavero-png.py");
const tmp = "/tmp/relicario-colgante-plata";
const gold = join(root, "public/relicario-colgante.png");
const flattened = join(tmp, "gold-white.png");
const generated = join(tmp, "nano-banana-pro.png");
const cutout = join(tmp, "cutout.png");
const dest = join(root, "public/relicario-colgante-plata.png");

function loadToken() {
  const env = readFileSync(join(root, ".env.local"), "utf8");
  const match = env.match(/^REPLICATE_API_TOKEN=(.*)$/m);
  const token = match?.[1]?.trim();
  if (!token) throw new Error("Falta REPLICATE_API_TOKEN");
  return token;
}

function runPython(args) {
  const result = spawnSync(python, [py, ...args], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Falló el script PNG");
  }
  console.log(result.stdout.trim());
}

async function outputToBytes(output) {
  const item = Array.isArray(output) ? output[0] : output;
  if (item && typeof item === "object" && typeof item.blob === "function") {
    const blob = await item.blob();
    return Buffer.from(await blob.arrayBuffer());
  }
  const url =
    typeof item === "string"
      ? item
      : item instanceof URL
        ? item.href
        : typeof item?.url === "function"
          ? item.url()
          : item?.url;
  if (typeof url !== "string") throw new Error("Replicate no devolvió una imagen");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo bajar ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

const prompt = [
  "Edit this exact product photo of an open heart locket.",
  "Change ONLY the metal from yellow gold to polished sterling silver.",
  "Keep the identical composition, camera, scale, position, hinge, bail, rim thickness, lighting and reflections.",
  "Left heart stays a solid brushed silver interior. Right heart stays an empty open cut-out, a hole, not filled with metal.",
  "Photorealistic jewelry catalog shot, cool white silver metal, no yellow, no gold tint, studio lighting, pure white background.",
  "Do not add a chain, photo, engraving, gem, or extra jewelry. Do not redraw or resize the locket.",
].join(" ");

spawnSync("mkdir", ["-p", tmp]);
runPython(["flatten", "--src", gold, "--dest", flattened]);

const replicate = new Replicate({ auth: loadToken() });
console.log("Editando con google/nano-banana-pro…");

const edited = await replicate.run("google/nano-banana-pro", {
  input: {
    prompt,
    image_input: [readFileSync(flattened)],
    aspect_ratio: "match_input_image",
    resolution: "2K",
    output_format: "png",
    safety_filter_level: "block_only_high",
    allow_fallback_model: true,
  },
});

writeFileSync(generated, await outputToBytes(edited));
console.log("Nano Banana Pro listo. Sacando fondo con bria/remove-background…");

const bria = await replicate.run("bria/remove-background", {
  input: { image: readFileSync(generated) },
});
writeFileSync(cutout, await outputToBytes(bria));
runPython(["copy-alpha", "--src", cutout, "--dest", dest, "--reference", gold]);
console.log(`PNG listo: ${dest}`);
