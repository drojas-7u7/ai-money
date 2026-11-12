# Fórmulas — entrega de María (en sustitución de Diego)

## Convenciones
Importes mensuales en EUR, valores sin signo negativo; interés del préstamo es TIN anual en porcentaje numérico (`6` representa `6 %`). Calcular con precisión interna y redondear solo para presentar. Simulaciones educativas, no contratos, no recomendación individualizada ni aprobación crediticia.

### 1. Balance y capacidad de ahorro
`gastos = gastos_fijos + gastos_variables`
`disponible = ingresos_netos_mensuales - gastos`
`capacidad_ahorro_pct = 100 × max(disponible, 0) / ingresos_netos_mensuales`, si ingresos > 0; si ingresos = 0, porcentaje = 0 (regla de visualización).

Por ejemplo 1800 ingresos, 900 fijos y 500 variables: disponible 400 EUR; capacidad potencial de ahorro 22,22%. Si disponible < 0 se indica déficit y porcentaje de capacidad 0; **no** ocultar el déficit.

### 2. Objetivo de ahorro sin intereses
`pendiente = max(objetivo - ahorrado, 0)`
`aportacion_mensual = pendiente / meses`, para meses >= 1. `acumulado_mes_k = min(objetivo, ahorrado + aportacion_mensual × k)`. Para la pantalla redondear a dos decimales; en último mes ajustar céntimos si hace falta para llegar al objetivo.
Ejemplo: 1200 objetivo, 0 ahorrado, 12 meses → 100 EUR/mes. Si ya ha alcanzado el objetivo, 0 EUR/mes. Si cuota > disponible no es viable con el presupuesto actual (es advertencia pedagógica).

### 3. Préstamo: cuota fija, método francés simplificado
Sea `P` importe prestado, `n` número de cuotas mensuales, `i = TIN_anual / (100 × 12)` tasa mensual nominal.
- Si `i > 0`: `cuota = P × i / (1 - (1 + i)^(-n))`.
- Si `i = 0`: `cuota = P / n`.
- `total_pagado = cuota_no_redondeada × n`.
- `intereses_totales = total_pagado - P`.
- `ratio_ingresos_pct = 100 × cuota / ingresos_netos_mensuales`.
- `margen_post_cuota = ingresos_netos_mensuales - gastos_mensuales - cuota`.
- Riesgo **didáctico propio del proyecto**, NO clasificación bancaria: alto si margen < 0, medio si margen >=0 y cuota > 50% del disponible previo, bajo en otro caso. Si disponible previo <=0, riesgo alto para préstamo de cuota positiva.
Ejemplo sin interés: 1200 EUR a 12 meses, TIN 0% → 100 EUR/mes, 1200 EUR total, 0 intereses.

El simulador no incluye comisiones, TAE, seguros, cambios de tipo, carencias ni amortizaciones anticipadas. No comparar TIN y TAE como si fueran equivalentes.

### 4. Nóminas: lógica de lectura, NO motor fiscal
`devengos_salariales_y_extras = bruto_mostrado` en los ejemplos sintéticos.
`deducciones_empleado = cotizaciones_empleado + retencion_irpf + otras_deducciones`.
`neto = bruto - deducciones_empleado` **solo para las nóminas sintéticas simplificadas del MVP**, que no incluyen conceptos extrasalariales ni anticipos. En una nómina real las bases de cotización y la base de retención no tienen por qué coincidir con el bruto, y devengos/deducciones pueden incluir otros conceptos.

Para los ejemplos se toma **base ficticia igual al bruto mensual** y contrato indefinido ordinario, sin topes ni prorrateos especiales; tipos orientativos de la parte trabajadora del Régimen General 2026: CC 4,70%, desempleo general 1,55%, formación profesional 0,10%, MEI 0,15%. Sus importes se redondean por partida a céntimos. IRPF de ejemplo elegido manualmente por caso para fines pedagógicos; en una nómina auténtica depende de circunstancias legales/personales y se determina mediante las reglas vigentes de la AEAT. No programar un cálculo real de nóminas en el MVP.

Fuentes de verificación de tipos, consultar fecha y régimen antes de reutilizar:
- Seguridad Social: https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/10721/10957/583?changeLanguage=es
- Agencia Tributaria, servicio de retenciones 2026: https://sede.agenciatributaria.gob.es/Sede/Retenciones.shtml
