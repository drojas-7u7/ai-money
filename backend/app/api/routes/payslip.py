import json
import logging
import os
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.core.store import store
from app.schemas.payslip import PayslipResponse
from app.services.payslip.extractor import PayslipExtractor

router = APIRouter(tags=["Payslip"])
extractor = PayslipExtractor()
logger = logging.getLogger(__name__)

# Directorio local de depuración (backend/uploads, ignorado por Git según .gitignore)
BASE_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
UPLOADS_DIR = os.path.join(BASE_BACKEND_DIR, "uploads")


def _save_debug_copy(payslip: PayslipResponse):
    """Guarda una copia en formato JSON en backend/uploads/latest_payslip.json para comprobaciones."""
    try:
        os.makedirs(UPLOADS_DIR, exist_ok=True)
        target_path = os.path.join(UPLOADS_DIR, "latest_payslip.json")
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(payslip.model_dump_json(indent=2))
    except Exception as e:
        logger.warning("No se pudo guardar latest_payslip.json para depuración: %s", e)


@router.post(
    "/payslip",
    response_model=PayslipResponse,
    status_code=status.HTTP_200_OK,
    summary="Analizar nómina sintética en PDF o imagen",
    description=(
        "Extrae importes brutos, netos y desglose de deducciones de una nómina sintética didáctica. "
        "Soporta PDF (extrayendo texto con pypdf y procesando con Groq IA o fallback regex) "
        "e imágenes (mediante Groq Vision). Guarda el resultado en memoria y una copia de comprobación en latest_payslip.json."
    ),
)
async def upload_payslip(file: UploadFile = File(...)):
    content = await file.read()
    result = extractor.extract(
        content=content,
        filename=file.filename or "",
        content_type=file.content_type or ""
    )

    # 1. Guardar en memoria compartida para el resto de la app (ej: Chat Dev 5)
    store.set_payslip(result)

    # 2. Guardar en disco local en backend/uploads/latest_payslip.json para inspección y pruebas
    _save_debug_copy(result)

    return result


@router.get(
    "/payslip/latest",
    response_model=PayslipResponse,
    status_code=status.HTTP_200_OK,
    summary="Consultar la última nómina procesada",
    description="Devuelve los datos de la última nómina procesada en la sesión actual de memoria.",
)
def get_latest_payslip():
    payslip = store.get_payslip()
    if not payslip:
        # Si aún no está en memoria, comprobar si existe la copia guardada en disco
        file_path = os.path.join(UPLOADS_DIR, "latest_payslip.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    payslip = PayslipResponse(**data)
                    store.set_payslip(payslip)
                    return payslip
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aún no se ha procesado ninguna nómina en la sesión actual."
        )
    return payslip
