document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('login-error');

            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            try {
                const response = await fetch('../php/login.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.success) {
                    // Guardar rol localmente de forma temporal solo para efectos de interfaz gráfica rápida 
                    localStorage.setItem('user_role', result.rol_id); 
                    window.location.href = 'index.html';
                } else {
                    errorMsg.textContent = result.error || 'Credenciales incorrectas';
                    errorMsg.style.display = 'block';
                    document.getElementById('password').value = '';
                }
            } catch (err) {
                console.error(err);
                if (errorMsg) {
                    errorMsg.textContent = 'Error de conexión con el servidor.';
                    errorMsg.style.display = 'block';
                }
            }
        });
    }
});
