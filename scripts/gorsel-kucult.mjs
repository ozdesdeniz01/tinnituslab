// Derlemeden sonra çalışır: panelden yüklenen büyük görselleri yayın klasöründe küçültür.
// Depodaki özgün dosyalara dokunmaz; yalnızca dist/gorseller içindeki kopyaları işler.
// Konum (GPS) gibi fotoğraf üstverileri de bu sırada temizlenir.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const KLASOR = path.resolve('dist/gorseller');
const EN_FAZLA_GENISLIK = 1600;
const ESIK_BAYT = 350 * 1024;

async function* dosyalar(dir) {
  let girdiler;
  try {
    girdiler = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const g of girdiler) {
    const yol = path.join(dir, g.name);
    if (g.isDirectory()) yield* dosyalar(yol);
    else yield yol;
  }
}

let islenen = 0;
for await (const yol of dosyalar(KLASOR)) {
  const uzanti = path.extname(yol).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(uzanti)) continue;
  try {
    const girdi = await fs.readFile(yol);
    const bilgi = await sharp(girdi).metadata();
    if (girdi.length <= ESIK_BAYT && (bilgi.width ?? 0) <= EN_FAZLA_GENISLIK) continue;
    let resim = sharp(girdi).rotate().resize({ width: EN_FAZLA_GENISLIK, withoutEnlargement: true });
    if (uzanti === '.png') resim = resim.png({ compressionLevel: 9, palette: true });
    else if (uzanti === '.webp') resim = resim.webp({ quality: 80 });
    else resim = resim.jpeg({ quality: 80, mozjpeg: true });
    const cikti = await resim.toBuffer();
    if (cikti.length < girdi.length) {
      await fs.writeFile(yol, cikti);
      islenen++;
      console.log(`küçültüldü: ${path.relative('dist', yol)} ${(girdi.length / 1024) | 0} KB → ${(cikti.length / 1024) | 0} KB`);
    }
  } catch (hata) {
    // Bozuk ya da desteklenmeyen bir görsel derlemeyi durdurmamalı.
    console.warn(`atlandı: ${path.relative('dist', yol)} (${hata.message})`);
  }
}
console.log(`Görsel küçültme tamamlandı. İşlenen dosya: ${islenen}`);
