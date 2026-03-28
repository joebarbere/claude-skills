---
name: read-blog
description: Fetch and display posts from a Bear Blog, including unpublished drafts. Use when the user wants to see their posts, check recent content, or review what's on their blog.
argument-hint: [subdomain or custom domain]
allowed-tools: WebFetch, Read, Glob, Bash
---

# Read Bear Blog Posts

Fetch and display the user's Bear Blog content — both published posts and unpublished drafts.

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

1. **List all posts (published + drafts)** using the CLI:

   ```bash
   cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts list
   ```

   This returns JSON with each post's `uid`, `title`, `published` status, and `date`.

2. Present the posts as a clean list, clearly marking drafts vs published.

3. If the user asks about a specific post, fetch its full content:

   ```bash
   cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts get <uid>
   ```

   This returns JSON with `header` and `body` fields.

4. If the user wants to edit a post locally:
   - Ask where they keep their blog posts (suggest `posts/` as default).
   - Save the post to a local file:

     ```bash
     cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts get <uid> -o <directory>/<slug>.md
     ```

   - The file is saved in Bear Blog format (header + `---` + body), ready for editing. The body may contain Markdown or HTML — both are valid Bear Blog content.

5. After editing, push changes back with:

   ```bash
   cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts update <uid> <file>
   ```

## Fallback: RSS feed (no login required)

If the user only needs published posts and hasn't logged in, use the public RSS feed:

- Atom: `https://<subdomain>.bearblog.dev/feed/`
- RSS: `https://<subdomain>.bearblog.dev/feed/?type=rss`
- Filter by tag: `https://<subdomain>.bearblog.dev/feed/?q=<tag>`

If `$ARGUMENTS` is provided, use it as the subdomain or domain.

## Output format

Present posts as a clean list:

```
## All Posts

1. **Post Title** (2024-03-15) ✓ published
   Short summary or description...

2. **Draft Post** (2024-03-10) ✗ draft
   Summary text...
```
