function generateApiKey() {
  var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let a = "";
  for (let e = 0; e < 25; e++) {
    var n = Math.floor(Math.random() * t.length);
    a += t[n];
  }
  document.getElementById("apiKeyInput").value = a;
}
new ClipboardJS("[data-clipboard-target]");
