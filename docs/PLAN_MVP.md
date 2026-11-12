# Plan de ejecución — MVP en 150 minutos de reloj

## Objetivo de la demo
Seleccionar uno de cuatro perfiles ficticios; ver balance mensual; simular un ahorro y un préstamo; abrir una nómina PDF de ejemplo, obtener sus conceptos y preguntar al chat qué significan. Terminar con tres preguntas educativas antes/después.

## Compromisos y recortes
- **Sí:** React+Vite, FastAPI, Pydantic, cálculo determinista (nunca LLM para calcular), chat por API con fallback explicativo, PDF de texto predecible, estado de sesión en frontend, 4 perfiles, 4 nóminas sintéticas.
- **No (fase posterior):** alta/login/JWT, persistencia, PostgreSQL, OCR de imágenes, nóminas reales, precisión de cualquier formato de nómina, TAE completa con comisiones, amortización anticipada, cloud y Docker obligatorios. Si se opta por subida de PDF, solo sintéticos, en memoria y sin enviar texto completo a la IA.
- El `docs/idea.md` original exige registro y soportar PDF/imagen, pero se sustituyen temporalmente por selector de perfiles y PDF de texto por el límite de 150 minutos.
- No programar endpoints de autenticación en esta demo; el Dev 2 usa sesión local en memoria.

## Agenda de 150 minutos — trabajo en paralelo, no sumar duraciones individuales
| Minuto | Acción | Quién |
|---|---|---|
| 0–15 | Congelar API, elegir nombre, leer fixtures, asignar `main.py` | Todos |
| 15–90 | Cada developer desarrolla exclusivamente su carpeta y rutas | Dev 1–5 simultáneamente |
| 15–65 | Entregar fórmulas y glosario; revisar PDFs/fixtures | María (además de Dev 3); entregables ya incluidos |
| 90–120 | Conectar módulos, probar 4 endpoints críticos y contrato de JSON | Dev 2 + responsable general + autores |
| 120–140 | Demo de extremo a extremo; corregir fallos bloqueantes | Todos |
| 140–150 | Congelar cambios y ensayar pitch | Laura + todos |

## Propiedad y norma de no pisarse
- Majo: `frontend/src/components/**`, `frontend/src/styles/**`.
- David: `frontend/src/api/**`, `frontend/src/state/**`; NO modificar JSX de Majo.
- María: `backend/app/services/finance/**`, `backend/app/api/routes/profile.py`, `finance.py`; además `docs/formulas.md`, `backend/app/content/payslip_glossary.json`, `data/samples/**`.
- Josema: `backend/app/services/payslip/**`, `backend/app/api/routes/payslip.py`.
- María Isabel: `backend/app/services/chat/**`, `backend/app/api/routes/chat.py`.
- General/integración: `backend/app/main.py`, `backend/app/core/store.py`, `backend/requirements.txt`, archivos compartidos e infraestructura.
- Vittorio revisa prompts de chat y salida anonimizada; Laura valida cuestionario, privacidad y demo.
- `backend/app/schemas/**` y `docs/CONTRATO_API.md` quedan **congelados**: solo una persona designada para modificarlos tras comunicar el cambio.
- Cada dev crea rama `feat/<modulo>` desde rama de integración; PR pequeños, no hacer push directo a `main`; no editar archivos de terceros sin coordinar.

## Definición de terminado
1. `GET /health` devuelve `{"status":"ok"}`.
2. Perfil de demo se muestra con ingresos, gastos, disponible.
3. Ahorro 1200 desde 0 en 12 meses devuelve aportación 100.
4. Préstamo 1200, 12 meses, TIN 0% devuelve cuota 100 e intereses 0.
5. Nómina sintética devuelve gross, net, deductions, concepts sin identificadores.
6. Chat explica bruto/neto y formula una pregunta de comprobación. Si falla la API, explicación estática etiquetada como fallback.
7. No hay documentos reales ni secretos en Git, logs ni peticiones al LLM.

## Riesgos y plan B
- Si falla el parsing del PDF: mostrar datos preprocesados de los perfiles; **no** afirmar que se ha analizado el PDF.
- Si falla el LLM: modo explicaciones estáticas del glosario, identificado como modo demo.
- Si React no llega: probar backend en `/docs` y mostrar la UI disponible.
- Si el tiempo se agota: quitar quiz de la UI antes de sacrificar los simuladores.
