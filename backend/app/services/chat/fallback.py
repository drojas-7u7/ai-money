"""
Fallback estático del chat educativo (Dev 5).

 Se usa cuando el LLM no está disponible. Responde solo con el glosario
    aprobado (app/content/payslip_glossary.json) y etiqueta la respuesta como modo demo.
"""

import json
import unicodedata
from functools import lru_cache
from pathlib import Path

from app.schemas.chat import ChatResponse

# EN: Path to the glossary owned by Dev 3 (read-only for this module).
# ES: Ruta al glosario de Dev 3 (este módulo solo lo lee).
GLOSSARY_PATH = (
    Path(__file__).resolve().parents[2] / "content" / "payslip_glossary.json"
)

# EN: Max glossary entries per answer (GUIA_CHAT: inject only 2–4 relevant entries).
# ES: Máximo de entradas por respuesta (GUIA_CHAT: solo 2–4 entradas relevantes).
MAX_ENTRIES = 3

# EN: Keywords (without accents, lowercase) -> glossary codes.
# ES: Palabras clave (sin tildes, minúsculas) -> códigos del glosario.
KEYWORDS = {
    "brut": "gross",
    "neto": "net",
    "salario base": "base_salary",
    "complemento": "supplements",
    "irpf": "irpf",
    "retencion": "irpf",
    "seguridad social": "social_security",
    "cotizacion": "social_security",
    "contingencias": "cc",
    "desempleo": "unemployment",
    "formacion": "training",
    "mei": "mei",
    "base de cotizacion": "contribution_base",
    "paga extra": "extra_pay",
    "deduccion": "deductions",
    "tin": "tin",
    "tae": "tae",
}

FALLBACK_LABEL = (
    "[Modo demo: el asistente de IA no está disponible. "
    "Respuesta estática del glosario educativo.]"
)


def _normalize(text: str) -> str:
    """EN: Lowercase and strip accents. / ES: Minúsculas y sin tildes."""
    text = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in text if unicodedata.category(c) != "Mn")


@lru_cache(maxsize=1)
def load_glossary() -> dict[str, dict]:
    """EN: Load glossary once, indexed by code. / ES: Carga el glosario una vez, indexado por código."""
    with GLOSSARY_PATH.open(encoding="utf-8") as f:
        return {entry["code"]: entry for entry in json.load(f)}


def select_entries(message: str, limit: int = MAX_ENTRIES) -> list[dict]:
    """
    EN: Return glossary entries whose keywords appear in the message, in order of appearance.
    ES: Devuelve las entradas cuyas palabras clave aparecen en el mensaje, por orden de aparición.
    """
    text = _normalize(message)
    glossary = load_glossary()
    found: list[tuple[int, str]] = []
    for keyword, code in KEYWORDS.items():
        # EN: Whole-word start match avoids "tin" matching inside other words.
        # ES: Coincidencia al inicio de palabra para que "tin" no salte dentro de otras palabras.
        pos = f" {text}".find(f" {keyword}")
        if pos != -1 and code in glossary and code not in [c for _, c in found]:
            found.append((pos, code))
    found.sort()
    return [glossary[code] for _, code in found[:limit]]


def build_fallback_response(message: str) -> ChatResponse:
    """
    EN: Build a ChatResponse from the glossary only. Never invents figures.
    ES: Construye un ChatResponse solo con el glosario. Nunca inventa cifras.
    """
    entries = select_entries(message)
    if not entries:
        return ChatResponse(
            reply=(
                f"{FALLBACK_LABEL}\n\nAhora mismo solo puedo explicar conceptos del glosario: "
                "salario bruto y neto, deducciones, IRPF, cotizaciones, TIN y TAE."
            ),
            check_question="¿Sobre cuál de estos conceptos quieres que te explique algo?",
        )

    parts = [FALLBACK_LABEL]
    for entry in entries:
        parts.append(
            f"**{entry['label']}**: {entry['simple_explanation']}\n"
            f"Ejemplo: {entry['example']}"
        )
    return ChatResponse(
        reply="\n\n".join(parts),
        check_question=f"¿Podrías explicar con tus palabras qué es «{entries[0]['label']}»?",
    )
