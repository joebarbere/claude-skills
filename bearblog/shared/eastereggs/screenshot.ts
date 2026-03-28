#!/usr/bin/env npx tsx

/**
 * Generate screenshots of easter eggs displayed on a sample blog page.
 *
 * Usage:
 *   cd bearblog/shared/eastereggs
 *   npx tsx screenshot.ts [egg-name]
 *
 * Default: bladerunner
 * Output:  samples/<egg-name>.png
 */

import { chromium } from "playwright-core";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const SAMPLES_DIR = path.join(__dirname, "samples");
const SAMPLE_HTML = path.join(__dirname, "sample.html");

/** Find a usable Chromium binary from the Playwright cache. */
function findChromium(): string | undefined {
  const cacheDir = path.join(os.homedir(), ".cache", "ms-playwright");
  if (!fs.existsSync(cacheDir)) return undefined;
  const dirs = fs.readdirSync(cacheDir)
    .filter((d) => d.startsWith("chromium-") && !d.includes("headless"))
    .sort()
    .reverse();
  for (const dir of dirs) {
    const bin = path.join(cacheDir, dir, "chrome-linux", "chrome");
    if (fs.existsSync(bin)) return bin;
  }
  return undefined;
}

async function screenshot(eggName: string) {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });

  const executablePath = findChromium();
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // Load the sample blog page
  await page.goto(`file://${SAMPLE_HTML}`);
  await page.waitForLoadState("networkidle");

  // Per-egg wait times and post-trigger actions
  const WAIT_TIMES: Record<string, number> = {
    bladerunner: 3500,
    konami: 3000,
    jurassicpark: 4000,
    mortalkombat: 5000,
    nbajam: 3000,
    hackers: 3500,
    realgenius: 5000,
    godzilla: 5000,
    wargames: 8000,
    quake: 2000,
    smaug: 2000,
    warcraft: 2000,
    achievements: 1500,
    bsod: 2000,
    oregon: 3000,
    asyouwish: 3500,
    dayoff: 4000,
    hello: 4000,
    triforce: 3000,
    oneup: 3000,
    c64: 2500,
    dir: 2500,
    invaders: 3000,
    wakawaka: 3000,
    lv426: 4000,
    tetris: 3000,
    maxhead: 2500,
    pkemeter: 3500,
    flynn: 3000,
    rubiks: 4000,
    delorean: 4500,
    asteroids: 3000,
  };

  // Trigger the easter egg directly via the JS API
  await page.evaluate((name: string) => {
    (window as any).EasterEggs.trigger(name);
  }, eggName);

  // Post-trigger actions for interactive eggs
  if (eggName === "smaug") {
    // Wait for scale to appear, then click it
    await page.waitForTimeout(1000);
    const scale = await page.$(".ee-sm-scale");
    if (scale) await scale.click();
  } else if (eggName === "achievements") {
    // Force first achievement toast for screenshot
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      if ((window as any)._eeAchievementsForce) {
        (window as any)._eeAchievementsForce(0);
      }
    });
  }

  // Wait for the animation to play out
  await page.waitForTimeout(WAIT_TIMES[eggName] ?? 3500);

  const outputPath = path.join(SAMPLES_DIR, `${eggName}.png`);
  await page.screenshot({ path: outputPath, fullPage: false });

  console.log(`Screenshot saved: ${outputPath}`);

  await browser.close();
}

// ── CLI ─────────────────────────────────────────────────────────────

const eggName = process.argv[2] || "bladerunner";
screenshot(eggName).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
