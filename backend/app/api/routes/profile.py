"""Perfil de demostración, único y en memoria; no hay autenticación."""
from fastapi import APIRouter
from app.schemas.profile import FinancialProfile

router = APIRouter(tags=['profile'])
_active_profile = FinancialProfile(
    profile_id='demo_01', alias='Alex (ficticio)', monthly_income=1800,
    fixed_expenses=900, variable_expenses=500,
    current_savings=200, goal='Fondo de emergencia',
)


def get_active_profile() -> FinancialProfile:
    return _active_profile


@router.get('/profile', response_model=FinancialProfile)
def read_profile() -> FinancialProfile:
    return get_active_profile()


@router.put('/profile', response_model=FinancialProfile)
def update_profile(profile: FinancialProfile) -> FinancialProfile:
    global _active_profile
    _active_profile = profile
    return _active_profile
