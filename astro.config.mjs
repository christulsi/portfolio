// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import compress from 'astro-compress';
import { visualizer } from 'rollup-plugin-visualizer';

// `npm run analyze` is a normal build plus a bundle treemap at
// bundle-stats.html. npm sets npm_lifecycle_event to the script name on
// every platform, so no cross-env shim is needed.
const analyze = process.env.npm_lifecycle_event === 'analyze';

// https://astro.build/config
// Tailwind is wired via PostCSS (postcss.config.mjs) rather than the deprecated
// @astrojs/tailwind integration, which does not support Astro 6.
export default defineConfig({
  integrations: [
    sitemap(),
    icon(),
    compress({
      CSS: true,
      HTML: true,
      Image: false,
      JavaScript: true,
      SVG: true,
    }),
  ],
  output: 'static',
  site: 'https://christulsi.github.io', // GitHub Pages user/org root
  base: '/portfolio', // Use the repo subpath for GitHub Pages deployment
  prefetch: true, // Enable built-in prefetch (replaces @astrojs/prefetch)

  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  vite: {
    plugins: analyze
      ? [
          visualizer({
            filename: 'bundle-stats.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : [],
    build: {
      cssMinify: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  },
});
