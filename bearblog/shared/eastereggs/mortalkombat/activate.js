/**
 * Mortal Kombat Easter Egg — Fatality
 *
 * Trigger: Type "fatality"
 * Effect:  "FINISH HIM!" → "FATALITY" → page shatter → "FLAWLESS VICTORY"
 * Dismiss: Click or auto-dismiss after 10s
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var dismissTimer = null;
  var timers = [];
  var shatteredEls = [];

  var DRAGON_SVG =
    '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="ee-mk-dragon">' +
    '<!-- Simplified MK dragon silhouette -->' +
    '<path d="M100,15 C85,15 70,25 65,40 L55,35 L60,50 C50,55 42,68 42,80 ' +
    'C42,85 40,95 35,100 L30,105 L45,100 C48,108 55,115 60,118 ' +
    'L50,140 L65,130 C72,138 82,145 90,148 L85,175 L100,155 ' +
    'L115,175 L110,148 C118,145 128,138 135,130 L150,140 L140,118 ' +
    'C145,115 152,108 155,100 L170,105 L165,100 C160,95 158,85 158,80 ' +
    'C158,68 150,55 140,50 L145,35 L135,40 C130,25 115,15 100,15Z" ' +
    'fill="none" stroke="#8B0000" stroke-width="2" opacity="0.5"/>' +
    '<!-- Eyes -->' +
    '<circle cx="82" cy="55" r="4" fill="#FF0000" opacity="0.7"/>' +
    '<circle cx="118" cy="55" r="4" fill="#FF0000" opacity="0.7"/>' +
    '</svg>';

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-mk-vignette"></div>' +
      DRAGON_SVG +
      '<div class="ee-mk-text ee-mk-finish">FINISH HIM!</div>' +
      '<div class="ee-mk-text ee-mk-fatality">FATALITY</div>' +
      '<div class="ee-mk-text ee-mk-flawless">FLAWLESS VICTORY</div>',
      "ee-mk-overlay"
    );

    overlayEl.addEventListener("click", deactivate);

    // Phase 1: FINISH HIM! (already visible via CSS animation)
    // Phase 2: FATALITY at 2.5s
    timers.push(setTimeout(function () {
      if (!overlayEl) return;
      overlayEl.querySelector(".ee-mk-finish").classList.add("ee-mk-hide");
      overlayEl.querySelector(".ee-mk-fatality").classList.add("ee-mk-show");
      shatterPage();
    }, 2500));

    // Phase 3: FLAWLESS VICTORY at 5s
    timers.push(setTimeout(function () {
      if (!overlayEl) return;
      overlayEl.querySelector(".ee-mk-flawless").classList.add("ee-mk-show");
    }, 5000));

    dismissTimer = setTimeout(deactivate, 10000);
  }

  function shatterPage() {
    var els = document.querySelectorAll("main > *, article > *, .content > *, header, footer, p, h1, h2, h3, li, blockquote, img");
    for (var i = 0; i < els.length && i < 30; i++) {
      var el = els[i];
      if (el.closest(".ee-mk-overlay")) continue;
      var rx = -20 + Math.random() * 40;
      var ry = -60 + Math.random() * 120;
      var rot = -15 + Math.random() * 30;
      el.style.transition = "transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.5s";
      el.style.transform = "translate(" + rx + "px," + ry + "px) rotate(" + rot + "deg)";
      el.style.opacity = "0.4";
      shatteredEls.push(el);
    }
  }

  function unshatterPage() {
    for (var i = 0; i < shatteredEls.length; i++) {
      shatteredEls[i].style.transform = "";
      shatteredEls[i].style.opacity = "";
      // Clean up transition after restore
      (function (el) {
        setTimeout(function () { el.style.transition = ""; }, 600);
      })(shatteredEls[i]);
    }
    shatteredEls = [];
  }

  function deactivate() {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    unshatterPage();
    if (overlayEl) {
      overlayEl.classList.add("ee-mk-dismiss");
      var el = overlayEl;
      setTimeout(function () { EasterEggs.removeElement(el); }, 600);
      overlayEl = null;
    }
    EasterEggs._activeEggs.delete("mortalkombat");
  }

  function getCSS() {
    return "" +
      ".ee-mk-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:all;cursor:pointer;overflow:hidden;animation:ee-mk-fadein 0.5s}" +

      /* Vignette */
      ".ee-mk-vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.95) 100%)}" +

      /* Dragon */
      ".ee-mk-dragon{position:absolute;top:50%;left:50%;width:300px;height:300px;transform:translate(-50%,-50%);opacity:0;animation:ee-mk-dragon-in 2s 0.5s forwards}" +
      "@keyframes ee-mk-dragon-in{to{opacity:0.3}}" +

      /* Shared text styles */
      ".ee-mk-text{position:absolute;left:50%;transform:translateX(-50%);font-family:'Impact','Arial Black',sans-serif;text-transform:uppercase;z-index:2;opacity:0;pointer-events:none}" +

      /* FINISH HIM */
      ".ee-mk-finish{top:35%;font-size:72px;color:#fff;text-shadow:0 0 20px #ff0,0 0 40px #f80,3px 3px 0 #000;animation:ee-mk-shake 0.1s infinite,ee-mk-text-in 0.5s 0.2s forwards;letter-spacing:6px}" +
      ".ee-mk-finish.ee-mk-hide{animation:ee-mk-text-out 0.3s forwards}" +

      /* FATALITY */
      ".ee-mk-fatality{top:30%;font-size:90px;color:#ff0000;text-shadow:0 0 30px rgba(255,0,0,0.8),0 4px 0 #600,0 0 60px rgba(255,0,0,0.4);letter-spacing:8px}" +
      ".ee-mk-fatality.ee-mk-show{animation:ee-mk-fatality-in 0.6s forwards}" +
      "@keyframes ee-mk-fatality-in{0%{opacity:0;transform:translateX(-50%) scale(3)}40%{opacity:1;transform:translateX(-50%) scale(0.95)}60%{transform:translateX(-50%) scale(1.05)}100%{opacity:1;transform:translateX(-50%) scale(1)}}" +

      /* FLAWLESS VICTORY */
      ".ee-mk-flawless{top:55%;font-size:32px;color:#FFD700;text-shadow:0 0 15px rgba(255,215,0,0.5);letter-spacing:6px}" +
      ".ee-mk-flawless.ee-mk-show{animation:ee-mk-text-in 0.8s forwards}" +

      /* Animations */
      "@keyframes ee-mk-text-in{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}" +
      "@keyframes ee-mk-text-out{to{opacity:0;transform:translateX(-50%) translateY(-20px)}}" +
      "@keyframes ee-mk-shake{0%,100%{transform:translateX(-50%) rotate(-0.5deg)}50%{transform:translateX(-50%) rotate(0.5deg)}}" +
      "@keyframes ee-mk-fadein{from{opacity:0}to{opacity:1}}" +

      /* Dismiss */
      ".ee-mk-dismiss{animation:ee-mk-fadeout 0.5s forwards;pointer-events:none}" +
      "@keyframes ee-mk-fadeout{to{opacity:0}}";
  }

  EasterEggs.register("mortalkombat", {
    trigger: "fatality",
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("mortalkombat");
})();
