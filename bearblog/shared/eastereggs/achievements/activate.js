/**
 * Fake Achievement Timer Easter Egg
 *
 * Trigger: Type "steam" (toggle — type again to disable)
 * Effect:  Persistent achievement system awarding humorous fake achievements
 *          based on time spent on the page. Steam-style toast notifications.
 * Dismiss: Type "steam" again
 */
(function () {
  "use strict";

  var styleEl = null;
  var counterEl = null;
  var checkInterval = null;
  var startTime = 0;
  var awarded = [];
  var audioCtx = null;
  var toastStack = []; // currently visible toasts

  // Icon SVGs (20x20 viewBox)
  var ICONS = {
    star:   '<svg viewBox="0 0 20 20" width="20" height="20"><polygon points="10,2 12.5,7.5 18,8 14,12 15,18 10,15 5,18 6,12 2,8 7.5,7.5" fill="#FFD700"/></svg>',
    eye:    '<svg viewBox="0 0 20 20" width="20" height="20"><ellipse cx="10" cy="10" rx="8" ry="5" fill="none" stroke="#ccc" stroke-width="1.5"/><circle cx="10" cy="10" r="3" fill="#ccc"/><circle cx="10" cy="10" r="1.5" fill="#666"/></svg>',
    book:   '<svg viewBox="0 0 20 20" width="20" height="20"><path d="M3,3 L3,17 Q10,14 10,14 Q10,14 17,17 L17,3 Q10,6 10,6 Q10,6 3,3Z" fill="none" stroke="#ccc" stroke-width="1.5"/><line x1="10" y1="6" x2="10" y2="14" stroke="#ccc" stroke-width="1"/></svg>',
    skull:  '<svg viewBox="0 0 20 20" width="20" height="20"><ellipse cx="10" cy="9" rx="7" ry="8" fill="#ddd"/><circle cx="7" cy="8" r="2" fill="#333"/><circle cx="13" cy="8" r="2" fill="#333"/><path d="M8,14 L8,17 M10,14 L10,17 M12,14 L12,17" stroke="#333" stroke-width="1.2"/><path d="M7,13 Q10,15 13,13" fill="none" stroke="#333" stroke-width="1"/></svg>',
    trophy: '<svg viewBox="0 0 20 20" width="20" height="20"><path d="M6,4 L14,4 L13,11 Q10,13 7,11 Z" fill="#FFD700"/><rect x="9" y="11" width="2" height="3" fill="#DAA520"/><rect x="6" y="14" width="8" height="2" rx="1" fill="#DAA520"/><path d="M6,4 Q2,4 2,7 Q2,10 6,9" fill="none" stroke="#FFC125" stroke-width="1.2"/><path d="M14,4 Q18,4 18,7 Q18,10 14,9" fill="none" stroke="#FFC125" stroke-width="1.2"/></svg>',
    fire:   '<svg viewBox="0 0 20 20" width="20" height="20"><path d="M10,2 Q13,6 12,9 Q14,7 14,10 Q14,15 10,17 Q6,15 6,10 Q6,7 8,9 Q7,6 10,2Z" fill="#FF6600"/><path d="M10,8 Q11,10 11,12 Q11,14 10,15 Q9,14 9,12 Q9,10 10,8Z" fill="#FFD700"/></svg>',
    ghost:  '<svg viewBox="0 0 20 20" width="20" height="20"><path d="M4,18 L4,9 Q4,3 10,3 Q16,3 16,9 L16,18 L14,16 L12,18 L10,16 L8,18 L6,16 Z" fill="#eee"/><circle cx="8" cy="9" r="2" fill="#333"/><circle cx="12" cy="9" r="2" fill="#333"/></svg>',
    crown:  '<svg viewBox="0 0 20 20" width="20" height="20"><polygon points="2,15 4,7 7,11 10,4 13,11 16,7 18,15" fill="#FFD700"/><rect x="2" y="15" width="16" height="2" rx="1" fill="#DAA520"/><circle cx="4" cy="7" r="1.2" fill="#FF6347"/><circle cx="10" cy="4" r="1.2" fill="#FF6347"/><circle cx="16" cy="7" r="1.2" fill="#FF6347"/></svg>',
  };

  var ACHIEVEMENTS = [
    { time: 10000,   icon: "star",   name: "First Steps",            desc: "You've been here for 10 seconds. Commitment!" },
    { time: 30000,   icon: "eye",    name: "Getting Comfortable",    desc: "Still reading? Impressive." },
    { time: 60000,   icon: "book",   name: "Dedicated Reader",       desc: "One whole minute. You're invested." },
    { time: 120000,  icon: "skull",  name: "No Life",                desc: "Two minutes on a blog post? Really?" },
    { time: 300000,  icon: "trophy", name: "Procrastination Master", desc: "Your boss would be proud." },
    { time: 600000,  icon: "fire",   name: "Blog Addict",           desc: "Seek help. Seriously." },
    { time: 900000,  icon: "ghost",  name: "AFK?",                  desc: "Are you still there?" },
    { time: 1800000, icon: "crown",  name: "Legendary Lurker",      desc: "You've earned this." },
  ];

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());
    startTime = Date.now();
    awarded = [];
    for (var i = 0; i < ACHIEVEMENTS.length; i++) awarded.push(false);
    toastStack = [];

    // Create AudioContext now (in keydown handler = valid user gesture)
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        audioCtx = new AC();
        if (audioCtx.state === "suspended") audioCtx.resume();
      }
    } catch (e) {}

    // Counter
    counterEl = document.createElement("div");
    counterEl.className = "ee-ac-counter";
    counterEl.innerHTML =
      ICONS.trophy.replace('width="20" height="20"', 'width="16" height="16" style="vertical-align:middle;margin-right:6px"') +
      '<span class="ee-ac-count-val">0 / ' + ACHIEVEMENTS.length + '</span>';
    document.body.appendChild(counterEl);

    // Start checking timer
    checkInterval = setInterval(checkAchievements, 1000);
  }

  function checkAchievements() {
    var elapsed = Date.now() - startTime;
    var awardedCount = 0;
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      if (awarded[i]) { awardedCount++; continue; }
      if (elapsed >= ACHIEVEMENTS[i].time) {
        awarded[i] = true;
        awardedCount++;
        showAchievement(ACHIEVEMENTS[i]);
        playDing();
      }
    }
    updateCounter(awardedCount);

    // Stop interval if all awarded
    if (awardedCount >= ACHIEVEMENTS.length && checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  }

  // Exposed for screenshot script
  window._eeAchievementsForce = function (idx) {
    if (idx >= 0 && idx < ACHIEVEMENTS.length && !awarded[idx]) {
      awarded[idx] = true;
      showAchievement(ACHIEVEMENTS[idx]);
      playDing();
      var count = 0;
      for (var i = 0; i < awarded.length; i++) if (awarded[i]) count++;
      updateCounter(count);
    }
  };

  function updateCounter(count) {
    if (!counterEl) return;
    var val = counterEl.querySelector(".ee-ac-count-val");
    if (val) val.textContent = count + " / " + ACHIEVEMENTS.length;
    if (count >= ACHIEVEMENTS.length) {
      counterEl.classList.add("ee-ac-counter-complete");
    }
  }

  function showAchievement(achievement) {
    var toast = document.createElement("div");
    toast.className = "ee-ac-toast";
    toast.innerHTML =
      '<div class="ee-ac-toast-icon">' + ICONS[achievement.icon] + '</div>' +
      '<div class="ee-ac-toast-body">' +
        '<div class="ee-ac-toast-title">ACHIEVEMENT UNLOCKED</div>' +
        '<div class="ee-ac-toast-name">' + achievement.name + '</div>' +
        '<div class="ee-ac-toast-desc">' + achievement.desc + '</div>' +
      '</div>';

    // Shift existing toasts up
    for (var i = 0; i < toastStack.length; i++) {
      var existing = toastStack[i];
      var currentShift = parseInt(existing.getAttribute("data-shift") || "0", 10);
      var newShift = currentShift + 90;
      existing.setAttribute("data-shift", newShift);
      existing.style.transform = "translateY(-" + newShift + "px)";
    }

    document.body.appendChild(toast);
    toastStack.push(toast);

    toast.setAttribute("data-shift", "0");

    // Auto-dismiss toast after 4s
    setTimeout(function () {
      toast.classList.add("ee-ac-toast-out");
      setTimeout(function () {
        EasterEggs.removeElement(toast);
        var idx = toastStack.indexOf(toast);
        if (idx !== -1) toastStack.splice(idx, 1);
        // Shift remaining toasts back down
        for (var j = 0; j < toastStack.length; j++) {
          var s = parseInt(toastStack[j].getAttribute("data-shift") || "0", 10);
          s = Math.max(0, s - 90);
          toastStack[j].setAttribute("data-shift", s);
          toastStack[j].style.transform = s > 0 ? "translateY(-" + s + "px)" : "";
        }
      }, 400);
    }, 4000);
  }

  function playDing() {
    try {
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") audioCtx.resume();
      var now = audioCtx.currentTime;

      // First tone — A5 (880Hz)
      var osc1 = audioCtx.createOscillator();
      var g1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.value = 880;
      g1.gain.setValueAtTime(0.001, now);
      g1.gain.linearRampToValueAtTime(0.12, now + 0.005);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(g1);
      g1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.16);

      // Second tone — E6 (1320Hz), offset
      var osc2 = audioCtx.createOscillator();
      var g2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.value = 1320;
      g2.gain.setValueAtTime(0.001, now + 0.03);
      g2.gain.linearRampToValueAtTime(0.1, now + 0.035);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc2.connect(g2);
      g2.connect(audioCtx.destination);
      osc2.start(now + 0.03);
      osc2.stop(now + 0.2);
    } catch (e) {}
  }

  function deactivate() {
    if (checkInterval) { clearInterval(checkInterval); checkInterval = null; }
    if (counterEl) { EasterEggs.removeElement(counterEl); counterEl = null; }
    // Remove all toasts
    for (var i = 0; i < toastStack.length; i++) {
      EasterEggs.removeElement(toastStack[i]);
    }
    toastStack = [];
    var leftover = document.querySelectorAll(".ee-ac-toast");
    for (var j = 0; j < leftover.length; j++) EasterEggs.removeElement(leftover[j]);
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
    window._eeAchievementsForce = undefined;
    EasterEggs._activeEggs.delete("achievements");
  }

  function getCSS() {
    return "" +
      /* Counter */
      ".ee-ac-counter{position:fixed;bottom:20px;right:20px;z-index:99998;background:rgba(30,30,30,0.85);" +
        "border:1px solid #4a4a4a;border-radius:4px;padding:6px 12px;font-family:Arial,sans-serif;" +
        "font-size:12px;color:#8f8f8f;display:flex;align-items:center;animation:ee-ac-counter-in 0.4s ease-out}" +
      "@keyframes ee-ac-counter-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}" +
      ".ee-ac-counter-complete{border-color:#FFD700}" +
      ".ee-ac-counter-complete .ee-ac-count-val{color:#FFD700;text-shadow:0 0 8px rgba(255,215,0,0.5)}" +

      /* Toast */
      ".ee-ac-toast{position:fixed;bottom:60px;right:20px;z-index:99999;width:320px;" +
        "background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-left:3px solid #FFD700;" +
        "border-radius:6px;padding:12px 14px;display:flex;align-items:flex-start;gap:12px;" +
        "box-shadow:0 4px 15px rgba(0,0,0,0.5);animation:ee-ac-toast-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards;" +
        "transition:transform 0.3s ease-out;pointer-events:none}" +
      "@keyframes ee-ac-toast-in{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}" +
      ".ee-ac-toast-out{animation:ee-ac-toast-out-anim 0.4s ease-in forwards!important}" +
      "@keyframes ee-ac-toast-out-anim{to{transform:translateX(120%)!important;opacity:0}}" +

      /* Toast icon */
      ".ee-ac-toast-icon{flex-shrink:0;width:20px;height:20px;margin-top:2px}" +

      /* Toast body */
      ".ee-ac-toast-body{flex:1;min-width:0}" +
      ".ee-ac-toast-title{font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#FFD700;margin-bottom:3px}" +
      ".ee-ac-toast-name{font-family:Arial,sans-serif;font-size:16px;font-weight:bold;color:#fff;margin-bottom:2px}" +
      ".ee-ac-toast-desc{font-family:Arial,sans-serif;font-size:12px;color:#aaa;line-height:1.3}" +

      "";
  }

  EasterEggs.register("achievements", {
    trigger: "steam",
    activate: activate,
    deactivate: deactivate,
    toggle: true,
    once: false,
  });
  EasterEggs.enable("achievements");
})();
