async function fetchLogs() {
    try {
        const response = await fetch("../php/api_logs.php");
        if (response.status === 401 || response.status === 403) {
            alert("Acceso denegado: Necesitas ser Administrador o Auditor.");
            window.location.href = "index.html";
            return;
        }
        const result = await response.json();

        const tbody = document.getElementById("logsBody");
        tbody.innerHTML = "";

        if (result.success) {
            result.data.forEach(log => {
                const tr = document.createElement("tr");
                
                // Mapeo de IDs de rol a nombres legibles con prefijo solicitado
                const roles = {
                    "rol_id 1": "rol de: Administrador",
                    "rol_id 2": "rol de: Técnico de Sistemas",
                    "rol_id 3": "rol de: Usuario de Consulta",
                    "rol_id 4": "rol de: Auditor / Supervisor"
                };

                let detallesFormateados = log.detalles || 'Sin detalle extra';
                
                // Reemplazamos cualquier mención de rol_id X por el nombre real
                Object.keys(roles).forEach(id => {
                    detallesFormateados = detallesFormateados.replace(id, roles[id]);
                });

                tr.innerHTML = `
                    <td>${log.fecha}</td>
                    <td><strong class="log-username">${log.username}</strong></td>
                    <td class="log-action">${log.accion.replace('_', ' ')}</td>
                    <td style="text-align: left; padding-left: 20px;">${detallesFormateados}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4">Error: ${result.error}</td></tr>`;
        }
    } catch (err) {
        console.error(err);
    }
}

window.onload = fetchLogs;
