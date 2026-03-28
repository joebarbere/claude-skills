/**
 * Jurassic Park Easter Egg — Nedry Lockout
 *
 * Trigger: Type "nedry"
 * Effect:  System lockout screen with "Ah ah ah, you didn't say the magic word!"
 * Dismiss: Type "please" or wait 15s
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var dismissTimer = null;
  var floodInterval = null;
  var pleaseBuffer = "";

  var NEDRY_SVG =
    '<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">' +
    '<!-- Glasses -->' +
    '<ellipse cx="42" cy="52" rx="18" ry="14" fill="none" stroke="#0f0" stroke-width="2"/>' +
    '<ellipse cx="78" cy="52" rx="18" ry="14" fill="none" stroke="#0f0" stroke-width="2"/>' +
    '<line x1="60" y1="50" x2="60" y2="50" stroke="#0f0" stroke-width="2"/>' +
    '<!-- Eyes -->' +
    '<circle cx="42" cy="54" r="4" fill="#0f0"/>' +
    '<circle cx="78" cy="54" r="4" fill="#0f0"/>' +
    '<!-- Smirk -->' +
    '<path d="M40,72 Q60,88 80,72" fill="none" stroke="#0f0" stroke-width="2"/>' +
    '<!-- Head outline -->' +
    '<ellipse cx="60" cy="55" rx="42" ry="38" fill="none" stroke="#0f0" stroke-width="1.5"/>' +
    '<!-- Hawaiian shirt collar -->' +
    '<path d="M30,90 L60,105 L90,90" fill="none" stroke="#0f0" stroke-width="1.5"/>' +
    '<path d="M35,95 Q45,100 40,110" fill="none" stroke="#0f0" stroke-width="1" opacity="0.6"/>' +
    '<path d="M85,95 Q75,100 80,110" fill="none" stroke="#0f0" stroke-width="1" opacity="0.6"/>' +
    '<!-- Wagging finger -->' +
    '<g class="ee-jp-finger">' +
    '<line x1="95" y1="35" x2="110" y2="15" stroke="#0f0" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="110" cy="12" r="3" fill="#0f0"/>' +
    '</g>' +
    '</svg>';

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());
    pleaseBuffer = "";

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-jp-scanlines"></div>' +
      '<div class="ee-jp-nedry">' + NEDRY_SVG + '</div>' +
      '<div class="ee-jp-output"></div>' +
      '<div class="ee-jp-hint">type &quot;please&quot; to unlock</div>',
      "ee-jp-overlay"
    );

    var output = overlayEl.querySelector(".ee-jp-output");

    // Flood the screen with the message
    floodInterval = setInterval(function () {
      var line = document.createElement("div");
      line.className = "ee-jp-line";
      line.textContent = "Ah ah ah, you didn't say the magic word!";
      output.appendChild(line);
      // Keep scrolled to bottom
      output.scrollTop = output.scrollHeight;
      // Cap at 100 lines
      if (output.children.length > 100) {
        output.removeChild(output.children[0]);
      }
    }, 180);

    // Click adds extra burst
    overlayEl.addEventListener("click", function (ev) {
      ev.stopPropagation();
      for (var i = 0; i < 5; i++) {
        var line = document.createElement("div");
        line.className = "ee-jp-line ee-jp-line-burst";
        line.textContent = "Ah ah ah!";
        output.appendChild(line);
      }
      output.scrollTop = output.scrollHeight;
    });

    // Listen for "please" typed while overlay is active
    EasterEggs.captureInput(function (e) {
      if (e.key.length === 1) {
        pleaseBuffer += e.key.toLowerCase();
        if (pleaseBuffer.length > 10) pleaseBuffer = pleaseBuffer.slice(-10);
        if (pleaseBuffer.endsWith("please")) {
          deactivate();
        }
      }
    });

    dismissTimer = setTimeout(deactivate, 15000);
  }

  function deactivate() {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
    if (floodInterval) { clearInterval(floodInterval); floodInterval = null; }
    EasterEggs.releaseInput();
    if (overlayEl) {
      overlayEl.classList.add("ee-jp-dismiss");
      var el = overlayEl;
      setTimeout(function () { EasterEggs.removeElement(el); }, 600);
      overlayEl = null;
    }
    EasterEggs._activeEggs.delete("jurassicpark");
  }

  function getCSS() {
    return "" +
      ".ee-jp-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:all;cursor:not-allowed;overflow:hidden;background:#000;font-family:'Courier New',monospace;animation:ee-jp-fadein 0.3s}" +

      /* Scanlines */
      ".ee-jp-scanlines{position:absolute;inset:0;background:repeating-linear-gradient(transparent 0px,transparent 2px,rgba(0,50,0,0.15) 2px,rgba(0,50,0,0.15) 4px);z-index:3;pointer-events:none}" +

      /* Nedry face */
      ".ee-jp-nedry{position:absolute;top:15px;right:30px;width:100px;height:120px;z-index:2;opacity:0.7}" +
      ".ee-jp-finger{animation:ee-jp-wag 0.4s ease-in-out infinite alternate;transform-origin:95px 35px}" +
      "@keyframes ee-jp-wag{0%{transform:rotate(-15deg)}100%{transform:rotate(15deg)}}" +

      /* Output area */
      ".ee-jp-output{position:absolute;top:10px;left:10px;right:140px;bottom:40px;overflow-y:auto;z-index:2;padding:10px}" +
      ".ee-jp-output::-webkit-scrollbar{width:0}" +

      /* Text lines */
      ".ee-jp-line{color:#0f0;font-size:15px;line-height:1.4;text-shadow:0 0 8px rgba(0,255,0,0.6);animation:ee-jp-typein 0.15s}" +
      ".ee-jp-line-burst{color:#0f0;font-weight:bold;font-size:20px}" +
      "@keyframes ee-jp-typein{from{opacity:0;transform:translateX(-5px)}to{opacity:1;transform:translateX(0)}}" +

      /* Hint */
      ".ee-jp-hint{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);color:rgba(0,255,0,0.3);font-size:11px;z-index:2;letter-spacing:2px}" +

      /* Fade in/out */
      "@keyframes ee-jp-fadein{from{opacity:0}to{opacity:1}}" +
      ".ee-jp-dismiss{animation:ee-jp-fadeout 0.5s forwards}" +
      "@keyframes ee-jp-fadeout{to{opacity:0}}";
  }

  EasterEggs.register("jurassicpark", {
    trigger: "nedry",
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("jurassicpark");
})();
