/**
 * Ghostbusters PKE Meter Easter Egg
 *
 * Trigger: Type "pkemeter"
 * Effect:  PKE meter display with animated wings, sweeping gauge needle,
 *          rising readings, ghost silhouette flash. "Who ya gonna call?" text.
 * Dismiss: Click or wait 10 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var readingTimer = null;

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-gb-screen">' +
        '<div class="ee-gb-noghosts">' +
          '<svg viewBox="0 0 100 100" width="80" height="80">' +
            '<circle cx="50" cy="50" r="45" fill="none" stroke="#ff0000" stroke-width="5"/>' +
            '<line x1="20" y1="20" x2="80" y2="80" stroke="#ff0000" stroke-width="5"/>' +
            '<!-- Ghost -->' +
            '<path d="M35,65 L35,40 Q35,25 50,25 Q65,25 65,40 L65,65 L60,60 L55,65 L50,60 L45,65 L40,60Z" fill="#fff"/>' +
            '<circle cx="42" cy="40" r="3" fill="#000"/><circle cx="58" cy="40" r="3" fill="#000"/>' +
            '<path d="M42,50 Q50,56 58,50" fill="none" stroke="#000" stroke-width="2"/>' +
          '</svg>' +
        '</div>' +
        '<div class="ee-gb-meter">' +
          '<div class="ee-gb-gauge">' +
            '<div class="ee-gb-needle"></div>' +
          '</div>' +
          '<div class="ee-gb-wings">' +
            '<div class="ee-gb-wing ee-gb-wing-l"></div>' +
            '<div class="ee-gb-wing ee-gb-wing-r"></div>' +
          '</div>' +
          '<div class="ee-gb-reading">0.0</div>' +
        '</div>' +
        '<div class="ee-gb-text">WHO YA GONNA CALL?</div>' +
        '<div class="ee-gb-answer">GHOSTBUSTERS!</div>' +
      '</div>',
      "ee-gb-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    // Animate reading
    var reading = 0;
    readingTimer = setInterval(function () {
      if (!overlayEl) return;
      reading += 0.3 + Math.random() * 0.5;
      if (reading > 9.9) reading = 9.9;
      var readEl = overlayEl.querySelector(".ee-gb-reading");
      if (readEl) readEl.textContent = reading.toFixed(1);
      var needle = overlayEl.querySelector(".ee-gb-needle");
      if (needle) needle.style.transform = "rotate(" + (reading * 15 - 30) + "deg)";
      // Wings spread as reading increases
      var wingL = overlayEl.querySelector(".ee-gb-wing-l");
      var wingR = overlayEl.querySelector(".ee-gb-wing-r");
      var spread = reading * 6;
      if (wingL) wingL.style.transform = "rotate(-" + spread + "deg)";
      if (wingR) wingR.style.transform = "rotate(" + spread + "deg)";
    }, 200);

    timer = setTimeout(dismiss, 10000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (readingTimer) { clearInterval(readingTimer); readingTimer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-gb-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("pkemeter");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-gb-overlay{position:fixed;inset:0;z-index:99999;animation:ee-gb-in 0.4s ease-out}" +
      "@keyframes ee-gb-in{from{opacity:0}to{opacity:1}}" +
      ".ee-gb-out{animation:ee-gb-fade 0.4s ease-in forwards}" +
      "@keyframes ee-gb-fade{to{opacity:0}}" +
      ".ee-gb-screen{width:100%;height:100%;background:radial-gradient(ellipse at center,#1a1a1a 0%,#000 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;overflow:hidden}" +
      ".ee-gb-noghosts{animation:ee-gb-flash 0.8s ease-out}" +
      "@keyframes ee-gb-flash{0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.2);opacity:1}100%{transform:scale(1)}}" +
      /* Meter */
      ".ee-gb-meter{position:relative;width:120px;height:160px;background:linear-gradient(180deg,#444,#222);border-radius:10px;padding:15px;box-sizing:border-box;border:2px solid #666}" +
      ".ee-gb-gauge{width:90px;height:50px;background:#111;border-radius:50% 50% 0 0;position:relative;overflow:hidden;border:1px solid #555;margin:0 auto}" +
      ".ee-gb-needle{position:absolute;bottom:0;left:50%;width:2px;height:40px;background:#ff3333;transform-origin:bottom center;transform:rotate(-30deg);transition:transform 0.3s ease-out}" +
      ".ee-gb-wings{display:flex;justify-content:center;gap:8px;margin-top:10px}" +
      ".ee-gb-wing{width:8px;height:30px;background:linear-gradient(180deg,#888,#444);border-radius:2px;transform-origin:top center;transition:transform 0.3s ease-out}" +
      ".ee-gb-reading{text-align:center;font-family:'Courier New',monospace;font-size:18px;color:#ff3333;margin-top:8px;text-shadow:0 0 6px rgba(255,50,50,0.5)}" +
      /* Text */
      ".ee-gb-text{font-family:Arial,sans-serif;font-size:16px;color:#aaa;letter-spacing:3px;animation:ee-gb-text-in 0.5s ease-out 1s both}" +
      "@keyframes ee-gb-text-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}" +
      ".ee-gb-answer{font-family:Arial,sans-serif;font-size:28px;font-weight:bold;color:#ff3333;text-shadow:0 0 15px rgba(255,50,50,0.5);letter-spacing:4px;animation:ee-gb-answer-in 0.6s ease-out 2s both}" +
      "@keyframes ee-gb-answer-in{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}" +
      "";
  }

  EasterEggs.register("pkemeter", {
    trigger: "pkemeter",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("pkemeter");
})();
