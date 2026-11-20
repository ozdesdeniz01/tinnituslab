import { defineConfig } from 'astro/config';

// SITE_URL ve BASE_PATH, GitHub Actions tarafından verilir.
// Özel alan adı bağlandığında BASE_PATH "/" olur.
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
});
