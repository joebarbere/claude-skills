/**
 * Zelda Triforce Easter Egg
 *
 * Trigger: Type "triforce"
 * Effect:  Golden Triforce symbol materializes with particle sparkles,
 *          "It's dangerous to go alone! Take this." text, secret chime via Web Audio
 * Dismiss: Click or wait 10 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var audioCtx = null;

  var TRIFORCE_SVG =
    '<svg viewBox="0 0 200 180" class="ee-zl-tri">' +
    '<!-- Top triangle -->' +
    '<polygon points="100,10 140,75 60,75" fill="#FFD700" class="ee-zl-t ee-zl-t1"/>' +
    '<!-- Bottom left -->' +
    '<polygon points="60,80 100,145 20,145" fill="#FFD700" class="ee-zl-t ee-zl-t2"/>' +
    '<!-- Bottom right -->' +
    '<polygon points="140,80 180,145 100,145" fill="#FFD700" class="ee-zl-t ee-zl-t3"/>' +
    '</svg>';

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-zl-screen">' +
        '<div class="ee-zl-sparkles"></div>' +
        TRIFORCE_SVG +
        '<div class="ee-zl-text">It\'s dangerous to go alone!<br>Take this.</div>' +
      '</div>',
      "ee-zl-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    // Spawn sparkle particles
    var sparkleContainer = overlayEl.querySelector(".ee-zl-sparkles");
    for (var i = 0; i < 30; i++) {
      (function (delay) {
        setTimeout(function () {
          if (!sparkleContainer) return;
          var s = document.createElement("div");
          s.className = "ee-zl-spark";
          s.style.left = (30 + Math.random() * 40) + "%";
          s.style.top = (20 + Math.random() * 40) + "%";
          s.style.animationDelay = (Math.random() * 2) + "s";
          sparkleContainer.appendChild(s);
        }, delay);
      })(i * 100);
    }

    playChime();
    timer = setTimeout(dismiss, 10000);
  }

  function playChime() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      var now = audioCtx.currentTime;

      // Zelda secret chime: ascending notes
      var notes = [587.33, 659.25, 739.99, 880.00, 987.77, 1174.66];
      for (var i = 0; i < notes.length; i++) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.value = notes[i];
        var t = now + i * 0.12;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.26);
      }
    } catch (e) {}
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-zl-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("triforce");
      }, 400);
    }
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
  }

  function getCSS() {
    return "" +
      ".ee-zl-overlay{position:fixed;inset:0;z-index:99999;animation:ee-zl-in 0.6s ease-out}" +
      "@keyframes ee-zl-in{from{opacity:0}to{opacity:1}}" +
      ".ee-zl-out{animation:ee-zl-fade 0.4s ease-in forwards}" +
      "@keyframes ee-zl-fade{to{opacity:0}}" +
      ".ee-zl-screen{width:100%;height:100%;background:radial-gradient(ellipse at center,#1a1a0a 0%,#000 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;position:relative}" +
      ".ee-zl-tri{width:200px;height:180px;filter:drop-shadow(0 0 20px rgba(255,215,0,0.6));animation:ee-zl-glow 2s ease-in-out infinite alternate}" +
      "@keyframes ee-zl-glow{0%{filter:drop-shadow(0 0 20px rgba(255,215,0,0.4))}100%{filter:drop-shadow(0 0 35px rgba(255,215,0,0.8))}}" +
      ".ee-zl-t{opacity:0}" +
      ".ee-zl-t1{animation:ee-zl-appear 0.5s ease-out 0.3s forwards}" +
      ".ee-zl-t2{animation:ee-zl-appear 0.5s ease-out 0.6s forwards}" +
      ".ee-zl-t3{animation:ee-zl-appear 0.5s ease-out 0.9s forwards}" +
      "@keyframes ee-zl-appear{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}" +
      ".ee-zl-text{margin-top:30px;font-family:'Courier New',monospace;font-size:18px;color:#FFD700;text-align:center;text-shadow:0 0 10px rgba(255,215,0,0.5);opacity:0;animation:ee-zl-text-in 0.6s ease-out 1.5s forwards}" +
      "@keyframes ee-zl-text-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}" +
      ".ee-zl-sparkles{position:absolute;inset:0;pointer-events:none}" +
      ".ee-zl-spark{position:absolute;width:4px;height:4px;background:#FFD700;border-radius:50%;animation:ee-zl-twinkle 1.5s ease-in-out infinite}" +
      "@keyframes ee-zl-twinkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1.5)}}" +
      "";
  }

  EasterEggs.register("triforce", {
    trigger: "triforce",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("triforce");
})();
