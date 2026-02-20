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
      fps: 60,
      qrbox: { with: 200, height: 200 },
      rememberLastUsedCamera: true,
      useBarCodeDetectorIfSupported: true, //  API nativa del navegador
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      videoConstraints: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
    false,
  );

  htmlscanner.render(onScanSuccess, onScanFailure);
});
