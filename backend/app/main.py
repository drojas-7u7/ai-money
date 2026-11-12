"""Punto de entrada del backend de AI Money (dueño: integrador).

Arranque en local, desde la carpeta backend/:
    uvicorn app.main:app --reload
Documentación interactiva: http://localhost:8000/docs
"""
import importlib
import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import finance, profile

load_dotenv()  # lee el .env si existe (claves del LLM, orígenes permitidos)

logger = logging.getLogger("ai_money")

app = FastAPI(
    title="AI Money API",
    description="Asistente de educación financiera · Reto Ebury × Somos F5. Datos siempre ficticios.",
    version="0.1.0",
)

# Orígenes que pueden llamar a la API. En local, el frontend de Vite;
# en el despliegue se añade la URL del frontend con la variable ALLOWED_ORIGINS
# (varias separadas por comas).
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}


# Rutas ya disponibles en main.
app.include_router(profile.router)
app.include_router(finance.router)

# Rutas que se irán añadiendo (nómina, chat y cuestionario). Si el archivo todavía
# no existe, el backend arranca igualmente y avisa; si existe pero tiene un error,
# el error se muestra para poder corregirlo.
for name in ("payslip", "chat", "quiz"):
    module_path = f"app.api.routes.{name}"
    try:
        module = importlib.import_module(module_path)
    except ModuleNotFoundError as err:
        if err.name == module_path:
            logger.warning("Ruta '%s' todavía no disponible: se omite.", name)
            continue
        raise
    app.include_router(module.router)
