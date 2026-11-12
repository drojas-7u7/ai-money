"""
Chat endpoint (Dev 5). Registered automatically by app/main.py.
Endpoint del chat (Dev 5). Lo registra automáticamente app/main.py.
"""

from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat.fallback import build_fallback_response

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    # EN: Temporary: always uses the static fallback until the LLM call (T04) is added.
    # ES: Temporal: usa siempre el fallback estático hasta añadir la llamada al LLM (T04).
    return build_fallback_response(request.message)
