---
name: add-easter-egg
description: Apply a named easter egg to a Bear Blog post or the entire blog. Use when the user wants to add hidden interactive easter eggs (like the Blade Runner origami unicorn) to their blog.
argument-hint: <easter-egg-name> [--post <uid>] [--blog]
allowed-tools: Read, Glob, Bash, Write, Edit
disable-model-invocation: true
---

# Add Easter Egg to Bear Blog

Inject a named easter egg into a Bear Blog post or the entire blog's custom HTML.

## Available Easter Eggs

Easter eggs live in `${CLAUDE_SKILL_DIR}/../shared/eastereggs/`. Each subdirectory (excluding `samples/`) is an easter egg containing:
- `activate.js` — self-registering script that includes CSS and activation logic
- `style.css` — standalone CSS file (for reference; CSS is inlined in activate.js)
- Any supporting assets (SVG, images, audio)

List available easter eggs by reading the subdirectories under `${CLAUDE_SKILL_DIR}/../shared/eastereggs/`.

## Your workflow

1. **Identify the easter egg.** If `$ARGUMENTS` names one, use it. Otherwise list available eggs and ask.

2. **Read the easter egg files:**
   - Read `${CLAUDE_SKILL_DIR}/../shared/eastereggs/eastereggs.js` (the engine)
   - Read `${CLAUDE_SKILL_DIR}/../shared/eastereggs/<egg-name>/activate.js`

3. **Generate the embed snippet.** Combine the engine + activation script into a single `<script>` block for embedding:

   ```html
   <script>
   // === Easter Eggs Engine ===
   [contents of eastereggs.js]

   // === <egg-name> Easter Egg ===
   [contents of <egg-name>/activate.js]
   </script>
   ```

4. **Apply the snippet based on the user's target:**

   - **Single post (`--post <uid>`):** Append the `<script>` block to the post's body content using the bearblog CLI:
     1. Fetch the post: `cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts get <uid> -o /tmp/ee-post.md`
     2. Append the script block to the post body
     3. Update the post: `npx tsx bearblog.ts update <uid> /tmp/ee-post.md`

   - **Entire blog (`--blog`):** Instruct the user to paste the snippet into their Bear Blog dashboard under **Settings → Custom head/footer HTML**. Bear Blog injects custom HTML on every page.

   - **No target specified:** Show the generated snippet and ask the user where to apply it (specific post or whole blog).

5. **Explain the trigger.** Tell the user how to activate the easter egg (see details below).

## Easter egg details

### bladerunner
- **Trigger:** Type `aaaaa`
- **Effect:** Dark cinematic overlay with animated origami unicorn that unfolds from nothing, gentle floating animation, rain effect, and the famous Blade Runner quote
- **Dismiss:** Click anywhere on the overlay, or wait 10 seconds

### konami
- **Trigger:** Konami Code — `↑↑↓↓←→←→BA`
- **Effect:** Retro 8-bit celebration with "30 LIVES" text, pixel confetti in NES colors, CRT scanline filter, score displays
- **Dismiss:** Click or wait 8 seconds

### jurassicpark
- **Trigger:** Type `nedry`
- **Effect:** Full-screen Nedry lockout — green-on-black CRT terminal floods with "Ah ah ah, you didn't say the magic word!" lines. Clicking spawns extra text bursts. Wagging finger animation.
- **Dismiss:** Type `please` to unlock, or wait 15 seconds

### mortalkombat
- **Trigger:** Type `fatality`
- **Effect:** Dramatic sequence: "FINISH HIM!" with screen shake → "FATALITY" in dripping red → page elements shatter outward → "FLAWLESS VICTORY". MK dragon silhouette in background.
- **Dismiss:** Click or wait 10 seconds

### nbajam
- **Trigger:** Type `boomshakalaka`
- **Effect:** Big Head Mode — all images on the page scale to 2x. "HE'S ON FIRE!" in flaming text, "BOOMSHAKALAKA!" slam-dunks onto screen, announcer callouts rotate ("FROM DOWNTOWN!", "IS IT THE SHOES?!"), score overlay.
- **Dismiss:** Click the fire text, or wait 15 seconds

### hackers
- **Trigger:** Type `acidburn`
- **Effect:** Page glitch effect with jitter animation, Matrix-style character rain on canvas (green/cyan/magenta), "HACK THE PLANET" in neon text, random page elements get corrupted with skew/color effects, animated flame SVG
- **Dismiss:** Click or wait 10 seconds

### realgenius
- **Trigger:** Type `popcorn`
- **Effect:** Red laser beam fires from top of screen, popcorn kernels explode outward from impact point in all directions, popcorn pile accumulates at the bottom of the page
- **Dismiss:** Click or wait 12 seconds

### godzilla
- **Trigger:** Type `godzilla`
- **Effect:** Cute chibi Godzilla with spines walks across the screen left to right. Legs animate in walk cycle, tail swishes, screen shakes on each stomp. At ~40%, Godzilla breathes fire and "chars" random page elements.
- **Dismiss:** Godzilla walks off-screen after ~12s, or click to dismiss early

### wargames
- **Trigger:** Type `wopr`
- **Effect:** Full-screen green phosphor CRT terminal. WOPR boot sequence types out "GREETINGS PROFESSOR FALKEN. SHALL WE PLAY A GAME?" Interactive — type responses:
  - `chess` → "LATER. LET'S PLAY GLOBAL THERMONUCLEAR WAR."
  - `global thermonuclear war` → target selection sequence
  - `help` → list available games
  - Anything else → "A STRANGE GAME. THE ONLY WINNING MOVE IS NOT TO PLAY."
- **Dismiss:** Type `quit`, or wait 30 seconds

### quake
- **Trigger:** Press `` ` `` (backtick)
- **Effect:** Drop-down console from top (45% of screen), amber-on-dark styling. Interactive command input with history (Up/Down arrows). Commands:
  - `god` — golden glow on page
  - `noclip` — page elements become transparent
  - `give all` / `impulse 9` — confetti burst
  - `sv_gravity N` — low values make page float
  - `kill` — screen flash
  - `clear` / `help` / `version` / `quit`
- **Dismiss:** Press `` ` `` again (toggle) or type `quit`

### smaug
- **Trigger:** Type `smaug`
- **Effect:** A sparkling golden dragon scale appears on the page. Click it to fire Bard's Black Arrow — the arrow flies across the screen, strikes the scale with a golden flash and screen shake, the scale shatters into golden shards, and a dragon silhouette briefly roars in the background. Impact sound via Web Audio.
- **Dismiss:** Sequence auto-completes after ~4s, or click backdrop during arrow phase

### warcraft
- **Trigger:** Type `zug zug`
- **Effect:** Sparkling gold mine with nuggets appears. Click to hear a synthesized gold chime (Web Audio), see "+N GOLD" floating text, and a resource counter HUD. Every 3rd click spawns a walking peasant with a pickaxe who walks to the mine and back.
- **Dismiss:** 20 seconds of inactivity, or click outside the mine

### achievements
- **Trigger:** Type `steam` (toggle — type again to disable)
- **Effect:** Persistent fake achievement system. Steam-style toast notifications slide in at timed intervals with a ding sound (Web Audio). Achievements: "First Steps" (10s), "Getting Comfortable" (30s), "Dedicated Reader" (1m), "No Life" (2m), "Procrastination Master" (5m), "Blog Addict" (10m), "AFK?" (15m), "Legendary Lurker" (30m). Counter shows X/8 unlocked.
- **Dismiss:** Type `steam` again to toggle off

### bsod
- **Trigger:** Type `bsod`
- **Effect:** Classic Windows Blue Screen of Death overlay with fake error text, technical hex codes, and blinking cursor
- **Dismiss:** Press any key, click, or wait 10 seconds

### oregon
- **Trigger:** Type `oregon`
- **Effect:** Green-on-black Oregon Trail screen with random death message typewriter effect, tombstone SVG
- **Dismiss:** Click or wait 12 seconds

### asyouwish
- **Trigger:** Type `asyouwish`
- **Effect:** Princess Bride overlay on a green hillside night sky. Westley silhouette tumbles across. Iconic quotes cycle with fade transitions.
- **Dismiss:** Click or wait 10 seconds

### dayoff
- **Trigger:** Type `dayoff`
- **Effect:** Ferris Bueller fourth-wall-break overlay. Cycling quotes, subtle leopard vest stripes, mini Ferris character.
- **Dismiss:** Click or wait 12 seconds

### hello
- **Trigger:** Type `hello`
- **Effect:** Classic 1984 Macintosh "hello" in cursive drawn with SVG stroke-dasharray animation on beige background with Mac silhouette
- **Dismiss:** Click or wait 8 seconds

### triforce
- **Trigger:** Type `triforce`
- **Effect:** Golden Triforce materializes piece by piece with golden sparkle particles, "It's dangerous to go alone! Take this." text, ascending chime via Web Audio
- **Dismiss:** Click or wait 10 seconds

### oneup
- **Trigger:** Type `1up`
- **Effect:** Mario ? block bumps, green 1-UP mushroom pops out, "1 UP" text floats up, coins fly from block. Classic coin sound via Web Audio (square wave B5→E6).
- **Dismiss:** Click or wait 8 seconds

### c64
- **Trigger:** Type `c64`
- **Effect:** Commodore 64 blue boot screen. "64K RAM SYSTEM 38911 BASIC BYTES FREE" typewriter text with blinking block cursor.
- **Dismiss:** Click or wait 10 seconds

### dir
- **Trigger:** Type `dir`
- **Effect:** MS-DOS directory listing with fake blog files (EASTREGG.JS 31,337 bytes, SECRETS.TXT 0 bytes, etc.). Typewriter output.
- **Dismiss:** Click or wait 10 seconds

### invaders
- **Trigger:** Type `invaders`
- **Effect:** Canvas-rendered Space Invaders with 8×4 formation descending, auto-firing ship, pixel explosion flashes on hit. Score display.
- **Dismiss:** Click or wait 12 seconds

### wakawaka
- **Trigger:** Type `wakawaka`
- **Effect:** Pac-Man chases four colored ghosts across the screen eating dots. After 4 seconds ghosts turn blue (power pellet mode).
- **Dismiss:** Click or wait 10 seconds

### lv426
- **Trigger:** Type `lv426`
- **Effect:** Aliens motion tracker radar with sweeping line, blips getting closer, distance readout counting down, ping sound via Web Audio. "They're coming outta the walls!" quote.
- **Dismiss:** Click or wait 15 seconds

### tetris
- **Trigger:** Type `tetris`
- **Effect:** Colored tetrominos rain down and stack at the bottom of the page. Classic Tetris piece shapes (I, O, T, S, Z, J, L) in standard colors.
- **Dismiss:** Click or wait 12 seconds

### maxhead
- **Trigger:** Type `maxhead`
- **Effect:** Max Headroom glitch overlay with jittering SVG face, stuttering quotes that cycle, horizontal glitch bars, CRT scanlines, neon blue/magenta color scheme.
- **Dismiss:** Click or wait 10 seconds

### pkemeter
- **Trigger:** Type `pkemeter`
- **Effect:** Ghostbusters PKE meter with spreading wings, rising gauge needle, climbing reading. No-ghost logo flashes in. "WHO YA GONNA CALL? GHOSTBUSTERS!" text.
- **Dismiss:** Click or wait 10 seconds

### flynn
- **Trigger:** Type `flynn`
- **Effect:** Tron lightcycle arena. Two cycles (blue and orange) race across a neon grid leaving glowing trails. Random turns, wall bouncing. "END OF LINE." text.
- **Dismiss:** Click or wait 10 seconds

### rubiks
- **Trigger:** Type `rubiks`
- **Effect:** 3D CSS Rubik's cube that rotates continuously. Cells scramble to random colors then solve back to original faces. "SOLVING..." → "SOLVED!" text.
- **Dismiss:** Click or wait 12 seconds

### delorean
- **Trigger:** Type `delorean` (also triggers on fast scroll)
- **Effect:** DeLorean speeds across screen with climbing speedometer to 88 MPH, flux capacitor glow, fire trail, white flash at 88, "GREAT SCOTT!" text.
- **Dismiss:** Click or wait 10 seconds

### asteroids
- **Trigger:** Type `hyperspace`
- **Effect:** Classic Asteroids vector graphics on canvas. Rotating ship auto-fires at drifting asteroids that split into smaller pieces on hit.
- **Dismiss:** Click or wait 12 seconds

## Removing an easter egg

To remove an easter egg from a post, fetch the post content, remove the `<script>` block containing the easter egg code, and update the post.

## Previewing

To preview an easter egg locally before applying:

```bash
cd ${CLAUDE_SKILL_DIR}/../shared/eastereggs && npx tsx screenshot.ts <egg-name>
```

This generates a screenshot in `${CLAUDE_SKILL_DIR}/../shared/eastereggs/samples/`.
