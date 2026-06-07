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

const ogHtml = `<!doctype html><html><head><meta charset="utf-8" /><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background:
      radial-gradient(900px 520px at 82% -12%, rgba(124, 58, 237, 0.38), transparent 60%),
      radial-gradient(760px 520px at -5% 112%, rgba(37, 99, 235, 0.32), transparent 60%),
      linear-gradient(135deg, #0a0e1a 0%, #0f172a 55%, #160f2e 100%);
    color: #fff; display: flex; flex-direction: column; justify-content: space-between;
    padding: 76px 84px; overflow: hidden;
  }
  .badge { display: flex; align-items: center; gap: 22px; }
  .mono {
    width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center;
    justify-content: center; font-weight: 800; font-size: 38px; letter-spacing: 1px;
    background: linear-gradient(135deg, #3b82f6, #7c3aed); box-shadow: 0 12px 44px rgba(59, 130, 246, 0.45);
  }
  .badge span { font-size: 34px; font-weight: 700; color: #cbd5e1; }
  h1 { font-size: 100px; font-weight: 800; line-height: 1.04; letter-spacing: -2px; }
  .grad { background: linear-gradient(90deg, #60a5fa, #a78bfa); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .role { font-size: 44px; font-weight: 700; color: #e2e8f0; margin-top: 22px; }
  .tags { font-size: 29px; color: #94a3b8; letter-spacing: 0.5px; }
  .url { font-size: 27px; color: #64748b; font-weight: 600; margin-top: 14px; }
</style></head><body>
  <div class="badge"><div class="mono">CT</div><span>Chris Tulsi</span></div>
  <div>
    <h1>Building reliable<br /><span class="grad">software &amp; infrastructure</span></h1>
    <div class="role">Senior ICT Engineer</div>
  </div>
  <div>
    <div class="tags">ERP &middot; Data Engineering &middot; AI/ML &middot; Cloud &middot; DevOps</div>
    <div class="url">christulsi.github.io/portfolio</div>
  </div>
</body></html>`;

const iconHtml = `<!doctype html><html><head><meta charset="utf-8" /><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 180px; height: 180px; }
  body {
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #3b82f6, #7c3aed);
    color: #fff; font-weight: 800; font-size: 82px; letter-spacing: 2px;
  }
</style></head><body>CT</body></html>`;

const browser = await chromium.launch();
try {
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await og.setContent(ogHtml, { waitUntil: 'load' });
  await og.waitForTimeout(150);
  await og.screenshot({ path: resolve(PUBLIC, 'og-image.png'), type: 'png' });
  await og.close();
  process.stdout.write('✓ public/og-image.png (1200x630)\n');

  const icon = await browser.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 });
  await icon.setContent(iconHtml, { waitUntil: 'load' });
  await icon.screenshot({ path: resolve(PUBLIC, 'apple-touch-icon.png'), type: 'png' });
  await icon.close();
  process.stdout.write('✓ public/apple-touch-icon.png (180x180)\n');
} finally {
  await browser.close();
}
