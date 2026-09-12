# Decisiones

Cerradas. Para reabrir hace falta un dato nuevo (número, ley, o que se rompió en prod).

| Fecha | Decisión | Por qué | No hacer |
| --- | --- | --- | --- |
| 2026-09 | Composite solo sobre `/reli.png` | Tiene alpha. `imagenrelicario.png` es damero rasterizado | Usar el PNG legacy para pegar la foto |
| 2026-09-12 | Tras el encuadre, la foto se arrastra y se escala en el cliente | El recorte automático no calza siempre | Volver a mandar la foto a Replicate para un nudge |
| 2026-09-12 | Caras: tope de escala en el hueco (`faceScale`) | El zoom 1:1 las dejaba gigantes | Recortar justo al box de la cara |
| 2026-09-12 | Hueco: foto encuadrada en cover, fondo original | Blur, viñeta y escena expandida se leían como recorte | Inventar o desenfocar el fondo del corazón |
| 2026-09-12 | Preview: solo Bria. Sin Flux ni YOLO | Tardaba 3–5 llamadas. El hueco vacío es marfil | Volver a encadenar fill + detector en cada foto |
| 2026-09-12 | Foto 1:1 en insert 493×492. Crop → upscale → outpaint | El corazón no se llena; la identidad manda | Cover del hueco ni Flux en cada foto |
| 2026-09-12 | Hueco: contain nítido + cover blur. Sin IA de fill | El rectángulo sobre marfil se veía pegado | Recortar caras para llenar el corazón |
| 2026-09-12 | Zoom a las caras antes del contain | La foto entera se veía de sello en el corazón | Contain de la playa/fondo completo |
| 2026-09-12 | Viñeta casi invisible: fade largo, piso de alpha, curva t³ | El óvalo/rectángulo se leía como corte | Apagar a cero en los bordes de la nítida |
| 2026-09-12 | Blur del hueco = fondo de la escena, no la misma foto | El cover repetía caras desenfocadas | Cover+blur de todo el retrato |
| 2026-09-12 | Encuadre: personas enteras en la zona ancha; no recortar | Una foto chica de sello se ve peor que marfil alrededor | Anclar el rectángulo a la hendidura ni reservar +30% de pelo |
| 2026-09-12 | Hueco sin foto: marfil `#F3EDE4`. Fuera del relicario: blanco | El estirado de bordes se veía mal. Papel de foto pega con el oro | Blanco o rayas dentro del corazón |
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
