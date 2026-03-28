/**
 * Space Invaders Easter Egg
 *
 * Trigger: Type "invaders"
 * Effect:  Pixel-art space invaders descend from top of page, classic formation,
 *          player ship at bottom fires auto-shots. Explosion effects when hit.
 * Dismiss: Click or wait 12 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var animFrame = null;
  var canvas = null;
  var ctx = null;

  // 8x8 pixel patterns for invaders (1 = filled)
  var INVADER_A = [
    [0,0,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,1,0,0,0,0],
    [0,0,1,1,1,1,1,0,0,0],
    [0,1,1,0,1,0,1,1,0,0],
    [1,1,1,1,1,1,1,1,1,0],
    [1,0,1,1,1,1,1,0,1,0],
    [1,0,1,0,0,0,1,0,1,0],
    [0,0,0,1,1,1,0,0,0,0],
  ];

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-si-screen"><canvas class="ee-si-canvas"></canvas>' +
      '<div class="ee-si-score">SCORE: 1337</div></div>',
      "ee-si-overlay"
    );
    overlayEl.addEventListener("click", dismiss);

    canvas = overlayEl.querySelector(".ee-si-canvas");
    canvas.width = 400;
    canvas.height = 500;
    ctx = canvas.getContext("2d");

    var invaders = [];
    var cols = 8, rows = 4;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        invaders.push({ x: 40 + c * 40, y: 30 + r * 35, alive: true, flash: 0 });
      }
    }

    var bullets = [];
    var shipX = 200;
    var dir = 1;
    var stepDown = 0;
    var shotTimer = 0;
    var t = 0;

    function drawInvader(x, y, color) {
      var s = 3;
      ctx.fillStyle = color;
      for (var r = 0; r < INVADER_A.length; r++) {
        for (var c = 0; c < INVADER_A[r].length; c++) {
          if (INVADER_A[r][c]) ctx.fillRect(x + c * s, y + r * s, s, s);
        }
      }
    }

    function loop() {
      t++;
      ctx.clearRect(0, 0, 400, 500);

      // Move invaders
      if (t % 30 === 0) {
        var hitEdge = false;
        for (var i = 0; i < invaders.length; i++) {
          if (!invaders[i].alive) continue;
          if ((dir > 0 && invaders[i].x > 350) || (dir < 0 && invaders[i].x < 20)) hitEdge = true;
        }
        if (hitEdge) { dir *= -1; stepDown = 10; }
        for (var j = 0; j < invaders.length; j++) {
          if (!invaders[j].alive) continue;
          invaders[j].x += dir * 8;
          if (stepDown > 0) invaders[j].y += 5;
        }
        if (stepDown > 0) stepDown--;
      }

      // Draw invaders
      for (var k = 0; k < invaders.length; k++) {
        var inv = invaders[k];
        if (!inv.alive) continue;
        if (inv.flash > 0) {
          inv.flash--;
          ctx.fillStyle = "#fff";
          ctx.fillRect(inv.x - 5, inv.y - 5, 35, 30);
          if (inv.flash === 0) inv.alive = false;
          continue;
        }
        var color = k % 3 === 0 ? "#33ff33" : k % 3 === 1 ? "#33ccff" : "#ff3333";
        drawInvader(inv.x, inv.y, color);
      }

      // Ship
      ctx.fillStyle = "#33ff33";
      ctx.fillRect(shipX - 10, 470, 20, 8);
      ctx.fillRect(shipX - 2, 462, 4, 8);
      shipX += Math.sin(t * 0.03) * 2;

      // Auto-fire
      shotTimer++;
      if (shotTimer > 20) {
        shotTimer = 0;
        bullets.push({ x: shipX, y: 460 });
      }

      // Bullets
      ctx.fillStyle = "#fff";
      for (var b = bullets.length - 1; b >= 0; b--) {
        bullets[b].y -= 5;
        ctx.fillRect(bullets[b].x - 1, bullets[b].y, 2, 6);
        if (bullets[b].y < 0) { bullets.splice(b, 1); continue; }
        // Collision
        for (var n = 0; n < invaders.length; n++) {
          if (!invaders[n].alive || invaders[n].flash > 0) continue;
          if (bullets[b] && Math.abs(bullets[b].x - invaders[n].x - 12) < 15 && Math.abs(bullets[b].y - invaders[n].y - 10) < 15) {
            invaders[n].flash = 5;
            bullets.splice(b, 1);
            break;
          }
        }
      }

      animFrame = requestAnimationFrame(loop);
    }

    animFrame = requestAnimationFrame(loop);
    timer = setTimeout(dismiss, 12000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-si-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        canvas = null;
        ctx = null;
        EasterEggs._activeEggs.delete("invaders");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-si-overlay{position:fixed;inset:0;z-index:99999;animation:ee-si-in 0.3s ease-out}" +
      "@keyframes ee-si-in{from{opacity:0}to{opacity:1}}" +
      ".ee-si-out{animation:ee-si-fade 0.4s ease-in forwards}" +
      "@keyframes ee-si-fade{to{opacity:0}}" +
      ".ee-si-screen{width:100%;height:100%;background:#000;display:flex;align-items:center;justify-content:center;position:relative}" +
      ".ee-si-canvas{image-rendering:pixelated}" +
      ".ee-si-score{position:absolute;top:15px;left:50%;transform:translateX(-50%);font-family:'Courier New',monospace;font-size:16px;color:#33ff33;letter-spacing:2px}" +
      "";
  }

  EasterEggs.register("invaders", {
    trigger: "invaders",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("invaders");
})();
