"""
LLM call for the educational chat (Dev 5), using Groq.
Llamada al LLM del chat educativo (Dev 5), con Groq.

EN: Sends only the system prompt, 2–3 glossary entries, the allowed context
    fields, the short history and the question. Falls back to the glossary on any error.
ES: Envía solo el prompt de sistema, 2–3 entradas del glosario, los campos de
    contexto permitidos, el historial corto y la pregunta. Si algo falla, usa el glosario.
"""

import logging
import os

from groq import Groq

from app.schemas.chat import ChatContext, ChatRequest, ChatResponse
from app.services.chat.fallback import build_fallback_response, select_entries
from app.services.chat.prompts.system_prompt import CHECK_MARKER, SYSTEM_PROMPT

logger = logging.getLogger("ai_money.chat")

# EN: Default model if GROQ_MODEL is not set in .env.
# ES: Modelo por defecto si GROQ_MODEL no está en el .env.
DEFAULT_MODEL = "openai/gpt-oss-120b"

DEFAULT_CHECK_QUESTION = "¿Podrías explicarlo con tus propias palabras?"

# EN: Clear labels so the model never confuses net profile income with payslip gross.
# ES: Etiquetas claras para que el modelo no confunda el ingreso neto del perfil con el bruto de la nómina.
CONTEXT_LABELS = {
    "monthly_income": "Ingreso neto mensual del perfil (€)",
    "available": "Dinero disponible al mes tras gastos (€)",
    "payslip_gross": "Salario bruto de la nómina de ejemplo (€)",
    "payslip_net": "Salario neto de la nómina de ejemplo (€)",
    "loan_monthly_payment": "Cuota mensual del préstamo simulado (€)",
    "savings_monthly_contribution": "Aportación mensual del plan de ahorro (€)",
}


def _context_block(context: ChatContext) -> str:
    """EN: Only non-empty allowed fields. / ES: Solo los campos permitidos con valor."""
    lines = [
        f"- {label}: {getattr(context, field)}"
        for field, label in CONTEXT_LABELS.items()
        if getattr(context, field) is not None
    ]
    return "\n".join(lines) if lines else "- No hay datos del usuario disponibles."


def _glossary_block(message: str) -> str:
    """EN: 2–3 relevant approved entries (GUIA_CHAT step 3). / ES: 2–3 entradas aprobadas relevantes."""
    entries = select_entries(message)
    if not entries:
        return ""
    lines = [
        f"- {e['label']}: {e['simple_explanation']} Ejemplo: {e['example']}"
        for e in entries
    ]
    return "\n\nVocabulario aprobado (úsalo como referencia):\n" + "\n".join(lines)


def _split_reply(text: str) -> tuple[str, str]:
    """
    EN: Split the model output into reply and check_question using CHECK_MARKER.
    ES: Separa la salida del modelo en reply y check_question usando CHECK_MARKER.
    """
    before, marker, after = text.rpartition(CHECK_MARKER)
    if marker and after.strip():
        return before.strip(), after.strip()
    return text.strip(), DEFAULT_CHECK_QUESTION


def answer(request: ChatRequest) -> ChatResponse:
    """
    EN: Ask the LLM; on any failure return the labelled static fallback.
    ES: Pregunta al LLM; ante cualquier fallo devuelve el fallback estático etiquetado.
    """
    system = (
        f"{SYSTEM_PROMPT}\n\nDatos del usuario (ficticios y agregados):\n"
        f"{_context_block(request.context)}{_glossary_block(request.message)}"
    )
    messages = [{"role": "system", "content": system}]
    messages += [{"role": m.role, "content": m.content} for m in request.history]
    messages.append({"role": "user", "content": request.message})

    try:
        client = Groq(timeout=20)  # EN: reads GROQ_API_KEY / ES: lee GROQ_API_KEY
        completion = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", DEFAULT_MODEL),
            messages=messages,
            temperature=0.3,
        )
        text = completion.choices[0].message.content or ""
        reply, check_question = _split_reply(text)
        if not reply:
            raise ValueError("empty LLM reply")
        return ChatResponse(reply=reply, check_question=check_question)
    except Exception as err:
        # EN: Log only the error type, never the user's message or context (privacy).
        # ES: Solo se registra el tipo de error, nunca el mensaje ni el contexto (privacidad).
        logger.warning(
            "LLM unavailable (%s): using static fallback.", type(err).__name__
        )
        return build_fallback_response(request.message)
