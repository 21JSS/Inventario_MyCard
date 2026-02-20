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
  function onScanSuccess(decodeText, decodedResult) {
    try {
      const boundingBox = decodedResult.result.boundingBox;
      if (boundingBox) {
        const canvas = document.getElementById("qr-overlay");
        const ctx = canvas.getContext("2d");
        const video = document.querySelector("video");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 4;
        ctx.strokeRect(
          boundingBox.x,
          boundingBox.y,
          boundingBox.width,
          boundingBox.height,
        );
      }
    } catch (e) {}

    // Redirigir al detalle del equipo
    setTimeout(() => {
      window.location.href = "../html/index.html?id=" + decodeText;
    }, 200);
  }

  function onScanFailure(error) {}

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
