import { test, expect } from '@playwright/test';

test.describe('SEO & Meta Tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('should have proper title tag', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(60);
    expect(title).toContain('Chris Tulsi');
  });

  test('should have meta description', async ({ page }) => {
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);
    expect(description!.length).toBeLessThan(160);
  });

  test('should have Open Graph tags', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page
      .locator('meta[property="og:description"]')
      .getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');

    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
    expect(ogImage).toBeTruthy();
    expect(ogUrl).toBeTruthy();
    expect(ogType).toBeTruthy();

    expect(ogImage).toContain('http');
    expect(ogUrl).toContain('http');
  });

  test('should have Twitter Card tags', async ({ page }) => {
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
    const twitterDescription = await page
      .locator('meta[name="twitter:description"]')
      .getAttribute('content');
    const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');

    expect(twitterCard).toBe('summary_large_image');
    expect(twitterTitle).toBeTruthy();
    expect(twitterDescription).toBeTruthy();
    expect(twitterImage).toBeTruthy();
  });

  test('should have canonical URL', async ({ page }) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
    expect(canonical).toContain('http');
  });

  test('should have structured data (JSON-LD)', async ({ page }) => {
    const structuredData = await page.evaluate(() => {
      const script = document.querySelector('script[type="application/ld+json"]');
      return script ? JSON.parse(script.textContent || '{}') : null;
    });

    expect(structuredData).toBeTruthy();
    expect(structuredData['@context']).toBe('https://schema.org');
    expect(structuredData['@type']).toBe('Person');
    expect(structuredData.name).toBe('Chris Tulsi');
    expect(structuredData.jobTitle).toBe('Senior ICT Engineer');
    expect(structuredData.url).toBeTruthy();
    expect(structuredData.sameAs).toBeInstanceOf(Array);
    expect(structuredData.sameAs.length).toBeGreaterThan(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // Should have exactly one H1

    const h1Text = await page.locator('h1').first().textContent();
    expect(h1Text).toBeTruthy();
    expect(h1Text).toContain('Chris Tulsi');
  });

  test('should have lang attribute', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('should have viewport meta tag', async ({ page }) => {
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
    expect(viewport).toContain('width=device-width');
  });

  test('should have charset meta tag', async ({ page }) => {
    const charset = await page.evaluate(() => {
      const meta = document.querySelector('meta[charset]');
      return meta?.getAttribute('charset');
    });
    expect(charset).toBeTruthy();
    expect(charset?.toUpperCase()).toBe('UTF-8');
  });

  test('should have favicon', async ({ page }) => {
    const favicon = page.locator('link[rel="icon"]').first();
    expect(favicon).toBeTruthy();

    const href = await favicon.getAttribute('href');
    expect(href).toBeTruthy();
  });

  test('should have theme-color meta tag', async ({ page }) => {
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeTruthy();
    expect(themeColor).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test('should have robots meta tag', async ({ page }) => {
    const robots = await page.locator('meta[name="robots"]').first().getAttribute('content');
    expect(robots).toBeTruthy();
    expect(robots).toContain('index');
    expect(robots).toContain('follow');
  });

  test('should have author meta tag', async ({ page }) => {
    const author = await page.locator('meta[name="author"]').getAttribute('content');
    expect(author).toBe('Chris Tulsi');
  });

  test('should have keywords meta tag', async ({ page }) => {
    const keywords = await page.locator('meta[name="keywords"]').getAttribute('content');
    expect(keywords).toBeTruthy();
    expect(keywords!.length).toBeGreaterThan(10);
  });

  test('should check robots.txt exists', async ({ request }) => {
    const response = await request.get('/portfolio/robots.txt');
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain('User-agent');
    expect(text).toContain('Sitemap');
  });

  test('should have sitemap referenced in robots.txt', async ({ request }) => {
    const response = await request.get('/portfolio/robots.txt');
    const text = await response.text();

    expect(text).toContain('Sitemap:');
    expect(text).toContain('sitemap');
  });

  test('should have all links with meaningful text', async ({ page }) => {
    const emptyLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.filter((link) => {
        const text = link.textContent?.trim();
        const ariaLabel = link.getAttribute('aria-label');
        const title = link.getAttribute('title');

        return !text && !ariaLabel && !title;
      }).length;
    });

    expect(emptyLinks).toBe(0);
  });

  test('should have minimal duplicate meta tags', async ({ page }) => {
    const duplicates = await page.evaluate(() => {
      const metas = Array.from(document.querySelectorAll('meta[name], meta[property]'));
      const seen = new Set();
      const dupes: string[] = [];

      metas.forEach((meta) => {
        const identifier = meta.getAttribute('name') || meta.getAttribute('property');
        if (identifier) {
          if (seen.has(identifier)) {
            dupes.push(identifier);
          }
          seen.add(identifier);
        }
      });

      return dupes;
    });

    // Allow up to 1 duplicate (e.g., robots tag from both astro-seo and custom)
    expect(duplicates.length).toBeLessThanOrEqual(1);
  });
});
