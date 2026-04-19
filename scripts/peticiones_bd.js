
// Este archivo maneja todas las peticiones asíncronas HTTP (fetch) hacia el Backend PHP.

/** Carga de Inventario Principal y estadísticas globales */
async function cargarInventario() {
  const equipoId = obtenerParametroURL("id");
  const userRole = localStorage.getItem("user_role");

  // Modo Público (sin login) cuando se lee un código QR
  if (equipoId && !userRole) {
    try {
      const response = await fetch("../php/api_equipo_publico.php?id=" + encodeURIComponent(equipoId));
      const result = await response.json();

      if (result.success) {
        inventario = [result.data]; // Fake inventario array to mock single view
        
        // Esconder toda la dashboard
        const stats = document.querySelector(".stats-container");
        if (stats) stats.style.display = "none";
        const controls = document.getElementById("controls");
        if (controls) controls.style.display = "none";
        const tableContainer = document.getElementById("tableContainer");
        if (tableContainer) tableContainer.style.display = "none";

        if (typeof mostrarDetalleEquipo === "function") {
          mostrarDetalleEquipo(equipoId);
        }
      } else {
        alert("Equipo no encontrado en la base de datos pública: " + (result.error || ""));
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con la base de datos.");
    }
    return;
  }

  // Flujo Normal Autenticado
  try {
    const response = await fetch("../php/api_inventario.php");
    
    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }
    
    const result = await response.json();

    if (result.success) {
      inventario = result.data;
      departamentosDB = result.departamentos || [];

      const totalEquipos = document.getElementById("totalEquipos");
      if (totalEquipos) totalEquipos.textContent = result.stats.total_equipos;

      const totalDisp = document.getElementById("totalDisponibles");
      if (totalDisp) totalDisp.textContent = result.stats.total_disponibles;

      const totalOcup = document.getElementById("totalOcupadas");
      if (totalOcup) totalOcup.textContent = result.stats.total_ocupadas;

      if (typeof cargarTabla === "function") cargarTabla();

      // Si hay un ID en la URL (desde QR), mostrar vista de detalle
      if (equipoId && typeof mostrarDetalleEquipo === "function") {
        mostrarDetalleEquipo(equipoId);
      }
    } else {
      console.error("Error al cargar datos:", result.error);
      alert("Error al cargar los datos del inventario: " + result.error);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    alert("No se pudo conectar con la base de datos. Asegúrate de que el servidor esté corriendo.");
  }
}

/** Carga la paleta de opciones de los selectores de Departamentos */
function cargarDepartamentos() {
  fetch("../php/obtener_departamentos.php")
    .then((res) => res.json())
    .then((deptos) => {
      const selects = document.querySelectorAll("#departamento, #ce_departamento");
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

/** Carga áreas dinámicamente según el departamento padre */
function cargarAreas(selectDepto, areaSelectId) {
  const deptoId = selectDepto.value;
  const selectArea = document.getElementById(areaSelectId);
  if (!selectArea) return;

  selectArea.innerHTML = '<option value="">Cargando áreas...</option>';

  if (!deptoId) {
    selectArea.innerHTML = '<option value="">Primero selecciona un departamento...</option>';
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

/** Obtener IP disponible según departamento en modal Agregar */
function cargarIPDisponibleDepto(selectDepto) {
  const deptoId = selectDepto.value;
  if (!deptoId) return;

  fetch("../php/obtener_ip_por_depto.php?departamento_id=" + encodeURIComponent(deptoId))
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

/** Obtener IP disponible según departamento en modal Cambiar Estado */
function cargarIPDisponibleDeptoEstado(selectDepto) {
  const deptoId = selectDepto.value;
  if (!deptoId) return;

  fetch("../php/obtener_ip_por_depto.php?departamento_id=" + encodeURIComponent(deptoId))
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

/** Verificación de IP en el backend ante ingreso manual */
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
          data.rango
        );
      } else if (!v.en_rango) {
        const detalle = v.area_pertenece
          ? `Esta IP pertenece al área "${v.area_pertenece}" (rango: ${v.rango_pertenece}).`
          : "Esta IP no pertenece al rango del área seleccionada.";

        mostrarAlertaIP("warning", "IP de otro departamento", detalle, data.rango);
      }
    });
}

/** Inserta de un equipo nuevo a Base de Datos de manera asíncrona */
async function agregarEquipo(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  // Lógica de respaldo para descripción
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
      if (typeof cerrarModal === "function") cerrarModal();
      cargarInventario();
      mostrarAlertaIP("success", "✅ Equipo agregado", "El equipo fue registrado exitosamente.");
    } else {
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
    mostrarAlertaIP("error", "Error de conexión", "No se pudo conectar con el servidor.");
  }
}
