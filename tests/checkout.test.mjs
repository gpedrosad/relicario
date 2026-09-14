import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function load(filename) {
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2017,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  });
  const loaded = { exports: {} };
  new Function("require", "module", "exports", compiled.outputText)(
    require,
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}

function loadCheckout() {
  const addons = load(path.resolve("src/lib/addons.ts"));
  const finish = load(path.resolve("src/lib/relicario-finish.ts"));
  const checkoutPath = path.resolve("src/lib/checkout.ts");
  const compiled = ts.transpileModule(readFileSync(checkoutPath, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2017,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  });
  const loaded = { exports: {} };
  const fakeRequire = (id) => {
    if (id.includes("addons")) return addons;
    if (id.includes("local-project")) return {};
    if (id.includes("relicario-finish")) return finish;
    return require(id);
  };
  new Function("require", "module", "exports", compiled.outputText)(
    fakeRequire,
    loaded,
    loaded.exports,
  );
  return { ...addons, ...loaded.exports };
}

test("el llavero sale 8990 y desbloquea envío gratis", () => {
  const {
    LLAVERO_ADDON_ID,
    LLAVERO_PRECIO,
    ENVIO_COBRADO,
    ENVIO_GRATIS_DESDE,
    checkoutTotals,
  } = loadCheckout();

  assert.equal(LLAVERO_PRECIO, 8_990);
  assert.equal(ENVIO_GRATIS_DESDE, 42_990);

  const solo = checkoutTotals({ selected: [] });
  assert.equal(solo.envio, ENVIO_COBRADO);
  assert.equal(solo.gratis, false);
  assert.equal(solo.falta, 8_000);

  const conLlavero = checkoutTotals({ selected: [LLAVERO_ADDON_ID] });
  assert.equal(conLlavero.subtotal, 34_990 + 8_990);
  assert.equal(conLlavero.envio, 0);
  assert.equal(conLlavero.gratis, true);
  assert.equal(conLlavero.falta, 0);
});

test("cadena + segunda foto también cruzan el umbral", () => {
  const { checkoutTotals } = loadCheckout();
  const combo = checkoutTotals({ selected: ["cadena-premium", "segunda-foto"] });
  assert.equal(combo.subtotal, 34_990 + 5_990 + 2_990);
  assert.equal(combo.gratis, true);
  assert.equal(combo.envio, 0);
});

test("el checkout nombra el acabado dorado o plateado", () => {
  const { checkoutLines } = loadCheckout();
  const dorado = checkoutLines({ selected: [], finish: "dorado" });
  assert.match(dorado[0].detail, /Dorado/);
  const plateado = checkoutLines({ selected: [], finish: "plateado" });
  assert.match(plateado[0].detail, /Plateado/);
});

test("la segunda unidad desbloquea envío gratis", () => {
  const { SEGUNDA_UNIDAD_PRECIO, checkoutTotals } = loadCheckout();
  assert.equal(SEGUNDA_UNIDAD_PRECIO, 19_990);
  const dos = checkoutTotals({ selected: ["segunda-unidad"] });
  assert.equal(dos.subtotal, 34_990 + 19_990);
  assert.equal(dos.gratis, true);
  assert.equal(dos.envio, 0);
});

test("comprar va a completar, no a shopify", () => {
  const { checkoutHref, completarHref, requestCheckout } = loadCheckout();
  assert.equal(completarHref("wow"), "/completar?from=wow");
  assert.equal(checkoutHref("wow"), "/checkout?from=wow");
  let href = "";
  requestCheckout("comprar", (next) => {
    href = next;
  });
  assert.equal(href, "/completar?from=comprar");
});

test("un extra chico no alcanza el envío gratis", () => {
  const { ENVIO_COBRADO, checkoutTotals } = loadCheckout();
  const pack = checkoutTotals({ selected: ["pack-regalo"] });
  assert.equal(pack.gratis, false);
  assert.equal(pack.envio, ENVIO_COBRADO);
});
