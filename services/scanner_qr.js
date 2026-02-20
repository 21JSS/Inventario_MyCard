document.addEventListener("DOMContentLoaded", function () {
  // Función que se ejecuta cuando el escaneo es exitoso
  function onScanSuccess(decodeText, decodeResult) {
    console.log("Código escaneado:", decodeText);

    // Si el texto escaneado es una URL (lo cual debería ser segun tu sistema), redirigimos
    if (decodeText.includes("index.html?id=")) {
      // Si ya es una URL completa, redirigir
      window.location.href = decodeText;
    } else if (!isNaN(decodeText)) {
      // Si el QR solo tiene el ID numérico, construir la URL
      window.location.href = "index.html?id=" + decodeText;
    } else {
      // En cualquier otro caso, intentar tratarlo como URL o mostrar alerta
      if (decodeText.startsWith('http')) {
        window.location.href = decodeText;
      } else {
        alert("Código detectado: " + decodeText);
      }
    }

    // Detener el escáner después de un éxito para evitar múltiples redirecciones
    if (typeof htmlscanner !== 'undefined') {
      htmlscanner.clear();
    }
  }

  function onScanFailure(error) {
    // No mostramos errores constantes de escaneo fallido para no saturar la consola
    // console.warn(`Error de escaneo: ${error}`);
  }

  const html5QrCode = new Html5Qrcode("my-qr-reader");
  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      useBarCodeDetectorIfSupported: true, // API nativa del navegador (más rápida)
      videoConstraints: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
    onScanSuccess,
    onScanFailure,
  );
});
