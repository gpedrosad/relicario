# Log

Más nuevo arriba. Una entrada por hecho, no un diario.

## 2026-09-12

- Encuadre: las caras detectadas no superan ~26–34% del hueco. Se dejó el zoom 1:1 apretado.
- Hueco: cover de la foto encuadrada, fondo tal cual. Se apagaron blur, viñeta y escena expandida.
- Viñeta ultra suave: núcleo grande, curva t³, piso de alpha; el corte casi no se ve.
- Viñeta desde las caras: nítidas al centro, fade largo al blur del fondo.
- Fondo del hueco: escena sin personas, expandida y blur. No la foto completa.
- Si las caras ocupan poco de la foto, el crop se aprieta (más zoom).
- Zoom 1:1 a las caras (Bria) y después contain + blur en el hueco.
- Se revirtió el blur expandido del contain. El fondo vuelve a ser cover + blur.
- Colocación: contain al mayor rectángulo del hueco + cover blur detrás. Sin IA de fill.
- Pipeline 1:1: crop al insert cuadrado; outpaint solo si faltan píxeles; Bria solo para cabezas.
- Encuadre: el rectángulo seguro busca la parte ancha del corazón. Antes se anclaba a la hendidura y la foto quedaba de sello.
- Preview: solo Bria. Se apagaron Flux y YOLO.
- Hueco del corazón: marfil `#F3EDE4` si la foto no cubre. Se dejó de estirar bordes.

## 2026-09-11

- Pedido China en `/costos#pedido`: 50 piezas + extras que sí viajan (12 cadenas, 18 cajas, 12 bolsas). Cálculo en `src/lib/pedido-china.ts`.
- Self-learn: `docs/learn/` + regla `.cursor/rules/self-learn.mdc`.
- Doc legal: `docs/ley-21719-relicario.md` (dónde van casillas y qué es obligatorio).
- Push `main`: fix Vercel tracing (`b533137`); persistencia local costos/tienda (`3fd7790`).
- Pedido test: 50 por avión. Shopify cobra, landing se queda. MP primero. WhatsApp después del preview (Kapso). No ads con su foto.
