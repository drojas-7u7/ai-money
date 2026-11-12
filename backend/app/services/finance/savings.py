"""Plan de ahorro sin intereses ni rentabilidad prometida."""
from decimal import Decimal, ROUND_HALF_UP
from app.schemas.finance import SavingsRequest, SavingsResponse, SavingsPlanItem


def _money(value: Decimal) -> float:
    return float(value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))


def simulate_savings(request: SavingsRequest, available: float | None = None) -> SavingsResponse:
    target = Decimal(str(request.target_amount))
    saved = Decimal(str(request.current_saved))
    missing = max(target - saved, Decimal('0'))
    contribution = missing / request.months
    monthly = _money(contribution)
    # El último mes se ajusta al objetivo y se presentan todos los meses.
    plan = [SavingsPlanItem(month=k, accumulated=_money(min(target, saved + missing*k/request.months)))
            for k in range(1, request.months + 1)]
    feasible = None if available is None else (contribution <= Decimal(str(max(available,0))))
    message = f'Para {request.goal}, reserva aproximadamente {monthly:.2f} € al mes (sin intereses).'
    if feasible is False:
        message += ' Supera tu disponible estimado: revisa objetivo, plazo o gastos.'
    if feasible is None:
        message += ' No se ha evaluado la viabilidad respecto a tu presupuesto.'
    return SavingsResponse(monthly_contribution=monthly, plan=plan, feasible=feasible, explanation=message)
