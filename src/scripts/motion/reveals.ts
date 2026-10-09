/**
 * NEW: Scroll-triggered section reveals.
 *
 * Markup opts in with `data-reveal`:
 *   - "title"   — words rise out of a mask, staggered (section headings)
 *   - "fade"    — the element fades and slides up
 *   - "stagger" — each direct child fades and slides up in turn
 *
 * Hidden states are applied here, by script, so content is always visible
 * without JavaScript or with reduced motion. Each reveal plays once.
 *
 * Only opacity and transform are animated — never `visibility` (GSAP's
 * autoAlpha) — so unrevealed content stays in the accessibility tree and a
 * screen reader can reach every section without scrolling to it first.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { splitWords } from './split';

const START = 'top 85%';

export function setupReveals(root: ParentNode = document): ScrollTrigger[] {
  const triggers: ScrollTrigger[] = [];

  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const kind = el.dataset.reveal;
    let targets: gsap.TweenTarget;
    let from: gsap.TweenVars;
    let to: gsap.TweenVars;

    if (kind === 'title') {
      targets = splitWords(el);
      from = { yPercent: 110 };
      to = { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.07 };
    } else if (kind === 'stagger') {
      targets = Array.from(el.children);
      from = { opacity: 0, y: 48 };
      to = { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.09 };
    } else {
      targets = el;
      from = { opacity: 0, y: 32 };
      to = { opacity: 1, y: 0, duration: 1, ease: 'power3.out' };
    }

    gsap.set(targets, from);
    const tween = gsap.to(targets, {
      ...to,
      paused: true,
      // Clear inline styles afterwards so hover transforms (card tilt) and
      // print styles start from a clean slate.
      clearProps: kind === 'title' ? 'transform' : 'transform,opacity',
    });

    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: START,
        once: true,
        onEnter: () => tween.play(),
      })
    );
  });

  return triggers;
}
