// ===== AUTHENTICATION & SECURITY =====
// Control de inicio de sesión de modales y visibilidad de contraseñas.

// --- Manejo de la Interfaz: Toggles de Password ---
document.addEventListener("DOMContentLoaded", () => {
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
});

/** Función global para destruir la sesión y salir del sistema */
async function cerrarSesion() {
    try {
        const response = await fetch("../php/logout.php");
        if(response.ok) {
            localStorage.removeItem('user_role');
            window.location.href = "login.html";
        }
    } catch (e) {
        console.error("Error al cerrar sesión", e);
    }
}
