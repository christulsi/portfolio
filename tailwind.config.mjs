/** @type {import('tailwindcss').Config} */

// Colors are CSS variables (RGB channels) defined per theme in Layout.astro, so
// one utility like `bg-surface` works in both light and dark mode and still
// supports opacity modifiers (`bg-surface/80`).
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['class', '[data-theme="dark"]'],
  // `.container` is defined in Layout.astro; Tailwind's own container utility
  // would override its max-width from the later utilities layer.
  corePlugins: {
    container: false,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Archivo',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        sunken: token('sunken'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        link: token('link'),
        gold: token('gold'),
        'on-gold': token('on-gold'),
        forest: token('forest'),
        'on-forest': token('on-forest'),
      },
      borderRadius: {
        tile: '1.75rem',
      },
    },
  },
  plugins: [],
};
