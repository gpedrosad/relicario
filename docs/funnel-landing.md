# Funnel de la landing y eventos

Qué pasos existen hoy en `/`, qué conviene mirar para conversión, y cómo nombrarlo el día que se conecte PostHog (u otro).

No hay números inventados acá. Las hipótesis de CPA / WhatsApp están en [docs/learn/hipotesis.md](learn/hipotesis.md). El cobro real no está. `/checkout` es solo el front ([mapa](learn/mapa.md)).

Fecha de este mapa: `2026-09-14`. Si el flujo cambia, actualizar este archivo el mismo día.

## Qué no mandar nunca

- La foto del usuario, data URLs, ni un thumbnail.
- Nombre, teléfono, email o mensaje de tarjeta en claro (cuando existan).
- Tokens, cookies de sesión, o el PNG compuesto.

PostHog / pixel: IDs anónimos. Si más adelante hay WhatsApp, identificar con un hash, no el número.

## Funnel (pasos)

El producto es el relicario con *su* foto. El wow es el paso 6. Comprar es el 7. El llavero es un modal **al pulsar Comprar**, no en la landing. Después va a `/completar` (extras) y recién ahí a `/checkout`. El envío gratis (≥ $42.990) es el gancho de ese modal.

```
0  Llegada          anuncio / orgánico / directo → GET /
1  Landing vista    hero + CTA de simulación above the fold
2  Simulador        clic “Simular con tu foto” (hero, header, pasos, FAQ o sticky)
3  Foto elegida     file input
4  Encuadre         POST /api/relicario/enhance
5  Ajuste           arrastrar / zoom (opcional)
6  Aplicar          foto en el hero + recién entonces CTA comprar con precio
7  Intención        “Comprar este relicario”
7b Modal llavero    misma foto + envío gratis · agregar o seguir
8  Completar        /completar?from=wow\|comprar\|carrito  ← extras, no Shopify
9  Checkout         /checkout?from=wow\|comprar\|carrito   ← front Shopify, no se toca
10 Pago             Shopify + MP                ← front en /checkout, no cobra
11 Compra           order paid
```

Salidas importantes (no son “fallo”, son fugas):

| Salida | Dónde | Por qué mirarla |
| --- | --- | --- |
| Cerrar modal sin aplicar | X, backdrop | Vieron el simulador y no hubo wow |
| Error de encuadre | enhance 4xx/5xx | Fricción técnica, no de oferta |
| Cambiar foto | hero o modal | Reintento; no es abandono si luego aplican |

Pasos **aún no construidos** (dejar el evento listo, no dispararlo en falso):

- WhatsApp después del preview ([decisión](learn/decisiones.md), H5 / H6).
- Checkout real (Shopify cobra), `purchase`. `/checkout` ya existe como front.
- Segunda foto como flujo (addon `segunda-foto`).

## Eventos

Nombres estables, `snake_case`, prefijo `relicario_`. Descripción en español. Una acción = un evento.

### Núcleo (instrumentar primero)

| Evento | Cuándo | Props | Pregunta que responde |
| --- | --- | --- | --- |
| `$pageview` | PostHog default en `/` | `utm_*`, `referrer`, `$current_url` | ¿De dónde vienen? |
| `relicario_simulate_open` | Abren el modal | `source`: `hero` \| `cambiar` | ¿El simulador se usa? |
| `relicario_photo_selected` | Eligen un archivo | `source`: `primera` \| `otra` | ¿Pasan el peaje de la foto? |
| `relicario_enhance_started` | Sale el POST enhance | — | Denominador de fallos |
| `relicario_enhance_succeeded` | Crop OK, editor visible | `decision`, `detection_failed`, `duration_ms` | ¿El encuadre aguanta? |
| `relicario_enhance_failed` | Error de red o API | `reason` corto, `status` | ¿Se cae Replicate / el route? |
| `relicario_preview_applied` | Clic Aplicar, foto en hero | `adjusted`: bool (movieron o zoom ≠ 100%) | ¿Cierran el wow? |
| `relicario_buy_cta` | “Comprar este relicario” | `price` (34990) | ¿El wow pide comprar? |
| `relicario_checkout_click` | Van a `/checkout` | `cta`: `wow` \| `comprar` \| `carrito`, `total`, `version_id`, `addons` | ¿Llegan al cobro? |

`decision` y `detection_failed` ya salen del enhance ([`PhotoAnalysis`](../src/lib/relicario-crop.ts)). No mandar el crop en píxeles.

### Fugas y fricción

| Evento | Cuándo | Props |
| --- | --- | --- |
| `relicario_simulate_close` | Cierran el modal sin aplicar | `had_photo`: bool |
| `relicario_photo_adjust` | Primer drag o primer zoom de esa sesión | `kind`: `pan` \| `zoom` |

`relicario_photo_adjust` **una vez** por visita (o por foto). No un evento por cada píxel del arrastre.

### Ticket (attach)

| Evento | Cuándo | Props |
| --- | --- | --- |
| `relicario_version_selected` | Cambian versión | `version_id` |
| `relicario_addon_toggled` | Check de extra | `addon_id`, `on`: bool, `addons`, `extras_total` |
| `relicario_llavero_upsell_shown` | Modal al Comprar | `from`: `wow` \| `comprar` \| `carrito` |
| `relicario_llavero_upsell_accepted` | Agregar y seguir a checkout | `from` |
| `relicario_llavero_upsell_skipped` | Seguir sin llavero | `from` |
| `relicario_cart_opened` | Icono del carrito | `extras`: n |
| `relicario_cart_cleared` | “Quitar extras” | `extras`: n (antes de vaciar) |

IDs: `clasica`, `memorial`, `pareja`, `madre`, `hija`, `mascota`. Addons: `llavero`, `segunda-unidad`, `segunda-foto`, `cadena-premium`, `tarjeta`, `foto-extra`, `pack-regalo`, `entrega-prioritaria`. Fuente: [`src/lib/addons.ts`](../src/lib/addons.ts).

### Cuando existan

| Evento | Cuándo | Props |
| --- | --- | --- |
| `relicario_whatsapp_shown` | Se ofrece el número **después** del preview | — |
| `relicario_whatsapp_opt_in` | Deja número + casilla | — |
| `relicario_checkout_started` | Entran a Shopify / MP | `total`, `version_id`, `addons` |
| `relicario_purchase` | Pago ok (server o webhook, no solo el clic) | `order_id`, `value`, `currency`: `CLP`, `addons` |

`relicario_purchase` es la única conversión de plata. Entrar a `/checkout` no cobra: no usarlo como purchase.

## Funnels a armar en PostHog

1. **Wow.** `$pageview` (path `/`) → `simulate_open` → `photo_selected` → `enhance_succeeded` → `preview_applied`.
2. **Intención.** `preview_applied` → `buy_cta` → `checkout_click` → (luego) `checkout_started` → `purchase`.
3. **Técnico.** `enhance_started` → `enhance_failed` / `enhance_succeeded`.

Ruptura grave: mucha gente en `simulate_open` y poca en `photo_selected` (miedo a la foto). O mucha en `preview_applied` y poca en `buy_cta` (el wow no vende). O `buy_cta` alto y `checkout_click` bajo (el scroll / el precio con extras asusta).

## Propiedades de persona / grupo (después)

Cuando haya identify:

- `version_id` último
- `addons` última selección
- `has_applied_preview`: bool

Sin PII. `/costos` no forma parte de este funnel (tablero interno).

## Cómo implementar (cuando toque)

1. PostHog en el cliente de `/` (no en `/costos` si se puede evitar).
2. Un helper `track(event, props)` en `src/lib/analytics.ts`. Los clics de `RelicarioPreview` y `ProductPurchase` llaman eso; hoy pueden ser no-op.
3. Mismos nombres que esta tabla. No renombrar a la ligera: rompe el historial.
4. Pixel Meta, si se suma: solo `PageView` / `Purchase` de Shopify. **No** subir su foto a un ad ([decisión](learn/decisiones.md)).

Clarity ya puede servir para ver *cómo* se mueven. PostHog sirve para *cuántos* cruzan cada escalón y para el funnel de arriba.
