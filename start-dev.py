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

NODE_DIRS = [
    r"C:\Program Files\nodejs",
    r"C:\Program Files (x86)\nodejs",
]

def find_node_dir():
    for d in NODE_DIRS:
        if Path(d).exists():
            return d
    return None

def find_npm():
    node_dir = find_node_dir()
    if node_dir:
        candidate = str(Path(node_dir) / "npm.cmd")
        if Path(candidate).exists():
            return candidate
    return "npm"

import os
node_dir = find_node_dir()
env = os.environ.copy()
if node_dir and node_dir not in env.get("PATH", ""):
    env["PATH"] = node_dir + os.pathsep + env.get("PATH", "")

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
    env=env,
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
