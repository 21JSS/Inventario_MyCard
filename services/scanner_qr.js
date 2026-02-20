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
    // Intentar dibujar el cuadrito si hay boundingBox disponible
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
    } catch (e) {
      // Si no hay boundingBox disponible, se ignora y redirige igual
    }

    // Redirigir al detalle del equipo después de 300ms
    setTimeout(() => {
      window.location.href = "../html/index.html?id=" + decodeText;
    }, 300);
  }

  function onScanFailure(error) {
    // No hacer nada si no detecta QR entre frames (es normal)
  }

  const html5QrCode = new Html5Qrcode("my-qr-reader");
  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 60,
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
