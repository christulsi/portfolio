/**
 * Generates the raster social/icon assets that crawlers need but design tools
 * normally export by hand:
 *   - public/og-image.png         (1200x630)  social link previews + JSON-LD
 *   - public/apple-touch-icon.png (180x180)   iOS home-screen icon
 *   - public/favicon-192x192.png  (192x192)   PNG favicon / manifest icon
 *
 * Rasterized with the Playwright chromium that is already a devDependency, so
 * there's no extra tooling. Re-run after changing the branding:
 *   node scripts/generate-images.mjs   (or: npm run generate:images)
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const PUBLIC = resolve(dirname(fileURLToPath(import.meta.url)), '../public');

// Brand: forest green and gold (Guyana's Golden Arrowhead), Archivo expanded.
const FONT =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&display=block" />';

const mark = (size) => `<svg viewBox="0 0 512 512" width="${size}" height="${size}">
  <rect width="512" height="512" rx="128" fill="#0c4a34"/>
  <path d="M136 120 400 256 136 392Z" fill="#f4c430" stroke="#ecf5ef" stroke-width="24" stroke-linejoin="round"/>
</svg>`;

const ogHtml = `<!doctype html><html><head><meta charset="utf-8" />${FONT}<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    font-family: 'Archivo', system-ui, sans-serif; background: #f3f6f2; color: #0e2219;
    display: grid; grid-template-columns: 1.6fr 1fr; grid-template-rows: 1fr 1fr; gap: 20px;
    padding: 40px;
  }
  .tile { border-radius: 36px; padding: 44px; display: flex; flex-direction: column; justify-content: space-between; }
  .intro { grid-row: span 2; background: #fff; border: 2px solid #d3ddd6; }
  .badge { display: flex; align-items: center; gap: 16px; font-size: 26px; font-weight: 600; }
  h1 { font-stretch: 125%; font-weight: 800; font-size: 132px; line-height: 0.86; letter-spacing: -5px; }
  .lede { font-size: 28px; color: #4b6157; line-height: 1.35; }
  .gold { background: #f4c430; }
  .forest { background: #0c4a34; color: #ecf5ef; }
  .small { font-size: 22px; opacity: 0.85; }
  .big { font-size: 34px; font-weight: 700; line-height: 1.15; }
  .url { font-stretch: 125%; font-weight: 800; font-size: 30px; }
</style></head><body>
  <div class="tile intro">
    <div class="badge">${mark(44)} Senior ICT Engineer</div>
    <h1>Chris<br />Tulsi</h1>
    <div class="lede">Building the software behind public services in Guyana.</div>
  </div>
  <div class="tile gold">
    <div class="small">ERP, platforms, pipelines</div>
    <div class="big">National Data Management Authority</div>
  </div>
  <div class="tile forest">
    <div class="small">Portfolio</div>
    <div class="url">christulsi.github.io/portfolio</div>
  </div>
</body></html>`;

const iconHtml = (size) => `<!doctype html><html><head><meta charset="utf-8" /><style>
  * { margin: 0; padding: 0; }
  html, body { width: ${size}px; height: ${size}px; background: #0c4a34; }
  svg { display: block; }
</style></head><body>${mark(size).replace('rx="128"', 'rx="0"')}</body></html>`;

const browser = await chromium.launch();
try {
  const og = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await og.setContent(ogHtml, { waitUntil: 'networkidle' });
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: resolve(PUBLIC, 'og-image.png'), type: 'png' });
  await og.close();
  process.stdout.write('✓ public/og-image.png (1200x630)\n');

  // iOS rounds the corners itself, so the touch icon is full-bleed.
  for (const [file, size] of [
    ['apple-touch-icon.png', 180],
    ['favicon-192x192.png', 192],
  ]) {
    const icon = await browser.newPage({ viewport: { width: size, height: size } });
    await icon.setContent(iconHtml(size), { waitUntil: 'load' });
    await icon.screenshot({ path: resolve(PUBLIC, file), type: 'png' });
    await icon.close();
    process.stdout.write(`✓ public/${file} (${size}x${size})\n`);
  }
} finally {
  await browser.close();
}
