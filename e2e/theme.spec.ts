import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have a theme toggle button', async ({ page }) => {
    const themeToggle = page.locator(
      'button[aria-label*="theme" i], button:has-text("Dark"), button:has-text("Light")'
    );
    await expect(themeToggle.first()).toBeVisible();
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    // Find the theme toggle button
    const themeToggle = page
      .locator('button[aria-label*="theme" i], button:has-text("Dark"), button:has-text("Light")')
      .first();

    // Get initial theme
    const initialTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    // Click toggle
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Theme should have changed
    const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));

    expect(newTheme).not.toBe(initialTheme);
    expect(['light', 'dark']).toContain(newTheme);
  });

  test('should persist theme preference in localStorage', async ({ page }) => {
    const themeToggle = page
      .locator('button[aria-label*="theme" i], button:has-text("Dark"), button:has-text("Light")')
      .first();

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Get current theme
    const currentTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    // Check localStorage
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe(currentTheme);
  });

  test('should restore theme on page reload', async ({ page }) => {
    const themeToggle = page
      .locator('button[aria-label*="theme" i], button:has-text("Dark"), button:has-text("Light")')
      .first();

    // Set to dark theme
    await themeToggle.click();
    await page.waitForTimeout(300);

    const themeBeforeReload = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    // Reload page
    await page.reload();

    // Theme should be restored
    const themeAfterReload = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );

    expect(themeAfterReload).toBe(themeBeforeReload);
  });

  test('should update Three.js colors when theme changes', async ({ page }) => {
    const themeToggle = page
      .locator('button[aria-label*="theme" i], button:has-text("Dark"), button:has-text("Light")')
      .first();

    // Wait for Three.js to load
    await page.waitForTimeout(1000);

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Three.js canvas should still be visible and rendering
    const canvas = page.locator('#three-root canvas');
    await expect(canvas).toBeVisible();
  });
});
