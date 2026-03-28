/**
 * Rubik's Cube Easter Egg
 *
 * Trigger: Type "rubiks"
 * Effect:  3D CSS Rubik's cube that rotates and scrambles/solves itself
 * Dismiss: Click or wait 12 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var rotateTimer = null;

  var COLORS = {
    front: "#ff0000",
    back: "#ff8c00",
    top: "#ffffff",
    bottom: "#ffff00",
    left: "#00aa00",
    right: "#0000ff",
  };

  function buildFace(color) {
    var html = '<div class="ee-rb-face" style="--fc:' + color + '">';
    for (var i = 0; i < 9; i++) {
      html += '<div class="ee-rb-cell" style="background:' + color + '"></div>';
    }
    return html + "</div>";
  }

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-rb-screen">' +
        '<div class="ee-rb-scene">' +
          '<div class="ee-rb-cube">' +
            '<div class="ee-rb-side ee-rb-front">' + buildFace(COLORS.front) + '</div>' +
            '<div class="ee-rb-side ee-rb-back">' + buildFace(COLORS.back) + '</div>' +
            '<div class="ee-rb-side ee-rb-top">' + buildFace(COLORS.top) + '</div>' +
            '<div class="ee-rb-side ee-rb-bottom">' + buildFace(COLORS.bottom) + '</div>' +
            '<div class="ee-rb-side ee-rb-left">' + buildFace(COLORS.left) + '</div>' +
            '<div class="ee-rb-side ee-rb-right">' + buildFace(COLORS.right) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ee-rb-text">SOLVING...</div>' +
      '</div>',
      "ee-rb-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    // Animate scramble: randomize cell colors
    var cells = overlayEl.querySelectorAll(".ee-rb-cell");
    var allColors = Object.values(COLORS);
    var scrambleCount = 0;

    rotateTimer = setInterval(function () {
      scrambleCount++;
      if (scrambleCount <= 15) {
        // Scramble phase
        for (var i = 0; i < cells.length; i++) {
          cells[i].style.background = allColors[Math.floor(Math.random() * allColors.length)];
        }
      } else if (scrambleCount === 20) {
        // Solve phase — restore original colors
        var faces = overlayEl.querySelectorAll(".ee-rb-face");
        var faceColors = [COLORS.front, COLORS.back, COLORS.top, COLORS.bottom, COLORS.left, COLORS.right];
        for (var f = 0; f < faces.length; f++) {
          var faceCells = faces[f].querySelectorAll(".ee-rb-cell");
          for (var c = 0; c < faceCells.length; c++) {
            faceCells[c].style.background = faceColors[f];
          }
        }
        var textEl = overlayEl.querySelector(".ee-rb-text");
        if (textEl) textEl.textContent = "SOLVED!";
      }
    }, 300);

    timer = setTimeout(dismiss, 12000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-rb-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("rubiks");
      }, 400);
    }
  }

  function getCSS() {
    var s = 120; // cube size
    var h = s / 2;
    return "" +
      ".ee-rb-overlay{position:fixed;inset:0;z-index:99999;animation:ee-rb-in 0.4s ease-out}" +
      "@keyframes ee-rb-in{from{opacity:0}to{opacity:1}}" +
      ".ee-rb-out{animation:ee-rb-fade 0.4s ease-in forwards}" +
      "@keyframes ee-rb-fade{to{opacity:0}}" +
      ".ee-rb-screen{width:100%;height:100%;background:radial-gradient(ellipse at center,#222 0%,#0a0a0a 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px}" +
      ".ee-rb-scene{perspective:600px;width:" + s + "px;height:" + s + "px}" +
      ".ee-rb-cube{width:" + s + "px;height:" + s + "px;position:relative;transform-style:preserve-3d;animation:ee-rb-rotate 8s linear infinite}" +
      "@keyframes ee-rb-rotate{0%{transform:rotateX(-20deg) rotateY(0)}25%{transform:rotateX(30deg) rotateY(90deg)}50%{transform:rotateX(-10deg) rotateY(180deg)}75%{transform:rotateX(20deg) rotateY(270deg)}100%{transform:rotateX(-20deg) rotateY(360deg)}}" +
      ".ee-rb-side{position:absolute;width:" + s + "px;height:" + s + "px}" +
      ".ee-rb-front{transform:translateZ(" + h + "px)}" +
      ".ee-rb-back{transform:rotateY(180deg) translateZ(" + h + "px)}" +
      ".ee-rb-top{transform:rotateX(90deg) translateZ(" + h + "px)}" +
      ".ee-rb-bottom{transform:rotateX(-90deg) translateZ(" + h + "px)}" +
      ".ee-rb-left{transform:rotateY(-90deg) translateZ(" + h + "px)}" +
      ".ee-rb-right{transform:rotateY(90deg) translateZ(" + h + "px)}" +
      ".ee-rb-face{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px;width:100%;height:100%;padding:2px;box-sizing:border-box;background:#111}" +
      ".ee-rb-cell{border-radius:2px;transition:background 0.3s ease}" +
      ".ee-rb-text{font-family:'Courier New',monospace;font-size:16px;color:#fff;letter-spacing:4px;text-shadow:0 0 10px rgba(255,255,255,0.3)}" +
      "";
  }

  EasterEggs.register("rubiks", {
    trigger: "rubiks",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("rubiks");
})();
