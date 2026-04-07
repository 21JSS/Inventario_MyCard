document.addEventListener("DOMContentLoaded", function () {
  // Función que se ejecuta cuando el escaneo es exitoso
  function onScanSuccess(decodeText, decodeResult) {
    console.log("Código escaneado:", decodeText);

    const frame = document.getElementById("scan-frame");
    if (frame) frame.classList.add("detected");
    let equipoId = decodeText;
    try {
      const url = new URL(decodeText);
      const idParam = url.searchParams.get("id");
      if (idParam) {
        equipoId = idParam;
      }
    } catch (e) {

      equipoId = decodeText;
    }

    console.log("ID extraído:", equipoId);

    setTimeout(() => {
      window.location.href = "../html/index.html?id=" + equipoId;
    }, 200);
  }

  function onScanFailure(error) { }

  const html5QrCode = new Html5Qrcode("my-qr-reader");

  html5QrCode.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      useBarCodeDetectorIfSupported: true,
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
      videoConstraints: {
        facingMode: { ideal: "environment" },
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
      },
    },
    onScanSuccess,
    onScanFailure,
  ).catch(function (err) {
    console.error("Error al iniciar el escáner QR:", err);
    const errorMsg = document.getElementById("qr-error-msg");
    if (errorMsg) errorMsg.style.display = "block";
  });
});
