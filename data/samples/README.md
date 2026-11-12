# Datos totalmente ficticios
`perfiles/perfiles.json`: cuatro perfiles con ingresos NETOS (iguales al neto de cada PDF), gastos y objetivos diferentes.
`nominas/*.pdf`: documentos sintéticos con texto seleccionable, sin nombres reales, DNI, cuenta bancaria ni empresa.
`nominas/nominas_esperadas.json`: salidas previstas del lector. El Dev 4 debe identificar etiquetas e importes de las nóminas y construir la salida; **no** utilizar un mapa por nombre de PDF como si fuera OCR real.

Los tipos de IRPF son **hipótesis para construir ejemplos**, no cálculos fiscales personalizados. La cotización de Seguridad Social se simplifica usando base=bruto y tasas de ejemplo 2026; en el mundo real puede diferir.

Casos: primer empleo, parcial, profesional senior y persona con complementos variables y presupuesto deficitario. En perfiles 4, ingresos - gastos = negativo para enseñar que la app advierte sin juzgar.
