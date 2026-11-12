# Integración del backend — AI Money

Los archivos `app/schemas/*.py` son el contrato de intercambio. Debe incorporarlos una sola persona a `main` y comunicarlo al resto. Los modelos son independientes de `main.py` y de las rutas, que aún no están implementadas.

Para comprobarlos desde `backend/`:

```bash
pip install pydantic pytest
python -m pytest tests/test_contract_models.py
```

Las rutas se implementan según `../docs/CONTRATO_API.md`. No duplicar nombres de modelos ni editar archivos de otro desarrollador. El `payslip_glossary.json` va en `app/content/`.
