<h1 align="center">🧲 AR Edukasi 3D — Medan Magnet</h1>

<p align="center">
  <b>Media ajar berbasis Augmented Reality — memvisualisasikan medan magnet & konsep sains dalam 3D, langsung dari browser HP tanpa instal aplikasi.</b>
</p>

<p align="center">
  <a href="https://adindautami.web.id/"><b>🚀 Buka Situs AR</b></a> &nbsp;·&nbsp;
  <a href="#-media-3d-untuk-assemblr-edu"><b>📦 Unduh Model 3D (.glb)</b></a>
</p>

<p align="center">
  <img alt="A-Frame" src="https://img.shields.io/badge/A--Frame-1.5-ef2d5e">
  <img alt="MindAR"  src="https://img.shields.io/badge/MindAR-image%20tracking-1f8fff">
  <img alt="Three.js" src="https://img.shields.io/badge/Three.js-3D-000000">
  <img alt="WebAR"   src="https://img.shields.io/badge/WebAR-tanpa%20instal%20app-22c55e">
  <img alt="Lisensi" src="https://img.shields.io/badge/Lisensi-MIT-blue">
  <a href="https://adindautami.web.id/"><img alt="Live" src="https://img.shields.io/badge/status-live-brightgreen"></a>
</p>

<p align="center">
  <img src="./dinda/assemblr/preview/magnet-3d.png" alt="Visualisasi medan magnet 3D" width="80%">
  <br><sub><i>Medan magnet batang divisualisasikan sebagai garis medan 3D — kutub Utara (merah) → Selatan (biru).</i></sub>
</p>

---

## 📑 Daftar Isi

- [Tentang](#tentang)
- [Materi tersedia](#materi-tersedia)
- [Visualisasi Medan Magnet](#-visualisasi-medan-magnet)
- [Media 3D untuk Assemblr EDU](#-media-3d-untuk-assemblr-edu)
- [Cara pakai (AR di HP)](#-cara-pakai-ar-di-hp)
- [Fisika singkat](#-fisika-singkat)
- [Struktur repo](#-struktur-repo)
- [Lisensi](#lisensi)

## Tentang

Proyek ini adalah **kumpulan media pembelajaran Augmented Reality** untuk pelajaran sains. Materi
utama adalah **Medan Magnet**: pengguna memindai sebuah **marker cetak**, lalu muncul magnet batang
3D beserta **garis-garis medan** yang dihitung dari fisika sungguhan (*field-line tracing* dari kutub),
langsung di atas kartu. Cocok untuk presentasi, praktikum, dan tugas kuliah.

## Materi tersedia

| Materi | Status | Buka | Lokasi |
|---|---|---|---|
| 🧲 **Medan Magnet** | ✅ Aktif | [`adindautami.web.id/dinda`](https://adindautami.web.id/dinda/) | [`dinda/`](./dinda/) (repo ini) |
| 🕰️ **Bandul (Pendulum)** | ✅ Aktif | [`chensqy.my.id`](https://chensqy.my.id/) | repo terpisah [`Kstriabintang/chensqy`](https://github.com/Kstriabintang/chensqy) |

> Halaman **hub** (daftar materi) ada di [`index.html`](./index.html). Bandul punya repo & domainnya
> sendiri karena GitHub Pages membatasi **1 repo = 1 domain kustom**.

## 🧲 Visualisasi Medan Magnet

Tiga konfigurasi kutub yang bisa diganti saat AR berjalan — garis medan dihitung otomatis dari
tanda kutub, jadi efek **tarik** & **tolak** muncul apa adanya sesuai fisika:

<table>
<tr>
  <td width="33%" align="center"><img src="./dinda/assemblr/preview/magnet-tunggal.png" alt="Magnet tunggal"></td>
  <td width="33%" align="center"><img src="./dinda/assemblr/preview/magnet-tarik.png" alt="Tarik-menarik"></td>
  <td width="33%" align="center"><img src="./dinda/assemblr/preview/magnet-tolak.png" alt="Tolak-menolak"></td>
</tr>
<tr>
  <td align="center"><b>Magnet Tunggal</b><br><sub>dipol batang — garis N → S</sub></td>
  <td align="center"><b>Tarik-menarik (N–S)</b><br><sub>garis menyambung antar magnet</sub></td>
  <td align="center"><b>Tolak-menolak (N–N)</b><br><sub>garis memancar menjauhi celah</sub></td>
</tr>
</table>

**Konvensi warna:** kutub **Utara = merah**, **Selatan = biru**. Garis medan selalu keluar dari **N**
dan masuk ke **S**; butiran mengalir menunjukkan arah medan.

## 📦 Media 3D untuk Assemblr EDU

Model 3D siap-pakai (`.glb`, sudah beranimasi aliran medan) untuk di-**import ke Assemblr EDU** atau
platform AR/3D lain. Tinggal unduh dan upload:

| Model | Konsep | Unduh |
|---|---|---|
| 🧲 **Magnet Tunggal** | Dipol batang + garis medan 3D | [`magnet-tunggal.glb`](./dinda/assemblr/magnet-tunggal.glb) |
| 🧲🧲 **Tarik-menarik** | Dua magnet N–S berhadapan | [`magnet-tarik.glb`](./dinda/assemblr/magnet-tarik.glb) |
| 🧲🧲 **Tolak-menolak** | Dua magnet N–N berhadapan | [`magnet-tolak.glb`](./dinda/assemblr/magnet-tolak.glb) |

> **Cara di Assemblr EDU:** *Add Object → Import 3D Model* → pilih file `.glb` → pada panel **Animation**
> pilih klip `MedanMagnet` → aktifkan **loop/autoplay**. Model tampil tegak (Y-up) dan siap diskalakan.

## 📱 Cara pakai (AR di HP)

1. **Cetak marker** dari folder [`dinda/`](./dinda/) (mis. `photo_2026-06-09_22-04-47.jpg`) — cetak / tempel di karton.
2. Buka [**situs AR**](https://adindautami.web.id/dinda/) di **browser HP** (Chrome/Safari), izinkan kamera.
3. Pilih mode di menu pembuka → arahkan kamera ke marker → magnet 3D + garis medan muncul.
4. Gerakkan HP mengelilingi marker untuk melihat dari berbagai sudut.

> Kamera web butuh **HTTPS** — otomatis aktif di GitHub Pages. Detail teknis di [`dinda/PANDUAN.md`](./dinda/PANDUAN.md).

## 🔬 Fisika singkat

Garis medan magnet **selalu membentuk lintasan tertutup**: keluar dari kutub **Utara (N)**, melengkung
di luar magnet, lalu masuk ke kutub **Selatan (S)**, dan menyambung di dalam magnet.

- **Kutub sejenis** (N–N atau S–S) → **tolak-menolak**; garis medan saling menjauh, ada titik netral.
- **Kutub tak sejenis** (N–S) → **tarik-menarik**; garis medan menyambung dari satu magnet ke magnet lain.
- Kerapatan garis ∝ **kuat medan** — makin rapat garis, makin kuat medannya (dekat kutub).

## 🗂️ Struktur repo

```
/                     ← publishing root GitHub Pages
├── index.html        HUB: daftar materi AR
├── CNAME .nojekyll 404.html   wajib di root (GitHub Pages)
├── favicon*, og-image.jpg
└── dinda/            AR Medan Magnet
    ├── index.html          scene A-Frame + MindAR
    ├── field-lines.js      komponen garis medan (field-line tracing, Three.js)
    ├── targets.mind        target image-tracking
    ├── PANDUAN.md          dokumentasi teknis
    ├── vendor/             A-Frame + MindAR (self-hosted)
    └── assemblr/           📦 model 3D .glb untuk Assemblr EDU + preview
```

> **Menambah materi baru:** buat folder baru di root berisi `index.html` + aset AR-nya sendiri
> (A-Frame + MindAR, path relatif `./`), lalu tambahkan kartu di `index.html` root. Materi yang butuh
> domain sendiri → buat repo terpisah (1 repo = 1 domain), seperti Bandul.

## Lisensi

[MIT](./LICENSE) © **Ksatria Bintang Samudra**
