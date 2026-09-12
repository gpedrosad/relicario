# Áreas de personas y generación de contexto

La foto se dimensiona primero. La IA completa el espacio restante con el entorno de esa foto; el marco de oro se superpone al final y nunca lo genera el modelo.

![Zonas de encuadre calculadas sobre el PNG real](relicario-zonas.png)

## Coordenadas

| Sistema | Dimensiones | Origen |
| --- | --- | --- |
| PNG del producto | 1536 × 1024 px | Esquina superior izquierda de `public/reli.png` |
| Rectángulo que contiene el hueco | 551 × 492 px | `(847, 345)` en el PNG del producto |
| Insert de trabajo | 1102 × 984 px | Esquina superior izquierda del rectángulo del hueco, a escala 2× |

Todas las medidas siguientes son del **insert de trabajo**. Conversión al producto: `xPNG = 847 + xInsert / 2`, `yPNG = 345 + yInsert / 2`. No usar las medidas del producto como si fueran el área de la foto.

El hueco es un corazón asimétrico, no un rectángulo. Su contorno se obtiene del canal alpha de `reli.png`. Los límites horizontales se recalculan por fila: la punta inferior y la hendidura central no son zonas seguras para caras.

## Dónde colocar a las personas

| Zona | Regla del código | Uso |
| --- | --- | --- |
| Franja superior | Desde 0 hasta 27% del alto (`y < 266`) | Contexto: cielo, pared, vegetación u otro fondo de la escena. Evitar cabezas y caras bajo la hendidura. |
| Borde superior de la silueta | Como mínimo 27% (`y = 266`) y siempre bajo la hendidura real + margen | Inicio de las personas; deja aire entre el pelo y el metal. |
| Ojos / centro estimado de cara | Objetivo: 43% (`y ≈ 423`) | Preferencia de composición. Se desplaza si es necesario para conservar todo el grupo dentro del área segura. |
| Personas completas | Rectángulo adaptado a su proporción; borde inferior seleccionado entre 50% y 90% | Mantener dentro de este rectángulo la silueta detectada de todas las personas. |
| Distancia al metal | 3,5% del lado menor: **35 px** en el insert | Evitar que caras, pelo y cuerpos se apoyen en los bordes. |
| Lóbulos, laterales y punta libres | Todo el hueco que quede fuera de la foto | Completar contexto, nunca ubicar una persona nueva para llenar el espacio. |

El área no es fija para todas las fotos: se evalúan rectángulos contenidos en la máscara real, con margen, y se elige el que admite la mayor escala uniforme para el sujeto. En grupos se conserva la distancia relativa entre las personas. Nunca se estira un eje por separado ni se mueve a cada persona independientemente.

### Ejemplos medidos

Estos ejemplos usan la **proporción de la silueta**, no la proporción del archivo subido. Los intervalos son límites geométricos, con redondeo de hasta un píxel al rasterizar.

| Proporción de la silueta | Área X del insert | Área Y del insert | Tamaño seguro |
| --- | --- | --- | --- |
| Retrato 3:4 | 333–716 | 266–777 | 383 × 511 px |
| Grupo horizontal 2:1 | 187–872 | 266–608 | 685 × 342 px |
| Cuerpo entero 1:3 | 421–624 | 266–858 | 203 × 592 px |

Si el original corta el pelo arriba, se conserva la reserva del 30% de la altura estimada de cabeza para continuar **sólo ese pelo**. No se permite inventar una cara que falta. Si falla la detección, se encaja la foto completa en la zona segura.

## Qué puede generar la IA

La máscara de edición marca negro en toda la foto original y blanco fuera de ella. Las zonas blancas deben continuar la misma escena con fondo desocupado, respetando luz, perspectiva, color y profundidad de campo. Deben cubrir el lienzo hasta sus bordes; después se recorta con el corazón real para evitar halos o bandas vacías.

No añadir transeúntes, multitudes, personas lejanas, siluetas, reflejos humanos, rostros en carteles, otras caras, retratos duplicados ni objetos decorativos. El pelo permitido arriba debe estar unido al de una persona existente y no modificar su cara. Las partes originales se vuelven a colocar opacas sobre el resultado, incluso si el modelo cambia zonas negras de la máscara.

El prompt no contiene tablas de coordenadas ni pide dibujar un corazón: las pruebas visuales mostraron que eso podía inducir diagramas, rótulos y bordes. Las medidas se aplican mediante la máscara y el montaje, a nivel de píxel.

## Revisión antes de mostrar el resultado

Después de reponer la foto y aplicar el hueco, [YOLO-World de Ultralytics](https://replicate.com/ultralytics/yolov8s-worldv2) busca `person` y `human face`. Sólo se utiliza su salida JSON; la imagen anotada del detector nunca se muestra al cliente. Se comprueba qué proporción de cada detección pertenece a la foto original:

- Cara: al menos 60% de su caja debe estar en el original.
- Persona: al menos 15%, para admitir que el cuerpo existente continúe más allá del borde sin aceptar figuras nuevas aisladas.
- Confianza mínima: 0,25. Una respuesta inválida o una falla del verificador no se interpreta como aprobación.

Si aparece una detección nueva fuera del original, se regenera desde la foto original una vez. Si vuelve a ocurrir, no se entrega esa imagen al cliente. La detección es probabilística: puede omitir figuras pequeñas o producir falsos positivos; estos umbrales son un control adicional, no una garantía universal.

Cada resultado generado usa una llamada de revisión. El máximo es dos rellenos y dos revisiones, además de la detección inicial. El endpoint dispone de 180 segundos; la duración efectiva depende de las colas del proveedor.

## Archivos y comprobaciones

- `src/lib/relicario-spec.ts`: dimensiones, márgenes, modelos y máximo de intentos.
- `src/lib/relicario-mask.ts`: máscara real y selección de zona segura.
- `src/lib/relicario-frame.ts`: escala y posición del conjunto.
- `src/lib/relicario-prompt.ts`: instrucciones de contexto sin gente nueva.
- `src/lib/relicario-validation.ts`: clasificación de detecciones nuevas.
- `tests/relicario.test.mjs`: conservación del original, zonas de encuadre, reintento y rechazo de rellenos con caras nuevas.

El esquema está disponible en [SVG](relicario-zonas.svg). Al cambiar el PNG o los márgenes, volver a medir y actualizar estos ejemplos y el esquema.
