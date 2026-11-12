from typing import Literal
from pydantic import BaseModel, Field

class PayslipDeduction(BaseModel):
    code: str
    label: str
    amount: float = Field(ge=0)

class PayslipConcept(BaseModel):
    code: str
    label: str
    explanation: str

class PayslipResponse(BaseModel):
    gross: float = Field(ge=0)
    net: float = Field(ge=0)
    deductions: list[PayslipDeduction] = Field(default_factory=list)
    concepts: list[PayslipConcept] = Field(default_factory=list)
    source: Literal['synthetic_pdf', 'demo_fixture'] = 'synthetic_pdf'
    warning: str = 'Ejemplo ficticio para aprendizaje.'
