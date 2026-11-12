"""
Chat endpoint (Dev 5). Registered automatically by app/main.py.
Endpoint del chat (Dev 5). Lo registra automáticamente app/main.py.
"""

from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat.llm import answer
from app.services.chat.privacy import (
    contains_sensitive_data,
    mask_history,
    rejection_response,
)

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    # EN: Privacy first: reject personal data in the message, mask it in the history.
    # ES: Primero la privacidad: se rechazan datos personales en el mensaje y se enmascaran en el historial.
    if contains_sensitive_data(request.message):
        return rejection_response()
    safe_request = request.model_copy(update={"history": mask_history(request.history)})

    # EN: LLM answer, or labelled static fallback if the LLM fails.
    # ES: Respuesta del LLM, o fallback estático etiquetado si el LLM falla.
    return answer(safe_request)
