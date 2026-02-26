async function bloquearPantalla(ip, nombreEquipo = "") {
  const confirmacion = confirm(
    `¿Deseas bloquear la pantalla de este dispositivo${nombreEquipo ? " " + nombreEquipo : ""}?\nIP: ${ip}`,
  );

  if (!confirmacion) return;

  try {
    const formData = new FormData();

    formData.append("ip", ip);

    const response = await fetch("../functions/bloquear_pantalla.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.status === "ok") {
      mostrarNotificacion(
        `Pantalla bloqueada en el dispositivo con la ip:${ip || nombreEquipo}`,
        "Con exito",
      );
    } else {
      mostraraNotificacion(`Error: ${result.mensaje}`, "error");
    }
  } catch (error) {
    mostrarNotificacion(`Error de conexion: ${error.message}`, "error");
  }
}

async function verificarAgenteActivo(ip) {
  try {
    const reponse = await fetch(`http://${ip}:5050/ping`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });

    const data = await reponse.json();

    return data.status === "activo";
  } catch {
    return false;
  }
}

function mostrarNotificacion(mensaje, tipo = "info") {
  alert(mensaje);
}
