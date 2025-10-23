import { test, expect } from '@playwright/test';

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

  test('should load critical resources efficiently', async ({ page }) => {
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      const cssResources = resources.filter((r) => r.name.includes('.css'));
      const jsResources = resources.filter((r) => r.name.includes('.js'));
      const imageResources = resources.filter(
        (r) =>
          r.name.includes('.png') ||
          r.name.includes('.jpg') ||
          r.name.includes('.jpeg') ||
          r.name.includes('.webp') ||
          r.name.includes('.svg')
      );

      const getTotalSize = (resources: PerformanceResourceTiming[]) =>
        resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

      return {
        cssCount: cssResources.length,
        jsCount: jsResources.length,
        imageCount: imageResources.length,
        totalCssSize: getTotalSize(cssResources),
        totalJsSize: getTotalSize(jsResources),
        totalImageSize: getTotalSize(imageResources),
        totalResources: resources.length,
      };
    });

    console.log('Resource Metrics:', resourceMetrics);

    // Resource budgets
    expect(resourceMetrics.totalCssSize).toBeLessThan(150000); // CSS < 150KB
    expect(resourceMetrics.totalJsSize).toBeLessThan(300000); // JS < 300KB
    expect(resourceMetrics.totalResources).toBeLessThan(50); // Total resources < 50
  });

  test('should have proper caching headers', async ({ page }) => {
    const response = await page.goto('');
    expect(response).not.toBeNull();

    const cacheControl = response?.headers()['cache-control'];
    const etag = response?.headers().etag;

    // Should have either cache-control or etag for caching
    const hasCaching = cacheControl || etag;
    expect(hasCaching).toBeTruthy();

    console.log('Cache-Control:', cacheControl);
    console.log('ETag:', etag);
  });

  test('should not have render-blocking resources', async ({ page }) => {
    // Check for render-blocking resources
    const renderBlockingResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      // Find resources that block rendering (loaded before FCP)
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
      const fcpTime = fcp?.startTime || 0;

      return resources.filter((r) => {
        const isCSS = r.name.includes('.css');
        const isJS = r.name.includes('.js');
        const loadedBeforeFCP = r.responseEnd < fcpTime;

        return (isCSS || isJS) && loadedBeforeFCP;
      }).length;
    });

    console.log('Render-blocking resources:', renderBlockingResources);

    // Should have minimal render-blocking resources
    expect(renderBlockingResources).toBeLessThan(5);
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
