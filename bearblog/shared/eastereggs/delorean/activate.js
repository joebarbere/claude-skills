/**
 * Back to the Future Easter Egg
 *
 * Trigger: Type "delorean" or scroll:fast event
 * Effect:  DeLorean speeds across the screen leaving fire trails at 88 mph,
 *          speedometer climbs, flash of light, "GREAT SCOTT!" text
 * Dismiss: Click or wait 10 seconds
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var timer = null;
  var speedTimer = null;

  var DELOREAN_SVG =
    '<svg viewBox="0 0 160 60" class="ee-bt-car">' +
    '<!-- Body -->' +
    '<rect x="10" y="20" width="140" height="25" rx="5" fill="#c0c0c0"/>' +
    '<rect x="25" y="10" width="80" height="15" rx="3" fill="#a0a0a0"/>' +
    '<!-- Windows -->' +
    '<rect x="30" y="12" width="30" height="11" rx="2" fill="#4488cc"/>' +
    '<rect x="65" y="12" width="30" height="11" rx="2" fill="#4488cc"/>' +
    '<!-- Wheels -->' +
    '<circle cx="40" cy="48" r="10" fill="#333"/><circle cx="40" cy="48" r="5" fill="#666"/>' +
    '<circle cx="120" cy="48" r="10" fill="#333"/><circle cx="120" cy="48" r="5" fill="#666"/>' +
    '<!-- Flux capacitor glow -->' +
    '<rect x="70" y="22" width="20" height="8" rx="2" fill="#00ccff" class="ee-bt-flux"/>' +
    '<!-- Headlights -->' +
    '<rect x="148" y="25" width="6" height="4" rx="1" fill="#ffff88"/>' +
    '<rect x="148" y="35" width="6" height="4" rx="1" fill="#ff3333"/>' +
    '</svg>';

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-bt-screen">' +
        '<div class="ee-bt-road"></div>' +
        '<div class="ee-bt-car-wrap">' + DELOREAN_SVG + '</div>' +
        '<div class="ee-bt-fire"></div>' +
        '<div class="ee-bt-speed"><span class="ee-bt-mph">0</span> MPH</div>' +
        '<div class="ee-bt-flash"></div>' +
        '<div class="ee-bt-text">GREAT SCOTT!</div>' +
      '</div>',
      "ee-bt-overlay"
    );

    overlayEl.addEventListener("click", dismiss);

    // Animate speedometer
    var mph = 0;
    var mphEl = overlayEl.querySelector(".ee-bt-mph");
    speedTimer = setInterval(function () {
      if (!mphEl) return;
      mph += 4;
      if (mph > 88) mph = 88;
      mphEl.textContent = mph;
      if (mph >= 88) {
        clearInterval(speedTimer);
        speedTimer = null;
        // Flash!
        var flash = overlayEl && overlayEl.querySelector(".ee-bt-flash");
        if (flash) flash.classList.add("ee-bt-flash-active");
      }
    }, 100);

    timer = setTimeout(dismiss, 10000);
  }

  function dismiss() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (speedTimer) { clearInterval(speedTimer); speedTimer = null; }
    if (overlayEl) {
      overlayEl.classList.add("ee-bt-out");
      setTimeout(function () {
        EasterEggs.removeElement(overlayEl);
        overlayEl = null;
        EasterEggs._activeEggs.delete("delorean");
      }, 400);
    }
  }

  function getCSS() {
    return "" +
      ".ee-bt-overlay{position:fixed;inset:0;z-index:99999;animation:ee-bt-in 0.3s ease-out}" +
      "@keyframes ee-bt-in{from{opacity:0}to{opacity:1}}" +
      ".ee-bt-out{animation:ee-bt-fade 0.4s ease-in forwards}" +
      "@keyframes ee-bt-fade{to{opacity:0}}" +
      ".ee-bt-screen{width:100%;height:100%;background:linear-gradient(180deg,#0a0a1a 0%,#1a1a2e 60%,#333 100%);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}" +
      ".ee-bt-road{position:absolute;bottom:0;left:0;width:100%;height:30%;background:#333;border-top:2px dashed #666}" +
      /* Car animation */
      ".ee-bt-car-wrap{position:absolute;bottom:28%;animation:ee-bt-drive 3s ease-in forwards}" +
      "@keyframes ee-bt-drive{0%{left:-200px}70%{left:40%}100%{left:120%}}" +
      ".ee-bt-car{width:160px;height:60px}" +
      ".ee-bt-flux{animation:ee-bt-flux-glow 0.2s ease-in-out infinite alternate}" +
      "@keyframes ee-bt-flux-glow{from{fill:#00ccff;filter:brightness(1)}to{fill:#88eeff;filter:brightness(1.5)}}" +
      /* Fire trails */
      ".ee-bt-fire{position:absolute;bottom:30%;left:0;width:100%;height:8px;background:linear-gradient(90deg,transparent 0%,#ff6600 20%,#ff3300 50%,transparent 100%);opacity:0;animation:ee-bt-fire-trail 3s ease-in 2s forwards}" +
      "@keyframes ee-bt-fire-trail{0%{opacity:0}20%{opacity:0.8}100%{opacity:0}}" +
      /* Speed */
      ".ee-bt-speed{position:absolute;top:20px;right:20px;font-family:'Courier New',monospace;font-size:28px;font-weight:bold;color:#ff3300;text-shadow:0 0 10px rgba(255,50,0,0.6)}" +
      ".ee-bt-mph{color:#ff6600}" +
      /* Flash at 88mph */
      ".ee-bt-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}" +
      ".ee-bt-flash-active{animation:ee-bt-flash-anim 0.6s ease-out forwards}" +
      "@keyframes ee-bt-flash-anim{0%{opacity:0}10%{opacity:1}100%{opacity:0}}" +
      /* Text */
      ".ee-bt-text{position:absolute;font-family:Arial,sans-serif;font-size:32px;font-weight:bold;color:#ff6600;text-shadow:0 0 15px rgba(255,100,0,0.6);opacity:0;animation:ee-bt-text-in 0.5s ease-out 3.5s forwards}" +
      "@keyframes ee-bt-text-in{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}" +
      "";
  }

  EasterEggs.register("delorean", {
    trigger: "delorean",
    activate: activate,
    deactivate: dismiss,
    once: false,
  });
  EasterEggs.enable("delorean");

  // Also register the scroll:fast variant
  EasterEggs.register("delorean-scroll", {
    event: "scroll:fast",
    activate: function () { EasterEggs.trigger("delorean"); },
    deactivate: function () {},
    once: true,
  });
  EasterEggs.enable("delorean-scroll");
})();
