import type { InteractionState } from './types';
import { calculateScrollProgress } from './utils';

/**
 * Initialize interaction state.
 */
export function initializeInteractionState(): InteractionState {
  return {
    ndcX: 0,
    ndcY: 0,
    pointerActive: false,
    parallaxX: 0,
    parallaxY: 0,
    scrollProgress: 0,
    scrollTicking: false,
  };
}

/**
 * Handle pointer move. The canvas is a full-viewport fixed layer, so we track
 * the pointer in normalized device coordinates (-1..1) relative to the window.
 * World-space projection happens in the render loop, which keeps it correct
 * across resizes.
 */
export function createPointerMoveHandler(state: InteractionState): (e: PointerEvent) => void {
  return (e: PointerEvent) => {
    state.ndcX = (e.clientX / window.innerWidth) * 2 - 1;
    state.ndcY = -((e.clientY / window.innerHeight) * 2 - 1);
    state.pointerActive = true;
  };
}

/**
 * Handle pointer leave — release the cursor so links and parallax ease back.
 */
export function createPointerLeaveHandler(state: InteractionState): () => void {
  return () => {
    state.pointerActive = false;
    state.ndcX = 0;
    state.ndcY = 0;
  };
}

/**
 * Update scroll progress (0..1 over the whole document).
 */
export function updateScrollProgress(state: InteractionState): void {
  state.scrollProgress = calculateScrollProgress();
  state.scrollTicking = false;
}

/**
 * Create a scroll handler throttled with requestAnimationFrame.
 */
export function createScrollHandler(state: InteractionState): () => void {
  return () => {
    if (!state.scrollTicking) {
      requestAnimationFrame(() => updateScrollProgress(state));
      state.scrollTicking = true;
    }
  };
}
