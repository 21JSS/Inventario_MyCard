/**
 * bloquearPantalla.js
 * Servicio de bloqueo remoto de pantalla.
 *
 * Envía una petición HTTP al agente de bloqueo que corre en el PC remoto
 * (ejemplo: http://192.168.1.79:8765/bloquear).
 *
 * El agente local (Python) debe estar corriendo en la computadora destino
 * escuchando en el puerto 8765.
 */

const BLOQUEO_PORT = 5050;
const BLOQUEO_ENDPOINT = "/bloquear";
const BLOQUEO_TIMEOUT_MS = 5000;

/**
 * Bloquea la pantalla de un equipo remoto mediante su IP.
 * @param {string} ip - IP del equipo remoto (ej: "192.168.1.79")
 * @param {string} [nombreEquipo=""] - Nombre del equipo (solo para mostrar en UI)
 */
async function bloquearPantalla(ip, nombreEquipo = "") {
    const url = `http://${ip}:${BLOQUEO_PORT}${BLOQUEO_ENDPOINT}`;

    // Mostrar indicador visual de carga
    const toast = mostrarToastBloqueo(
        `🔒 Enviando señal de bloqueo a ${nombreEquipo || ip}...`,
        "info"
    );

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), BLOQUEO_TIMEOUT_MS);

        const response = await fetch(url, {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "lock", source: window.location.hostname }),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json().catch(() => ({}));
            actualizarToast(
                toast,
                `✅ Pantalla bloqueada: ${nombreEquipo || ip}`,
                "success"
            );
        } else {
            actualizarToast(
                toast,
                `⚠️ El agente respondió con error (${response.status}). Verifica que esté activo en ${ip}.`,
                "warning"
            );
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
                `❌ No se pudo conectar con ${ip}:${BLOQUEO_PORT}. Verifica que el agente esté activo.`,
                "error"
            );
        }
        console.error("[bloquearPantalla] Error:", error);
    }

    // Quitar toast después de 4 segundos
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 400);
        }
    }, 4000);
}

/**
 * Crea un toast de notificación flotante.
 */
function mostrarToastBloqueo(mensaje, tipo = "info") {
    // Colores según tipo
    const colores = {
        info: { bg: "#1d4ed8", icon: "🔒" },
        success: { bg: "#059669", icon: "✅" },
        warning: { bg: "#d97706", icon: "⚠️" },
        error: { bg: "#dc2626", icon: "❌" },
    };
    const color = colores[tipo] || colores.info;

    const toast = document.createElement("div");
    toast.id = "toastBloqueo";
    toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    background: ${color.bg};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    z-index: 9999;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 600;
    font-size: 14px;
    max-width: 360px;
    opacity: 1;
    transition: opacity 0.4s ease;
    line-height: 1.5;
    display: flex;
    align-items: center;
    gap: 10px;
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
}
