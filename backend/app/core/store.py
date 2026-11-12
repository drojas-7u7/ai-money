from typing import Optional
from app.schemas.payslip import PayslipResponse


class AppStore:
    """
    Almacén en memoria para el estado de la sesión activa en el backend.
    Permite compartir el contexto (ej: última nómina procesada, perfil activo)
    entre los módulos de nóminas, finanzas y el chat con LLM.
    """

    def __init__(self):
        self.latest_payslip: Optional[PayslipResponse] = None

    def set_payslip(self, payslip: PayslipResponse):
        self.latest_payslip = payslip

    def get_payslip(self) -> Optional[PayslipResponse]:
        return self.latest_payslip


# Instancia singleton compartida en memoria
store = AppStore()
