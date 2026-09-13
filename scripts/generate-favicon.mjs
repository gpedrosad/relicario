import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Replicate from "replicate";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadToken() {
  const env = readFileSync(join(root, ".env.local"), "utf8");
  const match = env.match(/^REPLICATE_API_TOKEN=(.*)$/m);
  const token = match?.[1]?.trim();
  if (!token) throw new Error("Falta REPLICATE_API_TOKEN");
  return token;
}

async function outputToText(output) {
  const item = Array.isArray(output) ? output[0] : output;
  if (item && typeof item === "object" && typeof item.text === "function") {
    return item.text();
  }
  if (item && typeof item === "object" && typeof item.blob === "function") {
    return (await item.blob()).text();
  }
  const url =
    typeof item === "string"
      ? item
      : item instanceof URL
        ? item.href
        : typeof item?.url === "function"
          ? item.url()
          : item?.url;
  if (typeof url !== "string") throw new Error("Replicate no devolvió un SVG");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo bajar ${response.status}`);
  return response.text();
}

const prompt = [
  "Minimal square app icon logo mark.",
  "Only one filled heart shape, classic even heart, flat gold color #C9A227.",
  "No people, no wings, no angel, no text, no letters, no locket details, no shading, no gradients, no extra objects.",
  "Thick simple geometric heart centered, transparent background.",
  "Must remain a clear gold heart at 16x16 pixels.",
].join(" ");

const dest = join(root, "src/app/icon.svg");
const replicate = new Replicate({ auth: loadToken() });
console.log("Generando favicon con recraft-ai/recraft-v3-svg (line_art)…");

const output = await replicate.run("recraft-ai/recraft-v3-svg", {
  input: {
    prompt,
    size: "1024x1024",
    style: "line_art",
  },
});

const svg = await outputToText(output);
writeFileSync(dest, svg);
console.log(`SVG listo: ${dest} (${svg.length} chars)`);
