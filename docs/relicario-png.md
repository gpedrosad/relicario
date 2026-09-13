# Especificaciones del PNG del relicario

Medidas tomadas del archivo real en `public/`. Origen de coordenadas: esquina superior izquierda `(0, 0)`.

La fuente de verdad en código es `src/lib/relicario-spec.ts`.

Las posiciones permitidas para las personas, con medidas y esquema, están en [Áreas de personas y generación de contexto](relicario-areas.md).

## Asset maestro: `relicario-colgante-plata.png`

El overlay del simulador es `relicario-colgante-plata.png`. El llavero es un addon: misma foto, otro PNG.

| Campo | Valor |
| --- | --- |
| Overlay / máscara | `public/relicario-colgante-plata.png` (`/relicario-colgante-plata.png`) |
| Tamaño | **1536 × 1024 px** |
| Aspecto | 3:2 (1.5) |
| Formato | PNG, sRGB, 72 dpi |
| Canales | RGBA (4), con alpha |
| Peso | ~1.93 MB |
| Fondo | Transparente `(0, 0, 0, 0)` |
| Contenido | Relicario de corazón abierto, acero inoxidable |

El corazón izquierdo es metal opaco. El corazón derecho es un **hueco transparente** con forma de corazón. El marco del corazón derecho queda por encima de la foto.

### Hueco del corazón derecho

Detectado con flood-fill 4-conectado desde el seed, cortando en `alpha < 16`.

| Campo | Valor | % del canvas |
| --- | --- | --- |
| Seed | `(970, 720)` | `0.632 × 0.703` |
| BBox | `x 814–1133`, `y 599–883` | `x 53.0%`, `y 58.5%` |
| Tamaño bbox | **320 × 285 px** | `20.8% × 27.8%` |
| Centroide | `(970.5, 720.2)` | — |
| Píxeles del hueco | 62 059 | ~3.9% del canvas |

```
1536 × 1024
(0,0) ----------------------------------------------------
 |              argolla grande (arriba)                    |
 |     corazón izquierdo      |  corazón derecho           |
 |                            |  hueco 814,599             |
 |                            |    320 × 285               |
 |                            |         1133,883           |
 ---------------------------------------------------- (1536,1024)
```

## Composite (foto del usuario)

1. Si hay caras, se recorta al **ratio del hueco** alrededor del grupo. Las caras no superan ~34% del alto. Si no hay, se usa la foto completa.
2. Esa foto se pone en **cover** del hueco: nítida, con su fondo original. Sin blur ni viñeta.
3. En el preview se puede **arrastrar y escalar** sobre ese encuadre. Clip al hueco. `relicario-llavero.png` encima. Fuera del relicario: blanco.
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
| `public/relicario-hero.jpg` | 1024 × 1024 JPEG, sRGB, 4:4:4, ~321 KB | Foto de producto (hero) antes de simular |
| `public/relicario-llavero.png` | 1536 × 1024 PNG, acero + argolla, alpha | Addon llavero. No es el overlay del simulador |
| `public/relicario-colgante-plata.png` | 1536 × 1024 PNG, con alpha | Overlay del simulador. Alpha idéntico al colgante oro |
| `public/relicario-llavero-referencia.png` | Foto de referencia | Llavero (argolla). No usar para composite |
| `public/relicario-legacy-sin-alpha.png` | 1536 × 1024 PNG **sin alpha**, ~1.77 MB | Legacy. El hueco es un damero gris rasterizado. **No usar para composite.** |

## Si se reemplaza `relicario-llavero.png`

1. Mantener 1536 × 1024 y canal alpha real en el corazón derecho.
2. Fondo transparente (no negro opaco).
3. Re-medir el hueco (flood-fill) y actualizar `src/lib/relicario-spec.ts` y este doc.
4. El seed `(0.632, 0.703)` debe caer **dentro** del hueco del corazón, no en la argolla.
