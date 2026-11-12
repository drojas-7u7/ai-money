import os
import sys

# Añade la carpeta 'backend' al PYTHONPATH para que 'from app...' funcione directamente
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
