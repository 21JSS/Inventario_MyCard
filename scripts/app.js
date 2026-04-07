let inventario = [];
let departamentosDB = [];
let equipoActualId = null;
let filtroActivo = "todos";

function bloquearScrollFondo() {
  const scrollY = window.scrollY || window.pageYOffset;
  document.body.style.top = `-${scrollY}px`;
  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
}

function restaurarScrollFondo() {
  const scrollY = Math.abs(parseInt(document.body.style.top || "0", 10));
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, scrollY);
}

window.onload = function () {
  cargarInventario();
  cargarDepartamentos();
};

// Abre el modal de agregar equipo (previa autenticación) //
function abrirModal() {
  const modalAuth = document.getElementById("modalAuth");
  if (modalAuth) {
    modalAuth.style.display = "flex";
    bloquearScrollFondo();

    const formAuth = document.getElementById("formAuth");
    if (formAuth) formAuth.reset();
    const errMsg = document.getElementById("error-message");
    if (errMsg) errMsg.style.display = "none";

    setTimeout(() => {
      const usr = document.getElementById("username");
      if (usr) usr.focus();
    }, 100);
  }
}

// Cierra el modal de autenticación //
function cerrarModalAuth() {
  const modal = document.getElementById("modalAuth");
  if (modal) {
    modal.style.display = "none";
    restaurarScrollFondo();
  }
}

// Verifica las credenciales del administrador.

async function verificarCredenciales(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const errMsg = document.getElementById("error-message");

  // Preguntar al servidor si las credenciales son correctas
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  try {
    const response = await fetch("../php/login.php", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (result.success) {
      cerrarModalAuth();
      const modalAgregar = document.getElementById("modalAgregar");
      if (modalAgregar) {
        const formAgregar = document.getElementById("formAgregar");
        if (formAgregar) formAgregar.reset();
        const grupoIP = document.getElementById("grupoIP");
        if (grupoIP) grupoIP.style.display = "none";
        const grupoMotivoUso = document.getElementById("grupoMotivoUso");
        if (grupoMotivoUso) grupoMotivoUso.style.display = "none";
        const ipInput = document.getElementById("ip_asignada");
        if (ipInput) ipInput.removeAttribute("required");
        modalAgregar.style.display = "flex";
        bloquearScrollFondo();
      }
    } else {
      if (errMsg) errMsg.style.display = "block";
      document.getElementById("password").value = "";
      document.getElementById("password").focus();
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("No se pudo conectar con el servidor");
  }
}

/** Cierra el modal de agregar equipo */
function cerrarModal() {
  const modal = document.getElementById("modalAgregar");
  if (modal) {
    modal.style.display = "none";
    restaurarScrollFondo();
    const form = document.getElementById("formAgregar");
    if (form) form.reset();
    // Limpiar campos condicionales
    const grupoIP = document.getElementById("grupoIP");
    if (grupoIP) grupoIP.style.display = "none";
    const grupoMotivoUso = document.getElementById("grupoMotivoUso");
    if (grupoMotivoUso) grupoMotivoUso.style.display = "none";
    const ipInput = document.getElementById("ip_asignada");
    if (ipInput) {
      ipInput.removeAttribute("required");
      ipInput.value = "";
    }
  }
}

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

// Toggle password para modal de autenticación de cambio de estado
const togglePasswordEstado = document.querySelector("#togglePasswordEstado");
const passwordEstado = document.querySelector("#password_estado");

if (togglePasswordEstado && passwordEstado) {
  togglePasswordEstado.addEventListener("click", function () {
    const type =
      passwordEstado.getAttribute("type") === "password" ? "text" : "password";
    passwordEstado.setAttribute("type", type);

    this.classList.toggle("bi-eye-slash-fill");
    this.classList.toggle("bi-eye-fill");
  });
}

// Función para mostrar/ocultar el campo de IP en el modal Agregar Equipo
function toggleCampoIP() {
  const chk = document.getElementById("chk_asignar_ip");
  const grupoIP = document.getElementById("grupoIP");
  const inputIP = document.getElementById("ip_asignada");

  if (chk.checked) {
    grupoIP.style.display = "block";
    inputIP.setAttribute("required", "required");
    inputIP.focus();
  } else {
    grupoIP.style.display = "none";
    inputIP.removeAttribute("required");
    inputIP.value = "";
  }
}

// Función para mostrar/ocultar el campo de IP en el modal Cambiar Estado
function toggleCampoIPEstado() {
  const chk = document.getElementById("ce_chk_ip");
  const grupoIP = document.getElementById("ce_grupoIP");
  const inputIP = document.getElementById("ce_ip_asignada");

  if (chk.checked) {
    grupoIP.style.display = "block";
    inputIP.setAttribute("required", "required");
    inputIP.focus();
  } else {
    grupoIP.style.display = "none";
    inputIP.removeAttribute("required");
    inputIP.value = "";
  }
}

// Función para mostrar/ocultar el motivo de uso en el formulario de agregar
function toggleMotivoUso(estado) {
  const grupoMotivo = document.getElementById("grupoMotivoUso");
  const inputNota = document.getElementById("nota_uso");
  const selectAsignado = document.getElementById("area");
  const inputDescripcion = document.getElementById("descripcion_equipo");
  const grupoDescripcion = inputDescripcion
    ? inputDescripcion.parentElement
    : null;

  if (!grupoMotivo) return;

  if (estado == 0) {
    // ocupada
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
      departamentosDB = result.departamentos || [];

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
      "No se pudo conectar con la base de datos. Asegúrate de que el servidor esté corriendo.",
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
        estado == 1
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
  if (detDepto)
    detDepto.textContent = (equipo.departamento || "No asignado").toUpperCase();

  const detArea = document.getElementById("detalle-area");
  if (detArea)
    detArea.textContent = (equipo.area || "No asignado").toUpperCase();

  const detEnc = document.getElementById("detalle-encargado");
  if (detEnc)
    detEnc.textContent = (equipo.encargado || "No asignado").toUpperCase();

  document.getElementById("detalle-descripcion").textContent =
    equipo.descripcion_equipo || "Sin descripción";

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

// Abre el modal de autenticación antes de cambiar estado //
function cambiarEstadoEquipo() {
  if (!equipoActualId) {
    alert("Error: No hay equipo seleccionado");
    return;
  }

  // Abrir modal de autenticación para cambiar estado
  const modalAuth = document.getElementById("modalAuthEstado");
  if (modalAuth) {
    modalAuth.style.display = "flex";
    bloquearScrollFondo();
    const formAuth = document.getElementById("formAuthEstado");
    if (formAuth) formAuth.reset();
    const errMsg = document.getElementById("error-message-estado");
    if (errMsg) errMsg.style.display = "none";
    setTimeout(() => {
      const usr = document.getElementById("username_estado");
      if (usr) usr.focus();
    }, 100);
  }
}

// Cierra el modal de autenticación para cambiar estado //
function cerrarModalAuthEstado() {
  const modal = document.getElementById("modalAuthEstado");
  if (modal) {
    modal.style.display = "none";
    restaurarScrollFondo();
  }
}

//Verifica credenciales y luego ejecuta el cambio de estado //
async function verificarCredencialesEstado(event) {
  event.preventDefault();
  const username = document.getElementById("username_estado").value.trim();
  const password = document.getElementById("password_estado").value;
  const errMsg = document.getElementById("error-message-estado");

  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  try {
    const response = await fetch("../php/login.php", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (result.success) {
      cerrarModalAuthEstado();
      ejecutarCambioEstado();
    } else {
      if (errMsg) errMsg.style.display = "block";
      document.getElementById("password_estado").value = "";
      document.getElementById("password_estado").focus();
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("No se pudo conectar con el servidor");
  }
}

/** Ejecuta la lógica real de cambio de estado (después de autenticarse) */
async function ejecutarCambioEstado() {
  const equipo = inventario.find((item) => item.id == equipoActualId);

  if (equipo.estado == 1) {
    // Abrir modo para llenar datos de ocupación
    const modal = document.getElementById("modalCambiarEstado");
    if (modal) {
      document.getElementById("ce_nota").value = "";
      document.getElementById("ce_encargado").value = equipo.encargado || "";
      document.getElementById("ce_descripcion").value =
        equipo.descripcion_equipo || "";

      const selDepto = document.getElementById("ce_departamento");
      if (selDepto) selDepto.value = equipo.departamento || "";

      const selArea = document.getElementById("ce_area");
      if (selArea) selArea.value = equipo.area || "";

      modal.style.display = "flex";
      bloquearScrollFondo();
    }
  } else {
    // Pasa a disponible → mostrar diálogo de confirmación personalizado
    mostrarDialogConfirmar(
      "¿Marcar como Disponible?",
      `El equipo "${equipo.nombre}" quedará libre y se borrarán sus datos de asignación.`,
      async () => {
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
            mostrarAlertaIP(
              "success",
              "✅ Equipo disponible",
              "El equipo fue marcado como DISPONIBLE exitosamente.",
              null,
            );
          } else {
            mostrarAlertaIP(
              "error",
              "Error al actualizar",
              result.error || "",
              null,
            );
          }
        } catch (error) {
          console.error("Error:", error);
          mostrarAlertaIP(
            "error",
            "Error de conexión",
            "No se pudo conectar con el servidor.",
            null,
          );
        }
      },
    );
  }
}

//Diálogo de confirmación personalizado //

function mostrarDialogConfirmar(titulo, mensaje, onConfirmar) {
  document.getElementById("dialogConfirmar-titulo").textContent = titulo;
  document.getElementById("dialogConfirmar-mensaje").textContent = mensaje;

  // Asignar el callback al botón Sí
  const btnSi = document.getElementById("dialogConfirmar-si");
  btnSi.onclick = () => {
    cerrarDialogConfirmar();
    onConfirmar();
  };

  document.getElementById("dialogConfirmar").classList.add("visible");
  bloquearScrollFondo();
}

function cerrarDialogConfirmar() {
  document.getElementById("dialogConfirmar").classList.remove("visible");
  restaurarScrollFondo();
}

// Función para confirmar el cambio de estado desde el modal
async function confirmarCambioEstado(event) {
  event.preventDefault();

  const nota = document.getElementById("ce_nota").value;
  const enc = document.getElementById("ce_encargado").value;
  const depto = document.getElementById("ce_departamento").value;
  const area = document.getElementById("ce_area").value;
  const descEq = document.getElementById("ce_descripcion").value;
  const chkIP = document.getElementById("ce_chk_ip");
  const ipAsignada =
    chkIP && chkIP.checked
      ? document.getElementById("ce_ip_asignada").value
      : "";

  try {
    const formData = new FormData();
    formData.append("id", equipoActualId);
    formData.append("nota", nota);
    formData.append("encargado", enc);
    formData.append("departamento", depto);
    formData.append("area", area);
    formData.append("descripcion_equipo", descEq);
    formData.append("ip_asignada", ipAsignada);

    const response = await fetch("../php/cambiar_estado.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      cerrarModalEstado();
      await cargarInventario();
      mostrarDetalleEquipo(equipoActualId);
      mostrarAlertaIP(
        "success",
        "✅ Estado actualizado",
        "El equipo fue marcado como OCUPADA exitosamente.",
        null,
      );
    } else {
      const err = result.error || "";
      if (err.includes("ya está asignada")) {
        mostrarAlertaIP("error", "IP ya está en uso", err, null);
      } else if (err.includes("no pertenece al rango")) {
        mostrarAlertaIP("warning", "IP de otro departamento", err, null);
      } else {
        mostrarAlertaIP("error", "Error al actualizar", err, null);
      }
    }
  } catch (error) {
    console.error("Error:", error);
    mostrarAlertaIP(
      "error",
      "Error de conexión",
      "No se pudo conectar con el servidor.",
      null,
    );
  }
}

function cerrarModalEstado() {
  const modal = document.getElementById("modalCambiarEstado");
  if (modal) {
    modal.style.display = "none";
    restaurarScrollFondo();
    const form = document.getElementById("formCambiarEstado");
    if (form) form.reset();
    // Resetear checkbox e IP
    const chk = document.getElementById("ce_chk_ip");
    if (chk) chk.checked = false;
    const grupoIP = document.getElementById("ce_grupoIP");
    if (grupoIP) grupoIP.style.display = "none";
    const inputIP = document.getElementById("ce_ip_asignada");
    if (inputIP) inputIP.removeAttribute("required");
  }
}

async function agregarEquipo(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  // Lógica de respaldo para descripción si está ocupada
  if (formData.get("estado") == 0 && !formData.get("descripcion_equipo")) {
    formData.set("descripcion_equipo", formData.get("nota"));
  }

  try {
    const response = await fetch("../php/agregar_equipo.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      cerrarModal();
      cargarInventario();
      mostrarAlertaIP(
        "success",
        "✅ Equipo agregado",
        "El equipo fue registrado exitosamente en el inventario.",
        null,
      );
    } else {
      // Detectar si el error es de IP para usar el cuadro personalizado
      const err = result.error || "";
      if (err.includes("ya está asignada")) {
        mostrarAlertaIP("error", "IP ya está en uso", err, null);
      } else if (err.includes("no pertenece al rango")) {
        mostrarAlertaIP("warning", "IP de otro departamento", err, null);
      } else {
        mostrarAlertaIP("error", "Error al guardar", err, null);
      }
    }
  } catch (error) {
    console.error("Error:", error);
    mostrarAlertaIP(
      "error",
      "Error de conexión",
      "No se pudo conectar con el servidor.",
      null,
    );
  }
}

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
    //
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
}

function filtrarTabla() {
  const searchTerm = document.getElementById("searchBox").value.toLowerCase();
  const rows = document.querySelectorAll("#inventarioBody tr");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? "" : "none";
  });
}



// Utilidades Misceláneas//
function formatearId(id) {
  return String(id).padStart(4, "0");
}

function obtenerParametroURL(nombre) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nombre);
}

function obtenerTextoEstado(estado) {
  const estados = { 1: "Disponible", 0: "Ocupada" };
  return estados[estado] || estado;
}

function obtenerColorEstado(estado) {
  const colores = { 1: "#10b981", 0: "#f59e0b" };
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

    const nombreEquipo =
      inventario.find((item) => item.id == equipoId)?.nombre || "Equipo";
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

  // Cerrar modal de auth estado al hacer clic fuera
  const modalAuthEst = document.getElementById("modalAuthEstado");
  if (event.target == modalAuthEst) {
    cerrarModalAuthEstado();
  }

};

// Cargar departamentos desde la BD
function cargarDepartamentos() {
  fetch("../php/obtener_departamentos.php")
    .then((res) => res.json())
    .then((deptos) => {
      const selects = document.querySelectorAll(
        "#departamento, #ce_departamento",
      );
      selects.forEach((select) => {
        // Guardar solo la primera opción ("Seleccionar departamento...")
        const primeraOpcion = select.options[0];
        select.innerHTML = "";
        select.appendChild(primeraOpcion);

        deptos.forEach((d) => {
          const option = document.createElement("option");
          option.value = d.id;
          option.textContent = d.nombre;
          option.dataset.nombre = d.nombre;
          select.appendChild(option);
        });
      });
    });
}

// Cargar áreas según departamento
function cargarAreas(selectDepto, areaSelectId) {
  const deptoId = selectDepto.value;
  const selectArea = document.getElementById(areaSelectId);

  selectArea.innerHTML = '<option value="">Cargando áreas...</option>';

  if (!deptoId) {
    selectArea.innerHTML =
      '<option value="">Primero selecciona un departamento...</option>';
    return;
  }

  fetch("../php/obtener_areas.php?departamento_id=" + deptoId)
    .then((res) => res.json())
    .then((areas) => {
      selectArea.innerHTML = '<option value="">Seleccionar área...</option>';
      areas.forEach((a) => {
        const option = document.createElement("option");
        option.value = a.id;
        option.textContent = a.nombre;
        option.dataset.nombre = a.nombre;
        selectArea.appendChild(option);
      });
    });
}
// Obtener IP disponible según el departamento seleccionado (formulario Agregar)
function cargarIPDisponibleDepto(selectDepto) {
  const deptoId = selectDepto.value;
  if (!deptoId) return;

  fetch(
    "../php/obtener_ip_por_depto.php?departamento_id=" +
      encodeURIComponent(deptoId),
  )
    .then((res) => res.json())
    .then((data) => {
      const inputIP = document.getElementById("ip_asignada");
      const checkbox = document.getElementById("chk_asignar_ip");

      if (data.ip_disponible) {
        inputIP.value = data.ip_disponible;
        inputIP.placeholder = "Rango: " + data.rango;
        checkbox.checked = true;
        document.getElementById("grupoIP").style.display = "block";
      } else {
        inputIP.value = "";
        inputIP.placeholder = "No hay IPs disponibles en este rango";
      }
    });
}

// Obtener IP disponible según el departamento seleccionado (formulario Cambiar Estado)
function cargarIPDisponibleDeptoEstado(selectDepto) {
  const deptoId = selectDepto.value;
  if (!deptoId) return;

  fetch(
    "../php/obtener_ip_por_depto.php?departamento_id=" +
      encodeURIComponent(deptoId),
  )
    .then((res) => res.json())
    .then((data) => {
      const inputIP = document.getElementById("ce_ip_asignada");
      const checkbox = document.getElementById("ce_chk_ip");

      if (data.ip_disponible) {
        inputIP.value = data.ip_disponible;
        inputIP.placeholder = "Rango: " + data.rango;
        checkbox.checked = true;
        document.getElementById("ce_grupoIP").style.display = "block";
      } else {
        inputIP.value = "";
        inputIP.placeholder = "No hay IPs disponibles en este rango";
      }
    });
}

// Alerta personalizada de IP //

function mostrarAlertaIP(tipo, titulo, mensaje, rango) {
  const box = document.getElementById("alertaIP-box");
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
    rangoBox.style.display = "block";
    document.getElementById("alertaIP-rango").textContent = rango;
  } else {
    rangoBox.style.display = "none";
  }

  document.getElementById("alertaIP").classList.add("visible");
  bloquearScrollFondo();
}

function cerrarAlertaIP() {
  document.getElementById("alertaIP").classList.remove("visible");
  restaurarScrollFondo();
}

function validarIPManual(inputIP, areaSelectId) {
  const ip = inputIP.value.trim();
  const area = document.getElementById(areaSelectId).value;

  if (!ip || !area) return;

  const url = `../php/obtener_ip_disponible.php?area=${encodeURIComponent(area)}&validar_ip=${encodeURIComponent(ip)}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const v = data.validacion;
      if (!v) return;

      if (v.ocupada) {
        mostrarAlertaIP(
          "error",
          "IP ya está en uso",
          "Esta dirección IP ya se encuentra asignada a otro equipo. Elige la sugerida o introduce otra.",
          data.rango,
        );
      } else if (!v.en_rango) {
        const detalle = v.area_pertenece
          ? `Esta IP pertenece al área "${v.area_pertenece}" (rango: ${v.rango_pertenece}).`
          : "Esta IP no pertenece al rango del área seleccionada.";

        mostrarAlertaIP(
          "warning",
          "IP de otro departamento",
          detalle,
          data.rango,
        );
      }
    });
}

//escapa caracteres especiales para evitar XSS
function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// se filttran los datos antes de ser mostrados en la tabla
