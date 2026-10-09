/**
 * NEW: One entry point for programmatic scrolling (nav links, hash links,
 * scroll-to-top).
 *
 * Deliberately dependency-free so small component scripts can import it
 * without pulling in GSAP or Lenis. When smooth scrolling is running it
 * registers itself here; otherwise this falls back to native scrolling, which
 * respects `scroll-padding-top` and reduced motion.
 */

export type ScrollTarget = HTMLElement | number;

type Scroller = (target: ScrollTarget) => void;

let scroller: Scroller | null = null;

export function registerScroller(fn: Scroller | null): void {
  scroller = fn;
}

export function scrollToTarget(target: ScrollTarget): void {
  if (scroller) {
    scroller(target);
    return;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth';
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior });
  } else {
    target.scrollIntoView({ behavior });
  }
}
