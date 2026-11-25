import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://uibms.github.io',
  base: process.env.SITE_BASE || '/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  outDir: './dist',
  markdown: { syntaxHighlight: false }
});
