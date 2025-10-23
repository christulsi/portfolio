/**
 * Global Constants for the Application
 */

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  DISABLE_THREE: 'disableThree',
} as const;

// Theme Values
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

// Breakpoints (match Tailwind defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Animation Durations (milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Toast Durations
export const TOAST_DURATIONS = {
  SHORT: 3000,
  NORMAL: 5000,
  LONG: 7000,
} as const;

// Form Validation
export const VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MIN_MESSAGE_LENGTH: 10,
  MAX_MESSAGE_LENGTH: 500,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  FORM_SUBMIT: 'https://formsubmit.co/christulsi@gmail.com',
} as const;
