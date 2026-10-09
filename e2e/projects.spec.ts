import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

import { settleAnimations } from './helpers';

const SLUGS = [
  'single-window-platform',
  'erpnext-implementation',
  'cicd-pipeline',
  'data-engineering-ai',
];

test.describe('Project pages', () => {
  test('every project card links to its own page', async ({ page }) => {
    await page.goto('');
    const links = page.locator('#projects article h3 a');
    await expect(links).toHaveCount(SLUGS.length);

    const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    for (const slug of SLUGS) {
      expect(hrefs).toContain(`/portfolio/projects/${slug}/`);
    }
  });

  for (const slug of SLUGS) {
    test(`${slug} has its own title, description and canonical URL`, async ({ page }) => {
      const response = await page.goto(`/portfolio/projects/${slug}/`);
      expect(response?.status()).toBe(200);

      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      const heading = (await h1.textContent())?.trim() ?? '';
      expect(heading.length).toBeGreaterThan(0);

      await expect(page).toHaveTitle(`${heading} | Chris Tulsi`);

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length ?? 0).toBeGreaterThan(50);
      expect(description?.length ?? 0).toBeLessThanOrEqual(160);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toContain(`/portfolio/projects/${slug}/`);

      // The way back to the grid.
      await expect(page.locator('main a[href$="#projects"]')).toBeVisible();
    });
  }

  test('opens from a card through a client-side transition and keeps the theme', async ({
    page,
  }) => {
    await page.goto('');
    await settleAnimations(page);

    // Switch to the non-default theme so a lost attribute would show.
    const before = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.locator('#theme-toggle').click();
    const theme = before === 'dark' ? 'light' : 'dark';
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

    const link = page.locator('#projects article h3 a').first();
    const title = (await link.textContent())?.trim() ?? '';
    await link.click();

    await expect(page).toHaveURL(/\/portfolio\/projects\/single-window-platform\/$/);
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  });

  test('links to the next project', async ({ page }) => {
    await page.goto('/portfolio/projects/single-window-platform/');
    const next = page.locator('nav[aria-label="Next project"] a');
    await expect(next).toHaveAttribute('href', '/portfolio/projects/erpnext-implementation/');
  });

  test('has no detectable accessibility issues', async ({ page }) => {
    const response = await page.goto('/portfolio/projects/cicd-pipeline/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText('CI/CD Pipeline Automation');
    await settleAnimations(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
