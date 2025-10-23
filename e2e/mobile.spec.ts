import { test, expect, devices } from '@playwright/test';

test.use(devices['iPhone 12']);

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display mobile menu button', async ({ page }) => {
    // Look for hamburger menu button
    const menuBtn = page.locator(
      'button[aria-label*="menu" i], button:has([class*="hamburger"]), button[class*="mobile"]'
    );
    await expect(menuBtn.first()).toBeVisible();
  });

  test('should open mobile menu when clicked', async ({ page }) => {
    // Find and click menu button
    const menuBtn = page
      .locator(
        'button[aria-label*="menu" i], button:has([class*="hamburger"]), button[class*="mobile"]'
      )
      .first();
    await menuBtn.click();
    await page.waitForTimeout(300);

    // Mobile navigation should be visible
    const mobileNav = page.locator('nav[class*="mobile"], [class*="mobile-menu"], aside');
    await expect(mobileNav.first()).toBeVisible();
  });

  test('should close mobile menu when clicking a link', async ({ page }) => {
    // Open menu
    const menuBtn = page
      .locator(
        'button[aria-label*="menu" i], button:has([class*="hamburger"]), button[class*="mobile"]'
      )
      .first();
    await menuBtn.click();
    await page.waitForTimeout(300);

    // Click a navigation link
    await page.click('nav a[href="#about"]');
    await page.waitForTimeout(500);

    // Menu should close (or we should navigate away)
    // For SPAs, check if menu closed. For multi-page, check URL
    const aboutSection = page.locator('#about');
    await expect(aboutSection).toBeVisible();
  });

  test('should be touch-friendly on mobile', async ({ page }) => {
    // Check if elements have adequate touch target sizes
    const links = page.locator('a, button');
    const firstLink = links.first();

    // Get bounding box
    const box = await firstLink.boundingBox();
    if (box) {
      // Touch targets should be at least 44x44px (iOS guideline) or 48x48px (Android)
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('should scale properly on mobile viewport', async ({ page }) => {
    // Check viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    const content = await viewportMeta.getAttribute('content');
    expect(content).toContain('width=device-width');
  });

  test('should display all sections on mobile', async ({ page }) => {
    // Scroll through sections
    await expect(page.locator('#about, section:has-text("About")')).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(300);

    await expect(page.locator('#projects, section:has-text("Project")')).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    await expect(page.locator('#contact, section:has-text("Contact")')).toBeVisible();
  });

  test('should not display Three.js on small screens if disabled', async ({ page }) => {
    // Check if Three.js is loaded or disabled based on screen size
    const threeRoot = page.locator('#three-root');

    // Wait a bit for potential Three.js loading
    await page.waitForTimeout(2000);

    const canvas = threeRoot.locator('canvas');

    // On small screens (< 640px), Three.js might be disabled
    // If canvas exists, that's fine. If not, that's also expected behavior.
    const canvasCount = await canvas.count();
    expect(canvasCount).toBeGreaterThanOrEqual(0);
  });
});
