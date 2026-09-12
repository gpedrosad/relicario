# Costos y utilidad del relicario

Estimación en CLP, septiembre 2026. **La base del análisis es sin IVA (19%)**. Ticket, envío, pieza, courier, empaque y CPC se anotan como se ven (con IVA) y se netean. La comisión sí se aplica sobre el cobro con IVA, porque así cobran Shopify y Mercado Pago.

## Premisas

| Dato | Valor | Estado |
| --- | --- | --- |
| Ticket de trabajo | $34.990 | Landing actual. Se compara con otros tickets en §5. |
| Pieza | $4.500 | Confirmado, puesto en Chile |
| Envío cobrado al cliente | $2.000 plano | Decidido |
| Courier que pagamos | $4.000 promedio | Decidido. Neto envío: **$2.000** |
| Empaque | $1.500 | Decidido |
| Comisión de cobro | **5,8%** sobre ticket + envío | Shopify 2% (pasarela externa) + Mercado Pago 3,19% + IVA ≈ 3,80% efectivo. |
| Devoluciones | 1% | Decidido. Se asume que la pieza vuelve y se puede revender. |
| IA | $400 / venta | 4 previews × $100. Ver §3. |
| CPC | **$200** | Costo por clic de pauta. Editable en `/costos`. |
| Conversión web | **1%** | Clic → compra. CPA = CPC ÷ conversión = **$20.000**. |
| Tipo de cambio | $930 / USD | Solo para pasar Replicate a pesos |

Cobro que ve el cliente a ticket $34.990: **$36.990** (producto + envío).

```
+ 34.990  ticket
+  2.000  envío cobrado
-  4.500  pieza
-  4.000  courier
-  1.500  empaque
-  2.145  comisión 5,8% de $36.990 (Shopify 2% + MP ~3,80%)
-    400  IA
-    365  reserva devolución 1%
───────
  24.080  margen de contribución (techo de ads)
```

La reserva del 1% cubre: devolver el cobro, el envío de ida ya pagado, un envío de vuelta ($4.000) y la comisión que no se recupera. No vuelve a comprar la pieza.

Fórmula:

```
utilidad = 24.080 − CPA
quiebre  = CPA ≈ $24.100
```

La landing todavía dice “envío gratis”. Si se cobra $2.000, hay que cambiar eso.

---

## 1. Pieza

**$4.500** puesto en Chile = **12,9%** de un ticket $34.990, o **12,2%** del cobro $36.990.

El producto no aprieta. Aprietan ads, la comisión 5,8% (Shopify + Mercado Pago) y el $2.000 neto de envío.

Pendiente: ¿los $4.500 llevan IVA? ¿mínimo de compra / plazo de reposición?

---

## 2. Envío y empaque

| Ítem | Cliente paga | Nosotros pagamos | Neto |
| --- | --- | --- | --- |
| Envío | $2.000 | $4.000 | **−$2.000** |
| Empaque | $0 | $1.500 | **−$1.500** |
| **Logística** | **$2.000** | **$5.500** | **−$3.500** |

Si el promedio de $4.000 se va a $5.000–$6.000 (Magallanes, express 24 h, reintentos), cada $1.000 extra sale entero de la utilidad. El “24–48 h” de la landing empuja al tramo caro.

---

## 3. IA (Replicate)

Una llamada por preview: `bria/remove-background` para encuadrar. El hueco vacío es marfil, no Flux.

| Paso | Costo típico | En CLP @ $930 |
| --- | --- | --- |
| Recorte | US$0,008–0,025 | $7–$23 |
| **Preview** | **US$0,01–0,03** | **$7–$25** |

Planificación: **$100 / preview**. En las tablas: **4 previews por venta = $400**.

| Previews / venta | IA / venta |
| --- | --- |
| 2 | $200 |
| **4** | **$400** |
| 8 | $800 |

Aunque se vaya a $800, es ~2% del cobro. No es el costo que decide el negocio. Hosting Vercel es ruido (US$0–20/mes al inicio).

---

## 4. Ads: qué puede costar una venta

CPA = pauta para **cerrar 1 venta**. Referencias Chile ecommerce 2025–2026: CPL Meta ~$5.600, CAC ~$15.000, banda ancha $10.000–$22.000. Joyería/regalo arranca más caro que un commodity.

ROAS acá se calcula sobre el **cobro $36.990** (ticket + envío), que es lo que debería ver el pixel.

| Escenario | CPA | ROAS | Lectura |
| --- | --- | --- | --- |
| Excelente | $6.000 | 6,2× | Creativo que pega, cuenta ya aprendida |
| Bueno | $9.000 | 4,1× | Se puede escalar con cuidado |
| **Base** | **$12.000** | **3,1×** | Número de planificación |
| Pesado | $15.000 | 2,5× | Learning o nicho frío |
| Caro | $20.000 | 1,8× | Todavía verde, frágil |
| Quiebre | ~$22.500 | 1,6× | Cero utilidad |
| Pérdida | $24.000+ | <1,6× | Cada venta quema caja |

Con comisión al 5,8%, el quiebre queda cerca de **$24.100**. El plan sigue siendo CPA **$12.000**.

Presupuesto mínimo para tener señal (no para ser rentable): **$300.000–$500.000** en 2–3 semanas.

---

## 5. El ticket todavía se puede pensar

Misma estructura de costos, cambia el precio. La comisión 5,8% sube con el ticket. Devoluciones 1%. CPA de ads **no** se ajusta solo: un ticket más alto suele encarecer el CPA; uno más bajo a veces lo baja. Los cuadros de abajo son referencia; la página `/costos` recalcula en vivo.

Utilidad por venta = contribución − CPA.

| Ticket | Cliente paga | Comisión | Contribución | CPA máx. | Utilidad @ $9k | @ $12k | @ $15k | @ $20k |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| $24.990 | $26.990 | $2.699 | $13.626 | $13.600 | $4.626 | **$1.626** | −$1.374 | −$6.374 |
| $29.990 | $31.990 | $3.199 | $18.076 | $18.100 | $9.076 | $6.076 | $3.076 | −$1.924 |
| **$34.990** | **$36.990** | **$3.699** | **$22.526** | **$22.500** | **$13.526** | **$10.526** | **$7.526** | **$2.526** |
| $39.990 | $41.990 | $4.199 | $26.976 | $27.000 | $17.976 | $14.976 | $11.976 | $6.976 |
| $44.990 | $46.990 | $4.699 | $31.426 | $31.400 | $22.426 | $19.426 | $16.426 | $11.426 |
| $49.990 | $51.990 | $5.199 | $35.876 | $35.900 | $26.876 | $23.876 | $20.876 | $15.876 |

Lectura:

- **$24.990 no aguanta** un CPA de mercado. Con ads a $12.000 sobran $1.600. A $15.000 ya se pierde.
- **$29.990 es justo.** Aguanta $12.000; a $15.000 quedan $3.000; a $20.000 se pierde.
- **$34.990 es el piso cómodo** con estos costos. A CPA base quedan **~$10.500** por venta. A $20.000 todavía no quiebra.
- Subir a $39.990–$44.990 da colchón de verdad, **si** el CPA no se dispara lo mismo. Vale testear dos precios, no adivinar.

---

## 6. Unit economics a $34.990

Costo variable por venta iniciada (promedio, con 1% de devoluciones): **$14.464**.  
Ingreso esperado: **$36.620**.  
Contribución: **$22.526**.

| CPA ads | Costo total | Utilidad / venta | Margen sobre cobro $36.990 |
| --- | --- | --- | --- |
| $6.000 | $20.464 | **$16.526** | 45% |
| $9.000 | $23.464 | **$13.526** | 37% |
| $12.000 | $26.464 | **$10.526** | 28% |
| $15.000 | $29.464 | **$7.526** | 20% |
| $20.000 | $34.464 | **$2.526** | 7% |
| $22.500 | $36.964 | **~$0** | 0% |

---

## 7. Simulación de ventas (ticket $34.990)

Utilidad ≈ `ventas × (22.526 − CPA)`. Sin sueldo, sin creativos, sin arriendo.

### 7.1 Ventas para un objetivo de utilidad

| Objetivo | CPA $6.000 | CPA $9.000 | CPA $12.000 | CPA $15.000 | CPA $20.000 |
| --- | --- | --- | --- | --- | --- |
| $250.000 | 16 | 19 | 24 | 34 | 99 |
| $500.000 | 31 | 37 | 48 | 67 | 198 |
| **$1.000.000** | **61** | **74** | **96** | **133** | **396** |
| $2.000.000 | 121 | 148 | 191 | 266 | 792 |
| $5.000.000 | 303 | 370 | 476 | 665 | 1.979 |

Con CPA **$12.000** hacen falta **96 ventas** para ~$1 millón. Facturación cobrada ~$3,55 M (96 × $36.990) y pauta ~$1,15 M.

A $24.990 y el mismo CPA $12.000, para $1 millón harían falta ~**615 ventas**. El ticket barato no se “compensa con volumen” si el ads no baja mucho.

### 7.2 Si fijas el presupuesto de ads

| Plata / mes | Ventas @ $9.000 | Utilidad | Ventas @ $12.000 | Utilidad | Ventas @ $15.000 | Utilidad |
| --- | --- | --- | --- | --- | --- | --- |
| $300.000 | 33 | $446.000 | 25 | $263.000 | 20 | $151.000 |
| $500.000 | 55 | $744.000 | 41 | $432.000 | 33 | $248.000 |
| $1.000.000 | 111 | $1.501.000 | 83 | $874.000 | 66 | $497.000 |
| $2.000.000 | 222 | $3.003.000 | 166 | $1.747.000 | 133 | $1.001.000 |

### 7.3 Tres películas mensuales

**A. Prueba (mes 1)**  
Pauta $400.000, CPA $18.000 (learning), 22 ventas.

- Cobro bruto: $813.780
- Tras 1% devoluciones y costos (pieza, courier, empaque, comisión, IA): ~$314.000
- Ads: $400.000
- **Utilidad: ~$100.000**

Sirve para aprender. Si el mes 2 el CPA no baja de $18.000, el problema es oferta/creativo, no “falta presupuesto”.

**B. Base**  
Pauta $800.000, CPA $12.000, 66 ventas.

- Cobro bruto: $2.441.340
- Costos variables: ~$955.000
- Ads: $800.000
- **Utilidad: ~$690.000**

**C. Bueno**  
Pauta $800.000, CPA $9.000, 88 ventas.

- Cobro bruto: $3.255.120
- Costos variables: ~$1.274.000
- Ads: $800.000
- **Utilidad: ~$1.190.000**

### 7.4 Capital de stock

96 ventas ($1 millón @ CPA $12.000) piden **$432.000** en piezas. Si el proveedor tarda 3–4 semanas, hay que financiar el ciclo siguiente encima.

---

## 8. Lo que todavía no está metido

1. **IVA.** Si $34.990 lleva IVA, el neto es $29.403. Ads y pieza con factura dan crédito. Esta planilla es “plata en la cuenta”, no “utilidad SII”.
2. **Comisión.** Shopify 2% + Mercado Pago 3,19% + IVA ≈ 3,80% = **5,8%** total sobre ticket + envío. Si MP no es “dinero inmediato”, el tramo de MP puede bajar un poco.
3. **Tasa preview → compra.** 4 previews por venta es un supuesto. Si el simulador es un juguete gratis, la IA sube y el pixel se llena de no-compradores.
4. **Creativos / UGC / agencia.** $0 si lo haces tú; $200.000–$600.000 si lo saca una agencia.
5. **Tu tiempo** (empaque, WhatsApp, reclamos).
6. **No entregados / chargebacks.** Distinto de la devolución del 1%: el paquete no volvió.
7. **Estacionalidad.** Nov–Dic sube CPM y también intención de regalo.
8. **Precio vs. CPA.** Subir el ticket no es gratis en Meta. Hay que medir los dos juntos.

---

## 9. Cómo leer esto

- Con estos costos, **$34.990 es el ticket mínimo razonable**. $24.990 no sobrevive un CPA chileno normal.
- Plan conservador: **1% de conversión**, CPC $200 → **CPA $20.000**. Quedan **~$4.100** por venta.
- Quiebre a $34.990: no pagues más de **~$24.100** por una venta.
- La IA sigue siendo irrelevante frente a ads. La comisión ya no es un colchón del 10%: es Shopify + Mercado Pago.
- Si después de $400.000–$500.000 de pauta el CPA sigue sobre $20.000, para. No escales para promediar.

Cuando fijes ticket definitivo (o la comisión real), se recalcula.
