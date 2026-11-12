# AI Money 💸

**Entender tu dinero. Decidir con criterio.**

Aplicación web educativa de finanzas personales desarrollada para el **Tech 4 Inclusion Challenge — Reto Ebury × Fundación Somos F5**.

AI Money ayuda a comprender una nómina, organizar un presupuesto, simular objetivos de ahorro y calcular escenarios de financiación. Combina herramientas de cálculo en Python con un asistente conversacional para ofrecer explicaciones comprensibles a personas con distintos niveles de educación financiera.

> **Estado:** MVP desarrollado con frontend React y backend FastAPI. Este repositorio contiene módulos implementados para perfiles, finanzas, análisis de nóminas, chat educativo y cuestionarios. La ejecución y las integraciones deben validarse en cada entorno antes de una demostración.
>
> **Uso educativo:** no concede créditos, no recomienda productos financieros concretos y no sustituye asesoramiento profesional. Los ejemplos y documentos de prueba son ficticios.

## Objetivo social y ODS

El proyecto pretende disminuir las barreras de comprensión que dificultan las decisiones financieras cotidianas:

| Objetivo | Contribución de AI Money |
| --- | --- |
| **ODS 4 — Educación de calidad** | Enseñanza práctica sobre nóminas, ahorro, presupuestos e intereses, con un cuestionario para evaluar conocimientos. |
| **ODS 10 — Reducción de las desigualdades** | Explicaciones en lenguaje claro y herramientas gratuitas de simulación orientadas a personas con diferentes niveles de conocimientos financieros. |
| **ODS 8 — Trabajo decente y crecimiento económico** | Ayuda a interpretar conceptos del salario y las deducciones de nómina. |

La vinculación con los ODS expresa la **finalidad del proyecto**, no constituye por sí sola evidencia de impacto real. Para estimar aprendizaje hacen falta evaluaciones antes y después de usar la aplicación, con preguntas comparables y datos obtenidos de participantes.

## Funcionalidades

### Perfil y presupuesto

- Selección o actualización de un perfil financiero de demostración.
- Registro de ingresos netos mensuales, gastos fijos, gastos variables, ahorros y objetivo financiero.
- Cálculo de gastos totales, saldo mensual disponible y capacidad potencial de ahorro.

### Planificador de ahorro

- Simulación a partir de un objetivo, un ahorro inicial y un plazo en meses.
- Cálculo de la aportación mensual necesaria y evolución acumulada.
- Comprobación orientativa de viabilidad frente al dinero disponible del perfil.
- **No se incluyen rendimientos ni intereses en el plan básico.**

### Simulador de préstamos

- Cálculo de cuota mensual, total a devolver e intereses de un préstamo simulado.
- Indicadores educativos de carga de la cuota y margen presupuestario.
- **Los escenarios no constituyen una oferta bancaria ni una evaluación crediticia.**

### Analizador de nóminas de demostración

- Envío de nóminas ficticias en PDF; el código también contempla imágenes PNG, JPG y WEBP.
- Extracción de importes brutos, netos y deducciones para explicarlos de forma didáctica.
- Para PDFs con texto seleccionable hay un mecanismo alternativo basado en reglas cuando no está disponible Groq.
- El procesamiento mediante IA y el análisis de imágenes requieren una configuración válida del proveedor/modelo correspondiente.
- El servicio conserva el último resultado en memoria y puede escribir una copia de depuración en `backend/uploads/`.

> **Privacidad:** utilizar exclusivamente nóminas sintéticas en esta demostración. No subir documentos reales ni datos identificativos. Algunas rutas pueden transmitir texto de la nómina al proveedor externo de IA; el repositorio no debe anunciar anonimización automática garantizada.

### Chat educativo con IA

- Consultas sobre nóminas y conceptos económicos en lenguaje sencillo.
- Conexión con **Groq** a través del SDK de Python y variables de entorno.
- Contexto reducido a campos financieros permitidos, historial breve y glosario educativo.
- Filtro de datos sensibles y respuesta alternativa basada en glosario ante fallos del proveedor.
- Pregunta final de comprensión.

**Alcance importante:** el código del chat consultado genera respuestas mediante Groq y contexto, pero **no acredita por sí solo una orquestación autónoma de llamadas a las herramientas financieras**. Esa funcionalidad debe verificarse explícitamente antes de describirla como agente con *tool calling*.

### Cuestionarios de aprendizaje

- API de cuestionario previo y posterior: `GET /quiz/{phase}` y `POST /quiz/{phase}`, donde `phase` es `pre` o `post`.
- Banco de **30 preguntas posteriores** (10 de nóminas, 10 de ahorro y 10 de préstamos).
- El componente de evaluación del frontend selecciona **10 preguntas aleatorias** del banco y muestra puntuación y resultados por categoría.

**Limitaciones actuales a revisar:**

1. La pregunta de confianza subjetiva incluida en el cuestionario previo aparece configurada con una opción «correcta»; debería registrarse sin puntuarla como conocimiento.
2. La experiencia de evaluación inicial y posterior todavía requiere comprobación conjunta de su recorrido y de la comparabilidad de indicadores. No presentar resultados ficticios como impacto medido.

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Interfaz | React 18, Vite 5, JavaScript |
| Componentes y visualización | Lucide React, Recharts |
| API | Python, FastAPI, Uvicorn |
| Modelos y validación | Pydantic |
| Cálculo financiero | Servicios Python propios |
| IA conversacional y extracción | Groq SDK y modelos configurados por entorno |
| Nóminas | `pypdf`, reglas de extracción y procesado opcional con IA |
| Configuración | `python-dotenv`, archivo `.env` local |
| Pruebas | Tests Python en `backend/tests/` |

Las versiones exactas se gestionan desde `requirements.txt` y `frontend/package.json`. Hay que comprobar que las dependencias de los módulos integrados —en particular `groq` y `pypdf`— estén presentes en el archivo de instalación utilizado por todos los colaboradores.

## Estructura principal

```text
ai-money/
├── .env.example                 # Ejemplo de configuración
├── .github/                    # Automatizaciones del repositorio
├── README.md
├── requirements.txt             # Dependencias Python compartidas
├── start-dev.py                # Lanzador simultáneo backend/frontend
├── backend/
│   ├── app/
│   │   ├── main.py             # Aplicación FastAPI, CORS y rutas
│   │   ├── api/routes/         # profile, finance, payslip, chat, quiz
│   │   ├── schemas/            # Contratos Pydantic
│   │   ├── services/
│   │   │   ├── finance/        # Presupuesto, ahorro y préstamos
│   │   │   ├── payslip/        # Extracción de nóminas
│   │   │   ├── chat/           # LLM, glosario, privacidad y fallback
│   │   │   └── quiz/           # Preguntas y corrección
│   │   ├── content/            # Glosario educativo
│   │   └── core/               # Estado y configuración compartidos
│   ├── tests/                  # Pruebas backend
│   └── uploads/                # Datos locales de depuración: no subir
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── api/                # Cliente HTTP
│       ├── state/              # Estado de la aplicación
│       └── components/         # Landing, perfil, dashboard, etc.
├── data/samples/              # Perfiles y nóminas ficticias
├── docs/                      # Plan, API, fórmulas y pruebas
└── infra/                     # Recursos de infraestructura
```

## Instalación local

### Requisitos previos

- Python **3.12** recomendado para reproducir el entorno del proyecto.
- Node.js y npm.
- Git.
- Opcional: credenciales válidas de Groq para utilizar los servicios con IA.

En **Windows con WSL2 Ubuntu**, abrir el proyecto desde la terminal de Ubuntu. Las rutas de Windows se representan habitualmente como `/mnt/c/...`.

### 1. Clonar y preparar Python

```bash
git clone https://github.com/drojas-7u7/ai-money.git
cd ai-money
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

**Nota de dependencias:** el módulo de nóminas y el chat importan `groq`; el extractor de PDF importa `pypdf`. Si el archivo de dependencias de la revisión que estás usando no los incluye todavía, coordinar su incorporación al `requirements.txt` del equipo antes de desplegar.

### 2. Instalar el frontend

```bash
cd frontend
npm install
cd ..
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con un editor local. Variables usadas por el código:

```dotenv
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173
PORT=8000
```

Para usar el chat con IA, incluir una clave válida en `GROQ_API_KEY`. No publicar ni compartir `.env`. Si no hay clave, las funciones con IA pueden utilizar un modo alternativo o indicar que requieren configuración, según el módulo.

### 4. Arrancar backend y frontend

Desde la raíz, con `.venv` activado:

```bash
python start-dev.py
```

El lanzador inicia Vite y Uvicorn. Detener ambos con `Ctrl+C`.

| Servicio | Dirección local |
| --- | --- |
| Interfaz web | http://localhost:5173 |
| API FastAPI | http://localhost:8000 |
| Swagger / documentación interactiva | http://localhost:8000/docs |
| Comprobación de salud | http://localhost:8000/health |

### Arranque manual (alternativo)

Terminal 1, en la raíz del proyecto:

```bash
source .venv/bin/activate
cd backend
uvicorn app.main:app --reload --env-file ../.env
```

Terminal 2, desde `frontend/`:

```bash
npm run dev
```

## API principal

| Método | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/health` | Salud del servicio |
| `GET` / `PUT` | `/profile` | Consultar o actualizar el perfil activo |
| `GET` | `/finance/summary` | Resumen de ingresos, gastos y disponible |
| `POST` | `/finance/savings` | Plan de ahorro |
| `POST` | `/finance/loan` | Simulación de préstamo |
| `POST` | `/payslip` | Analizar nómina sintética |
| `GET` | `/payslip/latest` | Consultar el último análisis |
| `POST` | `/chat` | Consultar al asistente educativo |
| `GET` / `POST` | `/quiz/pre` | Preguntas y corrección inicial |
| `GET` / `POST` | `/quiz/post` | Preguntas y corrección posterior |

Consultar modelos, validaciones y ejemplos de peticiones en [`docs/CONTRATO_API.md`](docs/CONTRATO_API.md) y en `/docs` con el backend arrancado. El contrato documental puede requerir actualización cuando cambien las rutas implementadas.

## Probar el proyecto

Con las dependencias de prueba instaladas, desde la carpeta `backend/`:

```bash
python -m pytest tests/ -v
```

Para comprobar solamente que el módulo de arranque puede importarse:

```bash
python -c "from app.main import app; print('Backend importado correctamente')"
```

Estas instrucciones **no implican que toda la suite se haya ejecutado en esta revisión**. Tras integrar ramas, ejecutar tests y verificar manualmente los flujos de perfil, ahorro, préstamo, nómina, chat y cuestionario.

## Recorrido sugerido para la demostración

1. Abrir AI Money y seleccionar un **perfil ficticio**.
2. Mostrar el dashboard y el saldo disponible.
3. Simular un objetivo de ahorro y revisar si encaja con el presupuesto.
4. Comparar un escenario de préstamo y explicar cuota y coste.
5. Analizar una nómina sintética para distinguir bruto, neto y deducciones.
6. Consultar al chat y mostrar la explicación con su pregunta de comprensión.
7. Completar una evaluación de conocimientos y mostrar la puntuación por categorías.

Si se presentan resultados antes/después, verificar antes que las preguntas y las escalas son realmente comparables y que los resultados proceden de usuarios o pruebas identificadas como ficticias.

## 3 ejemplos de interacción con razonamiento del agente

Chat con nivel principiante
Usuario: "¿Qué es la TAE?"
Razonamiento: el agente detecta financial_level = principiante en el contexto → evita fórmulas → usa una analogía del "precio real del préstamo" → no inventa cifras porque no hay simulación activa en ese turno.

Simulador de préstamo
Usuario introduce: capital 5.000 €, 24 meses, 8 % TIN.
Razonamiento: el motor determinista calcula cuota y TAE → el LLM recibe solo el resultado estructurado → explica si la cuota encaja con el perfil cargado y qué significa el diferencial TIN/TAE, sin inventar números.

Análisis de nómina + chat encadenado
Usuario sube PDF de Lucía → el extractor devuelve bruto/neto/deducciones → el usuario pregunta "¿por qué me quitan tanto?" → el agente usa los valores extraídos reales para explicar IRPF y SS, citando los importes del documento, no valores genéricos.

## Privacidad, seguridad y límites

- Utilizar **solo perfiles y documentos ficticios** en la demo.
- No publicar claves de API, archivos `.env`, documentos reales ni copias de `backend/uploads/`.
- El modelo de perfil activo se mantiene en memoria; **no hay autenticación ni aislamiento entre usuarios**.
- El análisis de nómina puede utilizar servicios externos de IA: no asumir que los datos están anonimizados automáticamente.
- La API tiene mecanismos de contexto reducido y filtrado en el chat, pero deben comprobarse antes de procesar información sensible.
- Los cálculos y niveles de riesgo son orientativos y didácticos; no equivalen a asesoramiento financiero ni a decisiones de crédito.

## Documentación del equipo

- [`docs/PLAN_MVP.md`](docs/PLAN_MVP.md): alcance y organización del MVP.
- [`docs/CONTRATO_API.md`](docs/CONTRATO_API.md): contrato de API, entradas y salidas.
- [`docs/formulas.md`](docs/formulas.md): cálculos de presupuesto, ahorro y préstamos.
- [`docs/GUIA_CHAT.md`](docs/GUIA_CHAT.md): pautas de conversación y límites.
- [`docs/CASOS_PRUEBA.md`](docs/CASOS_PRUEBA.md): escenarios de aceptación.
- [`backend/app/content/payslip_glossary.json`](backend/app/content/payslip_glossary.json): glosario de conceptos de nómina.

## Equipo

| Participante | Área principal |
| --- | --- |
| Majo | Interfaz y formularios React |
| David | Integración, API frontend y estado |
| María Roldán | Perfil, presupuesto, ahorro, préstamos y documentación financiera |
| Josema | Análisis de nóminas |
| María Isabel | Chat educativo con IA |
| Vittorio (Ebury) | Revisión de prompts y alcance del asistente |
| Laura (Ebury) | Evaluación, impacto social y privacidad |

## Licencia

No se declara una licencia de reutilización en este documento. Consultar las condiciones que acuerde el equipo y añadir un archivo `LICENSE` si corresponde.

---

*AI Money · Reto Ebury × Fundación Somos F5 · Proyecto educativo de demostración.*
