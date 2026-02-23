let inventario = [];
let equipoActualId = null;
let filtroActivo = "todos";

// Inicialización
window.onload = function () {
  cargarInventario();
};

// Manejo de Interfaz y Eventos Globales
const togglePassword = document.querySelector("#togglePassword");
const password = document.querySelector("#password");

if (togglePassword && password) {
  togglePassword.addEventListener("click", function () {
    const type =
      password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);

    this.classList.toggle("bi-eye-slash-fill"); // Ojo tachado
    this.classList.toggle("bi-eye-fill"); // Ojo abierto
  });
}

// Función para mostrar/ocultar el motivo de uso en el formulario de agregar
function toggleMotivoUso(estado) {
  const grupoMotivo = document.getElementById("grupoMotivoUso");
  const inputNota = document.getElementById("nota_uso");
  const selectAsignado = document.getElementById("area");
  const inputDescripcion = document.getElementById("descripcion_equipo");
  const grupoDescripcion = inputDescripcion ? inputDescripcion.parentElement : null;

  if (!grupoMotivo) return;

  if (estado === "ocupada") {
    grupoMotivo.style.display = "block";
    inputNota.setAttribute("required", "required");
    if (selectAsignado) selectAsignado.setAttribute("required", "required");

    if (grupoDescripcion) {
      grupoDescripcion.style.display = "none";
      inputDescripcion.removeAttribute("required");
      inputDescripcion.value = "";
    }
  } else {
    grupoMotivo.style.display = "none";
    inputNota.removeAttribute("required");
    if (selectAsignado) selectAsignado.removeAttribute("required");
    inputNota.value = "";

    if (grupoDescripcion) {
      grupoDescripcion.style.display = "block";
      inputDescripcion.setAttribute("required", "required");
    }
  }
}

// Carga de Datos
async function cargarInventario() {
  try {
    const response = await fetch("../php/api_inventario.php");
    const result = await response.json();

    if (result.success) {
      inventario = result.data;

      document.getElementById("totalEquipos").textContent =
        result.stats.total_equipos;
      document.getElementById("totalDisponibles").textContent =
        result.stats.total_disponibles;
      document.getElementById("totalOcupadas").textContent =
        result.stats.total_ocupadas;

      cargarTabla();

      // Si hay un ID en la URL (desde QR), mostrar vista de detalle
      const equipoId = obtenerParametroURL("id");
      if (equipoId) {
        mostrarDetalleEquipo(equipoId);
      }
    } else {
      console.error("Error al cargar datos:", result.error);
      alert("Error al cargar los datos del inventario: " + result.error);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert(
      "No se pudo conectar con la base de datos. Asegúrate de que el servidor esté corriendo."
    );
  }
}

//  Filtrado y Visualización
function filtrarPorEstado(estado) {
  filtroActivo = estado;

  const filtroIndicador = document.getElementById("filtroIndicador");
  const filtroTexto = document.getElementById("filtroTexto");

  if (estado === "todos") {
    if (filtroIndicador) filtroIndicador.style.display = "none";
  } else {
    if (filtroIndicador) filtroIndicador.style.display = "block";
    if (filtroTexto) {
      filtroTexto.textContent =
        estado === "disponible"
          ? "🟢 Mostrando: Solo equipos disponibles"
          : "🟡 Mostrando: Solo equipos ocupados";
    }
  }

  const rows = document.querySelectorAll("#inventarioBody tr");
  rows.forEach((row) => {
    const estadoEquipo = row.getAttribute("data-estado");
    if (estado === "todos" || estadoEquipo === estado) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

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
    if (equipo.estado === "ocupada" && equipo.nota_estado) {
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
    if (equipo.estado === "disponible") {
      btnCambiar.textContent = "Marcar como Ocupada";
      btnCambiar.className = "btn-cambiar-estado disponible";
    } else {
      btnCambiar.textContent = "Marcar como Disponible";
      btnCambiar.className = "btn-cambiar-estado ocupada";
    }
  }
}

// Acciones de Equipo
async function cambiarEstadoEquipo() {
  if (!equipoActualId) {
    alert("Error: No hay equipo seleccionado");
    return;
  }

  const equipo = inventario.find((item) => item.id == equipoActualId);

  if (equipo.estado === "disponible") {
    // Abrir modo para llenar datos de ocupación
    const modal = document.getElementById("modalCambiarEstado");
    if (modal) {

      document.getElementById("ce_nota").value = "";
      document.getElementById("ce_encargado").value = equipo.encargado || "";
      document.getElementById("ce_descripcion").value = equipo.descripcion_equipo || "";


      const selDepto = document.getElementById("ce_departamento");
      if (selDepto) selDepto.value = equipo.departamento || "";


      const selArea = document.getElementById("ce_area");
      if (selArea) selArea.value = equipo.area || "";

      modal.style.display = "flex";
    }
  } else {
    // Si pasa a disponible, confirmar directamente
    if (!confirm("¿Marcar este equipo como DISPONIBLE?")) return;

    try {
      const formData = new FormData();
      formData.append("id", equipoActualId);

      const response = await fetch("../php/cambiar_estado.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        await cargarInventario();
        mostrarDetalleEquipo(equipoActualId);
        alert("✅ Equipo marcado como DISPONIBLE");
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cambiar el estado");
    }
  }
}

// Función para confirmar el cambio de estado desde el modo
async function confirmarCambioEstado(event) {
  event.preventDefault();

  const nota = document.getElementById("ce_nota").value;
  const enc = document.getElementById("ce_encargado").value;
  const depto = document.getElementById("ce_departamento").value;
  const area = document.getElementById("ce_area").value;
  const descEq = document.getElementById("ce_descripcion").value;

  try {
    const formData = new FormData();
    formData.append("id", equipoActualId);
    formData.append("nota", nota);
    formData.append("encargado", enc);
    formData.append("departamento", depto);
    formData.append("area", area);
    formData.append("descripcion_equipo", descEq);

    const response = await fetch("../php/cambiar_estado.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      cerrarModalEstado();
      await cargarInventario();
      mostrarDetalleEquipo(equipoActualId);
      alert("✅ Equipo marcado como OCUPADA");
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cambiar el estado");
  }
}

function cerrarModalEstado() {
  const modal = document.getElementById("modalCambiarEstado");
  if (modal) {
    modal.style.display = "none";
    const form = document.getElementById("formCambiarEstado");
    if (form) form.reset();
  }
}

async function agregarEquipo(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  // Lógica de respaldo para descripción si está ocupada
  if (formData.get("estado") === "ocupada" && !formData.get("descripcion_equipo")) {
    formData.set("descripcion_equipo", formData.get("nota"));
  }

  try {
    const response = await fetch("../php/agregar_equipo.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      alert("Equipo agregado exitosamente");
      cerrarModal();
      cargarInventario();
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al conectar con el servidor");
  }
}

// 6. Funciones de Administración
const ADMIN_USER = "admin";
const ADMIN_PASS = "MyCard2026";

function abrirModal() {
  const modalAuth = document.getElementById("modalAuth");
  if (modalAuth) modalAuth.style.display = "flex";
}

function cerrarModal() {
  const modalAgregar = document.getElementById("modalAgregar");
  if (modalAgregar) {
    modalAgregar.style.display = "none";
    const form = document.getElementById("formAgregar");
    if (form) form.reset();
  }
}

function cerrarModalAuth() {
  const modalAuth = document.getElementById("modalAuth");
  if (modalAuth) {
    modalAuth.style.display = "none";
    const form = document.getElementById("formAuth");
    if (form) form.reset();
    const errorMsg = document.getElementById("error-message");
    if (errorMsg) errorMsg.style.display = "none";
  }
}

function verificarCredenciales(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    cerrarModalAuth();
    const modalAgregar = document.getElementById("modalAgregar");
    if (modalAgregar) modalAgregar.style.display = "flex";
    toggleMotivoUso("disponible");
  } else {
    const errorMsg = document.getElementById("error-message");
    if (errorMsg) errorMsg.style.display = "block";
    const passInput = document.getElementById("password");
    if (passInput) {
      passInput.value = "";
      passInput.focus();
    }
  }
}

// 7. Utilidades de Tabla y Exportación
function cargarTabla() {
  const tbody = document.getElementById("inventarioBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  inventario.forEach((item) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", item.id);
    tr.setAttribute("data-estado", item.estado);

    let estadoStyle = "";
    let estadoTexto = item.estado;
    if (item.estado === "disponible") {
      estadoStyle = 'style="color: #10b981; font-weight: 600;"';
      estadoTexto = "Disponible";
    } else if (item.estado === "ocupada") {
      estadoStyle = 'style="color: #f59e0b; font-weight: 600;"';
      estadoTexto = "Ocupada";
    }

    tr.innerHTML = `
            <td>${formatearId(item.id)}</td>
            <td><strong>${item.nombre}</strong></td>
            <td>${item.tipo}</td>
            <td>${item.marca}</td>
            <td>${item.modelo}</td>
            <td>${item.encargado || "N/A"}</td>
            <td>${item.departamento || "N/A"}</td>
            <td>${item.area || "N/A"}</td>
            <td>${item.descripcion_equipo || "Sin descripción"}</td>
            <td ${estadoStyle}>${estadoTexto}</td>
        `;
    tbody.appendChild(tr);
  });
}

function filtrarTabla() {
  const searchTerm = document.getElementById("searchBox").value.toLowerCase();
  const rows = document.querySelectorAll("#inventarioBody tr");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

function exportarDatos() {
  if (inventario.length === 0) {
    alert("No hay datos para exportar");
    return;
  }

  let csv = "ID,Nombre,Tipo,Marca,Modelo,Encargado,Departamento,Area,Descripción Equipo,Estado\n";

  inventario.forEach((item) => {
    csv += `${item.id},"${item.nombre}","${item.tipo}","${item.marca}","${item.modelo}","${item.encargado || "N/A"}","${item.departamento || "N/A"}","${item.area || "N/A"}","${item.descripcion_equipo || "Sin descripción"}","${item.estado || "N/A"}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventario_pcs_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
}

// 8. Utilidades Misceláneas
function formatearId(id) {
  return String(id).padStart(4, "0");
}

function obtenerParametroURL(nombre) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nombre);
}

function obtenerTextoEstado(estado) {
  const estados = { disponible: "Disponible", ocupada: "Ocupada" };
  return estados[estado] || estado;
}

function obtenerColorEstado(estado) {
  const colores = { disponible: "#10b981", ocupada: "#f59e0b" };
  return colores[estado] || "#6b7280";
}

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

const interfazQR = () => {
  window.location.href = "html_qr.html";
};

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
  const modal = document.getElementById("modalAgregar");
  if (event.target == modal) {
    cerrarModal();
  }
};
