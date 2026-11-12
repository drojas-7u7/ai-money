import pytest
from app.schemas.profile import FinancialProfile
from app.schemas.finance import SavingsRequest, LoanRequest
from app.services.finance.budget import summarize
from app.services.finance.savings import simulate_savings
from app.services.finance.loans import simulate_loan


def test_budget():
    profile = FinancialProfile(profile_id='p1', alias='Demo', monthly_income=1800,
                               fixed_expenses=900, variable_expenses=500)
    assert summarize(profile).available == 400
    assert summarize(profile).savings_rate == 22.22


def test_budget_deficit():
    profile = FinancialProfile(profile_id='p2', alias='Demo', monthly_income=500,
                               fixed_expenses=600, variable_expenses=50)
    assert summarize(profile).available == -150
    assert summarize(profile).savings_rate == 0


def test_savings():
    plan = simulate_savings(SavingsRequest(goal='Viaje', target_amount=1200,
                                           current_saved=0, months=12), available=400)
    assert plan.monthly_contribution == 100
    assert len(plan.plan) == 12
    assert plan.plan[-1].accumulated == 1200
    assert plan.feasible is True


def test_savings_infeasible():
    plan = simulate_savings(SavingsRequest(goal='Viaje', target_amount=1200,
                                           current_saved=0, months=12), available=50)
    assert plan.feasible is False


def test_zero_interest_loan():
    loan = simulate_loan(LoanRequest(amount=1200, months=12, annual_rate=0,
                                     monthly_income=1800, monthly_expenses=1400))
    assert loan.monthly_payment == 100
    assert loan.total_interest == 0
    assert loan.income_ratio == 5.56
    assert loan.risk_level == 'low'


def test_high_risk_loan():
    loan = simulate_loan(LoanRequest(amount=12000, months=12, annual_rate=6,
                                     monthly_income=1200, monthly_expenses=900))
    assert loan.total_interest > 0
    assert loan.risk_level == 'high'


def test_routes():
    from fastapi import FastAPI
    from fastapi.testclient import TestClient
    from app.api.routes.profile import router as profile_router
    from app.api.routes.finance import router as finance_router
    app = FastAPI()
    app.include_router(profile_router)
    app.include_router(finance_router)
    client = TestClient(app)
    assert client.get('/finance/summary').status_code == 200
    assert client.post('/finance/loan', json={
        'amount':1200,'months':12,'annual_rate':0,'monthly_income':1800,
        'monthly_expenses':1400}).json()['monthly_payment'] == 100
    assert client.post('/finance/savings', json={
        'goal':'Viaje','target_amount':1200,'current_saved':0,'months':12}).status_code == 200
