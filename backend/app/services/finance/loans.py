"""Préstamo francés simplificado: TIN anual; sin gastos ni seguros."""
from app.schemas.finance import LoanRequest, LoanResponse


def simulate_loan(request: LoanRequest) -> LoanResponse:
    principal = request.amount
    n = request.months
    monthly_rate = request.annual_rate / 1200
    if monthly_rate == 0:
        payment = principal / n
    else:
        payment = principal * monthly_rate / (1 - (1 + monthly_rate) ** (-n))
    total = payment * n
    available = request.monthly_income - request.monthly_expenses
    margin = available - payment
    if margin < 0:
        risk = 'high'
    elif payment > available * 0.5:
        risk = 'medium'
    else:
        risk = 'low'
    result_payment = round(payment, 2)
    return LoanResponse(
        monthly_payment=result_payment,
        total_paid=round(total, 2),
        total_interest=round(max(total - principal, 0), 2),
        income_ratio=round(100 * payment / request.monthly_income, 2),
        risk_level=risk,
        explanation=(f'Cuota estimada de {result_payment:.2f} €/mes. '
                     f'Riesgo didáctico: {risk}. No es una aprobación bancaria. '
                     'No se incluyen comisiones, seguros ni otros gastos.'),
    )
