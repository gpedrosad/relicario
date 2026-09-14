import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadAddons() {
  const filename = path.resolve("src/lib/addons.ts");
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", compiled.outputText)(require, loaded, loaded.exports);
  return loaded.exports;
}

function loadCostos() {
  const filename = path.resolve("src/lib/costos.ts");
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", compiled.outputText)(require, loaded, loaded.exports);
  return loaded.exports;
}

test("el pack suma caja y bolsa encima del empaque", () => {
  const { empaqueCosto, EMPAQUE_BASE, EMPAQUE_CON_PACK, COSTO_CAJA, COSTO_BOLSA, COSTOS_DEFAULT } = loadCostos();
  assert.equal(EMPAQUE_BASE, 500);
  assert.equal(COSTO_CAJA, 500);
  assert.equal(COSTO_BOLSA, 500);
  assert.equal(EMPAQUE_CON_PACK, 1_500);
  assert.equal(empaqueCosto(false), 500);
  assert.equal(empaqueCosto(true), 1_500);
  assert.equal(COSTOS_DEFAULT.empaque, 500);
});

test("el pack convive con la tarjeta y no existe caja suelta", () => {
  const { toggleAddon, addonsTotal, formatClp, ADDONS, PACK_REGALO_PRECIO, SEGUNDA_UNIDAD_PRECIO } = loadAddons();
  assert.equal(
    ADDONS.some((addon) => addon.id === "caja-premium"),
    false,
  );
  let selected = toggleAddon([], "tarjeta");
  selected = toggleAddon(selected, "pack-regalo");
  assert.deepEqual(selected, ["tarjeta", "pack-regalo"]);
  assert.equal(PACK_REGALO_PRECIO, 2_990);
  assert.equal(SEGUNDA_UNIDAD_PRECIO, 19_990);
  assert.equal(addonsTotal(["segunda-foto", "foto-extra"]), 2_990 + 2_000);
  assert.equal(formatClp(34990), "$34.990");
});
