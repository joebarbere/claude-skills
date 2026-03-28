/**
 * Quake Console Easter Egg
 *
 * Trigger: Press ` (backtick) — the classic Quake console key
 * Effect:  Drop-down console from top with command input and fun cheats
 * Dismiss: Press ` again (toggle) or type "quit"
 */
(function () {
  "use strict";

  var styleEl = null;
  var consoleEl = null;
  var outputEl = null;
  var inputEl = null;
  var active = false;
  var commandHistory = [];
  var historyIdx = -1;
  var inputBuffer = "";

  var COMMANDS = {
    help: function () {
      return [
        "Available commands:",
        "  god          - Toggle god mode",
        "  noclip       - Toggle noclip",
        "  give all     - Give all items",
        "  sv_gravity N - Set gravity (default 800)",
        "  impulse 9    - All weapons",
        "  kill         - Respawn",
        "  clear        - Clear console",
        "  quit         - Close console",
        "  version      - Show version",
      ];
    },
    god: function () {
      document.body.classList.toggle("ee-qk-god");
      var on = document.body.classList.contains("ee-qk-god");
      return ["God mode " + (on ? "ON" : "OFF")];
    },
    noclip: function () {
      document.body.classList.toggle("ee-qk-noclip");
      var on = document.body.classList.contains("ee-qk-noclip");
      return ["Noclip " + (on ? "ON" : "OFF")];
    },
    "give all": function () {
      // Confetti burst
      spawnConfetti();
      return ["Giving all items..."];
    },
    "impulse 9": function () {
      spawnConfetti();
      return ["All weapons acquired"];
    },
    kill: function () {
      document.body.classList.add("ee-qk-kill");
      setTimeout(function () { document.body.classList.remove("ee-qk-kill"); }, 500);
      return ["Player suicided", "Respawning..."];
    },
    clear: function () {
      if (outputEl) outputEl.innerHTML = "";
      return [];
    },
    quit: function () {
      setTimeout(deactivate, 100);
      return ["Closing console..."];
    },
    version: function () {
      return [
        "Quake Console v1.0 (Easter Egg Edition)",
        "Engine: EasterEggs.js",
        "Build: " + new Date().toISOString().split("T")[0],
      ];
    },
  };

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());
    active = true;
    inputBuffer = "";
    historyIdx = -1;

    consoleEl = EasterEggs.injectOverlay(
      '<div class="ee-qk-output"></div>' +
      '<div class="ee-qk-input-line">' +
        '<span class="ee-qk-prompt">]</span>' +
        '<span class="ee-qk-input-text"></span>' +
        '<span class="ee-qk-cursor">_</span>' +
      '</div>',
      "ee-qk-console"
    );

    outputEl = consoleEl.querySelector(".ee-qk-output");
    inputEl = consoleEl.querySelector(".ee-qk-input-text");

    // Show welcome message
    appendLines([
      "---- Quake Console ----",
      'Type "help" for available commands.',
      "",
    ]);

    EasterEggs.captureInput(handleKey);
  }

  function deactivate() {
    active = false;
    EasterEggs.releaseInput();

    // Clean up page effects
    document.body.classList.remove("ee-qk-god", "ee-qk-noclip", "ee-qk-kill");

    if (consoleEl) {
      consoleEl.classList.add("ee-qk-slideup");
      var el = consoleEl;
      setTimeout(function () { EasterEggs.removeElement(el); }, 400);
      consoleEl = null;
    }
    outputEl = null;
    inputEl = null;
    EasterEggs._activeEggs.delete("quake");
  }

  function handleKey(e) {
    e.preventDefault();

    // Backtick toggles console off
    if (e.key === "`" || e.key === "~") {
      deactivate();
      return;
    }

    if (e.key === "Enter") {
      var cmd = inputBuffer.trim();
      if (cmd) {
        commandHistory.push(cmd);
        historyIdx = commandHistory.length;
      }
      appendLine("] " + cmd);
      inputBuffer = "";
      inputEl.textContent = "";

      if (cmd) executeCommand(cmd.toLowerCase());
    } else if (e.key === "Backspace") {
      inputBuffer = inputBuffer.slice(0, -1);
      inputEl.textContent = inputBuffer;
    } else if (e.key === "ArrowUp") {
      if (historyIdx > 0) {
        historyIdx--;
        inputBuffer = commandHistory[historyIdx] || "";
        inputEl.textContent = inputBuffer;
      }
    } else if (e.key === "ArrowDown") {
      if (historyIdx < commandHistory.length - 1) {
        historyIdx++;
        inputBuffer = commandHistory[historyIdx] || "";
      } else {
        historyIdx = commandHistory.length;
        inputBuffer = "";
      }
      inputEl.textContent = inputBuffer;
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      inputBuffer += e.key;
      inputEl.textContent = inputBuffer;
    }
  }

  function executeCommand(cmd) {
    // Check for sv_gravity pattern
    var gravMatch = cmd.match(/^sv_gravity\s+(\d+)$/);
    if (gravMatch) {
      var g = parseInt(gravMatch[1], 10);
      if (g < 200) {
        document.body.style.transition = "transform 1s";
        document.body.style.transform = "translateY(-20px)";
        setTimeout(function () { document.body.style.transform = ""; }, 2000);
        appendLine("sv_gravity set to " + g + " (low gravity!)");
      } else {
        document.body.style.transform = "";
        appendLine("sv_gravity set to " + g);
      }
      return;
    }

    var handler = COMMANDS[cmd];
    if (handler) {
      var lines = handler();
      if (lines && lines.length) appendLines(lines);
    } else {
      appendLine('Unknown command "' + cmd + '"');
    }
  }

  function appendLine(text) {
    if (!outputEl) return;
    var div = document.createElement("div");
    div.className = "ee-qk-line";
    div.textContent = text;
    outputEl.appendChild(div);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function appendLines(lines) {
    for (var i = 0; i < lines.length; i++) appendLine(lines[i]);
  }

  function spawnConfetti() {
    var colors = ["#FF0", "#0FF", "#F0F", "#0F0", "#F80", "#08F"];
    for (var i = 0; i < 40; i++) {
      var p = document.createElement("div");
      p.className = "ee-qk-confetti";
      p.style.cssText =
        "left:" + Math.random() * 100 + "%;background:" + colors[Math.floor(Math.random() * colors.length)] +
        ";animation-delay:" + (Math.random() * 0.5) + "s;animation-duration:" + (1 + Math.random() * 2) + "s;" +
        "--drift:" + (-50 + Math.random() * 100) + "px";
      document.body.appendChild(p);
      (function (el) {
        setTimeout(function () { EasterEggs.removeElement(el); }, 3000);
      })(p);
    }
  }

  function getCSS() {
    return "" +
      /* Console — slides down from top, covers top 45% */
      ".ee-qk-console{position:fixed;top:0;left:0;width:100vw;height:45vh;z-index:99999;pointer-events:all;" +
        "background:linear-gradient(180deg,rgba(40,25,10,0.95) 0%,rgba(30,18,5,0.98) 100%);" +
        "border-bottom:3px solid #D2691E;box-shadow:0 4px 20px rgba(0,0,0,0.7);" +
        "font-family:'Courier New',monospace;display:flex;flex-direction:column;padding:10px;" +
        "animation:ee-qk-slidedown 0.3s ease-out}" +
      "@keyframes ee-qk-slidedown{from{transform:translateY(-100%)}to{transform:translateY(0)}}" +
      ".ee-qk-slideup{animation:ee-qk-slideup-anim 0.3s ease-in forwards}" +
      "@keyframes ee-qk-slideup-anim{to{transform:translateY(-100%)}}" +

      /* Output */
      ".ee-qk-output{flex:1;overflow-y:auto;color:#D2961E;font-size:14px;line-height:1.5;text-shadow:0 0 3px rgba(210,150,30,0.3)}" +
      ".ee-qk-output::-webkit-scrollbar{width:6px}" +
      ".ee-qk-output::-webkit-scrollbar-thumb{background:rgba(210,150,30,0.3);border-radius:3px}" +
      ".ee-qk-line{min-height:1.5em;white-space:pre-wrap}" +

      /* Input */
      ".ee-qk-input-line{display:flex;align-items:center;color:#D2961E;font-size:14px;padding:4px 0;border-top:1px solid rgba(210,150,30,0.2)}" +
      ".ee-qk-prompt{margin-right:5px;color:#FFA500}" +
      ".ee-qk-input-text{white-space:pre}" +
      ".ee-qk-cursor{animation:ee-qk-blink 0.6s step-end infinite;color:#FFA500}" +
      "@keyframes ee-qk-blink{0%,100%{opacity:1}50%{opacity:0}}" +

      /* God mode — golden glow */
      ".ee-qk-god{box-shadow:inset 0 0 50px rgba(255,215,0,0.15)!important;border:2px solid rgba(255,215,0,0.2)!important}" +

      /* Noclip — transparency */
      ".ee-qk-noclip *:not(.ee-qk-console):not(.ee-qk-console *){opacity:0.5!important}" +

      /* Kill flash */
      ".ee-qk-kill{animation:ee-qk-death 0.5s!important}" +
      "@keyframes ee-qk-death{0%{filter:brightness(1)}20%{filter:brightness(3) saturate(0)}100%{filter:brightness(1)}}" +

      /* Confetti for "give all" */
      ".ee-qk-confetti{position:fixed;top:-10px;width:8px;height:8px;z-index:100000;pointer-events:none;animation:ee-qk-confetti-fall linear forwards}" +
      "@keyframes ee-qk-confetti-fall{0%{transform:translateY(0) translateX(0) rotate(0)}100%{transform:translateY(100vh) translateX(var(--drift)) rotate(720deg);opacity:0}}" +

      "";
  }

  // Register — use backtick as trigger with toggle behavior
  // Since backtick is a single printable char, the engine's normal trigger matching works
  EasterEggs.register("quake", {
    trigger: "`",
    activate: activate,
    deactivate: deactivate,
    toggle: true,
    once: false,
  });
  EasterEggs.enable("quake");
})();
