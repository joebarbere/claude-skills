/**
 * Mac "Hello" Easter Egg
 *
 * Trigger: Type "hello"
 * Effect:  Classic 1984 Macintosh "hello" in cursive drawn with SVG stroke animation
 *          on a beige background with the original Mac silhouette
 * Dismiss: Click or wait 8 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;

  // "hello" cursive path — hand-drawn Bezier
  var HELLO_PATH = "M 30,80 C 30,40 30,40 30,80 C 30,55 50,55 50,70 " +
    "C 50,55 30,45 55,45 " +
    "C 55,45 55,75 55,75 C 55,45 75,45 75,75 " +
    "C 75,45 95,45 95,75 " +
    "C 95,45 115,45 115,65 C 115,85 85,85 95,65";

  var MAC_SVG =
    '<svg viewBox="0 0 120 140" width="120" height="140" class="ee-mh-mac">' +
    '<rect x="10" y="5" width="100" height="90" rx="8" fill="#c8b88a" stroke="#8a7e5e" stroke-width="2"/>' +
    '<rect x="18" y="13" width="84" height="60" rx="3" fill="#1a3a1a"/>' +
    '<rect x="35" y="80" width="50" height="8" rx="2" fill="#a89870"/>' +
    '<rect x="20" y="100" width="80" height="30" rx="4" fill="#c8b88a" stroke="#8a7e5e" stroke-width="2"/>' +
    '<rect x="30" y="108" width="60" height="14" rx="2" fill="#a89870"/>' +
    '</svg>';

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-mh-screen">' +
        MAC_SVG +
        '<svg viewBox="0 0 145 100" class="ee-mh-text">' +
          '<path d="' + HELLO_PATH + '" class="ee-mh-path" fill="none" stroke="#1a3a1a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
      '</div>',
      "ee-mh-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    // Animate stroke
    var path = overlayEl.querySelector(".ee-mh-path");
    if (path) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.getBoundingClientRect(); // force reflow
      path.style.transition = "stroke-dashoffset 2.5s ease-in-out";
      path.style.strokeDashoffset = "0";
    }

    timer = setTimeout(dismiss, 8000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-mh-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("hello");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-mh-overlay{position:fixed;inset:0;z-index:99999;animation:ee-mh-in 0.5s ease-out}" +
      "@keyframes ee-mh-in{from{opacity:0}to{opacity:1}}" +
      ".ee-mh-out{animation:ee-mh-fade 0.4s ease-in forwards}" +
      "@keyframes ee-mh-fade{to{opacity:0}}" +
      ".ee-mh-screen{width:100%;height:100%;background:#d4c8a0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px}" +
      ".ee-mh-mac{filter:drop-shadow(0 4px 12px rgba(0,0,0,0.2))}" +
      ".ee-mh-text{width:300px;height:200px}" +
      "";
  }

  EasterEggs.register("hello", {
    trigger: "hello",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("hello");
})();
