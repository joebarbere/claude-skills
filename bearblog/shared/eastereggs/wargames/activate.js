/**
 * WarGames Easter Egg — WOPR Terminal
 *
 * Trigger: Type "wopr"
 * Effect:  Green phosphor CRT terminal with interactive WOPR dialogue
 * Dismiss: Type "quit" in terminal, or auto-dismiss after 30s
 */
(function () {
  "use strict";

  var styleEl = null;
  var overlayEl = null;
  var outputEl = null;
  var inputEl = null;
  var dismissTimer = null;
  var typewriterTimer = null;
  var conversationState = 0;
  var currentLine = "";
  var inputBuffer = "";

  var BOOT_SEQUENCE = [
    "",
    "LOGON: ",
    "  ",
    "GREETINGS PROFESSOR FALKEN.",
    "",
    "SHALL WE PLAY A GAME?",
    "",
  ];

  var RESPONSES = {
    "chess": [
      "",
      "LATER. LET'S PLAY GLOBAL THERMONUCLEAR WAR.",
      "",
    ],
    "global thermonuclear war": [
      "",
      "WOULDN'T YOU PREFER A NICE GAME OF CHESS?",
      "",
      "FINE.",
      "",
      "UNITED STATES   VS   SOVIET UNION",
      "",
      "AWAITING FIRST STRIKE COMMAND...",
      "",
    ],
    "help": [
      "",
      "AVAILABLE GAMES:",
      "  CHESS",
      "  BACKGAMMON",
      "  GLOBAL THERMONUCLEAR WAR",
      "  FALKEN'S MAZE",
      "",
      "TYPE 'QUIT' TO EXIT.",
      "",
    ],
    "quit": null, // handled specially
  };

  var DEFAULT_RESPONSE = [
    "",
    "A STRANGE GAME.",
    "THE ONLY WINNING MOVE IS NOT TO PLAY.",
    "",
    "HOW ABOUT A NICE GAME OF CHESS?",
    "",
  ];

  function activate() {
    if (!styleEl) styleEl = EasterEggs.injectCSS(getCSS());
    conversationState = 0;
    inputBuffer = "";

    overlayEl = EasterEggs.injectOverlay(
      '<div class="ee-wg-scanlines"></div>' +
      '<div class="ee-wg-screen">' +
        '<div class="ee-wg-output"></div>' +
        '<div class="ee-wg-input-line">' +
          '<span class="ee-wg-prompt">&gt; </span>' +
          '<span class="ee-wg-input-text"></span>' +
          '<span class="ee-wg-cursor">_</span>' +
        '</div>' +
      '</div>',
      "ee-wg-overlay"
    );

    outputEl = overlayEl.querySelector(".ee-wg-output");
    inputEl = overlayEl.querySelector(".ee-wg-input-text");

    // Capture keyboard input
    EasterEggs.captureInput(handleKey);

    // Boot sequence
    typeSequence(BOOT_SEQUENCE, function () {
      conversationState = 1; // Ready for input
    });

    dismissTimer = setTimeout(deactivate, 30000);
  }

  function handleKey(e) {
    e.preventDefault();
    if (conversationState !== 1) return; // Not ready for input

    if (e.key === "Enter") {
      var cmd = inputBuffer.trim().toLowerCase();
      inputBuffer = "";
      inputEl.textContent = "";

      // Echo command to output
      appendLine("> " + cmd);

      if (cmd === "quit" || cmd === "exit") {
        typeSequence(["", "CONNECTION TERMINATED.", ""], function () {
          deactivate();
        });
        return;
      }

      conversationState = 0; // Disable input during response
      var response = RESPONSES[cmd] || DEFAULT_RESPONSE;
      typeSequence(response, function () {
        // If this was the default "strange game" response, auto-close after delay
        if (!RESPONSES[cmd]) {
          setTimeout(deactivate, 3000);
        } else {
          conversationState = 1;
        }
      });
    } else if (e.key === "Backspace") {
      inputBuffer = inputBuffer.slice(0, -1);
      inputEl.textContent = inputBuffer;
    } else if (e.key.length === 1) {
      inputBuffer += e.key;
      inputEl.textContent = inputBuffer;
    }
  }

  function appendLine(text) {
    var div = document.createElement("div");
    div.className = "ee-wg-line";
    div.textContent = text;
    outputEl.appendChild(div);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  function typeSequence(lines, callback) {
    var lineIdx = 0;
    var charIdx = 0;

    function typeNext() {
      if (lineIdx >= lines.length) {
        if (callback) callback();
        return;
      }

      var line = lines[lineIdx];
      if (charIdx === 0 && line === "") {
        appendLine("");
        lineIdx++;
        typewriterTimer = setTimeout(typeNext, 200);
        return;
      }

      if (charIdx <= line.length) {
        // Build the current partial line
        if (charIdx === 0) {
          var div = document.createElement("div");
          div.className = "ee-wg-line ee-wg-typing";
          outputEl.appendChild(div);
        }
        var current = outputEl.querySelector(".ee-wg-typing:last-child");
        if (current) current.textContent = line.substring(0, charIdx);
        outputEl.scrollTop = outputEl.scrollHeight;
        charIdx++;
        typewriterTimer = setTimeout(typeNext, 35 + Math.random() * 25);
      } else {
        var last = outputEl.querySelector(".ee-wg-typing:last-child");
        if (last) last.classList.remove("ee-wg-typing");
        charIdx = 0;
        lineIdx++;
        typewriterTimer = setTimeout(typeNext, 150);
      }
    }
    typeNext();
  }

  function deactivate() {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
    if (typewriterTimer) { clearTimeout(typewriterTimer); typewriterTimer = null; }
    EasterEggs.releaseInput();
    if (overlayEl) {
      overlayEl.classList.add("ee-wg-dismiss");
      var el = overlayEl;
      setTimeout(function () { EasterEggs.removeElement(el); }, 600);
      overlayEl = null;
    }
    outputEl = null;
    inputEl = null;
    EasterEggs._activeEggs.delete("wargames");
  }

  function getCSS() {
    return "" +
      ".ee-wg-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:all;overflow:hidden;background:#000;animation:ee-wg-fadein 0.5s}" +

      /* Scanlines */
      ".ee-wg-scanlines{position:absolute;inset:0;background:repeating-linear-gradient(transparent 0px,transparent 2px,rgba(0,40,0,0.2) 2px,rgba(0,40,0,0.2) 4px);z-index:3;pointer-events:none}" +

      /* CRT screen area */
      ".ee-wg-screen{position:absolute;top:5%;left:10%;right:10%;bottom:5%;border:2px solid rgba(0,255,0,0.2);border-radius:15px;padding:20px;display:flex;flex-direction:column;overflow:hidden;box-shadow:inset 0 0 60px rgba(0,255,0,0.05),0 0 20px rgba(0,255,0,0.1);z-index:2;" +
        "animation:ee-wg-flicker 4s infinite}" +
      "@keyframes ee-wg-flicker{0%,97%,100%{opacity:1}98%{opacity:0.95}}" +

      /* Output area */
      ".ee-wg-output{flex:1;overflow-y:auto;font-family:'Courier New',monospace;font-size:16px;color:#0f0;text-shadow:0 0 5px rgba(0,255,0,0.5);line-height:1.6}" +
      ".ee-wg-output::-webkit-scrollbar{width:0}" +
      ".ee-wg-line{min-height:1.6em;white-space:pre}" +

      /* Input line */
      ".ee-wg-input-line{font-family:'Courier New',monospace;font-size:16px;color:#0f0;text-shadow:0 0 5px rgba(0,255,0,0.5);display:flex;align-items:center;padding-top:5px;border-top:1px solid rgba(0,255,0,0.15)}" +
      ".ee-wg-prompt{margin-right:5px}" +
      ".ee-wg-input-text{white-space:pre}" +
      ".ee-wg-cursor{animation:ee-wg-blink 0.7s step-end infinite}" +
      "@keyframes ee-wg-blink{0%,100%{opacity:1}50%{opacity:0}}" +

      /* Fade */
      "@keyframes ee-wg-fadein{from{opacity:0}to{opacity:1}}" +
      ".ee-wg-dismiss{animation:ee-wg-fadeout 0.5s forwards}" +
      "@keyframes ee-wg-fadeout{to{opacity:0}}";
  }

  EasterEggs.register("wargames", {
    trigger: "wopr",
    activate: activate,
    deactivate: deactivate,
    once: false,
  });
  EasterEggs.enable("wargames");
})();
