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
    const frame = document.getElementById("scan-frame");
    if (frame) frame.classList.add("detected");

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
      useBarCodeDetectorIfSupported: true, // Nativo en Chrome/Android
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true, // Activa versiones antiguas
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
