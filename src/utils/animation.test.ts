import { describe, it, expect } from 'vitest';

import { lerp, clamp, mapRange, easing } from './animation';

describe('Animation Utilities', () => {
  describe('lerp', () => {
    it('should linearly interpolate between two values', () => {
      expect(lerp(0, 100, 0)).toBe(0);
      expect(lerp(0, 100, 0.5)).toBe(50);
      expect(lerp(0, 100, 1)).toBe(100);
    });

    it('should handle negative values', () => {
      expect(lerp(-100, 100, 0.5)).toBe(0);
    });
  });

  describe('clamp', () => {
    it('should clamp value between min and max', () => {
      expect(clamp(50, 0, 100)).toBe(50);
      expect(clamp(-10, 0, 100)).toBe(0);
      expect(clamp(150, 0, 100)).toBe(100);
    });

    it('should handle negative ranges', () => {
      expect(clamp(0, -10, 10)).toBe(0);
      expect(clamp(-20, -10, 10)).toBe(-10);
      expect(clamp(20, -10, 10)).toBe(10);
    });
  });

  describe('mapRange', () => {
    it('should map value from one range to another', () => {
      expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
      expect(mapRange(0, 0, 10, 0, 100)).toBe(0);
      expect(mapRange(10, 0, 10, 0, 100)).toBe(100);
    });

    it('should handle inverse ranges', () => {
      expect(mapRange(5, 0, 10, 100, 0)).toBe(50);
    });
  });

  describe('easing functions', () => {
    it('should handle linear easing', () => {
      expect(easing.linear(0)).toBe(0);
      expect(easing.linear(0.5)).toBe(0.5);
      expect(easing.linear(1)).toBe(1);
    });

    it('should handle quadratic easing', () => {
      expect(easing.easeInQuad(0)).toBe(0);
      expect(easing.easeInQuad(0.5)).toBe(0.25);
      expect(easing.easeInQuad(1)).toBe(1);
    });

    it('should handle cubic easing', () => {
      expect(easing.easeInCubic(0)).toBe(0);
      expect(easing.easeInCubic(0.5)).toBe(0.125);
      expect(easing.easeInCubic(1)).toBe(1);
    });

    it('should handle all easing functions at boundaries', () => {
      Object.values(easing).forEach((easingFn) => {
        expect(easingFn(0)).toBeCloseTo(0, 5);
        expect(easingFn(1)).toBeCloseTo(1, 5);
      });
    });
  });
});
