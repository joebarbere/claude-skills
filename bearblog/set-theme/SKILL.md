---
name: set-theme
description: Apply a theme to a Bear Blog site. Use when the user wants to change their blog's look, apply a theme, or customize their blog's CSS.
argument-hint: <theme-name>
allowed-tools: Read, Glob, Bash
disable-model-invocation: true
---

# Set Bear Blog Theme

Apply a named theme to the user's entire Bear Blog site by generating CSS for the Bear Blog Styles page.

## Available themes

Themes live in `${CLAUDE_SKILL_DIR}/../themes/`. Each theme directory contains:
- `style.css` — the full CSS for the theme
- `README.md` — description of the theme

List available themes by reading the directories under `${CLAUDE_SKILL_DIR}/../themes/`.

## Your workflow

1. If `$ARGUMENTS` names a theme, use that. Otherwise, list available themes and ask the user to pick one.
2. Read the theme's `style.css` from `${CLAUDE_SKILL_DIR}/../themes/<theme-name>/style.css`.
3. Read the theme's `README.md` to describe what the user will get.
4. Present the CSS to the user and explain what it changes.
5. Ask the user if they want to apply it now or just copy it.
   - **Apply directly** (requires login): Use the Playwright script to set the blog's CSS via the Styles dashboard page:

     ```bash
     cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts set-styles "${CLAUDE_SKILL_DIR}/../themes/<theme-name>/style.css"
     ```

     If the `set-styles` command is not yet available in the script, instruct the user to:
     1. Go to their Bear Blog dashboard → Styles
     2. Paste the CSS into the custom CSS field
     3. Save

   - **Copy only**: Output the CSS so the user can paste it themselves.

## Per-post theming

If the user wants a theme on a single post instead of the whole site, they can use the `class_name` header field in their post:

```
title: My Themed Post
class_name: geohot
---

Post content here.
```

Then wrap the theme CSS in a `.geohot` selector so it only applies to that post. Offer to generate this scoped version if the user asks.

## Custom modifications

If the user wants to tweak a theme, read the base CSS, apply their requested changes, and output the modified version. Do not modify the theme file in the repo — output the customized CSS for the user to paste or apply.
