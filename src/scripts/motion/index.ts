/**
 * NEW: Motion layer entry point, imported once by Layout.astro.
 *
 * Runs on every `astro:page-load` (initial load and client-side navigations)
 * and tears page-scoped work down on `astro:before-swap`:
 *   - Lenis smooth scrolling on the GSAP ticker (document-wide, started once)
 *   - custom cursor + magnetic CTAs (fine pointers, started once)
 *   - scroll-triggered section reveals and card tilt (per page)
 *   - the scroll-driven 3D scene: the hero arrowhead scatters into the
 *     network and the background quiets as the hero scrolls away
 *   - the intro loader and hero entrance
 *
 * With `prefers-reduced-motion: reduce` none of the animated pieces start:
 * native scrolling, native cursor, no reveals, and the scene swaps state
 * instantly instead of animating.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { invalidateScene, sceneState } from '../scene-state';

import { startCursor } from './cursor';
import { runIntro } from './intro';
import { setupReveals } from './reveals';
import { setSmoothScrollPaused, startSmoothScroll, syncSmoothScroll } from './smooth-scroll';
import { setupTilt } from './tilt';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/** Background opacity once the hero is out of view: present, but quiet behind text. */
const QUIET_SCENE = 0.35;

let firstLoad = true;
let pageCleanups: Array<() => void> = [];

function setupScene(hero: HTMLElement | null, animate: boolean): void {
  const root = document.getElementById('three-root');
  sceneState.hasHero = Boolean(hero);

  if (!hero) {
    sceneState.heroProgress = 1;
    if (root) root.style.opacity = String(QUIET_SCENE);
    invalidateScene();
    return;
  }

  if (animate) {
    const range = { trigger: hero, start: 'top top', end: 'bottom top' };
    // Tween the shared state directly so `scrub` smooths what the scene reads.
    const scatter = gsap.fromTo(
      sceneState,
      { heroProgress: 0 },
      { heroProgress: 1, ease: 'none', scrollTrigger: { ...range, scrub: 1 } }
    );
    const quiet = root
      ? gsap.fromTo(
          root,
          { opacity: 1 },
          { opacity: QUIET_SCENE, ease: 'none', scrollTrigger: { ...range, scrub: true } }
        )
      : null;
    pageCleanups.push(() => {
      scatter.scrollTrigger?.kill();
      scatter.kill();
      quiet?.scrollTrigger?.kill();
      quiet?.kill();
    });
    return;
  }

  // Reduced motion: no scroll-linked animation. Swap between the two states
  // instantly when the hero enters or leaves the viewport.
  const io = new IntersectionObserver(
    ([entry]) => {
      const away = !entry?.isIntersecting;
      sceneState.heroProgress = away ? 1 : 0;
      if (root) root.style.opacity = away ? String(QUIET_SCENE) : '1';
      invalidateScene();
    },
    { threshold: 0.2 }
  );
  io.observe(hero);
  pageCleanups.push(() => io.disconnect());
}

function onPageLoad(): void {
  const animate = !reducedMotion.matches;
  const hero = document.querySelector<HTMLElement>('[data-hero-scene]');

  if (animate) {
    startSmoothScroll();
    if (!firstLoad) syncSmoothScroll();

    const triggers = setupReveals();
    pageCleanups.push(() => triggers.forEach((t) => t.kill()));

    if (finePointer.matches) {
      startCursor();
      pageCleanups.push(setupTilt());
    }

    // Late font swaps change line heights; re-measure trigger positions.
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }

  setupScene(hero, animate);
  void runIntro(firstLoad);
  firstLoad = false;
}

document.addEventListener('astro:page-load', onPageLoad);

document.addEventListener('astro:before-swap', () => {
  pageCleanups.forEach((fn) => fn());
  pageCleanups = [];
});

// The mobile drawer locks the page behind it (Header.astro dispatches this).
window.addEventListener('scroll:lock', (ev) => {
  setSmoothScrollPaused((ev as CustomEvent<boolean>).detail === true);
});
