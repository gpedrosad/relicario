# Especificaciones del PNG del relicario

Medidas tomadas del archivo real en `public/`. Origen de coordenadas: esquina superior izquierda `(0, 0)`.

La fuente de verdad en código es `src/lib/relicario-spec.ts`.

## Asset maestro: `reli.png`

Usar **solo este archivo** para componer la foto del usuario.

| Campo | Valor |
| --- | --- |
| Ruta | `public/reli.png` (`/reli.png`) |
| Tamaño | **1536 × 1024 px** |
| Aspecto | 3:2 (1.5) |
| Formato | PNG, sRGB, 72 dpi |
| Canales | RGBA (4), con alpha |
| Peso | ~1.93 MB |
| Fondo | Transparente `(0, 0, 0, 0)` |
| Contenido | Relicario de corazón abierto, oro |

El corazón izquierdo es metal opaco. El corazón derecho es un **hueco transparente** con forma de corazón. El marco de oro del corazón derecho queda por encima de la foto.

### Hueco del corazón derecho

Detectado con flood-fill 4-conectado desde el seed, cortando en `alpha < 16`.

| Campo | Valor | % del canvas |
| --- | --- | --- |
| Seed | `(1117, 620)` | `0.727 × 0.605` |
| BBox | `x 847–1397`, `y 345–836` | `x 55.14%`, `y 33.69%` |
| Tamaño bbox | **551 × 492 px** | `35.87% × 48.05%` |
| Centroide | `(1117.1, 554.9)` | — |
| Centro del bbox | `(1122, 590.5)` | — |
| Píxeles del hueco | 184 409 | ~11.7% del canvas |
| Fila más ancha | `y=465`, `x 848–1397` (549 px) | — |

```
1536 × 1024
(0,0) ----------------------------------------------------
 |     corazón izquierdo (oro sólido)   |  corazón derecho |
 |                                      |  hueco alpha=0   |
 |                                      |  847,345         |
 |                                      |    551 × 492     |
 |                                      |         1397,836 |
 ---------------------------------------------------- (1536,1024)
```

Alpha global de `reli.png`: ~63% transparente (fondo + hueco), ~36% opaco (metal), ~1% semi.

## Composite (foto del usuario)

1. `bria/remove-background` detecta la silueta (no redibuja a nadie).
2. Se estima la **cabeza** según la silueta (cuerpo entero, busto, selfie o grupo).
3. Se **encaja** la silueta del grupo o de la persona bajo la hendidura. Se busca la mayor escala uniforme posible en un rectángulo contenido en el hueco real, según la proporción del sujeto: desde el 27% del alto y hasta un máximo del 90%, con margen al metal del 3,5% del lado menor. Si la cabeza toca el borde superior, se reserva un 30% de su altura estimada para autocompletar arriba. Las medidas proceden de la silueta; no es un detector facial.
4. `flux-fill-pro` completa fuera de la foto: fondo y, cuando hace falta, continuación del pelo sobre una cabeza cortada. La foto completa queda negra en la máscara (protegida), y el exterior blanco (generar). Se rellena hasta los bordes del canvas y luego se aplica el corazón exacto, evitando halos o espacios vacíos. Se repone la foto original escalada y opaca sobre el resultado para impedir cambios en el contenido existente, aunque el modelo ignore la máscara.
5. Canvas **1102×984** (2× el hueco). La imagen ya encuadrada se pega en el bbox del hueco.
6. `destination-in` con la máscara del corazón.
7. `source-over` de `reli.png`.
8. `destination-over` relleno **blanco `#ffffff`** (fuera del relicario, no dentro del hueco).

Exportar `image/png`. Nombre de descarga: `relicario-con-mi-foto.png`.

### Especificación de generación y montaje

El código aplica estas medidas y las representa en la imagen de entrada y la máscara:

- Lienzo del insert: **1102 × 984 px**, distinto del PNG del producto (**1536 × 1024 px**).
- Coordenadas y dimensiones reales del rectángulo original que no puede cambiar.
- Área segura calculada para esa persona o grupo, en píxeles del insert.
- Contorno completo del hueco, incluyendo los dos lóbulos separados por la hendidura. Se verifican también 21 filas de referencia en las pruebas.
- Máscara: negro conserva y blanco genera; escala y posición ya resueltas por código.
- Reserva de espacio para autocompletado superior cuando corresponde.

`src/lib/relicario-prompt.ts` instruye al modelo sobre conservación de las zonas negras, relleno de todas las zonas blancas, continuidad de iluminación, perspectiva, colores y textura; prohíbe rostros adicionales, accesorios, texto, marcos y patrones repetidos. Si falta parte superior, pide pelo natural que continúe el existente. Es contenido nuevo generado, no recuperación de información ausente.

No se incluyen tablas de coordenadas ni instrucciones de dibujar un relicario en el prompt: en la prueba visual inducían gráficos sobre la foto. La geometría se controla con la máscara y el recorte definitivo del PNG a nivel de píxel. El modelo nunca genera ni modifica el metal del relicario.

Verificación: `node --test tests/relicario.test.mjs` comprueba protección del original, generación exterior, forma real de la hendidura, coordenadas y ajuste de personas/grupos con distintas proporciones.

## Otros assets

| Archivo | Tamaño | Uso |
| --- | --- | --- |
| `public/RELICARIO1.jpg` | 1024 × 1024 JPEG, sRGB, 4:4:4, ~321 KB | Foto de producto (hero) antes de simular |
| `public/imagenrelicario.png` | 1536 × 1024 PNG **sin alpha**, ~1.77 MB | Legacy. El hueco es un damero gris rasterizado. **No usar para composite.** |

## Si se reemplaza `reli.png`

1. Mantener 1536 × 1024 y canal alpha real en el corazón derecho.
2. Fondo transparente (no negro opaco).
3. Re-medir el hueco (flood-fill) y actualizar `src/lib/relicario-spec.ts` y este doc.
4. El seed `(0.727, 0.605)` debe caer **dentro** del hueco, no en el marco.
