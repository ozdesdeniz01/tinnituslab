import site from '../data/site.json';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Site içi bağlantı üretir: u('/blog/') */
export const u = (path = '/') => base + path;

export const slugOf = (file) => file.split('/').pop().replace(/\.md$/, '');

export const tarih = (d) =>
  new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

export const bilgiYazilari = () =>
  Object.values(import.meta.glob('../icerik/bilgi/*.md', { eager: true }))
    .map((m) => ({ ...m.frontmatter, slug: slugOf(m.file), Content: m.Content }))
    .sort((a, b) => (a.sira ?? 99) - (b.sira ?? 99));

export const blogYazilari = () =>
  Object.values(import.meta.glob('../icerik/blog/*.md', { eager: true }))
    .map((m) => ({ ...m.frontmatter, slug: slugOf(m.file), Content: m.Content }))
    .sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

export { site };
