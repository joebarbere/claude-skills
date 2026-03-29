---
name: manage-media
description: Manage Bear Blog media — upload, list, resize, optimize, and delete images and files. Use when the user wants to manage their blog's media library.
argument-hint: [upload|list|delete|resize] [file or URL]
allowed-tools: Read, Write, Glob, Grep, Bash
---

# Manage Bear Blog Media

Upload, list, resize, optimize, and delete media in the user's Bear Blog media library at https://bearblog.dev/joebarbere/dashboard/media/.

## Setup

The bearblog CLI script is at `${CLAUDE_SKILL_DIR}/../scripts/bearblog.ts`. It requires a one-time setup:

```bash
cd ${CLAUDE_SKILL_DIR}/../scripts && npm install && npx playwright install chromium
```

If the user has not logged in yet, run:

```bash
cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts login
```

## Commands

### List all media

```bash
cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts media-list
```

Returns JSON array of media items with `url`, `filename`, `date`, and `type` (image or document).

### Upload files

```bash
cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts media-upload <file>... [--raw]
```

- Uploads one or more files to the media library.
- By default, images are optimized (resized to max 1200px width, converted to WebP, EXIF stripped).
- Use `--raw` to upload without optimization (preserves original format and size).
- Max file size: 10MB per file.
- Supported types: images (png, jpg, jpeg, gif, webp, avif, svg, bmp, ico, tiff), videos (mp4, webm, mkv), audio (mp3, ogg, wav), documents (pdf, doc, docx, txt, etc.), fonts (woff, woff2, ttf, otf).

### Delete media

```bash
cd ${CLAUDE_SKILL_DIR}/../scripts && npx tsx bearblog.ts media-delete <url>...
```

Deletes one or more media items by their full URL. Get URLs from `media-list` first.

## Your workflow

1. Determine what the user wants to do from `$ARGUMENTS` or by asking:
   - **list** — show what's in their media library
   - **upload** — add new files
   - **delete** — remove files
   - **resize/optimize** — resize an image before uploading

2. For **listing**, run `media-list` and present results as a clean table or list, grouped by type.

3. For **uploads**:
   - If the user provides local file paths, upload them directly.
   - If the user provides a URL, download it first with `curl -L -o /tmp/<filename> <url>`, then upload the local file.
   - Ask if they want optimized (default) or raw upload.

4. For **resizing/optimizing** before upload:
   - Use ImageMagick (`convert` or `magick`) to resize. It is already available on the system.
   - Common operations:
     ```bash
     # Resize to specific width (maintain aspect ratio)
     convert input.jpg -resize 800x output.jpg

     # Resize to specific dimensions (fit within)
     convert input.jpg -resize 800x600 output.jpg

     # Resize to specific dimensions (exact, may distort)
     convert input.jpg -resize 800x600! output.jpg

     # Convert format
     convert input.png output.webp

     # Reduce quality/file size
     convert input.jpg -quality 80 output.jpg

     # Strip metadata
     convert input.jpg -strip output.jpg

     # Combine: resize + optimize + strip
     convert input.jpg -resize 800x -quality 85 -strip output.webp
     ```
   - Save processed files to `/tmp/` and upload from there.
   - After upload, clean up temp files.

5. For **deletion**:
   - First run `media-list` to show available media.
   - Confirm with the user which items to delete (show filenames/thumbnails).
   - Run `media-delete` with the selected URLs.
   - **Always confirm before deleting** — this action is irreversible.

6. After any upload, provide the user with the media URL(s) and markdown/HTML snippets for embedding in posts:
   - Markdown: `![alt text](url)`
   - HTML: `<img src="url" alt="alt text">`

## Tips

- Bear Blog auto-optimizes images on upload (1200px max width, WebP conversion) unless `--raw` is used.
- Use `--raw` when uploading SVGs, favicons, or images where exact format matters.
- For batch operations, pass multiple files to a single `media-upload` command.
- The media library has a 20,000 file fair-use limit.
