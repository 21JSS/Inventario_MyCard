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
                tr.innerHTML = `
                    <td>${log.fecha}</td>
                    <td><strong class="log-username">${log.username}</strong></td>
                    <td class="log-action">${log.accion.replace('_', ' ')}</td>
                    <td>${log.detalles || 'Sin detalle extra'}</td>
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
