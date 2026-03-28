/**
 * Oregon Trail Easter Egg
 *
 * Trigger: Type "oregon"
 * Effect:  Green-on-black terminal overlay with classic Oregon Trail death messages
 * Dismiss: Click or wait 12 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var typeTimer = null;

  var DEATHS = [
    "You have died of dysentery.",
    "You have died of cholera.",
    "You have died of typhoid.",
    "A thief stole 4 oxen.",
    "You have drowned while fording the river.",
    "Your wagon broke an axle.",
    "You have died of exhaustion.",
    "A snake bite killed you.",
  ];

  var TOMBSTONE =
    '<svg viewBox="0 0 100 120" width="100" height="120" class="ee-or-tomb">' +
    '<path d="M20,120 L20,40 Q20,10 50,10 Q80,10 80,40 L80,120Z" fill="#888" stroke="#555" stroke-width="2"/>' +
    '<text x="50" y="50" text-anchor="middle" font-family="serif" font-size="10" fill="#333">HERE LIES</text>' +
    '<text x="50" y="65" text-anchor="middle" font-family="serif" font-size="9" fill="#333">A Blog Reader</text>' +
    '<text x="50" y="80" text-anchor="middle" font-family="serif" font-size="8" fill="#444">Peperony and</text>' +
    '<text x="50" y="92" text-anchor="middle" font-family="serif" font-size="8" fill="#444">chease</text>' +
    '</svg>';

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    var msg = DEATHS[Math.floor(Math.random() * DEATHS.length)];

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-or-screen">' +
        '<div class="ee-or-content">' +
          '<div class="ee-or-header">THE OREGON TRAIL</div>' +
          '<div class="ee-or-date">March 28, 1848</div>' +
          '<div class="ee-or-msg"></div>' +
          '<div class="ee-or-tomb-wrap">' + TOMBSTONE + '</div>' +
          '<div class="ee-or-prompt">Press SPACE BAR to continue</div>' +
        '</div>' +
      '</div>',
      "ee-or-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    // Typewriter effect for death message
    var msgEl = overlayEl.querySelector(".ee-or-msg");
    var idx = 0;
    typeTimer = setInterval(function () {
      if (idx < msg.length) {
        msgEl.textContent += msg[idx];
        idx++;
      } else {
        clearInterval(typeTimer);
        typeTimer = null;
      }
    }, 50);

    timer = setTimeout(dismiss, 12000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-or-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("oregon");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-or-overlay{position:fixed;inset:0;z-index:99999;animation:ee-or-in 0.3s ease-out}" +
      "@keyframes ee-or-in{from{opacity:0}to{opacity:1}}" +
      ".ee-or-out{animation:ee-or-fade 0.4s ease-in forwards}" +
      "@keyframes ee-or-fade{to{opacity:0}}" +
      ".ee-or-screen{width:100%;height:100%;background:#000;display:flex;align-items:center;justify-content:center}" +
      ".ee-or-content{text-align:center;font-family:'Courier New',monospace;color:#33ff33}" +
      ".ee-or-header{font-size:28px;letter-spacing:4px;margin-bottom:10px}" +
      ".ee-or-date{font-size:14px;color:#22aa22;margin-bottom:30px}" +
      ".ee-or-msg{font-size:20px;min-height:30px;margin-bottom:30px}" +
      ".ee-or-tomb-wrap{margin:20px auto;animation:ee-or-tomb-in 1s ease-out 1.5s both}" +
      "@keyframes ee-or-tomb-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}" +
      ".ee-or-tomb{filter:drop-shadow(0 0 8px rgba(51,255,51,0.3))}" +
      ".ee-or-prompt{font-size:12px;color:#22aa22;margin-top:30px;animation:ee-or-blink 1s step-end infinite}" +
      "@keyframes ee-or-blink{50%{opacity:0}}" +
      "";
  }

  EasterEggs.register("oregon", {
    trigger: "oregon",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("oregon");
})();
