// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const strapiUrl = new URL(env.STRAPI_URL || 'http://localhost:1337');

// https://astro.build/config
export default defineConfig({
  site: env.SITE_URL || 'https://example.com',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // Utility pages that should not be indexed.
      filter: (page) => !/\/(404|style-guide)\/?$/.test(page),
    }),
  ],
  image: {
    remotePatterns: [{ protocol: strapiUrl.protocol.replace(':', ''), hostname: strapiUrl.hostname }],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
