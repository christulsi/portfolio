/**
 * Theme Management Utilities
 */

import { STORAGE_KEYS, THEMES } from './constants';
import { getStorageItem, setStorageItem } from './storage';

export type Theme = typeof THEMES.LIGHT | typeof THEMES.DARK;

/**
 * Get the default theme based on localStorage or system preference
 */
export function getDefaultTheme(): Theme {
  // Check localStorage first
  const stored = getStorageItem(STORAGE_KEYS.THEME);
  if (stored === THEMES.LIGHT || stored === THEMES.DARK) {
    return stored;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEMES.DARK;
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return THEMES.LIGHT;
  }

  // Default fallback
  return THEMES.LIGHT;
}

/**
 * Get the current theme from the document
 */
export function getCurrentTheme(): Theme {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
}

/**
 * Set the theme on the document and persist to localStorage
 */
export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  setStorageItem(STORAGE_KEYS.THEME, theme);
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): Theme {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  setTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme on page load (prevents FOUC - Flash of Unstyled Content)
 * This should be called as early as possible in the page lifecycle
 */
export function initializeTheme(): Theme {
  const theme = getDefaultTheme();
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}

/**
 * Watch for theme changes from other tabs/windows
 */
export function watchThemeChanges(callback: (theme: Theme) => void): () => void {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.THEME && e.newValue) {
      const newTheme = e.newValue as Theme;
      document.documentElement.setAttribute('data-theme', newTheme);
      callback(newTheme);
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}

/**
 * Check if user prefers dark mode (system preference)
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
