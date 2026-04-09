// ===== UI & MODALS COMPONENT =====
// Contiene las funciones para abrir, cerrar modales y los toggle de UI dentro de los formularios.

/** Abre el modal primario para agregar un equipo */
function abrirModal() {
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
        if(typeof bloquearScrollFondo === "function") bloquearScrollFondo();
    }
}

/** Cierra el modal de agregar equipo limpiando los campos condicionales */
function cerrarModal() {
    const modal = document.getElementById("modalAgregar");
    if (modal) {
      modal.style.display = "none";
      if(typeof restaurarScrollFondo === "function") restaurarScrollFondo();
      
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

/** Cierra el modal de cambiar estado */
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

/** Toggles para mostrar/ocultar input de IP en Agregar */
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
  
/** Toggles para mostrar/ocultar input de IP en Cambiar Estado */
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
  
/** Toggles de UI para campos condicionales motivo uso (Oculta descripción y exige nota cuando pasas a ocupado) */
function toggleMotivoUso(estado) {
    const grupoMotivo = document.getElementById("grupoMotivoUso");
    const inputNota = document.getElementById("nota_uso");
    const selectAsignado = document.getElementById("area");
    const inputDescripcion = document.getElementById("descripcion_equipo");
    const grupoDescripcion = inputDescripcion ? inputDescripcion.parentElement : null;
  
    if (!grupoMotivo) return;
  
    if (estado == 0) { // Ocupada
      grupoMotivo.style.display = "block";
      inputNota.setAttribute("required", "required");
      if (selectAsignado) selectAsignado.setAttribute("required", "required");
  
      if (grupoDescripcion) {
        grupoDescripcion.style.display = "none";
        inputDescripcion.removeAttribute("required");
        inputDescripcion.value = "";
      }
    } else { // Disponible
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
  
/** Abre el diálogo directamente o UI de estado sin pedir contraseña porque ya estás logueado */
function cambiarEstadoEquipo() {
    if (!equipoActualId) {
      alert("Error: No hay equipo seleccionado");
      return;
    }
    ejecutarCambioEstado();
}

/** Ejecuta la lógica real de cambio de estado abriendo el UI después de autenticarse */
async function ejecutarCambioEstado() {
    const equipo = inventario.find((item) => item.id == equipoActualId);
  
    if (equipo.estado == 1) { // Estaba disponible -> Va a marcarse como ocupada -> Requiere llenar Form
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
        bloquearScrollFondo();
      }
    } else {
      // Estaba ocupada -> Pasa automágicamente a disponible -> mostrar diálogo UI de confirmación rápida
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
              mostrarAlertaIP("success", "✅ Equipo disponible", "El equipo fue marcado como DISPONIBLE exitosamente.");
            } else {
              mostrarAlertaIP("error", "Error al actualizar", result.error || "");
            }
          } catch (error) {
            mostrarAlertaIP("error", "Error de conexión", "No se pudo conectar con el servidor.");
          }
        }
      );
    }
}

/** Confirrmar Submit Data de Cambio de Estado Modal */
async function confirmarCambioEstado(event) {
    event.preventDefault();
  
    const nota = document.getElementById("ce_nota").value;
    const enc = document.getElementById("ce_encargado").value;
    const depto = document.getElementById("ce_departamento").value;
    const area = document.getElementById("ce_area").value;
    const descEq = document.getElementById("ce_descripcion").value;
    const chkIP = document.getElementById("ce_chk_ip");
    const ipAsignada = chkIP && chkIP.checked ? document.getElementById("ce_ip_asignada").value : "";
  
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
        mostrarAlertaIP("success", "✅ Estado actualizado", "El equipo fue marcado como OCUPADA exitosamente.");
      } else {
        const err = result.error || "";
        if (err.includes("ya está asignada")) {
          mostrarAlertaIP("error", "IP ya está en uso", err);
        } else if (err.includes("no pertenece al rango")) {
          mostrarAlertaIP("warning", "IP de otro departamento", err);
        } else {
          mostrarAlertaIP("error", "Error al actualizar", err);
        }
      }
    } catch (error) {
      mostrarAlertaIP("error", "Error de conexión", "No se pudo conectar con el servidor.");
    }
}
  
/** Modal personalizado nativo (Dialogo YES/NO) */
function mostrarDialogConfirmar(titulo, mensaje, onConfirmar) {
    document.getElementById("dialogConfirmar-titulo").textContent = titulo;
    document.getElementById("dialogConfirmar-mensaje").textContent = mensaje;
  
    const btnSi = document.getElementById("dialogConfirmar-si");
    btnSi.onclick = () => {
      cerrarDialogConfirmar();
      if(typeof onConfirmar === "function") onConfirmar();
    };
  
    document.getElementById("dialogConfirmar").classList.add("visible");
    bloquearScrollFondo();
}
  
/** Cierra el diálogo personalizado */
function cerrarDialogConfirmar() {
    document.getElementById("dialogConfirmar").classList.remove("visible");
    restaurarScrollFondo();
}

// Cerrar modales al dar clic afuera (Overlay background click event)
window.addEventListener('click', function(event) {
    const modalAdd = document.getElementById("modalAgregar");
    if (event.target == modalAdd) cerrarModal();
    
    const modalAuthEst = document.getElementById("modalAuthEstado");
    if (event.target == modalAuthEst) cerrarModalAuthEstado();
});
