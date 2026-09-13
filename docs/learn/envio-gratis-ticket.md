# Envío gratis para empujar el ticket

Fecha: 2026-09-13. Números en CLP. El courier real sigue costando ~$4.000; “gratis” = dejamos de cobrar los $2.000 de envío.

**Vigente:** envío $2.000 bajo $42.990 de subtotal. Gratis desde $42.990. El llavero a $8.990 lo cruza solo; también ~$8.000 en extras.

Constantes: `ENVIO_COBRADO`, `ENVIO_GRATIS_DESDE` en `src/lib/checkout.ts`. Precio del llavero: `LLAVERO_PRECIO` en `src/lib/addons.ts`.

## Por qué este umbral

| Pedido | Subtotal | Envío | Cobro |
| --- | ---: | ---: | ---: |
| Solo relicario | $34.990 | $2.000 | $36.990 |
| Relicario + llavero | $43.980 | $0 | $43.980 |
| Relicario + cadena + 2ª foto | $43.970 | $0 | $43.970 |

El relicario solo no alcanza. El llavero es el atajo de un clic. Quien no lo quiere puede juntar extras (~$8.000). Regalar $2.000 de envío sobre un attach de $8.990 sigue cubriendo el courier neto.

La landing ya no promete envío gratis plano (H8). Copy: “gratis desde $42.990”.

## Opciones (no reabrir sin dato de conversión)

| # | Umbral | Se desbloquea con | Ticket típico | Empuje | Riesgo |
| --- | ---: | --- | --- | --- | --- |
| A | $36.990 | Casi cualquier extra ≥ $2.000 | ~$38k | Débil | Todos “ganan” envío; no mueve AOV |
| B | $37.990 | Extra ≥ $3.990 (prioridad, cadena, pack, caja, llavero) | $39–44k | Medio | Segunda foto / tarjeta no alcanzan |
| C | $39.990 | Extra ≥ $5.000 (cadena, pack, llavero). Caja queda a $10 | $40–44k | Medio-alto | La caja frustra por $10 |
| D | $40.990 | Un extra de vitrina: cadena **o** pack **o** llavero | $41–44k | Alto, 3 caminos de 1 clic | Diluye el llavero |
| E | **$42.990** (elegido) | Llavero solo, o ~$8.000 en extras (2 piezas) | $44k | Máximo attach al llavero | Quien no quiere llavero necesita 2 extras |
| F | $43.980 | Solo llavero (o más) | $44k | Fuerza llavero | “Algo más” queda difícil; se siente trampa |

No bajar el umbral a A/B sin ver attach real. Si el llavero no se marca y sí se marcan cadena/pack, evaluar D.

## Otras palancas (mismo envío)

1. **Ancla al comprar.** “Comprar este relicario” abre el modal del llavero (misma foto). $8.990 y el envío queda gratis. Después va a `/checkout`.
2. **Barra de faltante.** “Te faltan $8.000” apunta al llavero, no a juntar extras chicos.
3. **No en extras de landing.** El llavero no vive en la lista de extras ni en las thumbs.
4. **No regalar envío en el relicario solo.** El modelo cobra $2.000 porque el courier neto es −$2.000. Gratis plano otra vez = H8.
5. **No subir el cobrado sobre $2.000** para “hacer más valioso” el gratis: el wow es la foto, no el courier.
6. **Combo documentado de “algo más”:** cadena premium + segunda foto, o pack regalo + segunda foto, o cadena + caja.

## Qué no hacer

- Prometer 24–48 h gratis en todos los pedidos.
- Poner el umbral justo en $43.980 (opción F) sin test: parece que solo el llavero cuenta.
- Contar el envío dentro del precio tachado / −30%. El % es del relicario, no del cobro.
