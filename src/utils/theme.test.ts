import { describe, it, expect, beforeEach } from 'vitest';

import { THEMES } from './constants';
import {
  getCurrentTheme,
  setTheme,
  toggleTheme,
  initializeTheme,
  prefersDarkMode,
  prefersReducedMotion,
} from './theme';

describe('Theme Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('getCurrentTheme', () => {
    it('should return light theme by default', () => {
      expect(getCurrentTheme()).toBe(THEMES.LIGHT);
    });

    it('should return dark theme when set', () => {
      document.documentElement.setAttribute('data-theme', THEMES.DARK);
      expect(getCurrentTheme()).toBe(THEMES.DARK);
    });
  });

  describe('setTheme', () => {
    it('should set theme on document and localStorage', () => {
      setTheme(THEMES.DARK);
      expect(document.documentElement.getAttribute('data-theme')).toBe(THEMES.DARK);
      expect(localStorage.getItem('theme')).toBe(THEMES.DARK);
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      document.documentElement.setAttribute('data-theme', THEMES.LIGHT);
      const newTheme = toggleTheme();
      expect(newTheme).toBe(THEMES.DARK);
      expect(getCurrentTheme()).toBe(THEMES.DARK);
    });

    it('should toggle from dark to light', () => {
      document.documentElement.setAttribute('data-theme', THEMES.DARK);
      const newTheme = toggleTheme();
      expect(newTheme).toBe(THEMES.LIGHT);
      expect(getCurrentTheme()).toBe(THEMES.LIGHT);
    });
  });

  describe('initializeTheme', () => {
    it('should initialize theme from localStorage', () => {
      localStorage.setItem('theme', THEMES.DARK);
      const theme = initializeTheme();
      expect(theme).toBe(THEMES.DARK);
      expect(document.documentElement.getAttribute('data-theme')).toBe(THEMES.DARK);
    });

    it('should default to light theme if no preference', () => {
      const theme = initializeTheme();
      expect(theme).toBe(THEMES.LIGHT);
    });
  });

  describe('prefersDarkMode', () => {
    it('should return false by default', () => {
      expect(prefersDarkMode()).toBe(false);
    });
  });

  describe('prefersReducedMotion', () => {
    it('should return false by default', () => {
      expect(prefersReducedMotion()).toBe(false);
    });
  });
});
