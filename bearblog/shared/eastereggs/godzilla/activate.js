/**
 * Chibi Godzilla Easter Egg
 *
 * Trigger: Type "godzilla"
 * Effect:  Cute chibi Godzilla stomps across the page, breathes fire, shakes screen
 * Dismiss: Godzilla walks off-screen (~12s), or click to shoo away
 */
(function () {
  "use strict";

  var styleEl = null;
  var containerEl = null;
  var dismissTimer = null;
  var stompInterval = null;
  var fireTimer = null;
  var charredEls = [];

  var GODZILLA_SVG =
    '<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" class="ee-gz-body">' +
    '<!-- Body -->' +
    '<ellipse cx="80" cy="120" rx="35" ry="45" fill="#2E8B57"/>' +
    '<!-- Belly -->' +
    '<ellipse cx="80" cy="130" rx="22" ry="30" fill="#90EE90"/>' +
    '<!-- Head -->' +
    '<circle cx="80" cy="65" r="30" fill="#2E8B57"/>' +
    '<!-- Snout -->' +
    '<ellipse cx="80" cy="78" rx="18" ry="10" fill="#3CB371"/>' +
    '<!-- Eyes (big cute chibi eyes) -->' +
    '<circle cx="68" cy="58" r="10" fill="#fff"/>' +
    '<circle cx="92" cy="58" r="10" fill="#fff"/>' +
    '<circle cx="70" cy="59" r="6" fill="#111"/>' +
    '<circle cx="94" cy="59" r="6" fill="#111"/>' +
    '<circle cx="72" cy="57" r="2.5" fill="#fff"/>' +
    '<circle cx="96" cy="57" r="2.5" fill="#fff"/>' +
    '<!-- Nostrils -->' +
    '<circle cx="75" cy="78" r="2" fill="#1B5E20"/>' +
    '<circle cx="85" cy="78" r="2" fill="#1B5E20"/>' +
    '<!-- Mouth -->' +
    '<path d="M68,85 Q80,92 92,85" fill="none" stroke="#1B5E20" stroke-width="1.5"/>' +
    '<!-- Spines -->' +
    '<polygon points="65,40 72,25 78,42" fill="#FF6347"/>' +
    '<polygon points="75,35 82,18 88,38" fill="#FF4500"/>' +
    '<polygon points="85,40 92,25 98,42" fill="#FF6347"/>' +
    '<polygon points="72,88 78,72 84,88" fill="#FF6347" opacity="0.5"/>' +
    '<!-- Arms -->' +
    '<g class="ee-gz-arms">' +
    '<path d="M50,110 Q35,115 38,130" stroke="#2E8B57" stroke-width="6" fill="none" stroke-linecap="round"/>' +
    '<path d="M110,110 Q125,115 122,130" stroke="#2E8B57" stroke-width="6" fill="none" stroke-linecap="round"/>' +
    '</g>' +
    '<!-- Left leg -->' +
    '<g class="ee-gz-leg-l">' +
    '<rect x="58" y="155" width="16" height="30" rx="6" fill="#2E8B57"/>' +
    '<ellipse cx="62" cy="188" rx="12" ry="5" fill="#228B22"/>' +
    '</g>' +
    '<!-- Right leg -->' +
    '<g class="ee-gz-leg-r">' +
    '<rect x="86" y="155" width="16" height="30" rx="6" fill="#2E8B57"/>' +
    '<ellipse cx="98" cy="188" rx="12" ry="5" fill="#228B22"/>' +
    '</g>' +
    '<!-- Tail -->' +
    '<g class="ee-gz-tail">' +
    '<path d="M48,145 Q25,155 15,140 Q5,125 20,120" stroke="#2E8B57" stroke-width="10" fill="none" stroke-linecap="round"/>' +
    '<polygon points="20,115 10,110 22,125" fill="#FF6347"/>' +
    '</g>' +
    '</svg>';

  var FIRE_SVG =
    '<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg" class="ee-gz-fire">' +
    '<ellipse cx="60" cy="25" rx="55" ry="20" fill="#FF4500" opacity="0.6">' +
    '<animate attributeName="rx" values="55;50;55" dur="0.2s" repeatCount="indefinite"/>' +
    '</ellipse>' +
    '<ellipse cx="70" cy="25" rx="40" ry="14" fill="#FF8C00" opacity="0.7">' +
    '<animate attributeName="rx" values="40;35;40" dur="0.15s" repeatCount="indefinite"/>' +
    '</ellipse>' +
    '<ellipse cx="80" cy="25" rx="25" ry="8" fill="#FFD700" opacity="0.8">' +
    '<animate attributeName="rx" values="25;20;25" dur="0.1s" repeatCount="indefinite"/>' +
    '</ellipse>' +
    '</svg>';

  var BUILDING_SVG =
    '<svg viewBox="0 0 800 100" xmlns="http://www.w3.org/2000/svg" class="ee-gz-buildings" preserveAspectRatio="none">' +
    '<rect x="20" y="40" width="40" height="60" fill="#333" class="ee-gz-bldg"/>' +
    '<rect x="25" y="45" width="8" height="8" fill="#FF0" opacity="0.6"/><rect x="37" y="45" width="8" height="8" fill="#FF0" opacity="0.4"/>' +
    '<rect x="25" y="58" width="8" height="8" fill="#FF0" opacity="0.5"/><rect x="37" y="58" width="8" height="8" fill="#FF0" opacity="0.3"/>' +
    '<rect x="100" y="20" width="50" height="80" fill="#444" class="ee-gz-bldg"/>' +
    '<rect x="108" y="25" width="8" height="8" fill="#FF0" opacity="0.6"/><rect x="120" y="25" width="8" height="8" fill="#FF0" opacity="0.4"/>' +
    '<rect x="132" y="25" width="8" height="8" fill="#FF0" opacity="0.5"/>' +
    '<rect x="108" y="38" width="8" height="8" fill="#FF0" opacity="0.3"/><rect x="120" y="38" width="8" height="8" fill="#FF0" opacity="0.6"/>' +
    '<rect x="200" y="50" width="35" height="50" fill="#383838" class="ee-gz-bldg"/>' +
    '<rect x="280" y="30" width="45" height="70" fill="#3a3a3a" class="ee-gz-bldg"/>' +
    '<rect x="285" y="35" width="8" height="8" fill="#FF0" opacity="0.5"/><rect x="297" y="35" width="8" height="8" fill="#FF0" opacity="0.4"/>' +
    '<rect x="380" y="45" width="30" height="55" fill="#353535" class="ee-gz-bldg"/>' +
    '<rect x="460" y="25" width="55" height="75" fill="#404040" class="ee-gz-bldg"/>' +
    '<rect x="560" y="50" width="40" height="50" fill="#3c3c3c" class="ee-gz-bldg"/>' +
    '<rect x="650" y="35" width="50" height="65" fill="#383838" class="ee-gz-bldg"/>' +
    '<rect x="740" y="45" width="35" height="55" fill="#444" class="ee-gz-bldg"/>' +
    '</svg>';

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    containerEl = EasterEggs.injectOverlay(
      BUILDING_SVG +
      '<div class="ee-gz-character">' +
        GODZILLA_SVG +
        '<div class="ee-gz-fire-container">' + FIRE_SVG + '</div>' +
      '</div>',
      "ee-gz-overlay"
    );

    containerEl.addEventListener("click", deactivate);

    // Screen shake on stomps
    var stompCount = 0;
    stompInterval = setInterval(function () {
      document.documentElement.classList.add("ee-gz-shake");
      setTimeout(function () {
        document.documentElement.classList.remove("ee-gz-shake");
      }, 150);
      stompCount++;
    }, 800);

    // Fire breath at ~40% of walk (around 4.5s)
    fireTimer = setTimeout(function () {
      if (!containerEl) return;
      var fc = containerEl.querySelector(".ee-gz-fire-container");
      if (fc) fc.classList.add("ee-gz-fire-active");
      // Char some page elements
      var els = document.querySelectorAll("p, h2, h3, li, blockquote");
      var count = Math.min(els.length, 5);
      for (var i = 0; i < count; i++) {
        var idx = Math.floor(Math.random() * els.length);
        els[idx].classList.add("ee-gz-charred");
        charredEls.push(els[idx]);
      }
      // Stop fire after 2s
      setTimeout(function () {
        if (fc) fc.classList.remove("ee-gz-fire-active");
      }, 2000);
    }, 4500);

    dismissTimer = setTimeout(deactivate, 12000);
  }

  function deactivate() {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
    if (stompInterval) { clearInterval(stompInterval); stompInterval = null; }
    if (fireTimer) { clearTimeout(fireTimer); fireTimer = null; }
    document.documentElement.classList.remove("ee-gz-shake");

    for (var i = 0; i < charredEls.length; i++) {
      charredEls[i].classList.remove("ee-gz-charred");
    }
    charredEls = [];

    if (containerEl) {
      EasterEggs.removeElement(containerEl);
      containerEl = null;
    }
    EasterEggs._activeEggs.delete("godzilla");
  }

  function getCSS() {
    return "" +
      ".ee-gz-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:all;cursor:pointer;overflow:hidden}" +

      /* Screen shake */
      ".ee-gz-shake{animation:ee-gz-shake-anim 0.15s!important}" +
      "@keyframes ee-gz-shake-anim{0%{transform:translate(0)}25%{transform:translate(-3px,2px)}50%{transform:translate(3px,-2px)}75%{transform:translate(-2px,1px)}100%{transform:translate(0)}}" +

      /* Godzilla character — walks across screen */
      ".ee-gz-character{position:absolute;bottom:60px;left:-180px;width:160px;height:200px;animation:ee-gz-walk 11s linear forwards}" +
      "@keyframes ee-gz-walk{0%{left:-180px}100%{left:calc(100vw + 200px)}}" +

      /* Body bob */
      ".ee-gz-body{animation:ee-gz-bob 0.4s ease-in-out infinite}" +
      "@keyframes ee-gz-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}" +

      /* Leg animations */
      ".ee-gz-leg-l{animation:ee-gz-stepl 0.4s ease-in-out infinite;transform-origin:70px 155px}" +
      ".ee-gz-leg-r{animation:ee-gz-stepr 0.4s ease-in-out infinite;transform-origin:94px 155px}" +
      "@keyframes ee-gz-stepl{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}" +
      "@keyframes ee-gz-stepr{0%,100%{transform:rotate(8deg)}50%{transform:rotate(-8deg)}}" +

      /* Arm wave */
      ".ee-gz-arms{animation:ee-gz-armwave 0.6s ease-in-out infinite alternate;transform-origin:80px 110px}" +
      "@keyframes ee-gz-armwave{0%{transform:rotate(-3deg)}100%{transform:rotate(3deg)}}" +

      /* Tail swish */
      ".ee-gz-tail{animation:ee-gz-swish 0.8s ease-in-out infinite alternate;transform-origin:48px 145px}" +
      "@keyframes ee-gz-swish{0%{transform:rotate(-5deg)}100%{transform:rotate(5deg)}}" +

      /* Fire breath — hidden by default */
      ".ee-gz-fire-container{position:absolute;top:55px;right:-100px;width:120px;height:50px;opacity:0;transition:opacity 0.3s;transform:scaleX(-1)}" +
      ".ee-gz-fire-container.ee-gz-fire-active{opacity:1}" +
      ".ee-gz-fire{width:100%;height:100%}" +

      /* Charred page elements */
      ".ee-gz-charred{filter:brightness(0.3) sepia(1)!important;transition:filter 0.5s}" +

      /* Buildings skyline at bottom */
      ".ee-gz-buildings{position:absolute;bottom:0;left:0;width:100%;height:100px;opacity:0.7}" +
      ".ee-gz-bldg{transform-origin:bottom center}" +

      "";
  }

  EasterEggs.register("godzilla", {
    trigger: "godzilla",
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("godzilla");
})();
