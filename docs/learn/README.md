# Self-learn

Memoria viva del proyecto. Las specs no viven acá: se **aprende** acá (qué decidimos, qué probamos, qué falló).

| Fuente de verdad | Archivo |
| --- | --- |
| Composite / `reli.png` | `src/lib/relicario-spec.ts`, `docs/relicario-png.md` |
| Costos | `src/lib/costos.ts`, `docs/costos-relicario.md` |
| Ley 21.719 en esta web | `docs/ley-21719-relicario.md` |
| Este índice | `docs/learn/README.md` |

## Archivos

| Archivo | Para qué |
| --- | --- |
| [mapa.md](mapa.md) | Qué es el repo, rutas, stack |
| [decisiones.md](decisiones.md) | Decisiones cerradas. No reabrir sin dato nuevo |
| [hipotesis.md](hipotesis.md) | Supuestos a validar. Estado: abierta / en test / muerta |
| [lecciones.md](lecciones.md) | Lo que ya dolió o funcionó. No repetir |
| [preguntas.md](preguntas.md) | Huecos. Si se responde, va a decisión o hipótesis |
| [log.md](log.md) | Cronológico. Solo se agrega arriba |

## Cómo usa esto el agente

1. Antes de cambiar producto, costos, legal, deploy o el simulador: leer `mapa.md` + el archivo del tema.
2. Si el usuario cierra una decisión: una fila en `decisiones.md` y una entrada en `log.md`.
3. Si aparece un supuesto: `hipotesis.md`. Si se confirma o muere: mover a `lecciones.md` o `decisiones.md` y actualizar el estado.
4. Si un build, un deploy o un flujo se rompe: `lecciones.md` + `log.md` el mismo día.
5. No copiar specs acá. Linkear. No inventar métricas. Fecha `YYYY-MM-DD`. Español.

## Cómo usamos nosotros

Al cerrar una sesión útil: “anotalo en learn”. Al dudar: primero `decisiones.md` y `lecciones.md`.
