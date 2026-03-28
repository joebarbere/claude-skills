/**
 * Asteroids Easter Egg
 *
 * Trigger: Type "hyperspace"
 * Effect:  Classic Asteroids-style vector graphics with rotating ship and
 *          drifting asteroids. Ship auto-fires and asteroids split on hit.
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

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-as-screen">' +
        '<canvas class="ee-as-canvas" width="500" height="400"></canvas>' +
        '<div class="ee-as-score">SCORE: 4200</div>' +
      '</div>',
      "ee-as-overlay"
    );
    overlayEl.addEventListener("click", dismiss);

    canvas = overlayEl.querySelector(".ee-as-canvas");
    ctx = canvas.getContext("2d");

    var W = 500, H = 400;
    var ship = { x: W / 2, y: H / 2, angle: 0 };
    var asteroids = [];
    var bullets = [];
    var t = 0;

    // Spawn asteroids
    for (var i = 0; i < 6; i++) {
      asteroids.push(makeAsteroid(
        Math.random() * W, Math.random() * H,
        20 + Math.random() * 20
      ));
    }

    function makeAsteroid(x, y, size) {
      var verts = [];
      var numV = 7 + Math.floor(Math.random() * 5);
      for (var i = 0; i < numV; i++) {
        var a = (i / numV) * Math.PI * 2;
        var r = size * (0.7 + Math.random() * 0.3);
        verts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }
      return {
        x: x, y: y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: size,
        verts: verts,
        spin: (Math.random() - 0.5) * 0.02,
        angle: 0,
      };
    }

    function drawShip() {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-8, -7);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-8, 7);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    function drawAsteroid(a) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.angle);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a.verts[0].x, a.verts[0].y);
      for (var i = 1; i < a.verts.length; i++) {
        ctx.lineTo(a.verts[i].x, a.verts[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    function loop() {
      t++;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      // Rotate ship
      ship.angle += 0.02;

      // Auto-fire
      if (t % 25 === 0) {
        bullets.push({
          x: ship.x + Math.cos(ship.angle) * 12,
          y: ship.y + Math.sin(ship.angle) * 12,
          vx: Math.cos(ship.angle) * 4,
          vy: Math.sin(ship.angle) * 4,
          life: 60,
        });
      }

      // Update bullets
      ctx.fillStyle = "#fff";
      for (var b = bullets.length - 1; b >= 0; b--) {
        var bul = bullets[b];
        bul.x += bul.vx;
        bul.y += bul.vy;
        bul.life--;
        if (bul.life <= 0 || bul.x < 0 || bul.x > W || bul.y < 0 || bul.y > H) {
          bullets.splice(b, 1);
          continue;
        }
        ctx.fillRect(bul.x - 1, bul.y - 1, 2, 2);

        // Collision with asteroids
        for (var a = asteroids.length - 1; a >= 0; a--) {
          var dx = bul.x - asteroids[a].x;
          var dy = bul.y - asteroids[a].y;
          if (Math.sqrt(dx * dx + dy * dy) < asteroids[a].size) {
            // Split
            if (asteroids[a].size > 12) {
              asteroids.push(makeAsteroid(asteroids[a].x, asteroids[a].y, asteroids[a].size * 0.5));
              asteroids.push(makeAsteroid(asteroids[a].x, asteroids[a].y, asteroids[a].size * 0.5));
            }
            asteroids.splice(a, 1);
            bullets.splice(b, 1);
            break;
          }
        }
      }

      // Update and draw asteroids
      for (var j = 0; j < asteroids.length; j++) {
        var ast = asteroids[j];
        ast.x += ast.vx;
        ast.y += ast.vy;
        ast.angle += ast.spin;
        // Wrap
        if (ast.x < -ast.size) ast.x = W + ast.size;
        if (ast.x > W + ast.size) ast.x = -ast.size;
        if (ast.y < -ast.size) ast.y = H + ast.size;
        if (ast.y > H + ast.size) ast.y = -ast.size;
        drawAsteroid(ast);
      }

      drawShip();
      animFrame = requestAnimationFrame(loop);
    }

    animFrame = requestAnimationFrame(loop);
    timer = setTimeout(dismiss, 12000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-as-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        canvas = null;
        ctx = null;
        EasterEggs._activeEggs.delete("asteroids");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-as-overlay{position:fixed;inset:0;z-index:99999;animation:ee-as-in 0.3s ease-out}" +
      "@keyframes ee-as-in{from{opacity:0}to{opacity:1}}" +
      ".ee-as-out{animation:ee-as-fade 0.4s ease-in forwards}" +
      "@keyframes ee-as-fade{to{opacity:0}}" +
      ".ee-as-screen{width:100%;height:100%;background:#000;display:flex;align-items:center;justify-content:center;position:relative}" +
      ".ee-as-canvas{border:1px solid rgba(255,255,255,0.1)}" +
      ".ee-as-score{position:absolute;top:15px;left:50%;transform:translateX(-50%);font-family:'Courier New',monospace;font-size:16px;color:#fff;letter-spacing:2px}" +
      "";
  }

  EasterEggs.register("asteroids", {
    trigger: "hyperspace",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("asteroids");
})();
