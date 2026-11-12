# AI Money — Reto Ebury

**MVP educativo de finanzas personales** · Bootcamp IA · Desarrollo previsto: **150 minutos de trabajo en equipo**.

> **Estado actual:** el repositorio de GitHub contiene la estructura de carpetas inicial con archivos `.gitkeep`. Este material aporta documentación, contratos, esquemas Pydantic y datos ficticios de prueba; **no implementa todavía la aplicación completa**. No introducir datos personales ni nóminas reales.

## ¿Qué hace el MVP?

AI Money ayuda a entender un presupuesto personal, calcular un plan de ahorro, simular el coste de un préstamo, interpretar conceptos de una nómina **ficticia** y plantear preguntas a un asistente educativo. Para que sea realizable en el tiempo disponible se prescinde, inicialmente, de cuentas/JWT, base de datos, OCR de imágenes, despliegue cloud y análisis universal de nóminas.

El flujo de demostración será: **elegir un perfil ficticio → consultar balance → simular ahorro → simular préstamo → analizar PDF sintético → preguntar al chat**. El cuestionario antes/después es opcional si falta tiempo.

## Tecnologías previstas

- **Frontend:** React + Vite.
- **Backend:** FastAPI + Pydantic (Python).
- **IA:** llamada a un LLM por API para explicaciones, nunca para efectuar los cálculos financieros.
- **Datos:** perfiles y nóminas sintéticas; sesión de demo en memoria, sin persistencia.

Estas tecnologías son el **objetivo de desarrollo**, no dependencias ya instaladas en el repositorio inicial.

## Estructura del repositorio

```text
ai-money/
├── README.md
├── .github/
├── backend/
│   ├── app/
│   │   ├── api/routes/           # Rutas FastAPI, aún por desarrollar
│   │   ├── content/              # Glosario de nóminas
│   │   ├── core/                 # Configuración y memoria compartida
│   │   ├── schemas/              # Contrato Pydantic común
│   │   └── services/
│   │       ├── finance/          # Presupuesto, ahorro y préstamos
│   │       ├── payslip/          # Lectura de nóminas sintéticas
│   │       ├── chat/prompts/     # Asistente educativo
│   │       └── metrics/          # Impacto / cuestionario
│   ├── tests/
│   └── uploads/                 # No almacenar documentos reales
├── data/samples/
│   ├── perfiles/                # perfiles.json
│   └── nominas/                # Cuatro PDF y resultados esperados
├── docs/                        # Plan, contrato y fórmulas
├── frontend/                    # Interfaz React, por desarrollar
└── infra/                       # Infraestructura futura
```

**Observación:** esta es la estructura de carpetas confirmada en el clon el **11/11/2026**, ampliada con los archivos que aporta el paquete. En el clon actual, la mayoría de estas carpetas únicamente tienen `.gitkeep`.

## Equipo y propiedad de código

| Responsable | Responsabilidad | Directorios principales |
|---|---|---|
| Majo (Dev 1) | Vista y formularios | `frontend/src/components/`, `frontend/src/styles/` |
| David (Dev 2) | API frontend y estado | `frontend/src/api/`, `frontend/src/state/` |
| María Roldán (Dev 3) | Fórmulas, perfil, ahorro, préstamos y documentación de nómina | `backend/app/services/finance/`, `backend/app/api/routes/profile.py`, `finance.py`, `docs/formulas.md`, `backend/app/content/payslip_glossary.json` |
| Josema (Dev 4) | Lectura y estructuración de nóminas PDF sintéticas | `backend/app/services/payslip/`, `backend/app/api/routes/payslip.py` |
| María Isabel (Dev 5) | Chat educativo contextual | `backend/app/services/chat/`, `backend/app/api/routes/chat.py` |
| Coordinación / General | Integración del backend, dependencias y pruebas globales | `backend/app/main.py`, `backend/requirements.txt`, `backend/app/core/` |
| Vittorio (Ebury) | Revisión de prompts y privacidad | Revisión coordinada con Dev 4–5 |
| Laura (Ebury) | Cuestionario, privacidad y demo | Documentación y métricas |

## Antes de programar: contrato común

1. Leer [`docs/PLAN_MVP.md`](docs/PLAN_MVP.md) y [`docs/CONTRATO_API.md`](docs/CONTRATO_API.md).
2. Incorporar una sola vez los modelos de `backend/app/schemas/` a la rama base compartida, con una persona responsable de esos archivos.
3. Actualizar las ramas personales desde `main` (no existe rama `dev`, según confirmación del equipo).
4. No cambiar los nombres de endpoints ni los campos JSON sin acordarlo. Todos los importes de los perfiles son **netos mensuales**, no brutos.
5. Cada miembro trabaja en sus archivos y abre un PR hacia la rama base acordada.

**No copiar este paquete indiscriminadamente encima del repositorio**: revisar primero qué archivos se han creado entretanto y evitar sobrescrituras. Mantener el `README.md` actual hasta revisar la propuesta con quien coordina la integración.

## Contrato API de la demo

| Método | Endpoint | Dueño |
|---|---|---|
| GET | `/health` | General |
| GET / PUT | `/profile` | Dev 3 |
| GET | `/finance/summary` | Dev 3 |
| POST | `/finance/savings` | Dev 3 |
| POST | `/finance/loan` | Dev 3 |
| POST | `/payslip` (PDF de texto ficticio) | Dev 4 |
| POST | `/chat` | Dev 5 |
| GET / POST | `/quiz/pre`, `/quiz/post` (opcional) | General |

Entradas y salidas exactas, códigos HTTP y ejemplos: [`docs/CONTRATO_API.md`](docs/CONTRATO_API.md).

## Datos de prueba

- [`data/samples/perfiles/perfiles.json`](data/samples/perfiles/perfiles.json): cuatro perfiles financieros ficticios.
- `data/samples/nominas/demo_01_alex.pdf` a `demo_04_dani.pdf`: nóminas sintéticas con texto seleccionable.
- [`data/samples/nominas/nominas_esperadas.json`](data/samples/nominas/nominas_esperadas.json): resultados esperados de extracción.
- [`docs/CASOS_PRUEBA.md`](docs/CASOS_PRUEBA.md): escenarios de aceptación.

Los porcentajes de IRPF y simplificaciones salariales de los PDFs **son supuestos didácticos**; no reproducen de forma íntegra el cálculo legal de una nómina.

## Arranque y comprobaciones (cuando se implemente)

Los comandos siguientes presuponen que el equipo haya creado `backend/requirements.txt`, `backend/app/main.py`, `frontend/package.json` y los archivos de Vite. **Todavía no están presentes en el repositorio inicial.**

```bash
# Terminal 1, desde ai-money/
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

```bash
# Terminal 2, desde ai-money/
cd frontend
npm install
npm run dev
```

Frontend previsto: `http://localhost:5173`. Documentación FastAPI: `http://localhost:8000/docs`.

### Validar los modelos que aporta el paquete

En `backend/`, con Python y dependencias de prueba instaladas:

```bash
pip install pydantic pytest
python -m pytest tests/test_contract_models.py
```

Estas pruebas validan solo los **modelos compartidos**, no las rutas ni la integración completa.

## Seguridad, privacidad y límites

- Solo se permiten **datos completamente ficticios** en esta demostración.
- No subir `.env`, credenciales, nóminas reales ni `backend/uploads/` a GitHub.
- No enviar el texto completo de un PDF al LLM; transmitir únicamente campos financieros pertinentes.
- El motor financiero hace los cálculos, y el LLM los **explica**.
- El indicador de riesgo de préstamo es **educativo**: no concede créditos ni sustituye asesoramiento profesional.
- Si la lectura de una nómina o la API de IA fallan, mostrar un aviso o ejemplo preprocesado **identificado expresamente como demo**, no fingir una extracción exitosa.

## Documentación

- [`docs/PLAN_MVP.md`](docs/PLAN_MVP.md): plan de 150 minutos y reparto.
- [`docs/CONTRATO_API.md`](docs/CONTRATO_API.md): contrato de endpoints y respuestas.
- [`docs/formulas.md`](docs/formulas.md): matemáticas de presupuesto, ahorro y préstamo.
- [`backend/app/content/payslip_glossary.json`](backend/app/content/payslip_glossary.json): conceptos de nómina en lenguaje llano.
- [`docs/GUIA_CHAT.md`](docs/GUIA_CHAT.md): contexto permitido y prompt sugerido.
- [`docs/CASOS_PRUEBA.md`](docs/CASOS_PRUEBA.md): aceptación del MVP.

> **Criterio de éxito:** una demostración breve de extremo a extremo usando un perfil y una nómina ficticios, con cálculos verificables, explicaciones sencillas y límites claramente señalados.
