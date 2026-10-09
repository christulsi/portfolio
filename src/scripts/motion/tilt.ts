/**
 * NEW: 3D tilt for `[data-tilt]` cards (fine pointers only).
 *
 * The card rotates toward the pointer (max ±TILT degrees) and exposes the
 * pointer position as `--px` / `--py` (0–100%) so CSS can place a soft
 * highlight. Parents provide the perspective (`.tilt-stage`).
 */
import { gsap } from 'gsap';

const TILT = 7;

export function setupTilt(root: ParentNode = document): () => void {
  const cleanups: Array<() => void> = [];

  root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });

    const onMove = (ev: PointerEvent): void => {
      if (ev.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      const px = (ev.clientX - rect.left) / rect.width;
      const py = (ev.clientY - rect.top) / rect.height;
      rotY((px - 0.5) * 2 * TILT);
      rotX(-(py - 0.5) * 2 * TILT);
      card.style.setProperty('--px', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--py', `${(py * 100).toFixed(1)}%`);
    };

    const onLeave = (): void => {
      rotX(0);
      rotY(0);
    };

    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
    cleanups.push(() => {
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
