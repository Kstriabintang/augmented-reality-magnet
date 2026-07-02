# Panduan Pengembangan

Catatan teknis untuk mengembangkan/memodifikasi proyek ini. Dokumentasi umum ada di [README.md](./README.md).

## Arsitektur singkat

```
index.html      UI (menu pembuka, tombol mode, scan-hint), scene A-Frame + MindAR, pencahayaan
field-lines.js  Komponen <a-entity magnetic-field>: fisika medan, garis, partikel, panah, label, mode A/B/C
targets.mind    Target image-tracking (hasil kompilasi photo_*.jpg)
og-image.jpg    Gambar pratinjau link (Open Graph)
```

Alur: pengguna memilih mode di **menu pembuka** → kamera AR baru dinyalakan →
MindAR mengenali marker → komponen `magnetic-field` menampilkan konten 3D.
Ganti mode memicu `setMode()` → geometri dibangun ulang dengan transisi cross-fade.

## Parameter komponen `magnetic-field`

Diatur lewat atribut di `index.html`, contoh:

```html
<a-entity magnetic-field="mode: B; rotateSpeed: 10; seedsPerPole: 18"></a-entity>
```

| Parameter | Default | Arti |
|---|---|---|
| `mode` | `B` | Konfigurasi kutub awal: `A` tunggal, `B` N–S (tarik), `C` N–N (tolak) |
| `showMagnets` | `true` | Tampilkan balok magnet 3D |
| `showLabels` | `true` | Tampilkan judul & label callout |
| `autoRotate` | `true` | Putar otomatis (selain drag manual) |
| `rotateSpeed` | `10` | Kecepatan putar (derajat/detik) |
| `lift` | `0.11` | Tinggi melayang di atas marker |
| `particleSpeed` | `0.12` | Kecepatan partikel (satuan-dunia/detik, seragam semua garis) |
| `arrowSpeed` | `0.38` | Kecepatan kepala panah berjalan sepanjang garis |
| `seedsPerPole` | `14` | Jumlah garis medan per kutub N — ditabur di bidang kartu agar pola seperti diagram foto |
| `density` | `0.05` | Jarak antar partikel (lebih kecil = lebih rapat) |

Posisi/tanda kutub tiap mode didefinisikan di `_modeConfig()` dalam `field-lines.js`
(koordinat relatif lebar marker: x dari -0.5 sampai 0.5).

## Mengganti gambar marker

1. Kompilasi gambar baru di MindAR Image Targets Compiler:
   https://hiukim.github.io/mind-ar-js-doc/tools/compile
2. Unduh hasilnya, ganti `targets.mind`.
3. Ganti pula file foto marker + referensinya di README.

Tips marker yang baik: penuh detail/tekstur, kontras tinggi, hindari area kosong luas.

## Menjalankan lokal & tes di HP

```bash
npx serve .            # perhatikan port yang tercetak (bisa berbeda bila 3000 terpakai)
cloudflared tunnel --url http://localhost:PORT   # kamera HP butuh HTTPS
```

Buka URL `https://...` dari tunnel di HP. Desktop tanpa webcam hanya menampilkan UI.

## Deploy

Repo ini punya **beberapa materi AR** dalam satu situs (lihat struktur di root repo).
Materi ini disajikan di `https://adindautami.web.id/dinda/`. Halaman hub (daftar
materi) ada di `index.html` **root repo**.

File `CNAME`, `.nojekyll`, dan `404.html` berada di **root repo** (bukan folder ini) —
karena GitHub Pages menyajikan situs dari root. **Jangan pindahkan/hapus** ketiganya.

Deploy cukup:

```bash
git add -A && git commit -m "..." && git push
```

Pages membangun ulang otomatis (~1 menit).
