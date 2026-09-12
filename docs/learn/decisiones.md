# Decisiones

Cerradas. Para reabrir hace falta un dato nuevo (número, ley, o que se rompió en prod).

| Fecha | Decisión | Por qué | No hacer |
| --- | --- | --- | --- |
| 2026-09 | Composite solo sobre `/reli.png` | Tiene alpha. `imagenrelicario.png` es damero rasterizado | Usar el PNG legacy para pegar la foto |
| 2026-09 | Bria solo silueta/cabeza; Flux solo extiende el fondo de ESTA foto | Cara y pose quedan en píxeles originales | Inventar caras o un segundo retrato |
| 2026-09 | Ticket de trabajo $34.990 + envío cobrado $2.000 | Piso que aguanta un CPA chileno. $24.990 no | Bajar el ticket “para vender más” sin bajar el CPA |
| 2026-09 | Análisis neto al 19%; comisión 5,8% sobre cobro con IVA | Shopify 2% + MP ~3,8% | Tratar el IVA como margen |
| 2026-09 | Primer pedido aéreo: **50** piezas (~10 días China) | 25–30 para CPA + puente de reposición + ~10% fallas | 20 (se acaba en el learning) o 100 (escalar a ciegas) |
| 2026-09-11 | Primer avión: 50 relicarios, 12 cadenas premium, 18 cajas rígidas, 12 bolsas | Attach de test (20% cadena, 35% caja unificada, 20% bolsa). Fotos/tarjetas/express se hacen en Chile | Pedir a China segunda foto, tarjetas o 50 cajas premium |
| 2026-09 | Landing en Next/Vercel; Shopify cobra | El simulador no cabe en un theme | Rehacer la web en Shopify ni Hydrogen ahora |
| 2026-09 | Pago del test: Mercado Pago | Débito + crédito + billetera + cuotas + transferencia en un checkout | Solo transferencia. Solo Webpay de entrada |
| 2026-09 | WhatsApp **después** de ver el relicario, no antes | El wow es la foto en el corazón; el art. 12 presume nulo el peaje innecesario | Exigir el número para generar |
| 2026-09 | Kapso para el drip, no Twilio | WhatsApp + workflows; 50 piezas no piden SMS/voz | Los dos proveedores a la vez |
| 2026-09 | No anunciar en Meta con *su* foto | Titular ≠ comprador; memorial; política de ads | Subir el PNG personalizado a un ad |
| 2026-09 | Path del mask: `path.join(process.cwd(), "public", "reli.png")` | Path dinámico → Turbopack traza todo el repo y Vercel falla | `path.join(cwd, RELICARIO.file)` |
