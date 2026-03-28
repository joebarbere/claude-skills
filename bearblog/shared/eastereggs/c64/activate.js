/**
 * Commodore 64 Boot Screen Easter Egg
 *
 * Trigger: Type "c64"
 * Effect:  Classic C64 blue boot screen with BASIC READY prompt and blinking cursor
 * Dismiss: Click or wait 10 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var typeTimer = null;

  var BOOT_TEXT =
    "\n    **** COMMODORE 64 BASIC V2 ****\n\n" +
    " 64K RAM SYSTEM  38911 BASIC BYTES FREE\n\n" +
    "READY.\n";

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-c64-screen">' +
        '<div class="ee-c64-border">' +
          '<pre class="ee-c64-text"></pre>' +
          '<span class="ee-c64-cursor">\u2588</span>' +
        '</div>' +
      '</div>',
      "ee-c64-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    // Typewriter boot text
    var textEl = overlayEl.querySelector(".ee-c64-text");
    var idx = 0;
    typeTimer = setInterval(function () {
      if (idx < BOOT_TEXT.length) {
        textEl.textContent += BOOT_TEXT[idx];
        idx++;
      } else {
        clearInterval(typeTimer);
        typeTimer = null;
      }
    }, 30);

    timer = setTimeout(dismiss, 10000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-c64-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("c64");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-c64-overlay{position:fixed;inset:0;z-index:99999;animation:ee-c64-in 0.3s ease-out}" +
      "@keyframes ee-c64-in{from{opacity:0}to{opacity:1}}" +
      ".ee-c64-out{animation:ee-c64-fade 0.4s ease-in forwards}" +
      "@keyframes ee-c64-fade{to{opacity:0}}" +
      ".ee-c64-screen{width:100%;height:100%;background:#4040e0;display:flex;align-items:center;justify-content:center}" +
      ".ee-c64-border{width:85%;max-width:650px;height:70%;background:#4040e0;border:20px solid #4040e0;padding:20px;box-sizing:border-box;overflow:hidden}" +
      ".ee-c64-text{font-family:'Courier New',monospace;font-size:16px;color:#a0a0ff;margin:0;white-space:pre-wrap;line-height:1.4}" +
      ".ee-c64-cursor{font-family:'Courier New',monospace;font-size:16px;color:#a0a0ff;animation:ee-c64-blink 0.6s step-end infinite}" +
      "@keyframes ee-c64-blink{50%{opacity:0}}" +
      "";
  }

  EasterEggs.register("c64", {
    trigger: "c64",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("c64");
})();
