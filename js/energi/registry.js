// REGISTRY modul Transformasi Energi — satu sumber kebenaran untuk 6 materi:
// builder adegan + urutan tahap + narasi (teks & suara) + label 3D + rantai energi + pose kamera.
// Template dosen: tiap AR menjawab (1) energi dari mana, (2) berubah jadi apa, (3) dipakai untuk apa.
import { makeBaterai } from '/js/energi/baterai.js?v=2';
import { makeSurya } from '/js/energi/surya.js?v=2';
import { makeMotor } from '/js/energi/motor.js?v=1';
import { makeFotosintesis } from '/js/energi/fotosintesis.js?v=3';
import { makePLTA } from '/js/energi/plta.js?v=3';
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
        title: 'Tahap 1: Energi kimia di dalam baterai',
        text: 'Baterai menyimpan energi dalam bentuk energi kimia. Coba perhatikan bagian dalamnya. Di situ ion positif dan ion negatif bergerak di antara kutub negatif dan kutub positif, melewati elektrolit.',
        sub: 'Ion hanya bergerak di dalam baterai. Bagian-bagiannya ada anoda (kutub −), pemisah, elektrolit, dan katoda (kutub +).',
      },
      {
        key: 'listrik', no: '②', btn: 'Listrik', type: 'listrik', lit: 2,
        title: 'Tahap 2: Energi kimia berubah menjadi energi listrik',
        text: 'Sekarang energi kimia tadi berubah menjadi energi listrik. Elektron mengalir lewat rangkaian di luar baterai, dari kutub negatif ke kutub positif. Aliran elektron itu disebut arus listrik, dan arus listrik inilah yang dipakai smartphone.',
        sub: 'Ingat, yang mengalir di kabel adalah elektron, bukan ion. Ionnya tetap berada di dalam baterai.',
      },
      {
        key: 'guna', no: '③', btn: 'Hasil', type: 'hasil', lit: 3,
        title: 'Tahap 3: Listrik berubah menjadi cahaya, suara, dan panas',
        text: 'Begitu sampai di HP, energi listrik berubah lagi menjadi beberapa bentuk energi. Layarnya menyala dan memancarkan cahaya, speakernya mengeluarkan suara, dan HP terasa hangat karena sebagian energi berubah menjadi panas.',
        sub: 'Jadi ada tiga hasil: cahaya dari layar, suara dari speaker, dan panas.',
      },
    ],
    labels: [
      { a: 'baterai', t: 'Baterai' },
      { a: 'hp', t: 'Smartphone' },
      { a: 'anoda', t: 'Anoda (−)', st: ['kimia'], type: 'kimia' },
      { a: 'katoda', t: 'Katoda (+)', st: ['kimia'], type: 'kimia' },
      { a: 'ion', t: 'Ion bergerak di dalam baterai', st: ['kimia'], type: 'kimia' },
      { a: 'elektron', t: 'Elektron mengalir dari (−) ke (+)', st: ['listrik', 'guna'], type: 'listrik' },
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
    make: makeSurya, autoRotate: false,   // rumah dibelah: sisi belakang tertutup
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
        title: 'Tahap 1: Energi cahaya matahari',
        text: 'Matahari memancarkan energi cahaya, yang disebut juga radiasi. Sinarnya sampai ke panel surya yang terpasang di atap rumah.',
        sub: 'Jadi, energi awalnya berasal dari cahaya matahari, sumber energi yang tidak pernah habis.',
      },
      {
        key: 'listrik', no: '②', btn: 'Listrik', type: 'listrik', lit: 2,
        title: 'Tahap 2: Panel surya menghasilkan listrik',
        text: 'Panel surya mengubah energi cahaya matahari menjadi energi listrik. Setelah itu, listriknya mengalir lewat kabel ke peralatan di dalam rumah.',
        sub: 'Coba lihat panelnya berkilau saat mengubah energi, lalu perhatikan arus yang mengalir di kabel.',
      },
      {
        key: 'alat', no: '③', btn: 'Alat', type: 'hasil', lit: 3,
        title: 'Tahap 3: Peralatan rumah menyala satu per satu',
        text: 'Di dalam rumah, listrik itu dipakai oleh peralatan dan berubah lagi bentuknya. Lampu mengubahnya menjadi cahaya, kipas angin menjadi gerak, dan setrika menjadi panas.',
        sub: 'Dinding rumahnya sengaja dibuka supaya kamu bisa melihat lampu, kipas, dan setrika di dalamnya.',
      },
    ],
    labels: [
      { a: 'matahari', t: 'Matahari' },
      { a: 'panel', t: 'Panel Surya' },
      { a: 'rumah', t: 'Rumah' },
      { a: 'cahaya', t: 'Energi Cahaya', st: ['cahaya', 'listrik', 'alat'], type: 'cahaya' },
      { a: 'listrik', t: 'Energi Listrik', st: ['listrik'], type: 'listrik' },
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
        title: 'Tahap 1: Energi kimia dalam bensin',
        text: 'Bensin di dalam tangki menyimpan energi kimia. Dari tangki, bensin dialirkan ke mesin kendaraan.',
        sub: 'Jadi, energi awalnya berasal dari bahan bakar, yaitu bensin yang disimpan di tangki.',
      },
      {
        key: 'panas', no: '②', btn: 'Bakar', type: 'panas', lit: 2,
        title: 'Tahap 2: Bensin dibakar menjadi energi panas',
        text: 'Di dalam mesin, bensin dibakar. Pembakaran ini melepaskan energi panas. Kamu bisa melihatnya dari nyala api di dalam silinder.',
        sub: 'Lewat pembakaran, energi kimia berubah menjadi energi panas.',
      },
      {
        key: 'mekanik', no: '③', btn: 'Mesin', type: 'mekanik', lit: 3,
        title: 'Tahap 3: Energi panas menggerakkan mesin',
        text: 'Energi panas mendorong piston sehingga bergerak naik turun. Gerakan piston memutar poros engkol, dan sekarang mesin menghasilkan energi mekanik.',
        sub: 'Coba perhatikan piston yang naik turun dan roda engkol yang berputar di dalam mesin.',
      },
      {
        key: 'kinetik', no: '④', btn: 'Melaju', type: 'kinetik', lit: 4,
        title: 'Tahap 4: Energi kinetik saat kendaraan melaju',
        text: 'Putaran mesin diteruskan ke roda, sehingga kendaraan bisa bergerak. Energi gerak seperti ini disebut energi kinetik. Namun, tidak semua energi terpakai untuk bergerak. Sebagian terbuang menjadi panas ke lingkungan dan menjadi suara kendaraan.',
        sub: 'Urutannya: energi kimia, lalu panas, lalu mekanik, dan terakhir kinetik.',
      },
    ],
    labels: [
      { a: 'tank', t: 'Tangki Bensin' },
      { a: 'mesin', t: 'Mesin' },
      { a: 'tank', t: 'Bensin: Energi Kimia', st: ['kimia'], type: 'kimia' },
      { a: 'mesin', t: 'Pembakaran: Energi Panas', st: ['panas'], type: 'panas' },
      { a: 'piston', t: 'Piston & Engkol: Energi Mekanik', st: ['mekanik', 'kinetik'], type: 'mekanik' },
      { a: 'roda', t: 'Roda berputar', st: ['kinetik'], type: 'kinetik' },
      { a: 'kinetik', t: 'Melaju: Energi Kinetik', st: ['kinetik'], type: 'kinetik' },
      { a: 'buang', t: 'Panas & suara terbuang', st: ['kinetik'], type: 'panas' },
    ],
  },

  // ============================================================ 4. FOTOSINTESIS
  fotosintesis: {
    title: 'Fotosintesis', short: 'Fotosintesis', emoji: '🌱', accent: 'proses',
    info: 'Cahaya Matahari + H₂O + CO₂ → Fotosintesis → Glukosa (Energi Kimia) + O₂ → Tumbuh',
    make: makeFotosintesis, autoRotate: false,   // batang dibelah
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
        title: 'Tahap 1: Energi cahaya matahari',
        text: 'Daun menyerap energi cahaya dari matahari. Energi cahaya inilah yang dipakai tumbuhan untuk menjalankan fotosintesis.',
        sub: 'Energi awalnya berasal dari cahaya matahari yang mengenai daun.',
      },
      {
        key: 'bahan', no: '②', btn: 'H₂O·CO₂', type: 'bahan', lit: 2,
        title: 'Tahap 2: Bahan bakunya air dan karbon dioksida',
        text: 'Akar menyerap air, lalu air itu naik ke daun. Pada saat yang sama, karbon dioksida dari udara masuk lewat daun.',
        sub: 'Batangnya sengaja dibelah supaya kelihatan. Tetesan air naik di dalam batang, dari akar sampai ke daun. Molekul CO₂ masuk ke daun dari udara.',
      },
      {
        key: 'proses', no: '③', btn: 'Proses', type: 'proses', lit: 4,
        title: 'Tahap 3: Fotosintesis menghasilkan glukosa dan oksigen',
        text: 'Di dalam daun terjadilah fotosintesis. Energi cahaya dipakai untuk mengubah air dan karbon dioksida menjadi glukosa dan oksigen. Glukosa menyimpan energi kimia untuk tumbuhan, sedangkan oksigen dilepaskan ke udara.',
        sub: 'Di sini energi cahaya berubah menjadi energi kimia dalam bentuk glukosa. Oksigennya bisa kita hirup untuk bernapas.',
      },
      {
        key: 'tumbuh', no: '④', btn: 'Tumbuh', type: 'tumbuh', lit: 5,
        title: 'Tahap 4: Energi kimia untuk tumbuh',
        text: 'Tumbuhan memakai glukosa untuk tumbuh. Batang dan daunnya bertambah besar, bunganya mekar, lalu buahnya terbentuk. Sebagian glukosa disimpan sebagai cadangan makanan.',
        sub: 'Ingat, matahari tidak langsung “memasak” buah. Buah terbentuk dari energi kimia hasil fotosintesis.',
      },
    ],
    labels: [
      { a: 'matahari', t: 'Matahari' },
      { a: 'daun', t: 'Daun' },
      { a: 'cahaya', t: 'Energi Cahaya', st: ['cahaya', 'bahan', 'proses', 'tumbuh'], type: 'cahaya' },
      { a: 'air', t: 'Air naik di dalam batang', st: ['bahan', 'proses'], type: 'bahan' },
      { a: 'co2', t: 'CO₂ masuk lewat daun', st: ['bahan', 'proses'], type: 'bahan' },
      { a: 'daun', t: 'Fotosintesis di daun', st: ['proses'], type: 'proses' },
      { a: 'glukosa', t: 'Glukosa: Energi Kimia', st: ['proses', 'tumbuh'], type: 'kimia' },
      { a: 'o2', t: 'O₂ dilepas ke udara', st: ['proses'], type: 'bahan' },
      { a: 'tumbuh', t: 'Bunga & buah terbentuk', st: ['tumbuh'], type: 'tumbuh' },
    ],
  },

  // ============================================================ 5. PLTA
  plta: {
    title: 'PLTA — Tenaga Air', short: 'PLTA', emoji: '💧', accent: 'potensial',
    info: 'PLTA → Air → Turbin → Generator → Listrik',
    make: makePLTA, autoRotate: false,   // bendungan dibelah
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
        title: 'Tahap 1: Energi potensial air di tempat tinggi',
        text: 'Air ditampung di waduk yang letaknya tinggi, di belakang bendungan. Karena berada di tempat tinggi, air itu menyimpan energi potensial gravitasi. Kalau air waduk terlalu banyak, kelebihannya dibuang lewat pelimpah di dinding bendungan, dan air ini tidak melewati turbin.',
        sub: 'Makin tinggi letak airnya, makin besar energi potensial yang disimpan.',
      },
      {
        key: 'kinetik', no: '②', btn: 'Mengalir', type: 'kinetik', lit: 2,
        title: 'Tahap 2: Energi kinetik dari air yang mengalir deras',
        text: 'Air dari waduk dialirkan turun lewat saluran di dalam bendungan. Saluran ini namanya pipa pesat. Waktu air meluncur turun dengan cepat, energi potensialnya berubah menjadi energi kinetik.',
        sub: 'Bendungannya sengaja dibelah supaya kelihatan. Air turun deras di dalam bendungan menuju turbin.',
      },
      {
        key: 'mekanik', no: '③', btn: 'Turbin', type: 'mekanik', lit: 3,
        title: 'Tahap 3: Energi mekanik dari putaran turbin',
        text: 'Air yang deras itu menabrak sudu-sudu turbin, sehingga turbin berputar. Putaran turbin ikut memutar generator. Di tahap ini, energi kinetik air berubah menjadi energi mekanik.',
        sub: 'Turbin dan generator terpasang pada satu poros, jadi keduanya berputar bersama.',
      },
      {
        key: 'listrik', no: '④', btn: 'Listrik', type: 'listrik', lit: 4,
        title: 'Tahap 4: Listrik sampai ke rumah',
        text: 'Generator mengubah energi mekanik menjadi energi listrik. Listrik itu dialirkan lewat kabel transmisi ke rumah-rumah dan fasilitas masyarakat, sampai lampunya menyala.',
        sub: 'Jadi urutan energi di PLTA: potensial, kinetik, mekanik, lalu listrik.',
      },
    ],
    labels: [
      { a: 'waduk', t: 'Waduk & Bendungan' },
      { a: 'pelimpah', t: 'Pelimpah (kelebihan air)' },
      { a: 'sungai', t: 'Sungai' },
      { a: 'turbin', t: 'Turbin' },
      { a: 'generator', t: 'Generator' },
      { a: 'rumah', t: 'Rumah' },
      { a: 'potensial', t: 'Energi Potensial (air tinggi)', st: ['potensial', 'kinetik'], type: 'potensial' },
      { a: 'pipa', t: 'Energi Kinetik (pipa pesat)', st: ['kinetik', 'mekanik', 'listrik'], type: 'kinetik' },
      { a: 'turbin', t: 'Turbin: Energi Mekanik', st: ['mekanik', 'listrik'], type: 'mekanik' },
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
        title: 'Tahap 1: Energi kimia dalam batu bara',
        text: 'PLTU memakai batu bara sebagai bahan bakar. Di dalam batu bara tersimpan energi kimia. Batu bara ini lalu dimasukkan ke ruang pembakaran.',
        sub: 'Energi awalnya berasal dari batu bara sebagai bahan bakar.',
      },
      {
        key: 'panas', no: '②', btn: 'Bakar', type: 'panas', lit: 2,
        title: 'Tahap 2: Batu bara dibakar menjadi energi panas',
        text: 'Batu bara dibakar di tungku. Energi kimianya berubah menjadi energi panas, dan panas itu memanaskan air di dalam boiler sampai mendidih.',
        sub: 'Coba lihat api di tungku dan air di boiler yang mendidih bergelembung.',
      },
      {
        key: 'uap', no: '③', btn: 'Uap', type: 'uap', lit: 3,
        title: 'Tahap 3: Air berubah menjadi uap bertekanan tinggi',
        text: 'Air yang mendidih berubah menjadi uap bertekanan tinggi. Uap itu bergerak cepat lewat pipa menuju turbin sambil membawa energi kinetik.',
        sub: 'Karena dipanaskan, air berubah wujud menjadi uap, dan tekanan uapnya sangat kuat.',
      },
      {
        key: 'mekanik', no: '④', btn: 'Turbin', type: 'mekanik', lit: 4,
        title: 'Tahap 4: Energi mekanik dari putaran turbin',
        text: 'Uap bertekanan tinggi itu mendorong sudu-sudu turbin sampai turbin berputar. Turbin lalu memutar generator. Di sini energi uap berubah menjadi energi mekanik.',
        sub: 'Caranya mirip PLTA. Bedanya, turbin di PLTU didorong oleh uap, bukan oleh air.',
      },
      {
        key: 'listrik', no: '⑤', btn: 'Listrik', type: 'listrik', lit: 5,
        title: 'Tahap 5: Listrik sampai ke rumah',
        text: 'Generator menghasilkan energi listrik. Listrik itu kemudian dialirkan lewat jaringan kabel ke rumah-rumah dan fasilitas masyarakat.',
        sub: 'Jadi urutan di PLTU: energi kimia, panas, uap, mekanik, lalu listrik.',
      },
    ],
    labels: [
      { a: 'batubara', t: 'Batu Bara' },
      { a: 'boiler', t: 'Boiler (air)' },
      { a: 'turbin', t: 'Turbin' },
      { a: 'generator', t: 'Generator' },
      { a: 'batubara', t: 'Batu Bara: Energi Kimia', st: ['kimia'], type: 'kimia' },
      { a: 'tungku', t: 'Pembakaran: Energi Panas', st: ['panas', 'uap'], type: 'panas' },
      { a: 'uap', t: 'Uap Bertekanan: Energi Kinetik', st: ['uap', 'mekanik', 'listrik'], type: 'uap' },
      { a: 'turbin', t: 'Turbin: Energi Mekanik', st: ['mekanik', 'listrik'], type: 'mekanik' },
      { a: 'listrik', t: 'Energi Listrik', st: ['listrik'], type: 'listrik' },
      { a: 'rumah', t: 'Rumah menyala', st: ['listrik'], type: 'listrik' },
    ],
  },
};

export function getMateri(slug) {
  return MATERI[slug] ? slug : 'baterai';
}
