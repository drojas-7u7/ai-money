# Casos de aceptación compartidos

| Caso | Entrada | Resultado esperado |
|---|---|---|
| Balance | 1800 netos, 900 fijo, 500 variable | Disponible 400, tasa 22.22% |
| Déficit | 1100 ingresos, 850 fijo, 400 variable | Disponible -150, capacidad 0% |
| Ahorro base | 1200 objetivo, 0 ahorrado, 12 meses | 100/mes |
| Ahorro completado | 500 objetivo, 600 ahorrado, 8 meses | 0/mes |
| Ahorro plazo inválido | months=0 | HTTP 422 |
| Préstamo 0% | 1200 EUR, 12 meses, TIN 0 | cuota 100, intereses 0 |
| Préstamo inválido | importe negativo, TIN negativo | HTTP 422 |
| Riesgo alto | disponible 100 EUR, cuota >100 | riesgo high |
| Nómina PDF 01 | demo_01_alex.pdf | bruto 2000, neto 1592; deducciones 408 |
| PDF rechazado | imagen escaneada sin texto / PDF externo | error controlado o aviso, no cifras inventadas |
| Chat | pregunta bruto/neto | respuesta y check_question |

Nota: el contrato define `savings_rate` como capacidad potencial, no la tasa realmente ahorrada. Probar que la UI no confunde ingreso neto del perfil con bruto de la nómina.
