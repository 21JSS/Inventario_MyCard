// --- Manejo de la Interfaz: Toggles de Password ---
document.addEventListener("DOMContentLoaded", () => {
  // Toggle password genérico del modal de Agregar Equipo
  const togglePassword = document.querySelector("#togglePassword");
  const password = document.querySelector("#password");

  if (togglePassword && password) {
    togglePassword.addEventListener("click", function () {
      const type = password.getAttribute("type") === "password" ? "text" : "password";
      password.setAttribute("type", type);

      this.classList.toggle("bi-eye-slash-fill");
      this.classList.toggle("bi-eye-fill");
    });
  }

  // Toggle password para modal de autenticación de "Cambiar Estado"
  const togglePasswordEstado = document.querySelector("#togglePasswordEstado");
  const passwordEstado = document.querySelector("#password_estado");

  if (togglePasswordEstado && passwordEstado) {
    togglePasswordEstado.addEventListener("click", function () {
      const type = passwordEstado.getAttribute("type") === "password" ? "text" : "password";
      passwordEstado.setAttribute("type", type);

      this.classList.toggle("bi-eye-slash-fill");
      this.classList.toggle("bi-eye-fill");
    });
  }
});

// --- Modal Admin Auth PARA Agregar Equipo ---

/** Abre el modal primario de autenticación */
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

/** Cierra el modal de autenticación primario */
function cerrarModalAuth() {
  const modal = document.getElementById("modalAuth");
  if (modal) {
    modal.style.display = "none";
    restaurarScrollFondo();
  }
}

/** Verifica las credenciales para agregar un nuevo Equipo */
async function verificarCredenciales(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const errMsg = document.getElementById("error-message");

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
    alert("No se pudo conectar con el servidor verificando autorización.");
  }
}

// --- Modal Admin Auth para cambiar el estado del equipo ---

/** Abre el modal de autenticación antes de cambiar estado */
function cambiarEstadoEquipo() {
  if (!equipoActualId) {
    alert("Error: No hay equipo seleccionado");
    return;
  }

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

/** Cierra el modal de autenticación para cambiar estado */
function cerrarModalAuthEstado() {
  const modal = document.getElementById("modalAuthEstado");
  if (modal) {
    modal.style.display = "none";
    restaurarScrollFondo();
  }
}
