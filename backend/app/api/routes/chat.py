"""Endpoint de chat educativo financiero."""
from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat.llm import answer
from app.services.chat.privacy import (
    contains_sensitive_data,
    mask_history,
    rejection_response,
)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def post_chat(request: ChatRequest) -> ChatResponse:
    if contains_sensitive_data(request.message):
        return rejection_response()
    safe_request = request.model_copy(update={"history": mask_history(request.history)})
    return answer(safe_request)
