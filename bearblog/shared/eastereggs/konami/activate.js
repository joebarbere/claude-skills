/**
 * Konami Code Easter Egg — ↑↑↓↓←→←→BA
 *
 * Trigger: The classic Konami/Contra code using arrow keys + B, A
 * Effect:  Retro 8-bit celebration with "30 LIVES" text, pixel confetti, and CRT filter
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var confettiEls = [];
  var dismissTimer = null;
  var bodyClass = "ee-konami-active";

  // NES color palette for confetti
  var NES_COLORS = [
    "#FC0000", "#FC7C00", "#FCB800", "#00B800",
    "#0058F8", "#6844FC", "#D800CC", "#F8F8F8",
    "#00E8D8", "#58D854", "#FCFC00", "#FC74B4"
  ];

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    document.body.classList.add(bodyClass);

    // Build overlay
    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-konami-flash"></div>' +
      '<div class="ee-konami-score ee-konami-score-left">1UP<br>0032500</div>' +
      '<div class="ee-konami-score ee-konami-score-right">2UP<br>0028700</div>' +
      '<div class="ee-konami-lives">&#x2718; 30 LIVES &#x2718;</div>' +
      '<div class="ee-konami-subtitle">KONAMI CODE ACTIVATED</div>' +
      '<div class="ee-konami-confetti-area"></div>',
      "ee-konami-overlay"
    );

    // Spawn pixel confetti
    var area = overlayEl.querySelector(".ee-konami-confetti-area");
    for (var i = 0; i < 120; i++) {
      var pixel = document.createElement("div");
      pixel.className = "ee-konami-pixel";
      var color = NES_COLORS[Math.floor(Math.random() * NES_COLORS.length)];
      var left = Math.random() * 100;
      var delay = Math.random() * 2;
      var duration = 2 + Math.random() * 3;
      var size = 4 + Math.floor(Math.random() * 8);
      var drift = -50 + Math.random() * 100;
      pixel.style.cssText =
        "background:" + color + ";left:" + left + "%;width:" + size + "px;height:" + size + "px;" +
        "animation-delay:" + delay + "s;animation-duration:" + duration + "s;" +
        "--drift:" + drift + "px;";
      area.appendChild(pixel);
      confettiEls.push(pixel);
    }

    dismissTimer = setTimeout(deactivate, 8000);
    overlayEl.addEventListener("click", deactivate);
  }

  function deactivate() {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
    document.body.classList.remove(bodyClass);
    if (overlayEl) {
      overlayEl.classList.add("ee-konami-dismiss");
      var el = overlayEl;
      setTimeout(function () { EasterEggs.removeElement(el); }, 600);
      overlayEl = null;
    }
    confettiEls = [];
    EasterEggs._activeEggs.delete("konami");
  }

  function getCSS() {
    return "" +
      /* CRT scanline filter on page */
      ".ee-konami-active{animation:ee-konami-crt 0.1s steps(2) infinite}" +
      "@keyframes ee-konami-crt{0%{filter:none}50%{filter:brightness(1.02)}}" +

      /* Overlay */
      ".ee-konami-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:all;cursor:pointer;overflow:hidden}" +
      ".ee-konami-overlay::before{content:'';position:absolute;inset:0;background:rgba(0,0,0,0.75);z-index:0}" +
      /* Scanlines */
      ".ee-konami-overlay::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(transparent 0px,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px);z-index:5;pointer-events:none}" +

      /* Flash */
      ".ee-konami-flash{position:absolute;inset:0;background:#fff;animation:ee-konami-flash-anim 0.4s ease-out forwards;z-index:1}" +
      "@keyframes ee-konami-flash-anim{0%{opacity:1}100%{opacity:0}}" +

      /* Score displays */
      ".ee-konami-score{position:absolute;top:20px;font-family:'Courier New',monospace;font-size:14px;color:#fff;letter-spacing:2px;z-index:2;text-align:center;opacity:0;animation:ee-konami-fadein 0.5s 0.5s forwards}" +
      ".ee-konami-score-left{left:30px}" +
      ".ee-konami-score-right{right:30px}" +

      /* 30 LIVES text */
      ".ee-konami-lives{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Courier New',monospace;font-size:64px;font-weight:bold;color:#FCB800;text-shadow:3px 3px 0 #B80000,-1px -1px 0 #FC0000,0 0 30px rgba(252,184,0,0.5);z-index:3;white-space:nowrap;opacity:0;animation:ee-konami-bounce 0.6s 0.3s forwards}" +
      "@keyframes ee-konami-bounce{0%{opacity:0;transform:translate(-50%,-50%) scale(3)}50%{opacity:1;transform:translate(-50%,-50%) scale(0.9)}70%{transform:translate(-50%,-50%) scale(1.1)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}" +

      /* Subtitle */
      ".ee-konami-subtitle{position:absolute;top:calc(50% + 50px);left:50%;transform:translateX(-50%);font-family:'Courier New',monospace;font-size:16px;color:#58D854;letter-spacing:4px;z-index:3;opacity:0;animation:ee-konami-fadein 0.5s 1s forwards}" +
      "@keyframes ee-konami-fadein{from{opacity:0}to{opacity:1}}" +

      /* Confetti area */
      ".ee-konami-confetti-area{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}" +

      /* Pixel confetti */
      ".ee-konami-pixel{position:absolute;top:-10px;animation:ee-konami-fall linear forwards}" +
      "@keyframes ee-konami-fall{0%{transform:translateY(0) translateX(0) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(100vh) translateX(var(--drift)) rotate(720deg);opacity:0}}" +

      /* Dismiss */
      ".ee-konami-dismiss{animation:ee-konami-fadeout 0.5s forwards}" +
      "@keyframes ee-konami-fadeout{to{opacity:0}}";
  }

  // Build the Konami code trigger using arrow tokens
  var KONAMI_TRIGGER =
    EasterEggs.ARROW_UP + EasterEggs.ARROW_UP +
    EasterEggs.ARROW_DOWN + EasterEggs.ARROW_DOWN +
    EasterEggs.ARROW_LEFT + EasterEggs.ARROW_RIGHT +
    EasterEggs.ARROW_LEFT + EasterEggs.ARROW_RIGHT +
    "BA";

  EasterEggs.register("konami", {
    trigger: KONAMI_TRIGGER,
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("konami");
})();
