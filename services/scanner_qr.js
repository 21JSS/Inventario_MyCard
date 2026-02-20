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

    // Redirigir al detalle del equipo
    setTimeout(() => {
      window.location.href = "../html/index.html?id=" + decodeText;
    }, 200);
  }

  function onScanFailure(error) { }

  const html5QrCode = new Html5Qrcode("my-qr-reader");

  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 60,
      useBarCodeDetectorIfSupported: true, // Nativo en Chrome/Android (muy rápido)
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true, // Activa BarcodeDetector en versiones antiguas
      },
      videoConstraints: {
        facingMode: "environment",
        // 640x480 procesa más rápido que 1280x720 en dispositivos lentos
        // porque hay menos píxeles que analizar por frame
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
      },
    },
    onScanSuccess,
    onScanFailure,
  );
});
