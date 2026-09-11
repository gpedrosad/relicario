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

test("el pack regalo reemplaza caja y tarjeta", () => {
  const { toggleAddon, addonsTotal, formatClp } = loadAddons();
  let selected = toggleAddon([], "caja-premium");
  selected = toggleAddon(selected, "tarjeta");
  selected = toggleAddon(selected, "pack-regalo");
  assert.deepEqual(selected, ["pack-regalo"]);
  selected = toggleAddon(selected, "caja-premium");
  assert.ok(selected.includes("caja-premium"));
  assert.ok(!selected.includes("pack-regalo"));
  assert.equal(addonsTotal(["segunda-foto", "foto-extra"]), 2_990 + 2_000);
  assert.equal(formatClp(34990), "$34.990");
});
