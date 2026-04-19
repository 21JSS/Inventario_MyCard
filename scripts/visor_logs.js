
/** Almacena todos los logs cargados desde el servidor */
let logsData = [];

/** Mapeo de acciones de base de datos a etiquetas legibles */
const ACCIONES_LABELS = {
    login: "Login",
    logout: "Logout",
    agregar_equipo: "Agregar equipo",
    cambiar_estado: "Cambiar estado",
    eliminar_equipo: "Eliminar equipo",
    crear_usuario: "Crear usuario",
    editar_usuario: "Editar usuario",
    eliminar_usuario: "Eliminar usuario"
};

/** Mapeo de IDs de rol a nombres legibles */
const ROLES = {
    "rol_id 1": "rol de: Administrador",
    "rol_id 2": "rol de: Técnico de Sistemas",
    "rol_id 3": "rol de: Usuario de Consulta",
    "rol_id 4": "rol de: Auditor / Supervisor"
};

// ── Carga inicial desde el servidor ────────────────────────────

async function fetchLogs() {
    try {
        const response = await fetch("../php/api_logs.php");

        if (response.status === 401 || response.status === 403) {
            alert("Acceso denegado: Necesitas ser Administrador o Auditor.");
            window.location.href = "index.html";
            return;
        }

        const result = await response.json();

        if (result.success) {
            logsData = result.data;
            renderLogs(logsData);
        } else {
            mostrarError(result.error);
        }
    } catch (err) {
        console.error("Error al cargar logs:", err);
        mostrarError("No se pudo conectar con el servidor.");
    }
}

// ── Renderizado de la tabla ─────────────────────────────────────

function renderLogs(logs) {
    const tbody = document.getElementById("logsBody");
    const logsVacio = document.getElementById("logsVacio");
    const tableEl = document.getElementById("logsTable");
    const contador = document.getElementById("logsContador");

    tbody.innerHTML = "";

    if (logs.length === 0) {
        tableEl.style.display = "none";
        logsVacio.style.display = "flex";
        contador.innerHTML = `<i class="fa-solid fa-list-check"></i> Sin resultados`;
        return;
    }

    tableEl.style.display = "";
    logsVacio.style.display = "none";
    contador.innerHTML = `<i class="fa-solid fa-list-check"></i> ${logs.length} registro${logs.length !== 1 ? "s" : ""} encontrado${logs.length !== 1 ? "s" : ""}`;

    logs.forEach(log => {
        const tr = document.createElement("tr");

        // Formatear detalles: reemplazar rol_id X por nombre legible
        let detalles = log.detalles || "Sin detalle extra";
        Object.keys(ROLES).forEach(id => {
            detalles = detalles.replace(id, ROLES[id]);
        });

        // Etiqueta de acción con badge de color
        const accionLabel = ACCIONES_LABELS[log.accion] || log.accion.replace(/_/g, " ");
        const accionClass = obtenerClaseAccion(log.accion);

        // Formatear fecha
        const fechaFormateada = formatearFecha(log.fecha);

        tr.innerHTML = `
            <td class="log-fecha">${fechaFormateada}</td>
            <td><strong class="log-username">${log.username}</strong></td>
            <td><span class="log-badge ${accionClass}">${accionLabel}</span></td>
            <td class="log-detalle">${detalles}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ── Filtrado del lado del cliente ───────────────────────────────

function aplicarFiltros() {
    const usuario = document.getElementById("filtroUsuario").value.trim().toLowerCase();
    const accion = document.getElementById("filtroAccion").value;
    const fechaDesde = document.getElementById("filtroFechaDesde").value;  // "YYYY-MM-DD"
    const fechaHasta = document.getElementById("filtroFechaHasta").value;

    const filtrados = logsData.filter(log => {
        // Filtro por usuario
        if (usuario && !log.username.toLowerCase().includes(usuario)) return false;

        // Filtro por acción
        if (accion && log.accion !== accion) return false;

        // Filtro por rango de fechas
        const fechaLog = log.fecha ? log.fecha.substring(0, 10) : ""; // "AÑO-MES-DIA"
        if (fechaDesde && fechaLog < fechaDesde) return false;
        if (fechaHasta && fechaLog > fechaHasta) return false;

        return true;
    });

    renderLogs(filtrados);
    actualizarChips({ usuario, accion, fechaDesde, fechaHasta });
}

function limpiarFiltros() {
    document.getElementById("filtroUsuario").value = "";
    document.getElementById("filtroAccion").value = "";
    document.getElementById("filtroFechaDesde").value = "";
    document.getElementById("filtroFechaHasta").value = "";
    renderLogs(logsData);
    actualizarChips({});
}

// ── Chips de filtros activos ────────────────────────────────────

function actualizarChips({ usuario = "", accion = "", fechaDesde = "", fechaHasta = "" } = {}) {
    const chipsEl = document.getElementById("filtrosActivos");
    const btnLimpiar = document.getElementById("btnLimpiarFiltros");
    chipsEl.innerHTML = "";

    const chips = [];

    if (usuario) chips.push({ label: `Usuario: ${usuario}`, campo: "filtroUsuario" });
    if (accion) chips.push({ label: `Acción: ${ACCIONES_LABELS[accion] || accion}`, campo: "filtroAccion" });
    if (fechaDesde) chips.push({ label: `Desde: ${formatearFechaCorta(fechaDesde)}`, campo: "filtroFechaDesde" });
    if (fechaHasta) chips.push({ label: `Hasta: ${formatearFechaCorta(fechaHasta)}`, campo: "filtroFechaHasta" });

    chips.forEach(chip => {
        const span = document.createElement("span");
        span.className = "filtro-chip";
        span.innerHTML = `${chip.label} <button onclick="limpiarCampo('${chip.campo}')" title="Quitar filtro"><i class="fa-solid fa-xmark"></i></button>`;
        chipsEl.appendChild(span);
    });

    btnLimpiar.style.display = chips.length > 0 ? "flex" : "none";
}

function limpiarCampo(campoId) {
    document.getElementById(campoId).value = "";
    aplicarFiltros();
}

// ── Helpers ─────────────────────────────────────────────────────

function obtenerClaseAccion(accion) {
    const mapa = {
        login: "badge-login",
        logout: "badge-logout",
        agregar_equipo: "badge-agregar",
        cambiar_estado: "badge-cambio",
        eliminar_equipo: "badge-eliminar",
        crear_usuario: "badge-crear",
        editar_usuario: "badge-editar",
        eliminar_usuario: "badge-eliminar"
    };
    return mapa[accion] || "badge-default";
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return "—";
    const d = new Date(fechaStr.replace(" ", "T"));
    if (isNaN(d)) return fechaStr;
    return d.toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatearFechaCorta(fechaStr) {
    // "YYYY-MM-DD" → "14 abr 2026"
    if (!fechaStr) return "";
    const [y, m, d] = fechaStr.split("-");
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${d} ${meses[parseInt(m, 10) - 1]} ${y}`;
}

function mostrarError(msg) {
    const tbody = document.getElementById("logsBody");
    tbody.innerHTML = `<tr><td colspan="4" style="color:#ef4444;text-align:center;padding:20px;">
        <i class="fa-solid fa-triangle-exclamation"></i> Error: ${msg}
    </td></tr>`;
}

// ── Inicialización ──────────────────────────────────────────────

window.onload = fetchLogs;
