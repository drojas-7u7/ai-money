"""Cálculos educativos: no modificar datos del perfil original."""
from app.schemas.profile import FinancialProfile
from app.schemas.finance import FinanceSummary


def summarize(profile: FinancialProfile) -> FinanceSummary:
    income = profile.monthly_income
    expenses = profile.fixed_expenses + profile.variable_expenses
    available = income - expenses
    rate = 100 * max(available, 0) / income if income else 0
    return FinanceSummary(
        income=round(income, 2), expenses=round(expenses, 2),
        available=round(available, 2), savings_rate=round(rate, 2),
        goals=[profile.goal] if profile.goal.strip() else [],
    )
