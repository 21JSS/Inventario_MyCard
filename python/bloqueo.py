from flask import Flask, request, jsonify
import subprocess
import os

app = Flask(__name__)


SECRET_TOKEN = "mycard_2025"

@app.route('/bloquear', methods=['POST'])
def bloquear():
    data = request.get_json()

    if not data or data.get('token') != SECRET_TOKEN:
        return jsonify ({"status": "error", "mensaje": "Token invalido"}), 403

        try:
            subprocess.run(
                ["rundll32.exe", "user32.dll,LockWorkStation"],
                check = True
            )
            return jsonify({"status": "ok", "mensaje": "Pantalla bloqueada correctamente"})
        except Exception as e:
            return jsonify ({"status": "error", "mensaje": str(e)}), 500

@app.route('/ping', methods=['GET'])
def ping():
    """Verificacion del endpoint para ver si el agente esta activo"""
    return jsonify({"status": "activo"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050)