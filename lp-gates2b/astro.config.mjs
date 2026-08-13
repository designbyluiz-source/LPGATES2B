import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// ATENÇÃO: trocar por o domínio final antes de publicar.
// `site` alimenta o canonical, o Open Graph e o sitemap.
const SITE = 'https://gates2b.com';

export default defineConfig({
  site: SITE,
  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Um único arquivo de CSS/JS por página evita cascata de requisições.
      cssCodeSplit: false,
    },
  },

  build: {
    // O CSS é injetado no HTML em vez de virar uma requisição bloqueante.
    // A página é única, então não há nada para reaproveitar entre navegações —
    // inline elimina um round-trip do caminho crítico de renderização.
    inlineStylesheets: 'always',
  },

  compressHTML: true,

  prefetch: false,
});
