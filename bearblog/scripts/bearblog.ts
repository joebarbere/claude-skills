#!/usr/bin/env npx tsx

import { chromium, type BrowserContext, type Page } from "playwright";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// ── Config ──────────────────────────────────────────────────────────

const CONFIG_DIR = path.join(os.homedir(), ".config", "bearblog");
const STATE_FILE = path.join(CONFIG_DIR, "session.json");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const BASE_URL = "https://bearblog.dev";

interface Config {
  subdomain: string;
}

function ensureConfigDir() {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

function loadConfig(): Config | null {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return null;
  }
}

function saveConfig(config: Config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function dashboardUrl(subdomain: string, subpath = ""): string {
  return `${BASE_URL}/${subdomain}/dashboard/${subpath}`;
}

// ── Browser helpers ─────────────────────────────────────────────────

async function launch(headless: boolean) {
  const browser = await chromium.launch({ headless });
  const contextOpts: Record<string, unknown> = {
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    extraHTTPHeaders: { Referer: BASE_URL + "/" },
  };
  if (fs.existsSync(STATE_FILE)) {
    contextOpts.storageState = STATE_FILE;
  }
  const context = await browser.newContext(contextOpts);
  return { browser, context };
}

async function isLoggedIn(page: Page): boolean {
  return !page.url().includes("/accounts/login");
}

function requireConfig(): Config {
  const config = loadConfig();
  if (!config) {
    process.stderr.write(
      "Not logged in. Run:\n  npx tsx bearblog.ts login\n"
    );
    process.exit(1);
  }
  return config;
}

async function requireSession(page: Page) {
  if (!(await isLoggedIn(page))) {
    process.stderr.write(
      "Session expired. Run:\n  npx tsx bearblog.ts login\n"
    );
    process.exit(1);
  }
}

// ── Post file format ────────────────────────────────────────────────

function parsePostFile(content: string): { header: string; body: string } {
  const idx = content.indexOf("\n---\n");
  if (idx === -1) return { header: "", body: content };
  return { header: content.slice(0, idx), body: content.slice(idx + 5) };
}

// ── Save mechanism ──────────────────────────────────────────────────

async function submitPost(
  page: Page,
  header: string,
  body: string,
  publish: boolean
): Promise<{ ok: boolean; status: number; redirected: string }> {
  // Set field values in the DOM
  await page.evaluate(
    ({ h, b }) => {
      const headerEl = document.getElementById("header_content");
      const bodyEl = document.getElementById(
        "body_content"
      ) as HTMLTextAreaElement | null;
      if (headerEl) headerEl.innerText = h;
      if (bodyEl) bodyEl.value = b;
    },
    { h: header, b: body }
  );

  // POST via fetch inside the page context (uses existing session cookies)
  return page.evaluate(async ({ publish }) => {
    const csrfToken =
      document.cookie.match(/csrftoken=([^;]+)/)?.[1] ??
      (
        document.querySelector(
          "[name=csrfmiddlewaretoken]"
        ) as HTMLInputElement | null
      )?.value ??
      "";

    const headerContent =
      document.getElementById("header_content")?.innerText ?? "";
    const bodyContent =
      (document.getElementById("body_content") as HTMLTextAreaElement)?.value ??
      "";

    const params = new URLSearchParams();
    params.append("header_content", headerContent);
    params.append("body_content", bodyContent);
    params.append("publish", publish ? "true" : "false");

    const resp = await fetch(window.location.pathname, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRFToken": csrfToken,
      },
      body: params.toString(),
      redirect: "follow",
    });

    return { ok: resp.ok, status: resp.status, redirected: resp.url };
  }, { publish });
}

// ── Commands ────────────────────────────────────────────────────────

async function login() {
  ensureConfigDir();
  const { browser, context } = await launch(false);

  try {
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/accounts/login/`);

    process.stderr.write(
      "Browser opened — please log in to your Bear Blog account.\n" +
        "Waiting for you to reach the dashboard...\n"
    );

    await page.waitForURL("**/dashboard/**", { timeout: 300_000 });

    const match = page.url().match(/bearblog\.dev\/([^/]+)\/dashboard/);
    const subdomain = match?.[1] ?? "";

    await context.storageState({ path: STATE_FILE });

    if (subdomain) saveConfig({ subdomain });

    console.log(JSON.stringify({ success: true, subdomain }));
  } finally {
    await browser.close();
  }
}

async function list() {
  const config = requireConfig();
  const { browser, context } = await launch(true);

  try {
    const page = await context.newPage();
    await page.goto(dashboardUrl(config.subdomain, "posts/"));
    await requireSession(page);

    const posts = await page.evaluate(() => {
      const results: Array<{
        uid: string;
        title: string;
        published: boolean;
        date: string;
      }> = [];

      const links = document.querySelectorAll<HTMLAnchorElement>(
        'a[href*="/dashboard/posts/"]'
      );

      for (const link of links) {
        const m = link.href.match(/\/dashboard\/posts\/([^/]+)\/?$/);
        if (!m || m[1] === "new") continue;

        const title = link.textContent?.trim() ?? "";
        if (!title) continue;

        // Detect draft status from surrounding row/element
        const row = link.closest("tr, li, div.post, article, [class*=post]");
        const rowText = row?.textContent?.toLowerCase() ?? "";
        const published = !rowText.includes("draft");

        // Try to find a date element nearby
        const dateEl = row?.querySelector("time, .date, small, span");
        const date =
          dateEl && dateEl !== link ? dateEl.textContent?.trim() ?? "" : "";

        results.push({ uid: m[1], title, published, date });
      }

      return results;
    });

    console.log(JSON.stringify(posts, null, 2));
  } finally {
    await browser.close();
  }
}

async function get(uid: string, outputPath?: string) {
  const config = requireConfig();
  const { browser, context } = await launch(true);

  try {
    const page = await context.newPage();
    await page.goto(dashboardUrl(config.subdomain, `posts/${uid}/`));
    await requireSession(page);

    const post = await page.evaluate(() => {
      const headerEl = document.getElementById("header_content");
      const bodyEl = document.getElementById(
        "body_content"
      ) as HTMLTextAreaElement | null;

      return {
        header: headerEl?.innerText ?? headerEl?.textContent ?? "",
        body: bodyEl?.value ?? bodyEl?.textContent ?? "",
      };
    });

    if (outputPath) {
      const content = `${post.header}\n---\n\n${post.body}`;
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, content);
      process.stderr.write(`Saved to ${outputPath}\n`);
    }

    console.log(JSON.stringify(post, null, 2));
  } finally {
    await browser.close();
  }
}

async function create(filePath: string, publish: boolean) {
  const config = requireConfig();
  const content = fs.readFileSync(filePath, "utf-8");
  const { header, body } = parsePostFile(content);
  const { browser, context } = await launch(true);

  try {
    const page = await context.newPage();
    await page.goto(dashboardUrl(config.subdomain, "posts/new/"));
    await requireSession(page);

    const result = await submitPost(page, header, body, publish);

    // Try to extract new post UID from redirect URL
    const uidMatch = result.redirected.match(/\/dashboard\/posts\/([^/]+)\/?$/);
    const uid = uidMatch?.[1] ?? null;

    console.log(JSON.stringify({ success: result.ok, uid, published: publish }));
  } finally {
    await browser.close();
  }
}

async function update(uid: string, filePath: string) {
  const config = requireConfig();
  const content = fs.readFileSync(filePath, "utf-8");
  const { header, body } = parsePostFile(content);
  const { browser, context } = await launch(true);

  try {
    const page = await context.newPage();
    await page.goto(dashboardUrl(config.subdomain, `posts/${uid}/`));
    await requireSession(page);

    const result = await submitPost(page, header, body, false);

    console.log(JSON.stringify({ success: result.ok, uid }));
  } finally {
    await browser.close();
  }
}

// ── Media commands ──────────────────────────────────────────────────

async function mediaList() {
  const config = requireConfig();
  const { browser, context } = await launch(true);

  try {
    const page = await context.newPage();
    await page.goto(dashboardUrl(config.subdomain, "media/"));
    await requireSession(page);

    const media = await page.evaluate(() => {
      const results: Array<{
        url: string;
        filename: string;
        date: string;
        type: "image" | "document";
      }> = [];

      // Images are in .media-container as <img> elements
      const images = document.querySelectorAll<HTMLImageElement>(
        ".media-container img"
      );
      for (const img of images) {
        const url = img.src || img.getAttribute("data-src") || "";
        const filename = url.split("/").pop() ?? "";
        const container =
          img.closest("div, li, article") ??
          img.parentElement?.parentElement;
        const dateEl = container?.querySelector("small, .date, time, span");
        const date = dateEl?.textContent?.trim() ?? "";
        results.push({ url, filename, date, type: "image" });
      }

      // Documents are listed separately (non-image items with checkboxes)
      const checkboxes = document.querySelectorAll<HTMLInputElement>(
        'input[name="selected_media"]'
      );
      const imageUrls = new Set(results.map((r) => r.url));
      for (const cb of checkboxes) {
        const url = cb.value;
        if (imageUrls.has(url)) continue;
        const container = cb.closest("div, li, tr");
        const dateEl = container?.querySelector("small, .date, time, span");
        const date = dateEl?.textContent?.trim() ?? "";
        const filename = url.split("/").pop() ?? "";
        results.push({ url, filename, date, type: "document" });
      }

      return results;
    });

    console.log(JSON.stringify(media, null, 2));
  } finally {
    await browser.close();
  }
}

async function mediaUpload(filePaths: string[], raw: boolean) {
  const config = requireConfig();
  const { browser, context } = await launch(true);

  try {
    const page = await context.newPage();
    await page.goto(dashboardUrl(config.subdomain, "media/"));
    await requireSession(page);

    const uploadUrl = `${BASE_URL}/${config.subdomain}/dashboard/upload-image/`;
    const results: Array<{ file: string; success: boolean; url?: string; error?: string }> = [];

    for (const filePath of filePaths) {
      const absPath = path.resolve(filePath);
      if (!fs.existsSync(absPath)) {
        results.push({ file: filePath, success: false, error: "File not found" });
        continue;
      }

      const fileSize = fs.statSync(absPath).size;
      if (fileSize > 10 * 1024 * 1024) {
        results.push({ file: filePath, success: false, error: "File exceeds 10MB limit" });
        continue;
      }

      const result = await page.evaluate(
        async ({ uploadUrl, fileName, fileBase64, fileType, raw }) => {
          const csrfToken =
            document.cookie.match(/csrftoken=([^;]+)/)?.[1] ??
            (
              document.querySelector(
                "[name=csrfmiddlewaretoken]"
              ) as HTMLInputElement | null
            )?.value ??
            "";

          // Convert base64 back to binary
          const binaryStr = atob(fileBase64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: fileType });

          const formData = new FormData();
          formData.append("file", blob, fileName);
          if (raw) formData.append("raw", "on");

          const resp = await fetch(uploadUrl, {
            method: "POST",
            headers: { "X-CSRFToken": csrfToken },
            body: formData,
          });

          const text = await resp.text();
          return { ok: resp.ok, status: resp.status, body: text };
        },
        {
          uploadUrl,
          fileName: path.basename(absPath),
          fileBase64: fs.readFileSync(absPath).toString("base64"),
          fileType: getMimeType(absPath),
          raw,
        }
      );

      if (result.ok) {
        // Try to extract URL from response
        let url: string | undefined;
        try {
          const parsed = JSON.parse(result.body);
          url = parsed.url || parsed.file_url || undefined;
        } catch {
          url = result.body.trim() || undefined;
        }
        results.push({ file: filePath, success: true, url });
      } else {
        results.push({
          file: filePath,
          success: false,
          error: `HTTP ${result.status}: ${result.body.slice(0, 200)}`,
        });
      }
    }

    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
}

async function mediaDelete(urls: string[]) {
  const config = requireConfig();
  const { browser, context } = await launch(true);

  try {
    const page = await context.newPage();
    await page.goto(dashboardUrl(config.subdomain, "media/"));
    await requireSession(page);

    const deleteUrl = dashboardUrl(config.subdomain, "media/delete-selected/");

    const result = await page.evaluate(
      async ({ deleteUrl, urls }) => {
        const csrfToken =
          document.cookie.match(/csrftoken=([^;]+)/)?.[1] ??
          (
            document.querySelector(
              "[name=csrfmiddlewaretoken]"
            ) as HTMLInputElement | null
          )?.value ??
          "";

        const params = new URLSearchParams();
        for (const url of urls) {
          params.append("selected_media", url);
        }

        const resp = await fetch(deleteUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-CSRFToken": csrfToken,
          },
          body: params.toString(),
          redirect: "follow",
        });

        return { ok: resp.ok, status: resp.status };
      },
      { deleteUrl, urls }
    );

    console.log(JSON.stringify({ success: result.ok, deleted: urls }));
  } finally {
    await browser.close();
  }
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".bmp": "image/bmp",
    ".ico": "image/x-icon",
    ".tiff": "image/tiff",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mkv": "video/x-matroska",
    ".mp3": "audio/mpeg",
    ".ogg": "audio/ogg",
    ".wav": "audio/wav",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
  };
  return mimeTypes[ext] ?? "application/octet-stream";
}

// ── CLI ─────────────────────────────────────────────────────────────

const USAGE = `Usage: bearblog.ts <command>

Commands:
  login                          Open browser to log in and save session
  list                           List all posts (published and drafts)
  get <uid> [-o <file>]          Get a post's content, optionally save to file
  create <file> [--publish]      Create a new post from a local file
  update <uid> <file>            Update an existing post from a local file
  media-list                     List all media files
  media-upload <file>... [--raw] Upload files (--raw skips optimization)
  media-delete <url>...          Delete media by URL`;

const args = process.argv.slice(2);
const cmd = args[0];

function die(msg: string): never {
  process.stderr.write(msg + "\n");
  process.exit(1);
}

(async () => {
  switch (cmd) {
    case "login":
      await login();
      break;

    case "list":
      await list();
      break;

    case "get": {
      const uid = args[1];
      if (!uid) die("Usage: bearblog.ts get <uid> [-o <file>]");
      const oIdx = args.indexOf("-o");
      const output = oIdx !== -1 ? args[oIdx + 1] : undefined;
      await get(uid, output);
      break;
    }

    case "create": {
      const file = args[1];
      if (!file) die("Usage: bearblog.ts create <file> [--publish]");
      await create(file, args.includes("--publish"));
      break;
    }

    case "update": {
      const uid = args[1];
      const file = args[2];
      if (!uid || !file) die("Usage: bearblog.ts update <uid> <file>");
      await update(uid, file);
      break;
    }

    case "media-list":
      await mediaList();
      break;

    case "media-upload": {
      const raw = args.includes("--raw");
      const files = args.slice(1).filter((a) => a !== "--raw");
      if (files.length === 0) die("Usage: bearblog.ts media-upload <file>... [--raw]");
      await mediaUpload(files, raw);
      break;
    }

    case "media-delete": {
      const urls = args.slice(1);
      if (urls.length === 0) die("Usage: bearblog.ts media-delete <url>...");
      await mediaDelete(urls);
      break;
    }

    default:
      die(USAGE);
  }
})().catch((err) => die(err.message));
