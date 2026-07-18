import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sddobservatory.com',
  // compressHTML strips newlines between inline elements, gluing words to
  // adjacent links/tags ("source onGitHub"). The bytes aren't worth it.
  compressHTML: false,
  integrations: [sitemap()],
});
