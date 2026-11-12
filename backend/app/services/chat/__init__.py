import os
import logging

from groq import Groq
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat.fallback import build_fallback_response

logger = logging.getLogger("ai_money")

MODEL = "llama-3.1-70b-versatile"

SYSTEM_PROMPT = """Eres un asistente educativo de finanzas personales para la plataforma AI Money.
Tu objetivo es explicar conceptos financieros de forma clara y sencilla, ayudando al usuario a entender su situación económica.

Reglas:
- Responde siempre en español.
- Sé breve y directo (máximo 3 párrafos).
- No inventes cifras ni datos que no estén en el contexto.
- Si el usuario pregunta algo fuera del ámbito financiero, redirige amablemente.
- Termina cada respuesta con una pregunta de comprobación corta para verificar la comprensión.
- Nunca menciones nombres reales, DNI, IBAN ni datos personales.
"""


def _build_system_message(context) -> str:
    parts = [SYSTEM_PROMPT]
    if any(v is not None for v in context.model_dump().values()):
        parts.append("\nContexto financiero del usuario (datos ficticios de demo):")
        if context.monthly_income is not None:
            parts.append(f"- Ingresos mensuales: {context.monthly_income} €")
        if context.available is not None:
            parts.append(f"- Disponible mensual: {context.available} €")
        if context.payslip_gross is not None:
            parts.append(f"- Salario bruto (nómina): {context.payslip_gross} €")
        if context.payslip_net is not None:
            parts.append(f"- Salario neto (nómina): {context.payslip_net} €")
        if context.loan_monthly_payment is not None:
            parts.append(f"- Cuota de préstamo: {context.loan_monthly_payment} €")
        if context.savings_monthly_contribution is not None:
            parts.append(f"- Aportación mensual de ahorro: {context.savings_monthly_contribution} €")
    return "\n".join(parts)


def ask(request: ChatRequest) -> ChatResponse:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.warning("GROQ_API_KEY no configurada, usando fallback.")
        return build_fallback_response(request.message)

    try:
        client = Groq(api_key=api_key)
        messages = [{"role": "system", "content": _build_system_message(request.context)}]
        for msg in request.history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": request.message})

        completion = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=512,
            temperature=0.5,
        )
        reply = completion.choices[0].message.content.strip()

        # Separar la pregunta de comprobación si el modelo la incluye con un separador
        check_question = "¿Podrías explicar con tus palabras lo que acabas de aprender?"
        if "\n\n**Pregunta" in reply or "\n\nPregunta:" in reply:
            parts = reply.rsplit("\n\n", 1)
            if len(parts) == 2:
                reply, check_question = parts[0].strip(), parts[1].strip()

        return ChatResponse(reply=reply, check_question=check_question)

    except Exception as exc:
        logger.error("Error llamando a Groq: %s — usando fallback.", exc)
        return build_fallback_response(request.message)
