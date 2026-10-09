/**
 * Utility functions for the constellation background.
 */

import { MAX_NODE_COUNT, MAX_PIXEL_RATIO, MOBILE_PIXEL_RATIO } from './constants';

/**
 * Get the current theme from the document.
 */
export function getCurrentTheme(): 'light' | 'dark' {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark' ? 'dark' : 'light';
}

/**
 * Check if reduced motion is preferred by the user.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if the device is in data saver mode.
 */
export function isDataSaverEnabled(): boolean {
  // @ts-expect-error - navigator.connection is not in the TypeScript DOM lib yet
  return Boolean(navigator.connection && navigator.connection.saveData);
}

/**
 * Whether pointer interaction (cursor links + parallax) should be enabled.
 * Requires a fine, hovering pointer (i.e. a mouse/trackpad, not touch) and a
 * non–data-saver connection.
 */
export function shouldEnablePointer(): boolean {
  if (isDataSaverEnabled()) return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/**
 * Choose a node count appropriate for the device. The link scan is O(n²) and
 * the canvas is full-viewport, so we scale down on smaller / lower-memory
 * devices to protect the framerate.
 */
export function pickNodeCount(): number {
  const w = window.innerWidth;
  // NEW: phones get a lighter field (the scene used to be skipped below 640px).
  let count = w >= 1280 ? MAX_NODE_COUNT : w >= 900 ? 130 : w >= 640 ? 95 : 60;

  // navigator.deviceMemory is a non-standard but widely supported hint (GB).
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory && memory <= 4) {
    count = Math.round(count * 0.7);
  }

  return Math.min(count, MAX_NODE_COUNT);
}

/**
 * NEW: Device pixel ratio for the renderer, capped at 2 (1.5 on phone-sized
 * viewports, where the GPU budget is smaller and the canvas is full-screen).
 */
export function pickPixelRatio(): number {
  const cap = window.innerWidth < 768 ? MOBILE_PIXEL_RATIO : MAX_PIXEL_RATIO;
  return Math.min(window.devicePixelRatio || 1, cap);
}

/**
 * NEW: Whether this is a phone-sized viewport (lighter scene: no antialiasing,
 * fewer particles).
 */
export function isSmallViewport(): boolean {
  return window.innerWidth < 768;
}

/**
 * Clamp a number between min and max values.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values.
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Calculate scroll progress (0 to 1) over the whole document.
 */
export function calculateScrollProgress(): number {
  const windowHeight =
    document.documentElement.scrollHeight - document.documentElement.clientHeight;
  if (windowHeight <= 0) return 0;
  return Math.max(0, Math.min(1, window.scrollY / windowHeight));
}
