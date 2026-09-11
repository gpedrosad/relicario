import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import sharp from "sharp";

const require = createRequire(import.meta.url);

// Carga los módulos TS con sus aliases sin modificar la configuración de Next.
function modules(overrides = {}) {
  const cache = new Map();
  const load = (id) => {
    if (id in overrides) return overrides[id];
    if (!id.startsWith("@/")) return require(id);
    if (cache.has(id)) return cache.get(id).exports;
    const filename = path.resolve("src", `${id.slice(2)}.ts`);
    const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    });
    const loaded = { exports: {} };
    cache.set(id, loaded);
    new Function("require", "module", "exports", compiled.outputText)(load, loaded, loaded.exports);
    return loaded.exports;
  };
  return load;
}

test("la máscara nunca habilita generación sobre la foto, incluidos sus bordes", async () => {
  const { heartGenerateMask } = modules()("@/lib/relicario-mask");
  for (const [loc, size] of [[[100, 120], [300, 250]], [[-100, -80], [400, 360]]]) {
    const { png, generate } = await heartGenerateMask(loc, size, 551, 492);
    assert.equal(generate, true);
    const { data, info } = await sharp(png).greyscale().raw().toBuffer({ resolveWithObject: true });
    for (let y = Math.max(0, loc[1]); y < Math.min(492, loc[1] + size[1]); y++) {
      for (let x = Math.max(0, loc[0]); x < Math.min(551, loc[0] + size[0]); x++) {
        assert.equal(data[y * info.width + x], 0);
      }
    }
  }
  const covered = await heartGenerateMask([-50, -50], [700, 600], 551, 492);
  assert.equal(covered.generate, false);
});

test("el prompt distingue autocompletado de pelo y fondo sin inducir un diagrama", () => {
  const load = modules();
  const { buildRelicarioPrompt } = load("@/lib/relicario-prompt");
  const prompt = buildRelicarioPrompt({ completeTop: true });
  assert.match(prompt, /preserve the black region/);
  assert.match(prompt, /missing top/);
  assert.doesNotMatch(prompt, /x=|y=|locket|heart-shaped/);
  const background = buildRelicarioPrompt({ completeTop: false });
  assert.match(background, /heads are already complete/);
  assert.doesNotMatch(background, /complete the missing top/);
});

test("las personas entran enteras en la zona segura, sin recorte", async () => {
  const load = modules();
  const { frameForHeart } = load("@/lib/relicario-frame");
  const safe = await load("@/lib/relicario-mask").heartSafeArea(1102, 984);
  const layout = {
    person: { x: 80, y: 220, w: 1440, h: 520 },
    head: { x: 200, y: 220, w: 1200, h: 280 },
    faceCx: 800,
    group: true,
  };
  const plan = frameForHeart(1600, 900, layout, 1102, 984, safe);
  const left = layout.person.x * plan.fit + plan.originalImageLocation[0];
  const top = layout.person.y * plan.fit + plan.originalImageLocation[1];
  const right = left + layout.person.w * plan.fit;
  const bottom = top + layout.person.h * plan.fit;
  assert.ok(left >= safe.x - 1);
  assert.ok(top >= safe.y - 1);
  assert.ok(right <= safe.x + safe.w + 1);
  assert.ok(bottom <= safe.y + safe.h + 1);
  assert.equal(plan.coversCanvas, false);
});

test("la IA pinta fuera de la foto y se restauran los píxeles originales", async () => {
  const previous = process.env.REPLICATE_API_TOKEN;
  process.env.REPLICATE_API_TOKEN = "test-only";
  let fillCalls = 0;
  class FakeReplicate {
    async run(_model, { input }) {
      if (input.preserve_alpha) throw new Error("Detección no disponible en esta prueba");
      fillCalls += 1;
      const generated = await sharp({
        create: { width: 1102, height: 984, channels: 3, background: "#ff0000" },
      }).png().toBuffer();
      return { blob: async () => new Blob([generated], { type: "image/png" }) };
    }
  }
  try {
    const load = modules({ replicate: FakeReplicate });
    const source = await sharp({
      create: { width: 300, height: 500, channels: 3, background: "#2266aa" },
    }).png().toBuffer();
    const { bytes } = await load("@/lib/replicate").enhancePortrait(source);
    const { originalImageSize: size, originalImageLocation: loc } = load("@/lib/relicario-frame")
      .frameForHeart(300, 500, null, 1102, 984,
        await load("@/lib/relicario-mask").heartSafeArea(1102, 984, { x: 0, y: 0, w: 300, h: 500 }));
    const heart = await sharp(await load("@/lib/relicario-mask").heartKeepMask(1102, 984))
      .greyscale().raw().toBuffer();
    const actual = await sharp(bytes).removeAlpha().raw().toBuffer();
    let preserved = 0;
    let generated = 0;
    const left = Math.max(0, loc[0]);
    const top = Math.max(0, loc[1]);
    const right = Math.min(1102, loc[0] + size[0]);
    const bottom = Math.min(984, loc[1] + size[1]);
    for (let y = 0; y < 984; y++) {
      for (let x = 0; x < 1102; x++) {
        const i = y * 1102 + x;
        if (heart[i] < 200) continue;
        const inPhoto = x >= left && x < right && y >= top && y < bottom;
        const pixel = [...actual.subarray(i * 3, i * 3 + 3)];
        if (inPhoto) {
          assert.deepEqual(pixel, [34, 102, 170]);
          preserved += 1;
        } else {
          assert.deepEqual(pixel, [255, 0, 0]);
          generated += 1;
        }
      }
    }
    assert.equal(fillCalls, 1);
    assert.ok(preserved > 10000);
    assert.ok(generated > 1000);
  } finally {
    if (previous === undefined) delete process.env.REPLICATE_API_TOKEN;
    else process.env.REPLICATE_API_TOKEN = previous;
  }
});

test("el contorno de referencia coincide con los lóbulos y la hendidura reales", async () => {
  const { heartOutline, heartKeepMask } = modules()("@/lib/relicario-mask");
  const mask = await sharp(await heartKeepMask(551, 492)).greyscale().raw().toBuffer();
  const rows = await heartOutline(551, 492);
  assert.ok(rows.some(row => row.spans.length === 2));
  for (const { y, spans } of rows) {
    for (let x = 0; x < 551; x++) {
      assert.equal(spans.some(([a, b]) => x >= a && x <= b), mask[y * 551 + x] === 255);
    }
  }
});

test("el ajuste aprovecha más área y protege cabeza, cuerpo y espacio para completar pelo", async () => {
  const load = modules();
  const { heartSafeArea, heartKeepMask } = load("@/lib/relicario-mask");
  const { frameForHeart, subjectBounds } = load("@/lib/relicario-frame");
  const mask = await sharp(await heartKeepMask(1102, 984)).greyscale().raw().toBuffer();
  for (const [w, h] of [[400, 1200], [1200, 500], [800, 800]]) {
    const layout = {
      person: { x: 50, y: 0, w, h }, head: { x: 100, y: -80, w: 200, h: 300 },
      faceCx: 200, group: w > h,
    };
    const bounds = subjectBounds(layout);
    const safe = await heartSafeArea(1102, 984, bounds);
    const old = await heartSafeArea(1102, 984);
    const plan = frameForHeart(w + 100, h + 100, layout, 1102, 984, safe);
    const original = frameForHeart(w + 100, h + 100, layout, 1102, 984, old);
    assert.ok(plan.fit >= original.fit);
    for (let y = safe.y; y <= safe.y + safe.h; y++) {
      for (let x = safe.x; x <= safe.x + safe.w; x++) assert.equal(mask[y * 1102 + x], 255);
    }
    const [x, y] = plan.originalImageLocation;
    assert.ok(bounds.x * plan.fit + x >= safe.x - 1);
    assert.ok(bounds.y * plan.fit + y >= safe.y - 1);
    assert.ok((bounds.x + bounds.w) * plan.fit + x <= safe.x + safe.w + 1);
    assert.ok((bounds.y + bounds.h) * plan.fit + y <= safe.y + safe.h + 1);
  }
});

test("la zona de cabezas respeta el hueco real del PNG y el margen bajo la hendidura", async () => {
  const load = modules();
  const { heartSafeArea, heartKeepMask } = load("@/lib/relicario-mask");
  for (const [width, height] of [[551, 492], [1102, 984]]) {
    const safe = await heartSafeArea(width, height);
    const data = await sharp(await heartKeepMask(width, height)).greyscale().raw().toBuffer();
    for (let y = safe.y; y <= safe.y + safe.h; y++) {
      for (let x = safe.x; x <= safe.x + safe.w; x++) {
        assert.equal(data[y * width + x], 255);
      }
    }
    let dip = 0;
    while (!data[dip * width + Math.floor(width / 2)]) dip++;
    assert.ok(safe.y - dip >= height * 0.08);
  }
});


test("la unión suaviza el fondo sin volver transparente ni alterar a la persona", async () => {
  const { blendPhotoBackground } = modules()("@/lib/relicario-background");
  const source = await sharp({ create: {
    width: 100, height: 100, channels: 4, background: "#2266aa",
  } }).png().toBuffer();
  const subject = await sharp({ create: {
    width: 100, height: 100, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 },
  } }).composite([{
    input: await sharp({ create: { width: 20, height: 100, channels: 4, background: "#2266aa" } }).png().toBuffer(),
    left: 40, top: 0,
  }]).png().toBuffer();
  const bytes = await sharp(await blendPhotoBackground(source, subject)).raw().toBuffer();
  assert.equal(bytes[3], 0);
  for (let y = 0; y < 100; y++) {
    for (let x = 40; x < 60; x++) {
      const i = (y * 100 + x) * 4;
      assert.deepEqual([...bytes.subarray(i, i + 4)], [34, 102, 170, 255]);
    }
  }
});
