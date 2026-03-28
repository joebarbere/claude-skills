---
name: new-post
description: Draft a new Bear Blog post. Use when the user wants to write, brainstorm, or create a blog post.
argument-hint: [topic or title]
allowed-tools: Read, Write, Glob, Grep, Bash, WebSearch, WebFetch
---

# Create a New Bear Blog Post

The user wants to create a new blog post for their Bear Blog at https://bearblog.dev.

## Setup

The bearblog CLI script is at `${CLAUDE_SKILL_DIR}/../scripts/bearblog.ts`. It requires a one-time setup:

```bash
cd ${CLAUDE_SKILL_DIR}/../scripts && npm install && npx playwright install chromium
```

If the user has not logged in yet, run:

```bash
cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts login
```

## Your workflow

1. Ask the user where they keep their blog posts (suggest `posts/` as default). Use this directory for all reads and writes.
2. If the user gave a topic or title via `$ARGUMENTS`, use that. Otherwise, ask what they want to write about.
3. If useful, search the web or fetch reference material to inform the post.
4. Read any existing posts in the chosen directory to match the user's writing style, voice, and typical post length.
5. Draft the post in **Bear Blog format** (see below).
6. Save the file to `<directory>/<slug>.md` (or `.html` for HTML posts) where `<slug>` is derived from the title (lowercase, hyphens, no special chars). Create the directory if it doesn't exist.
7. Ask the user if they want to publish directly or keep as a local draft.
   - To publish: `cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts create <file> --publish`
   - To save as draft on Bear Blog: `cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts create <file>`

## Bear Blog Post Format

Posts have a **header section** (plain text metadata, one field per line) followed by a `---` separator, then the **body** in Markdown or HTML.

```
title: My Post Title
published_date: YYYY-MM-DD HH:MM
tags: tag1, tag2, tag3
meta_description: A short summary for search engines and social previews (max ~160 chars)
---

Body content in Markdown or HTML goes here.
```

**File extensions:** Use `.md` for Markdown posts and `.html` for HTML posts. Both use the same header format above the `---` separator.

### Available header fields

| Field | Description |
|-------|-------------|
| `title` | **Required.** The post title. |
| `published_date` | Format: `YYYY-MM-DD HH:MM`. Defaults to now. Future dates schedule publication. |
| `tags` | Comma-separated list of tags/categories. |
| `meta_description` | SEO/social snippet, max ~160 chars. Auto-generated from body if omitted. |
| `meta_image` | URL to an Open Graph image for social sharing. |
| `link` | Custom URL slug. Defaults to slugified title. Supports paths like `blog/my-post`. |
| `canonical_url` | Points to original content if cross-posting. |
| `make_discoverable` | `true`/`false`. Whether to show in Bear's discovery feed (default: true). |
| `is_page` | `true`/`false`. Pages are static and hidden from the blog feed. |
| `class_name` | Custom CSS class for post-specific styling. |

### Body content formats

Bear Blog accepts both **Markdown** and **HTML** in the post body. Ask the user which format they prefer.

**Markdown** — Standard Markdown plus: strikethrough, footnotes, task lists, tables, code blocks with syntax highlighting, LaTeX math (`$inline$` and `$$block$$`), admonitions, and `[TOC]` for table of contents.

**HTML** — Raw HTML is rendered directly. Useful for custom layouts, embedded media, or precise styling. Whitelisted iframes (YouTube, Vimeo, Spotify, etc.) are supported. You can mix Markdown and HTML in the same post.

### Template variables available in post body

- `{{ blog_title }}`, `{{ blog_description }}`, `{{ blog_link }}`
- `{{ post_title }}`, `{{ post_published_date }}`, `{{ post_link }}`
- `{{ tags }}` — renders linked tag cloud
- `{{ previous_post }}`, `{{ next_post }}` — navigation links
- `{{ posts }}` with filters: `|tag:X`, `|limit:N`, `|order:asc/desc`
- `{{ email_signup }}` — embedded subscription form

## Writing guidelines

- Write in the user's existing voice and style (learn from existing posts in their chosen directory).
- Keep posts focused. Prefer concise, clear writing over padding.
- Use headers, lists, and code blocks to break up long sections.
- Always include `title`, `published_date`, `tags`, and `meta_description` in the header.
- Set `published_date` to today's date/time unless the user specifies otherwise.
