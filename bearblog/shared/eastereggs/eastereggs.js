/**
 * Easter Eggs Engine for Bear Blog
 *
 * A lightweight system that listens for user input (keyboard sequences,
 * click patterns, scroll events) and activates themed easter eggs.
 *
 * Usage:
 *   <script src="eastereggs.js"></script>
 *   <script src="bladerunner/activate.js"></script>
 *
 * Or inline:
 *   EasterEggs.register('myegg', { trigger: 'xyzzy', activate: fn, deactivate: fn });
 *   EasterEggs.enableAll();
 */
(function () {
  "use strict";

  // Arrow key mapping for trigger sequences (e.g. Konami code)
  var ARROW_MAP = {
    ArrowUp: "\x01U",
    ArrowDown: "\x01D",
    ArrowLeft: "\x01L",
    ArrowRight: "\x01R",
  };

  var EasterEggs = {
    /** @type {Object<string, EasterEggConfig>} */
    _registry: {},
    _inputBuffer: "",
    _maxTriggerLen: 20,
    _initialized: false,
    _activeEggs: new Set(),
    _inputCapture: null,

    // Arrow key tokens for building trigger strings
    ARROW_UP: "\x01U",
    ARROW_DOWN: "\x01D",
    ARROW_LEFT: "\x01L",
    ARROW_RIGHT: "\x01R",

    /**
     * Register an easter egg.
     * @param {string} name        Unique name (matches subdirectory)
     * @param {object} config
     * @param {string}   config.trigger      Key sequence to activate (e.g. "aaaaa")
     * @param {Function} config.activate     Called when triggered
     * @param {Function} [config.deactivate] Called to dismiss
     * @param {string}   [config.event]      Alternative event: "click:5", "scroll:top"
     * @param {boolean}  [config.once=false] Only trigger once per page load
     * @param {boolean}  [config.toggle=false] Trigger toggles active/inactive
     */
    register: function (name, config) {
      config.enabled = false;
      config._triggered = false;
      this._registry[name] = config;

      if (config.trigger && config.trigger.length > this._maxTriggerLen) {
        this._maxTriggerLen = config.trigger.length;
      }

      if (!this._initialized) {
        this._init();
      }
    },

    /** Enable a specific easter egg by name. */
    enable: function (name) {
      var egg = this._registry[name];
      if (egg) egg.enabled = true;
    },

    /** Enable all registered easter eggs. */
    enableAll: function () {
      for (var k in this._registry) {
        this._registry[k].enabled = true;
      }
    },

    /** Disable a specific easter egg. */
    disable: function (name) {
      var egg = this._registry[name];
      if (egg) {
        egg.enabled = false;
        if (this._activeEggs.has(name) && egg.deactivate) {
          egg.deactivate();
          this._activeEggs.delete(name);
        }
      }
    },

    /** Dismiss an active easter egg. */
    dismiss: function (name) {
      var egg = this._registry[name];
      if (egg && this._activeEggs.has(name)) {
        if (egg.deactivate) egg.deactivate();
        this._activeEggs.delete(name);
      }
    },

    /** Dismiss all active easter eggs. */
    dismissAll: function () {
      var names = [];
      this._activeEggs.forEach(function (n) { names.push(n); });
      for (var i = 0; i < names.length; i++) {
        this.dismiss(names[i]);
      }
    },

    /** List registered easter egg names. */
    list: function () {
      return Object.keys(this._registry);
    },

    /** Manually trigger an easter egg by name. */
    trigger: function (name) {
      var egg = this._registry[name];
      if (!egg) return;
      if (egg.toggle && this._activeEggs.has(name)) {
        this.dismiss(name);
        return;
      }
      if (egg.once && egg._triggered) return;
      egg._triggered = true;
      this._activeEggs.add(name);
      egg.activate();
    },

    /**
     * Capture all keyboard input, routing it to a callback instead of trigger detection.
     * Used by interactive eggs like Quake console and WarGames terminal.
     * @param {Function} callback  Receives the raw KeyboardEvent
     */
    captureInput: function (callback) {
      this._inputCapture = callback;
    },

    /** Release input capture, resuming normal trigger detection. */
    releaseInput: function () {
      this._inputCapture = null;
    },

    /** Inject a CSS stylesheet string into the page. Returns the <style> element. */
    injectCSS: function (css) {
      var style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    },

    /** Inject an HTML overlay. Returns the container element. */
    injectOverlay: function (html, className) {
      var container = document.createElement("div");
      container.className = className || "ee-overlay";
      container.innerHTML = html;
      document.body.appendChild(container);
      return container;
    },

    /** Remove an element from the DOM. */
    removeElement: function (el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    },

    // ── Internal ────────────────────────────────────────────────────

    _init: function () {
      if (this._initialized) return;
      this._initialized = true;
      var self = this;

      // Keyboard listener
      document.addEventListener("keydown", function (e) {
        if (e.metaKey || e.ctrlKey || e.altKey) return;

        // Input capture mode — route everything to callback
        if (self._inputCapture) {
          self._inputCapture(e);
          return;
        }

        // Map arrow keys to special tokens
        var mapped = ARROW_MAP[e.key];
        if (mapped) {
          self._inputBuffer += mapped;
          if (self._inputBuffer.length > self._maxTriggerLen) {
            self._inputBuffer = self._inputBuffer.slice(-self._maxTriggerLen);
          }
          self._checkTriggers();
          return;
        }

        // Regular printable keys
        var key = e.key.length === 1 ? e.key : "";
        if (!key) return;

        self._inputBuffer += key;
        if (self._inputBuffer.length > self._maxTriggerLen) {
          self._inputBuffer = self._inputBuffer.slice(-self._maxTriggerLen);
        }

        self._checkTriggers();
      });

      // Click-count listener (for "click:N" events)
      var clickCount = 0;
      var clickTimer = null;
      document.addEventListener("click", function () {
        clickCount++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(function () {
          for (var name in self._registry) {
            var egg = self._registry[name];
            if (!egg.enabled) continue;
            if (egg.once && egg._triggered) continue;
            var m = (egg.event || "").match(/^click:(\d+)$/);
            if (m && clickCount >= parseInt(m[1], 10)) {
              egg._triggered = true;
              self._activeEggs.add(name);
              egg.activate();
            }
          }
          clickCount = 0;
        }, 500);
      });

      // Scroll listener (scroll:top and scroll:fast)
      var lastScrollY = window.scrollY;
      var lastScrollTime = Date.now();
      document.addEventListener("scroll", function () {
        var now = Date.now();
        var dy = Math.abs(window.scrollY - lastScrollY);
        var dt = now - lastScrollTime;

        if (window.scrollY === 0) {
          for (var name in self._registry) {
            var egg = self._registry[name];
            if (!egg.enabled) continue;
            if (egg.once && egg._triggered) continue;
            if (egg.event === "scroll:top") {
              egg._triggered = true;
              self._activeEggs.add(name);
              egg.activate();
            }
          }
        }

        // scroll:fast — triggers when user scrolls > 800px in < 300ms
        if (dt < 300 && dy > 800) {
          for (var name2 in self._registry) {
            var egg2 = self._registry[name2];
            if (!egg2.enabled) continue;
            if (egg2.once && egg2._triggered) continue;
            if (egg2.event === "scroll:fast") {
              egg2._triggered = true;
              self._activeEggs.add(name2);
              egg2.activate();
            }
          }
        }

        lastScrollY = window.scrollY;
        lastScrollTime = now;
      });
    },

    _checkTriggers: function () {
      for (var name in this._registry) {
        var egg = this._registry[name];
        if (!egg.enabled) continue;
        if (egg.once && egg._triggered) continue;
        // Toggle: if already active, deactivate
        if (egg.toggle && this._activeEggs.has(name) && egg.trigger && this._inputBuffer.endsWith(egg.trigger)) {
          this.dismiss(name);
          this._inputBuffer = "";
          break;
        }
        if (egg.trigger && this._inputBuffer.endsWith(egg.trigger)) {
          egg._triggered = true;
          this._activeEggs.add(name);
          egg.activate();
          this._inputBuffer = "";
          break;
        }
      }
    },
  };

  // Expose globally
  window.EasterEggs = EasterEggs;
})();
