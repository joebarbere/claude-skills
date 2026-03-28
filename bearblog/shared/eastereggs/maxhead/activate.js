/**
 * Max Headroom Easter Egg
 *
 * Trigger: Type "maxhead"
 * Effect:  Max Headroom-style glitch overlay with stuttering text,
 *          horizontal line artifacts, and characteristic visual distortion
 * Dismiss: Click or wait 10 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var glitchTimer = null;
  var quoteIdx = 0;

  var QUOTES = [
    "I-I-I-I'm Max Headroom!",
    "C-C-Catch the wave!",
    "B-B-Blipverts!",
    "The future is n-n-now!",
    "20 minutes into the f-f-future...",
    "I'm very g-g-good at what I do.",
  ];

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-mx-screen">' +
        '<div class="ee-mx-scanlines"></div>' +
        '<div class="ee-mx-head">' +
          '<svg viewBox="0 0 100 120" class="ee-mx-face">' +
            '<rect x="0" y="0" width="100" height="120" fill="none"/>' +
            '<!-- Face outline -->' +
            '<ellipse cx="50" cy="55" rx="35" ry="45" fill="#e8d5a8" stroke="#c8b088" stroke-width="2"/>' +
            '<!-- Sunglasses -->' +
            '<rect x="18" y="38" width="25" height="14" rx="3" fill="#222" stroke="#555" stroke-width="1"/>' +
            '<rect x="57" y="38" width="25" height="14" rx="3" fill="#222" stroke="#555" stroke-width="1"/>' +
            '<line x1="43" y1="44" x2="57" y2="44" stroke="#555" stroke-width="1.5"/>' +
            '<!-- Lens glare -->' +
            '<rect x="22" y="41" width="8" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>' +
            '<rect x="61" y="41" width="8" height="3" rx="1" fill="rgba(255,255,255,0.2)"/>' +
            '<!-- Mouth -->' +
            '<path d="M35,75 Q50,85 65,75" fill="none" stroke="#333" stroke-width="2" class="ee-mx-mouth"/>' +
            '<!-- Hair -->' +
            '<path d="M15,35 Q20,5 50,10 Q80,5 85,35" fill="#d4a853" stroke="#b8923d" stroke-width="1"/>' +
          '</svg>' +
        '</div>' +
        '<div class="ee-mx-text">' + QUOTES[0] + '</div>' +
        '<div class="ee-mx-bars"></div>' +
      '</div>',
      "ee-mx-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    // Stutter text and glitch effects
    glitchTimer = setInterval(function () {
      if (!overlayEl) return;
      var textEl = overlayEl.querySelector(".ee-mx-text");
      if (textEl) {
        quoteIdx = (quoteIdx + 1) % QUOTES.length;
        textEl.textContent = QUOTES[quoteIdx];
      }
      // Random horizontal glitch bars
      var bars = overlayEl.querySelector(".ee-mx-bars");
      if (bars) {
        bars.innerHTML = "";
        var count = Math.floor(Math.random() * 4) + 1;
        for (var i = 0; i < count; i++) {
          var bar = document.createElement("div");
          bar.className = "ee-mx-bar";
          bar.style.top = (Math.random() * 100) + "%";
          bar.style.height = (2 + Math.random() * 8) + "px";
          bar.style.opacity = (0.3 + Math.random() * 0.5);
          bars.appendChild(bar);
        }
      }
    }, 400);

    timer = setTimeout(dismiss, 10000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (glitchTimer) { clearInterval(glitchTimer); glitchTimer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-mx-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("maxhead");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-mx-overlay{position:fixed;inset:0;z-index:99999;animation:ee-mx-in 0.2s ease-out}" +
      "@keyframes ee-mx-in{from{opacity:0}to{opacity:1}}" +
      ".ee-mx-out{animation:ee-mx-fade 0.4s ease-in forwards}" +
      "@keyframes ee-mx-fade{to{opacity:0}}" +
      ".ee-mx-screen{width:100%;height:100%;background:linear-gradient(180deg,#1a0a3e 0%,#0a0a2e 50%,#1a0a3e 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;position:relative}" +
      ".ee-mx-scanlines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px);pointer-events:none}" +
      ".ee-mx-head{animation:ee-mx-jitter 0.15s infinite}" +
      "@keyframes ee-mx-jitter{0%{transform:translate(0,0)}25%{transform:translate(-3px,1px)}50%{transform:translate(2px,-1px)}75%{transform:translate(-1px,2px)}100%{transform:translate(1px,-1px)}}" +
      ".ee-mx-face{width:120px;height:144px;filter:drop-shadow(0 0 15px rgba(0,180,255,0.4))}" +
      ".ee-mx-mouth{animation:ee-mx-talk 0.3s ease-in-out infinite alternate}" +
      "@keyframes ee-mx-talk{from{d:path('M35,75 Q50,85 65,75')}to{d:path('M35,78 Q50,72 65,78')}}" +
      ".ee-mx-text{margin-top:20px;font-family:'Courier New',monospace;font-size:24px;color:#00ccff;text-shadow:0 0 10px #00ccff,3px 0 #ff0066;letter-spacing:2px;animation:ee-mx-text-glitch 0.2s infinite}" +
      "@keyframes ee-mx-text-glitch{0%{text-shadow:0 0 10px #00ccff,3px 0 #ff0066}50%{text-shadow:0 0 10px #00ccff,-2px 0 #ff0066}}" +
      ".ee-mx-bars{position:absolute;inset:0;pointer-events:none}" +
      ".ee-mx-bar{position:absolute;left:0;width:100%;background:rgba(0,200,255,0.3)}" +
      "";
  }

  EasterEggs.register("maxhead", {
    trigger: "maxhead",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("maxhead");
})();
