/**
 * PostCSS config — Tailwind CSS v4 via @tailwindcss/postcss. The Tailwind entry
 * (@import "tailwindcss") and @config live in Layout.astro's global style block.
 * v4 includes autoprefixing + nesting, so no separate autoprefixer is needed.
 */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
