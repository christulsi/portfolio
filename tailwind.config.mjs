/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'],
      },
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#60a5fa',
        },
        secondary: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
        },
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'wave': 'wave 10s ease-in-out infinite',
        'ripple': 'ripple 0.6s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'fade-in-up-1': 'fadeInUp 0.6s ease-out 0.1s both',
        'fade-in-up-2': 'fadeInUp 0.6s ease-out 0.2s both',
        'fade-in-up-3': 'fadeInUp 0.6s ease-out 0.3s both',
        'fade-in-up-4': 'fadeInUp 0.6s ease-out 0.4s both',
        'fade-in-up-5': 'fadeInUp 0.6s ease-out 0.5s both',
        'fade-in-up-6': 'fadeInUp 0.6s ease-out 0.6s both',
        'fade-in-up-7': 'fadeInUp 0.6s ease-out 0.7s both',
        'fade-in-up-8': 'fadeInUp 0.6s ease-out 0.8s both',
        'fade-in-up-9': 'fadeInUp 0.6s ease-out 0.9s both',
        'fade-in-up-10': 'fadeInUp 0.6s ease-out 1.0s both',
        'fade-in-up-11': 'fadeInUp 0.6s ease-out 1.1s both',
        'fade-in-up-12': 'fadeInUp 0.6s ease-out 1.2s both',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' },
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
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
