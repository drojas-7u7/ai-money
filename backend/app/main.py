from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.payslip import router as payslip_router
from app.api.routes.profile import router as profile_router
from app.api.routes.finance import router as finance_router

app = FastAPI(
    title="AI Money API - Reto Ebury",
    description="Backend educativo para finanzas personales y análisis de nóminas sintéticas.",
    version="1.0.0",
)

# Configuración de CORS según el contrato (Frontend React en http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint de comprobación de salud del servicio
@app.get("/health", tags=["General"])
def health_check():
    return {"status": "ok"}


# Registro de rutas del backend
app.include_router(profile_router)
app.include_router(finance_router)
app.include_router(payslip_router)
