import { test, expect } from '@playwright/test';

import { settleAnimations } from './helpers';

test.describe('Motion', () => {
  test('plays the intro loader once per session, then gets out of the way', async ({ page }) => {
    await page.goto('');
    const loader = page.locator('#loader');
    await expect(page.locator('html')).toHaveClass(/is-loading/);
    await expect(loader).toBeVisible();

    await settleAnimations(page);
    await expect(loader).toBeHidden();
    await expect(page.locator('h1')).toBeVisible();

    // Same session: straight to the page.
    await page.reload();
    await expect(page.locator('html')).not.toHaveClass(/is-loading/);
    await expect(loader).toBeHidden();
  });

  test('skips the loader when deep-linking to a section', async ({ page }) => {
    await page.goto('#contact');
    await expect(page.locator('html')).not.toHaveClass(/is-loading/);
  });

  test('keeps unrevealed sections in the accessibility tree', async ({ page }) => {
    await page.goto('');
    await settleAnimations(page);

    // Below the fold, before any scrolling: faded out, but never
    // `visibility: hidden`, so screen readers still reach it.
    const paragraph = page.locator('#about [data-reveal="stagger"] p').first();
    const style = await paragraph.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { visibility: cs.visibility, display: cs.display };
    });
    expect(style).toEqual({ visibility: 'visible', display: 'block' });
  });

  test('reveals sections as they scroll into view', async ({ page }) => {
    await page.goto('#experience');
    await settleAnimations(page);
    const role = page.locator('#experience ol > li').first();
    await expect(role).toBeInViewport();
    await expect
      .poll(() => role.evaluate((el) => Number(getComputedStyle(el).opacity)), { timeout: 5000 })
      .toBe(1);
  });

  test('uses smooth scrolling and a custom cursor with a fine pointer', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Touch devices keep native scrolling and the native cursor');
    await page.goto('');
    await settleAnimations(page);
    await expect(page.locator('html')).toHaveClass(/lenis/);

    await page.mouse.move(200, 200);
    await page.mouse.move(240, 260);
    await expect(page.locator('html')).toHaveClass(/has-cursor/);
    await expect(page.locator('#cursor')).toHaveClass(/is-visible/);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('renders the finished page with no loader, smoothing or cursor', async ({ page }) => {
      await page.goto('');
      const html = page.locator('html');

      await expect(html).not.toHaveClass(/motion/);
      await expect(html).not.toHaveClass(/is-loading/);
      await expect(html).not.toHaveClass(/lenis/);
      await expect(html).not.toHaveClass(/has-cursor/);
      await expect(page.locator('#loader')).toBeHidden();

      // Content far below the fold is fully opaque without scrolling.
      const opacity = await page
        .locator('#contact h2')
        .evaluate((el) => Number(getComputedStyle(el).opacity));
      expect(opacity).toBe(1);

      await expect(page.locator('h1')).toBeVisible();
    });
  });
});
