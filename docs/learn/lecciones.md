# Lecciones

Cosas ya pagadas. No volver a descubrirlas.

## Deploy / build

- **2026-09 — Path dinámico a `reli.png`.** `path.join(process.cwd(), RELICARIO.file)` hizo que Turbopack trazara todo el repo (incluido `public/`) y Vercel cortara el build. Literales `public`, `reli.png` + `outputFileTracingIncludes` en el route de enhance.
- **2026-09 — `title` en `<rect>`.** React/TS no acepta `title` como prop de SVG. Tooltip = `<title>` hijo, o solo `aria-label`.
- **2026-09 — Hydration del dashboard.** Un `<title>` en el SVG raíz y `Intl` no determinista rompían el primer paint. `clp` / `%` fijos, sin `title` de documento dentro del chart.

- **2026-09-12 — Tres modelos por foto.** Flux + YOLO + reintento hacían el preview lento y caro. Con marfil en el hueco basta Bria para encuadrar.

- **2026-09-12 — Foto sello.** El área segura partía de la hendidura (angosta) y nunca se ensanchaba. Sin Flux se veía un recuadro chico. El rectángulo tiene que vivir en la zona ancha.

## Simulador

- Zoom 1:1 al box de las caras las deja gigantes en el corazón. Hay que topar el alto (~34%).
- Blur / viñeta / escena expandida se leen como un recorte. El hueco pide la foto encuadrada, nítida, con su fondo.
- Encajar **personas enteras** en la zona ancha. Recortar caras o el grupo se ve mal en el corazón.
- `coverScale` extra recorta la coronilla contra la hendidura de oro. El canvas ya es el ratio del hueco.
- No usar `imagenrelicario.png` para composite.

## Negocio

- $24.990 no sobrevive un CPA de mercado con estos costos. $34.990 es el piso cómodo, no un “precio alto”.
- El producto (pieza $4.500) no aprieta. Aprietan ads, el 5,8% y el envío neto.
- Si $400k–$500k de pauta dejan el CPA > $20.000, parar. No escalar para promediar.
- 20–30 piezas se acaban en el learning de Meta si pega. 50 es el mínimo para testear de verdad.

## Legal / captura

- Teléfono **antes** de generar: mata conversión y el consentimiento queda flojo (art. 12).
- Un “acepto todo” no sirve para foto + WhatsApp + ads. Tres momentos: cookies al entrar, foto al subir, WhatsApp después del wow.
- Mandar la foto sin compra: sí, **solo** con casilla de envío. El drip pide otra casilla. Sin número, no.
