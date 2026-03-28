/**
 * Super Mario 1-UP Easter Egg
 *
 * Trigger: Type "1up"
 * Effect:  Green 1-UP mushroom bounces up from bottom, "1 UP" text floats,
 *          coin block appears and dispenses coins, classic coin sound via Web Audio
 * Dismiss: Click or wait 8 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var audioCtx = null;

  var MUSHROOM_SVG =
    '<svg viewBox="0 0 40 44" class="ee-mu-shroom">' +
    '<!-- Cap -->' +
    '<ellipse cx="20" cy="18" rx="18" ry="16" fill="#33cc33"/>' +
    '<circle cx="12" cy="14" r="5" fill="#fff"/>' +
    '<circle cx="28" cy="14" r="5" fill="#fff"/>' +
    '<circle cx="20" cy="8" r="4" fill="#fff"/>' +
    '<!-- Stem -->' +
    '<rect x="10" y="28" width="20" height="14" rx="3" fill="#f5deb3"/>' +
    '<!-- Eyes -->' +
    '<circle cx="15" cy="20" r="2" fill="#000"/>' +
    '<circle cx="25" cy="20" r="2" fill="#000"/>' +
    '</svg>';

  var BLOCK_SVG =
    '<svg viewBox="0 0 32 32" class="ee-mu-block">' +
    '<rect x="1" y="1" width="30" height="30" rx="2" fill="#D2691E" stroke="#8B4513" stroke-width="1.5"/>' +
    '<text x="16" y="22" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#FFD700">?</text>' +
    '</svg>';

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-mu-screen">' +
        '<div class="ee-mu-block-wrap">' + BLOCK_SVG + '</div>' +
        '<div class="ee-mu-shroom-wrap">' + MUSHROOM_SVG + '</div>' +
        '<div class="ee-mu-text">1 UP</div>' +
        '<div class="ee-mu-coins"></div>' +
      '</div>',
      "ee-mu-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    // Spawn coins
    var coinContainer = overlayEl.querySelector(".ee-mu-coins");
    for (var i = 0; i < 5; i++) {
      (function (delay) {
        setTimeout(function () {
          if (!coinContainer) return;
          var coin = document.createElement("div");
          coin.className = "ee-mu-coin";
          coin.style.left = (40 + Math.random() * 20) + "%";
          coinContainer.appendChild(coin);
        }, delay);
      })(800 + i * 400);
    }

    playCoinSound();
    timer = setTimeout(dismiss, 8000);
  }

  function playCoinSound() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      var now = audioCtx.currentTime;

      // Classic coin sound: B5 then E6
      var osc1 = audioCtx.createOscillator();
      var g1 = audioCtx.createGain();
      osc1.type = "square";
      osc1.frequency.value = 988;
      g1.gain.setValueAtTime(0.001, now);
      g1.gain.linearRampToValueAtTime(0.1, now + 0.005);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(g1);
      g1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.09);

      var osc2 = audioCtx.createOscillator();
      var g2 = audioCtx.createGain();
      osc2.type = "square";
      osc2.frequency.value = 1319;
      g2.gain.setValueAtTime(0.001, now + 0.08);
      g2.gain.linearRampToValueAtTime(0.1, now + 0.085);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(g2);
      g2.connect(audioCtx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.36);
    } catch (e) {}
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-mu-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("oneup");
      }, 400);
    }
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
  }

  function getCSS() {
    return "" +
      ".ee-mu-overlay{position:fixed;inset:0;z-index:99999;animation:ee-mu-in 0.3s ease-out}" +
      "@keyframes ee-mu-in{from{opacity:0}to{opacity:1}}" +
      ".ee-mu-out{animation:ee-mu-fade 0.4s ease-in forwards}" +
      "@keyframes ee-mu-fade{to{opacity:0}}" +
      ".ee-mu-screen{width:100%;height:100%;background:#6b88fe;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}" +
      ".ee-mu-block-wrap{position:absolute;top:35%;left:50%;transform:translateX(-50%);animation:ee-mu-bump 0.3s ease-out 0.3s both}" +
      "@keyframes ee-mu-bump{0%{transform:translateX(-50%) translateY(0)}30%{transform:translateX(-50%) translateY(-15px)}100%{transform:translateX(-50%) translateY(0)}}" +
      ".ee-mu-block{width:48px;height:48px}" +
      ".ee-mu-shroom-wrap{position:absolute;top:45%;left:50%;transform:translateX(-50%);animation:ee-mu-pop 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.5s both}" +
      "@keyframes ee-mu-pop{from{opacity:0;transform:translateX(-50%) translateY(40px) scale(0.3)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}" +
      ".ee-mu-shroom{width:60px;height:66px}" +
      ".ee-mu-text{position:absolute;top:25%;left:50%;transform:translateX(-50%);font-family:Arial,sans-serif;font-size:48px;font-weight:bold;color:#33cc33;text-shadow:2px 2px 0 #000;animation:ee-mu-float 1.5s ease-out 0.8s both}" +
      "@keyframes ee-mu-float{from{opacity:1;transform:translateX(-50%) translateY(0)}to{opacity:0;transform:translateX(-50%) translateY(-60px)}}" +
      ".ee-mu-coins{position:absolute;inset:0;pointer-events:none}" +
      ".ee-mu-coin{position:absolute;top:33%;width:16px;height:20px;background:#FFD700;border-radius:50%;border:2px solid #DAA520;animation:ee-mu-coin-fly 0.6s ease-out forwards}" +
      "@keyframes ee-mu-coin-fly{from{transform:translateY(0);opacity:1}to{transform:translateY(-80px);opacity:0}}" +
      "";
  }

  EasterEggs.register("oneup", {
    trigger: "1up",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("oneup");
})();
