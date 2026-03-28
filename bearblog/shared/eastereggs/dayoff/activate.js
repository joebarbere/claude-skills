/**
 * Ferris Bueller's Day Off Easter Egg
 *
 * Trigger: Type "dayoff"
 * Effect:  Fourth-wall-breaking Ferris overlay with iconic quotes, parade float scene
 * Dismiss: Click or wait 12 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var quoteTimer = null;

  var QUOTES = [
    "Life moves pretty fast.\nIf you don't stop and look around\nonce in a while,\nyou could miss it.",
    "Bueller?\nBueller?\nBueller?",
    "The question isn't what are we\ngoing to do.\nThe question is what\naren't we going to do.",
    "You're still here?\nIt's over.\nGo home.",
    "I asked for a car.\nI got a computer.\nHow's that for being born\nunder a bad sign?",
    "A person should not believe\nin an -ism,\nhe should believe in himself.",
  ];

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-fb-screen">' +
        '<div class="ee-fb-stripe ee-fb-s1"></div>' +
        '<div class="ee-fb-stripe ee-fb-s2"></div>' +
        '<div class="ee-fb-stripe ee-fb-s3"></div>' +
        '<div class="ee-fb-quote">' + escapeHtml(QUOTES[0]) + '</div>' +
        '<div class="ee-fb-ferris">' +
          '<div class="ee-fb-head"></div>' +
          '<div class="ee-fb-vest"></div>' +
        '</div>' +
        '<div class="ee-fb-credit">FERRIS BUELLER\'S DAY OFF</div>' +
      '</div>',
      "ee-fb-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    var qi = 1;
    quoteTimer = setInterval(function () {
      var qEl = overlayEl && overlayEl.querySelector(".ee-fb-quote");
      if (!qEl) return;
      qEl.style.opacity = "0";
      setTimeout(function () {
        if (!qEl) return;
        qEl.innerHTML = escapeHtml(QUOTES[qi % QUOTES.length]);
        qEl.style.opacity = "1";
        qi++;
      }, 400);
    }, 3000);

    timer = setTimeout(dismiss, 12000);
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (quoteTimer) { clearInterval(quoteTimer); quoteTimer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-fb-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("dayoff");
      }, 500);
    }
  }

  function getCSS() {
    return "" +
      ".ee-fb-overlay{position:fixed;inset:0;z-index:99999;animation:ee-fb-in 0.5s ease-out}" +
      "@keyframes ee-fb-in{from{opacity:0}to{opacity:1}}" +
      ".ee-fb-out{animation:ee-fb-fade 0.5s ease-in forwards}" +
      "@keyframes ee-fb-fade{to{opacity:0}}" +
      ".ee-fb-screen{width:100%;height:100%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}" +
      /* Leopard vest stripes */
      ".ee-fb-stripe{position:absolute;height:100%;opacity:0.08}" +
      ".ee-fb-s1{left:0;width:33%;background:#e74c3c}" +
      ".ee-fb-s2{left:33%;width:34%;background:#f1c40f}" +
      ".ee-fb-s3{left:67%;width:33%;background:#2ecc71}" +
      ".ee-fb-quote{position:relative;z-index:2;text-align:center;font-family:'Courier New',monospace;font-size:22px;color:#fff;" +
        "text-shadow:0 2px 8px rgba(0,0,0,0.8);max-width:500px;line-height:1.6;transition:opacity 0.4s ease;padding:20px}" +
      /* Mini Ferris character */
      ".ee-fb-ferris{position:absolute;bottom:60px;right:60px;animation:ee-fb-wave 1s ease-in-out infinite alternate}" +
      "@keyframes ee-fb-wave{0%{transform:rotate(-5deg)}100%{transform:rotate(5deg)}}" +
      ".ee-fb-head{width:30px;height:30px;background:#DEBB98;border-radius:50%;margin:0 auto}" +
      ".ee-fb-vest{width:40px;height:35px;background:repeating-linear-gradient(45deg,#d4a574,#d4a574 3px,#8B4513 3px,#8B4513 6px);" +
        "border-radius:5px;margin-top:2px}" +
      ".ee-fb-credit{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-family:'Courier New',monospace;" +
        "font-size:11px;letter-spacing:3px;color:#666;text-transform:uppercase}" +
      "";
  }

  EasterEggs.register("dayoff", {
    trigger: "dayoff",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("dayoff");
})();
