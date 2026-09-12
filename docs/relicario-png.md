# Especificaciones del PNG del relicario

Medidas tomadas del archivo real en `public/`. Origen de coordenadas: esquina superior izquierda `(0, 0)`.

La fuente de verdad en código es `src/lib/relicario-spec.ts`.

Las posiciones permitidas para las personas, con medidas y esquema, están en [Áreas de personas y generación de contexto](relicario-areas.md).

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

1. Si hay caras, se recorta al **ratio del hueco** alrededor del grupo. Las caras no superan ~34% del alto. Si no hay, se usa la foto completa.
2. Esa foto se pone en **cover** del hueco: nítida, con su fondo original. Sin blur ni viñeta.
3. En el preview se puede **arrastrar y escalar** sobre ese encuadre. Clip al hueco. `reli.png` encima. Fuera del relicario: blanco.
4. Sin IA generativa para rellenar.

Exportar `image/png`. Nombre de descarga: `relicario-con-mi-foto.png`.

### Especificación de generación y montaje

El código aplica estas medidas y las representa en la imagen de entrada y la máscara:

- Lienzo de trabajo: **1102 × 984 px**. Cover de la foto encuadrada, píxeles originales.
- Clip al hueco real.
- Contorno completo del hueco, incluyendo los dos lóbulos separados por la hendidura.

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
