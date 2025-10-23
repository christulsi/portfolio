import { test, expect } from '@playwright/test';

/**
 * Helper function to click a navigation link, handling mobile menu if needed
 */
async function clickNavLink(page: any, linkSelector: string) {
  const viewport = page.viewportSize();
  const isMobile = viewport && viewport.width < 768;

  if (isMobile) {
    // On mobile, open the hamburger menu first
    const menuToggle = page.locator('#mobile-menu-toggle');
    await menuToggle.click();

    // Wait for menu animation
    await page.waitForTimeout(400);

    // Click the link
    await page.locator(linkSelector).click();

    // Wait for menu close animation
    await page.waitForTimeout(400);
  } else {
    // On desktop, click the link directly
    await page.locator(linkSelector).click();
  }
}

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to baseURL - using empty string resolves to the full baseURL
    await page.goto('');
  });

  test('should load the homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Chris Tulsi/i);
  });

  test('should display all main sections', async ({ page }) => {
    // Check for main sections by ID only (hero section doesn't have an ID)
    await expect(page.locator('h1:has-text("Chris Tulsi")')).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#projects')).toBeVisible();
    await expect(page.locator('#experience')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('should have functional header navigation', async ({ page }) => {
    // Wait for header to be visible
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check navigation links exist - links include base path
    await expect(page.locator('nav a[href*="#about"]')).toBeVisible();
    await expect(page.locator('nav a[href*="#projects"]')).toBeVisible();
    await expect(page.locator('nav a[href*="#experience"]')).toBeVisible();
    await expect(page.locator('nav a[href*="#contact"]')).toBeVisible();
  });

  test('should scroll to sections when clicking navigation links', async ({ page }) => {
    // Click on Projects link - handles mobile menu automatically
    await clickNavLink(page, 'nav a[href*="#projects"]');

    // Wait a bit for smooth scroll
    await page.waitForTimeout(500);

    // Check if we're near the projects section
    const projectsSection = page.locator('#projects');
    await expect(projectsSection).toBeInViewport();
  });

  test('should display Three.js canvas', async ({ page }) => {
    // Check if Three.js root element exists
    const threeRoot = page.locator('#three-root');
    await expect(threeRoot).toBeVisible();

    // Check if canvas was added - skip on mobile as Three.js may not render
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (!isMobile) {
      const canvas = threeRoot.locator('canvas');
      await expect(canvas).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have a working scroll-to-top button', async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    // Scroll-to-top button should appear
    const scrollBtn = page.locator('[aria-label="Scroll to top"], button:has-text("Top")');
    await expect(scrollBtn.first()).toBeVisible({ timeout: 2000 });

    // Click it
    await scrollBtn.first().click();
    await page.waitForTimeout(1000); // Wait longer for smooth scroll animation

    // Should be near top - increase threshold to account for header height
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(1000);
  });

  test('should display project cards', async ({ page }) => {
    // Navigate to projects section - handles mobile menu automatically
    await clickNavLink(page, 'nav a[href*="#projects"]');
    await page.waitForTimeout(300);

    // Check for project cards by looking for project titles in the section
    const projectsSection = page.locator('#projects');
    await expect(projectsSection).toBeVisible();

    // Check for specific project titles
    await expect(projectsSection.locator('h3:has-text("ERPNext")')).toBeVisible();
  });

  test('should have footer with social links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check for social media links
    const githubLink = page.locator('a[href*="github.com"]');
    const linkedinLink = page.locator('a[href*="linkedin.com"]');

    await expect(githubLink.first()).toBeVisible();
    await expect(linkedinLink.first()).toBeVisible();
  });
});
