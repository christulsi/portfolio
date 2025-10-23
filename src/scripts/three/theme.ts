import { COLOR_SCHEMES } from './constants';
import type { ColorScheme, ColorState } from './types';
import { getCurrentTheme } from './utils';

/**
 * Get color scheme for the current theme
 */
export function getColorScheme(theme?: 'light' | 'dark'): ColorScheme {
  const currentTheme = theme || getCurrentTheme();
  return COLOR_SCHEMES[currentTheme] || COLOR_SCHEMES.light;
}

/**
 * Initialize color state with current theme colors
 */
export function initializeColorState(): ColorState {
  const initialColors = getColorScheme();

  return {
    targetColorA: initialColors.a.clone(),
    targetColorB: initialColors.b.clone(),
    currentColorA: initialColors.a.clone(),
    currentColorB: initialColors.b.clone(),
  };
}

/**
 * Update target colors based on theme change
 */
export function updateThemeColors(colorState: ColorState): void {
  const theme = getCurrentTheme();
  const newColors = getColorScheme(theme);

  colorState.targetColorA.copy(newColors.a);
  colorState.targetColorB.copy(newColors.b);
}

/**
 * Smoothly lerp current colors towards target colors
 */
export function lerpColors(colorState: ColorState, lerpSpeed: number): void {
  colorState.currentColorA.lerp(colorState.targetColorA, lerpSpeed);
  colorState.currentColorB.lerp(colorState.targetColorB, lerpSpeed);
}

/**
 * Watch for theme changes and update colors accordingly
 */
export function watchThemeChanges(colorState: ColorState, callback: () => void): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        updateThemeColors(colorState);
        callback();
      }
    });
  });

  observer.observe(document.documentElement, { attributes: true });

  return observer;
}
