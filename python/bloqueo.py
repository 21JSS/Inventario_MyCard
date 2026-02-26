"""
bloqueo.py
==========
Agente de bloqueo remoto de pantalla — Flask + CORS.

Ejecutar en la laptop que se quiere bloquear remotamente (192.168.1.79):
    python bloqueo.py

Dependencias (instalar una sola vez):
    pip install flask flask-cors

Endpoints:
    POST http://192.168.1.79:5050/bloquear  → Bloquea la pantalla
    GET  http://192.168.1.79:5050/estado    → Estado del agente
"""

import ctypes
import platform
import subprocess
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS

# ── Configuración ──────────────────────────────────────────────────────────────
HOST = "0.0.0.0"
PORT = 5050
# ──────────────────────────────────────────────────────────────────────────────

app = Flask(__name__)

# CORS abierto para toda la red local (necesario para que el navegador no bloquee la petición)
CORS(app, resources={r"/*": {"origins": "*"}})


def bloquear_pantalla():
    """Bloquea la pantalla del sistema operativo Windows."""
    sistema = platform.system()
    try:
        if sistema == "Windows":
            ctypes.windll.user32.LockWorkStation()
        elif sistema == "Linux":
            subprocess.run(["gnome-screensaver-command", "--lock"], check=True)
        elif sistema == "Darwin":
            subprocess.run([
                "/System/Library/CoreServices/Menu Extras/User.menu/Contents/Resources/CGSession",
                "-suspend"
            ], check=True)
        else:
            raise OSError(f"Sistema no soportado: {sistema}")
        return True, f"Pantalla bloqueada ({sistema})"
    except Exception as e:
        return False, str(e)


@app.route("/bloquear", methods=["POST", "OPTIONS"])
def endpoint_bloquear():
    if request.method == "OPTIONS":
        # Responder al preflight CORS
        return jsonify({"ok": True}), 200

    datos = request.get_json(silent=True) or {}
    origen = datos.get("source", "desconocido")
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] Bloqueo solicitado por: {origen} ({request.remote_addr})")

    ok, mensaje = bloquear_pantalla()

    if ok:
        print(f"[{ts}] ✅ {mensaje}")
        return jsonify({"success": True, "message": mensaje}), 200
    else:
        print(f"[{ts}] ❌ Error: {mensaje}")
        return jsonify({"success": False, "error": mensaje}), 500


@app.route("/estado", methods=["GET"])
def endpoint_estado():
    return jsonify({
        "success": True,
        "agente": "bloqueo_pantalla",
        "version": "2.0",
        "sistema": platform.system(),
        "puerto": PORT
    }), 200


if __name__ == "__main__":
    print("=" * 50)
    print("  Agente Bloqueo Remoto - MyCard")
    print("=" * 50)
    print(f"  Puerto : {PORT}")
    print(f"  POST /bloquear  → Bloquea la pantalla")
    print(f"  GET  /estado    → Estado del agente")
    print("  Ctrl+C para detener")
    print("=" * 50)
    app.run(host=HOST, port=PORT, debug=False)