# Ley 21.719 y esta página

Cómo pega la nueva ley de protección de datos de Chile en Relicario: landing (`/`), simulador de foto y un eventual WhatsApp / checkout.

No es asesoría legal. La fuente es la Ley 21.719 (reforma a la 19.628) y el flujo actual del repo. Un abogado chileno de datos tiene que firmar textos y contratos antes de pauta real.

**Vigencia:** 1 de diciembre de 2026. Hasta el 30 de noviembre sigue la 19.628. El test de 50 piezas ya tiene que nacer alineado: no hay “lanzamos y después cumplimos”.

El primer año la Agencia *puede* amonestar a una empresa de menor tamaño en vez de multar. No es un permiso para improvisar.

---

## 1. Qué trata hoy esta página

| Dato | Dónde | Titular |
| --- | --- | --- |
| Foto que sube | `RelicarioPreview` → `POST /api/relicario/enhance` → Replicate | Quien aparece en la foto (a menudo **no** es quien compra) |
| Preview generado | Canvas / blob en el browser; si se guarda, servidor | La misma persona de la foto |
| Teléfono WhatsApp | Aún no está en el código | Quien está en la web |
| Mail, dirección, pago | Shopify / Mercado Pago (previsto, no conectado) | El comprador |
| Clics / pixel | No hay banner ni pixel todavía | El visitante |

El punto fino de Relicario: **dos titulares**. El comprador da el número. La cara es de un familiar, una mascota humanizada o alguien fallecido. El memorial y las fotos de niños aprietan más.

Una foto de cara es dato personal. Si algún paso identifica rasgos de forma técnica (biometría, art. 16 ter), pasa a **dato sensible** y pide consentimiento expreso. Aunque el recorte + `flux-fill-pro` no sea “reconocimiento facial”, el riesgo es alto: hay que tratarla como foto de una persona, no como un JPG más.

---

## 2. Qué cambia el 1 de diciembre

| Antes (19.628) | Desde la 21.719 |
| --- | --- |
| Autorización laxa, a veces tácita | Consentimiento libre, previo, específico, inequívoco. Se **prueba**. |
| Política de privacidad opcional | Obligatoria y visible (art. 14 ter) |
| ARCO | Acceso, rectificación, supresión, oposición, portabilidad, bloqueo. 30 días. |
| Poca fiscalización | Agencia de Protección de Datos. Multas hasta 20.000 UTM. |
| Encargados sin forma rígida | Contrato de encargo (art. 15 bis) |
| Envío al extranjero poco regulado | Adecuación, cláusulas modelo u otra garantía (arts. 27–29) |
| Filtración: casi nada | Aviso a la Agencia; si hay menor o dato sensible, también al titular |

Otras bases (contrato, interés legítimo) existen. En esta página casi todo el valor está en la foto y el marketing: **consentimiento**. El checkout sí puede ir por ejecución de contrato (mail, despacho, pago).

---

## 3. Qué es obligatorio en *este* proceso

### Si solo se genera el preview (flujo actual)

- Informar, **antes** de subir, que la foto se manda a un procesador **fuera de Chile** (Replicate) para armar el relicario.
- Casilla vacía: derecho a usar esa imagen; no es de un menor de 14, o es su representante.
- Política de privacidad en el sitio.
- Contrato de encargado + cláusulas de transferencia con Replicate, Vercel y quien aloje la foto.
- Borrar cuando ya no haga falta (si no compró, no hay motivo para guardarla).
- Canal para “borrá mi foto”.
- Seguridad acorde al riesgo: nada de URL pública eterna.
- Evaluación de impacto (EIPD) **antes** de persistir o reenviar fotos: cara + IA + extranjero es alto riesgo (art. 15 ter).
- Si se filtra: Agencia; y al titular si hay menor o dato sensible.

### Si además hay WhatsApp / remarketing (no está construido)

Se suma y **no se puede mezclar** en un “acepto todo”:

- Casilla aparte: “mandame esta imagen por WhatsApp”.
- Casilla aparte: recordatorios / marketing.
- Log: qué marcó, cuándo, qué texto vio.
- Baja tan fácil como el alta (`STOP` / link).
- Pixel de Meta: consentimiento de cookies de publicidad. Sin aceptar el banner, no se dispara.

**No se puede exigir el WhatsApp para generar la imagen.** El art. 12 presume que ese consentimiento no es libre si lo pedís para un servicio que no lo necesita.

### No es obligatorio

Pedir el WhatsApp. El drip. Kapso. Shopify. Usar *su* foto en un anuncio (sin consentimiento de esa persona, no). Un plazo fijo de 15 días (el plazo lo fijás vos; lo obligatorio es no guardar de más). DPO / encargado de prevención (no aplica por tamaño).

---

## 4. Dónde va en la UI

Hoy: entra → sube foto → ve el relicario → Aplicar / Descargar → Comprar (aún no cobra).  
Lo legal son **cinco lugares**, no un muro al inicio.

### 0. Entra al sitio

- Banner de cookies: analítica / anuncios. Sin aceptar, **no** hay pixel.
- Footer de `/` y `/costos`: Política de privacidad · Derechos (borrar mis datos).

Vive en el layout. No es un paso del simulador.

### 1. Elige la foto (`RelicarioPreview`, antes de `enhance`)

Dos líneas + una casilla:

- “Vamos a mandar esta imagen a un procesador en el extranjero para armar el preview. Si no comprás, la borramos a los 30 días.”
- Casilla vacía: “Tengo derecho a usar esta foto. No es de un menor de 14, o soy su representante.”

Sin esa casilla, no se llama a `/api/relicario/enhance`. **Acá no se pide WhatsApp.**

### 2. Ve “tu relicario” (después del wow)

Ahí va el opt-in:

- Número (opcional).
- Casilla 1: mandame esta imagen por WhatsApp.
- Casilla 2: acepto recordatorios de esta pieza por WhatsApp.
- Link a la política.

Si no marca nada, Aplicar / Comprar siguen iguales.

### 3. Checkout (Shopify, cuando exista)

Solo pedido: mail, dirección, pago. No se vuelve a pedir la foto ni el marketing. Si paga, se corta el drip por dentro.

### 4. WhatsApp (si consintió)

- Primer mensaje: la foto + “para baja, escribí STOP”.
- Recordatorios (1 h / 24 h / 3 d) **solo** si marcó la casilla 2.
- Si no te escribió antes a WhatsApp, va en **plantilla** aprobada por Meta (imagen en el encabezado).

### 5. Detrás (no es UI)

- Log de consentimiento.
- Contratos Replicate / Kapso / Vercel / Shopify / Meta.
- Cron: sin compra a 30 días → se borra foto y número.
- Mail o form `privacidad@…`.

---

## 5. ¿Se le puede mandar la foto si no compra?

Sí, **si dejó el WhatsApp y marcó “mandame esta imagen”**. No depende de que compre.

Esa casilla alcanza para **un envío**. El drip pide la segunda.

No, si solo subió la foto y se fue: no hay número ni consentimiento.  
No en un anuncio de Meta con *su* cara. El remarketing de ads es la pieza genérica + audiencia “generó y no compró”, con cookie aceptada.

STOP corta todo, haya comprado o no.

---

## 6. Encargados y el extranjero

Relicario es el **responsable**. Los demás tratan por encargo o reciben cesión.

| Quién | Qué toca | Dónde suele vivir |
| --- | --- | --- |
| Vercel | Hosting, logs, funciones | EE.UU. / edge |
| Replicate (`bria/remove-background`, `flux-fill-pro`) | Foto original y recorte | EE.UU. |
| Kapso / Meta WhatsApp | Número, plantillas, PNG | Cloud API |
| Shopify + Mercado Pago | Pedido y cobro | Según contrato |
| Meta Ads | Pixel, audiencias | EE.UU. |

Hace falta:

- Contrato de encargo (objeto, plazo, tipo de dato, prohibición de usar para otra cosa, borrar al terminar).
- Cláusulas modelo de transferencia (resolución Economía, dic-2025). EE.UU. no está en una lista de adecuación útil para relajarse.
- Pedirle a Replicate que **no entrene** con estas fotos.
- El encargado no puede pasar la foto a otro sin autorización escrita (art. 15 bis).

`/costos` no sube fotos de clientes. Igual le aplica el banner y el footer si hay cookies o el mismo layout.

---

## 7. Menores, memorial, biometría

- **Menor de 14:** no tratar la foto “como un adulto”. Casilla de representante o no aceptar esa imagen.
- **Adolescente (14–17):** si el tratamiento se considera sensible, consentimiento de padre/madre o cuidador.
- **Fallecido:** los herederos pueden ejercer derechos sobre esos datos (art. 4). El comprador declara que puede usar la imagen.
- **No usar la foto del cliente en pauta.** WhatsApp con *su* imagen solo con la casilla 1.

---

## 8. Piso para el test de 50 piezas

Antes de pauta y de Kapso:

1. Política de privacidad en el footer.
2. Casilla de la foto, antes de generar.
3. Casillas de WhatsApp **después** de ver el resultado, si se implementa.
4. Log del sí.
5. Borrar a 30 días si no hay compra.
6. Contratos / DPA con Replicate (y Kapso si se prende).
7. EIPD de una página: flujo, riesgo (filtración de una cara), mitigación.
8. No anuncios con su relicario personal.

Textos de casillas y contratos: revisión de un abogado. No copiar un aviso RGPD tal cual.

---

## 9. Relación con el resto del repo

- Encaje de la foto: `docs/relicario-png.md`, `src/lib/relicario-spec.ts`. Esta ley no cambia el composite; cambia **cuándo** se puede llamar a `enhance` y **cuánto** se guarda el PNG.
- Plata: `docs/costos-relicario.md`. Cumplir no cambia el ticket; un leak o una multa sí.
- Persistencia local (`relicario.local.v1`) es del operador en su browser (costos / extras). No es dato de un cliente.

Cuando exista el form de WhatsApp y el banner, este documento es la especificación de *dónde* van. El copy final no se inventa en el componente: se pega el texto revisado.
