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

  // Inicializar el escáner
  let htmlscanner = new Html5QrcodeScanner("my-qr-reader", {
    fps: 15,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
  });

  htmlscanner.render(onScanSuccess, onScanFailure);

  // Lógica para los botones de respaldo (Tomar Foto y Galería)
  function handleFileSelect(e) {
    if (e.target.files.length === 0) return;

    const html5QrCode = new Html5Qrcode("my-qr-reader");
    const imageFile = e.target.files[0];

    // Escanear el archivo de imagen
    html5QrCode.scanFile(imageFile, true)
      .then(onScanSuccess)
      .catch(err => {
        alert("No se pudo leer el QR. Asegúrate de que el código sea claro y esté bien enfocado.");
        console.error("Error al escanear archivo:", err);
      });
  }

  const fileInput = document.getElementById('qr-input-file');
  const galleryInput = document.getElementById('qr-input-file-gallery');

  if (fileInput) fileInput.addEventListener('change', handleFileSelect);
  if (galleryInput) galleryInput.addEventListener('change', handleFileSelect);
});
