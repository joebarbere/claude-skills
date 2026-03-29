/**
 * Jurassic Park Easter Egg — Nedry Lockout
 *
 * Trigger: Type "nedry"
 * Phase 1: Impact tremors shake the page, water ripples in a glass (T-Rex approach)
 * Phase 2: System lockout — "Ah ah ah, you didn't say the magic word!"
 * Dismiss: Type "please" or wait 15s
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var glassEl = null;
  var dismissTimer = null;
  var floodTimer = null;
  var tremorTimers = [];
  var pleaseBuffer = "";
  var active = false;

  /* ── Nedry SVG ─────────────────────────────────────────── */

  var NEDRY_SVG =
    '<svg viewBox="0 0 140 170" xmlns="http://www.w3.org/2000/svg">' +
    /* Head — round, large */
    '<ellipse cx="70" cy="62" rx="48" ry="42" fill="none" stroke="#0f0" stroke-width="2"/>' +
    /* Hair tufts */
    '<path d="M28,40 Q20,26 36,20" fill="none" stroke="#0f0" stroke-width="1.5"/>' +
    '<path d="M104,20 Q120,26 112,40" fill="none" stroke="#0f0" stroke-width="1.5"/>' +
    '<path d="M42,24 Q48,14 58,22" fill="none" stroke="#0f0" stroke-width="1" opacity="0.5"/>' +
    /* Big round glasses */
    '<circle cx="50" cy="56" r="17" fill="rgba(0,255,0,0.04)" stroke="#0f0" stroke-width="2.5"/>' +
    '<circle cx="90" cy="56" r="17" fill="rgba(0,255,0,0.04)" stroke="#0f0" stroke-width="2.5"/>' +
    '<line x1="67" y1="54" x2="73" y2="54" stroke="#0f0" stroke-width="2"/>' +
    '<line x1="33" y1="52" x2="22" y2="46" stroke="#0f0" stroke-width="1.5"/>' +
    '<line x1="107" y1="52" x2="118" y2="46" stroke="#0f0" stroke-width="1.5"/>' +
    /* Glint on lenses */
    '<path d="M40,48 Q42,46 44,48" fill="none" stroke="#0f0" stroke-width="1" opacity="0.4"/>' +
    '<path d="M80,48 Q82,46 84,48" fill="none" stroke="#0f0" stroke-width="1" opacity="0.4"/>' +
    /* Pupils — looking at viewer smugly */
    '<circle cx="53" cy="57" r="5" fill="#0f0"/>' +
    '<circle cx="87" cy="57" r="5" fill="#0f0"/>' +
    '<circle cx="54" cy="56" r="2" fill="#000"/>' +
    '<circle cx="86" cy="56" r="2" fill="#000"/>' +
    /* Eyebrows — raised smugly */
    '<path d="M35,40 Q50,34 64,40" fill="none" stroke="#0f0" stroke-width="1.5"/>' +
    '<path d="M76,40 Q90,34 105,40" fill="none" stroke="#0f0" stroke-width="1.5"/>' +
    /* Nose */
    '<path d="M66,63 Q70,74 74,63" fill="none" stroke="#0f0" stroke-width="1.5"/>' +
    /* Big smug grin with teeth */
    '<path d="M42,80 Q70,100 98,80" fill="none" stroke="#0f0" stroke-width="2.5"/>' +
    '<line x1="52" y1="83" x2="52" y2="89" stroke="#0f0" stroke-width="1" opacity="0.6"/>' +
    '<line x1="60" y1="86" x2="60" y2="93" stroke="#0f0" stroke-width="1" opacity="0.6"/>' +
    '<line x1="70" y1="87" x2="70" y2="94" stroke="#0f0" stroke-width="1" opacity="0.6"/>' +
    '<line x1="80" y1="86" x2="80" y2="93" stroke="#0f0" stroke-width="1" opacity="0.6"/>' +
    '<line x1="88" y1="83" x2="88" y2="89" stroke="#0f0" stroke-width="1" opacity="0.6"/>' +
    /* Double chin */
    '<path d="M40,92 Q70,108 100,92" fill="none" stroke="#0f0" stroke-width="1" opacity="0.4"/>' +
    /* Hawaiian shirt — V-collar with leaf/flower pattern */
    '<path d="M28,100 L70,132 L112,100" fill="none" stroke="#0f0" stroke-width="2"/>' +
    '<path d="M24,100 L24,170" stroke="#0f0" stroke-width="1.5" opacity="0.3"/>' +
    '<path d="M116,100 L116,170" stroke="#0f0" stroke-width="1.5" opacity="0.3"/>' +
    /* Shirt patterns — tropical leaves */
    '<ellipse cx="38" cy="118" rx="5" ry="3.5" fill="none" stroke="#0f0" stroke-width="0.8" opacity="0.3" transform="rotate(-25,38,118)"/>' +
    '<ellipse cx="100" cy="115" rx="5" ry="3.5" fill="none" stroke="#0f0" stroke-width="0.8" opacity="0.3" transform="rotate(25,100,115)"/>' +
    '<ellipse cx="50" cy="140" rx="4" ry="3" fill="none" stroke="#0f0" stroke-width="0.7" opacity="0.25" transform="rotate(-10,50,140)"/>' +
    '<ellipse cx="90" cy="138" rx="4" ry="3" fill="none" stroke="#0f0" stroke-width="0.7" opacity="0.25" transform="rotate(15,90,138)"/>' +
    /* Wagging finger — right hand raised */
    '<g class="ee-jp-finger">' +
    '<path d="M115,42 L122,24" stroke="#0f0" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="122" cy="20" r="5" fill="#0f0"/>' +
    '<path d="M113,48 L117,34" stroke="#0f0" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>' +
    '<path d="M111,52 L113,43" stroke="#0f0" stroke-width="2" stroke-linecap="round" opacity="0.3"/>' +
    '<path d="M112,58 L115,42" stroke="#0f0" stroke-width="5.5" stroke-linecap="round"/>' +
    '</g>' +
    '</svg>';

  /* ── Water Glass SVG ──────────────────────────────────── */

  var GLASS_SVG =
    '<svg viewBox="0 0 50 70" xmlns="http://www.w3.org/2000/svg">' +
    /* Glass body — tumbler with slight taper */
    '<path d="M10,6 L7,58 Q7,64 14,64 L36,64 Q43,64 43,58 L40,6" ' +
      'fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>' +
    /* Glass rim highlight */
    '<line x1="10" y1="6" x2="40" y2="6" stroke="rgba(255,255,255,0.25)" stroke-width="0.8"/>' +
    /* Water body */
    '<path d="M8,28 L7,58 Q7,64 14,64 L36,64 Q43,64 43,58 L42,28 Z" ' +
      'fill="rgba(100,180,255,0.08)"/>' +
    /* Water surface */
    '<line x1="8" y1="28" x2="42" y2="28" stroke="rgba(100,180,255,0.25)" stroke-width="0.8"/>' +
    /* Ripple circles */
    '<circle cx="25" cy="28" r="2" fill="none" stroke="rgba(100,180,255,0.5)" stroke-width="0.5" class="ee-jp-r1"/>' +
    '<circle cx="25" cy="28" r="2" fill="none" stroke="rgba(100,180,255,0.35)" stroke-width="0.5" class="ee-jp-r2"/>' +
    '<circle cx="25" cy="28" r="2" fill="none" stroke="rgba(100,180,255,0.2)" stroke-width="0.5" class="ee-jp-r3"/>' +
    /* Caustic light reflection */
    '<path d="M14,35 Q16,32 18,35" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>' +
    '</svg>';

  /* ── Audio ─────────────────────────────────────────────── */

  function playThud(intensity) {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Low-frequency boom — like a heavy footstep
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(30 + intensity * 20, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12 + intensity * 0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
      // Sub-bass layer for impact
      var sub = ctx.createOscillator();
      var subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.value = 18;
      subGain.gain.setValueAtTime(0.08 * intensity, ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start();
      sub.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }

  /* ── Phase 1: Impact Tremors ───────────────────────────── */

  function doThud(intensity) {
    // Shake the page
    var root = document.documentElement;
    var mag = 1.5 + intensity * 5;
    var frame = 0;
    var steps = 5;
    function step() {
      if (frame >= steps) { root.style.transform = ""; return; }
      var decay = 1 - frame / steps;
      var x = (Math.random() * 2 - 1) * mag * decay;
      var y = (Math.random() * 2 - 1) * mag * decay;
      root.style.transform = "translate(" + x + "px," + y + "px)";
      frame++;
      requestAnimationFrame(step);
    }
    step();

    // Ripple the water
    if (glassEl) {
      glassEl.classList.remove("ee-jp-rippling");
      void glassEl.offsetWidth;
      glassEl.classList.add("ee-jp-rippling");
    }

    playThud(intensity);
  }

  function startTremors(onDone) {
    // Show the water glass
    glassEl = document.createElement("div");
    glassEl.className = "ee-jp-glass";
    glassEl.innerHTML = GLASS_SVG;
    document.body.appendChild(glassEl);

    // Schedule thuds — each closer and heavier, like a T-Rex approaching
    var schedule = [
      { t: 400,  i: 0.25 },
      { t: 1600, i: 0.4 },
      { t: 2600, i: 0.55 },
      { t: 3300, i: 0.7 },
      { t: 3800, i: 0.85 },
      { t: 4200, i: 1.0 },
    ];

    schedule.forEach(function (s) {
      tremorTimers.push(setTimeout(function () {
        if (active) doThud(s.i);
      }, s.t));
    });

    // After last thud, transition to lockout
    tremorTimers.push(setTimeout(function () {
      if (!active) return;
      // Fade out the glass
      if (glassEl) {
        glassEl.style.transition = "opacity 0.3s";
        glassEl.style.opacity = "0";
        setTimeout(function () {
          if (glassEl && glassEl.parentNode) glassEl.parentNode.removeChild(glassEl);
          glassEl = null;
        }, 300);
      }
      document.documentElement.style.transform = "";
      onDone();
    }, 4700));
  }

  /* ── Phase 2: Nedry Lockout ────────────────────────────── */

  function showLockout() {
    // CRT screen flash transition
    var flash = document.createElement("div");
    flash.className = "ee-jp-flash";
    document.body.appendChild(flash);
    setTimeout(function () {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 300);

    setTimeout(function () {
      if (!active) return;

      overlayEl = EasterEggs.injectOverlay(
        '<div class="ee-jp-scanlines"></div>' +
        '<div class="ee-jp-crt-glow"></div>' +
        '<div class="ee-jp-window">' +
          '<div class="ee-jp-titlebar">' +
            '<div class="ee-jp-tb-btns"><span></span><span></span></div>' +
            '<div class="ee-jp-tb-title">JURASSIC PARK SYSTEM</div>' +
            '<div class="ee-jp-tb-btns"><span></span></div>' +
          '</div>' +
          '<div class="ee-jp-statusbar">' +
            '<span>ACCESS: MAIN SECURITY GRID</span>' +
            '<span class="ee-jp-lockout-badge">\u26A0 LOCKOUT ACTIVE</span>' +
          '</div>' +
          '<div class="ee-jp-body">' +
            '<div class="ee-jp-output"></div>' +
            '<div class="ee-jp-sidebar">' +
              '<div class="ee-jp-nedry">' + NEDRY_SVG + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ee-jp-hint">type \u201Cplease\u201D to unlock</div>',
        "ee-jp-overlay"
      );

      startFlood();

      // Click adds burst of text
      overlayEl.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var output = overlayEl && overlayEl.querySelector(".ee-jp-output");
        if (!output) return;
        for (var i = 0; i < 5; i++) {
          var line = document.createElement("div");
          line.className = "ee-jp-line ee-jp-burst";
          line.textContent = "AH AH AH!";
          output.appendChild(line);
        }
        output.scrollTop = output.scrollHeight;
      });

      // Listen for "please" typed while lockout is active
      EasterEggs.captureInput(function (e) {
        if (e.key.length === 1) {
          pleaseBuffer += e.key.toLowerCase();
          if (pleaseBuffer.length > 10) pleaseBuffer = pleaseBuffer.slice(-10);
          if (pleaseBuffer.endsWith("please")) deactivate();
        }
      });
    }, 200);
  }

  function startFlood() {
    var delay = 220;
    var minDelay = 45;

    function addLine() {
      if (!active || !overlayEl) return;
      var output = overlayEl.querySelector(".ee-jp-output");
      if (!output) return;

      var line = document.createElement("div");
      line.className = "ee-jp-line";
      line.textContent = "Ah ah ah, you didn't say the magic word!";
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;

      if (output.children.length > 80) {
        output.removeChild(output.children[0]);
      }

      // Accelerate — it gets more frantic
      if (delay > minDelay) delay -= 7;
      floodTimer = setTimeout(addLine, delay);
    }

    addLine();
  }

  /* ── Lifecycle ─────────────────────────────────────────── */

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());
    active = true;
    pleaseBuffer = "";

    startTremors(function () {
      showLockout();
    });

    dismissTimer = setTimeout(deactivate, 15000);
  }

  function deactivate() {
    active = false;
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
    if (floodTimer) { clearTimeout(floodTimer); floodTimer = null; }
    tremorTimers.forEach(clearTimeout);
    tremorTimers = [];
    EasterEggs.releaseInput();
    document.documentElement.style.transform = "";

    if (glassEl && glassEl.parentNode) {
      glassEl.parentNode.removeChild(glassEl);
      glassEl = null;
    }

    if (overlayEl) {
      overlayEl.classList.add("ee-jp-dismiss");
      var el = overlayEl;
      setTimeout(function () { EasterEggs.removeElement(el); }, 600);
      overlayEl = null;
    }

    EasterEggs._activeEggs.delete("jurassicpark");
  }

  /* ── CSS ───────────────────────────────────────────────── */

  function getCSS() {
    return [
      /* ── Overlay ───────────────────────────────── */
      ".ee-jp-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;" +
        "pointer-events:all;cursor:not-allowed;overflow:hidden;background:#000;" +
        "font-family:'Courier New','Lucida Console',monospace;animation:ee-jp-fadein .3s}",

      /* CRT scanlines */
      ".ee-jp-scanlines{position:absolute;inset:0;z-index:10;pointer-events:none;" +
        "background:repeating-linear-gradient(" +
        "transparent 0px,transparent 2px,rgba(0,30,0,0.2) 2px,rgba(0,30,0,0.2) 4px)}",

      /* CRT edge glow */
      ".ee-jp-crt-glow{position:absolute;inset:0;z-index:9;pointer-events:none;" +
        "box-shadow:inset 0 0 80px rgba(0,255,0,0.04),inset 0 0 160px rgba(0,0,0,0.4)}",

      /* ── Window chrome (early-90s workstation) ── */
      ".ee-jp-window{position:absolute;inset:24px 32px 44px 32px;display:flex;" +
        "flex-direction:column;border:1px solid #0a0;border-radius:2px;overflow:hidden;" +
        "box-shadow:0 0 40px rgba(0,255,0,0.06),0 2px 0 #060}",

      /* Title bar */
      ".ee-jp-titlebar{display:flex;align-items:center;gap:8px;padding:5px 10px;" +
        "background:linear-gradient(180deg,#082,#040);border-bottom:1px solid #0a0;flex-shrink:0}",
      ".ee-jp-tb-btns{display:flex;gap:5px}",
      ".ee-jp-tb-btns span{width:10px;height:10px;border-radius:50%;border:1px solid #0a0;background:#020}",
      ".ee-jp-tb-title{flex:1;text-align:center;color:#0f0;font-size:11px;letter-spacing:3px;" +
        "font-weight:bold;text-shadow:0 0 8px rgba(0,255,0,0.4)}",

      /* Status bar */
      ".ee-jp-statusbar{display:flex;justify-content:space-between;align-items:center;" +
        "padding:4px 12px;background:#010;border-bottom:1px solid #040;flex-shrink:0}",
      ".ee-jp-statusbar span{color:#070;font-size:10px;letter-spacing:1.5px}",
      ".ee-jp-lockout-badge{color:#f33!important;font-weight:bold;animation:ee-jp-blink .8s step-end infinite}",
      "@keyframes ee-jp-blink{0%,100%{opacity:1}50%{opacity:0}}",

      /* Body area */
      ".ee-jp-body{flex:1;display:flex;overflow:hidden;background:#010;position:relative}",

      /* Text output */
      ".ee-jp-output{flex:1;overflow-y:auto;padding:8px 12px;scrollbar-width:none}",
      ".ee-jp-output::-webkit-scrollbar{width:0}",

      /* Text lines */
      ".ee-jp-line{color:#0f0;font-size:14px;line-height:1.5;" +
        "text-shadow:0 0 6px rgba(0,255,0,0.5);animation:ee-jp-typein .1s}",
      ".ee-jp-burst{font-weight:bold;font-size:20px;color:#4f4;" +
        "text-shadow:0 0 12px rgba(0,255,0,0.7)}",
      "@keyframes ee-jp-typein{from{opacity:0;transform:translateX(-4px)}to{opacity:1;transform:translateX(0)}}",

      /* Sidebar with Nedry face */
      ".ee-jp-sidebar{width:170px;flex-shrink:0;display:flex;align-items:center;" +
        "justify-content:center;padding:10px;border-left:1px solid #040}",
      ".ee-jp-nedry{width:140px;opacity:0.8;filter:drop-shadow(0 0 8px rgba(0,255,0,0.2))}",
      ".ee-jp-finger{animation:ee-jp-wag .3s ease-in-out infinite alternate;transform-origin:112px 58px}",
      "@keyframes ee-jp-wag{0%{transform:rotate(-14deg)}100%{transform:rotate(14deg)}}",

      /* Hint text */
      ".ee-jp-hint{position:absolute;bottom:14px;left:50%;transform:translateX(-50%);" +
        "color:rgba(0,255,0,0.2);font-size:10px;z-index:11;letter-spacing:3px;" +
        "font-family:'Courier New',monospace}",

      /* ── Water glass (Phase 1) ─────────────────── */
      ".ee-jp-glass{position:fixed;bottom:50px;right:70px;width:60px;height:85px;" +
        "z-index:99998;opacity:0;animation:ee-jp-fadein .6s .15s forwards;" +
        "filter:drop-shadow(0 2px 8px rgba(0,0,0,0.3))}",

      /* Ripple circles — only animate when .ee-jp-rippling is set */
      ".ee-jp-r1,.ee-jp-r2,.ee-jp-r3{opacity:0;transform-origin:25px 28px}",
      ".ee-jp-rippling .ee-jp-r1{animation:ee-jp-ripple .8s ease-out}",
      ".ee-jp-rippling .ee-jp-r2{animation:ee-jp-ripple .8s ease-out .1s}",
      ".ee-jp-rippling .ee-jp-r3{animation:ee-jp-ripple .8s ease-out .2s}",
      "@keyframes ee-jp-ripple{0%{transform:scale(1);opacity:.7}100%{transform:scale(6);opacity:0}}",

      /* ── Transitions ───────────────────────────── */

      /* Screen flash */
      ".ee-jp-flash{position:fixed;inset:0;z-index:99999;pointer-events:none;" +
        "background:#fff;animation:ee-jp-flashout .3s forwards}",
      "@keyframes ee-jp-flashout{" +
        "0%{opacity:.7}20%{opacity:0}40%{opacity:.35}60%{opacity:0}80%{opacity:.15}100%{opacity:0}}",

      /* Fade in / out */
      "@keyframes ee-jp-fadein{from{opacity:0}to{opacity:1}}",
      ".ee-jp-dismiss{animation:ee-jp-fadeout .5s forwards;pointer-events:none}",
      "@keyframes ee-jp-fadeout{to{opacity:0}}",
    ].join("\n");
  }

  /* ── Register ──────────────────────────────────────────── */

  EasterEggs.register("jurassicpark", {
    trigger: "nedry",
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("jurassicpark");
})();
