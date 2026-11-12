import base64
import io
import json
import logging
import os
import re
from typing import Dict, List, Optional, Tuple

from dotenv import load_dotenv
from fastapi import HTTPException, status
from groq import Groq
import pypdf

from app.schemas.payslip import PayslipConcept, PayslipDeduction, PayslipResponse

# Cargar variables de entorno desde .env
load_dotenv()

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB límite según el contrato


def parse_spanish_number(val_str: str) -> Optional[float]:
    """
    Convierte cadenas numéricas en formato español o estándar a float.
    Ejemplos: '2.000,00', '1592,00', '2000.50', '2000', '94.00 EUR' -> 2000.0, 1592.0, etc.
    """
    cleaned = re.sub(r"[^\d.,-]", "", val_str).strip()
    if not cleaned:
        return None
    try:
        if "." in cleaned and "," in cleaned:
            # Formato tipo 2.000,50 -> quitar punto de miles y cambiar coma por punto
            cleaned = cleaned.replace(".", "").replace(",", ".")
        elif "," in cleaned:
            # Formato tipo 1592,50 -> cambiar coma por punto
            cleaned = cleaned.replace(",", ".")
        elif "." in cleaned:
            # Comprobar si son miles (ej: 2.000) o decimales estándar (ej: 2000.00)
            parts = cleaned.split(".")
            if len(parts) == 2 and len(parts[1]) == 3 and int(parts[0]) > 0:
                cleaned = parts[0] + parts[1]
        return round(float(cleaned), 2)
    except (ValueError, IndexError):
        return None


class PayslipExtractor:
    """
    Extractor inteligente de nóminas con soporte dual:
    1. Si es PDF: extrae texto con pypdf y lo envía a Groq IA.
    2. Si es Imagen (PNG/JPG/WEBP): lo envía directamente a Groq Vision.
    3. Fallback determinista: si la API de Groq no está configurada o falla,
       utiliza el análisis semántico de expresiones regulares para PDFs.
    """

    def __init__(self, glossary_path: Optional[str] = None):
        if glossary_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            glossary_path = os.path.join(base_dir, "content", "payslip_glossary.json")
        self.glossary = self._load_glossary(glossary_path)
        self.api_key = os.getenv("GROQ_API_KEY")
        self.text_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        self.vision_model = os.getenv("GROQ_VISION_MODEL", "llama-3.2-11b-vision-preview")

    def _get_groq_client(self) -> Optional[Groq]:
        """Inicializa el cliente de Groq si la clave de API está presente."""
        api_key = os.getenv("GROQ_API_KEY") or self.api_key
        if api_key and not api_key.startswith("gsk_tu_clave"):
            return Groq(api_key=api_key)
        return None

    def _load_glossary(self, path: str) -> Dict[str, dict]:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        return {
                            item["code"]: {
                                "code": item["code"],
                                "label": item.get("label", ""),
                                "explanation": item.get("simple_explanation") or item.get("explanation", "")
                            }
                            for item in data
                            if isinstance(item, dict) and "code" in item
                        }
                    elif isinstance(data, dict):
                        return data
            except Exception:
                pass
        return {
            "gross": {
                "code": "gross",
                "label": "Salario bruto",
                "explanation": "Cantidad total que figura como devengada antes de restar deducciones."
            },
            "net": {
                "code": "net",
                "label": "Salario neto",
                "explanation": "Cantidad que queda tras aplicar las deducciones al total devengado en la nómina simplificada."
            },
            "cc": {
                "code": "cc",
                "label": "Contingencias comunes",
                "explanation": "Aportación a la Seguridad Social (4,70%) para cubrir jubilación y bajas médicas."
            },
            "unemployment": {
                "code": "unemployment",
                "label": "Desempleo",
                "explanation": "Aportación (1,55%) destinada a la prestación por desempleo."
            },
            "training": {
                "code": "training",
                "label": "Formacion profesional",
                "explanation": "Cuota (0,10%) para formación continua y reciclaje profesional."
            },
            "mei": {
                "code": "mei",
                "label": "MEI",
                "explanation": "Mecanismo de Equidad Intergeneracional (0,15%) para el fondo de pensiones."
            },
            "irpf": {
                "code": "irpf",
                "label": "IRPF",
                "explanation": "Retención a cuenta del Impuesto sobre la Renta de las Personas Físicas."
            }
        }

    def detect_file_type(self, content: bytes, filename: str = "", content_type: str = "") -> str:
        """Determina si el archivo es un PDF o una imagen admitida."""
        if content.startswith(b"%PDF-") or filename.lower().endswith(".pdf"):
            return "pdf"
        if content.startswith(b"\x89PNG\r\n\x1a\n") or filename.lower().endswith(".png") or "png" in content_type:
            return "image/png"
        if content.startswith(b"\xff\xd8\xff") or filename.lower().endswith((".jpg", ".jpeg")) or "jpeg" in content_type or "jpg" in content_type:
            return "image/jpeg"
        if (content.startswith(b"RIFF") and b"WEBP" in content[:12]) or filename.lower().endswith(".webp") or "webp" in content_type:
            return "image/webp"
        return "unknown"

    def validate_file(self, content: bytes, filename: str = "", content_type: str = "") -> str:
        """Valida tamaño y formato del fichero en memoria."""
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail="El archivo excede el tamaño máximo permitido de 2 MB."
            )

        file_type = self.detect_file_type(content, filename, content_type)
        if file_type == "unknown":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo proporcionado no es un documento PDF válido ni una imagen soportada (PNG, JPG, WEBP)."
            )
        return file_type

    def extract_text_from_pdf(self, content: bytes) -> str:
        """Extrae el texto de las páginas del PDF usando pypdf."""
        try:
            reader = pypdf.PdfReader(io.BytesIO(content))
            extracted_text = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    extracted_text.append(t)
            full_text = "\n".join(extracted_text).strip()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error al procesar el archivo PDF: {str(e)}"
            )

        if not full_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se ha detectado texto digital en el PDF. Solo se admiten nóminas sintéticas con texto seleccionable o imágenes directas."
            )

        return full_text

    def _find_field_value(self, pattern: str, text: str) -> Optional[float]:
        """Busca un patrón y extrae el valor numérico decimal asociado."""
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            return parse_spanish_number(match.group(1))
        return None

    def parse_payroll_data_fallback(self, text: str) -> Tuple[float, float, List[PayslipDeduction]]:
        """
        Método de fallback determinista (expresiones regulares).
        Se ejecuta cuando Groq no está disponible o falla su respuesta.
        """
        gross = self._find_field_value(r"(?:total\s+devengad[oa]s?|salario\s+bruto|bruto\s+mensual|bruto)\s*[\:\=]?\s*([\d.,]+)", text)
        net = self._find_field_value(r"(?:l[íi]quido\s+a\s+percibir|total\s+a\s+percibir|salario\s+neto|neto)\s*[\:\=]?\s*([\d.,]+)", text)

        cc = self._find_field_value(r"(?:contingencias\s+comunes|c\.?\s*comunes|c\.c\.)\s*[\:\=]?\s*([\d.,]+)", text)
        unemployment = self._find_field_value(r"desempleo\s*[\:\=]?\s*([\d.,]+)", text)
        training = self._find_field_value(r"(?:formaci[oó]n\s+profesional|formaci[oó]n|f\.p\.)\s*[\:\=]?\s*([\d.,]+)", text)
        mei = self._find_field_value(r"(?:mecanismo\s+de\s+equidad\s+intergeneracional|m\.e\.i|mei)\s*[\:\=]?\s*([\d.,]+)", text)
        irpf = self._find_field_value(r"(?:retenci[oó]n\s+irpf|retenci[oó]n|i\.r\.p\.f|irpf)\s*[\:\=]?\s*([\d.,]+)", text)

        if gross is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se ha podido localizar el Salario Bruto en el documento PDF suministrado."
            )

        if cc is None:
            cc = round(gross * 0.047, 2)
        if unemployment is None:
            unemployment = round(gross * 0.0155, 2)
        if training is None:
            training = round(gross * 0.0010, 2)
        if mei is None:
            mei = round(gross * 0.0015, 2)

        if irpf is None:
            if net is not None and net < gross:
                ss_total = cc + unemployment + training + mei
                irpf = round(gross - net - ss_total, 2)
            else:
                irpf = round(gross * 0.139, 2)

        total_deductions = round(cc + unemployment + training + mei + irpf, 2)

        if net is None:
            net = round(gross - total_deductions, 2)

        deductions_list = [
            PayslipDeduction(code="cc", label=self.glossary.get("cc", {}).get("label", "Contingencias comunes"), amount=cc),
            PayslipDeduction(code="unemployment", label=self.glossary.get("unemployment", {}).get("label", "Desempleo"), amount=unemployment),
            PayslipDeduction(code="training", label=self.glossary.get("training", {}).get("label", "Formacion profesional"), amount=training),
            PayslipDeduction(code="mei", label=self.glossary.get("mei", {}).get("label", "MEI"), amount=mei),
            PayslipDeduction(code="irpf", label=self.glossary.get("irpf", {}).get("label", "IRPF"), amount=irpf),
        ]

        return gross, net, deductions_list

    def _extract_with_groq_text(self, text: str, client: Groq) -> Tuple[float, float, List[PayslipDeduction]]:
        """Envía el texto extraído del PDF a Groq para estructurar la nómina."""
        prompt = (
            "Eres un asistente analizador de nóminas didácticas. "
            "Extrae del siguiente texto los conceptos económicos y devuelve ÚNICAMENTE un objeto JSON estricto con esta estructura:\n"
            "{\n"
            '  "gross": <float con el salario bruto>,\n'
            '  "net": <float con el salario neto>,\n'
            '  "deductions": [\n'
            '    {"code": "cc", "label": "Contingencias comunes", "amount": <float>},\n'
            '    {"code": "unemployment", "label": "Desempleo", "amount": <float>},\n'
            '    {"code": "training", "label": "Formacion profesional", "amount": <float>},\n'
            '    {"code": "mei", "label": "MEI", "amount": <float>},\n'
            '    {"code": "irpf", "label": "IRPF", "amount": <float>}\n'
            "  ]\n"
            "}\n"
            "Reglas de privacidad y precisión:\n"
            "- NO incluyas nombres personales, DNI, NSS, IBAN ni texto del PDF.\n"
            "- Solo devuelve el JSON válido sin comentarios.\n"
            f"\nTexto de la nómina:\n{text}"
        )

        chat_completion = client.chat.completions.create(
            model=self.text_model,
            messages=[
                {"role": "system", "content": "Eres un extractor de datos financieros. Responde únicamente en formato JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.0,
            timeout=5.0
        )

        content = chat_completion.choices[0].message.content
        data = json.loads(content)

        gross = float(data["gross"])
        net = float(data["net"])
        deductions = [
            PayslipDeduction(
                code=d["code"],
                label=d.get("label", self.glossary.get(d["code"], {}).get("label", d["code"])),
                amount=float(d["amount"])
            )
            for d in data.get("deductions", [])
        ]
        return gross, net, deductions

    def _extract_with_groq_vision(self, image_bytes: bytes, mime_type: str, client: Groq) -> Tuple[float, float, List[PayslipDeduction]]:
        """Envía una imagen de nómina directamente a Groq Vision."""
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        prompt = (
            "Analiza esta imagen de una nómina sintética. "
            "Extrae los conceptos económicos y devuelve ÚNICAMENTE un objeto JSON estricto con esta estructura:\n"
            "{\n"
            '  "gross": <float con el salario bruto>,\n'
            '  "net": <float con el salario neto>,\n'
            '  "deductions": [\n'
            '    {"code": "cc", "label": "Contingencias comunes", "amount": <float>},\n'
            '    {"code": "unemployment", "label": "Desempleo", "amount": <float>},\n'
            '    {"code": "training", "label": "Formacion profesional", "amount": <float>},\n'
            '    {"code": "mei", "label": "MEI", "amount": <float>},\n'
            '    {"code": "irpf", "label": "IRPF", "amount": <float>}\n'
            "  ]\n"
            "}\n"
            "Reglas de privacidad:\n"
            "- NUNCA incluyas nombres personales, DNI, IBAN ni texto identificativo.\n"
            "- Solo devuelve el JSON válido."
        )

        chat_completion = client.chat.completions.create(
            model=self.vision_model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.0,
            timeout=8.0
        )

        content = chat_completion.choices[0].message.content
        data = json.loads(content)

        gross = float(data["gross"])
        net = float(data["net"])
        deductions = [
            PayslipDeduction(
                code=d["code"],
                label=d.get("label", self.glossary.get(d["code"], {}).get("label", d["code"])),
                amount=float(d["amount"])
            )
            for d in data.get("deductions", [])
        ]
        return gross, net, deductions

    def _build_concepts(self) -> List[PayslipConcept]:
        """Crea la lista de conceptos explicativos pedagógicos."""
        return [
            PayslipConcept(
                code="gross",
                label=self.glossary.get("gross", {}).get("label", "Salario bruto"),
                explanation=self.glossary.get("gross", {}).get("explanation", "Cantidad total que figura como devengada antes de restar deducciones.")
            ),
            PayslipConcept(
                code="net",
                label=self.glossary.get("net", {}).get("label", "Salario neto"),
                explanation=self.glossary.get("net", {}).get("explanation", "Cantidad que queda tras aplicar las deducciones al total devengado en la nómina simplificada.")
            )
        ]

    def extract(self, content: bytes, filename: str = "", content_type: str = "") -> PayslipResponse:
        """
        Orquestador principal:
        - Si es PDF: extrae texto con pypdf y lo envía a Groq; si falla o no hay API key, usa fallback de regex.
        - Si es Imagen: la envía a Groq Vision directamente.
        """
        file_type = self.validate_file(content, filename, content_type)
        client = self._get_groq_client()

        if file_type == "pdf":
            text = self.extract_text_from_pdf(content)
            extracted = False
            gross, net, deductions = None, None, None

            # Intento 1: Groq LLM con el texto extraído
            if client:
                try:
                    gross, net, deductions = self._extract_with_groq_text(text, client)
                    extracted = True
                except Exception as e:
                    logger.warning("Groq text extraction failed, falling back to deterministic regex: %s", e)

            # Fallback determinista si Groq no está configurado o falló
            if not extracted:
                gross, net, deductions = self.parse_payroll_data_fallback(text)

            return PayslipResponse(
                gross=gross,
                net=net,
                deductions=deductions,
                concepts=self._build_concepts(),
                source="synthetic_pdf",
                warning="Ejemplo ficticio para aprendizaje."
            )

        elif file_type.startswith("image/"):
            # Caso imagen normal: requiere Groq Vision
            if not client:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Para procesar imágenes de nómina se requiere configurar una GROQ_API_KEY válida en el archivo .env."
                )

            try:
                gross, net, deductions = self._extract_with_groq_vision(content, file_type, client)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error al analizar la imagen con Groq Vision: {str(e)}"
                )

            return PayslipResponse(
                gross=gross,
                net=net,
                deductions=deductions,
                concepts=self._build_concepts(),
                source="synthetic_pdf",
                warning="Ejemplo ficticio para aprendizaje."
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de archivo no admitido."
        )
