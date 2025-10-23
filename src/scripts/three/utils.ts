/**
 * Utility Functions for Three.js Animation
 */

/**
 * Get the current theme from the document
 */
export function getCurrentTheme(): 'light' | 'dark' {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'dark' ? 'dark' : 'light';
}

/**
 * Check if reduced motion is preferred by the user
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if the device is in data saver mode
 */
export function isDataSaverEnabled(): boolean {
  // @ts-expect-error - navigator.connection is not in TypeScript lib yet
  return Boolean(navigator.connection && navigator.connection.saveData);
}

/**
 * Check if pointer interaction should be enabled
 * Disabled on data saver mode or small screens
 */
export function shouldEnablePointer(): boolean {
  return !isDataSaverEnabled() && window.innerWidth >= 640;
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Calculate scroll progress (0 to 1)
 */
export function calculateScrollProgress(): number {
  const windowHeight =
    document.documentElement.scrollHeight - document.documentElement.clientHeight;
  return Math.max(0, Math.min(1, window.scrollY / windowHeight));
}

/**
 * Create a Float32Array buffer for particle positions
 */
export function createPositionBuffer(count: number): Float32Array {
  return new Float32Array(count * 3);
}

/**
 * Generate Fibonacci sphere distribution
 * Used for even particle distribution on a sphere surface
 */
export function generateFibonacciSphere(count: number, radius: number): Float32Array {
  const positions = createPositionBuffer(count);

  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

    positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  return positions;
}

/**
 * Generate torus distribution
 * Used for particle distribution on a torus surface
 */
export function generateTorus(
  count: number,
  majorRadius: number,
  minorRadius: number
): Float32Array {
  const positions = createPositionBuffer(count);

  for (let i = 0; i < count; i++) {
    const u = (i / count) * Math.PI * 2;
    const v = (((i * 17) % count) / count) * Math.PI * 2;

    positions[i * 3 + 0] = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
    positions[i * 3 + 1] = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
    positions[i * 3 + 2] = minorRadius * Math.sin(v);
  }

  return positions;
}

/**
 * Generate random cloud distribution
 * Used for initial particle positions
 */
export function generateCloud(count: number): Float32Array {
  const positions = createPositionBuffer(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }

  return positions;
}

/**
 * Generate random seed values for particles
 */
export function generateSeedArray(count: number): Float32Array {
  const seedArray = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    seedArray[i] = Math.random();
  }
  return seedArray;
}
