"""
Chat endpoint (Dev 5). Registered automatically by app/main.py.
Endpoint del chat (Dev 5). Lo registra automáticamente app/main.py.
"""

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat.llm import answer
from fastapi import APIRouter

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    # EN: Temporary: always uses the static fallback until the LLM call (T04) is added.
    # ES: Temporal: usa siempre el fallback estático hasta añadir la llamada al LLM (T04).
    # EN: LLM answer, or labelled static fallback if the LLM fails.
    # ES: Respuesta del LLM, o fallback estático etiquetado si el LLM falla.
    return answer(request)
