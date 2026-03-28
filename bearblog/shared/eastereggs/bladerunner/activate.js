/**
 * Blade Runner Easter Egg — Origami Unicorn
 *
 * Trigger: Type 5 consecutive "a" characters (aaaaa)
 * Effect:  Dark atmospheric overlay with animated origami unicorn unfolding
 *
 * Requires: eastereggs.js loaded first
 */
(function () {
  "use strict";

  // Inline the CSS so this works as a standalone include
  var BLADERUNNER_CSS = null; // Loaded dynamically or inlined at build time

  // Origami unicorn SVG (embedded for portability)
  var UNICORN_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 280">' +
    '<polygon points="120,140 180,110 190,170" fill="#e8e0d4" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="120,140 190,170 150,195" fill="#d9d0c2" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="180,110 220,130 190,170" fill="#f0e8dc" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="190,170 220,130 230,175" fill="#ddd5c8" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="120,140 100,120 130,105" fill="#ede5d8" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="120,140 130,105 180,110" fill="#e2dace" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="100,120 130,105 110,75" fill="#f2ebe0" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="130,105 110,75 140,80" fill="#e5ddd0" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="110,75 90,55 75,70" fill="#f5efe5" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="110,75 90,55 120,50" fill="#ebe3d6" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="90,55 75,70 70,55" fill="#e0d8cb" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="90,55 85,20 100,48" fill="#f8f4ee" stroke="#d4cdc0" stroke-width="0.5"/>' +
    '<polygon points="90,55 85,20 80,48" fill="#efe8dc" stroke="#d4cdc0" stroke-width="0.5"/>' +
    '<polygon points="105,52 115,35 120,50" fill="#e8e0d4" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="230,175 220,130 250,145" fill="#e5ddd0" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="230,175 250,145 255,180" fill="#d5cdc0" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="250,145 270,125 255,180" fill="#ede5d8" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="270,125 280,140 255,180" fill="#e0d8cb" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="120,140 150,195 125,240" fill="#ddd5c8" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="120,140 105,195 125,240" fill="#d0c8bb" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="230,175 210,240 190,170" fill="#d9d0c2" stroke="#c8bfb0" stroke-width="0.5"/>' +
    '<polygon points="230,175 250,235 210,240" fill="#cec5b8" stroke="#c8bfb0" stroke-width="0.5"/>' +
    "</svg>";

  var styleEl = null;
  var overlayEl = null;
  var dismissTimer = null;

  function activate() {
    // Load CSS from file or inline
    if (!styleEl) {
      styleEl = EasterEggs.injectCSS(getCSS());
    }

    // Build overlay
    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-br-rain"></div>' +
        '<div class="ee-br-unicorn-wrap">' +
        UNICORN_SVG +
        "</div>" +
        '<div class="ee-br-quote">It\u2019s too bad she won\u2019t live. But then again, who does?</div>',
      "ee-bladerunner-overlay"
    );

    // Start floating animation after unfold completes
    var unicornWrap = overlayEl.querySelector(".ee-br-unicorn-wrap");
    setTimeout(function () {
      if (unicornWrap) unicornWrap.classList.add("ee-br-float");
    }, 2600);

    // Click to dismiss
    overlayEl.addEventListener("click", function () {
      deactivate();
    });

    // Auto-dismiss after 10 seconds
    dismissTimer = setTimeout(function () {
      deactivate();
    }, 10000);
  }

  function deactivate() {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
      dismissTimer = null;
    }
    if (overlayEl) {
      overlayEl.classList.add("ee-br-dismiss");
      var el = overlayEl;
      setTimeout(function () {
        EasterEggs.removeElement(el);
      }, 700);
      overlayEl = null;
    }
    EasterEggs._activeEggs.delete("bladerunner");
  }

  function getCSS() {
    return (
      ".ee-bladerunner-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:all;cursor:pointer;overflow:hidden;animation:ee-br-fadein 1s ease-out forwards}" +
      ".ee-bladerunner-overlay::before{content:\"\";position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,rgba(10,15,40,0.85) 0%,rgba(2,2,12,0.95) 100%)}" +
      ".ee-br-rain{position:absolute;inset:0;background-image:repeating-linear-gradient(transparent 0px,transparent 3px,rgba(120,160,200,0.04) 3px,rgba(120,160,200,0.04) 4px);animation:ee-br-rain-fall 0.4s linear infinite}" +
      "@keyframes ee-br-rain-fall{from{transform:translateY(-20px)}to{transform:translateY(0)}}" +
      ".ee-br-unicorn-wrap{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:280px;height:280px;animation:ee-br-unfold 2s ease-out 0.5s both;filter:drop-shadow(0 0 30px rgba(180,200,255,0.4)) drop-shadow(0 0 60px rgba(100,140,255,0.2))}" +
      ".ee-br-unicorn-wrap svg{width:100%;height:100%}" +
      "@keyframes ee-br-unfold{0%{opacity:0;transform:translate(-50%,-50%) scale(0.3) rotateY(90deg)}40%{opacity:1;transform:translate(-50%,-50%) scale(0.9) rotateY(15deg)}70%{transform:translate(-50%,-50%) scale(1.05) rotateY(-5deg)}100%{transform:translate(-50%,-50%) scale(1) rotateY(0deg)}}" +
      ".ee-br-unicorn-wrap.ee-br-float{animation:ee-br-hover 4s ease-in-out infinite}" +
      "@keyframes ee-br-hover{0%,100%{transform:translate(-50%,-50%) translateY(0px) rotate(-1deg)}50%{transform:translate(-50%,-50%) translateY(-12px) rotate(1deg)}}" +
      ".ee-br-quote{position:absolute;bottom:18%;left:50%;transform:translateX(-50%);font-family:'Courier New',Courier,monospace;font-size:14px;letter-spacing:3px;color:rgba(180,200,240,0.7);text-transform:uppercase;white-space:nowrap;opacity:0;animation:ee-br-quote-in 2s ease-out 2s forwards}" +
      "@keyframes ee-br-quote-in{from{opacity:0;letter-spacing:12px}to{opacity:1;letter-spacing:3px}}" +
      "@keyframes ee-br-fadein{from{opacity:0}to{opacity:1}}" +
      ".ee-bladerunner-overlay.ee-br-dismiss{animation:ee-br-fadeout 0.6s ease-in forwards;pointer-events:none}" +
      "@keyframes ee-br-fadeout{from{opacity:1}to{opacity:0}}" +
      ".ee-br-unicorn-wrap svg polygon,.ee-br-unicorn-wrap svg path{opacity:0;animation:ee-br-facet-in 0.6s ease-out forwards}" +
      ".ee-br-unicorn-wrap svg *:nth-child(1){animation-delay:0.6s}.ee-br-unicorn-wrap svg *:nth-child(2){animation-delay:0.7s}.ee-br-unicorn-wrap svg *:nth-child(3){animation-delay:0.8s}.ee-br-unicorn-wrap svg *:nth-child(4){animation-delay:0.85s}" +
      ".ee-br-unicorn-wrap svg *:nth-child(5){animation-delay:0.9s}.ee-br-unicorn-wrap svg *:nth-child(6){animation-delay:0.95s}.ee-br-unicorn-wrap svg *:nth-child(7){animation-delay:1.0s}.ee-br-unicorn-wrap svg *:nth-child(8){animation-delay:1.05s}" +
      ".ee-br-unicorn-wrap svg *:nth-child(9){animation-delay:1.1s}.ee-br-unicorn-wrap svg *:nth-child(10){animation-delay:1.15s}.ee-br-unicorn-wrap svg *:nth-child(11){animation-delay:1.2s}.ee-br-unicorn-wrap svg *:nth-child(12){animation-delay:1.25s}" +
      ".ee-br-unicorn-wrap svg *:nth-child(13){animation-delay:1.3s}.ee-br-unicorn-wrap svg *:nth-child(14){animation-delay:1.35s}.ee-br-unicorn-wrap svg *:nth-child(15){animation-delay:1.4s}.ee-br-unicorn-wrap svg *:nth-child(16){animation-delay:1.45s}" +
      ".ee-br-unicorn-wrap svg *:nth-child(17){animation-delay:1.5s}.ee-br-unicorn-wrap svg *:nth-child(18){animation-delay:1.55s}.ee-br-unicorn-wrap svg *:nth-child(19){animation-delay:1.6s}.ee-br-unicorn-wrap svg *:nth-child(20){animation-delay:1.65s}" +
      "@keyframes ee-br-facet-in{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}"
    );
  }

  // Register with the easter egg engine
  if (window.EasterEggs) {
    EasterEggs.register("bladerunner", {
      trigger: "aaaaa",
      activate: activate,
      deactivate: deactivate,
      once: false,
    });
    EasterEggs.enable("bladerunner");
  }
})();
