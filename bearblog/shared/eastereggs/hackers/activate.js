/**
 * Hackers Easter Egg — Acid Burn
 *
 * Trigger: Type "acidburn"
 * Effect:  Glitch effect, neon colors, "HACK THE PLANET", matrix rain
 * Dismiss: Click or auto-dismiss after 10s
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var canvasEl = null;
  var rafId = null;
  var dismissTimer = null;
  var corruptedEls = [];

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    document.body.classList.add("ee-hack-glitch");

    // Corrupt random page elements
    var all = document.querySelectorAll("p, h1, h2, h3, li, a, span, blockquote");
    var count = Math.min(all.length, 15);
    for (var i = 0; i < count; i++) {
      var idx = Math.floor(Math.random() * all.length);
      all[idx].classList.add("ee-hack-corrupt");
      corruptedEls.push(all[idx]);
    }

    overlayEl = EasterEggs.injectOverlay(
      '<canvas class="ee-hack-rain"></canvas>' +
      '<div class="ee-hack-color-wash"></div>' +
      '<div class="ee-hack-title">HACK THE PLANET</div>' +
      '<div class="ee-hack-sub">// acid burn was here</div>' +
      '<div class="ee-hack-flame">' + getFlamesSVG() + '</div>',
      "ee-hack-overlay"
    );

    overlayEl.addEventListener("click", deactivate);

    // Matrix rain on canvas
    canvasEl = overlayEl.querySelector(".ee-hack-rain");
    startMatrixRain(canvasEl);

    dismissTimer = setTimeout(deactivate, 10000);
  }

  function startMatrixRain(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");
    var cols = Math.floor(canvas.width / 16);
    var drops = [];
    for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;

    var chars = "01ABCDEFHACKTHEPLANET!@#$%^&*(){}[]<>/\\|~";

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f0";
      ctx.font = "14px monospace";
      for (var i = 0; i < cols; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        var x = i * 16;
        var y = drops[i] * 16;
        // Alternate green/cyan/magenta
        var colors = ["#0f0", "#0ff", "#f0f"];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillText(ch, x, y);
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      rafId = requestAnimationFrame(draw);
    }
    draw();
  }

  function deactivate() {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    document.body.classList.remove("ee-hack-glitch");

    for (var i = 0; i < corruptedEls.length; i++) {
      corruptedEls[i].classList.remove("ee-hack-corrupt");
    }
    corruptedEls = [];

    if (overlayEl) {
      overlayEl.classList.add("ee-hack-dismiss");
      var el = overlayEl;
      setTimeout(function () { EasterEggs.removeElement(el); }, 600);
      overlayEl = null;
    }
    EasterEggs._activeEggs.delete("hackers");
  }

  function getFlamesSVG() {
    return '<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M60,90 Q70,40 80,60 Q90,20 100,50 Q110,10 120,55 Q130,30 140,90Z" fill="none" stroke="#f0f" stroke-width="1.5" opacity="0.5">' +
      '<animate attributeName="d" dur="1s" repeatCount="indefinite" values="' +
      'M60,90 Q70,40 80,60 Q90,20 100,50 Q110,10 120,55 Q130,30 140,90Z;' +
      'M60,90 Q70,50 80,55 Q90,15 100,45 Q110,20 120,60 Q130,35 140,90Z;' +
      'M60,90 Q70,40 80,60 Q90,20 100,50 Q110,10 120,55 Q130,30 140,90Z"/>' +
      '</path>' +
      '<path d="M70,90 Q80,50 90,65 Q100,30 110,55 Q120,25 130,90Z" fill="none" stroke="#0ff" stroke-width="1" opacity="0.4">' +
      '<animate attributeName="d" dur="0.8s" repeatCount="indefinite" values="' +
      'M70,90 Q80,50 90,65 Q100,30 110,55 Q120,25 130,90Z;' +
      'M70,90 Q80,55 90,60 Q100,25 110,50 Q120,30 130,90Z;' +
      'M70,90 Q80,50 90,65 Q100,30 110,55 Q120,25 130,90Z"/>' +
      '</path></svg>';
  }

  function getCSS() {
    return "" +
      /* Page glitch effect */
      ".ee-hack-glitch{animation:ee-hack-jitter 0.15s infinite}" +
      "@keyframes ee-hack-jitter{0%{transform:translate(0)}20%{transform:translate(-2px,1px)}40%{transform:translate(2px,-1px)}60%{transform:translate(-1px,2px)}80%{transform:translate(1px,-2px)}100%{transform:translate(0)}}" +

      /* Corrupted elements */
      ".ee-hack-corrupt{animation:ee-hack-corrupt-anim 0.3s infinite!important;color:#0ff!important;font-family:monospace!important}" +
      "@keyframes ee-hack-corrupt-anim{0%{opacity:1;transform:skewX(0)}25%{opacity:0.8;transform:skewX(5deg);color:#f0f}50%{opacity:1;transform:skewX(-3deg)}75%{opacity:0.9;transform:skewX(2deg);color:#0f0}100%{opacity:1;transform:skewX(0)}}" +

      /* Overlay */
      ".ee-hack-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:all;cursor:pointer;overflow:hidden;animation:ee-hack-fadein 0.3s}" +

      /* Matrix rain canvas */
      ".ee-hack-rain{position:absolute;inset:0;width:100%;height:100%;opacity:0.7}" +

      /* Color wash */
      ".ee-hack-color-wash{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,0,255,0.1) 0%,rgba(0,255,255,0.1) 50%,rgba(0,255,0,0.1) 100%);mix-blend-mode:screen;animation:ee-hack-wash 2s ease-in-out infinite alternate}" +
      "@keyframes ee-hack-wash{0%{background:linear-gradient(135deg,rgba(255,0,255,0.15) 0%,rgba(0,255,255,0.05) 100%)}100%{background:linear-gradient(135deg,rgba(0,255,255,0.15) 0%,rgba(255,0,255,0.05) 100%)}}" +

      /* HACK THE PLANET */
      ".ee-hack-title{position:absolute;top:35%;left:50%;transform:translateX(-50%);font-family:Impact,'Arial Black',sans-serif;font-size:72px;color:#0ff;text-shadow:0 0 20px #0ff,0 0 40px #f0f,0 0 80px #0f0,3px 3px 0 #000;letter-spacing:6px;white-space:nowrap;opacity:0;animation:ee-hack-title-in 0.8s 0.3s forwards;z-index:2}" +
      ".ee-hack-sub{position:absolute;top:calc(35% + 80px);left:50%;transform:translateX(-50%);font-family:'Courier New',monospace;font-size:18px;color:#f0f;text-shadow:0 0 10px #f0f;letter-spacing:3px;opacity:0;animation:ee-hack-fadein 0.5s 1s forwards;z-index:2}" +
      "@keyframes ee-hack-title-in{0%{opacity:0;letter-spacing:30px;filter:blur(10px)}100%{opacity:1;letter-spacing:6px;filter:blur(0)}}" +

      /* Flame SVG */
      ".ee-hack-flame{position:absolute;bottom:10%;left:50%;transform:translateX(-50%);width:200px;opacity:0;animation:ee-hack-fadein 1s 1.5s forwards;z-index:2}" +

      /* Fade */
      "@keyframes ee-hack-fadein{from{opacity:0}to{opacity:1}}" +
      ".ee-hack-dismiss{animation:ee-hack-fadeout 0.5s forwards}" +
      "@keyframes ee-hack-fadeout{to{opacity:0}}";
  }

  EasterEggs.register("hackers", {
    trigger: "acidburn",
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("hackers");
})();
