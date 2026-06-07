/**
 * PostCSS config — wires Tailwind 3 + Autoprefixer directly, replacing the
 * deprecated @astrojs/tailwind integration (which does not support Astro 6).
 * Tailwind reads tailwind.config.mjs automatically.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
