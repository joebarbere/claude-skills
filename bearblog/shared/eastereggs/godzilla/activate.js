/**
 * Chibi Godzilla Easter Egg
 *
 * Based on Chiharu Sakazaki's Chibi Godzilla design:
 * light green body, white muzzle, white maple-leaf dorsal plates,
 * pointed ears, big round eyes, round blob arms, stubby legs.
 *
 * Trigger: Type "godzilla"
 * Effect:  Chibi Godzilla waddles across the page, sneezes atomic breath
 * Dismiss: Walks off-screen (~12s), or click to shoo away
 */
(function () {
  "use strict";

  var styleEl = null;
  var containerEl = null;
  var dismissTimer = null;
  var stompInterval = null;
  var breathTimer = null;
  var charredEls = [];

  /* ── Chibi Godzilla SVG ────────────────────────────────── */

  var GODZILLA_SVG =
    '<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" class="ee-gz-body">' +

    /* Tail — short, stubby, points up-left */
    '<g class="ee-gz-tail">' +
    '<path d="M50,148 Q30,138 22,122 Q18,114 20,108" stroke="#8EC77F" stroke-width="13" ' +
      'fill="none" stroke-linecap="round"/>' +
    '<polygon points="20,108 15,96 25,104" fill="#fff"/>' +
    '</g>' +

    /* Body — round, pudgy */
    '<ellipse cx="80" cy="132" rx="30" ry="34" fill="#8EC77F"/>' +

    /* Back dorsal plates — white maple-leaf shapes on spine */
    '<polygon points="72,98 66,82 78,94" fill="#fff"/>' +
    '<polygon points="83,94 80,76 88,90" fill="#fff"/>' +

    /* Arms — round blobs, no fingers */
    '<g class="ee-gz-arms">' +
    '<ellipse cx="47" cy="127" rx="11" ry="9" fill="#8EC77F" ' +
      'stroke="#7AB569" stroke-width="0.5"/>' +
    '<ellipse cx="113" cy="127" rx="11" ry="9" fill="#8EC77F" ' +
      'stroke="#7AB569" stroke-width="0.5"/>' +
    '</g>' +

    /* Left leg */
    '<g class="ee-gz-leg-l">' +
    '<rect x="60" y="156" width="16" height="24" rx="8" fill="#8EC77F"/>' +
    '<circle cx="62" cy="181" r="2.5" fill="#fff"/>' +
    '<circle cx="68" cy="182" r="2.5" fill="#fff"/>' +
    '<circle cx="74" cy="181" r="2.5" fill="#fff"/>' +
    '</g>' +

    /* Right leg */
    '<g class="ee-gz-leg-r">' +
    '<rect x="84" y="156" width="16" height="24" rx="8" fill="#8EC77F"/>' +
    '<circle cx="86" cy="181" r="2.5" fill="#fff"/>' +
    '<circle cx="92" cy="182" r="2.5" fill="#fff"/>' +
    '<circle cx="98" cy="181" r="2.5" fill="#fff"/>' +
    '</g>' +

    /* Head — massive, no neck, sits directly on body */
    '<circle cx="80" cy="58" r="42" fill="#8EC77F"/>' +

    /* Head bumps */
    '<circle cx="60" cy="30" r="3.5" fill="#82B568" opacity="0.35"/>' +
    '<circle cx="78" cy="24" r="3" fill="#82B568" opacity="0.35"/>' +
    '<circle cx="96" cy="28" r="3.5" fill="#82B568" opacity="0.35"/>' +
    '<circle cx="70" cy="38" r="2.5" fill="#82B568" opacity="0.3"/>' +
    '<circle cx="90" cy="36" r="2.5" fill="#82B568" opacity="0.3"/>' +

    /* Pointed ears */
    '<polygon points="46,30 34,6 56,24" fill="#8EC77F"/>' +
    '<polygon points="43,28 37,14 52,24" fill="#E8A4B0" opacity="0.35"/>' +
    '<polygon points="114,30 126,6 104,24" fill="#8EC77F"/>' +
    '<polygon points="117,28 123,14 108,24" fill="#E8A4B0" opacity="0.35"/>' +

    /* Head dorsal plates — 3 white maple-leaf shapes between ears */
    '<polygon points="66,22 62,6 72,18" fill="#fff"/>' +
    '<polygon points="78,18 76,0 84,14" fill="#fff"/>' +
    '<polygon points="92,22 96,6 86,18" fill="#fff"/>' +

    /* White muzzle */
    '<ellipse cx="80" cy="76" rx="21" ry="14" fill="#fff"/>' +

    /* Eyes — big, round, expressive */
    '<g class="ee-gz-eyes">' +
    '<circle cx="61" cy="54" r="13" fill="#fff"/>' +
    '<circle cx="99" cy="54" r="13" fill="#fff"/>' +
    '<circle cx="64" cy="56" r="8" fill="#222"/>' +
    '<circle cx="96" cy="56" r="8" fill="#222"/>' +
    '<circle cx="66" cy="52" r="3" fill="#fff"/>' +
    '<circle cx="94" cy="52" r="3" fill="#fff"/>' +
    '</g>' +

    /* Nostrils */
    '<circle cx="73" cy="72" r="2" fill="#7AB569"/>' +
    '<circle cx="87" cy="72" r="2" fill="#7AB569"/>' +

    /* Mouth — small, cute */
    '<path d="M70,84 Q80,92 90,84" fill="none" stroke="#7AB569" stroke-width="1.5"/>' +

    '</svg>';

  /* ── Atomic Breath Puff — cute blue energy cloud ───────── */

  var BREATH_SVG =
    '<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" class="ee-gz-breath">' +
    '<ellipse cx="30" cy="20" rx="26" ry="16" fill="#B0DCFF" opacity="0.25">' +
    '<animate attributeName="rx" values="26;22;26" dur="0.25s" repeatCount="indefinite"/>' +
    '</ellipse>' +
    '<ellipse cx="30" cy="20" rx="16" ry="10" fill="#7EC8FF" opacity="0.4">' +
    '<animate attributeName="rx" values="16;12;16" dur="0.2s" repeatCount="indefinite"/>' +
    '</ellipse>' +
    '<ellipse cx="30" cy="20" rx="8" ry="5" fill="#fff" opacity="0.6">' +
    '<animate attributeName="rx" values="8;5;8" dur="0.15s" repeatCount="indefinite"/>' +
    '</ellipse>' +
    /* Sparkle particles */
    '<circle cx="10" cy="8" r="2" fill="#fff" opacity="0">' +
    '<animate attributeName="opacity" values="0;0.8;0" dur="0.4s" repeatCount="indefinite"/></circle>' +
    '<circle cx="50" cy="12" r="1.5" fill="#B0DCFF" opacity="0">' +
    '<animate attributeName="opacity" values="0;0.6;0" dur="0.35s" repeatCount="indefinite" begin="0.1s"/></circle>' +
    '<circle cx="14" cy="32" r="1.5" fill="#fff" opacity="0">' +
    '<animate attributeName="opacity" values="0;0.7;0" dur="0.5s" repeatCount="indefinite" begin="0.15s"/></circle>' +
    '<circle cx="46" cy="30" r="1" fill="#B0DCFF" opacity="0">' +
    '<animate attributeName="opacity" values="0;0.5;0" dur="0.3s" repeatCount="indefinite" begin="0.2s"/></circle>' +
    '</svg>';

  /* ── City Skyline ──────────────────────────────────────── */

  var BUILDINGS_SVG =
    '<svg viewBox="0 0 800 100" xmlns="http://www.w3.org/2000/svg" class="ee-gz-buildings" preserveAspectRatio="none">' +
    '<rect x="20" y="40" width="40" height="60" rx="1" fill="#3A4A5C"/>' +
    '<rect x="26" y="46" width="6" height="6" rx="1" fill="#FFE49C" opacity="0.6"/>' +
    '<rect x="36" y="46" width="6" height="6" rx="1" fill="#FFE49C" opacity="0.4"/>' +
    '<rect x="26" y="58" width="6" height="6" rx="1" fill="#FFE49C" opacity="0.5"/>' +
    '<rect x="36" y="58" width="6" height="6" rx="1" fill="#FFE49C" opacity="0.3"/>' +
    '<rect x="100" y="20" width="50" height="80" rx="1" fill="#4A5568"/>' +
    '<rect x="108" y="26" width="6" height="6" rx="1" fill="#FFE49C" opacity="0.6"/>' +
    '<rect x="120" y="26" width="6" height="6" rx="1" fill="#FFE49C" opacity="0.4"/>' +
    '<rect x="132" y="26" width="6" height="6" rx="1" fill="#FFE49C" opacity="0.5"/>' +
    '<rect x="108" y="40" width="6" height="6" rx="1" fill="#FFE49C" opacity="0.3"/>' +
    '<rect x="120" y="40" width="6" height="6" rx="1" fill="#FFE49C" opacity="0.6"/>' +
    '<rect x="200" y="50" width="35" height="50" rx="1" fill="#3D4F5F"/>' +
    '<rect x="280" y="30" width="45" height="70" rx="1" fill="#4A5C6E"/>' +
    '<rect x="286" y="36" width="6" height="6" rx="1" fill="#FFE49C" opacity="0.5"/>' +
    '<rect x="298" y="36" width="6" height="6" rx="1" fill="#FFE49C" opacity="0.4"/>' +
    '<rect x="380" y="45" width="30" height="55" rx="1" fill="#3A4A5C"/>' +
    '<rect x="460" y="25" width="55" height="75" rx="1" fill="#4A5568"/>' +
    '<rect x="560" y="50" width="40" height="50" rx="1" fill="#3D5060"/>' +
    '<rect x="650" y="35" width="50" height="65" rx="1" fill="#445566"/>' +
    '<rect x="740" y="45" width="35" height="55" rx="1" fill="#4A5C6E"/>' +
    '</svg>';

  /* ── Audio ─────────────────────────────────────────────── */

  function playStompSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }

  function playBreathSound() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Cute descending "pew" — tiny atomic sneeze
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  /* ── Activation ────────────────────────────────────────── */

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    containerEl = EasterEggs.injectOverlay(
      BUILDINGS_SVG +
      '<div class="ee-gz-character">' +
        GODZILLA_SVG +
        '<div class="ee-gz-breath-container">' + BREATH_SVG + '</div>' +
      '</div>',
      "ee-gz-overlay"
    );

    containerEl.addEventListener("click", deactivate);

    // Cute little stomps — lighter screen shake
    stompInterval = setInterval(function () {
      document.documentElement.classList.add("ee-gz-shake");
      playStompSound();
      setTimeout(function () {
        document.documentElement.classList.remove("ee-gz-shake");
      }, 120);
    }, 600);

    // Atomic sneeze at ~4.5s — accidental breath puff
    breathTimer = setTimeout(function () {
      if (!containerEl) return;
      var bc = containerEl.querySelector(".ee-gz-breath-container");
      if (bc) bc.classList.add("ee-gz-breath-active");
      playBreathSound();

      // Zap some page elements with blue energy
      var els = document.querySelectorAll("p, h2, h3, li, blockquote");
      var count = Math.min(els.length, 4);
      for (var i = 0; i < count; i++) {
        var idx = Math.floor(Math.random() * els.length);
        els[idx].classList.add("ee-gz-charred");
        charredEls.push(els[idx]);
      }

      // Puff fades after 1.8s
      setTimeout(function () {
        if (bc) bc.classList.remove("ee-gz-breath-active");
      }, 1800);
    }, 4500);

    dismissTimer = setTimeout(deactivate, 12000);
  }

  function deactivate() {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
    if (stompInterval) { clearInterval(stompInterval); stompInterval = null; }
    if (breathTimer) { clearTimeout(breathTimer); breathTimer = null; }
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

  /* ── CSS ───────────────────────────────────────────────── */

  function getCSS() {
    return [
      ".ee-gz-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;" +
        "z-index:99999;pointer-events:all;cursor:pointer;overflow:hidden}",

      /* Screen shake — gentle, cute */
      ".ee-gz-shake{animation:ee-gz-shake-anim .12s!important}",
      "@keyframes ee-gz-shake-anim{" +
        "0%{transform:translate(0)}" +
        "25%{transform:translate(-1.5px,1px)}" +
        "50%{transform:translate(1.5px,-1px)}" +
        "75%{transform:translate(-1px,0.5px)}" +
        "100%{transform:translate(0)}}",

      /* Character container — walks across screen */
      ".ee-gz-character{position:absolute;bottom:60px;left:-180px;width:160px;" +
        "height:200px;animation:ee-gz-walk 11s linear forwards}",
      "@keyframes ee-gz-walk{0%{left:-180px}100%{left:calc(100vw + 200px)}}",

      /* Body waddle — bouncy bob with rotation for a cute waddle */
      ".ee-gz-body{animation:ee-gz-waddle .5s ease-in-out infinite}",
      "@keyframes ee-gz-waddle{" +
        "0%,100%{transform:translateY(0) rotate(-2deg)}" +
        "50%{transform:translateY(-8px) rotate(2deg)}}",

      /* Eye blink */
      ".ee-gz-eyes{animation:ee-gz-blink 3.5s ease-in-out infinite;" +
        "transform-origin:80px 54px}",
      "@keyframes ee-gz-blink{" +
        "0%,92%,100%{transform:scaleY(1)}" +
        "95%,97%{transform:scaleY(0.05)}}",

      /* Leg animations — alternating steps */
      ".ee-gz-leg-l{animation:ee-gz-stepl .5s ease-in-out infinite;" +
        "transform-origin:68px 156px}",
      ".ee-gz-leg-r{animation:ee-gz-stepr .5s ease-in-out infinite;" +
        "transform-origin:92px 156px}",
      "@keyframes ee-gz-stepl{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}",
      "@keyframes ee-gz-stepr{0%,100%{transform:rotate(10deg)}50%{transform:rotate(-10deg)}}",

      /* Arm sway */
      ".ee-gz-arms{animation:ee-gz-armsway .5s ease-in-out infinite alternate;" +
        "transform-origin:80px 127px}",
      "@keyframes ee-gz-armsway{0%{transform:rotate(-4deg)}100%{transform:rotate(4deg)}}",

      /* Tail wag */
      ".ee-gz-tail{animation:ee-gz-tailwag .7s ease-in-out infinite alternate;" +
        "transform-origin:50px 148px}",
      "@keyframes ee-gz-tailwag{0%{transform:rotate(-6deg)}100%{transform:rotate(6deg)}}",

      /* Atomic breath puff — hidden by default */
      ".ee-gz-breath-container{position:absolute;top:62px;right:-52px;" +
        "width:60px;height:40px;opacity:0;transition:opacity .3s}",
      ".ee-gz-breath-container.ee-gz-breath-active{opacity:1}",
      ".ee-gz-breath{width:100%;height:100%}",

      /* Charred page elements — blue energy zap */
      ".ee-gz-charred{filter:brightness(0.55) sepia(0.8) hue-rotate(180deg)!important;" +
        "transition:filter .5s}",

      /* Buildings skyline */
      ".ee-gz-buildings{position:absolute;bottom:0;left:0;width:100%;height:100px;opacity:0.6}",
    ].join("\n");
  }

  /* ── Register ──────────────────────────────────────────── */

  EasterEggs.register("godzilla", {
    trigger: "godzilla",
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("godzilla");
})();
