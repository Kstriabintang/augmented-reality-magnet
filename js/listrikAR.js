// AR rangkaian listrik — dua mode (bebas/markerless & marker/MindAR) + ALUR TRANSFORMASI ENERGI.
// Permintaan dosen (2026-08-24): perjalanan energi bertahap & interaktif —
//   ① Energi Kimia   : baterai cutaway, reaksi kimia terlihat
//   ② Aliran Listrik : elektron bergerak DI DALAM kabel dari kutub − ke +, lampu menyala saat elektron tiba
//   ③ Transformasi   : lampu terang penuh — Energi Kimia → Energi Listrik → Energi Cahaya
import * as THREE from 'three';
import { makeCircuit } from '/js/circuit3d.js?v=2';
import { MindARThree } from '/vendor/mindar/mindar-image-three.prod.js';

const MARKER_SRC = '/listrik/ar/listrik.mind?v=1'; // naikkan ?v bila .mind dikompilasi ulang

const stage = document.getElementById('stage');
const mstage = document.getElementById('mstage');
const video = document.getElementById('cam');
const perm = document.getElementById('perm');
const hintEl = document.getElementById('hint');
const btnFree = document.getElementById('btnfree');
const btnMarker = document.getElementById('btnmarker');
const btnReset = document.getElementById('reset');
const btnSnap = document.getElementById('snap');
const stBtns = [...document.querySelectorAll('.stbtn')];
const narEl = document.getElementById('narasi');
const narTitle = document.getElementById('nartitle');
const narText = document.getElementById('nartext');
const narSub = document.getElementById('narsub');
const narSpeak = document.getElementById('narspeak');
const narClose = document.getElementById('narclose');

const HINT = {
  bebas: 'Seret memutar · cubit zoom · <b>ketuk layar</b> untuk memulai perjalanan energi',
  cari: 'Arahkan kamera ke <b>Kartu Listrik</b> sampai terdeteksi',
  dapat: 'Kartu terdeteksi! <b>Ketuk layar</b> atau pilih tahap ① ② ③',
};
function setHint(html) { hintEl.innerHTML = html; }

let mode = 'bebas'; // 'bebas' | 'marker'

// ================= ALUR TRANSFORMASI ENERGI (3 tahap dosen) =================
const STAGES = {
  kimia: {
    title: '① Energi Kimia — di dalam baterai',
    text: '“Baterai menyimpan energi dalam bentuk energi kimia. Ketika baterai digunakan, reaksi kimia di dalamnya membuat elektron dapat bergerak.”',
    sub: 'Lihat ke dalam baterai: Anoda (−) melepaskan elektron · Katoda (+) menerima elektron · Elektrolit mengalirkan ion.',
  },
  listrik: {
    title: '② Energi Kimia → Energi Listrik',
    text: '“Energi kimia dalam baterai diubah menjadi energi listrik. Energi listrik digunakan untuk menggerakkan elektron dalam rangkaian.”',
    sub: 'Perhatikan kabelnya: elektron (bola biru bercahaya) bergerak dari kutub − menuju kutub +. Saat elektron sampai di lampu… lampu mulai menyala!',
  },
  transformasi: {
    title: '③ Energi Listrik → Energi Cahaya',
    text: '“Ketika energi listrik sampai pada lampu, energi tersebut diubah menjadi energi cahaya. Akibatnya, lampu menyala.”',
    sub: 'Energi Kimia → Energi Listrik → Energi Cahaya. (Sebagian kecil energi juga berubah menjadi energi panas.)',
  },
};
const ORDER = [null, 'kimia', 'listrik', 'transformasi'];
let curStage = null;

// narasi suara (Web Speech, id-ID) — bisa dibisukan, tersimpan
const NARKEY = 'adindautami-nar';
let narOn = true;
try { narOn = (localStorage.getItem(NARKEY) ?? '1') === '1'; } catch (e) { }
function speak(txt) {
  if (!narOn || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt.replace(/[“”]/g, ''));
    u.lang = 'id-ID'; u.rate = 0.95;
    speechSynthesis.speak(u);
  } catch (e) { }
}
function renderSpeakBtn() { narSpeak.classList.toggle('off', !narOn); }
narSpeak.addEventListener('click', () => {
  narOn = !narOn;
  try { localStorage.setItem(NARKEY, narOn ? '1' : '0'); } catch (e) { }
  renderSpeakBtn();
  if (narOn && curStage) speak(STAGES[curStage].text);
  else { try { speechSynthesis.cancel(); } catch (e) { } }
});
narClose.addEventListener('click', () => { narEl.classList.remove('show'); });

function setStage(s) {
  curStage = s;
  circuit.setStage(s);
  if (circuitM) circuitM.setStage(s);
  document.body.dataset.stage = s || '';
  stBtns.forEach(b => b.classList.toggle('on', b.dataset.stage === s));
  if (s) {
    const d = STAGES[s];
    narTitle.textContent = d.title;
    narText.textContent = d.text;
    narSub.textContent = d.sub;
    narEl.classList.add('show');
    hintEl.style.display = 'none';
    speak(d.text);
  } else {
    narEl.classList.remove('show');
    hintEl.style.display = '';
    setHint(mode === 'marker' ? (markerFound ? HINT.dapat : HINT.cari) : HINT.bebas);
    try { speechSynthesis.cancel(); } catch (e) { }
  }
}
function advanceStage() { setStage(ORDER[(ORDER.indexOf(curStage) + 1) % ORDER.length]); }
stBtns.forEach(b => b.addEventListener('click', () => setStage(curStage === b.dataset.stage ? null : b.dataset.stage)));

// ================= MODE BEBAS (markerless) =================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 0, 5);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, .75));
const dir = new THREE.DirectionalLight(0xffffff, 1.15); dir.position.set(3, 6, 4); scene.add(dir);
const dir2 = new THREE.DirectionalLight(0xbcd4ff, .4); dir2.position.set(-4, 2, -2); scene.add(dir2);

const circuit = makeCircuit();
const holder = new THREE.Group();
holder.add(circuit.group);
// sudut awal: dari atas-depan serong (rx positif = sisi atas papan menghadap kamera)
const HOME = { scale: 0.46, rot: [0.5, 0.55, 0], pos: [0, 0.1, 0] };
holder.scale.setScalar(HOME.scale);
holder.rotation.set(...HOME.rot);
holder.position.set(...HOME.pos);
scene.add(holder);

// ---------- kamera perangkat (mode bebas) ----------
async function startCam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    video.srcObject = stream; await video.play();
    if (perm) perm.style.display = 'none';
  } catch (e) {
    if (perm) { perm.style.display = ''; perm.innerHTML = '<b>Kamera tidak bisa dibuka.</b><br>Izinkan akses kamera, lalu muat ulang halaman.'; }
  }
}

// ---------- interaksi bebas: seret putar, cubit zoom, ketuk = tahap berikutnya ----------
let pts = new Map(), last = null, pinchD = 0, moved = 0, downT = 0;
function pd(e) { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 1) { last = { x: e.clientX, y: e.clientY }; moved = 0; downT = performance.now(); } if (pts.size === 2) pinchD = dist(); }
function pm(e) {
  if (!pts.has(e.pointerId)) return;
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pts.size === 1 && last) {
    const dx = e.clientX - last.x, dy = e.clientY - last.y; moved += Math.abs(dx) + Math.abs(dy);
    holder.rotation.y += dx * 0.008; holder.rotation.x += dy * 0.008;
    holder.rotation.x = Math.max(-1.2, Math.min(1.2, holder.rotation.x));
    last = { x: e.clientX, y: e.clientY };
  } else if (pts.size === 2) {
    const d = dist(); if (pinchD) { const s = holder.scale.x * (d / pinchD); holder.scale.setScalar(Math.max(0.25, Math.min(1.6, s))); } pinchD = d; moved += 10;
  }
}
function pu(e) {
  const wasTap = pts.size === 1 && moved < 8 && (performance.now() - downT) < 400;
  pts.delete(e.pointerId); if (pts.size < 2) pinchD = 0; if (pts.size === 0) last = null;
  if (wasTap) advanceStage();
}
function dist() { const a = [...pts.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }
stage.addEventListener('pointerdown', pd); stage.addEventListener('pointermove', pm);
stage.addEventListener('pointerup', pu); stage.addEventListener('pointercancel', pu);

// ================= MODE MARKER (MindAR image-tracking) =================
let mindar = null, circuitM = null, markerHolder = null, markerFound = false, markerFail = false;
const clockM = new THREE.Clock();
let bobT = 0, popK = 1, baseScale = 1;

function initMarker() {
  mindar = new MindARThree({
    container: mstage,
    imageTargetSrc: MARKER_SRC,
    uiScanning: false,
    uiLoading: false,
    maxTrack: 1,
  });
  // vendor: resize() cek this.video tapi TIDAK cek this.controller, dan listener
  // resize-nya didaftarkan internal (tak bisa dibungkus) → resize yang datang di
  // sela start() (mis. rotasi HP saat memuat) melempar error tak berbahaya. Redam.
  addEventListener('error', (e) => {
    if (e.message && e.message.indexOf('getProjectionMatrix') !== -1) e.preventDefault();
  });
  const ms = mindar.scene;
  ms.add(new THREE.HemisphereLight(0xffffff, 0x8393a7, 1.2));
  const md = new THREE.DirectionalLight(0xffffff, 1.2); md.position.set(1.2, 2.4, 1.6); ms.add(md);

  circuitM = makeCircuit();
  if (curStage) circuitM.setStage(curStage);
  markerHolder = new THREE.Group();
  markerHolder.add(circuitM.group);
  // pas-kan lebar rangkaian ke lebar kartu (marker MindAR lebarnya 1 unit)
  const bb = new THREE.Box3().setFromObject(circuitM.group);
  const size = bb.getSize(new THREE.Vector3());
  baseScale = 0.92 / Math.max(size.x, 0.001);
  markerHolder.scale.setScalar(baseScale);
  const center = bb.getCenter(new THREE.Vector3());
  circuitM.group.position.sub(center); // pusatkan di tengah kartu
  markerHolder.position.set(0, 0, 0.3); // melayang keluar dari kartu

  const anchor = mindar.addAnchor(0);
  anchor.group.add(markerHolder);
  anchor.onTargetFound = () => {
    if (mode !== 'marker') return;
    markerFound = true; popK = 0; // pop-in kecil
    document.body.classList.add('found');
    if (!curStage) setHint(HINT.dapat);
  };
  anchor.onTargetLost = () => {
    if (mode !== 'marker') return;
    markerFound = false;
    document.body.classList.remove('found');
    if (!curStage) setHint(HINT.cari);
  };
}

// Paksa video+kanvas MindAR menutupi layar (cover) — anti letterbox iOS Safari.
function coverEl(elm) {
  if (!elm) return;
  const s = elm.style;
  s.setProperty('position', 'absolute', 'important');
  s.setProperty('top', '0', 'important'); s.setProperty('left', '0', 'important');
  s.setProperty('width', '100%', 'important'); s.setProperty('height', '100%', 'important');
  s.setProperty('object-fit', 'cover', 'important');
  s.setProperty('margin', '0', 'important'); s.setProperty('transform', 'none', 'important');
}
function sizeMarker() { if (!mindar) return; coverEl(mindar.video); coverEl(mindar.renderer && mindar.renderer.domElement); }
addEventListener('resize', () => { if (mode === 'marker') sizeMarker(); });
addEventListener('orientationchange', () => setTimeout(() => { if (mode === 'marker') sizeMarker(); }, 250));

function markerLoop() {
  const dt = clockM.getDelta();
  circuitM.update(dt);
  bobT += dt;
  if (popK < 1) popK = Math.min(1, popK + dt * 2.4);
  const pop = 1 - Math.pow(1 - popK, 3); // ease-out
  markerHolder.scale.setScalar(baseScale * (0.6 + 0.4 * pop));
  markerHolder.position.z = 0.3 + Math.sin(bobT * 1.5) * 0.03;
  mindar.renderer.render(mindar.scene, mindar.camera);
}
async function startMarker() {
  setHint('Memuat marker…');
  initMarker();
  try {
    await mindar.start();
  } catch (e) {
    markerFail = true;
    setHint('Kamera tidak bisa dibuka — izinkan akses kamera lalu muat ulang.');
    return;
  }
  markerFail = false;
  sizeMarker(); setTimeout(sizeMarker, 300); setTimeout(sizeMarker, 900);
  clockM.getDelta();
  mindar.renderer.setAnimationLoop(markerLoop);
  if (!curStage) setHint(markerFound ? HINT.dapat : HINT.cari);
}

// ketuk di mode marker = tahap berikutnya
let mDown = null;
mstage.addEventListener('pointerdown', e => { mDown = { x: e.clientX, y: e.clientY, t: performance.now() }; });
mstage.addEventListener('pointerup', e => {
  if (!mDown) return;
  const dm = Math.hypot(e.clientX - mDown.x, e.clientY - mDown.y);
  if (dm < 10 && performance.now() - mDown.t < 450) advanceStage();
  mDown = null;
});

// ================= GANTI MODE =================
function activeCircuit() { return mode === 'marker' ? circuitM : circuit; }
function setMode(m) {
  if (mode === m) return;
  // MindAR tidak dirancang untuk stop/start berulang dalam satu halaman (controller +
  // konteks WebGL tfjs menumpuk lalu deteksi macet) — ganti mode = navigasi penuh ke
  // deep-link mode (URL beda → muat ulang bersih, tanpa race hash+reload).
  location.href = m === 'marker' ? location.pathname + '?mode=marker' : location.pathname;
}
btnFree.addEventListener('click', () => setMode('bebas'));
btnMarker.addEventListener('click', () => setMode('marker'));

// ================= UI BERSAMA =================
btnReset.addEventListener('click', () => {
  holder.rotation.set(...HOME.rot); holder.scale.setScalar(HOME.scale); holder.position.set(...HOME.pos);
});

// jepret foto (video + kanvas 3D, sesuai mode aktif)
btnSnap.addEventListener('click', () => {
  const w = innerWidth, h = innerHeight;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
  const v = mode === 'marker' ? (mindar && mindar.video) : video;
  if (v && v.videoWidth) {
    const s = Math.max(w / v.videoWidth, h / v.videoHeight);
    const dw = v.videoWidth * s, dh = v.videoHeight * s;
    ctx.drawImage(v, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }
  if (mode === 'marker' && mindar) {
    mindar.renderer.render(mindar.scene, mindar.camera);
    ctx.drawImage(mindar.renderer.domElement, 0, 0, w, h);
  } else {
    renderer.render(scene, camera);
    ctx.drawImage(renderer.domElement, 0, 0, w, h);
  }
  const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = 'transformasi-energi-ar.png'; a.click();
});

// tema (untuk chrome overlay)
const KEY = 'adindautami-theme';
try { document.documentElement.setAttribute('data-theme', localStorage.getItem(KEY) || 'terang'); } catch (e) { }

// ---------- resize + loop mode bebas ----------
function resize() { const w = stage.clientWidth, h = stage.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); }
resize(); addEventListener('resize', resize);
const clock = new THREE.Clock();
function tick() { requestAnimationFrame(tick); if (mode === 'bebas') { circuit.update(clock.getDelta()); renderer.render(scene, camera); } }
tick();

// status utk QA headless / diagnosis di perangkat
window.__AR = {
  get mode() { return mode; }, get found() { return markerFound; }, get fail() { return markerFail; },
  get stage() { return curStage; },
  get lit() { const c = activeCircuit(); return c ? c.lit : 0; },
  get proc() { return !!(mindar && mindar.controller && mindar.controller.processingVideo); },
  get pose() { return { rx: +holder.rotation.x.toFixed(3), ry: +holder.rotation.y.toFixed(3), s: +holder.scale.x.toFixed(3) }; },
  get mindar() { return mindar; },
};

// mulai — mode ditentukan deep-link (?mode=marker, atau #marker dari QR kartu)
renderSpeakBtn();
if (new URLSearchParams(location.search).get('mode') === 'marker' || location.hash === '#marker') {
  mode = 'marker';
  document.body.dataset.mode = 'marker';
  btnFree.classList.remove('on');
  btnMarker.classList.add('on');
  if (perm) perm.style.display = 'none';
  startMarker();
} else {
  document.body.dataset.mode = 'bebas';
  setHint(HINT.bebas);
  startCam();
}
