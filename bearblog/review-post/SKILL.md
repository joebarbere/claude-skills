---
name: review-post
description: Review and improve a Bear Blog post draft. Use when the user wants feedback on a draft, wants to improve writing quality, or asks to edit/polish a post.
argument-hint: [filename or uid]
allowed-tools: Read, Edit, Glob, Grep, Bash, WebSearch
---

# Review a Bear Blog Post Draft

Review a post draft and provide actionable feedback, then apply edits if the user agrees.

## Setup

The bearblog CLI script is at `${CLAUDE_SKILL_DIR}/../scripts/bearblog.ts`. It requires a one-time setup:

```bash
cd ${CLAUDE_SKILL_DIR}/../scripts && npm install && npx playwright install chromium
```

## Your workflow

1. Ask the user where they keep their blog posts (suggest `posts/` as default). Use this directory for all reads.

2. Find the post to review:
   - If `$ARGUMENTS` names a local file, read it from the chosen directory (add `.md` or `.html` if missing).
   - If `$ARGUMENTS` looks like a Bear Blog post UID (not a filename), pull it from the dashboard:

     ```bash
     cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts get <uid> -o <directory>/<uid>.md
     ```

   - If no argument given, check for local files in the directory first. If empty, list posts from the dashboard:

     ```bash
     cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts list
     ```

     Ask the user which post to review, then pull it locally.

3. Read other existing posts in the directory to understand the user's voice and style.

4. Review the post for:
   - **Header completeness**: Are `title`, `published_date`, `tags`, `meta_description` all present and well-formed?
   - **meta_description quality**: Is it compelling and under ~160 chars? Does it work as a social media preview?
   - **Structure**: Does the post flow well? Are headers, lists, and breaks used effectively?
   - **Clarity**: Are sentences clear and concise? Is there filler or padding that can be cut?
   - **Voice consistency**: Does it match the user's style from other posts?
   - **Technical accuracy**: If the post covers technical topics, are claims accurate? Search the web to verify if needed.
   - **Grammar and typos**: Catch any errors.
   - **SEO basics**: Is the title descriptive? Are tags relevant?
   - **HTML validity** (for HTML posts): Is the HTML well-formed? Are tags properly closed? Are there accessibility issues (missing alt text, etc.)?

5. Present your review as a concise list of suggestions, grouped by priority:
   - **Must fix** — errors, missing metadata, factual issues
   - **Should fix** — structural improvements, clarity issues
   - **Consider** — style suggestions, optional enhancements

6. Ask the user which changes to apply. Make the edits directly to the local file.

7. If the post was pulled from the dashboard, ask if the user wants to push changes back:

   ```bash
   cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts update <uid> <file>
   ```

## Do NOT

- Rewrite the post in your own voice. Preserve the user's style.
- Add fluff, filler, or unnecessary hedging language.
- Over-optimize for SEO at the expense of natural writing.
- Change the meaning or opinion expressed in the post.
