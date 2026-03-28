/**
 * NBA Jam Easter Egg — Big Head Mode
 *
 * Trigger: Type "boomshakalaka"
 * Effect:  All images scale up, fire text, announcer callouts
 * Dismiss: Click "HE'S ON FIRE!" text, or auto-dismiss after 15s
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var dismissTimer = null;
  var calloutTimers = [];
  var bigHeadEls = [];

  var CALLOUTS = [
    "FROM DOWNTOWN!",
    "IS IT THE SHOES?!",
    "UGLY SHOT!",
    "THE NAIL IN THE COFFIN!",
    "RAZZLE DAZZLE!",
    "CAN'T BUY A BUCKET!",
    "HEATING UP!",
  ];

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    // Big head mode — scale up all images
    var imgs = document.querySelectorAll("img, .avatar, [class*=profile]");
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].classList.add("ee-nba-bighead");
      bigHeadEls.push(imgs[i]);
    }
    // Also enlarge headings if no images found
    if (bigHeadEls.length === 0) {
      var headings = document.querySelectorAll("h1, h2, h3");
      for (var j = 0; j < headings.length; j++) {
        headings[j].classList.add("ee-nba-bighead-text");
        bigHeadEls.push(headings[j]);
      }
    }

    document.body.classList.add("ee-nba-active");

    // Build overlay with fire text + score
    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-nba-fire-wrap">' +
        '<div class="ee-nba-fire-text">HE\'S ON FIRE!</div>' +
        '<div class="ee-nba-fire-glow"></div>' +
      '</div>' +
      '<div class="ee-nba-boom">BOOMSHAKALAKA!</div>' +
      '<div class="ee-nba-score">' +
        '<span class="ee-nba-team">VISITOR</span> <span class="ee-nba-pts">999</span>' +
        ' — ' +
        '<span class="ee-nba-pts">999</span> <span class="ee-nba-team">HOME</span>' +
      '</div>' +
      '<div class="ee-nba-callout-area"></div>',
      "ee-nba-overlay"
    );

    // Click the fire text to dismiss
    overlayEl.querySelector(".ee-nba-fire-text").addEventListener("click", function (e) {
      e.stopPropagation();
      deactivate();
    });

    // Stagger callout announcements
    var area = overlayEl.querySelector(".ee-nba-callout-area");
    for (var c = 0; c < CALLOUTS.length; c++) {
      (function (text, idx) {
        var t = setTimeout(function () {
          if (!area) return;
          var el = document.createElement("div");
          el.className = "ee-nba-callout";
          el.textContent = text;
          el.style.top = (20 + Math.random() * 60) + "%";
          el.style.left = (10 + Math.random() * 80) + "%";
          area.appendChild(el);
        }, 2000 + idx * 1500);
        calloutTimers.push(t);
      })(CALLOUTS[c], c);
    }

    dismissTimer = setTimeout(deactivate, 15000);
  }

  function deactivate() {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
    for (var i = 0; i < calloutTimers.length; i++) clearTimeout(calloutTimers[i]);
    calloutTimers = [];

    document.body.classList.remove("ee-nba-active");

    for (var j = 0; j < bigHeadEls.length; j++) {
      bigHeadEls[j].classList.remove("ee-nba-bighead");
      bigHeadEls[j].classList.remove("ee-nba-bighead-text");
    }
    bigHeadEls = [];

    if (overlayEl) {
      overlayEl.classList.add("ee-nba-dismiss");
      var el = overlayEl;
      setTimeout(function () { EasterEggs.removeElement(el); }, 600);
      overlayEl = null;
    }
    EasterEggs._activeEggs.delete("nbajam");
  }

  function getCSS() {
    return "" +
      /* Page effects */
      ".ee-nba-active{animation:ee-nba-bg-flash 0.3s 3}" +
      "@keyframes ee-nba-bg-flash{0%,100%{filter:none}50%{filter:brightness(1.1) saturate(1.3)}}" +

      /* Big head mode for images */
      ".ee-nba-bighead{transition:transform 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)!important;transform:scale(2)!important;z-index:10;position:relative}" +
      ".ee-nba-bighead-text{transition:font-size 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)!important;font-size:300%!important;animation:ee-nba-wobble 0.5s ease-in-out infinite alternate}" +
      "@keyframes ee-nba-wobble{0%{transform:rotate(-2deg)}100%{transform:rotate(2deg)}}" +

      /* Overlay — mostly transparent so you see the big heads */
      ".ee-nba-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;overflow:hidden}" +

      /* Fire text */
      ".ee-nba-fire-wrap{position:absolute;top:10%;left:50%;transform:translateX(-50%);text-align:center;pointer-events:auto;cursor:pointer}" +
      ".ee-nba-fire-text{font-family:Impact,'Arial Black',sans-serif;font-size:64px;font-weight:bold;color:#FF4500;" +
        "text-shadow:0 0 20px #FF8C00,0 0 40px #FF4500,0 0 80px #FF0000,0 -5px 15px rgba(255,100,0,0.7);" +
        "animation:ee-nba-fire-pulse 0.3s ease-in-out infinite alternate;letter-spacing:4px}" +
      "@keyframes ee-nba-fire-pulse{0%{text-shadow:0 0 20px #FF8C00,0 0 40px #FF4500,0 0 80px #FF0000,0 -5px 15px rgba(255,100,0,0.7);transform:scale(1)}100%{text-shadow:0 0 30px #FFD700,0 0 60px #FF8C00,0 0 100px #FF4500,0 -8px 20px rgba(255,100,0,0.9);transform:scale(1.05)}}" +

      /* BOOMSHAKALAKA */
      ".ee-nba-boom{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:Impact,'Arial Black',sans-serif;font-size:80px;color:#fff;text-shadow:4px 4px 0 #000,0 0 30px rgba(255,255,0,0.5);white-space:nowrap;opacity:0;animation:ee-nba-slam 0.6s 0.3s forwards;pointer-events:none;letter-spacing:3px}" +
      "@keyframes ee-nba-slam{0%{opacity:0;transform:translate(-50%,-200%) scale(2)}60%{opacity:1;transform:translate(-50%,-50%) scale(0.9)}80%{transform:translate(-50%,-50%) scale(1.1)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}" +

      /* Score */
      ".ee-nba-score{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);font-family:'Courier New',monospace;font-size:22px;color:#FFD700;text-shadow:1px 1px 0 #000;white-space:nowrap;opacity:0;animation:ee-nba-fadein 0.5s 1s forwards;pointer-events:none}" +
      ".ee-nba-team{font-size:14px;color:#aaa;letter-spacing:2px}" +
      ".ee-nba-pts{font-size:28px;font-weight:bold}" +

      /* Callout area */
      ".ee-nba-callout-area{position:absolute;inset:0;pointer-events:none;overflow:hidden}" +
      ".ee-nba-callout{position:absolute;font-family:Impact,'Arial Black',sans-serif;font-size:36px;color:#fff;text-shadow:2px 2px 0 #000;opacity:0;animation:ee-nba-callout-pop 1.5s forwards;white-space:nowrap}" +
      "@keyframes ee-nba-callout-pop{0%{opacity:0;transform:scale(0.5)}15%{opacity:1;transform:scale(1.2)}30%{transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:translateY(-30px)}}" +

      "@keyframes ee-nba-fadein{from{opacity:0}to{opacity:1}}" +
      ".ee-nba-dismiss{animation:ee-nba-fadeout 0.5s forwards}" +
      "@keyframes ee-nba-fadeout{to{opacity:0}}";
  }

  EasterEggs.register("nbajam", {
    trigger: "boomshakalaka",
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("nbajam");
})();
