import type { Page } from '@playwright/test';

/** True when the header collapses into the mobile drawer (below Tailwind's `md`). */
export function isMobileViewport(page: Page): boolean {
  const viewport = page.viewportSize();
  return !!viewport && viewport.width < 768;
}

/**
 * Open the mobile navigation drawer if the viewport collapses it. No-op on
 * desktop, where the links are always visible.
 */
export async function openNavIfCollapsed(page: Page): Promise<void> {
  if (!isMobileViewport(page)) return;
  const toggle = page.locator('#mobile-menu-toggle');
  if ((await toggle.getAttribute('aria-expanded')) === 'true') return;
  await toggle.click();
  // Wait for the drawer's slide-in transition to finish.
  await page.locator('#nav-menu').waitFor({ state: 'visible' });
  await page.waitForTimeout(350);
}

/**
 * Click a primary navigation link, opening the mobile drawer first if needed.
 */
export async function clickNavLink(page: Page, linkSelector: string): Promise<void> {
  await openNavIfCollapsed(page);
  await page.locator(linkSelector).click();
  // Wait for the drawer to close and the smooth scroll to settle.
  await page.waitForTimeout(400);
}

/**
 * Wait until the page is visually settled: the GSAP intro (loader + hero
 * entrance) has finished and every time-based CSS animation or transition is
 * done. Scanning mid-fade would measure text at partial opacity and report
 * false color-contrast failures. GSAP tweens don't show up in
 * `document.getAnimations()`, so the intro signals completion with
 * `html[data-intro="done"]` (set on every page, immediately when there is no
 * intro). Scroll-driven animations never "finish", so they are ignored.
 */
export async function settleAnimations(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const html = document.documentElement;
      const introDone = !html.classList.contains('motion') || html.dataset.intro === 'done';
      return (
        introDone &&
        document
          .getAnimations()
          .filter((animation) => animation.timeline === document.timeline)
          .every((animation) => animation.playState !== 'running')
      );
    },
    undefined,
    { timeout: 10_000 }
  );
}
