/**
 * Animation Utilities
 */

/**
 * Create an Intersection Observer for scroll animations
 */
export function createScrollObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Observe elements for fade-in animation
 */
export function observeFadeIn(
  options?: IntersectionObserverInit,
  selector: string = '.fade-in'
): IntersectionObserver {
  const observer = createScrollObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Stop observing after visible
      }
    });
  }, options);

  // Observe all matching elements
  document.querySelectorAll(selector).forEach((el) => observer.observe(el));

  return observer;
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Easing functions
 */
/* eslint-disable no-plusplus, no-param-reassign */
export const easing = {
  linear: (t: number): number => t,

  easeInQuad: (t: number): number => t * t,

  easeOutQuad: (t: number): number => t * (2 - t),

  easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  easeInCubic: (t: number): number => t * t * t,

  easeOutCubic: (t: number): number => {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  },

  easeInOutCubic: (t: number): number => {
    if (t < 0.5) {
      return 4 * t * t * t;
    }
    const t1 = t - 1;
    const t2 = 2 * t - 2;
    return t1 * t2 * t2 + 1;
  },

  easeInQuart: (t: number): number => t * t * t * t,

  easeOutQuart: (t: number): number => {
    const t1 = t - 1;
    return 1 - t1 * t1 * t1 * t1;
  },

  easeInOutQuart: (t: number): number => {
    if (t < 0.5) {
      return 8 * t * t * t * t;
    }
    const t1 = t - 1;
    return 1 - 8 * t1 * t1 * t1 * t1;
  },

  easeInQuint: (t: number): number => t * t * t * t * t,

  easeOutQuint: (t: number): number => {
    const t1 = t - 1;
    return 1 + t1 * t1 * t1 * t1 * t1;
  },

  easeInOutQuint: (t: number): number => {
    if (t < 0.5) {
      return 16 * t * t * t * t * t;
    }
    const t1 = t - 1;
    return 1 + 16 * t1 * t1 * t1 * t1 * t1;
  },
} as const;
/* eslint-enable no-plusplus, no-param-reassign */

/**
 * Animate a value over time with easing
 */
export function animate({
  from,
  to,
  duration,
  easing: easingFn = easing.easeInOutQuad,
  onUpdate,
  onComplete,
}: {
  from: number;
  to: number;
  duration: number;
  easing?: (t: number) => number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}): () => void {
  const startTime = performance.now();
  let rafId: number;

  function step(currentTime: number): void {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFn(progress);
    const currentValue = lerp(from, to, easedProgress);

    onUpdate(currentValue);

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  }

  rafId = requestAnimationFrame(step);

  // Return cancel function
  return () => cancelAnimationFrame(rafId);
}

/**
 * Wait for next animation frame
 */
export function nextFrame(): Promise<number> {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

/**
 * Wait for a specified duration
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
