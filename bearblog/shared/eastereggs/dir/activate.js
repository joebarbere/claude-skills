/**
 * DOS Prompt Easter Egg
 *
 * Trigger: Type "dir"
 * Effect:  MS-DOS-style directory listing overlay with fake blog files
 * Dismiss: Click or wait 10 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var typeTimer = null;

  var DOS_OUTPUT =
    "C:\\BLOG>dir\n\n" +
    " Volume in drive C is BEARBLOG\n" +
    " Volume Serial Number is 1337-CAFE\n" +
    " Directory of C:\\BLOG\n\n" +
    ".              <DIR>        03-28-26  12:00a\n" +
    "..             <DIR>        03-28-26  12:00a\n" +
    "INDEX    HTM     4,096      03-28-26  12:00a\n" +
    "STYLE    CSS     2,048      03-28-26  12:00a\n" +
    "EASTREGG JS     31,337      03-28-26  12:00a\n" +
    "SECRETS  TXT         0      03-28-26  12:00a\n" +
    "README   MD      1,024      03-28-26  12:00a\n" +
    "BLOG     EXE    65,536      03-28-26  12:00a\n" +
    "        6 file(s)        104,041 bytes\n" +
    "        2 dir(s)    640,000 bytes free\n\n" +
    "C:\\BLOG>";

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-dos-screen">' +
        '<pre class="ee-dos-text"></pre>' +
        '<span class="ee-dos-cursor">_</span>' +
      '</div>',
      "ee-dos-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    var textEl = overlayEl.querySelector(".ee-dos-text");
    var idx = 0;
    typeTimer = setInterval(function () {
      if (idx < DOS_OUTPUT.length) {
        // Type faster for bulk text
        var chunk = Math.min(3, DOS_OUTPUT.length - idx);
        textEl.textContent += DOS_OUTPUT.substring(idx, idx + chunk);
        idx += chunk;
      } else {
        clearInterval(typeTimer);
        typeTimer = null;
      }
    }, 15);

    timer = setTimeout(dismiss, 10000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-dos-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("dir");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-dos-overlay{position:fixed;inset:0;z-index:99999;animation:ee-dos-in 0.2s ease-out}" +
      "@keyframes ee-dos-in{from{opacity:0}to{opacity:1}}" +
      ".ee-dos-out{animation:ee-dos-fade 0.4s ease-in forwards}" +
      "@keyframes ee-dos-fade{to{opacity:0}}" +
      ".ee-dos-screen{width:100%;height:100%;background:#000;padding:30px;box-sizing:border-box;overflow:hidden}" +
      ".ee-dos-text{font-family:'Courier New',monospace;font-size:14px;color:#aaa;margin:0;white-space:pre;line-height:1.4}" +
      ".ee-dos-cursor{font-family:'Courier New',monospace;font-size:14px;color:#aaa;animation:ee-dos-blink 0.7s step-end infinite}" +
      "@keyframes ee-dos-blink{50%{opacity:0}}" +
      "";
  }

  EasterEggs.register("dir", {
    trigger: "dir",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("dir");
})();
