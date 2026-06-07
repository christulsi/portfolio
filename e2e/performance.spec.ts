import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

import { test, expect } from '@playwright/test';

// The deployed site is the built dist/ served by GitHub Pages (gzipped +
// CDN-cached). These helpers measure that production output directly, instead of
// the dev preview server (which doesn't compress and isn't representative of
// what users actually download).
const DIST = 'dist';

function distFiles(ext: string, dir: string = DIST): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...distFiles(ext, p));
    else if (name.endsWith(ext)) out.push(p);
  }
  return out;
}

function gzippedBytes(files: string[]): number {
  return files.reduce((sum, f) => sum + gzipSync(readFileSync(f)).length, 0);
}

test.describe('Performance & Core Web Vitals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('should meet performance budgets', async ({ page }) => {
    // Measure performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');

      return {
        // Time to First Byte
        ttfb: perfData.responseStart - perfData.requestStart,
        // DOM Content Loaded
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        // Load Complete
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        // First Contentful Paint
        fcp: fcp?.startTime || 0,
        // DOM Interactive
        domInteractive: perfData.domInteractive - perfData.fetchStart,
        // Total page load
        totalLoadTime: perfData.loadEventEnd - perfData.fetchStart,
      };
    });

    console.log('Performance Metrics:', performanceMetrics);

    // Performance budgets (in milliseconds)
    expect(performanceMetrics.ttfb).toBeLessThan(800); // TTFB should be < 800ms
    expect(performanceMetrics.fcp).toBeLessThan(1800); // FCP should be < 1.8s
    expect(performanceMetrics.domInteractive).toBeLessThan(3000); // DOM Interactive < 3s
    expect(performanceMetrics.totalLoadTime).toBeLessThan(5000); // Total load < 5s
  });

  test('should have good Core Web Vitals - LCP', async ({ page }) => {
    // Measure Largest Contentful Paint
    const lcp = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as PerformanceEntry;
            resolve(lastEntry.startTime);
          }).observe({ type: 'largest-contentful-paint', buffered: true });

          // Timeout after 10 seconds
          setTimeout(() => resolve(0), 10000);
        })
    );

    console.log('LCP:', lcp);

    // LCP should be under 2.5s for good, under 4s for needs improvement
    expect(lcp).toBeGreaterThan(0);
    expect(lcp).toBeLessThan(4000); // LCP < 4s (needs improvement threshold)
  });

  test('should have minimal layout shifts (CLS)', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Measure Cumulative Layout Shift
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let clsValue = 0;

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });

          // Measure for 3 seconds
          setTimeout(() => resolve(clsValue), 3000);
        })
    );

    console.log('CLS:', cls);

    // CLS should be under 0.1 for good, under 0.25 for needs improvement
    expect(cls).toBeLessThan(0.25);
  });

  test('ships a reasonable amount of gzipped JS/CSS (production output)', () => {
    // GitHub Pages serves these assets gzipped, so measure the gzipped build
    // output rather than the preview server's uncompressed transfer size.
    // three.js dominates the JS (~126KB gzipped) and is lazy-loaded, so it
    // never blocks the initial render.
    const jsGz = gzippedBytes(distFiles('.js'));
    const cssGz = gzippedBytes(distFiles('.css'));

    console.log('Gzipped JS:', jsGz, 'CSS:', cssGz);

    expect(jsGz).toBeLessThan(200_000); // gzipped JS < 200KB
    expect(cssGz).toBeLessThan(40_000); // gzipped CSS < 40KB
  });

  test('emits content-hashed assets for immutable CDN caching', () => {
    // Response headers are owned by the static host (GitHub Pages), not the app.
    // What the build controls — and what enables long-term immutable caching —
    // is fingerprinting every asset with a content hash.
    const assets = [...distFiles('.js'), ...distFiles('.css')];
    expect(assets.length).toBeGreaterThan(0);

    const hashed = assets.filter((f) => /\.[A-Za-z0-9_-]{8,}\.(js|css)$/.test(f));
    console.log(`Content-hashed assets: ${hashed.length}/${assets.length}`);
    expect(hashed.length).toBe(assets.length);
  });

  test('built HTML has no render-blocking scripts and minimal blocking CSS', () => {
    const html = readFileSync(join(DIST, 'index.html'), 'utf8');

    // Astro emits ES module scripts (deferred by spec). A render-blocking script
    // would be a `<script src>` without type=module / defer / async.
    // Note: the built HTML is minified, so attributes may be unquoted
    // (e.g. `type=module`) — the patterns allow optional quotes.
    const scriptTags = html.match(/<script\b[^>]*>/g) ?? [];
    const blockingScripts = scriptTags.filter(
      (t) =>
        /\bsrc=/.test(t) &&
        !/type=["']?module\b/.test(t) &&
        !/\bdefer\b/.test(t) &&
        !/\basync\b/.test(t)
    );

    // Synchronous stylesheets block rendering (the font is loaded via
    // rel="preload", so it is not counted here).
    const blockingStyles = html.match(/<link\b[^>]+rel=["']?stylesheet\b[^>]*>/g) ?? [];

    console.log(
      'Render-blocking scripts:',
      blockingScripts.length,
      'stylesheet links:',
      blockingStyles.length
    );

    expect(blockingScripts.length).toBe(0);
    expect(blockingStyles.length).toBeLessThan(5);
  });

  test('should be accessible with good Lighthouse scores', async ({ page }) => {
    // Basic accessibility checks
    const accessibilityIssues = await page.evaluate(() => {
      const issues = [];

      // Check for images without alt text
      const images = Array.from(document.querySelectorAll('img'));
      const imagesWithoutAlt = images.filter((img) => !img.alt && !img.getAttribute('aria-label'));
      if (imagesWithoutAlt.length > 0) {
        issues.push(`${imagesWithoutAlt.length} images without alt text`);
      }

      // Check for buttons without labels
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonsWithoutLabel = buttons.filter(
        (btn) =>
          !btn.textContent?.trim() &&
          !btn.getAttribute('aria-label') &&
          !btn.getAttribute('aria-labelledby')
      );
      if (buttonsWithoutLabel.length > 0) {
        issues.push(`${buttonsWithoutLabel.length} buttons without labels`);
      }

      // Check for links without text
      const links = Array.from(document.querySelectorAll('a'));
      const linksWithoutText = links.filter(
        (link) => !link.textContent?.trim() && !link.getAttribute('aria-label')
      );
      if (linksWithoutText.length > 0) {
        issues.push(`${linksWithoutText.length} links without text`);
      }

      return issues;
    });

    console.log('Accessibility Issues:', accessibilityIssues);

    // Should have no critical accessibility issues
    expect(accessibilityIssues.length).toBe(0);
  });
});
