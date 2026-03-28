/**
 * Warcraft 2 Gold Mine Easter Egg
 *
 * Trigger: Type "zug zug"
 * Effect:  Sparkling gold mine appears. Click to hear synthesized gold chime,
 *          see "+N GOLD" float, and occasionally a peasant walks to the mine.
 * Dismiss: 20s of no clicks, or click outside the mine
 */
(function () {
  "use strict";

  var styleEl = null;
  var mineEl = null;
  var hudEl = null;
  var backdropEl = null;
  var audioCtx = null;
  var goldCount = 0;
  var clickCount = 0;
  var inactivityTimer = null;
  var peasantEl = null;
  var peasantTimer = null;

  var MINE_SVG =
    '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">' +
    '<!-- Cave opening -->' +
    '<ellipse cx="40" cy="55" rx="28" ry="22" fill="#1a1209"/>' +
    '<ellipse cx="40" cy="55" rx="24" ry="18" fill="#0d0a06"/>' +
    '<!-- Wooden beams -->' +
    '<rect x="12" y="33" width="6" height="40" rx="1" fill="#8B4513" transform="rotate(-5 15 53)"/>' +
    '<rect x="62" y="33" width="6" height="40" rx="1" fill="#8B4513" transform="rotate(5 65 53)"/>' +
    '<rect x="14" y="32" width="52" height="6" rx="2" fill="#A0522D"/>' +
    '<!-- Beam highlights -->' +
    '<rect x="16" y="33" width="48" height="1.5" fill="rgba(255,255,255,0.15)" rx="1"/>' +
    '<!-- Gold nuggets -->' +
    '<g class="ee-wc-nuggets">' +
    '<polygon points="22,68 28,64 32,70 24,72" fill="#FFD700" class="ee-wc-nug"/>' +
    '<polygon points="35,70 40,66 45,71 38,74" fill="#FFC125" class="ee-wc-nug"/>' +
    '<polygon points="48,67 54,63 57,69 50,71" fill="#DAA520" class="ee-wc-nug"/>' +
    '<polygon points="30,74 35,71 38,76 32,77" fill="#FFD700" class="ee-wc-nug"/>' +
    '<polygon points="44,73 49,70 52,75 46,76" fill="#FFC125" class="ee-wc-nug"/>' +
    '<circle cx="40" cy="60" r="3" fill="#FFE66D" class="ee-wc-nug"/>' +
    '</g>' +
    '</svg>';

  var PEASANT_SVG =
    '<svg viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">' +
    '<!-- Head -->' +
    '<circle cx="15" cy="8" r="6" fill="#DEBB98"/>' +
    '<!-- Eyes -->' +
    '<circle cx="13" cy="7" r="1" fill="#333"/>' +
    '<circle cx="17" cy="7" r="1" fill="#333"/>' +
    '<!-- Hat -->' +
    '<ellipse cx="15" cy="4" rx="7" ry="3" fill="#8B4513"/>' +
    '<rect x="9" y="3" width="12" height="2" fill="#A0522D"/>' +
    '<!-- Body (tunic) -->' +
    '<rect x="9" y="14" width="12" height="14" rx="2" fill="#4169E1"/>' +
    '<rect x="10" y="14" width="10" height="3" fill="#5179F1"/>' +
    '<!-- Belt -->' +
    '<rect x="9" y="22" width="12" height="2" fill="#8B4513"/>' +
    '<!-- Arms -->' +
    '<rect x="4" y="15" width="5" height="3" rx="1" fill="#DEBB98"/>' +
    '<rect x="21" y="15" width="5" height="3" rx="1" fill="#DEBB98"/>' +
    '<!-- Pickaxe in right hand -->' +
    '<line x1="24" y1="10" x2="24" y2="18" stroke="#8B4513" stroke-width="1.5"/>' +
    '<polygon points="22,10 26,10 24,6" fill="#888"/>' +
    '<!-- Legs -->' +
    '<g class="ee-wc-leg-l"><rect x="10" y="28" width="4" height="12" rx="1" fill="#654321"/></g>' +
    '<g class="ee-wc-leg-r"><rect x="16" y="28" width="4" height="12" rx="1" fill="#654321"/></g>' +
    '<!-- Feet -->' +
    '<ellipse cx="12" cy="41" rx="4" ry="2" fill="#3a2410"/>' +
    '<ellipse cx="18" cy="41" rx="4" ry="2" fill="#3a2410"/>' +
    '</svg>';

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());
    goldCount = 0;
    clickCount = 0;

    // Semi-transparent backdrop for click-outside-to-dismiss
    backdropEl = document.createElement("div");
    backdropEl.className = "ee-wc-backdrop";
    backdropEl.addEventListener("click", deactivate);
    document.body.appendChild(backdropEl);

    // Place the mine
    var posRight = 10 + Math.random() * 25;
    var posBottom = 10 + Math.random() * 25;
    mineEl = document.createElement("div");
    mineEl.className = "ee-wc-mine";
    mineEl.innerHTML = MINE_SVG;
    mineEl.style.right = posRight + "%";
    mineEl.style.bottom = posBottom + "%";
    mineEl.addEventListener("click", onMineClick);
    document.body.appendChild(mineEl);

    resetInactivity();
  }

  function resetInactivity() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(deactivate, 20000);
  }

  function onMineClick(e) {
    e.stopPropagation();
    clickCount++;
    goldCount += 100;
    resetInactivity();

    // Play gold chime
    playChime();

    // Floating "+N GOLD" text
    spawnGoldText(e.clientX, e.clientY);

    // Update or create HUD
    updateHUD();

    // Spawn peasant every 3rd click
    if (clickCount % 3 === 0 && !peasantEl) {
      spawnPeasant();
    }
  }

  function playChime() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
      var now = audioCtx.currentTime;

      // Metallic clink (noise burst through bandpass)
      var bufSize = Math.floor(audioCtx.sampleRate * 0.02);
      var buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
      var noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      var bp = audioCtx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 3000;
      bp.Q.value = 2;
      var nGain = audioCtx.createGain();
      nGain.gain.setValueAtTime(0.15, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      noise.connect(bp);
      bp.connect(nGain);
      nGain.connect(audioCtx.destination);
      noise.start(now);
      noise.stop(now + 0.04);

      // First note — 1200Hz
      var osc1 = audioCtx.createOscillator();
      var g1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.value = 1200;
      g1.gain.setValueAtTime(0.001, now);
      g1.gain.linearRampToValueAtTime(0.15, now + 0.005);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(g1);
      g1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // Second note — 1600Hz (ascending chime)
      var osc2 = audioCtx.createOscillator();
      var g2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.value = 1600;
      g2.gain.setValueAtTime(0.001, now + 0.07);
      g2.gain.linearRampToValueAtTime(0.15, now + 0.075);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc2.connect(g2);
      g2.connect(audioCtx.destination);
      osc2.start(now + 0.07);
      osc2.stop(now + 0.22);
    } catch (e) { /* Audio not available */ }
  }

  function spawnGoldText(x, y) {
    var el = document.createElement("div");
    el.className = "ee-wc-gold-text";
    el.textContent = "+" + goldCount + " GOLD";
    el.style.left = x + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);
    setTimeout(function () { EasterEggs.removeElement(el); }, 1300);
  }

  function updateHUD() {
    if (!hudEl) {
      hudEl = document.createElement("div");
      hudEl.className = "ee-wc-hud";
      hudEl.innerHTML =
        '<svg viewBox="0 0 16 16" width="14" height="14" style="vertical-align:middle;margin-right:5px">' +
        '<polygon points="5,14 8,10 11,14 8,12" fill="#FFD700"/>' +
        '<polygon points="4,8 8,2 12,8 10,7 8,10 6,7" fill="#FFC125"/>' +
        '</svg>' +
        '<span class="ee-wc-hud-val">0</span>';
      document.body.appendChild(hudEl);
    }
    hudEl.querySelector(".ee-wc-hud-val").textContent = goldCount;
  }

  function spawnPeasant() {
    if (!mineEl) return;
    var mineRect = mineEl.getBoundingClientRect();
    var mineX = mineRect.left + mineRect.width / 2 - 15;
    var mineY = mineRect.bottom - 45;

    peasantEl = document.createElement("div");
    peasantEl.className = "ee-wc-peasant";
    peasantEl.innerHTML = PEASANT_SVG;
    peasantEl.style.top = mineY + "px";
    peasantEl.style.setProperty("--mine-x", mineX + "px");
    document.body.appendChild(peasantEl);

    peasantTimer = setTimeout(function () {
      if (peasantEl) { EasterEggs.removeElement(peasantEl); peasantEl = null; }
    }, 5000);
  }

  function deactivate() {
    if (inactivityTimer) { clearTimeout(inactivityTimer); inactivityTimer = null; }
    if (peasantTimer) { clearTimeout(peasantTimer); peasantTimer = null; }
    if (mineEl) { EasterEggs.removeElement(mineEl); mineEl = null; }
    if (hudEl) { EasterEggs.removeElement(hudEl); hudEl = null; }
    if (backdropEl) { EasterEggs.removeElement(backdropEl); backdropEl = null; }
    if (peasantEl) { EasterEggs.removeElement(peasantEl); peasantEl = null; }
    // Clean up floating text
    var texts = document.querySelectorAll(".ee-wc-gold-text");
    for (var i = 0; i < texts.length; i++) EasterEggs.removeElement(texts[i]);
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
    EasterEggs._activeEggs.delete("warcraft");
  }

  function getCSS() {
    return "" +
      /* Backdrop */
      ".ee-wc-backdrop{position:fixed;inset:0;z-index:99996;pointer-events:all}" +

      /* Mine */
      ".ee-wc-mine{position:fixed;z-index:99998;width:80px;height:80px;cursor:pointer;transition:transform 0.2s;" +
        "filter:drop-shadow(0 0 6px rgba(255,215,0,0.4))}" +
      ".ee-wc-mine:hover{transform:scale(1.08)}" +

      /* Nugget sparkle */
      ".ee-wc-nug{animation:ee-wc-glint 1.5s ease-in-out infinite}" +
      ".ee-wc-nug:nth-child(1){animation-delay:0s}" +
      ".ee-wc-nug:nth-child(2){animation-delay:0.25s}" +
      ".ee-wc-nug:nth-child(3){animation-delay:0.5s}" +
      ".ee-wc-nug:nth-child(4){animation-delay:0.75s}" +
      ".ee-wc-nug:nth-child(5){animation-delay:1s}" +
      ".ee-wc-nug:nth-child(6){animation-delay:1.25s}" +
      "@keyframes ee-wc-glint{0%,100%{filter:brightness(1)}50%{filter:brightness(1.8)}}" +

      /* Floating gold text */
      ".ee-wc-gold-text{position:fixed;z-index:99999;pointer-events:none;font-family:'Trebuchet MS',sans-serif;font-size:22px;font-weight:bold;" +
        "color:#FFD700;text-shadow:1px 1px 0 #8B6914,0 0 8px rgba(255,215,0,0.5);white-space:nowrap;" +
        "animation:ee-wc-float 1.2s ease-out forwards}" +
      "@keyframes ee-wc-float{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-60px);opacity:0}}" +

      /* HUD */
      ".ee-wc-hud{position:fixed;top:15px;right:15px;z-index:99999;background:rgba(0,0,0,0.75);border:1px solid #8B6914;" +
        "border-radius:4px;padding:5px 12px;font-family:'Trebuchet MS',sans-serif;font-size:14px;color:#FFD700;" +
        "animation:ee-wc-hud-in 0.3s ease-out}" +
      "@keyframes ee-wc-hud-in{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}" +

      /* Peasant */
      ".ee-wc-peasant{position:fixed;z-index:99997;width:30px;height:45px;left:-40px;" +
        "animation:ee-wc-peasant-walk 5s linear forwards}" +
      "@keyframes ee-wc-peasant-walk{0%{left:-40px}40%{left:var(--mine-x)}50%{left:var(--mine-x)}100%{left:-40px}}" +
      ".ee-wc-leg-l{animation:ee-wc-step 0.3s ease-in-out infinite alternate;transform-origin:12px 28px}" +
      ".ee-wc-leg-r{animation:ee-wc-step 0.3s ease-in-out infinite alternate-reverse;transform-origin:18px 28px}" +
      "@keyframes ee-wc-step{0%{transform:rotate(-10deg)}100%{transform:rotate(10deg)}}" +

      "";
  }

  EasterEggs.register("warcraft", {
    trigger: "zug zug",
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("warcraft");
})();
