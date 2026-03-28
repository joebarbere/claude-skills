/**
 * Pac-Man Easter Egg
 *
 * Trigger: Type "wakawaka"
 * Effect:  Pac-Man chases ghosts across the screen, eating dots along the way.
 *          Classic yellow chomp animation. Ghosts turn blue and flee.
 * Dismiss: Click or wait 10 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    // Build dot row
    var dots = "";
    for (var i = 0; i < 25; i++) {
      dots += '<div class="ee-pm-dot" style="left:' + (i * 4 + 2) + '%"></div>';
    }

    var ghostColors = ["#ff0000", "#ffb8ff", "#00ffff", "#ffb852"];
    var ghosts = "";
    for (var g = 0; g < 4; g++) {
      ghosts += '<div class="ee-pm-ghost" style="--gc:' + ghostColors[g] + ';animation-delay:' + (g * 0.15) + 's">' +
        '<svg viewBox="0 0 28 30"><path d="M0,30 L0,14 Q0,0 14,0 Q28,0 28,14 L28,30 L24,25 L20,30 L14,25 L8,30 L4,25Z" fill="' + ghostColors[g] + '"/>' +
        '<circle cx="9" cy="12" r="4" fill="#fff"/><circle cx="19" cy="12" r="4" fill="#fff"/>' +
        '<circle cx="10" cy="12" r="2.5" fill="#00f"/><circle cx="20" cy="12" r="2.5" fill="#00f"/></svg></div>';
    }

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-pm-screen">' +
        '<div class="ee-pm-track">' +
          dots +
          '<div class="ee-pm-pacman"><div class="ee-pm-top"></div><div class="ee-pm-bottom"></div></div>' +
          '<div class="ee-pm-ghosts">' + ghosts + '</div>' +
        '</div>' +
        '<div class="ee-pm-score">SCORE: 9999</div>' +
      '</div>',
      "ee-pm-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    // After 4s, ghosts turn blue (power pellet)
    setTimeout(function () {
      if (!overlayEl) return;
      var gs = overlayEl.querySelectorAll(".ee-pm-ghost");
      for (var i = 0; i < gs.length; i++) {
        gs[i].classList.add("ee-pm-ghost-scared");
      }
    }, 4000);

    timer = setTimeout(dismiss, 10000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-pm-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("wakawaka");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-pm-overlay{position:fixed;inset:0;z-index:99999;animation:ee-pm-in 0.3s ease-out}" +
      "@keyframes ee-pm-in{from{opacity:0}to{opacity:1}}" +
      ".ee-pm-out{animation:ee-pm-fade 0.4s ease-in forwards}" +
      "@keyframes ee-pm-fade{to{opacity:0}}" +
      ".ee-pm-screen{width:100%;height:100%;background:#000;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}" +
      ".ee-pm-track{position:relative;width:100%;height:40px}" +
      /* Dots */
      ".ee-pm-dot{position:absolute;top:50%;transform:translateY(-50%);width:6px;height:6px;border-radius:50%;background:#ffb8ae}" +
      /* Pac-Man CSS shape */
      ".ee-pm-pacman{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:32px;animation:ee-pm-move 6s linear forwards}" +
      "@keyframes ee-pm-move{from{left:-40px}to{left:110%}}" +
      ".ee-pm-top{position:absolute;width:32px;height:16px;background:#ffff00;border-radius:16px 16px 0 0;animation:ee-pm-chomp-top 0.15s linear infinite alternate}" +
      ".ee-pm-bottom{position:absolute;top:16px;width:32px;height:16px;background:#ffff00;border-radius:0 0 16px 16px;animation:ee-pm-chomp-bot 0.15s linear infinite alternate}" +
      "@keyframes ee-pm-chomp-top{from{transform:rotate(0)}to{transform:rotate(-25deg);transform-origin:bottom center}}" +
      "@keyframes ee-pm-chomp-bot{from{transform:rotate(0)}to{transform:rotate(25deg);transform-origin:top center}}" +
      /* Ghosts */
      ".ee-pm-ghosts{position:absolute;top:50%;transform:translateY(-50%);animation:ee-pm-ghost-move 6s linear forwards}" +
      "@keyframes ee-pm-ghost-move{from{right:calc(100% + 80px)}to{right:-200px}}" +
      ".ee-pm-ghost{display:inline-block;width:28px;height:30px;margin-left:10px;animation:ee-pm-float 0.3s ease-in-out infinite alternate}" +
      "@keyframes ee-pm-float{from{transform:translateY(-2px)}to{transform:translateY(2px)}}" +
      ".ee-pm-ghost-scared svg path{fill:#2121de!important}" +
      ".ee-pm-score{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-family:'Courier New',monospace;font-size:16px;color:#fff;letter-spacing:2px}" +
      "";
  }

  EasterEggs.register("wakawaka", {
    trigger: "wakawaka",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("wakawaka");
})();
