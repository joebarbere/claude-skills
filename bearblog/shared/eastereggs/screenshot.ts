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

  // Trigger the easter egg directly via the JS API
  await page.evaluate((name: string) => {
    (window as any).EasterEggs.trigger(name);
  }, eggName);

  // Wait for the animation to play out (unfold + quote fade-in)
  await page.waitForTimeout(3500);

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
