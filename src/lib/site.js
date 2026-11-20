import fs from 'node:fs';
import hamSite from '../data/site.json';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Site içi bağlantı üretir: u('/yazilar/') */
export const u = (path = '/') => base + path;

/**
 * Site ayarları. Kontrol paneli boş bırakılan alanları dosyadan silebildiği için
 * eksik alanlar burada varsayılan değerlerle tamamlanır; böylece derleme hata vermez.
 */
const varsayilan = {
  ad: 'TinnitusLab',
  aciklama: '',
  tema: 'mor',
  uzman: { ad: '', unvan: '', foto: '', fotoAciklama: '', kisaOzgecmis: '', ozgecmis: '', scholar: '' },
  iletisim: { telefon: '', eposta: '', adres: '', calismaSaatleri: '' },
  formAnahtari: '',
  sosyal: { instagram: '', youtube: '', linkedin: '' },
};
const temiz = (v) => (v === null || v === undefined ? '' : v);
const birlestir = (d, v) =>
  Object.fromEntries(
    Object.entries(d).map(([k, dv]) =>
      typeof dv === 'object' ? [k, birlestir(dv, v?.[k] ?? {})] : [k, temiz(v?.[k]) || dv]
    )
  );
export const site = birlestir(varsayilan, hamSite ?? {});

/** Dosya adından adres parçası üretir; Türkçe harfleri ve boşlukları düzeltir. */
const harf = { ı: 'i', İ: 'i', ş: 's', Ş: 's', ğ: 'g', Ğ: 'g', ü: 'u', Ü: 'u', ö: 'o', Ö: 'o', ç: 'c', Ç: 'c', â: 'a', î: 'i', û: 'u' };
export const slugOf = (file) =>
  file
    .split('/')
    .pop()
    .replace(/\.md$/, '')
    .replace(/[ıİşŞğĞüÜöÖçÇâîû]/g, (h) => harf[h])
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'yazi';

const gecerliTarih = (d) => {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t;
};

/** 20 Kasım 2026 biçiminde tarih; geçersiz tarihte boş döner. */
export const tarih = (d) => {
  const t = gecerliTarih(d);
  return t ? t.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
};

/** 2026-11-20 biçiminde tarih; geçersiz tarihte boş döner. */
export const isoTarih = (d) => {
  const t = gecerliTarih(d);
  return t ? t.toISOString().slice(0, 10) : '';
};

/** Panelden gelen dosya yolunu site içi adrese çevirir. */
export const dosyaYolu = (y) => {
  if (!y || typeof y !== 'string') return '';
  if (/^https?:\/\//.test(y)) return y;
  return '/' + y.replace(/^\/+/, '').replace(/^public\//, '');
};
const liste = (v) => (Array.isArray(v) ? v : v ? [v] : []).map(dosyaYolu).filter(Boolean);

export const dosyaAdi = (y) => decodeURIComponent(y.split('/').pop() || y);

export const bilgiYazilari = () =>
  Object.values(import.meta.glob('../icerik/bilgi/*.md', { eager: true }))
    .map((m) => {
      const f = m.frontmatter ?? {};
      const slug = slugOf(m.file);
      return {
        ...f,
        slug,
        baslik: f.baslik || slug,
        ozet: f.ozet || '',
        kaynaklar: Array.isArray(f.kaynaklar) ? f.kaynaklar.filter(Boolean) : [],
        Content: m.Content,
      };
    })
    .sort((a, b) => (Number(a.sira) || 99) - (Number(b.sira) || 99));

export const notlar = () =>
  Object.values(import.meta.glob('../icerik/notlar/*.md', { eager: true }))
    .map((m) => {
      const f = m.frontmatter ?? {};
      const slug = slugOf(m.file);
      return {
        ...f,
        slug,
        baslik: f.baslik || slug,
        ozet: f.ozet || '',
        tarih: gecerliTarih(f.tarih),
        kapak: dosyaYolu(f.kapak),
        kapakAciklama: f.kapakAciklama || '',
        ekler: liste(f.ekler),
        Content: m.Content,
      };
    })
    .filter((y) => y.taslak !== true)
    .sort((a, b) => (b.tarih?.getTime() ?? 0) - (a.tarih?.getTime() ?? 0));

/** Paylaşım görseli: kapak görseli, yoksa yazıya özel görsel, o da yoksa genel görsel. */
export const paylasimGorseli = (slug, kapak) =>
  kapak || (fs.existsSync(`${process.cwd()}/public/og/${slug}.png`) ? `/og/${slug}.png` : '/og.png');
