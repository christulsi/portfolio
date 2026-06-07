// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import compress from 'astro-compress';

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
      SVG: true
    })
  ],
  output: 'static',
  site: 'https://christulsi.github.io', // GitHub Pages user/org root
  base: '/portfolio', // Use the repo subpath for GitHub Pages deployment
  prefetch: true, // Enable built-in prefetch (replaces @astrojs/prefetch)

  build: {
    inlineStylesheets: 'auto'
  },
  compressHTML: true,
  vite: {
    build: {
      cssMinify: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    }
  }
});
