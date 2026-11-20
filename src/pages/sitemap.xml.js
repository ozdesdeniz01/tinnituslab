import { bilgiYazilari, notlar } from '../lib/site.js';

export function GET({ site }) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const yollar = [
    '/',
    '/bilgi-merkezi/',
    ...bilgiYazilari().map((y) => `/bilgi-merkezi/${y.slug}/`),
    '/sss/',
    '/kime-basvurmali/',
    '/sozluk/',
    '/ortam-sesi/',
    '/notlar/',
    ...notlar().map((y) => `/notlar/${y.slug}/`),
    '/akademik-calismalar/',
    '/hakkimizda/',
    '/iletisim/',
    '/kvkk/',
    '/tibbi-uyari/',
    '/cerez-politikasi/',
  ];
  const govde = yollar.map((y) => `  <url><loc>${new URL(base + y, site).href}</loc></url>`).join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${govde}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
}
