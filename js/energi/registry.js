// REGISTRY modul Transformasi Energi — satu sumber kebenaran untuk 6 materi:
// builder adegan + urutan tahap + narasi (teks & suara) + label 3D + rantai energi + pose kamera.
// Template dosen: tiap AR menjawab (1) energi dari mana, (2) berubah jadi apa, (3) dipakai untuk apa.
import { makeBaterai } from '/js/energi/baterai.js?v=1';
import { makeSurya } from '/js/energi/surya.js?v=1';
import { makeMotor } from '/js/energi/motor.js?v=1';
import { makeFotosintesis } from '/js/energi/fotosintesis.js?v=1';
import { makePLTA } from '/js/energi/plta.js?v=1';
import { makePLTU } from '/js/energi/pltu.js?v=1';

// warna per BENTUK ENERGI (konsisten di tombol tahap, pill rantai, dan label 3D)
export const ETYPE = {
  kimia: ['#8af0b4', '#22a758', '#062d16'],
  listrik: ['#ffc655', '#f59e0b', '#4a2c00'],
  cahaya: ['#fff3b0', '#ffd23e', '#4a3a00'],
  panas: ['#ffb199', '#ef4444', '#ffffff'],
  mekanik: ['#c4b5fd', '#8b5cf6', '#ffffff'],
  kinetik: ['#7fd0ff', '#2f6fd0', '#ffffff'],
  potensial: ['#67e8f9', '#0891b2', '#ffffff'],
  uap: ['#e2e8f0', '#94a3b8', '#16233d'],
  hasil: ['#f9a8d0', '#ec4899', '#ffffff'],
  proses: ['#86efac', '#16a34a', '#ffffff'],
  tumbuh: ['#d9f99d', '#65a30d', '#1a2e05'],
  bahan: ['#a5f3fc', '#06b6d4', '#083344'],
};

// ikon stroke (isi <svg viewBox="0 0 24 24">)
export const ICON = {
  kimia: '<path d="M9 3h6M10 3v5l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V3"/>',
  listrik: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>',
  cahaya: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.7.6 1.1 1.3 1.3 2.1h4.4c.2-.8.6-1.5 1.3-2.1A6 6 0 0 0 12 3z"/>',
  panas: '<path d="M12 3c1.5 3-3.5 4.6-3.5 8.7a3.5 3.5 0 0 0 7 0C15.5 8.4 13.4 6.4 12 3z"/><path d="M12 21a4.6 4.6 0 0 1-4.6-4.6"/>',
  mekanik: '<circle cx="12" cy="12" r="3.4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>',
  kinetik: '<path d="M3 7h9M3 12h13M3 17h9M17 8l4 4-4 4"/>',
  potensial: '<path d="M3 17l5.5-9 4 6.5L15.5 11l5.5 6H3z"/><path d="M4 20h16"/>',
  uap: '<path d="M7 18h9a4 4 0 0 0 .8-7.9A5.5 5.5 0 0 0 6.2 9.7 3.5 3.5 0 0 0 7 18z"/>',
  hasil: '<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/>',
  proses: '<path d="M6 21c0-9 4-14 13-15-1 9-5 13-13 15z"/><path d="M6 21c3-5 6-8 9-10"/>',
  tumbuh: '<path d="M12 21v-7"/><path d="M12 14c0-4-3-6.5-7-6.5 0 4.5 3 7.5 7 6.5z"/><path d="M12 14c0-4 3-6.5 7-6.5 0 4.5-3 7.5-7 6.5z"/>',
  bahan: '<path d="M12 3s5.5 6.2 5.5 10a5.5 5.5 0 0 1-11 0C6.5 9.2 12 3 12 3z"/>',
};

export const ORDER = ['baterai', 'surya', 'motor', 'fotosintesis', 'plta', 'pltu'];

export const MATERI = {
  // ============================================================ 1. BATERAI → SMARTPHONE
  baterai: {
    title: 'Baterai → Smartphone', short: 'Baterai & HP', emoji: '🔋', accent: 'listrik',
    info: 'Baterai → Energi Kimia → Energi Listrik → Smartphone (layar + suara + panas)',
    make: makeBaterai,
    home: { s: .42, rot: [.42, .35, 0], y: .05 },
    cam: { pos: [4.6, 3.4, 5.6], tgt: [0, .7, 0] },
    chain: [
      { t: 'kimia', l: 'Kimia' },
      { t: 'listrik', l: 'Listrik' },
      { t: 'hasil', l: 'Cahaya·Suara·Panas' },
    ],
    stages: [
      {
        key: 'kimia', no: '①', btn: 'Kimia', type: 'kimia', lit: 1,
        title: '① Energi Kimia — di dalam baterai',
        text: 'Baterai menyimpan energi dalam bentuk energi kimia. Di dalamnya, ion positif dan ion negatif bergerak di antara kutub negatif dan kutub positif melewati elektrolit.',
        sub: 'Ion bergerak di bagian DALAM baterai (internal): anoda (−) · pemisah · elektrolit · katoda (+).',
      },
      {
        key: 'listrik', no: '②', btn: 'Listrik', type: 'listrik', lit: 2,
        title: '② Energi Kimia → Energi Listrik',
        text: 'Energi kimia berubah menjadi energi listrik. Elektron mengalir melalui rangkaian luar, dari kutub negatif menuju kutub positif. Aliran elektron inilah arus listrik yang digunakan smartphone.',
        sub: 'Yang mengalir di kabel (rangkaian LUAR) adalah ELEKTRON — bukan ion. Ion tetap di dalam baterai.',
      },
      {
        key: 'guna', no: '③', btn: 'Hasil', type: 'hasil', lit: 3,
        title: '③ Energi Listrik → Cahaya + Suara + Panas',
        text: 'Listrik yang sampai di smartphone berubah lagi menjadi beberapa bentuk energi: layar menyala menghasilkan cahaya, speaker mengeluarkan suara, dan perangkat menjadi hangat karena sebagian energi berubah menjadi panas.',
        sub: 'Satu aliran listrik → tiga hasil: cahaya (layar) · suara (speaker) · panas (perangkat).',
      },
    ],
    labels: [
      { a: 'baterai', t: 'Baterai' },
      { a: 'hp', t: 'Smartphone' },
      { a: 'anoda', t: 'Anoda (−)', st: ['kimia'], type: 'kimia' },
      { a: 'katoda', t: 'Katoda (+)', st: ['kimia'], type: 'kimia' },
      { a: 'ion', t: 'Ion bergerak di DALAM baterai', st: ['kimia'], type: 'kimia' },
      { a: 'elektron', t: 'Elektron − → + (rangkaian luar)', st: ['listrik', 'guna'], type: 'listrik' },
      { a: 'listrik', t: 'Energi Listrik', st: ['listrik'], type: 'listrik' },
      { a: 'layar', t: 'Layar → Cahaya', st: ['guna'], type: 'cahaya' },
      { a: 'suara', t: 'Speaker → Suara', st: ['guna'], type: 'hasil' },
      { a: 'panas', t: 'Panas', st: ['guna'], type: 'panas' },
    ],
  },

  // ============================================================ 2. PANEL SURYA → RUMAH
  surya: {
    title: 'Panel Surya → Rumah', short: 'Panel Surya', emoji: '☀️', accent: 'cahaya',
    info: 'Cahaya Matahari → Panel Surya → Energi Listrik → Peralatan Rumah',
    make: makeSurya,
    home: { s: .33, rot: [.3, .25, 0], y: -.3 },
    cam: { pos: [4.8, 3.6, 6.0], tgt: [0, 1.0, 0] },
    chain: [
      { t: 'cahaya', l: 'Cahaya' },
      { t: 'listrik', l: 'Listrik' },
      { t: 'hasil', l: 'Cahaya·Panas·Gerak' },
    ],
    stages: [
      {
        key: 'cahaya', no: '①', btn: 'Cahaya', type: 'cahaya', lit: 1,
        title: '① Energi Cahaya Matahari',
        text: 'Matahari memancarkan energi cahaya atau radiasi. Sinar matahari bergerak menuju panel surya yang terpasang di atap rumah.',
        sub: 'Energi awal berasal dari cahaya matahari — sumber energi yang tidak pernah habis.',
      },
      {
        key: 'listrik', no: '②', btn: 'Listrik', type: 'listrik', lit: 2,
        title: '② Panel Surya → Energi Listrik',
        text: 'Panel surya mengubah energi cahaya matahari menjadi energi listrik. Listrik lalu mengalir melalui kabel menuju peralatan di rumah.',
        sub: 'Perhatikan panel berkilau saat mengubah energi, lalu arus mengalir di kabel.',
      },
      {
        key: 'alat', no: '③', btn: 'Alat', type: 'hasil', lit: 3,
        title: '③ Peralatan Menyala Satu per Satu',
        text: 'Energi listrik digunakan peralatan rumah dan berubah lagi: lampu menghasilkan cahaya, kipas angin menghasilkan gerak, dan setrika menghasilkan panas.',
        sub: 'Lampu: Listrik → Cahaya · Kipas: Listrik → Gerak · Setrika: Listrik → Panas.',
      },
    ],
    labels: [
      { a: 'matahari', t: 'Matahari' },
      { a: 'panel', t: 'Panel Surya' },
      { a: 'rumah', t: 'Rumah' },
      { a: 'cahaya', t: 'Energi Cahaya', st: ['cahaya', 'listrik', 'alat'], type: 'cahaya' },
      { a: 'listrik', t: 'Energi Listrik', st: ['listrik', 'alat'], type: 'listrik' },
      { a: 'lampu', t: 'Lampu → Cahaya', st: ['alat'], type: 'cahaya' },
      { a: 'kipas', t: 'Kipas → Gerak', st: ['alat'], type: 'kinetik' },
      { a: 'setrika', t: 'Setrika → Panas', st: ['alat'], type: 'panas' },
    ],
  },

  // ============================================================ 3. KENDARAAN BERMOTOR
  motor: {
    title: 'Kendaraan: Bensin → Gerak', short: 'Kendaraan', emoji: '🚗', accent: 'panas',
    info: 'Bensin (Kimia) → Pembakaran (Panas) → Piston & Mesin (Mekanik) → Melaju (Kinetik)',
    make: makeMotor,
    home: { s: .4, rot: [.35, .5, 0], y: -.05 },
    cam: { pos: [4.6, 3.4, 5.8], tgt: [0, .6, 0] },
    chain: [
      { t: 'kimia', l: 'Kimia' },
      { t: 'panas', l: 'Panas' },
      { t: 'mekanik', l: 'Mekanik' },
      { t: 'kinetik', l: 'Kinetik' },
    ],
    stages: [
      {
        key: 'kimia', no: '①', btn: 'Bensin', type: 'kimia', lit: 1,
        title: '① Energi Kimia — bensin di tangki',
        text: 'Bensin menyimpan energi kimia. Dari tangki, bensin dialirkan menuju mesin kendaraan.',
        sub: 'Energi awal berasal dari bahan bakar (bensin) yang tersimpan di tangki.',
      },
      {
        key: 'panas', no: '②', btn: 'Bakar', type: 'panas', lit: 2,
        title: '② Pembakaran → Energi Panas',
        text: 'Di dalam mesin, bensin dibakar. Pembakaran melepaskan energi panas — terlihat dari nyala api di dalam silinder.',
        sub: 'Energi kimia berubah menjadi energi panas lewat proses pembakaran.',
      },
      {
        key: 'mekanik', no: '③', btn: 'Mesin', type: 'mekanik', lit: 3,
        title: '③ Energi Panas → Energi Mekanik',
        text: 'Energi panas mendorong piston bergerak naik turun, lalu memutar poros engkol. Mesin kini menghasilkan energi mekanik.',
        sub: 'Perhatikan piston dan roda engkol yang berputar di dalam mesin.',
      },
      {
        key: 'kinetik', no: '④', btn: 'Melaju', type: 'kinetik', lit: 4,
        title: '④ Energi Mekanik → Energi Kinetik',
        text: 'Putaran mesin diteruskan ke roda sehingga kendaraan bergerak — inilah energi kinetik. Sebagian energi terbuang menjadi panas ke lingkungan dan suara kendaraan.',
        sub: 'Urutan yang benar: kimia → panas → mekanik → kinetik. Tidak semua energi menjadi gerak: ada panas & suara yang terbuang.',
      },
    ],
    labels: [
      { a: 'tank', t: 'Tangki Bensin' },
      { a: 'mesin', t: 'Mesin' },
      { a: 'tank', t: 'Bensin — Energi Kimia', st: ['kimia'], type: 'kimia' },
      { a: 'mesin', t: 'Pembakaran → Energi Panas', st: ['panas'], type: 'panas' },
      { a: 'piston', t: 'Piston & Engkol — Energi Mekanik', st: ['mekanik', 'kinetik'], type: 'mekanik' },
      { a: 'roda', t: 'Roda berputar', st: ['kinetik'], type: 'kinetik' },
      { a: 'kinetik', t: 'Energi Kinetik — melaju!', st: ['kinetik'], type: 'kinetik' },
      { a: 'buang', t: 'Panas & suara terbuang', st: ['kinetik'], type: 'panas' },
    ],
  },

  // ============================================================ 4. FOTOSINTESIS
  fotosintesis: {
    title: 'Fotosintesis', short: 'Fotosintesis', emoji: '🌱', accent: 'proses',
    info: 'Cahaya Matahari + H₂O + CO₂ → Fotosintesis → Glukosa (Energi Kimia) + O₂ → Tumbuh',
    make: makeFotosintesis,
    home: { s: .32, rot: [.25, .3, 0], y: -.4 },
    cam: { pos: [4.6, 3.8, 6.0], tgt: [0, 1.2, 0] },
    chain: [
      { t: 'cahaya', l: 'Cahaya' },
      { t: 'bahan', l: 'H₂O + CO₂' },
      { t: 'proses', l: 'Fotosintesis' },
      { t: 'kimia', l: 'Glukosa' },
      { t: 'tumbuh', l: 'Tumbuh' },
    ],
    stages: [
      {
        key: 'cahaya', no: '①', btn: 'Cahaya', type: 'cahaya', lit: 1,
        title: '① Energi Cahaya Matahari',
        text: 'Daun menyerap energi cahaya dari matahari. Energi inilah yang menjadi sumber tenaga proses fotosintesis.',
        sub: 'Energi awal berasal dari cahaya matahari yang mengenai daun.',
      },
      {
        key: 'bahan', no: '②', btn: 'H₂O·CO₂', type: 'bahan', lit: 2,
        title: '② Bahan Baku: Air + Karbon Dioksida',
        text: 'Air diserap akar lalu naik menuju daun. Pada saat yang sama, karbon dioksida dari udara masuk melalui daun.',
        sub: 'Perhatikan tetes air naik lewat batang, dan molekul CO₂ masuk ke daun.',
      },
      {
        key: 'proses', no: '③', btn: 'Proses', type: 'proses', lit: 4,
        title: '③ Fotosintesis → Glukosa + O₂',
        text: 'Di dalam daun terjadi fotosintesis: energi cahaya dipakai mengubah air dan karbon dioksida menjadi glukosa — energi kimia yang disimpan tumbuhan — dan oksigen yang dilepaskan ke udara.',
        sub: 'Energi cahaya berubah menjadi energi kimia (glukosa). Oksigen adalah bonus untuk kita bernapas!',
      },
      {
        key: 'tumbuh', no: '④', btn: 'Tumbuh', type: 'tumbuh', lit: 5,
        title: '④ Energi Kimia → Pertumbuhan',
        text: 'Glukosa digunakan tumbuhan untuk tumbuh: batang dan daun bertambah besar, bunga mekar, dan buah terbentuk. Sebagian disimpan sebagai cadangan makanan.',
        sub: 'Matahari TIDAK langsung “memasak” buah — buah terbentuk dari energi kimia hasil fotosintesis.',
      },
    ],
    labels: [
      { a: 'matahari', t: 'Matahari' },
      { a: 'daun', t: 'Daun' },
      { a: 'cahaya', t: 'Energi Cahaya', st: ['cahaya', 'bahan', 'proses', 'tumbuh'], type: 'cahaya' },
      { a: 'air', t: 'Air (H₂O) naik dari akar', st: ['bahan', 'proses'], type: 'bahan' },
      { a: 'co2', t: 'CO₂ masuk lewat daun', st: ['bahan', 'proses'], type: 'bahan' },
      { a: 'daun', t: 'Fotosintesis di daun', st: ['proses'], type: 'proses' },
      { a: 'glukosa', t: 'Glukosa — Energi Kimia', st: ['proses', 'tumbuh'], type: 'kimia' },
      { a: 'o2', t: 'O₂ dilepas ke udara', st: ['proses'], type: 'bahan' },
      { a: 'tumbuh', t: 'Bunga & buah terbentuk', st: ['tumbuh'], type: 'tumbuh' },
    ],
  },

  // ============================================================ 5. PLTA
  plta: {
    title: 'PLTA — Tenaga Air', short: 'PLTA', emoji: '💧', accent: 'potensial',
    info: 'PLTA → Air → Turbin → Generator → Listrik',
    make: makePLTA,
    home: { s: .34, rot: [.3, .4, 0], y: -.25 },
    cam: { pos: [4.8, 3.8, 6.0], tgt: [0, .9, 0] },
    chain: [
      { t: 'potensial', l: 'Potensial' },
      { t: 'kinetik', l: 'Kinetik' },
      { t: 'mekanik', l: 'Mekanik' },
      { t: 'listrik', l: 'Listrik' },
    ],
    stages: [
      {
        key: 'potensial', no: '①', btn: 'Waduk', type: 'potensial', lit: 1,
        title: '① Energi Potensial — air di tempat tinggi',
        text: 'Air ditampung di waduk pada posisi tinggi di belakang bendungan. Karena letaknya tinggi, air menyimpan energi potensial gravitasi.',
        sub: 'Semakin tinggi air, semakin besar energi potensialnya.',
      },
      {
        key: 'kinetik', no: '②', btn: 'Mengalir', type: 'kinetik', lit: 2,
        title: '② Energi Kinetik — air mengalir deras',
        text: 'Air dialirkan turun melalui pipa pesat. Saat bergerak turun dengan cepat, energi potensial berubah menjadi energi kinetik.',
        sub: 'Perhatikan air deras di dalam pipa menuju turbin.',
      },
      {
        key: 'mekanik', no: '③', btn: 'Turbin', type: 'mekanik', lit: 3,
        title: '③ Energi Mekanik — turbin berputar',
        text: 'Air yang deras mengenai sudu-sudu turbin sehingga turbin berputar, lalu turbin memutar generator. Energi kinetik air berubah menjadi energi mekanik.',
        sub: 'Turbin dan generator berputar pada satu poros.',
      },
      {
        key: 'listrik', no: '④', btn: 'Listrik', type: 'listrik', lit: 4,
        title: '④ Energi Listrik — sampai ke rumah',
        text: 'Generator mengubah energi mekanik menjadi energi listrik. Listrik disalurkan melalui kabel transmisi sampai ke rumah dan fasilitas masyarakat — lampu pun menyala.',
        sub: 'Urutan PLTA: Potensial → Kinetik → Mekanik → Listrik.',
      },
    ],
    labels: [
      { a: 'waduk', t: 'Waduk & Bendungan' },
      { a: 'turbin', t: 'Turbin' },
      { a: 'generator', t: 'Generator' },
      { a: 'rumah', t: 'Rumah' },
      { a: 'potensial', t: 'Energi Potensial (air tinggi)', st: ['potensial', 'kinetik'], type: 'potensial' },
      { a: 'pipa', t: 'Energi Kinetik — air deras', st: ['kinetik', 'mekanik', 'listrik'], type: 'kinetik' },
      { a: 'turbin', t: 'Turbin — Energi Mekanik', st: ['mekanik', 'listrik'], type: 'mekanik' },
      { a: 'listrik', t: 'Energi Listrik', st: ['listrik'], type: 'listrik' },
      { a: 'rumah', t: 'Listrik sampai rumah', st: ['listrik'], type: 'listrik' },
    ],
  },

  // ============================================================ 6. PLTU
  pltu: {
    title: 'PLTU — Tenaga Uap', short: 'PLTU', emoji: '🏭', accent: 'uap',
    info: 'Batu Bara → Pembakaran → Uap → Turbin → Generator → Listrik',
    make: makePLTU,
    home: { s: .34, rot: [.3, .4, 0], y: -.25 },
    cam: { pos: [4.8, 3.8, 6.0], tgt: [0, 1.0, 0] },
    chain: [
      { t: 'kimia', l: 'Kimia' },
      { t: 'panas', l: 'Panas' },
      { t: 'uap', l: 'Uap' },
      { t: 'mekanik', l: 'Mekanik' },
      { t: 'listrik', l: 'Listrik' },
    ],
    stages: [
      {
        key: 'kimia', no: '①', btn: 'Batu Bara', type: 'kimia', lit: 1,
        title: '① Energi Kimia — batu bara',
        text: 'PLTU menggunakan bahan bakar batu bara. Batu bara menyimpan energi kimia, lalu dimasukkan ke ruang pembakaran.',
        sub: 'Energi awal berasal dari batu bara (bahan bakar).',
      },
      {
        key: 'panas', no: '②', btn: 'Bakar', type: 'panas', lit: 2,
        title: '② Pembakaran → Energi Panas',
        text: 'Batu bara dibakar di tungku. Energi kimia berubah menjadi energi panas yang memanaskan air di dalam boiler sampai mendidih.',
        sub: 'Perhatikan api di tungku dan air boiler yang menggelegak.',
      },
      {
        key: 'uap', no: '③', btn: 'Uap', type: 'uap', lit: 3,
        title: '③ Uap Bertekanan Tinggi',
        text: 'Air yang mendidih berubah menjadi uap bertekanan tinggi. Uap bergerak cepat melalui pipa menuju turbin — membawa energi kinetik.',
        sub: 'Air → uap: wujud berubah karena panas, tekanannya sangat kuat.',
      },
      {
        key: 'mekanik', no: '④', btn: 'Turbin', type: 'mekanik', lit: 4,
        title: '④ Energi Mekanik — turbin berputar',
        text: 'Uap bertekanan tinggi mendorong sudu-sudu turbin sehingga berputar, lalu turbin memutar generator. Energi uap berubah menjadi energi mekanik.',
        sub: 'Sama seperti PLTA — bedanya pendorongnya UAP, bukan air.',
      },
      {
        key: 'listrik', no: '⑤', btn: 'Listrik', type: 'listrik', lit: 5,
        title: '⑤ Energi Listrik — sampai ke rumah',
        text: 'Generator menghasilkan energi listrik. Listrik disalurkan melalui jaringan kabel ke rumah dan fasilitas masyarakat.',
        sub: 'Urutan PLTU: Kimia → Panas → Uap → Mekanik → Listrik.',
      },
    ],
    labels: [
      { a: 'batubara', t: 'Batu Bara' },
      { a: 'boiler', t: 'Boiler (air)' },
      { a: 'turbin', t: 'Turbin' },
      { a: 'generator', t: 'Generator' },
      { a: 'batubara', t: 'Batu Bara — Energi Kimia', st: ['kimia'], type: 'kimia' },
      { a: 'tungku', t: 'Pembakaran — Energi Panas', st: ['panas', 'uap'], type: 'panas' },
      { a: 'uap', t: 'Uap bertekanan — Energi Kinetik', st: ['uap', 'mekanik', 'listrik'], type: 'uap' },
      { a: 'turbin', t: 'Turbin — Energi Mekanik', st: ['mekanik', 'listrik'], type: 'mekanik' },
      { a: 'listrik', t: 'Energi Listrik', st: ['listrik'], type: 'listrik' },
      { a: 'rumah', t: 'Rumah menyala', st: ['listrik'], type: 'listrik' },
    ],
  },
};

export function getMateri(slug) {
  return MATERI[slug] ? slug : 'baterai';
}
