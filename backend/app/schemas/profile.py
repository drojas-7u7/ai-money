from pydantic import BaseModel, Field

class FinancialProfile(BaseModel):
    profile_id: str = Field(min_length=1)
    alias: str = Field(min_length=1)
    monthly_income: float = Field(ge=0)
    fixed_expenses: float = Field(ge=0)
    variable_expenses: float = Field(ge=0)
    current_savings: float = Field(default=0, ge=0)
    goal: str = ""
