// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    sitemap(),
    partytown({
      config: {
        forward: ['dataLayer.push']
      }
    }),
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
