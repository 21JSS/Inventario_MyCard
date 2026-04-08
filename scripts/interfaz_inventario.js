// ===== INVENTORY UI COMPONENT =====
// Se encarga del renderizado de las tablas, busquedas y vista detallada de los equipos.

/** Limpia y vuelve a pintar la tabla en base a los datos en `inventario` */
function cargarTabla() {
    const tbody = document.getElementById("inventarioBody");
    if (!tbody) return;
    tbody.innerHTML = "";
  
    inventario.forEach((item) => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", item.id);
        tr.setAttribute("data-estado", item.estado);
        tr.style.cursor = "pointer";
        tr.title = "Clic para ver detalle";
    
        // Al hacer clic en la fila → abrir detalle
        tr.addEventListener("click", () => {
            mostrarDetalleEquipo(item.id);
        });
    
        let estadoStyle = "";
        let estadoTexto = item.estado;
        if (item.estado == 1) {
            estadoStyle = 'style="color: #10b981; font-weight: 600;"';
            estadoTexto = "Disponible";
        } else if (item.estado == 0) {
            estadoStyle = 'style="color: #f59e0b; font-weight: 600;"';
            estadoTexto = "Ocupada";
        }
        
        tr.innerHTML = `
            <td>${escapeHTML(formatearId(item.id))}</td>
            <td><strong>${escapeHTML(item.nombre)}</strong></td>
            <td>${escapeHTML(item.tipo)}</td>
            <td>${escapeHTML(item.marca)}</td>
            <td>${escapeHTML(item.modelo)}</td>
            <td>${escapeHTML(item.encargado || "N/A")}</td>
            <td>${escapeHTML(item.departamento || "N/A")}</td>
            <td>${escapeHTML(item.area || "N/A")}</td>
            <td>${escapeHTML(item.descripcion_equipo || "Sin descripción")}</td>
            <td style="color: #2563eb; font-weight: 600;">${escapeHTML(item.ip_asignada || "Sin IP")}</td>
            <td ${estadoStyle}>${estadoTexto}</td>
        `;
        tbody.appendChild(tr);
    });

    // Reaplicamos cualquier filtro local activo
    filtrarTabla();
}

/** Filtro buscador de texto libre por filas */
function filtrarTabla() {
    const searchInput = document.getElementById("searchBox");
    if(!searchInput) return;
    const searchTerm = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll("#inventarioBody tr");
  
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? "" : "none";
    });
}
  
/** Oculta o muestra filas basándose en su estado rápido */
function filtrarPorEstado(estado) {
    filtroActivo = estado;
  
    const filtroIndicador = document.getElementById("filtroIndicador");
    const filtroTexto = document.getElementById("filtroTexto");
  
    if (estado === "todos") {
      if (filtroIndicador) filtroIndicador.style.display = "none";
    } else {
      if (filtroIndicador) filtroIndicador.style.display = "block";
      if (filtroTexto) {
        filtroTexto.textContent = estado == 1
            ? "🟢 Mostrando: Solo equipos disponibles"
            : "🟡 Mostrando: Solo equipos ocupados";
      }
    }
  
    const rows = document.querySelectorAll("#inventarioBody tr");
    rows.forEach((row) => {
      const estadoEquipo = row.getAttribute("data-estado");
      if (estado === "todos" || estadoEquipo == estado) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
}
  
/** Convierte la vista global a un foco detallado de un id de equipo individual */
function mostrarDetalleEquipo(equipoId) {
    const equipo = inventario.find((item) => item.id == equipoId);
  
    if (!equipo) {
      alert("Equipo no encontrado");
      return;
    }
  
    // Ocultar vista normal
    const stats = document.querySelector(".stats-container");
    if (stats) stats.style.display = "none";
    const controls = document.getElementById("controls");
    if (controls) controls.style.display = "none";
    const tableContainer = document.getElementById("tableContainer");
    if (tableContainer) tableContainer.style.display = "none";
  
    // Mostrar vista de detalle
    const detalleView = document.getElementById("detalleEquipo");
    if (detalleView) detalleView.style.display = "block";
  
    // Llenar datos
    document.getElementById("detalle-nombre").textContent = equipo.nombre;
    document.getElementById("detalle-id").textContent = formatearId(equipo.id);
    document.getElementById("detalle-tipo").textContent = equipo.tipo;
    document.getElementById("detalle-marca").textContent = equipo.marca;
    document.getElementById("detalle-modelo").textContent = equipo.modelo;
  
    const detDepto = document.getElementById("detalle-departamento");
    if (detDepto) detDepto.textContent = (equipo.departamento || "No asignado").toUpperCase();
  
    const detArea = document.getElementById("detalle-area");
    if (detArea) detArea.textContent = (equipo.area || "No asignado").toUpperCase();
  
    const detEnc = document.getElementById("detalle-encargado");
    if (detEnc) detEnc.textContent = (equipo.encargado || "No asignado").toUpperCase();
  
    document.getElementById("detalle-descripcion").textContent = equipo.descripcion_equipo || "Sin descripción";
  
    // Datos de Red
    const detIp = document.getElementById("detalle-ip");
    if (detIp) detIp.textContent = equipo.ip_asignada || "No asignada";
  
    // Estado con color
    const estadoBadge = document.getElementById("detalle-estado");
    if (estadoBadge) {
      estadoBadge.textContent = obtenerTextoEstado(equipo.estado);
      estadoBadge.style.backgroundColor = obtenerColorEstado(equipo.estado);
      estadoBadge.style.color = "white";
    }
  
    // Mostrar nota si existe
    const infoNota = document.getElementById("info-nota");
    const detalleNota = document.getElementById("detalle-nota");
    if (infoNota && detalleNota) {
      if (equipo.estado == 0 && equipo.nota_estado) {
        detalleNota.textContent = equipo.nota_estado;
        infoNota.style.display = "block";
      } else {
        infoNota.style.display = "none";
      }
    }
  
    equipoActualId = equipoId;
  
    // Configurar botón según estado
    const btnCambiar = document.getElementById("btnCambiarEstado");
    if (btnCambiar) {
      if (equipo.estado == 1) {
        btnCambiar.textContent = "Marcar como Ocupada";
        btnCambiar.className = "btn-cambiar-estado disponible";
      } else {
        btnCambiar.textContent = "Marcar como Disponible";
        btnCambiar.className = "btn-cambiar-estado ocupada";
      }
    }
}
  
/** Restaura la interfaz a la tabla general */
function regresarInventario() {
    const detalleVal = document.getElementById("detalleEquipo");
    if (detalleVal) detalleVal.style.display = "none";
  
    const stats = document.querySelector(".stats-container");
    if (stats) stats.style.display = "grid";
    const controls = document.getElementById("controls");
    if (controls) controls.style.display = "block";
    const tableContainer = document.getElementById("tableContainer");
    if (tableContainer) tableContainer.style.display = "block";
  
    window.history.pushState({}, "", "index.html");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Animación que ilumina un equipo buscado directamente si se cierra su vista detalle */
function resaltarEquipo(equipoId) {
    const fila = document.querySelector(`tr[data-id="${equipoId}"]`);
  
    if (fila) {
      fila.style.backgroundColor = "#fef3c7";
      fila.style.border = "2px solid #f59e0b";
      fila.style.transition = "all 0.3s ease";
  
      setTimeout(() => {
        fila.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
  
      const nombreEquipo = inventario.find((item) => item.id == equipoId)?.nombre || "Equipo";
      const mensaje = document.createElement("div");
      mensaje.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #10b981;
              color: white;
              padding: 15px 25px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              z-index: 1000;
              font-weight: 600;
          `;
      mensaje.textContent = `✓ Equipo encontrado: ${nombreEquipo}`;
      document.body.appendChild(mensaje);
  
      setTimeout(() => {
        mensaje.style.opacity = "0";
        mensaje.style.transition = "opacity 0.5s";
        setTimeout(() => mensaje.remove(), 500);
      }, 3000);
    }
}
