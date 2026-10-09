/**
 * NEW: Intro loader and hero entrance — the site's one orchestrated moment.
 *
 * 1. Loader (first visit per session, home page only; decided before first
 *    paint by the inline script in Layout.astro): the arrowhead mark draws
 *    while the counter tracks real readiness — fonts, window load and the 3D
 *    scene — bounded so a slow network never holds the page hostage.
 * 2. Hero: the name rises out of its mask while widening from a narrow to
 *    Archivo's widest cut, the rest of the hero follows, and the particle
 *    arrowhead assembles.
 *
 * CSS hides `[data-intro-item]` only under `html.motion:not(.intro-done)`, and
 * a CSS failsafe reveals everything if this script never runs.
 */
import { gsap } from 'gsap';

import { invalidateScene, sceneState } from '../scene-state';

const LOADER_MIN = 0.9; // seconds the counter takes to reach ~86%
const LOADER_MAX = 2.4; // hard cap before the loader leaves regardless

const wait = (s: number): Promise<void> => new Promise((r) => setTimeout(r, s * 1000));

const windowLoaded = (): Promise<void> =>
  document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((r) => window.addEventListener('load', () => r(), { once: true }));

const sceneReady = (): Promise<void> =>
  document.getElementById('three-root')?.dataset._threeInited
    ? Promise.resolve()
    : new Promise((r) => window.addEventListener('scene:ready', () => r(), { once: true }));

function finish(): void {
  const html = document.documentElement;
  html.classList.add('intro-done');
  html.classList.remove('intro-running', 'is-loading');
  html.dataset.intro = 'done';
}

async function playLoader(loader: HTMLElement): Promise<void> {
  const counter = loader.querySelector<HTMLElement>('[data-loader-count]');
  const path = loader.querySelector<SVGPathElement>('[data-loader-path]');
  const state = { p: 0 };
  const render = (): void => {
    if (counter) counter.textContent = String(Math.round(state.p * 100));
    // The path uses pathLength="1", so the dash offset is a 0..1 fraction.
    if (path) path.style.strokeDashoffset = String(1 - state.p);
  };

  const ready = Promise.all([document.fonts?.ready, windowLoaded(), sceneReady()]);

  await gsap.to(state, { p: 0.86, duration: LOADER_MIN, ease: 'power2.out', onUpdate: render });
  await Promise.race([ready, wait(LOADER_MAX - LOADER_MIN)]);
  await gsap.to(state, { p: 1, duration: 0.35, ease: 'power2.inOut', onUpdate: render });

  // Slide the panel away; the hero starts while it is still moving.
  gsap.to(loader, {
    yPercent: -100,
    duration: 0.9,
    ease: 'expo.inOut',
    onComplete: () => document.documentElement.classList.remove('is-loading'),
  });
  await wait(0.35);
}

export async function runIntro(firstLoad: boolean): Promise<void> {
  const html = document.documentElement;
  const hero = document.querySelector<HTMLElement>('[data-hero-scene]');

  // Nothing to choreograph: no hero, reduced motion, or a return visit to the
  // home page within the same session (client-side navigation).
  if (!hero || !html.classList.contains('motion') || !firstLoad) {
    sceneState.assemble = 1;
    invalidateScene();
    finish();
    return;
  }

  html.classList.add('intro-running');

  const loader = html.classList.contains('is-loading') ? document.getElementById('loader') : null;
  if (loader) await playLoader(loader);

  const lines = hero.querySelectorAll<HTMLElement>('.hero-line > span');
  const items = hero.querySelectorAll<HTMLElement>('[data-intro-item]');

  sceneState.assemble = 0;
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set([...lines, ...items], { clearProps: 'all' });
      finish();
    },
  });

  tl.to(sceneState, { assemble: 1, duration: 2.4, ease: 'power3.inOut' }, 0)
    .fromTo(
      lines,
      { yPercent: 105, fontStretch: '78%' },
      { yPercent: 0, fontStretch: '125%', duration: 1.4, ease: 'expo.out', stagger: 0.12 },
      0
    )
    .fromTo(
      items,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07 },
      0.4
    );
}
