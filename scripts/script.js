let inventario = [];
let equipoActualId = null;
let filtroActivo = "todos";

window.onload = function () {
  cargarInventario();

  // Toggle mostrar/ocultar contraseña
  const toggleBtn = document.querySelector("#togglePassword");
  const passwordInput = document.querySelector("#password");

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", function () {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.classList.toggle("bi-eye-slash-fill");
      this.classList.toggle("bi-eye-fill");
    });
  }
};

// Función para obtener parámetros de la URL
function obtenerParametroURL(nombre) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nombre);
}

async function cargarInventario() {
  try {
    const response = await fetch("api_inventario.php");
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
      "No se pudo conectar con la base de datos. Asegúrate de que el servidor esté corriendo.",
    );
  }
}

function filtrarPorEstado(estado) {
  filtroActivo = estado;

  // Actualizar indicador de filtro
  if (estado === "todos") {
    document.getElementById("filtroIndicador").style.display = "none";
  } else if (estado === "disponible") {
    document.getElementById("filtroTexto").textContent =
      "🟢 Mostrando: Solo equipos disponibles";
    document.getElementById("filtroIndicador").style.display = "block";
  } else if (estado === "ocupada") {
    document.getElementById("filtroTexto").textContent =
      "🟡 Mostrando: Solo equipos ocupadas";
    document.getElementById("filtroIndicador").style.display = "block";
  }

  // Filtrar la tabla
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
  document.querySelector(".stats-container").style.display = "none";
  document.getElementById("controls").style.display = "none";
  document.getElementById("tableContainer").style.display = "none";

  // Mostrar vista de detalle
  document.getElementById("detalleEquipo").style.display = "block";

  // Llenar datos
  document.getElementById("detalle-nombre").textContent = equipo.nombre;
  document.getElementById("detalle-id").textContent = equipo.id;
  document.getElementById("detalle-tipo").textContent = equipo.tipo;
  document.getElementById("detalle-marca").textContent = equipo.marca;
  document.getElementById("detalle-modelo").textContent = equipo.modelo;
  document.getElementById("detalle-descripcion").textContent =
    equipo.descripcion || "Sin descripción";

  // Estado con color
  const estadoBadge = document.getElementById("detalle-estado");
  estadoBadge.textContent = obtenerTextoEstado(equipo.estado);
  estadoBadge.style.backgroundColor = obtenerColorEstado(equipo.estado);
  estadoBadge.style.color = "white";

  // Guardar ID actual
  equipoActualId = equipoId;

  // Configurar botón según estado
  const btnCambiar = document.getElementById("btnCambiarEstado");
  if (equipo.estado === "disponible") {
    btnCambiar.textContent = "Marcar como Ocupada";
    btnCambiar.className = "btn-cambiar-estado disponible";
  } else {
    btnCambiar.textContent = "Marcar como Disponible";
    btnCambiar.className = "btn-cambiar-estado ocupada";
  }
}

function obtenerTextoEstado(estado) {
  const estados = {
    disponible: "Disponible",
    ocupada: "Ocupada",
  };
  return estados[estado] || estado;
}

function obtenerColorEstado(estado) {
  const colores = {
    disponible: "#10b981",
    ocupada: "#f59e0b",
  };
  return colores[estado] || "#6b7280";
}

async function cambiarEstadoEquipo() {
  if (!equipoActualId) {
    alert("Error: No hay equipo seleccionado");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("id", equipoActualId);

    const response = await fetch("cambiar_estado.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      await cargarInventario();

      mostrarDetalleEquipo(equipoActualId);

      const mensaje =
        result.nuevo_estado === "disponible"
          ? "✅ Equipo marcado como DISPONIBLE"
          : "✅ Equipo marcado como OCUPADA";
      alert(mensaje);
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cambiar el estado");
  }
}

function regresarInventario() {
  document.getElementById("detalleEquipo").style.display = "none";

  // Restaurar TODAS las secciones de la vista principal
  document.querySelector(".stats-container").style.display = "grid";
  document.getElementById("controls").style.display = "block";
  document.getElementById("tableContainer").style.display = "block";

  window.history.pushState({}, "", "InventarioPCs.html");

  // Scroll al inicio de la página
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const interfazQR = () => {
  window.location.href = "/html/html_qr.html";
};

function abrirModal() {
  document.getElementById("modalAuth").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modalAgregar").style.display = "none";
  document.getElementById("formAgregar").reset();
}

// Credenciales de administrador (configurables)
const ADMIN_USER = "admin";
const ADMIN_PASS = "MyCard2026";

function cerrarModalAuth() {
  document.getElementById("modalAuth").style.display = "none";
  document.getElementById("formAuth").reset();
  document.getElementById("error-message").style.display = "none";
}

function verificarCredenciales(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Credenciales correctas
    cerrarModalAuth();
    document.getElementById("modalAgregar").style.display = "flex";
  } else {
    // Credenciales incorrectas
    document.getElementById("error-message").style.display = "block";
    document.getElementById("password").value = "";
    document.getElementById("password").focus();
  }
}

async function agregarEquipo(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  try {
    const response = await fetch("agregar_equipo.php", {
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

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
  const modal = document.getElementById("modalAgregar");
  if (event.target == modal) {
    cerrarModal();
  }
};

function cargarTabla() {
  const tbody = document.getElementById("inventarioBody");
  tbody.innerHTML = "";

  inventario.forEach((item) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", item.id); // Agregar atributo para identificar la fila
    tr.setAttribute("data-estado", item.estado); // Agregar atributo de estado para filtrado

    // Determinar el color del estado
    let estadoClass = "";
    let estadoTexto = item.estado;
    switch (item.estado) {
      case "disponible":
        estadoClass = 'style="color: #10b981; font-weight: 600;"';
        estadoTexto = "Disponible";
        break;
      case "ocupada":
        estadoClass = 'style="color: #f59e0b; font-weight: 600;"';
        estadoTexto = "Ocupada";
        break;
    }

    tr.innerHTML = `
                    <td>${item.id}</td>
                    <td><strong>${item.nombre}</strong></td>
                    <td>${item.tipo}</td>
                    <td>${item.marca}</td>
                    <td>${item.modelo}</td>
                    <td>${item.descripcion || "Sin descripción"}</td>
                    <td ${estadoClass}>${estadoTexto}</td>
                `;
    tbody.appendChild(tr);
  });
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

    // Remover el mensaje después de 3 segundos
    setTimeout(() => {
      mensaje.style.opacity = "0";
      mensaje.style.transition = "opacity 0.5s";
      setTimeout(() => mensaje.remove(), 500);
    }, 3000);
  }
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

  let csv = "ID,Nombre,Tipo,Marca,Modelo,Descripción,Estado\n";

  inventario.forEach((item) => {
    csv += `${item.id},"${item.nombre}","${item.tipo}","${item.marca}","${item.modelo}","${item.descripcion || "Sin descripción"}","${item.estado || "N/A"}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventario_pcs_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
}
