# Dev 3 — María: puesta en marcha

Este kit incorpora código listo para probar del módulo financiero, **no** el frontend, el LLM ni el analizador PDF terminados.

## Mañana, dentro de `ai-money/` (rama `feature/finance-calculations`)

```bash
source .venv/bin/activate
python -m pip install -r backend/requirements-finance.txt
cd backend
python -m pytest -q tests/test_finance.py tests/test_contract_models.py
```

El integrador añade en `backend/app/main.py`:

```python
from app.api.routes.profile import router as profile_router
from app.api.routes.finance import router as finance_router
app.include_router(profile_router)
app.include_router(finance_router)
```

No crear `main.py` por tu cuenta: es compartido. El estado de perfil está en memoria global, solo apto para una demo local y **no** para varios usuarios concurrentes.

## Git: sin commits hoy

El instalador del kit no ejecuta `git add`, `commit` ni `push`. Para el primer commit de mañana **solo del README**:

```bash
git add README.md
git diff --cached --name-only  # debería aparecer solo README.md
git commit -m "docs: describe AI Money MVP"
git push -u origin feature/finance-calculations
```

Cuando esté permitido entregar el resto, acordar primero la incorporación de esquemas compartidos a `main`. No hacer `git add .`.
