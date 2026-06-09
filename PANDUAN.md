# AR Medan Magnet — Panduan

Web AR (image tracking) yang menampilkan garis medan magnet dengan **partikel
mengalir** dari kutub **N → S**, muncul saat kamera HP diarahkan ke foto magnet.

Stack: **MindAR** (image tracking di browser) + **A-Frame / Three.js**. Semua via
CDN, tidak perlu install apa pun.

## Isi proyek
```
index.html                  halaman AR
field-lines.js              garis medan + partikel mengalir
targets.mind                target hasil compile foto  (LANGKAH 1 — belum ada)
photo_2026-06-09_22-04-47.jpg   foto sumber untuk dicetak / dijadikan target
```

## Langkah 1 — Compile foto jadi target `targets.mind`
1. Buka **MindAR Image Targets Compiler**:
   https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. Upload `photo_2026-06-09_22-04-47.jpg`.
3. Klik **Start**, lalu **Download** → ganti namanya jadi `targets.mind`
   dan taruh di folder ini (sebelah `index.html`).

> Foto ini berlatar putih polos, jadi "fitur" untuk dilacak agak sedikit.
> Agar tracking stabil: **crop** supaya magnetnya memenuhi gambar, dan saat
> dipakai **cetak/tampilkan cukup besar** dengan pencahayaan merata.

## Langkah 2 — Tes di HP (kamera wajib HTTPS)
Pilih salah satu:

- **ngrok** (paling cepat):
  ```bash
  npx serve .          # jalankan server lokal di port 3000
  npx ngrok http 3000  # dapat URL https://... -> buka di HP
  ```
- atau langsung deploy ke GitHub Pages (Langkah 3) lalu buka linknya di HP.

Arahkan kamera ke foto tercetak → partikel mengalir di sepanjang garis medan.

## Langkah 3 — Deploy ke GitHub Pages
```bash
git init
git add .
git commit -m "AR medan magnet"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```
Lalu di GitHub: **Settings → Pages → Source: Deploy from a branch → main / root**.
Beberapa menit kemudian situs aktif di `https://<user>.github.io/<repo>/`.

### Custom domain
1. Buat file bernama **`CNAME`** (tanpa ekstensi) di root, isinya domainmu saja, misal:
   ```
   ar.domainku.com
   ```
2. Di pengelola DNS domainmu, tambah record:
   - **CNAME** `ar` → `<user>.github.io`  (untuk subdomain), atau
   - **A** record apex → IP GitHub Pages (`185.199.108.153` dst).
3. Di **Settings → Pages → Custom domain**, isi domainmu & centang **Enforce HTTPS**.

## Menyesuaikan tampilan
Semua bisa diatur lewat atribut di `index.html`:
```html
<a-entity magnetic-field="particleSpeed: 0.12; seedsPerPole: 16; density: 0.05; showMagnets: true"></a-entity>
```
- `particleSpeed` — kecepatan aliran partikel (satuan-dunia per detik, seragam semua garis)
- `seedsPerPole`  — jumlah garis medan per kutub N (makin banyak = medan makin "padat")
- `density`       — jarak antar partikel (makin kecil = partikel makin rapat)
- `showMagnets`   — tampilkan/sembunyikan balok magnet 3D
- `poleZ`         — ketinggian magnet di atas foto

Garis medan dihitung otomatis dari posisi kutub (field-line tracing), jadi tak perlu
menggambar lengkungan manual. Kalau posisi magnet belum pas dengan foto, ubah angka
`sx`/`nx` di array `magnets` dalam `field-lines.js` (satuan relatif lebar foto: x dari
-0.5 sampai 0.5).
