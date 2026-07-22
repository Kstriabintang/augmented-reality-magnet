<h1 align="center">🧲⚡ Media Ajar IPA — Magnet &amp; Listrik</h1>

<p align="center">
  <b>Media pembelajaran IPA interaktif untuk SD/SMP: medan magnet dalam WebAR 3D,
  simulasi rangkaian listrik, dan kuis bernilai otomatis — langsung dari browser HP tanpa instal aplikasi.</b>
</p>

<p align="center">
  <a href="https://utamiii.my.id/"><b>🚀 Buka Situs</b></a> &nbsp;·&nbsp;
  <a href="https://utamiii.my.id/magnet/"><b>🧲 AR Magnet</b></a> &nbsp;·&nbsp;
  <a href="https://utamiii.my.id/listrik/"><b>⚡ Rangkaian Listrik</b></a> &nbsp;·&nbsp;
  <a href="https://utamiii.my.id/kuis/"><b>📝 Kuis</b></a>
</p>

<p align="center">
  <img alt="A-Frame" src="https://img.shields.io/badge/A--Frame-1.5-ef2d5e">
  <img alt="MindAR"  src="https://img.shields.io/badge/MindAR-image%20tracking-1f8fff">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-quiz%20results-3ecf8e">
  <img alt="WebAR"   src="https://img.shields.io/badge/WebAR-tanpa%20instal%20app-22c55e">
  <img alt="Lisensi" src="https://img.shields.io/badge/Lisensi-MIT-blue">
  <a href="https://utamiii.my.id/"><img alt="Live" src="https://img.shields.io/badge/status-live-brightgreen"></a>
</p>

<p align="center">
  <img src="./assemblr/preview/magnet-3d.png" alt="Visualisasi medan magnet 3D" width="80%">
  <br><sub><i>Medan magnet batang divisualisasikan sebagai garis medan 3D — kutub Utara (merah) → Selatan (biru).</i></sub>
</p>

---

## 📑 Daftar Isi

- [Tentang](#tentang)
- [Modul](#-modul)
- [Kuis &amp; Supabase](#-kuis--supabase)
- [Media 3D untuk Assemblr EDU](#-media-3d-untuk-assemblr-edu)
- [Cara pakai (AR di HP)](#-cara-pakai-ar-di-hp)
- [Struktur repo](#-struktur-repo)
- [Lisensi](#lisensi)

## Tentang

Portal **media ajar IPA** untuk topik **Magnet** dan **Listrik**, dirancang untuk siswa SD/SMP.
Semua materi berjalan penuh di browser HP — **tanpa instal aplikasi**. Desain memakai gaya
*claymorphism* yang ramah anak dengan mode terang/gelap.

## 🧩 Modul

| Modul | Isi | Tautan |
|---|---|---|
| 🧲 **Medan Magnet (AR)** | Visualisasi garis gaya magnet 3D lewat kamera HP (A-Frame + MindAR image tracking). 3 mode kutub: tunggal, tarik-menarik (N–S), tolak-menolak (N–N). | [`/magnet/`](https://utamiii.my.id/magnet/) |
| ⚡ **Rangkaian Listrik** | Simulasi SVG interaktif: nyalakan saklar → arus mengalir dari + ke − → lampu menyala. Rangkaian terbuka vs tertutup. | [`/listrik/`](https://utamiii.my.id/listrik/) |
| 📝 **Kuis Magnet &amp; Listrik** | 20 soal pilihan ganda, nilai otomatis (maks 100), kunci &amp; pembahasan. Hasil tersimpan ke Supabase. | [`/kuis/`](https://utamiii.my.id/kuis/) |

## 📝 Kuis &amp; Supabase

Kuis menyimpan hasil (nama, kelas, sekolah, jawaban, nilai, durasi) ke tabel `hasil_kuis_utami`
di Supabase. Keamanan dijaga **Row Level Security**: siswa (anon) hanya boleh **menyimpan** (INSERT),
tidak bisa membaca data siswa lain; hanya admin yang login yang bisa membaca. `js/config.js` hanya
memuat **anon key** (aman untuk publik) — service key tidak pernah ada di repo.

## 📦 Media 3D untuk Assemblr EDU

Model 3D siap-pakai (`.glb`, sudah beranimasi aliran medan) untuk di-**import ke Assemblr EDU**:

| Model | Konsep | Unduh |
|---|---|---|
| 🧲 **Magnet Tunggal** | Dipol batang + garis medan 3D | [`magnet-tunggal.glb`](./assemblr/magnet-tunggal.glb) |
| 🧲🧲 **Tarik-menarik** | Dua magnet N–S berhadapan | [`magnet-tarik.glb`](./assemblr/magnet-tarik.glb) |
| 🧲🧲 **Tolak-menolak** | Dua magnet N–N berhadapan | [`magnet-tolak.glb`](./assemblr/magnet-tolak.glb) |

> **Cara di Assemblr EDU:** *Add Object → Import 3D Model* → pilih file `.glb` → pada panel **Animation**
> pilih klip `MedanMagnet` → aktifkan **loop/autoplay**.

## 📱 Cara pakai (AR di HP)

1. **Cetak marker** — gunakan `photo_2026-06-09_22-04-47.jpg` di repo ini; cetak / tempel di karton.
2. Buka [**situs**](https://utamiii.my.id/) di **browser HP** (Chrome/Safari), pilih **Medan Magnet (AR)**, izinkan kamera.
3. Pilih konfigurasi kutub → arahkan kamera ke marker → magnet 3D + garis medan muncul.
4. Gerakkan HP mengelilingi marker untuk melihat dari berbagai sudut.

> Kamera web butuh **HTTPS** — otomatis aktif di GitHub Pages / Cloudflare.

## 🗂️ Struktur repo

```
/                     ← publishing root (GitHub Pages), hosting via Cloudflare (utamiii.my.id)
├── index.html          hub / beranda (pilih materi)
├── magnet/index.html   AR medan magnet (A-Frame + MindAR)
├── listrik/index.html  simulasi rangkaian listrik (SVG interaktif)
├── kuis/index.html     kuis (memuat js/kuis.js)
├── js/
│   ├── kuis.js         logika kuis + simpan ke Supabase
│   ├── soal.js         20 soal + diagram SVG (bersama)
│   └── config.js       konfigurasi Supabase (anon key saja)
├── field-lines.js      komponen garis medan (Three.js) — dipakai /magnet/
├── targets.mind        target image-tracking
├── CNAME .nojekyll 404.html   wajib di root (GitHub Pages)
├── favicon*, og-image.jpg
├── vendor/             A-Frame + MindAR (self-hosted, tanpa CDN)
└── assemblr/           📦 model 3D .glb untuk Assemblr EDU + preview
```

Update situs: `git add -A && git commit -m "..." && git push` → GitHub Pages rebuild otomatis (~1 menit).

## Lisensi

[MIT](./LICENSE) © **Ksatria Bintang Samudra**
