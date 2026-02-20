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
  // Función que se ejecuta cuando el escaneo es exitoso
  function onScanSuccess(decodeText, decodeResult) {
    console.log("Código escaneado:", decodeText);

    // Si el texto escaneado es una URL (lo cual debería ser segun tu sistema), redirigimos
    if (decodeText.startsWith('http://') || decodeText.startsWith('https://')) {
      window.location.href = decodeText;
    } else {
      alert("Código detectado: " + decodeText);
    }
  }

  // Inicializar el escáner
  let htmlscanner = new Html5QrcodeScanner("my-qr-reader", {
    fps: 10,
    qrbox: 250, // Corregido de qrbos a qrbox
  });
  htmlscanner.render(onScanSuccess);
});
