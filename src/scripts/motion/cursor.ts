/**
 * NEW: Custom cursor and magnetic CTAs (fine pointers only).
 *
 * The cursor is a gold dot that tracks the pointer exactly plus a ring that
 * trails it. Over links and buttons the ring grows; over project cards it
 * shows "View"; over text fields it hides so the native caret takes over.
 * Elements marked `data-magnetic` lean toward the pointer while hovered.
 *
 * Listeners are delegated on `document`, so they are bound once and keep
 * working across client-side navigations (the cursor element persists).
 */
import { gsap } from 'gsap';

const INTERACTIVE = 'a, button, [role="button"], label, select, summary, [data-cursor]';
const TEXT_ENTRY = 'input, textarea, [contenteditable="true"]';
const MAGNET_STRENGTH = 0.35;

let started = false;

export function startCursor(): void {
  if (started) return;
  const root = document.getElementById('cursor');
  const dot = root?.querySelector<HTMLElement>('.cursor-dot');
  const ring = root?.querySelector<HTMLElement>('.cursor-ring');
  const label = root?.querySelector<HTMLElement>('.cursor-label');
  if (!root || !dot || !ring || !label) return;
  started = true;

  document.documentElement.classList.add('has-cursor');

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

  let visible = false;

  window.addEventListener(
    'pointermove',
    (ev) => {
      if (ev.pointerType !== 'mouse') return;
      dotX(ev.clientX);
      dotY(ev.clientY);
      ringX(ev.clientX);
      ringY(ev.clientY);
      if (!visible) {
        visible = true;
        // Jump straight to the pointer on first sight instead of sliding in.
        gsap.set([dot, ring], { x: ev.clientX, y: ev.clientY });
        root.classList.add('is-visible');
      }
    },
    { passive: true }
  );

  document.documentElement.addEventListener('pointerleave', () => {
    visible = false;
    root.classList.remove('is-visible');
  });

  document.addEventListener('pointerdown', () => root.classList.add('is-pressed'));
  document.addEventListener('pointerup', () => root.classList.remove('is-pressed'));

  // Hover states, resolved from the element under the pointer.
  document.addEventListener('pointerover', (ev) => {
    const target = ev.target as Element | null;
    if (!target?.closest) return;

    const viewTarget = target.closest<HTMLElement>('[data-cursor="view"]');
    const onText = target.closest(TEXT_ENTRY);
    const onLink = target.closest(INTERACTIVE);

    root.classList.toggle('is-hidden', Boolean(onText));
    root.classList.toggle('is-view', Boolean(viewTarget) && !onText);
    root.classList.toggle('is-link', Boolean(onLink) && !viewTarget && !onText);
    label.textContent = viewTarget ? (viewTarget.dataset.cursorLabel ?? 'View') : '';
  });

  setupMagnets();
}

/**
 * Magnetic hover. Delegated: the active magnet follows the pointer with an
 * eased translate and springs back on leave.
 */
function setupMagnets(): void {
  let active: HTMLElement | null = null;
  let toX: gsap.QuickToFunc | null = null;
  let toY: gsap.QuickToFunc | null = null;

  const release = (): void => {
    if (!active) return;
    gsap.to(active, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    active = null;
    toX = null;
    toY = null;
  };

  document.addEventListener('pointerover', (ev) => {
    const magnet = (ev.target as Element | null)?.closest?.<HTMLElement>('[data-magnetic]');
    if (magnet === active) return;
    release();
    if (!magnet) return;
    active = magnet;
    toX = gsap.quickTo(magnet, 'x', { duration: 0.4, ease: 'power3.out' });
    toY = gsap.quickTo(magnet, 'y', { duration: 0.4, ease: 'power3.out' });
  });

  window.addEventListener(
    'pointermove',
    (ev) => {
      if (!active || !toX || !toY) return;
      const rect = active.getBoundingClientRect();
      const dx = ev.clientX - (rect.left + rect.width / 2);
      const dy = ev.clientY - (rect.top + rect.height / 2);
      toX(dx * MAGNET_STRENGTH);
      toY(dy * MAGNET_STRENGTH);
    },
    { passive: true }
  );

  document.addEventListener('pointerout', (ev) => {
    if (!active) return;
    const next = ev.relatedTarget as Node | null;
    if (!next || !active.contains(next)) release();
  });

  // A page swap removes the hovered element; drop the reference with it.
  document.addEventListener('astro:before-swap', () => {
    active = null;
    toX = null;
    toY = null;
  });
}
