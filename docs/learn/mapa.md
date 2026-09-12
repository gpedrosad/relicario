# Mapa

Landing de Relicario (plata, foto en el corazón), simulador con Replicate y tablero de costos.

Repo: [gpedrosad/relicario](https://github.com/gpedrosad/relicario). App: Next.js 16 (Turbopack) en Vercel. Persistencia de supuestos: `localStorage` (`relicario.local.v1`). Fotos del simulador no se persisten.

## Rutas

| Ruta | Qué es |
| --- | --- |
| `/` | Tienda + `RelicarioPreview` + `ProductPurchase` |
| `/costos` | Tablero. Noindex |
| `POST /api/relicario/enhance` | Encuadre + fill + composite sobre `public/reli.png` |

## Piezas clave

| Pieza | Path |
| --- | --- |
| Spec del PNG | `src/lib/relicario-spec.ts` |
| Máscara / hueco | `src/lib/relicario-mask.ts` — path literales `public/reli.png` |
| IA | `src/lib/replicate.ts` — `bria/remove-background`, `flux-fill-pro` |
| Costos | `src/lib/costos.ts` |
| Pedido China | `src/lib/pedido-china.ts` — 50 piezas + extras del primer vuelo |
| Extras / versiones | `src/lib/addons.ts` — mismo metal, cambia packaging |
| Local | `src/lib/local-project.ts`, `ProjectLocalProvider` |

## Aún no está

Checkout real (Shopify). WhatsApp / Kapso. Banner de cookies. Política de privacidad. Pixel Meta. Los botones Comprar / Carrito no cobran.

## Entorno

`REPLICATE_API_TOKEN` en `.env.local` y en Vercel. No commitear secretos.
