/**
 * NEW: Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger,
 * Lenis and every tween advance on the same frame.
 *
 * Touch devices keep native scrolling (Lenis' default `syncTouch: false`).
 * Started once per document; it survives client-side navigations, so callers
 * only need `syncSmoothScroll()` after a page swap.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { registerScroller, type ScrollTarget } from './scroll-to';

// Matches the sticky header height (html `scroll-padding-top`).
const HEADER_OFFSET = 80;

let lenis: Lenis | null = null;

function tick(time: number): void {
  lenis?.raf(time * 1000);
}

export function startSmoothScroll(): Lenis {
  if (lenis) return lenis;

  lenis = new Lenis({
    autoRaf: false,
    lerp: 0.1,
    smoothWheel: true,
    // Let nested scrollers (the message textarea, the mobile drawer) scroll natively.
    allowNestedScroll: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick);
  // Lenis already smooths frame deltas; GSAP's lag smoothing would fight it.
  gsap.ticker.lagSmoothing(0);

  registerScroller((target: ScrollTarget) => {
    lenis?.scrollTo(target, {
      offset: typeof target === 'number' ? 0 : -HEADER_OFFSET,
      duration: 1.1,
    });
  });

  return lenis;
}

/** Re-measure after a client-side page swap and adopt the new scroll position. */
export function syncSmoothScroll(): void {
  if (!lenis) return;
  lenis.resize();
  lenis.scrollTo(window.scrollY, { immediate: true, force: true });
}

/** Pause/resume wheel smoothing (e.g. while the mobile drawer is open). */
export function setSmoothScrollPaused(paused: boolean): void {
  if (!lenis) return;
  if (paused) lenis.stop();
  else lenis.start();
}
