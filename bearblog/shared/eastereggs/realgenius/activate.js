/**
 * Real Genius Easter Egg — Laser Popcorn
 *
 * Trigger: Type "popcorn"
 * Effect:  Laser beam fires from top, popcorn explodes outward and piles up
 * Dismiss: Click or auto-dismiss after 12s
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var dismissTimer = null;
  var spawnInterval = null;
  var pileHeight = 0;

  // Popcorn kernel SVG shapes (small variations)
  var KERNELS = [
    '<svg viewBox="0 0 20 20"><circle cx="10" cy="8" r="6" fill="#FFF8DC"/><circle cx="7" cy="6" r="4" fill="#FFFACD"/><circle cx="13" cy="6" r="3.5" fill="#FFF8E1"/><ellipse cx="10" cy="15" rx="3" ry="2.5" fill="#DAA520"/></svg>',
    '<svg viewBox="0 0 20 20"><circle cx="10" cy="7" r="5" fill="#FFFACD"/><circle cx="6" cy="8" r="4" fill="#FFF8DC"/><circle cx="14" cy="7" r="3.5" fill="#FFEFD5"/><ellipse cx="10" cy="14" rx="2.5" ry="2" fill="#D4A017"/></svg>',
    '<svg viewBox="0 0 20 20"><circle cx="9" cy="8" r="5.5" fill="#FFF8E1"/><circle cx="13" cy="6" r="4" fill="#FFFACD"/><circle cx="7" cy="5" r="3" fill="#FFF8DC"/><ellipse cx="10" cy="15" rx="3" ry="2" fill="#C5960C"/></svg>',
  ];

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());
    pileHeight = 0;

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-rg-laser-beam"></div>' +
      '<div class="ee-rg-impact"></div>' +
      '<div class="ee-rg-popcorn-area"></div>' +
      '<div class="ee-rg-pile"></div>',
      "ee-rg-overlay"
    );

    overlayEl.addEventListener("click", deactivate);

    var area = overlayEl.querySelector(".ee-rg-popcorn-area");
    var pile = overlayEl.querySelector(".ee-rg-pile");

    // Start spawning popcorn after laser hits (1s delay)
    setTimeout(function () {
      spawnInterval = setInterval(function () {
        if (!area) return;
        spawnKernel(area);
        // Grow the pile
        pileHeight = Math.min(pileHeight + 0.5, 40);
        pile.style.height = pileHeight + "%";
      }, 60);
    }, 1000);

    dismissTimer = setTimeout(deactivate, 12000);
  }

  function spawnKernel(area) {
    var kernel = document.createElement("div");
    kernel.className = "ee-rg-kernel";
    kernel.innerHTML = KERNELS[Math.floor(Math.random() * KERNELS.length)];

    // Random trajectory from center impact point
    var angle = Math.random() * Math.PI * 2;
    var distance = 100 + Math.random() * 400;
    var dx = Math.cos(angle) * distance;
    var dy = Math.sin(angle) * distance - 200; // Bias upward
    var rotation = Math.random() * 720 - 360;
    var duration = 1.5 + Math.random() * 2;
    var size = 20 + Math.random() * 20;

    kernel.style.cssText =
      "--dx:" + dx + "px;--dy:" + dy + "px;--rot:" + rotation + "deg;" +
      "animation-duration:" + duration + "s;" +
      "width:" + size + "px;height:" + size + "px;";

    area.appendChild(kernel);

    // Remove after animation
    setTimeout(function () {
      if (kernel.parentNode) kernel.parentNode.removeChild(kernel);
    }, duration * 1000 + 100);
  }

  function deactivate() {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
    if (spawnInterval) { clearInterval(spawnInterval); spawnInterval = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-rg-dismiss");
      var el = overlayEl;
      setTimeout(function () { EasterEggs.removeElement(el); }, 600);
      overlayEl = null;
    }
    EasterEggs._activeEggs.delete("realgenius");
  }

  function getCSS() {
    return "" +
      ".ee-rg-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:all;cursor:pointer;overflow:hidden}" +
      ".ee-rg-overlay::before{content:'';position:absolute;inset:0;background:rgba(0,0,0,0.3)}" +

      /* Laser beam */
      ".ee-rg-laser-beam{position:absolute;top:0;left:50%;width:4px;height:50%;transform:translateX(-50%);background:linear-gradient(to bottom,rgba(255,0,0,1),rgba(255,50,50,0.8));box-shadow:0 0 15px #f00,0 0 30px #f00,0 0 60px rgba(255,0,0,0.5);animation:ee-rg-laser-fire 0.8s ease-out forwards;transform-origin:top center;z-index:3}" +
      "@keyframes ee-rg-laser-fire{0%{clip-path:inset(0 0 100% 0)}100%{clip-path:inset(0 0 0 0)}}" +

      /* Impact glow */
      ".ee-rg-impact{position:absolute;top:50%;left:50%;width:40px;height:40px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(#fff,#ff0,rgba(255,0,0,0));opacity:0;animation:ee-rg-impact-glow 0.5s 0.8s forwards;z-index:3}" +
      "@keyframes ee-rg-impact-glow{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)}50%{opacity:1;transform:translate(-50%,-50%) scale(3)}100%{opacity:0.6;transform:translate(-50%,-50%) scale(1.5);box-shadow:0 0 40px #ff0}}" +

      /* Popcorn area */
      ".ee-rg-popcorn-area{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}" +

      /* Individual kernel */
      ".ee-rg-kernel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);animation:ee-rg-pop forwards;will-change:transform}" +
      ".ee-rg-kernel svg{width:100%;height:100%}" +
      "@keyframes ee-rg-pop{0%{transform:translate(-50%,-50%) scale(0.3);opacity:1}20%{transform:translate(calc(-50% + var(--dx) * 0.3),calc(-50% + var(--dy) * 0.3)) scale(1) rotate(calc(var(--rot) * 0.3));opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy) + 300px)) scale(0.8) rotate(var(--rot));opacity:0.6}}" +

      /* Popcorn pile at bottom */
      ".ee-rg-pile{position:absolute;bottom:0;left:0;right:0;height:0;background:linear-gradient(to top,#FFF8DC 0%,#FFFACD 40%,rgba(255,248,220,0.5) 80%,transparent 100%);transition:height 0.3s;z-index:1;border-top:2px solid rgba(218,165,32,0.3)}" +

      /* Dismiss */
      ".ee-rg-dismiss{animation:ee-rg-fadeout 0.5s forwards}" +
      "@keyframes ee-rg-fadeout{to{opacity:0}}";
  }

  EasterEggs.register("realgenius", {
    trigger: "popcorn",
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("realgenius");
})();
