#!/usr/bin/env python3
"""
Script utilitario para probar el flujo completo:
1. Inicia el servidor FastAPI (Uvicorn).
2. Espera a que esté activo (/health).
3. Envía una nómina PDF o imagen a POST /payslip.
4. Muestra la respuesta formateada por consola.
5. Cierra el servidor limpiamente.
"""

import json
import os
import subprocess
import sys
import time

import httpx

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BACKEND_DIR)
DEFAULT_PDF = os.path.join(ROOT_DIR, "data", "samples", "nominas", "demo_01_alex.pdf")
BASE_URL = "http://127.0.0.1:8000"


def is_server_online() -> bool:
    try:
        r = httpx.get(f"{BASE_URL}/health", timeout=0.5)
        return r.status_code == 200
    except Exception:
        return False


def main():
    target_file = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PDF

    if not os.path.isabs(target_file):
        target_file = os.path.abspath(target_file)

    if not os.path.exists(target_file):
        print(f"\n❌ Error: El archivo '{target_file}' no existe.")
        sys.exit(1)

    print(f"\n📄 Archivo a probar: {os.path.basename(target_file)}")

    # Detectar tipo MIME básico
    ext = os.path.splitext(target_file)[1].lower()
    mime = "application/pdf"
    if ext == ".png":
        mime = "image/png"
    elif ext in [".jpg", ".jpeg"]:
        mime = "image/jpeg"
    elif ext == ".webp":
        mime = "image/webp"

    server_process = None
    already_running = is_server_online()

    if already_running:
        print("⚡ Servidor ya detectado en ejecución en http://127.0.0.1:8000")
    else:
        print("🚀 Levantando servidor FastAPI con Uvicorn...")
        server_cmd = [
            sys.executable,
            "-m",
            "uvicorn",
            "app.main:app",
            "--host",
            "127.0.0.1",
            "--port",
            "8000",
        ]
        server_process = subprocess.Popen(
            server_cmd,
            cwd=BACKEND_DIR,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # Esperar hasta 6 segundos a que el servidor arranque
        ready = False
        for _ in range(12):
            time.sleep(0.5)
            if is_server_online():
                ready = True
                break

        if not ready:
            print("❌ No se pudo levantar el servidor en el tiempo esperado.")
            if server_process:
                server_process.terminate()
            sys.exit(1)

        print("✅ Servidor activo y respondiendo en /health")

    try:
        print("📤 Enviando nómina al endpoint POST /payslip...")
        with open(target_file, "rb") as f:
            files = {"file": (os.path.basename(target_file), f, mime)}
            start_time = time.time()
            response = httpx.post(f"{BASE_URL}/payslip", files=files, timeout=15.0)
            elapsed = time.time() - start_time

        if response.status_code == 200:
            data = response.json()
            print(f"\n🎉 ¡Éxito! (Procesado en {elapsed:.2f}s)\n" + "=" * 50)
            print(f"💰 Salario Bruto: {data.get('gross')} €")
            print(f"💵 Salario Neto:  {data.get('net')} €")
            print("\n📋 Desglose de Deducciones:")
            for d in data.get("deductions", []):
                print(f"  • {d.get('label'):<25}: {d.get('amount'):>7.2f} €  ({d.get('code')})")

            print("\n💡 Conceptos didácticos:")
            for c in data.get("concepts", []):
                print(f"  [{c.get('label')}]: {c.get('explanation')}")

            print(f"\n📌 Origen: {data.get('source')} | Aviso: {data.get('warning')}")
            print("=" * 50)
            print(f"💾 Copia guardada en: backend/uploads/latest_payslip.json")

        else:
            print(f"\n❌ Error en la API (HTTP {response.status_code}):")
            try:
                print(json.dumps(response.json(), indent=2, ensure_ascii=False))
            except Exception:
                print(response.text)

    finally:
        if server_process:
            print("\n🛑 Apagando el servidor temporal...")
            server_process.terminate()
            server_process.wait()
            print("👋 Servidor cerrado correctamente.")


if __name__ == "__main__":
    main()
