<h1 align="center">🧭 AR Edukasi 3D</h1>

<p align="center">
  <b>Kumpulan media ajar berbasis Augmented Reality — visualisasi konsep sains dalam 3D, langsung dari browser HP tanpa instal aplikasi.</b>
</p>

<p align="center">
  <a href="https://adindautami.web.id/"><b>🚀 Buka Situs</b></a>
</p>

---

## Materi

| Materi | Status | URL | Lokasi |
|---|---|---|---|
| 🧲 **Medan Magnet** | ✅ Aktif | [`/dinda/`](https://adindautami.web.id/dinda/) | [`dinda/`](./dinda/) (repo ini) |
| 🕰️ **Bandul (Pendulum)** | ✅ Aktif | [`chensqy.my.id`](https://chensqy.my.id/) | repo terpisah [`Kstriabintang/chensqy`](https://github.com/Kstriabintang/chensqy) |

Halaman **hub** (daftar materi) ada di [`index.html`](./index.html) root. Kartu **Bandul** menautkan ke situsnya sendiri (`chensqy.my.id`) karena GitHub Pages membatasi 1 repo = 1 domain kustom.

## Struktur repo

```
/                     ← publishing root GitHub Pages
├── CNAME             domain kustom (adindautami.web.id) — HARUS di root
├── .nojekyll         nonaktifkan Jekyll — HARUS di root
├── 404.html          halaman 404 situs — HARUS di root
├── index.html        HUB: daftar materi AR
├── favicon*, og-image.jpg
└── dinda/            AR Medan Magnet (lihat dinda/PANDUAN.md)
```

> **Bandul (Pendulum)** hidup di repo & domain sendiri (`chensqy.my.id`, repo `Kstriabintang/chensqy`) karena butuh domain kustomnya sendiri. Hub hanya menautkan ke sana.

> **Penting (GitHub Pages):** situs disajikan dari **root repo**, dan 1 repo Pages = **1 domain kustom**. Karena itu `CNAME`, `.nojekyll`, dan `404.html` wajib di root — jangan dipindah ke subfolder. Setiap materi baru = 1 subfolder berisi `index.html` sendiri.

## Menambah materi AR baru

1. Buat folder baru di root (mis. `materi-baru/`).
2. Isi dengan `index.html` + aset AR-nya sendiri (A-Frame + MindAR, path relatif `./`).
3. Tambahkan kartu materi di `index.html` root.

> Kalau materi butuh **domain kustomnya sendiri**, buat **repo terpisah** (1 repo = 1 domain) dan tautkan dari hub — seperti Bandul (`chensqy.my.id`).

## Deploy

```bash
git add -A && git commit -m "..." && git push
```

GitHub Pages membangun ulang otomatis (~1 menit).

## Lisensi

[MIT](./LICENSE) © Ksatria Bintang Samudra
