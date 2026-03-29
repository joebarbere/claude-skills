#!/usr/bin/env npx tsx

/**
 * Generate short video clips of easter eggs displayed on a sample blog page.
 *
 * Usage:
 *   cd bearblog/shared/eastereggs
 *   npx tsx clip.ts [egg-name]       # single egg (default: bladerunner)
 *   npx tsx clip.ts --all            # all eggs
 *
 * Output: samples/<egg-name>.webm
 */

import { chromium } from "playwright-core";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const SAMPLES_DIR = path.join(__dirname, "samples");
const SAMPLE_HTML = path.join(__dirname, "sample.html");

const MAX_CLIP_MS = 15_000;
// Playwright adds ~2.2s overhead (context init, page load, pre-trigger pause)
const OVERHEAD_MS = 2_200;

/** Find a usable Chromium binary from the Playwright cache. */
function findChromium(): string | undefined {
  const cacheDir = path.join(os.homedir(), ".cache", "ms-playwright");
  if (!fs.existsSync(cacheDir)) return undefined;
  const dirs = fs
    .readdirSync(cacheDir)
    .filter((d) => d.startsWith("chromium-") && !d.includes("headless"))
    .sort()
    .reverse();
  for (const dir of dirs) {
    const bin = path.join(cacheDir, dir, "chrome-linux", "chrome");
    if (fs.existsSync(bin)) return bin;
  }
  return undefined;
}

/**
 * Per-egg clip durations (ms) — how long to record after triggering.
 * Tuned to capture the full animation cycle, capped at MAX_CLIP_MS.
 */
const CLIP_DURATIONS: Record<string, number> = {
  achievements: 5000,
  asteroids: 12000,
  asyouwish: 10000,
  bladerunner: 10000,
  bsod: 6000,
  c64: 6000,
  dayoff: 12000,
  delorean: 10000,
  dir: 6000,
  flynn: 10000,
  godzilla: 12000,
  hackers: 10000,
  hello: 8000,
  invaders: 12000,
  jurassicpark: 13000,
  konami: 8000,
  lv426: 15000,
  maxhead: 8000,
  mortalkombat: 10000,
  nbajam: 10000,
  oneup: 6000,
  oregon: 10000,
  pkemeter: 10000,
  quake: 6000,
  realgenius: 12000,
  rubiks: 12000,
  smaug: 8000,
  tetris: 12000,
  triforce: 10000,
  wakawaka: 10000,
  warcraft: 8000,
  wargames: 15000,
};

const ALL_EGGS = Object.keys(CLIP_DURATIONS);

async function clip(eggName: string, executablePath?: string) {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: SAMPLES_DIR,
      size: { width: 1280, height: 800 },
    },
  });

  const page = await context.newPage();

  // Load the sample blog page
  await page.goto(`file://${SAMPLE_HTML}`);
  await page.waitForLoadState("networkidle");

  // Brief pause so viewers see the page before the egg fires
  await page.waitForTimeout(800);

  // Trigger the easter egg
  await page.evaluate((name: string) => {
    (window as any).EasterEggs.trigger(name);
  }, eggName);

  // Post-trigger actions for interactive eggs
  if (eggName === "smaug") {
    await page.waitForTimeout(1000);
    const scale = await page.$(".ee-sm-scale");
    if (scale) await scale.click();
  } else if (eggName === "achievements") {
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      if ((window as any)._eeAchievementsForce) {
        (window as any)._eeAchievementsForce(0);
      }
    });
  }

  // Record the animation, capped so total clip stays under MAX_CLIP_MS
  const duration = Math.min(CLIP_DURATIONS[eggName] ?? 8000, MAX_CLIP_MS - OVERHEAD_MS);
  await page.waitForTimeout(duration);

  // Closing the context finalizes the video file
  const video = page.video();
  await context.close();

  // Rename from Playwright's random filename to <eggName>.webm
  if (video) {
    const tmpPath = await video.path();
    if (tmpPath && fs.existsSync(tmpPath)) {
      const outputPath = path.join(SAMPLES_DIR, `${eggName}.webm`);
      fs.renameSync(tmpPath, outputPath);
      console.log(`Clip saved: ${outputPath}`);
    } else {
      console.error(`No video file found for ${eggName}`);
    }
  }

  await browser.close();
}

// ── CLI ─────────────────────────────────────────────────────────────

const arg = process.argv[2] || "bladerunner";
const executablePath = findChromium();

if (arg === "--all") {
  (async () => {
    for (const egg of ALL_EGGS) {
      await clip(egg, executablePath);
    }
  })().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
} else {
  clip(arg, executablePath).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
