# Mapa

Landing de Relicario (acero inoxidable, foto en el corazón), simulador con Replicate y tablero de costos.

Repo: [gpedrosad/relicario](https://github.com/gpedrosad/relicario). App: Next.js 16 (Turbopack) en Vercel. Persistencia de supuestos: `localStorage` (`relicario.local.v1`). Fotos del simulador no se persisten.

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Tienda + `RelicarioPreview` + `ProductPurchase` |
| `/completar` | Extras del pedido (2ª unidad, pack, resto). Nuestra página. Noindex. Entrada: `?from=wow\|comprar\|carrito` |
| `/checkout` | Front de Shopify. Noindex. No cobra. No se customiza. |
| `/costos` | Tablero. Noindex |
| `POST /api/relicario/enhance` | Detecta caras y devuelve el crop; el cliente compone y permite arrastrar/zoom |

## Piezas clave

| Pieza | Path |
| --- | --- |
| Acabado / galería | `src/lib/relicario-finish.ts` — dorado o plateado; thumbs de `public/` |
| Spec del PNG | `src/lib/relicario-spec.ts` — overlay relicario; llavero en modal al comprar |
| Máscara / hueco | `src/lib/relicario-mask.ts` — path literales `public/relicario-llavero.png` |
| IA | `src/lib/replicate.ts` — Bria solo para ubicar caras; cover local |
| Funnel / eventos (PostHog) | [docs/funnel-landing.md](../funnel-landing.md) |
| Ads | [docs/ads-meta.md](../ads-meta.md) — Meta. Sin Search. |
| Costos | `src/lib/costos.ts` |
| Pedido China | `src/lib/pedido-china.ts` — 50 piezas + extras del primer vuelo |
| Extras / versiones | `src/lib/addons.ts` — llavero $8.990 (modal al Comprar); 2ª unidad $19.990 y pack $2.990 en `/completar`. Landing y Shopify sin extras. |
| Envío / umbral | `src/lib/checkout.ts` — $2.000 o gratis desde $42.990. Opciones: [envio-gratis-ticket.md](envio-gratis-ticket.md) |
| Completar pedido | `src/lib/checkout.ts` (`completarHref`), `CompletarPedido`, `PedidoAddons` |
| Checkout (front) | `src/lib/checkout.ts` (`checkoutHref`), `ShopifyCheckout`. Intactable. |
| Local | `src/lib/local-project.ts`, `ProjectLocalProvider` |

## Aún no está

Checkout real (Shopify cobra; `/checkout` es solo el front para marcar el momento). WhatsApp / Kapso. Banner de cookies. Política de privacidad. Pixel Meta.

## Entorno

`REPLICATE_API_TOKEN` en `.env.local` y en Vercel. No commitear secretos.
