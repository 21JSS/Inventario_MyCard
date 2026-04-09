
/** Bloquea el scroll de la página de fondo cuando un modal está activo */
function bloquearScrollFondo() {
  const scrollY = window.scrollY || window.pageYOffset;
  document.body.style.top = `-${scrollY}px`;
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
}

/** Restaura el scroll del fondo cuando un modal se cierra */
function restaurarScrollFondo() {
  const scrollY = Math.abs(parseInt(document.body.style.top || "0", 10));
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, scrollY);
}

/** Formatea los IDs a 4 dígitos (Ejemplo: "1" -> "0001") */
function formatearId(id) {
  return String(id).padStart(4, "0");
}

/** Extrae un parámetro de la URL (Ejemplo: ?id=1) */
function obtenerParametroURL(nombre) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nombre);
}

/** Devuelve el texto amigable de un estado de inventario */
function obtenerTextoEstado(estado) {
  const estados = { 1: "Disponible", 0: "Ocupada" };
  return estados[estado] || estado;
}

/** Devuelve el color hexadecimal asociado a un estado */
function obtenerColorEstado(estado) {
  const colores = { 1: "#10b981", 0: "#f59e0b" };
  return colores[estado] || "#6b7280";
}

/** Escapa caracteres especiales para evitar vulnerabilidades XSS al pintar DOM */
function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Sistema de Alertas Personalizadas de IP - Muestra el mensaje interactivo tipo toast o alert */
function mostrarAlertaIP(tipo, titulo, mensaje, rango) {
  const box = document.getElementById("alertaIP-box");
  if (!box) return;
  box.classList.remove("tipo-error", "tipo-success");

  if (tipo === "error") {
    box.classList.add("tipo-error");
    document.getElementById("alertaIP-icono").textContent = "❌";
  } else if (tipo === "success") {
    box.classList.add("tipo-success");
    document.getElementById("alertaIP-icono").textContent = "✅";
  } else {
    document.getElementById("alertaIP-icono").textContent = "⚠️";
  }

  document.getElementById("alertaIP-titulo").textContent = titulo;
  document.getElementById("alertaIP-mensaje").textContent = mensaje;

  // Mostrar u ocultar la sección del rango según corresponda
  const rangoBox = document.querySelector(".alerta-ip-rango");
  if (rango) {
    if (rangoBox) rangoBox.style.display = "block";
    const rangeEl = document.getElementById("alertaIP-rango");
    if (rangeEl) rangeEl.textContent = rango;
  } else {
    if (rangoBox) rangoBox.style.display = "none";
  }

  const alertContainer = document.getElementById("alertaIP");
  if (alertContainer) alertContainer.classList.add("visible");
  bloquearScrollFondo();
}

/** Oculta el sistema de alertas personalizadas */
function cerrarAlertaIP() {
  const alertContainer = document.getElementById("alertaIP");
  if (alertContainer) alertContainer.classList.remove("visible");
  restaurarScrollFondo();
}
