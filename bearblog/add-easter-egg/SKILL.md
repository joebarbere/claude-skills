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

5. **Explain the trigger.** Tell the user how to activate the easter egg:
   - **bladerunner**: Type `aaaaa` (5 consecutive "a" characters) anywhere on the page

## Easter egg details

### bladerunner
- **Trigger:** Type `aaaaa`
- **Effect:** Dark cinematic overlay with animated origami unicorn that unfolds from nothing, gentle floating animation, rain effect, and the famous Blade Runner quote
- **Dismiss:** Click anywhere on the overlay, or wait 10 seconds

## Removing an easter egg

To remove an easter egg from a post, fetch the post content, remove the `<script>` block containing the easter egg code, and update the post.

## Previewing

To preview an easter egg locally before applying:

```bash
cd ${CLAUDE_SKILL_DIR}/../shared/eastereggs && npx tsx screenshot.ts <egg-name>
```

This generates a screenshot in `${CLAUDE_SKILL_DIR}/../shared/eastereggs/samples/`.
