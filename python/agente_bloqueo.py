"""
agente_bloqueo.py
=================
Agente de bloqueo remoto de pantalla.

Este script debe ejecutarse en la computadora que se quiere bloquear remotamente
(en este caso: 192.168.1.79).

Levanta un servidor HTTP en el puerto 8765. Cuando recibe una petición POST a /bloquear,
ejecuta el bloqueo de pantalla del sistema operativo.

Uso:
    python agente_bloqueo.py

Requisitos:
    - Python 3.7+
    - No requiere librerías externas (solo stdlib)

Para que inicie automáticamente con Windows, agregar al Programador de tareas o
colocar un acceso directo en:
    C:\\Users\\<usuario>\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup
"""

import json
import ctypes
import subprocess
import platform
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime

# ── Configuración ──────────────────────────────────────────────────────────────
HOST = "0.0.0.0"   # Escuchar en todas las interfaces de red
PORT = 5050
ALLOWED_NETWORKS = []  # Vacío = aceptar cualquier IP. Añade prefijos para restringir, ej: ["192.168.1."]
# ──────────────────────────────────────────────────────────────────────────────


def bloquear_pantalla():
    """Bloquea la pantalla del sistema operativo."""
    sistema = platform.system()
    try:
        if sistema == "Windows":
            # Método 1: API de Windows (más confiable)
            ctypes.windll.user32.LockWorkStation()
        elif sistema == "Linux":
            # Para GNOME
            subprocess.run(["gnome-screensaver-command", "--lock"], check=True)
        elif sistema == "Darwin":
            # macOS
            subprocess.run([
                "/System/Library/CoreServices/Menu Extras/User.menu/Contents/Resources/CGSession",
                "-suspend"
            ], check=True)
        else:
            raise OSError(f"Sistema operativo no soportado: {sistema}")
        return True, f"Pantalla bloqueada correctamente ({sistema})"
    except Exception as e:
        return False, f"Error al bloquear: {str(e)}"


class AgenteBLoqueoHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        """Sobreescribir para tener log con timestamp."""
        ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        client_ip = self.client_address[0]
        print(f"[{ts}] [{client_ip}] {format % args}")

    def _send_json(self, status_code, data: dict):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        # CORS: permitir peticiones desde el inventario local
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        """Responder al preflight de CORS."""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path != "/bloquear":
            self._send_json(404, {"success": False, "error": "Ruta no encontrada"})
            return

        # Verificar red permitida (si se configuró)
        client_ip = self.client_address[0]
        if ALLOWED_NETWORKS:
            allowed = any(client_ip.startswith(net) for net in ALLOWED_NETWORKS)
            if not allowed:
                print(f"[BLOQUEADO] IP {client_ip} no está en la red permitida.")
                self._send_json(403, {"success": False, "error": "IP no autorizada"})
                return

        # Leer cuerpo (opcional)
        content_length = int(self.headers.get("Content-Length", 0))
        body = {}
        if content_length > 0:
            raw = self.rfile.read(content_length)
            try:
                body = json.loads(raw.decode("utf-8"))
            except Exception:
                pass

        source = body.get("source", "desconocido")
        print(f"[INFO] Solicitud de bloqueo recibida desde: {source} ({client_ip})")

        ok, mensaje = bloquear_pantalla()
        if ok:
            self._send_json(200, {"success": True, "message": mensaje})
        else:
            self._send_json(500, {"success": False, "error": mensaje})

    def do_GET(self):
        """Endpoint de estado para verificar que el agente está activo."""
        if self.path == "/estado":
            self._send_json(200, {
                "success": True,
                "agente": "bloqueo_pantalla",
                "version": "1.0",
                "sistema": platform.system(),
                "puerto": PORT
            })
        else:
            self._send_json(404, {"success": False, "error": "Ruta no encontrada"})


def main():
    print("=" * 55)
    print("  Agente de Bloqueo Remoto - MyCard Inventario")
    print("=" * 55)
    print(f"  Sistema : {platform.system()} {platform.release()}")
    print(f"  Escuchando en: {HOST}:{PORT}")
    print(f"  Endpoints:")
    print(f"    POST http://<esta-ip>:{PORT}/bloquear  → Bloquea pantalla")
    print(f"    GET  http://<esta-ip>:{PORT}/estado    → Estado del agente")
    print("  Presiona Ctrl+C para detener.")
    print("=" * 55)

    server = HTTPServer((HOST, PORT), AgenteBLoqueoHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Agente detenido por el usuario.")
        server.server_close()


if __name__ == "__main__":
    main()
