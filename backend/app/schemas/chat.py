from pydantic import BaseModel, Field
from typing import Literal

class ChatMessage(BaseModel):
    role: Literal['user', 'assistant']
    content: str = Field(min_length=1, max_length=2000)

class ChatContext(BaseModel):
    monthly_income: float | None = None
    available: float | None = None
    payslip_gross: float | None = None
    payslip_net: float | None = None
    loan_monthly_payment: float | None = None
    savings_monthly_contribution: float | None = None

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=4)
    context: ChatContext = Field(default_factory=ChatContext)

class ChatResponse(BaseModel):
    reply: str
    check_question: str
