# Log

Más nuevo arriba. Una entrada por hecho, no un diario.

## 2026-09-14

- Copy landing alineado al aviso. Foto: no se publica. Plazo: 5–7 días hábiles.
- Pauta: Meta. Se borró `docs/keywords-google.md`. Ads → `docs/ads-meta.md`. H10 muerta.
- H11: mix con CPA de plan $13.000 → cobro ~$41.500, utilidad ~$15.100 (sin extras ~$12.100).
- Addons fuera de la landing y fuera de Shopify. 2ª unidad y pack se marcan en `/completar`. De ahí se va a `/checkout`. Landing: foto, acabado, comprar.
- No se vende caja suelta. Se sacó `caja-premium` de extras. El pack es el único SKU de caja + bolsa. Pedido China: 12 cajas (mismo 20% que las bolsas), no 18.

## 2026-09-13

- Carrito del header: abre modal con los extras y “Quitar extras”. El punto rojo solo si hay extras. No toca foto ni acabado.
- Simulador: se sacaron Cancelar, Descargar (modal y hero) y Quitar. El footer queda Elegir otra + Usar esta foto; tras aplicar, Comprar + Cambiar foto.
- Landing sin “mensaje para tu pedido”. El textarea quedó en `src/components/MensajePedido.tsx`, sin montar.
- Pack para regalo: foto de caja + bolsa en extras y checkout (`public/images/pack-regalo.jpg`).
- Pack: caja $500 + bolsa $500 se suman al empaque $500 (no lo reemplazan). Extra $1.000 + comisión ~$173, a $2.990 quedan ~$1.820.
- Pack a $2.990 (tachado $6.990).
- Brief de keywords Google Ads Search CL: `docs/keywords-google.md` (Planner vía Apify, sep 2026).
- FAQ: respuestas a una línea. Mismo fondo (acero, preview, plazos al confirmar).
- Llavero: modal al Comprar (misma foto + envío gratis). Agregar o seguir sin él → `/checkout`.
- Llavero: se ofrece después de Aplicar. Galería de landing sin llavero; thumbs chicas (hero, dorado, plateado).
- Galería de la landing: hero, dorado, plateado. Selector de acabado (mismo precio).
- Envío $2.000 si el subtotal < $42.990; gratis desde $42.990. Opciones de umbral: `docs/learn/envio-gratis-ticket.md`.
- Copy de producto: acero inoxidable. Se quitó “plata” / “plata de ley 925” de la landing, checkout y meta.

## 2026-09-12

- Llavero: relicario al 58% + argolla 468 px. Hueco remédido `320×285` seed `(0.632, 0.703)`. Mask en `relicario-llavero.png`.
- Llavero plateado: `relicario-llavero.png` = colgante plata + argolla pegada. Overlay del simulador.
- PNG plateado: `public/relicario-colgante-plata.png`. Nano Banana Pro (Gemini 3) + Bria; alpha copiado de `relicario-colgante.png` para que el hueco mida igual.
- Favicon de pestaña: `src/app/icon.svg` (corazón oro). Recraft V3 SVG en Replicate dibujó ilustraciones que no se leen a 16px.
- Assets en `public/`: `relicario-colgante.png`, `relicario-llavero.png`, `relicario-llavero-referencia.png`, `relicario-hero.jpg`, `relicario-legacy-sin-alpha.png`.
- Front de checkout Shopify en `/checkout`. Los CTAs de compra van ahí. No cobra.
- Funnel + eventos de conversión de la landing: `docs/funnel-landing.md` (para PostHog después).
- Tras Aplicar: fade de la foto y CTA “Comprar este relicario”. Descargar queda secundario.
- Preview: chip “Arrastra para ajustar” sobre el corazón; se va en el primer drag.
- Preview: después del encuadre se puede arrastrar y hacer zoom (+/−, rueda, pellizco).
- Encuadre: las caras detectadas no superan ~26–34% del hueco. Se dejó el zoom 1:1 apretado.
- Hueco: cover de la foto encuadrada, fondo tal cual. Se apagaron blur, viñeta y escena expandida.
- Viñeta ultra suave: núcleo grande, curva t³, piso de alpha; el corte casi no se ve.
- Viñeta desde las caras: nítidas al centro, fade largo al blur del fondo.
- Fondo del hueco: escena sin personas, expandida y blur. No la foto completa.
- Si las caras ocupan poco de la foto, el crop se aprieta (más zoom).
- Zoom 1:1 a las caras (Bria) y después contain + blur en el hueco.
- Se revirtió el blur expandido del contain. El fondo vuelve a ser cover + blur.
- Colocación: contain al mayor rectángulo del hueco + cover blur detrás. Sin IA de fill.
- Pipeline 1:1: crop al insert cuadrado; outpaint solo si faltan píxeles; Bria solo para cabezas.
- Encuadre: el rectángulo seguro busca la parte ancha del corazón. Antes se anclaba a la hendidura y la foto quedaba de sello.
- Preview: solo Bria. Se apagaron Flux y YOLO.
- Hueco del corazón: marfil `#F3EDE4` si la foto no cubre. Se dejó de estirar bordes.

## 2026-09-11

- Pedido China en `/costos#pedido`: 50 piezas + extras que sí viajan (12 cadenas, 12 cajas, 12 bolsas). Cálculo en `src/lib/pedido-china.ts`.
- Self-learn: `docs/learn/` + regla `.cursor/rules/self-learn.mdc`.
- Doc legal: `docs/ley-21719-relicario.md` (dónde van casillas y qué es obligatorio).
- Push `main`: fix Vercel tracing (`b533137`); persistencia local costos/tienda (`3fd7790`).
- Pedido test: 50 por avión. Shopify cobra, landing se queda. MP primero. WhatsApp después del preview (Kapso). No ads con su foto.
