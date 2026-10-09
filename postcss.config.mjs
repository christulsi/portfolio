/**
 * PostCSS config — Tailwind CSS v4 via @tailwindcss/postcss. The Tailwind entry
 * (@import 'tailwindcss/index.css') and @config live in src/styles/global.css.
 * v4 includes autoprefixing + nesting, so no separate autoprefixer is needed.
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
