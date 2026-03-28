/**
 * Princess Bride Easter Egg
 *
 * Trigger: Type "asyouwish"
 * Effect:  Dramatic tumbling-down-hill animation with iconic quotes cycling
 * Dismiss: Click or wait 10 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var quoteTimer = null;

  var QUOTES = [
    "As you wish.",
    "Inconceivable!",
    "Hello. My name is Inigo Montoya.\nYou killed my father.\nPrepare to die.",
    "Have fun storming the castle!",
    "Anybody want a peanut?",
    "Mawage. Mawage is wot bwings us togeder today.",
    "You keep using that word.\nI do not think it means\nwhat you think it means.",
    "Life is pain, Highness.\nAnyone who says differently\nis selling something.",
  ];

  // Simple Westley silhouette rolling
  var WESTLEY_SVG =
    '<svg viewBox="0 0 50 50" class="ee-pb-westley">' +
    '<circle cx="25" cy="15" r="10" fill="#222"/>' +
    '<rect x="15" y="25" width="20" height="20" rx="5" fill="#111"/>' +
    '<rect x="10" y="28" width="10" height="4" rx="2" fill="#111" transform="rotate(-30 15 30)"/>' +
    '<rect x="30" y="28" width="10" height="4" rx="2" fill="#111" transform="rotate(30 35 30)"/>' +
    '<line x1="21" y1="14" x2="29" y2="14" stroke="#333" stroke-width="2"/>' +
    '</svg>';

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    var firstQuote = QUOTES[0];
    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-pb-screen">' +
        '<div class="ee-pb-hill"></div>' +
        WESTLEY_SVG +
        '<div class="ee-pb-quote">' + escapeHtml(firstQuote) + '</div>' +
      '</div>',
      "ee-pb-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    // Cycle quotes
    var qi = 1;
    quoteTimer = setInterval(function () {
      var qEl = overlayEl && overlayEl.querySelector(".ee-pb-quote");
      if (!qEl) return;
      qEl.style.opacity = "0";
      setTimeout(function () {
        if (!qEl) return;
        qEl.innerHTML = escapeHtml(QUOTES[qi % QUOTES.length]);
        qEl.style.opacity = "1";
        qi++;
      }, 400);
    }, 2500);

    timer = setTimeout(dismiss, 10000);
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (quoteTimer) { clearInterval(quoteTimer); quoteTimer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-pb-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("asyouwish");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-pb-overlay{position:fixed;inset:0;z-index:99999;animation:ee-pb-in 0.5s ease-out}" +
      "@keyframes ee-pb-in{from{opacity:0}to{opacity:1}}" +
      ".ee-pb-out{animation:ee-pb-fade 0.4s ease-in forwards}" +
      "@keyframes ee-pb-fade{to{opacity:0}}" +
      ".ee-pb-screen{width:100%;height:100%;background:linear-gradient(180deg,#1a0a2e 0%,#2d1b4e 40%,#3a6b35 60%,#2d5a27 100%);" +
        "display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}" +
      ".ee-pb-hill{position:absolute;bottom:0;left:-10%;width:120%;height:55%;background:linear-gradient(160deg,#3a6b35,#2d5a27);" +
        "border-radius:50% 50% 0 0;transform:rotate(-5deg)}" +
      ".ee-pb-westley{position:absolute;width:50px;height:50px;animation:ee-pb-roll 4s linear infinite}" +
      "@keyframes ee-pb-roll{0%{left:-60px;top:30%;transform:rotate(0deg)}100%{left:110%;top:65%;transform:rotate(1080deg)}}" +
      ".ee-pb-quote{position:relative;z-index:2;text-align:center;font-family:Georgia,serif;font-size:24px;color:#fff;" +
        "text-shadow:0 2px 10px rgba(0,0,0,0.7);max-width:500px;line-height:1.5;transition:opacity 0.4s ease;padding:20px}" +
      "";
  }

  EasterEggs.register("asyouwish", {
    trigger: "asyouwish",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("asyouwish");
})();
