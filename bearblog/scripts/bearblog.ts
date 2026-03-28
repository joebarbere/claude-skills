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
  const opts = fs.existsSync(STATE_FILE)
    ? { storageState: STATE_FILE }
    : undefined;
  const context = await browser.newContext(opts);
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

// ── CLI ─────────────────────────────────────────────────────────────

const USAGE = `Usage: bearblog.ts <command>

Commands:
  login                    Open browser to log in and save session
  list                     List all posts (published and drafts)
  get <uid> [-o <file>]    Get a post's content, optionally save to file
  create <file> [--publish] Create a new post from a local file
  update <uid> <file>      Update an existing post from a local file`;

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

    default:
      die(USAGE);
  }
})().catch((err) => die(err.message));
