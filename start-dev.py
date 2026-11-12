"""Arranca backend (uvicorn) y frontend (Vite) en paralelo.
Uso: python start-dev.py
Ctrl+C para parar los dos.
"""
import subprocess
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).parent

CYAN  = "\033[96m"
BLUE  = "\033[94m"
RESET = "\033[0m"
BOLD  = "\033[1m"

def stream(proc, label, color):
    for line in proc.stdout:
        print(f"{color}[{label}]{RESET} {line}", end="")

def find_npm():
    candidates = [
        r"C:\Program Files\nodejs\npm.cmd",
        r"C:\Program Files (x86)\nodejs\npm.cmd",
    ]
    for path in candidates:
        if Path(path).exists():
            return path
    return "npm"

npm = find_npm()

backend = subprocess.Popen(
    ["uvicorn", "app.main:app", "--reload", "--env-file", str(ROOT / ".env")],
    cwd=ROOT / "backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
)

frontend = subprocess.Popen(
    [npm, "run", "dev"],
    cwd=ROOT / "frontend",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
)

print(f"{BOLD}Servidores arrancando...{RESET}")
print(f"{BLUE}[backend]{RESET}  http://localhost:8000  |  docs: http://localhost:8000/docs")
print(f"{CYAN}[frontend]{RESET} http://localhost:5173")
print("Ctrl+C para parar.\n")

threading.Thread(target=stream, args=(backend,  "backend",  BLUE), daemon=True).start()
threading.Thread(target=stream, args=(frontend, "frontend", CYAN), daemon=True).start()

try:
    backend.wait()
    frontend.wait()
except KeyboardInterrupt:
    print("\nParando servidores...")
    backend.terminate()
    frontend.terminate()
    sys.exit(0)
