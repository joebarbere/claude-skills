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

  const EasterEggs = {
    /** @type {Object<string, EasterEggConfig>} */
    _registry: {},
    _inputBuffer: "",
    _maxTriggerLen: 10,
    _initialized: false,
    _activeEggs: new Set(),

    /**
     * Register an easter egg.
     * @param {string} name        Unique name (matches subdirectory)
     * @param {object} config
     * @param {string}   config.trigger     Key sequence to activate (e.g. "aaaaa")
     * @param {Function} config.activate    Called when triggered
     * @param {Function} [config.deactivate] Called to dismiss
     * @param {string}   [config.event]     Alternative event: "click:5" (5 rapid clicks),
     *                                      "scroll:top" (scroll to very top fast)
     * @param {boolean}  [config.once=false] Only trigger once per page load
     */
    register(name, config) {
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
    enable(name) {
      const egg = this._registry[name];
      if (egg) egg.enabled = true;
    },

    /** Enable all registered easter eggs. */
    enableAll() {
      for (const egg of Object.values(this._registry)) {
        egg.enabled = true;
      }
    },

    /** Disable a specific easter egg. */
    disable(name) {
      const egg = this._registry[name];
      if (egg) {
        egg.enabled = false;
        if (this._activeEggs.has(name) && egg.deactivate) {
          egg.deactivate();
          this._activeEggs.delete(name);
        }
      }
    },

    /** Dismiss an active easter egg. */
    dismiss(name) {
      const egg = this._registry[name];
      if (egg && this._activeEggs.has(name)) {
        if (egg.deactivate) egg.deactivate();
        this._activeEggs.delete(name);
      }
    },

    /** Dismiss all active easter eggs. */
    dismissAll() {
      for (const name of [...this._activeEggs]) {
        this.dismiss(name);
      }
    },

    /** List registered easter egg names. */
    list() {
      return Object.keys(this._registry);
    },

    /** Manually trigger an easter egg by name. */
    trigger(name) {
      const egg = this._registry[name];
      if (!egg) return;
      if (egg.once && egg._triggered) return;
      egg._triggered = true;
      this._activeEggs.add(name);
      egg.activate();
    },

    /** Inject a CSS stylesheet string into the page. Returns the <style> element. */
    injectCSS(css) {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      return style;
    },

    /** Inject an HTML overlay. Returns the container element. */
    injectOverlay(html, className) {
      const container = document.createElement("div");
      container.className = className || "ee-overlay";
      container.innerHTML = html;
      document.body.appendChild(container);
      return container;
    },

    /** Remove an element from the DOM. */
    removeElement(el) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    },

    // ── Internal ────────────────────────────────────────────────────

    _init() {
      if (this._initialized) return;
      this._initialized = true;

      // Keyboard listener
      document.addEventListener("keydown", (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;

        const key = e.key.length === 1 ? e.key : "";
        if (!key) return;

        this._inputBuffer += key;
        if (this._inputBuffer.length > this._maxTriggerLen) {
          this._inputBuffer = this._inputBuffer.slice(-this._maxTriggerLen);
        }

        this._checkTriggers();
      });

      // Click-count listener (for "click:N" events)
      let clickCount = 0;
      let clickTimer = null;
      document.addEventListener("click", () => {
        clickCount++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
          for (const [name, egg] of Object.entries(this._registry)) {
            if (!egg.enabled) continue;
            if (egg.once && egg._triggered) continue;
            const m = (egg.event || "").match(/^click:(\d+)$/);
            if (m && clickCount >= parseInt(m[1], 10)) {
              egg._triggered = true;
              this._activeEggs.add(name);
              egg.activate();
            }
          }
          clickCount = 0;
        }, 500);
      });

      // Scroll-to-top listener
      document.addEventListener("scroll", () => {
        if (window.scrollY === 0) {
          for (const [name, egg] of Object.entries(this._registry)) {
            if (!egg.enabled) continue;
            if (egg.once && egg._triggered) continue;
            if (egg.event === "scroll:top") {
              egg._triggered = true;
              this._activeEggs.add(name);
              egg.activate();
            }
          }
        }
      });
    },

    _checkTriggers() {
      for (const [name, egg] of Object.entries(this._registry)) {
        if (!egg.enabled) continue;
        if (egg.once && egg._triggered) continue;
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
