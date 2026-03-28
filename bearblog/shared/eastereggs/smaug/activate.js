/**
 * Smaug's Golden Scale Easter Egg (The Hobbit)
 *
 * Trigger: Type "smaug" — a sparkling golden scale appears on the page
 *          Click the scale — Bard's Black Arrow flies across and shatters it
 * Dismiss: Sequence auto-completes (~8s), or click backdrop during arrow phase
 */
(function () {
  "use strict";

  var styleEl = null;
  var scaleEl = null;
  var arrowEl = null;
  var overlayEl = null;
  var timers = [];
  var audioCtx = null;

  // Golden dragon scale SVG
  var SCALE_SVG =
    '<svg viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="ee-sm-gold" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#FFD700"/>' +
    '<stop offset="40%" stop-color="#FFC125"/>' +
    '<stop offset="70%" stop-color="#DAA520"/>' +
    '<stop offset="100%" stop-color="#B8860B"/>' +
    '</linearGradient></defs>' +
    '<polygon points="20,2 38,26 20,50 2,26" fill="url(#ee-sm-gold)" stroke="#B8860B" stroke-width="1"/>' +
    '<polygon points="20,8 32,26 20,44 8,26" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>' +
    '<line x1="20" y1="2" x2="20" y2="50" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>' +
    '<line x1="2" y1="26" x2="38" y2="26" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>' +
    '</svg>';

  // Black Arrow SVG
  var ARROW_SVG =
    '<svg viewBox="0 0 200 20" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="30" y="9" width="160" height="2" fill="#1a1a1a" rx="1"/>' +
    '<polygon points="0,10 30,4 30,16" fill="#2a2a2a"/>' + // arrowhead
    '<polygon points="195,6 200,10 195,14 192,10" fill="#555"/>' + // nock
    '<polygon points="190,3 200,10 190,10" fill="#8B4513" opacity="0.8"/>' + // fletching top
    '<polygon points="190,17 200,10 190,10" fill="#8B4513" opacity="0.8"/>' + // fletching bottom
    '</svg>';

  // Dragon silhouette SVG
  var DRAGON_SVG =
    '<svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M60,200 Q40,180 50,150 Q55,130 70,120 L65,100 Q75,105 80,95 ' +
    'Q85,80 100,70 Q110,65 120,55 L115,40 Q130,50 140,42 Q155,32 170,38 ' +
    'Q185,42 195,55 L210,50 Q205,65 215,75 Q230,85 235,100 Q240,115 235,130 ' +
    'Q245,135 260,130 Q250,145 240,155 Q235,165 225,170 Q220,180 210,185 ' +
    'Q195,195 175,200 Q155,205 140,200 Q120,205 100,202 Q80,205 60,200Z" ' +
    'fill="#1a1a1a" opacity="0.9"/>' +
    '<!-- Eye -->' +
    '<circle cx="165" cy="58" r="6" fill="#FF2200" opacity="0.9"/>' +
    '<circle cx="165" cy="58" r="3" fill="#FF6600"/>' +
    '<!-- Jaw open -->' +
    '<path d="M100,70 Q80,90 65,105 Q75,100 90,92 Q95,85 100,70Z" fill="#1a1a1a"/>' +
    '<!-- Teeth -->' +
    '<path d="M75,95 L80,88 L85,95 L90,87 L95,93" fill="none" stroke="#333" stroke-width="1.5"/>' +
    '</svg>';

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    // Place the scale at a semi-random position
    var posRight = 15 + Math.random() * 25;
    var posBottom = 20 + Math.random() * 30;

    scaleEl = document.createElement("div");
    scaleEl.className = "ee-sm-scale";
    scaleEl.innerHTML = SCALE_SVG +
      '<div class="ee-sm-spark ee-sm-spark-1"></div>' +
      '<div class="ee-sm-spark ee-sm-spark-2"></div>' +
      '<div class="ee-sm-spark ee-sm-spark-3"></div>';
    scaleEl.style.right = posRight + "%";
    scaleEl.style.bottom = posBottom + "%";
    document.body.appendChild(scaleEl);

    scaleEl.addEventListener("click", onScaleClick);
  }

  function onScaleClick(e) {
    e.stopPropagation();
    if (!scaleEl) return;

    // Get scale position for arrow targeting
    var rect = scaleEl.getBoundingClientRect();
    var targetX = rect.left + rect.width / 2;
    var targetY = rect.top + rect.height / 2;

    // Remove click handler so it can't fire twice
    scaleEl.removeEventListener("click", onScaleClick);

    // Create arrow
    arrowEl = document.createElement("div");
    arrowEl.className = "ee-sm-arrow";
    arrowEl.innerHTML = ARROW_SVG;
    arrowEl.style.top = (targetY - 10) + "px";
    arrowEl.style.setProperty("--target-x", (targetX - 30) + "px");
    document.body.appendChild(arrowEl);

    // On arrow arrival, trigger impact
    arrowEl.addEventListener("animationend", function () {
      onImpact(targetX, targetY);
    });
  }

  function onImpact(x, y) {
    // Play impact sound
    playImpactSound();

    // Remove arrow
    if (arrowEl) { EasterEggs.removeElement(arrowEl); arrowEl = null; }

    // Screen shake
    document.documentElement.classList.add("ee-sm-shake");
    timers.push(setTimeout(function () {
      document.documentElement.classList.remove("ee-sm-shake");
    }, 300));

    // Golden flash
    var flash = document.createElement("div");
    flash.className = "ee-sm-flash";
    document.body.appendChild(flash);
    timers.push(setTimeout(function () { EasterEggs.removeElement(flash); }, 400));

    // Shatter the scale into shards
    if (scaleEl) {
      var rect = scaleEl.getBoundingClientRect();
      EasterEggs.removeElement(scaleEl);
      scaleEl = null;
      spawnShards(rect);
    }

    // Dragon silhouette roar
    timers.push(setTimeout(function () {
      var dragon = document.createElement("div");
      dragon.className = "ee-sm-dragon";
      dragon.innerHTML = DRAGON_SVG;
      document.body.appendChild(dragon);
      timers.push(setTimeout(function () { EasterEggs.removeElement(dragon); }, 2000));
    }, 200));

    // Quote text
    timers.push(setTimeout(function () {
      var quote = document.createElement("div");
      quote.className = "ee-sm-quote";
      quote.textContent = "The Black Arrow finds its mark!";
      document.body.appendChild(quote);
      timers.push(setTimeout(function () { EasterEggs.removeElement(quote); }, 3000));
    }, 600));

    // Auto-deactivate after everything finishes
    timers.push(setTimeout(deactivate, 4000));
  }

  function spawnShards(rect) {
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var colors = ["#FFD700", "#FFC125", "#DAA520", "#B8860B", "#FFE66D"];
    for (var i = 0; i < 10; i++) {
      var shard = document.createElement("div");
      shard.className = "ee-sm-shard";
      var dx = -120 + Math.random() * 240;
      var dy = -150 + Math.random() * 200;
      var rot = Math.random() * 720 - 360;
      var size = 4 + Math.random() * 10;
      shard.style.cssText =
        "left:" + cx + "px;top:" + cy + "px;" +
        "width:" + size + "px;height:" + size + "px;" +
        "background:" + colors[Math.floor(Math.random() * colors.length)] + ";" +
        "--dx:" + dx + "px;--dy:" + dy + "px;--rot:" + rot + "deg;" +
        "animation-delay:" + (Math.random() * 0.1) + "s;";
      document.body.appendChild(shard);
      (function (el) {
        setTimeout(function () { EasterEggs.removeElement(el); }, 1200);
      })(shard);
    }
  }

  function playImpactSound() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      var now = audioCtx.currentTime;

      // Low thud
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);

      // Noise burst for metallic crack
      var bufSize = audioCtx.sampleRate * 0.08;
      var buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      var noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      var nGain = audioCtx.createGain();
      nGain.gain.setValueAtTime(0.2, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      noise.connect(nGain);
      nGain.connect(audioCtx.destination);
      noise.start(now);
      noise.stop(now + 0.1);
    } catch (e) { /* Audio not available */ }
  }

  function deactivate() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
    if (scaleEl) { EasterEggs.removeElement(scaleEl); scaleEl = null; }
    if (arrowEl) { EasterEggs.removeElement(arrowEl); arrowEl = null; }
    document.documentElement.classList.remove("ee-sm-shake");
    // Remove any lingering elements
    var leftovers = document.querySelectorAll(".ee-sm-dragon,.ee-sm-quote,.ee-sm-flash,.ee-sm-shard");
    for (var j = 0; j < leftovers.length; j++) EasterEggs.removeElement(leftovers[j]);
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
    EasterEggs._activeEggs.delete("smaug");
  }

  function getCSS() {
    return "" +
      /* Scale */
      ".ee-sm-scale{position:fixed;z-index:99998;width:40px;height:52px;cursor:pointer;" +
        "animation:ee-sm-sparkle 2s ease-in-out infinite;filter:drop-shadow(0 0 8px rgba(255,215,0,0.6));" +
        "transition:transform 0.2s}" +
      ".ee-sm-scale:hover{transform:scale(1.15)}" +
      "@keyframes ee-sm-sparkle{0%,100%{filter:drop-shadow(0 0 8px rgba(255,215,0,0.4)) brightness(1)}50%{filter:drop-shadow(0 0 20px rgba(255,215,0,0.9)) brightness(1.4)}}" +

      /* Sparkle dots */
      ".ee-sm-spark{position:absolute;width:4px;height:4px;border-radius:50%;background:#fff;pointer-events:none;animation:ee-sm-spark-anim 1.5s ease-in-out infinite}" +
      ".ee-sm-spark-1{top:-5px;left:50%;animation-delay:0s}" +
      ".ee-sm-spark-2{top:40%;right:-6px;animation-delay:0.5s}" +
      ".ee-sm-spark-3{bottom:0;left:-4px;animation-delay:1s}" +
      "@keyframes ee-sm-spark-anim{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1.5)}}" +

      /* Arrow */
      ".ee-sm-arrow{position:fixed;left:-220px;width:200px;height:20px;z-index:99999;" +
        "animation:ee-sm-fly 0.55s cubic-bezier(0.1,0,0.7,1) forwards}" +
      "@keyframes ee-sm-fly{0%{transform:translateX(0) translateY(0)}30%{transform:translateX(calc(var(--target-x) * 0.3)) translateY(-4px)}60%{transform:translateX(calc(var(--target-x) * 0.6)) translateY(3px)}100%{transform:translateX(var(--target-x)) translateY(0)}}" +

      /* Flash */
      ".ee-sm-flash{position:fixed;inset:0;z-index:99999;background:rgba(255,215,0,0.5);animation:ee-sm-flash-out 0.35s ease-out forwards;pointer-events:none}" +
      "@keyframes ee-sm-flash-out{to{opacity:0}}" +

      /* Shards */
      ".ee-sm-shard{position:fixed;z-index:99999;clip-path:polygon(50% 0%,100% 100%,0% 100%);animation:ee-sm-shatter 0.8s ease-out forwards;pointer-events:none}" +
      "@keyframes ee-sm-shatter{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--dx),var(--dy)) rotate(var(--rot));opacity:0}}" +

      /* Dragon */
      ".ee-sm-dragon{position:fixed;top:50%;left:50%;width:300px;height:250px;transform:translate(-50%,-50%) scale(0.5);z-index:99998;opacity:0;pointer-events:none;" +
        "animation:ee-sm-dragon-in 1.8s ease-out forwards}" +
      "@keyframes ee-sm-dragon-in{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)}20%{opacity:0.15;transform:translate(-50%,-50%) scale(1)}80%{opacity:0.15}100%{opacity:0;transform:translate(-50%,-50%) scale(1.05)}}" +

      /* Quote */
      ".ee-sm-quote{position:fixed;bottom:15%;left:50%;transform:translateX(-50%);z-index:99998;font-family:Georgia,serif;font-size:20px;color:#FFD700;text-shadow:0 0 15px rgba(255,215,0,0.5),1px 1px 2px #000;white-space:nowrap;opacity:0;pointer-events:none;" +
        "animation:ee-sm-quote-in 2.5s ease-out forwards}" +
      "@keyframes ee-sm-quote-in{0%{opacity:0}15%{opacity:1}85%{opacity:1}100%{opacity:0}}" +

      /* Shake */
      ".ee-sm-shake{animation:ee-sm-shake-anim 0.15s 2!important}" +
      "@keyframes ee-sm-shake-anim{0%{transform:translate(0)}25%{transform:translate(-4px,2px)}50%{transform:translate(4px,-2px)}75%{transform:translate(-2px,3px)}100%{transform:translate(0)}}" +

      "";
  }

  EasterEggs.register("smaug", {
    trigger: "smaug",
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("smaug");
})();
