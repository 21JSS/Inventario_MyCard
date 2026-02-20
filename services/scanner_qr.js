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

  function onScanFailure(error) {}

  let htmlscanner = new Html5Qrcode("my-qr-reader");
  htmlscanner.stat(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    onScanSuccess,
    onScanFailure,
  );
});
