/**
 * Tetris Easter Egg
 *
 * Trigger: Type "tetris"
 * Effect:  Tetrominos rain down the page and stack at the bottom.
 *          Classic Tetris colors (I=cyan, O=yellow, T=purple, etc.)
 * Dismiss: Click or wait 12 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var pieces = [];
  var animFrame = null;
  var timer = null;
  var spawnTimer = null;

  var COLORS = ["#00f0f0", "#f0f000", "#a000f0", "#00f000", "#f00000", "#0000f0", "#f0a000"];
  var SHAPES = [
    [[1,1,1,1]],                  // I
    [[1,1],[1,1]],                // O
    [[0,1,0],[1,1,1]],            // T
    [[0,1,1],[1,1,0]],            // S
    [[1,1,0],[0,1,1]],            // Z
    [[1,0,0],[1,1,1]],            // J
    [[0,0,1],[1,1,1]],            // L
  ];

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());
    pieces = [];

    // Spawn pieces periodically
    spawnPiece();
    spawnTimer = setInterval(spawnPiece, 600);

    function spawnPiece() {
      var idx = Math.floor(Math.random() * SHAPES.length);
      var shape = SHAPES[idx];
      var color = COLORS[idx];
      var blockSize = 20;
      var x = Math.floor(Math.random() * (window.innerWidth - shape[0].length * blockSize));

      var el = document.createElement("div");
      el.className = "ee-tt-piece";
      el.style.left = x + "px";
      el.style.top = "-" + (shape.length * blockSize + 10) + "px";

      for (var r = 0; r < shape.length; r++) {
        for (var c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            var block = document.createElement("div");
            block.className = "ee-tt-block";
            block.style.left = (c * blockSize) + "px";
            block.style.top = (r * blockSize) + "px";
            block.style.background = color;
            block.style.width = blockSize + "px";
            block.style.height = blockSize + "px";
            el.appendChild(block);
          }
        }
      }

      document.body.appendChild(el);
      var speed = 1.5 + Math.random() * 2;
      var bottom = window.innerHeight - shape.length * blockSize;
      // Stack: earlier pieces land higher
      var stackY = bottom - (pieces.length % 5) * blockSize;
      pieces.push({ el: el, y: -(shape.length * blockSize), speed: speed, landed: false, target: stackY });
    }

    function loop() {
      for (var i = 0; i < pieces.length; i++) {
        var p = pieces[i];
        if (p.landed) continue;
        p.y += p.speed;
        if (p.y >= p.target) {
          p.y = p.target;
          p.landed = true;
        }
        p.el.style.top = p.y + "px";
      }
      animFrame = requestAnimationFrame(loop);
    }

    animFrame = requestAnimationFrame(loop);
    timer = setTimeout(dismiss, 12000);

    document.addEventListener("click", dismiss);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    document.removeEventListener("click", dismiss);
    for (var i = 0; i < pieces.length; i++) {
      EasterEggs.removeElement(pieces[i].el);
    }
    pieces = [];
    EasterEggs._activeEggs.delete("tetris");
  }

  function getCSS() {
    return "" +
      ".ee-tt-piece{position:fixed;z-index:99998;pointer-events:none}" +
      ".ee-tt-block{position:absolute;border:1px solid rgba(0,0,0,0.3);box-sizing:border-box;border-radius:1px;" +
        "box-shadow:inset 2px 2px 0 rgba(255,255,255,0.3),inset -2px -2px 0 rgba(0,0,0,0.2)}" +
      "";
  }

  EasterEggs.register("tetris", {
    trigger: "tetris",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("tetris");
})();
