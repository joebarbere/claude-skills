/**
 * Blue Screen of Death Easter Egg
 *
 * Trigger: Type "bsod"
 * Effect:  Classic Windows BSOD overlay with blinking cursor and fake error text
 * Dismiss: Press any key or click, or wait 10 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-bsod-screen">' +
        '<div class="ee-bsod-content">' +
          '<p class="ee-bsod-head">A problem has been detected and Windows has been shut down to prevent damage to your computer.</p>' +
          '<p class="ee-bsod-err">BLOG_READER_FOUND_EASTER_EGG</p>' +
          '<p>If this is the first time you\'ve seen this Stop error screen, relax. It\'s just an easter egg.</p>' +
          '<p>Technical information:</p>' +
          '<p class="ee-bsod-tech">*** STOP: 0x000000EE (0x80085, 0xDEADBEEF, 0xC0FFEE, 0xBAADF00D)</p>' +
          '<p class="ee-bsod-tech">*** easteregg.sys - Address 0xF00BA12 base at 0xF00B000</p>' +
          '<p class="ee-bsod-restart">Press any key to continue <span class="ee-bsod-cursor">_</span></p>' +
        '</div>' +
      '</div>',
      "ee-bsod-overlay"
    );

    overlayEl.addEventListener("click", dismiss);
    document.addEventListener("keydown", dismiss);

    timer = setTimeout(dismiss, 10000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    document.removeEventListener("keydown", dismiss);
    if (overlayEl) {
      overlayEl.classList.add("ee-bsod-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("bsod");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-bsod-overlay{position:fixed;inset:0;z-index:99999;animation:ee-bsod-in 0.15s ease-out}" +
      "@keyframes ee-bsod-in{from{opacity:0}to{opacity:1}}" +
      ".ee-bsod-out{animation:ee-bsod-fade 0.4s ease-in forwards}" +
      "@keyframes ee-bsod-fade{to{opacity:0}}" +
      ".ee-bsod-screen{width:100%;height:100%;background:#0000AA;display:flex;align-items:center;justify-content:center;padding:40px;box-sizing:border-box}" +
      ".ee-bsod-content{max-width:700px;font-family:'Courier New',monospace;font-size:14px;color:#fff;line-height:1.8}" +
      ".ee-bsod-head{font-weight:bold;margin-bottom:16px}" +
      ".ee-bsod-err{font-size:16px;letter-spacing:1px;margin-bottom:16px}" +
      ".ee-bsod-tech{font-size:12px;color:#ccc;margin:4px 0}" +
      ".ee-bsod-restart{margin-top:20px}" +
      ".ee-bsod-cursor{animation:ee-bsod-blink 0.8s step-end infinite}" +
      "@keyframes ee-bsod-blink{50%{opacity:0}}" +
      "";
  }

  EasterEggs.register("bsod", {
    trigger: "bsod",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("bsod");
})();
