import {
  POINTER_ROTATION_X_MULTIPLIER,
  POINTER_ROTATION_Y_MULTIPLIER,
  VISIBILITY_THRESHOLD,
} from './constants';
import type { InteractionState } from './types';
import { calculateScrollProgress } from './utils';

/**
 * Initialize interaction state
 */
export function initializeInteractionState(): InteractionState {
  return {
    pointerX: 0,
    pointerY: 0,
    targetRotY: 0,
    targetRotX: 0,
    scrollProgress: 0,
    scrollTicking: false,
  };
}

/**
 * Handle pointer move event
 */
export function createPointerMoveHandler(
  root: HTMLElement,
  state: InteractionState
): (e: PointerEvent) => void {
  return (e: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    state.pointerX = x - 0.5;
    state.pointerY = y - 0.5;
    state.targetRotY = state.pointerX * POINTER_ROTATION_Y_MULTIPLIER;
    state.targetRotX = -state.pointerY * POINTER_ROTATION_X_MULTIPLIER;
  };
}

/**
 * Handle pointer leave event
 */
export function createPointerLeaveHandler(state: InteractionState): () => void {
  return () => {
    state.pointerX = 0;
    state.pointerY = 0;
    state.targetRotX = 0;
    state.targetRotY = 0;
  };
}

/**
 * Update scroll progress
 */
export function updateScrollProgress(state: InteractionState): void {
  state.scrollProgress = calculateScrollProgress();
  state.scrollTicking = false;
}

/**
 * Create scroll event handler with requestAnimationFrame throttling
 */
export function createScrollHandler(state: InteractionState): () => void {
  return () => {
    if (!state.scrollTicking) {
      requestAnimationFrame(() => updateScrollProgress(state));
      state.scrollTicking = true;
    }
  };
}

/**
 * Create visibility observer for pause/resume functionality
 */
export function createVisibilityObserver(
  root: HTMLElement,
  onVisible: () => void,
  onHidden: () => void
): IntersectionObserver {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onVisible();
        } else {
          onHidden();
        }
      });
    },
    { threshold: VISIBILITY_THRESHOLD }
  );

  observer.observe(root);
  return observer;
}

/**
 * Setup pointer event listeners
 */
export function setupPointerListeners(root: HTMLElement, state: InteractionState): () => void {
  const onPointerMove = createPointerMoveHandler(root, state);
  const onPointerLeave = createPointerLeaveHandler(state);

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave);

  // Return cleanup function
  return () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerLeave);
  };
}

/**
 * Setup scroll event listener
 */
export function setupScrollListener(state: InteractionState): () => void {
  const onScroll = createScrollHandler(state);

  window.addEventListener('scroll', onScroll, { passive: true });

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', onScroll);
  };
}
