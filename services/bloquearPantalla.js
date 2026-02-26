<<<<<<< HEAD
async function bloquearPantalla(ip, nombreEquipo = "") {
  const confirmacion = confirm(
    `¿Deseas bloquear la pantalla de este dispositivo${nombreEquipo ? " " + nombreEquipo : ""}?\nIP: ${ip}`,
  );

  if (!confirmacion) return;

  try {
    const formData = new FormData();

    formData.append("ip", ip);

    const response = await fetch("../functions/bloquear_pantalla.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.status === "ok") {
      mostrarNotificacion(
        `Pantalla bloqueada en el dispositivo con la ip:${ip || nombreEquipo}`,
        "Con exito",
      );
    } else {
      mostraraNotificacion(`Error: ${result.mensaje}`, "error");
    }
  } catch (error) {
    mostrarNotificacion(`Error de conexion: ${error.message}`, "error");
  }
}

async function verificarAgenteActivo(ip) {
  try {
    const reponse = await fetch(`http://${ip}:5050/ping`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });

    const data = await reponse.json();

    return data.status === "activo";
  } catch {
    return false;
  }
}

function mostrarNotificacion(mensaje, tipo = "info") {
  alert(mensaje);
=======
/**
 * bloquearPantalla.js
 * --------------------
 * Servicio de bloqueo remoto de pantalla.
 *
 * El navegador llama al proxy PHP (mismo servidor XAMPP, sin CORS ni mixed content).
 * El proxy PHP reenvía la petición al agente Flask en la IP remota.
 *
 * Flujo:
 *   Navegador → /php/proxy_bloqueo.php → http://<IP>:5050/bloquear → LockWorkStation()
 */

const PROXY_URL = "../php/proxy_bloqueo.php";
const BLOQUEO_TIMEOUT_MS = 8000;

/**
 * Bloquea la pantalla de un equipo remoto mediante su IP.
 * @param {string} ip - IP del equipo remoto (ej: "192.168.1.79")
 * @param {string} [nombre=""] - Nombre del equipo (para mostrar en notificación)
 */
async function bloquearPantalla(ip, nombre = "") {
    const toast = mostrarToastBloqueo(
        `🔒 Enviando señal de bloqueo a ${nombre || ip}...`,
        "info"
    );

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), BLOQUEO_TIMEOUT_MS);

        const response = await fetch(PROXY_URL, {
            method: "POST",
            signal: controller.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip, nombre }),
        });

        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
            actualizarToast(toast, `✅ Pantalla bloqueada: ${nombre || ip}`, "success");
        } else {
            const msg = data.error || `Error del servidor (${response.status})`;
            actualizarToast(toast, `⚠️ ${msg}`, "warning");
        }
    } catch (error) {
        if (error.name === "AbortError") {
            actualizarToast(
                toast,
                `⏱️ Tiempo de espera agotado. ¿Está el agente corriendo en ${ip}?`,
                "error"
            );
        } else {
            actualizarToast(
                toast,
                `❌ Error de conexión: ${error.message}`,
                "error"
            );
        }
        console.error("[bloquearPantalla] Error:", error);
    }

    // Quitar el toast después de 5 segundos
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 400);
        }
    }, 5000);
}

/**
 * Crea un toast flotante de notificación.
 */
function mostrarToastBloqueo(mensaje, tipo = "info") {
    // Eliminar toast anterior si existe
    const prev = document.getElementById("toastBloqueo");
    if (prev) prev.remove();

    const colores = {
        info: "#1d4ed8",
        success: "#059669",
        warning: "#d97706",
        error: "#dc2626",
    };

    const toast = document.createElement("div");
    toast.id = "toastBloqueo";
    toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    background: ${colores[tipo] || colores.info};
    color: white;
    padding: 16px 22px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    z-index: 9999;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 600;
    font-size: 14px;
    max-width: 380px;
    opacity: 1;
    transition: opacity 0.4s ease;
    line-height: 1.5;
  `;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    return toast;
}

/**
 * Actualiza el contenido y color de un toast existente.
 */
function actualizarToast(toast, mensaje, tipo = "info") {
    if (!toast) return;
    const colores = {
        info: "#1d4ed8",
        success: "#059669",
        warning: "#d97706",
        error: "#dc2626",
    };
    toast.style.background = colores[tipo] || colores.info;
    toast.textContent = mensaje;
>>>>>>> e27b938d5ed26a54c2f650440a9abcbc076f455f
}
