from typing import List, Optional
from pydantic import BaseModel, Field


class DeductionItem(BaseModel):
    code: str = Field(..., description="Código identificador de la deducción (ej: cc, unemployment, irpf)")
    label: str = Field(..., description="Etiqueta descriptiva en lenguaje claro")
    amount: float = Field(..., description="Importe deducido en euros")


class ConceptItem(BaseModel):
    code: str = Field(..., description="Código del concepto explicado (ej: gross, net, cc)")
    label: str = Field(..., description="Nombre del concepto")
    explanation: str = Field(..., description="Explicación pedagógica simplificada")


class PayslipResponse(BaseModel):
    gross: float = Field(..., description="Salario bruto mensual en euros")
    net: float = Field(..., description="Salario neto mensual en euros")
    deductions: List[DeductionItem] = Field(default_factory=list, description="Desglose de deducciones aplicadas")
    concepts: List[ConceptItem] = Field(default_factory=list, description="Glosario didáctico de conceptos relevantes")
    source: str = Field(default="synthetic_pdf", description="Origen de los datos procesados")
    warning: Optional[str] = Field(
        default="Ejemplo ficticio para aprendizaje.",
        description="Aviso didáctico de seguridad y simulación"
    )
