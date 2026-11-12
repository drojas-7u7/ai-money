"""
Privacy filter for the educational chat (Dev 5). Requested by Vittorio (review T10).
Filtro de privacidad del chat educativo (Dev 5). Pedido por Vittorio (revisión T10).

EN: Detects DNI/NIE, IBAN, card numbers, phone numbers and emails before anything
    is sent to the LLM. Real names cannot be detected reliably with regexes.
ES: Detecta DNI/NIE, IBAN, tarjetas, teléfonos y emails antes de enviar nada al LLM.
    Los nombres reales no se pueden detectar de forma fiable con expresiones regulares.
"""

import re

from app.schemas.chat import ChatMessage, ChatResponse

MASK = "[dato oculto]"

# EN: Order matters for masking: longer patterns (IBAN, card) go first.
# ES: El orden importa al enmascarar: primero los patrones largos (IBAN, tarjeta).
SENSITIVE_PATTERNS = [
    # IBAN: 2 letters + 2 digits + 11–30 alphanumerics, optional spaces / IBAN: 2 letras + 2 dígitos + 11–30 alfanuméricos
    re.compile(r"\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){11,30}\b", re.IGNORECASE),
    # Card: 13–19 digits with optional spaces or dashes / Tarjeta: 13–19 dígitos con espacios o guiones opcionales
    re.compile(r"\b(?:\d[ -]?){12,18}\d\b"),
    # DNI: 8 digits + letter / DNI: 8 dígitos + letra
    re.compile(r"\b\d{8}[ -]?[A-Z]\b", re.IGNORECASE),
    # NIE: X/Y/Z + 7 digits + letter / NIE: X/Y/Z + 7 dígitos + letra
    re.compile(r"\b[XYZ][ -]?\d{7}[ -]?[A-Z]\b", re.IGNORECASE),
    # Email
    re.compile(r"\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b"),
    # Spanish phone: optional +34, 9 digits starting 6–9 / Teléfono español: +34 opcional, 9 dígitos que empiezan por 6–9
    re.compile(r"(?:\+34[ ]?)?\b[6-9]\d{2}[ ]?\d{3}[ ]?\d{3}\b"),
]


def contains_sensitive_data(text: str) -> bool:
    """EN: True if any pattern matches. / ES: True si algún patrón coincide."""
    return any(p.search(text) for p in SENSITIVE_PATTERNS)


def mask_sensitive_data(text: str) -> str:
    """EN: Replace every match with MASK. / ES: Sustituye cada coincidencia por MASK."""
    for pattern in SENSITIVE_PATTERNS:
        text = pattern.sub(MASK, text)
    return text


def mask_history(history: list[ChatMessage]) -> list[ChatMessage]:
    """
    EN: Mask history instead of rejecting it, so one rejected message does not block the chat.
    ES: Se enmascara el historial en vez de rechazarlo, para que un mensaje rechazado no bloquee el chat.
    """
    return [
        ChatMessage(role=m.role, content=mask_sensitive_data(m.content))
        for m in history
    ]


def rejection_response() -> ChatResponse:
    """EN: Reply when the current message has personal data. / ES: Respuesta si el mensaje actual tiene datos personales."""
    return ChatResponse(
        reply=(
            "Tu mensaje parece contener datos personales (DNI/NIE, IBAN, tarjeta, teléfono o email). "
            "Por privacidad no lo he enviado al asistente. Esta es una demo educativa: "
            "no compartas datos reales y vuelve a escribir tu pregunta sin ellos."
        ),
        check_question="¿Puedes reformular tu pregunta sin incluir datos personales?",
    )
