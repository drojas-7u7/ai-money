from typing import Literal
from pydantic import BaseModel, Field

class FinanceSummary(BaseModel):
    income: float
    expenses: float
    available: float
    savings_rate: float
    goals: list[str] = Field(default_factory=list)

class SavingsRequest(BaseModel):
    goal: str = Field(min_length=1)
    target_amount: float = Field(gt=0)
    current_saved: float = Field(ge=0)
    months: int = Field(ge=1, le=600)

class SavingsPlanItem(BaseModel):
    month: int
    accumulated: float

class SavingsResponse(BaseModel):
    monthly_contribution: float
    plan: list[SavingsPlanItem]
    feasible: bool | None = None
    explanation: str

class LoanRequest(BaseModel):
    amount: float = Field(gt=0)
    months: int = Field(ge=1, le=600)
    annual_rate: float = Field(ge=0, le=100)
    monthly_income: float = Field(gt=0)
    monthly_expenses: float = Field(ge=0)

class LoanResponse(BaseModel):
    monthly_payment: float
    total_paid: float
    total_interest: float
    income_ratio: float
    risk_level: Literal['low', 'medium', 'high']
    explanation: str
