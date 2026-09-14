# Decisiones

Cerradas. Para reabrir hace falta un dato nuevo (número, ley, o que se rompió en prod).

| Fecha | Decisión | Por qué | No hacer |
| --- | --- | --- | --- |
| 2026-09-14 | Copy landing = el aviso: “Lo importante, siempre cerca.” Foto no se publica. Plazo 5–7 días hábiles | La web hablaba como catálogo; el creativo ya tenía la frase | Volver a “hecho para ti” / “joya única” ni esconder el plazo |
| 2026-09-14 | Addons en `/completar`, no en la landing ni en Shopify. 2ª unidad $19.990 y pack $2.990 ahí. Llavero sigue en el modal de Comprar | La landing es wow + comprar. El checkout de Shopify no se puede customizar | Meter extras en `/checkout` ni volver a listarlos en el buy-box |
| 2026-09-14 | No se vende caja suelta. El extra es el pack (caja + bolsa) | La caja sola canibaliza el pack y no es el producto | Relistar `caja-premium` en extras o checkout |
| 2026-09-13 | Icono del carrito: modal de extras y “Quitar extras”. No cobra | El icono iba a #comprar. Los extras persisten y hace falta vaciarlos sin inventar checkout | Armar un carrito de cobro ni resetear foto o acabado |
| 2026-09-13 | Simulador: sin Cancelar, Descargar ni Quitar. Quedan X, Elegir otra, Usar esta foto, Cambiar foto | Cancelar = la X. Descargar se lleva el wow sin pagar. Quitar lo cubre Cambiar foto | Volver a poner Descargar en el modal o bajo el hero |
| 2026-09-13 | Landing sin “mensaje para tu pedido”. El campo queda en `MensajePedido` | El textarea no aporta al wow ni al cobro; se reengancha cuando el checkout lo use | Borrar el componente; meter la nota en extras |
| 2026-09-13 | Empaque $500. Pack: caja $500 + bolsa $500 encima. Se vende a $2.990 | Extra $1.000 + comisión ~$173, quedan ~$1.820. $1.990 se lee barato | Meter caja/bolsa en todas las ventas, ni restar solo $500 “reemplazando” el empaque |
| 2026-09-13 | Keywords Google Ads Search — **reemplazada** el 2026-09-14 por Meta | El volumen de `relicario personalizado` era 20/mes | Reabrir Search sin dato nuevo |
| 2026-09-13 | Envío $2.000 bajo $42.990; gratis desde $42.990. Llavero $8.990 | El relicario solo no alcanza; el llavero o ~$8.000 en extras sí. Empuja attach sin mentir “gratis siempre” | Umbral más bajo (casi cualquier extra) o gratis plano |
| 2026-09-13 | Llavero: modal al pulsar Comprar, con la misma foto. Luego `/completar` | El attach es un paso de intención, no de landing. Envío gratis es el gancho | Ofrecerlo en galería, extras o debajo de Aplicar |
| 2026-09-13 | Acabado dorado o plateado, mismo precio. Galería: hero + overlays | No dejar solo un color; los PNG ya existían. “Plateado” es color, no 925 | Inventar llavero dorado o decir plata de ley |
| 2026-09-13 | Copy: acero inoxidable. No plata ni 925 | El producto no es plata | Prometer plata de ley |
| 2026-09-12 | Al pagar: `/checkout` (front Shopify). CTA wow / comprar / carrito | Marca el momento; Shopify cobra después | Inventar cobro ni un carrito aparte ahora |
| 2026-09-12 | Tras Aplicar: foto + Comprar este relicario | El wow pide comprar, no el catálogo | Abrir extras en el modal |
| 2026-09-12 | Overlay: llavero chico + argolla grande. Hueco remédido en `relicario-llavero.png` | Tiene que leerse como llavero; la foto encaja en proporción | Forzar el hueco 1:1 del colgante dorado |
| 2026-09-12 | Mask path literal `relicario-llavero.png` | El hueco ya no es el del colgante | Path dinámico (`RELICARIO.file`) |
| 2026-09 | Composite solo sobre PNG con alpha real | `relicario-legacy-sin-alpha.png` es damero rasterizado | Usar el PNG legacy para pegar la foto |
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
| 2026-09-11 | Primer avión: 50 relicarios, 12 cadenas premium, 12 cajas rígidas, 12 bolsas | Attach de test (20% cadena, 20% pack = caja+bolsa). Fotos/tarjetas/express se hacen en Chile | Pedir a China segunda foto, tarjetas o cajas para vender sueltas |
| 2026-09 | Landing en Next/Vercel; Shopify cobra | El simulador no cabe en un theme | Rehacer la web en Shopify ni Hydrogen ahora |
| 2026-09 | Pago del test: Mercado Pago | Débito + crédito + billetera + cuotas + transferencia en un checkout | Solo transferencia. Solo Webpay de entrada |
| 2026-09 | WhatsApp **después** de ver el relicario, no antes | El wow es la foto en el corazón; el art. 12 presume nulo el peaje innecesario | Exigir el número para generar |
| 2026-09 | Kapso para el drip, no Twilio | WhatsApp + workflows; 50 piezas no piden SMS/voz | Los dos proveedores a la vez |
| 2026-09 | No anunciar en Meta con *su* foto | Titular ≠ comprador; memorial; política de ads | Subir el PNG personalizado a un ad |
| 2026-09 | Path del mask: `path.join(process.cwd(), "public", "relicario-colgante.png")` | Path dinámico → Turbopack traza todo el repo y Vercel falla | `path.join(cwd, RELICARIO.file)` |
