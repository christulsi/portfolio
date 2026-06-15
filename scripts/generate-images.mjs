/**
 * Generates the raster social/icon assets that crawlers need but design tools
 * normally export by hand:
 *   - public/og-image.png        (1200x630)  social link previews + JSON-LD
 *   - public/apple-touch-icon.png (180x180)  iOS home-screen icon
 *
 * Rasterized with the Playwright chromium that is already a devDependency, so
 * there's no extra tooling. Re-run after changing the branding:
 *   node scripts/generate-images.mjs   (or: npm run generate:images)
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const PUBLIC = resolve(dirname(fileURLToPath(import.meta.url)), '../public');

const FONTS =
  'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@500;700&display=swap';

// "Instrument" branding — warm ink canvas, signal-amber accent, blueprint grid,
// editorial serif headline + mono labels. Mirrors the live site.
const ogHtml = `<!doctype html><html><head><meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${FONTS}" />
  <style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    font-family: 'Hanken Grotesk', system-ui, sans-serif;
    background:
      radial-gradient(1000px 560px at 84% -14%, rgba(243, 178, 75, 0.22), transparent 62%),
      #0b0d11;
    color: #e9e5dc; display: flex; flex-direction: column; justify-content: space-between;
    padding: 76px 84px; overflow: hidden; position: relative;
  }
  /* blueprint grid */
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 64px 64px;
    -webkit-mask-image: radial-gradient(ellipse 120% 86% at 50% 0%, #000 30%, transparent 90%);
  }
  /* engineered corner ticks */
  .tick { position: absolute; width: 26px; height: 26px; border: 2px solid rgba(243,178,75,0.55); }
  .tl { top: 40px; left: 40px; border-right: 0; border-bottom: 0; }
  .br { bottom: 40px; right: 40px; border-left: 0; border-top: 0; }
  .layer { position: relative; z-index: 1; }
  .badge { display: flex; align-items: center; gap: 22px; }
  .mono {
    width: 78px; height: 78px; border-radius: 14px; display: flex; align-items: center;
    justify-content: center; font-family: 'JetBrains Mono', monospace; font-weight: 700;
    font-size: 34px; letter-spacing: 1px; color: #f3b24b; border: 2px solid rgba(243,178,75,0.6);
  }
  .badge span { font-size: 32px; font-weight: 700; color: #e9e5dc; }
  .kicker {
    font-family: 'JetBrains Mono', monospace; font-size: 23px; font-weight: 500;
    text-transform: uppercase; letter-spacing: 7px; color: #f3b24b;
    display: flex; align-items: center; gap: 16px; margin-bottom: 26px;
  }
  .dot { width: 13px; height: 13px; border-radius: 50%; background: #5eead4; }
  h1 { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; font-size: 104px; line-height: 0.98; letter-spacing: -1px; color: #f6f3ec; }
  h1 em { font-style: italic; color: #f3b24b; }
  .tags { font-family: 'JetBrains Mono', monospace; font-size: 26px; color: #9fa5ac; letter-spacing: 1px; }
  .url { font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #f3b24b; font-weight: 500; margin-top: 14px; }
</style></head><body>
  <div class="grid"></div><div class="tick tl"></div><div class="tick br"></div>
  <div class="layer badge"><div class="mono">CT</div><span>Chris Tulsi</span></div>
  <div class="layer">
    <div class="kicker"><span class="dot"></span>Senior ICT Engineer</div>
    <h1>Building reliable<br /><em>software &amp; infrastructure</em></h1>
  </div>
  <div class="layer">
    <div class="tags">ERP &middot; DATA ENGINEERING &middot; AI/ML &middot; CLOUD &middot; DEVOPS</div>
    <div class="url">christulsi.github.io/portfolio</div>
  </div>
</body></html>`;

const iconHtml = `<!doctype html><html><head><meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${FONTS}" />
  <style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 180px; height: 180px; }
  body {
    font-family: 'JetBrains Mono', monospace;
    display: flex; align-items: center; justify-content: center;
    background:
      radial-gradient(140px 120px at 50% 0%, rgba(243,178,75,0.18), transparent 70%),
      #0b0d11;
    color: #f3b24b; font-weight: 700; font-size: 78px; letter-spacing: 2px;
  }
  .box { width: 132px; height: 132px; border: 4px solid #f3b24b; border-radius: 26px; display: flex; align-items: center; justify-content: center; }
</style></head><body><div class="box">CT</div></body></html>`;

const browser = await chromium.launch();
try {
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await og.setContent(ogHtml, { waitUntil: 'networkidle' });
  await og.evaluate(() => document.fonts.ready);
  await og.waitForTimeout(200);
  await og.screenshot({ path: resolve(PUBLIC, 'og-image.png'), type: 'png' });
  await og.close();
  process.stdout.write('✓ public/og-image.png (1200x630)\n');

  const icon = await browser.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
  await icon.setContent(iconHtml, { waitUntil: 'networkidle' });
  await icon.evaluate(() => document.fonts.ready);
  await icon.waitForTimeout(200);
  await icon.screenshot({ path: resolve(PUBLIC, 'apple-touch-icon.png'), type: 'png' });
  await icon.close();
  process.stdout.write('✓ public/apple-touch-icon.png (180x180)\n');
} finally {
  await browser.close();
}
