"""
agente_bloqueo_flask.py
========================
Agente de bloqueo remoto de pantalla — versión Flask.

Este script debe ejecutarse en la computadora que se quiere bloquear (192.168.1.79).
Reemplaza cualquier agente Flask anterior.

Instalación de dependencias (una sola vez):
    pip install flask flask-cors

Uso:
    python agente_bloqueo_flask.py

Endpoints:
    POST http://192.168.1.79:5050/bloquear  → Bloquea la pantalla
    GET  http://192.168.1.79:5050/estado    → Verifica que el agente está vivo
"""

import ctypes
import platform
import subprocess
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS   # pip install flask-cors

# ── Configuración ──────────────────────────────────────────────────────────────
HOST = "0.0.0.0"   # Escuchar en todas las interfaces de red
PORT = 5050
# ──────────────────────────────────────────────────────────────────────────────

app = Flask(__name__)

# Habilitar CORS para TODAS las rutas y orígenes (necesario para el inventario web)
CORS(app, resources={r"/*": {"origins": "*"}})


def bloquear_pantalla():
    """Bloquea la pantalla del sistema operativo."""
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
            raise OSError(f"Sistema operativo no soportado: {sistema}")
        return True, f"Pantalla bloqueada correctamente ({sistema})"
    except Exception as e:
        return False, f"Error al bloquear: {str(e)}"


@app.route("/bloquear", methods=["POST", "OPTIONS"])
def endpoint_bloquear():
    """Recibe la orden de bloqueo y ejecuta LockWorkStation."""
    # El preflight OPTIONS ya lo maneja flask-cors automáticamente
    if request.method == "OPTIONS":
        return jsonify({"ok": True}), 200

    cliente_ip = request.remote_addr
    datos = request.get_json(silent=True) or {}
    origen = datos.get("source", "desconocido")

    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] Solicitud de bloqueo → origen: {origen} ({cliente_ip})")

    ok, mensaje = bloquear_pantalla()

    if ok:
        print(f"[{ts}] ✅ {mensaje}")
        return jsonify({"success": True, "message": mensaje}), 200
    else:
        print(f"[{ts}] ❌ {mensaje}")
        return jsonify({"success": False, "error": mensaje}), 500


@app.route("/estado", methods=["GET"])
def endpoint_estado():
    """Permite verificar si el agente está corriendo."""
    return jsonify({
        "success": True,
        "agente": "bloqueo_pantalla",
        "version": "2.0-flask",
        "sistema": platform.system(),
        "puerto": PORT
    }), 200


if __name__ == "__main__":
    print("=" * 55)
    print("  Agente de Bloqueo Remoto - MyCard Inventario")
    print("  (versión Flask)")
    print("=" * 55)
    print(f"  Sistema : {platform.system()} {platform.release()}")
    print(f"  Escuchando en: {HOST}:{PORT}")
    print(f"  Endpoints:")
    print(f"    POST http://<esta-ip>:{PORT}/bloquear  → Bloquea pantalla")
    print(f"    GET  http://<esta-ip>:{PORT}/estado    → Estado del agente")
    print("  Presiona Ctrl+C para detener.")
    print("=" * 55)
    # debug=False para no exponer el debugger en la red
    app.run(host=HOST, port=PORT, debug=False)
