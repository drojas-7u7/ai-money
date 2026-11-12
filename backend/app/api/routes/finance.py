"""Endpoints de finanzas; añadir este router a main.py (dueño: integrador)."""
from fastapi import APIRouter
from app.schemas.finance import FinanceSummary, SavingsRequest, SavingsResponse, LoanRequest, LoanResponse
from app.services.finance.budget import summarize
from app.services.finance.savings import simulate_savings
from app.services.finance.loans import simulate_loan
from app.api.routes.profile import get_active_profile

router = APIRouter(prefix='/finance', tags=['finance'])


@router.get('/summary', response_model=FinanceSummary)
def get_summary() -> FinanceSummary:
    return summarize(get_active_profile())


@router.post('/savings', response_model=SavingsResponse)
def get_savings(request: SavingsRequest) -> SavingsResponse:
    return simulate_savings(request, summarize(get_active_profile()).available)


@router.post('/loan', response_model=LoanResponse)
def get_loan(request: LoanRequest) -> LoanResponse:
    return simulate_loan(request)
