import io
import json
import os
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
import pypdf

from app.main import app
from app.services.payslip.extractor import PayslipExtractor, MAX_FILE_SIZE
from app.schemas.payslip import PayslipResponse

client = TestClient(app)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAMPLES_DIR = os.path.join(BASE_DIR, "data", "samples", "nominas")
EXPECTED_JSON_PATH = os.path.join(SAMPLES_DIR, "nominas_esperadas.json")


def test_health_endpoint():
    """Comprueba que el endpoint /health responde ok según el contrato."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_all_expected_synthetic_payslips():
    """Valida la extracción de las 4 nóminas sintéticas contra los resultados esperados usando el fallback."""
    with open(EXPECTED_JSON_PATH, "r", encoding="utf-8") as f:
        expected_list = json.load(f)

    pdf_files = [
        "demo_01_alex.pdf",
        "demo_02_noa.pdf",
        "demo_03_sam.pdf",
        "demo_04_dani.pdf",
    ]

    extractor = PayslipExtractor()

    for idx, filename in enumerate(pdf_files):
        pdf_path = os.path.join(SAMPLES_DIR, filename)
        assert os.path.exists(pdf_path), f"Falta el archivo {filename}"

        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        result = extractor.extract(pdf_bytes, filename)
        expected = expected_list[idx]

        assert result.gross == expected["gross"], f"Error en bruto de {filename}"
        assert result.net == expected["net"], f"Error en neto de {filename}"
        assert result.source == "synthetic_pdf"
        assert result.warning == "Ejemplo ficticio para aprendizaje."

        exp_deductions = {d["code"]: d["amount"] for d in expected["deductions"]}
        res_deductions = {d.code: d.amount for d in result.deductions}
        assert res_deductions == exp_deductions, f"Deducciones no coinciden en {filename}"

        assert len(result.concepts) >= 2
        concept_codes = [c.code for c in result.concepts]
        assert "gross" in concept_codes
        assert "net" in concept_codes


def test_api_upload_payslip_endpoint():
    """Prueba el endpoint POST /payslip usando TestClient con demo_01_alex.pdf."""
    pdf_path = os.path.join(SAMPLES_DIR, "demo_01_alex.pdf")
    with open(pdf_path, "rb") as f:
        response = client.post(
            "/payslip",
            files={"file": ("demo_01_alex.pdf", f, "application/pdf")}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["gross"] == 2000.0
    assert data["net"] == 1592.0
    assert len(data["deductions"]) == 5
    assert data["source"] == "synthetic_pdf"


def test_get_latest_payslip_endpoint():
    """Comprueba que GET /payslip/latest devuelve la última nómina guardada."""
    pdf_path = os.path.join(SAMPLES_DIR, "demo_01_alex.pdf")
    with open(pdf_path, "rb") as f:
        client.post(
            "/payslip",
            files={"file": ("demo_01_alex.pdf", f, "application/pdf")}
        )

    response = client.get("/payslip/latest")
    assert response.status_code == 200
    data = response.json()
    assert data["gross"] == 2000.0
    assert data["net"] == 1592.0


def test_reject_non_pdf_or_image():
    """El endpoint debe rechazar archivos que no sean PDF ni imágenes válidas."""
    fake_txt = b"Esto no es un PDF ni una imagen, es texto plano."
    response = client.post(
        "/payslip",
        files={"file": ("fake.txt", io.BytesIO(fake_txt), "text/plain")}
    )
    assert response.status_code == 400
    assert "no es un documento PDF válido ni una imagen soportada" in response.json()["detail"]


def test_reject_empty_or_scanned_pdf():
    """Un PDF sin texto digital (ej. escaneo sin texto) debe devolver HTTP 400."""
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=300, height=300)
    pdf_bytes_io = io.BytesIO()
    writer.write(pdf_bytes_io)
    blank_pdf = pdf_bytes_io.getvalue()

    response = client.post(
        "/payslip",
        files={"file": ("blank.pdf", io.BytesIO(blank_pdf), "application/pdf")}
    )
    assert response.status_code == 400
    assert "No se ha detectado texto digital" in response.json()["detail"]


def test_reject_oversized_file():
    """Un archivo superior a 2 MB debe devolver HTTP 413 según el contrato."""
    oversized_bytes = b"%PDF-" + b"0" * (MAX_FILE_SIZE + 100)
    response = client.post(
        "/payslip",
        files={"file": ("huge.pdf", io.BytesIO(oversized_bytes), "application/pdf")}
    )
    assert response.status_code == 413
    assert "excede el tamaño máximo permitido" in response.json()["detail"]


def test_privacy_no_personal_data_exposed():
    """Garantizar que no se expone ningún dato identificativo personal en la respuesta."""
    pdf_path = os.path.join(SAMPLES_DIR, "demo_01_alex.pdf")
    with open(pdf_path, "rb") as f:
        response = client.post(
            "/payslip",
            files={"file": ("demo_01_alex.pdf", f, "application/pdf")}
        )

    assert response.status_code == 200
    raw_response = response.text.lower()

    forbidden_tokens = ["alex", "dani", "nss", "iban", "dni", "cif", "nif", "calle", "empresa sa"]
    for token in forbidden_tokens:
        assert token not in raw_response, f"Se ha detectado posible dato personal filtrado: '{token}'"


def test_groq_text_flow_and_fallback():
    """Prueba que si Groq falla, el extractor recurre limpiamente al fallback determinista."""
    extractor = PayslipExtractor()
    pdf_path = os.path.join(SAMPLES_DIR, "demo_01_alex.pdf")
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    # Simular fallo en Groq
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = RuntimeError("Groq API Timeout")

    with patch.object(extractor, "_get_groq_client", return_value=mock_client):
        result = extractor.extract(pdf_bytes, "demo_01_alex.pdf")
        assert result.gross == 2000.0
        assert result.net == 1592.0
        assert result.source == "synthetic_pdf"


def test_groq_text_flow_success():
    """Prueba la llamada exitosa con Groq LLM estructurando los datos del PDF."""
    extractor = PayslipExtractor()
    pdf_path = os.path.join(SAMPLES_DIR, "demo_01_alex.pdf")
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content=json.dumps({
                    "gross": 2000.0,
                    "net": 1592.0,
                    "deductions": [
                        {"code": "cc", "label": "Contingencias comunes", "amount": 94.0},
                        {"code": "unemployment", "label": "Desempleo", "amount": 31.0},
                        {"code": "training", "label": "Formacion profesional", "amount": 2.0},
                        {"code": "mei", "label": "MEI", "amount": 3.0},
                        {"code": "irpf", "label": "IRPF", "amount": 278.0}
                    ]
                })
            )
        )
    ]
    mock_client.chat.completions.create.return_value = mock_response

    with patch.object(extractor, "_get_groq_client", return_value=mock_client):
        result = extractor.extract(pdf_bytes, "demo_01_alex.pdf")
        assert result.gross == 2000.0
        assert result.net == 1592.0
        assert len(result.deductions) == 5


def test_image_upload_without_api_key():
    """Subir una imagen sin tener configurada GROQ_API_KEY devuelve un error 400 controlado."""
    # 1x1 PNG transparente
    tiny_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    
    with patch.dict(os.environ, {"GROQ_API_KEY": ""}):
        extractor = PayslipExtractor()
        with pytest.raises(Exception) as excinfo:
            extractor.extract(tiny_png, "nomina.png", content_type="image/png")
        assert "GROQ_API_KEY" in str(excinfo.value)


def test_image_upload_with_groq_vision_mock():
    """Prueba el análisis exitoso de una imagen mediante Groq Vision (mockeado)."""
    tiny_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    
    extractor = PayslipExtractor()
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(
            message=MagicMock(
                content=json.dumps({
                    "gross": 1800.0,
                    "net": 1450.0,
                    "deductions": [
                        {"code": "cc", "label": "Contingencias comunes", "amount": 84.6},
                        {"code": "irpf", "label": "IRPF", "amount": 265.4}
                    ]
                })
            )
        )
    ]
    mock_client.chat.completions.create.return_value = mock_response

    with patch.object(extractor, "_get_groq_client", return_value=mock_client):
        result = extractor.extract(tiny_png, "nomina.png", content_type="image/png")
        assert result.gross == 1800.0
        assert result.net == 1450.0
        assert len(result.deductions) == 2
