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
  // If found you qr code
  function onScanSuccess(decodeText, decodeResult) {
    alert("You Qr is : " + decodeText, decodeResult);
  }

  let htmlscanner = new Html5QrcodeScanner("my-qr-reader", {
    fps: 100,
    qrbox: 250,
    videoConstraints: {
      facingMode: "environment",
    },
    showTorchButtonIfSupported: false,
  });

  htmlscanner.render(onScanSuccess);
});
