document.addEventListener("DOMContentLoaded", function () {
  // Función que se ejecuta cuando el escaneo es exitoso
  function onScanSuccess(decodeText, decodeResult) {
    console.log("Código escaneado:", decodeText);

    const frame = document.getElementById("scan-frame");
    if (frame) frame.classList.add("detected");

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
      useBarCodeDetectorIfSupported: true,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
      videoConstraints: {
        facingMode: "environment",
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
      },
    },
    onScanSuccess,
    onScanFailure,
  );
});
