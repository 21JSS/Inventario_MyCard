// ===== ENTRY POINT (MAIN APP) =====

window.onload = function () {
  // Verificación visual rápida de Roles (RBAC) UI Lock
  const userRole = parseInt(localStorage.getItem("user_role") || "3", 10);
  aplicarRestriccionesUI(userRole);

  if (typeof cargarInventario === "function") {
    cargarInventario();
  } else {
    console.warn("Fallo al cargar cargarInventario()");
  }

  if (typeof cargarDepartamentos === "function") {
    cargarDepartamentos();
  }
};

/** Oculta o pinta botones de la interfaz HTML dependiendo del perfil que accedió */
function aplicarRestriccionesUI(rolId) {
  // Si es Usuario de Consulta (3) o Auditor (4), ocultar edición
  if (rolId > 2) {
    const btnAgregar = document.querySelector("button[onclick='abrirModal()']");
    if(btnAgregar) btnAgregar.style.display = "none";
    
    const btnCambiarEst = document.getElementById("btnCambiarEstado");
    if(btnCambiarEst) btnCambiarEst.style.display = "none";
  }

  // Ocultar exportación a menos que seas Admin(1) o Auditor(4) - Opcional, pero para fines del ejemplo dejaremos full a 1 y 2.
  if (rolId === 3) {
     const btnExportar = document.getElementById("btnExportarExcel");
     if(btnExportar) btnExportar.style.display = "none";
  }

  // Diferenciador visual clave: Botón para entrar a los Logs de Auditoría
  if (rolId === 1 || rolId === 4) {
    const btnAuditor = document.getElementById("btnAuditoria");
    if(btnAuditor) {
      btnAuditor.style.display = "inline-flex";
      btnAuditor.style.alignItems = "center";
      btnAuditor.style.justifyContent = "center";
      btnAuditor.style.gap = "5px";
      btnAuditor.style.marginLeft = "10px";
      btnAuditor.style.padding = "10px 15px";
      btnAuditor.style.border = "none";
      btnAuditor.style.borderRadius = "8px";
      btnAuditor.style.cursor = "pointer";
    }
  }
}

/** Redirecciona a la interfaz de Escaneo QR */
const interfazQR = () => {
  window.location.href = "html_qr.html";
};
