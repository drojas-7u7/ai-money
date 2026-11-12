from app.schemas.finance import SavingsRequest, LoanRequest
from app.schemas.profile import FinancialProfile
from pydantic import ValidationError
import pytest

def test_profile_accepts_demo():
    p=FinancialProfile(profile_id='demo',alias='Demo',monthly_income=1200,fixed_expenses=500,variable_expenses=300)
    assert p.current_savings==0

def test_months_must_be_positive():
    with pytest.raises(ValidationError):
        SavingsRequest(goal='Viaje',target_amount=300,current_saved=0,months=0)

def test_negative_loan_rejected():
    with pytest.raises(ValidationError):
        LoanRequest(amount=-1,months=12,annual_rate=6,monthly_income=2000,monthly_expenses=1000)
