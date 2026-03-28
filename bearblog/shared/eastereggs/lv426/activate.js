/**
 * Aliens Motion Tracker Easter Egg
 *
 * Trigger: Type "lv426"
 * Effect:  Alien motion tracker radar display with sweeping line, random blips
 *          getting closer, distance readout, and pinging sound via Web Audio
 * Dismiss: Click or wait 15 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var animFrame = null;
  var canvas = null;
  var ctx = null;
  var audioCtx = null;
  var pingInterval = null;

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-al-screen">' +
        '<canvas class="ee-al-canvas" width="300" height="300"></canvas>' +
        '<div class="ee-al-readout">TRACKING... <span class="ee-al-dist">1500m</span></div>' +
        '<div class="ee-al-quote">"They\'re coming outta the walls!"</div>' +
      '</div>',
      "ee-al-overlay"
    );
    overlayEl.addEventListener("click", dismiss);

    canvas = overlayEl.querySelector(".ee-al-canvas");
    ctx = canvas.getContext("2d");

    var cx = 150, cy = 150, radius = 130;
    var angle = 0;
    var blips = [];
    var distEl = overlayEl.querySelector(".ee-al-dist");
    var dist = 1500;

    // Generate initial blips
    for (var i = 0; i < 5; i++) {
      blips.push({
        a: Math.random() * Math.PI * 2,
        r: 60 + Math.random() * 60,
        fade: 0,
      });
    }

    // Audio
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        audioCtx = new AC();
        if (audioCtx.state === "suspended") audioCtx.resume();
      }
    } catch (e) {}

    function ping() {
      if (!audioCtx) return;
      try {
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.value = 1200;
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.08, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    }

    pingInterval = setInterval(ping, 800);

    function draw() {
      ctx.clearRect(0, 0, 300, 300);

      // Background circles
      ctx.strokeStyle = "rgba(0,180,0,0.2)";
      ctx.lineWidth = 1;
      for (var r = 30; r <= radius; r += 30) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Sweep line
      angle += 0.04;
      ctx.strokeStyle = "rgba(0,255,0,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();

      // Sweep trail
      var grad = ctx.createConicalGradient ? null : null; // fallback
      ctx.fillStyle = "rgba(0,180,0,0.05)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle - 0.8, angle);
      ctx.fill();

      // Blips
      for (var b = 0; b < blips.length; b++) {
        var blip = blips[b];
        // Check if sweep just passed
        var bAngle = ((blip.a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        var sAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (Math.abs(bAngle - sAngle) < 0.1) blip.fade = 1.0;

        if (blip.fade > 0) {
          ctx.fillStyle = "rgba(0,255,0," + blip.fade + ")";
          var bx = cx + Math.cos(blip.a) * blip.r;
          var by = cy + Math.sin(blip.a) * blip.r;
          ctx.beginPath();
          ctx.arc(bx, by, 4, 0, Math.PI * 2);
          ctx.fill();
          blip.fade -= 0.015;
        }

        // Blips drift closer
        blip.r = Math.max(10, blip.r - 0.05);
      }

      // Distance readout
      dist = Math.max(0, dist - 2);
      if (distEl) distEl.textContent = Math.floor(dist) + "m";

      animFrame = requestAnimationFrame(draw);
    }

    animFrame = requestAnimationFrame(draw);
    timer = setTimeout(dismiss, 15000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    if (pingInterval) { clearInterval(pingInterval); pingInterval = null; }
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-al-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        canvas = null;
        ctx = null;
        EasterEggs._activeEggs.delete("lv426");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-al-overlay{position:fixed;inset:0;z-index:99999;animation:ee-al-in 0.4s ease-out}" +
      "@keyframes ee-al-in{from{opacity:0}to{opacity:1}}" +
      ".ee-al-out{animation:ee-al-fade 0.4s ease-in forwards}" +
      "@keyframes ee-al-fade{to{opacity:0}}" +
      ".ee-al-screen{width:100%;height:100%;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:15px}" +
      ".ee-al-canvas{border:2px solid #006600;border-radius:50%;background:#0a1a0a}" +
      ".ee-al-readout{font-family:'Courier New',monospace;font-size:14px;color:#00cc00;letter-spacing:2px}" +
      ".ee-al-dist{color:#00ff00;font-weight:bold}" +
      ".ee-al-quote{font-family:'Courier New',monospace;font-size:12px;color:#006600;font-style:italic;margin-top:10px;animation:ee-al-pulse 2s ease-in-out infinite}" +
      "@keyframes ee-al-pulse{0%,100%{opacity:0.5}50%{opacity:1}}" +
      "";
  }

  EasterEggs.register("lv426", {
    trigger: "lv426",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("lv426");
})();
