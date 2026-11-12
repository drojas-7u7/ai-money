"""Endpoint de chat educativo financiero."""
from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat import ask

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def post_chat(request: ChatRequest) -> ChatResponse:
    return ask(request)
