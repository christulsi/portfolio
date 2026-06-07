import { afterEach, describe, expect, it, vi } from 'vitest';

import { MAX_NODE_COUNT } from './constants';
import {
  calculateScrollProgress,
  clamp,
  getCurrentTheme,
  isDataSaverEnabled,
  lerp,
  pickNodeCount,
  prefersReducedMotion,
  shouldEnablePointer,
} from './utils';

function define(obj: object, prop: string, value: unknown): void {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

function defaultMatchMedia(query: string) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
}

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  window.matchMedia = defaultMatchMedia as unknown as typeof window.matchMedia;
  vi.restoreAllMocks();
});

describe('clamp', () => {
  it('returns a value already within range', () => expect(clamp(5, 0, 10)).toBe(5));
  it('clamps below the minimum', () => expect(clamp(-3, 0, 10)).toBe(0));
  it('clamps above the maximum', () => expect(clamp(42, 0, 10)).toBe(10));
});

describe('lerp', () => {
  it('interpolates the midpoint', () => expect(lerp(0, 10, 0.5)).toBe(5));
  it('returns the start at t=0', () => expect(lerp(4, 20, 0)).toBe(4));
  it('returns the end at t=1', () => expect(lerp(4, 20, 1)).toBe(20));
});

describe('getCurrentTheme', () => {
  it('returns dark when data-theme is dark', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    expect(getCurrentTheme()).toBe('dark');
  });
  it('defaults to light otherwise', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    expect(getCurrentTheme()).toBe('light');
  });
  it('defaults to light when unset', () => {
    expect(getCurrentTheme()).toBe('light');
  });
});

describe('calculateScrollProgress', () => {
  it('returns 0 when the page is not scrollable', () => {
    define(document.documentElement, 'scrollHeight', 800);
    define(document.documentElement, 'clientHeight', 800);
    define(window, 'scrollY', 0);
    expect(calculateScrollProgress()).toBe(0);
  });
  it('computes the scrolled fraction', () => {
    define(document.documentElement, 'scrollHeight', 2000);
    define(document.documentElement, 'clientHeight', 1000);
    define(window, 'scrollY', 500);
    expect(calculateScrollProgress()).toBeCloseTo(0.5);
  });
  it('clamps to 1 past the bottom', () => {
    define(document.documentElement, 'scrollHeight', 2000);
    define(document.documentElement, 'clientHeight', 1000);
    define(window, 'scrollY', 99999);
    expect(calculateScrollProgress()).toBe(1);
  });
});

describe('pickNodeCount', () => {
  it('caps at MAX_NODE_COUNT on large screens', () => {
    define(window, 'innerWidth', 1440);
    define(navigator, 'deviceMemory', undefined);
    expect(pickNodeCount()).toBe(MAX_NODE_COUNT);
  });
  it('scales down on mid-size screens', () => {
    define(window, 'innerWidth', 1000);
    define(navigator, 'deviceMemory', undefined);
    expect(pickNodeCount()).toBe(130);
  });
  it('scales down on small screens', () => {
    define(window, 'innerWidth', 720);
    define(navigator, 'deviceMemory', undefined);
    expect(pickNodeCount()).toBe(95);
  });
  it('reduces further on low-memory devices', () => {
    define(window, 'innerWidth', 1440);
    define(navigator, 'deviceMemory', 4);
    expect(pickNodeCount()).toBe(Math.round(MAX_NODE_COUNT * 0.7));
  });
});

describe('prefersReducedMotion', () => {
  it('is false by default', () => expect(prefersReducedMotion()).toBe(false));
  it('is true when the media query matches', () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    expect(prefersReducedMotion()).toBe(true);
  });
});

describe('isDataSaverEnabled', () => {
  it('is false without a connection hint', () => {
    define(navigator, 'connection', undefined);
    expect(isDataSaverEnabled()).toBe(false);
  });
  it('is true when saveData is set', () => {
    define(navigator, 'connection', { saveData: true });
    expect(isDataSaverEnabled()).toBe(true);
  });
});

describe('shouldEnablePointer', () => {
  it('is false under data-saver', () => {
    define(navigator, 'connection', { saveData: true });
    expect(shouldEnablePointer()).toBe(false);
  });
  it('is true with a fine pointer and no data-saver', () => {
    define(navigator, 'connection', undefined);
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    expect(shouldEnablePointer()).toBe(true);
  });
});
