/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        // Editorial display serif — high-contrast, characterful (hero + section titles).
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        // Neutral workhorse grotesque for body + UI.
        sans: [
          '"Hanken Grotesk"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        // Technical voice — kickers, labels, data readouts, the terminal panel.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        // Themed via CSS variables (see Layout.astro). Channel triplets let
        // Tailwind's <alpha-value> opacity modifiers keep working
        // (e.g. bg-primary/20, border-primary/30).
        primary: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          dark: 'rgb(var(--accent-strong) / <alpha-value>)',
          light: 'rgb(var(--accent-light) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--accent-2) / <alpha-value>)',
          light: 'rgb(var(--accent-2-light) / <alpha-value>)',
        },
        ink: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--text-muted) / <alpha-value>)',
        canvas: 'rgb(var(--bg) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          raised: 'rgb(var(--surface-2) / <alpha-value>)',
        },
        hairline: 'rgb(var(--border) / <alpha-value>)',
      },
      letterSpacing: {
        kicker: '0.28em',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 2s ease-in-out infinite',
        ripple: 'ripple 0.6s ease-out',
        shake: 'shake 0.4s ease-in-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        blink: 'blink 1.1s steps(1) infinite',
        'sweep-down': 'sweepDown 9s ease-in-out infinite',
        'scan-line': 'scanLine 6s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(22px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '50.01%, 100%': { opacity: '0' },
        },
        sweepDown: {
          '0%, 100%': { transform: 'translateY(-6%)' },
          '50%': { transform: 'translateY(6%)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
};
