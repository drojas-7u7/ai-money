# Contrato de interfaz compartido — congelar antes de codificar

Base URL local `http://localhost:8000`. Todos los JSON en `snake_case`; euros como números decimales, porcentajes de entrada expresados **en %**, no fracciones (`annual_rate: 6` = 6% TIN). Respuestas redondeadas a 2 decimales. Fechas ISO 8601 si se usan. CORS para `http://localhost:5173`.

## Endpoints de la demo
| Método | Ruta | Entrada | Salida | Owner |
|---|---|---|---|---|
| GET | `/health` | — | `{"status":"ok"}` | General |
| GET | `/profile` | — | `FinancialProfile` | Dev 3 |
| PUT | `/profile` | `FinancialProfile` | `FinancialProfile` | Dev 3 |
| GET | `/finance/summary` | — | `FinanceSummary` | Dev 3 |
| POST | `/finance/savings` | `SavingsRequest` | `SavingsResponse` | Dev 3 |
| POST | `/finance/loan` | `LoanRequest` | `LoanResponse` | Dev 3 |
| POST | `/payslip` | multipart `file` PDF | `PayslipResponse` | Dev 4 |
| POST | `/chat` | `ChatRequest` | `ChatResponse` | Dev 5 |
| GET | `/quiz/pre` o `/quiz/post` | — | `QuizQuestions` | General |
| POST | `/quiz/pre` o `/quiz/post` | `QuizAnswers` | `QuizScore` | General |

Para demo **no** implementar `/auth/register`, `/auth/login`, `/quiz/results` si no hay tiempo. El quiz no requiere cuentas: puntuación pre/post guardada en React. `GET /profile` devuelve el perfil de demo activo en memoria, inicializado con primer fixture por el integrador; no hay usuario multi-sesión. La UI puede cargar `perfiles.json` directamente para elegir ejemplos y efectuar `PUT /profile` al seleccionar uno.

### Perfil
```json
{"profile_id":"demo_01","alias":"Alex (ficticio)","monthly_income":1800,"fixed_expenses":900,"variable_expenses":500,"current_savings":200,"goal":"Fondo de emergencia"}
```
`monthly_income` = ingreso neto mensual disponible; **no** bruto de nómina. `monthly_expenses` calculado = fixed + variable. `GET /finance/summary`:
```json
{"income":1800,"expenses":1400,"available":400,"savings_rate":22.22,"goals":["Fondo de emergencia"]}
```
`savings_rate` es **capacidad potencial** de ahorro (disponible/ingreso), no ahorro realmente realizado.

### Ahorro
```json
{"goal":"Emergencia","target_amount":1200,"current_saved":0,"months":12}
```
Respuesta:
```json
{"monthly_contribution":100,"plan":[{"month":1,"accumulated":100},{"month":12,"accumulated":1200}],"feasible":true,"explanation":"Necesitas reservar 100 € al mes. Es una simulación sin intereses."}
```
`plan` debe incluir **todos** los meses; arriba se muestran solo el primero y último para abreviar. `feasible` compara aportación con el disponible del perfil activo; si aún no hay perfil, devolver `null` y explicar que no se evaluó viabilidad.

### Préstamo
```json
{"amount":1200,"months":12,"annual_rate":0,"monthly_income":1800,"monthly_expenses":1400}
```
Respuesta:
```json
{"monthly_payment":100,"total_paid":1200,"total_interest":0,"income_ratio":5.56,"risk_level":"low","explanation":"La cuota sería de unos 100 €/mes. Simulación educativa sin comisiones ni seguros."}
```
`income_ratio` = (cuota / ingreso neto) × 100. `risk_level` se define por **margen tras gastos y cuota**, no por porcentaje de cuota aislado: `high` si `monthly_income - monthly_expenses - monthly_payment < 0`; `medium` si margen >= 0 y cuota > 50% del disponible antes del préstamo; `low` en otro caso. No equivale a evaluación bancaria.

### Nómina
Subida: `multipart/form-data`, campo `file`, aceptar solo PDF con texto y archivo máximo recomendado 2 MB. Para JSON:
```json
{"gross":2000,"net":1592,"deductions":[{"code":"cc","label":"Contingencias comunes","amount":94},{"code":"unemployment","label":"Desempleo","amount":31},{"code":"training","label":"Formación profesional","amount":2},{"code":"mei","label":"MEI","amount":3},{"code":"irpf","label":"IRPF","amount":278}],"concepts":[{"code":"gross","label":"Salario bruto","explanation":"Importe devengado antes de deducciones."}],"source":"synthetic_pdf","warning":"Ejemplo ficticio para aprendizaje."}
```
Para PDF 1, IRPF fijado como ejemplo al 13,9% de 2000 = 278. Las deducciones suman 408; neto = 1592. No devolver nombre, DNI, IBAN, dirección, empresa ni texto bruto de PDF.

### Chat
```json
{"message":"¿Por qué cobro menos que el bruto?","history":[],"context":{"monthly_income":1800,"available":400,"payslip_gross":2000,"payslip_net":1592,"loan_monthly_payment":null,"savings_monthly_contribution":100}}
```
Respuesta:
```json
{"reply":"El bruto es lo devengado antes de las deducciones; el neto es la cantidad que queda tras ellas.","check_question":"¿Cuál de los dos suele llegar a tu cuenta?"}
```
El cliente limita `history` a últimos 4 mensajes, con roles `user`/`assistant`. Contexto solo de campos permitidos, nunca nómina original, nombres, identificadores ni historial financiero completo.

### Quiz opcional
`GET /quiz/pre` y `/quiz/post`: `{"questions":[{"id":"q1","text":"¿Qué es el salario neto?","options":["Antes de deducciones","Después de deducciones"],"correct_index":1}]}`. No enviar `correct_index` al frontend en una app real; **para el MVP demo** calcular en backend en `POST /quiz/...` recibiendo `{"answers":{"q1":1,"q2":0,"q3":2}}` y devolviendo `{"score":3,"total":3}`.

## Error uniforme
FastAPI devuelve `422` para entradas inválidas; `400` para PDF no admitido; `413` para PDF excesivo; `503` si el proveedor LLM falla y no hay fallback. No devolver traza ni texto de PDF en errores.

## Esquemas fuente
Importar modelos de `backend/app/schemas/`. No redefinir modelos con nombres distintos en rutas; `response_model` obligatorio en FastAPI. Ante cambios, editar contrato **antes** de implementarlo y avisar a todos.
