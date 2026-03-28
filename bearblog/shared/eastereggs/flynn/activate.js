/**
 * Tron Lightcycle Easter Egg
 *
 * Trigger: Type "flynn"
 * Effect:  Neon grid landscape with lightcycles leaving glowing trails.
 *          Two cycles race across the grid. Classic Tron blue/orange color scheme.
 * Dismiss: Click or wait 10 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var animFrame = null;
  var canvas = null;
  var ctx = null;

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-tr-screen">' +
        '<canvas class="ee-tr-canvas" width="500" height="350"></canvas>' +
        '<div class="ee-tr-text">END OF LINE.</div>' +
      '</div>',
      "ee-tr-overlay"
    );
    overlayEl.addEventListener("click", dismiss);

    canvas = overlayEl.querySelector(".ee-tr-canvas");
    ctx = canvas.getContext("2d");

    // Two lightcycles with trails
    var cycle1 = { x: 50, y: 175, dx: 2.5, dy: 0, trail: [], color: "#00d4ff" };
    var cycle2 = { x: 450, y: 175, dx: -2.5, dy: 0, trail: [], color: "#ff6600" };
    var t = 0;

    function drawGrid() {
      ctx.strokeStyle = "rgba(0,100,180,0.15)";
      ctx.lineWidth = 0.5;
      for (var x = 0; x < 500; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 350); ctx.stroke();
      }
      for (var y = 0; y < 350; y += 25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(500, y); ctx.stroke();
      }
    }

    function updateCycle(c) {
      c.trail.push({ x: c.x, y: c.y });
      if (c.trail.length > 150) c.trail.shift();
      c.x += c.dx;
      c.y += c.dy;

      // Random turns
      if (Math.random() < 0.03) {
        if (c.dx !== 0) {
          c.dy = (Math.random() < 0.5 ? 2.5 : -2.5);
          c.dx = 0;
        } else {
          c.dx = (Math.random() < 0.5 ? 2.5 : -2.5);
          c.dy = 0;
        }
      }

      // Bounce off walls
      if (c.x < 5 || c.x > 495) c.dx *= -1;
      if (c.y < 5 || c.y > 345) c.dy *= -1;
    }

    function drawTrail(c) {
      if (c.trail.length < 2) return;
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(c.trail[0].x, c.trail[0].y);
      for (var i = 1; i < c.trail.length; i++) {
        ctx.lineTo(c.trail[i].x, c.trail[i].y);
      }
      ctx.lineTo(c.x, c.y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Cycle head glow
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    function loop() {
      t++;
      ctx.fillStyle = "rgba(0,5,15,0.15)";
      ctx.fillRect(0, 0, 500, 350);

      if (t % 10 === 0) drawGrid();

      updateCycle(cycle1);
      updateCycle(cycle2);
      drawTrail(cycle1);
      drawTrail(cycle2);

      animFrame = requestAnimationFrame(loop);
    }

    // Initial grid
    ctx.fillStyle = "#000510";
    ctx.fillRect(0, 0, 500, 350);
    drawGrid();

    animFrame = requestAnimationFrame(loop);
    timer = setTimeout(dismiss, 10000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-tr-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        canvas = null;
        ctx = null;
        EasterEggs._activeEggs.delete("flynn");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-tr-overlay{position:fixed;inset:0;z-index:99999;animation:ee-tr-in 0.4s ease-out}" +
      "@keyframes ee-tr-in{from{opacity:0}to{opacity:1}}" +
      ".ee-tr-out{animation:ee-tr-fade 0.4s ease-in forwards}" +
      "@keyframes ee-tr-fade{to{opacity:0}}" +
      ".ee-tr-screen{width:100%;height:100%;background:#000510;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px}" +
      ".ee-tr-canvas{border:1px solid rgba(0,100,180,0.3);border-radius:4px}" +
      ".ee-tr-text{font-family:'Courier New',monospace;font-size:18px;color:#00d4ff;letter-spacing:6px;text-shadow:0 0 10px #00d4ff;animation:ee-tr-pulse 2s ease-in-out infinite}" +
      "@keyframes ee-tr-pulse{0%,100%{opacity:0.6}50%{opacity:1}}" +
      "";
  }

  EasterEggs.register("flynn", {
    trigger: "flynn",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("flynn");
})();
