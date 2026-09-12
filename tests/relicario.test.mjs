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

test("el crop 1:1 agrupa caras, se desplaza antes de pedir outpaint y no inventa composición", () => {
  const { planSquarePhoto, unionFaces, expandBox, smallestSquare } = modules()("@/lib/relicario-crop");
  const { RELICARIO } = modules()("@/lib/relicario-spec");
  const options = { outputSide: RELICARIO.insert.outputSide, margins: RELICARIO.cropMargins };

  const pair = [
    { x: 120, y: 80, width: 70, height: 80, confidence: 0.9 },
    { x: 210, y: 90, width: 70, height: 80, confidence: 0.9 },
  ];
  const group = unionFaces(pair);
  assert.equal(group.x, 120);
  assert.equal(group.w, 160);
  const expanded = expandBox(group, RELICARIO.cropMargins.full);
  assert.ok(expanded.x < group.x);
  assert.ok(expanded.y < group.y);
  assert.ok(expanded.w > group.w);
  const square = smallestSquare(expanded);
  assert.equal(square.w, square.h);

  const fitted = planSquarePhoto(900, 700, pair, options);
  assert.equal(fitted.needsOutpainting, false);
  assert.equal(fitted.detectionFailed, false);
  assert.ok(fitted.crop.x >= 0);
  assert.ok(fitted.crop.y >= 0);
  assert.ok(fitted.crop.x + fitted.crop.w <= 900);
  assert.ok(fitted.crop.y + fitted.crop.h <= 700);
  assert.ok(fitted.decision === "crop" || fitted.decision === "crop+upscale");

  const nearTop = planSquarePhoto(800, 1000, [
    { x: 300, y: 10, width: 80, height: 90, confidence: 0.9 },
  ], options);
  assert.equal(nearTop.needsOutpainting, false);
  assert.ok(nearTop.crop.y >= 0);
  assert.ok(nearTop.crop.y + nearTop.crop.h <= 1000);

  const againstEdge = planSquarePhoto(400, 150, [
    { x: 20, y: 20, width: 40, height: 40, confidence: 0.9 },
    { x: 340, y: 20, width: 40, height: 40, confidence: 0.9 },
  ], options);
  assert.equal(againstEdge.needsOutpainting, true);
  assert.match(againstEdge.decision, /outpaint/);

  const tiny = planSquarePhoto(2000, 2000, [
    { x: 900, y: 900, width: 20, height: 24, confidence: 0.9 },
  ], options);
  assert.equal(tiny.needsOutpainting, false);
  assert.equal(tiny.needsUpscale, true);

  const none = planSquarePhoto(800, 600, [], options);
  assert.equal(none.detectionFailed, true);
  assert.equal(none.needsOutpainting, false);
  assert.equal(none.crop.w, none.crop.h);
  assert.equal(none.crop.w, 600);
  assert.equal(none.crop.x, 100);

  const { faceZoomCrop, frameFacesForHole } = modules()("@/lib/relicario-crop");
  const zoom = faceZoomCrop(2000, 2000, [
    { x: 900, y: 880, width: 80, height: 90, confidence: 0.9 },
    { x: 1020, y: 890, width: 80, height: 90, confidence: 0.9 },
  ], options);
  assert.ok(zoom);
  assert.ok(zoom.w < 400, `lejos ${zoom.w}`);
  assert.ok(zoom.x > 400);
  const near = faceZoomCrop(800, 800, [
    { x: 220, y: 180, width: 360, height: 400, confidence: 0.9 },
  ], options);
  assert.ok(near);
  assert.ok(near.w > zoom.w, `cerca ${near.w} vs lejos ${zoom.w}`);
  assert.equal(faceZoomCrop(800, 600, [], options), null);

  const scale = RELICARIO.faceScale;
  const far = frameFacesForHole(2000, 2000, [
    { x: 900, y: 880, width: 80, height: 90, confidence: 0.9 },
    { x: 1020, y: 890, width: 80, height: 90, confidence: 0.9 },
  ], 1102, 984, scale);
  assert.ok(far);
  assert.ok(Math.abs(far.w / far.h - 1102 / 984) < 0.03, `ratio ${far.w / far.h}`);
  assert.ok(100 / far.h <= scale.maxHeight + 0.02, `alto cara ${100 / far.h}`);
  assert.ok(200 / far.w <= scale.maxWidth + 0.02, `ancho grupo ${200 / far.w}`);
  const closeUp = frameFacesForHole(800, 800, [
    { x: 220, y: 180, width: 360, height: 400, confidence: 0.9 },
  ], 1102, 984, scale);
  assert.ok(closeUp);
  assert.ok(closeUp.w > far.w);
  assert.equal(frameFacesForHole(800, 600, [], 1102, 984, scale), null);
});

test("el prompt distingue autocompletado de pelo y fondo sin inducir un diagrama", () => {
  const load = modules();
  const { buildRelicarioPrompt } = load("@/lib/relicario-prompt");
  const prompt = buildRelicarioPrompt({ completeTop: true });
  assert.match(prompt, /preserve the black region/);
  assert.match(prompt, /Never invent a missing face/);
  assert.match(prompt, /unoccupied background/);
  assert.doesNotMatch(prompt, /x=|y=|locket|heart-shaped/);
  const background = buildRelicarioPrompt({ completeTop: false });
  assert.match(background, /heads are already complete/);
  assert.doesNotMatch(background, /continue only that same hair/);
  const outpaint = load("@/lib/relicario-prompt").buildSquareOutpaintPrompt();
  assert.match(outpaint, /Do not modify existing faces/);
  assert.match(outpaint, /square composition/);
  assert.doesNotMatch(outpaint, /locket|heart-shaped/);
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

test("la foto encuadrada cubre el hueco con sus píxeles, sin blur ni marfil", async () => {
  const load = modules();
  const { RELICARIO } = load("@/lib/relicario-spec");
  const source = await sharp({
    create: { width: 300, height: 500, channels: 3, background: "#2266aa" },
  }).png().toBuffer();
  const { bytes, analysis } = await load("@/lib/replicate").enhancePortrait(source);
  assert.equal(analysis.decision, "cover");
  assert.equal(analysis.needsOutpainting, false);
  assert.equal(analysis.crop.w, 1102);
  assert.equal(analysis.crop.h, 984);
  const heart = await sharp(await load("@/lib/relicario-mask").heartKeepMask(1102, 984))
    .greyscale().raw().toBuffer();
  const actual = await sharp(bytes).removeAlpha().raw().toBuffer();
  const paper = [RELICARIO.paperRgb.r, RELICARIO.paperRgb.g, RELICARIO.paperRgb.b];
  const cx = Math.round(analysis.crop.x + analysis.crop.w / 2);
  const cy = Math.round(analysis.crop.y + analysis.crop.h / 2);
  const center = (cy * 1102 + cx) * 3;
  assert.deepEqual([...actual.subarray(center, center + 3)], [34, 102, 170]);
  let heartPixels = 0;
  let paperInHeart = 0;
  for (let y = 0; y < 984; y++) {
    for (let x = 0; x < 1102; x++) {
      if (heart[y * 1102 + x] < 200) continue;
      heartPixels += 1;
      const i = (y * 1102 + x) * 3;
      if (actual[i] === paper[0] && actual[i + 1] === paper[1] && actual[i + 2] === paper[2]) {
        paperInHeart += 1;
      }
    }
  }
  assert.ok(heartPixels > 10000);
  assert.ok(paperInHeart < heartPixels * 0.02, `marfil en hueco ${paperInHeart}`);
});

test("el rectángulo seguro de contain es más grande que el insert 1:1", async () => {
  const { largestFitRect } = modules()("@/lib/relicario-mask");
  const square = await largestFitRect(1102, 984, 800, 800);
  assert.ok(Math.min(square.w, square.h) > 493, `lado ${Math.min(square.w, square.h)}`);
  const wide = await largestFitRect(1102, 984, 1600, 900);
  assert.ok(wide.w > square.w * 0.9);
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

test("el ajuste aprovecha más área y protege cabeza y cuerpo", async () => {
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

test("la zona segura usa la parte ancha del corazón, no el ancho de la hendidura", async () => {
  const { heartSafeArea } = modules()("@/lib/relicario-mask");
  const safe = await heartSafeArea(1102, 984, { x: 0, y: 0, w: 800, h: 600 });
  assert.ok(safe.w > 1102 * 0.45, `ancho ${safe.w}`);
  assert.ok(safe.h > 984 * 0.35, `alto ${safe.h}`);
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


test("el arrastre y el zoom parten del crop y no destapan el hueco", () => {
  const { photoPlacement, clampPan, clampScale, PHOTO_EDIT } = modules()("@/lib/relicario-pan");
  const hole = { minX: 100, minY: 50, maxX: 299, maxY: 249 };
  const crop = { x: 20, y: 10, w: 80, h: 80 };
  const placed = photoPlacement(200, 200, hole, crop, 1, { x: 0, y: 0 });
  assert.ok(placed.s > 0);
  assert.ok(placed.dw > hole.maxX - hole.minX);
  const pushed = clampPan(200, 200, hole, crop, 1, { x: 4000, y: -4000 });
  const cover = photoPlacement(200, 200, hole, crop, 1, pushed);
  assert.ok(cover.dx <= hole.minX + 0.5);
  assert.ok(cover.dy <= hole.minY + 0.5);
  assert.ok(cover.dx + cover.dw >= hole.maxX + 0.5);
  assert.ok(cover.dy + cover.dh >= hole.maxY + 0.5);
  assert.equal(clampScale(0.1), PHOTO_EDIT.minScale);
  assert.equal(clampScale(9), PHOTO_EDIT.maxScale);
});

test("el cover llena el canvas con la foto original", async () => {
  const { placePhotoCover } = modules()("@/lib/relicario-background");
  const photo = await sharp({
    create: { width: 40, height: 80, channels: 3, background: "#2266aa" },
  }).png().toBuffer();
  const { png, dest } = await placePhotoCover(photo, 100, 80);
  assert.deepEqual(dest, { x: 0, y: 0, w: 100, h: 80 });
  const { data } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual([...data.subarray(0, 3)], [34, 102, 170]);
  const mid = (40 * 100 + 50) * 3;
  assert.deepEqual([...data.subarray(mid, mid + 3)], [34, 102, 170]);
});

test("el outpaint protege los píxeles originales con máscara y no llama IA si no hace falta", async () => {
  const { squareOutpaintCanvas, padSquareWithPaper } = modules()("@/lib/relicario-outpaint");
  const { RELICARIO } = modules()("@/lib/relicario-spec");
  const photo = await sharp({
    create: { width: 80, height: 60, channels: 3, background: "#2266aa" },
  }).png().toBuffer();
  const crop = { x: -20, y: -10, w: 120, h: 120 };
  const prepared = await squareOutpaintCanvas(photo, 80, 60, crop);
  assert.equal(prepared.side, 120);
  const mask = await sharp(prepared.mask).greyscale().raw().toBuffer();
  assert.equal(mask[0], 255);
  const inside = (prepared.pasteY + 5) * 120 + (prepared.pasteX + 5);
  assert.equal(mask[inside], 0);
  const padded = await padSquareWithPaper(photo, 80, 60, crop);
  const { data, info } = await sharp(padded).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual([...data.subarray(0, 3)], [
    RELICARIO.paperRgb.r, RELICARIO.paperRgb.g, RELICARIO.paperRgb.b,
  ]);
  const px = ((prepared.pasteY + 5) * info.width + (prepared.pasteX + 5)) * 3;
  assert.deepEqual([...data.subarray(px, px + 3)], [34, 102, 170]);
});

test("el insert usa marfil donde la foto no cubre, sin estirar bordes", async () => {
  const { placePhotoAndExtend } = modules()("@/lib/relicario-background");
  const { RELICARIO } = modules()("@/lib/relicario-spec");
  const photo = await sharp({
    create: { width: 40, height: 40, channels: 3, background: "#2266aa" },
  }).png().toBuffer();
  const placed = await placePhotoAndExtend(photo, [40, 40], [10, 10], 80, 80);
  const { data } = await sharp(placed).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual([...data.subarray(0, 3)], [
    RELICARIO.paperRgb.r, RELICARIO.paperRgb.g, RELICARIO.paperRgb.b,
  ]);
  const i = (15 * 80 + 15) * 3;
  assert.deepEqual([...data.subarray(i, i + 3)], [34, 102, 170]);
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

test("la validación distingue caras existentes, contexto y gente inventada", () => {
  const { addedSubjects } = modules()("@/lib/relicario-validation");
  const original = { x: 200, y: 250, w: 300, h: 400 };
  const added = addedSubjects({ detections: [
    { label: "face", confidence: 0.9, bbox: [250, 300, 340, 410] },
    { label: "person", confidence: 0.9, bbox: [200, 200, 510, 850] },
    { label: "person", confidence: 0.8, bbox: [650, 300, 800, 600] },
    { label: "face", confidence: 0.8, bbox: [220, 160, 290, 270] },
    { label: "tree", confidence: 0.9, bbox: [650, 300, 800, 600] },
  ] }, original);
  assert.equal(added.length, 2);
  assert.deepEqual(added.map(item => item.label), ["person", "face"]);
  assert.deepEqual(addedSubjects({ detections: [] }, original), []);
  assert.throws(() => addedSubjects({ error: "verification unavailable" }, original));
  assert.throws(() => addedSubjects({ detections: [{ label: "face", confidence: 1, bbox: [0, 1] }] }, original));
});

