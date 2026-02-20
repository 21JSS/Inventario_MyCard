function domReady(fn) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(fn, 1000);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

domReady(function () {
  function onScanSuccess(decodeText) {
    // Al escanear el QR, redirige a la página principal con el ID del equipo
    window.location.href = "../html/index.html?id=" + decodeText;
  }

  function onScanFailure(error) {
    // No hacer nada si no detecta QR entre frames (es normal)
  }

  let htmlscanner = new Html5QrcodeScanner(
    "my-qr-reader",
    {
      fps: 15,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      // Solo modo cámara — elimina la opción de subir archivo y el menú de tipo
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      videoConstraints: {
        facingMode: "environment", // Abre directamente la cámara trasera
      },
    },
    false,
  ); // false = sin logs en consola

  htmlscanner.render(onScanSuccess, onScanFailure);
});
