import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Replicate from "replicate";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const python = "/tmp/relicario-img/bin/python";
const py = join(root, "scripts/llavero-png.py");
const tmp = "/tmp/relicario-llavero";
const silver = join(root, "public/relicario-colgante-plata.png");
const reference = join(root, "public/relicario-llavero-referencia.png");
const flattenedSilver = join(tmp, "plata-white.png");
const flattenedRef = join(tmp, "referencia-white.png");
const generated = join(tmp, "argolla.png");
const dest = join(root, "public/relicario-llavero.png");

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
  "Jewelry catalog photo of ONLY a polished sterling silver split-ring keychain.",
  "One circular key ring, thick, shiny, split at the top, same cool silver metal as image 1.",
  "Take the ring shape from image 2. No locket, no heart, no chain, no pendant, no jump ring clutter.",
  "The ring fills the frame. Studio lighting, pure white background, photorealistic.",
].join(" ");

spawnSync("mkdir", ["-p", tmp]);
runPython(["flatten", "--src", silver, "--dest", flattenedSilver]);
runPython(["flatten", "--src", reference, "--dest", flattenedRef]);

const replicate = new Replicate({ auth: loadToken() });
console.log("Generando argolla con google/nano-banana-pro…");

const edited = await replicate.run("google/nano-banana-pro", {
  input: {
    prompt,
    image_input: [readFileSync(flattenedSilver), readFileSync(flattenedRef)],
    aspect_ratio: "1:1",
    resolution: "2K",
    output_format: "png",
    safety_filter_level: "block_only_high",
    allow_fallback_model: true,
  },
});

writeFileSync(generated, await outputToBytes(edited));
runPython(["attach-ring", "--src", generated, "--dest", dest, "--reference", silver]);
console.log(`PNG listo: ${dest}`);
