// AR Transformasi Energi — DUA MODE per materi (?m=slug):
//   • Tanpa Marker (markerless): kamera + adegan melayang, seret/cubit/ketuk.
//   • Marker (?mode=marker / #marker dari QR): image-tracking MindAR ke kartu cetak
//     /energi/ar/kartu-<slug>.png (target /energi/ar/<slug>.mind).
// Ganti mode/materi = NAVIGASI URL penuh — MindAR tidak aman di-stop/start dalam satu halaman.
import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { MindARThree } from '/vendor/mindar/mindar-image-three.prod.js';
import { MATERI, ORDER, getMateri } from '/js/energi/registry.js?v=2';
import { buildStages, buildChain, buildChips, buildLabels, makeNarator } from '/js/energi/ui.js?v=2';

const qs = new URLSearchParams(location.search);
const slug = getMateri(qs.get('m'));
const materi = MATERI[slug];
const mode = (qs.get('mode') === 'marker' || location.hash === '#marker') ? 'marker' : 'bebas';
document.title = `AR ${materi.title} — Transformasi Energi | adindautami`;
document.body.dataset.mode = mode;

const stageEl = document.getElementById('stage');
const mstage = document.getElementById('mstage');
const video = document.getElementById('cam');
const perm = document.getElementById('perm');
const hintEl = document.getElementById('hint');
document.getElementById('ttl').textContent = materi.short;

const HINT = {
  bebas: 'Seret memutar · cubit zoom · <b>ketuk layar</b> untuk memulai perjalanan energi',
  cari: `Arahkan kamera ke <b>Kartu ${materi.short}</b> sampai terdeteksi`,
  dapat: 'Kartu terdeteksi! Seret memutar · cubit zoom · <b>ketuk</b> = tahap berikutnya',
};
function setHint(html) { hintEl.innerHTML = html; }

// ---------- UI dinamis bersama ----------
buildChips(document.getElementById('chips'), ORDER, MATERI, slug,
  s => `/energi/ar/?m=${s}${mode === 'marker' ? '&mode=marker' : ''}`);
const chainUi = buildChain(document.getElementById('chain'), materi);
const narUi = makeNarator({
  panelEl: document.getElementById('narasi'),
  titleEl: document.getElementById('nartitle'),
  textEl: document.getElementById('nartext'),
  subEl: document.getElementById('narsub'),
  speakBtn: document.getElementById('narspeak'),
  closeBtn: document.getElementById('narclose'),
});
document.getElementById('info').textContent = materi.info;

const FLOW = [null, ...materi.stages.map(s => s.key)];
let cur = null;
const stagesUi = buildStages(document.getElementById('stgroup'), materi, k => setStage(cur === k ? null : k));
const sceneApis = [], labelUis = [];

function setStage(k) {
  cur = k;
  sceneApis.forEach(s => s.setStage(k));
  stagesUi.set(k);
  labelUis.forEach(l => l.set(k));
  const stg = materi.stages.find(s => s.key === k);
  chainUi.set(stg ? stg.lit : 0);
  narUi.show(stg || null);
  document.body.dataset.stage = k || '';
  hintEl.style.display = k ? 'none' : '';
  if (!k) setHint(mode === 'marker' ? (markerFound ? HINT.dapat : HINT.cari) : HINT.bebas);
}
function advance() { setStage(FLOW[(FLOW.indexOf(cur) + 1) % FLOW.length]); }

// ================= MODE BEBAS (markerless) =================
let holder = null, renderer = null, camera = null, scene = null, labelRenderer = null;
const HOME = materi.home;
function initBebas() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
  camera.position.set(0, 0, 5);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stageEl.appendChild(renderer.domElement);
  labelRenderer = new CSS2DRenderer();
  Object.assign(labelRenderer.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
  stageEl.appendChild(labelRenderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, .8));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2); dir.position.set(3, 6, 4); scene.add(dir);
  const dir2 = new THREE.DirectionalLight(0xbcd4ff, .4); dir2.position.set(-4, 2, -2); scene.add(dir2);

  const api = materi.make();
  sceneApis.push(api);
  labelUis.push(buildLabels(api, materi));
  holder = new THREE.Group();
  holder.add(api.group);
  holder.scale.setScalar(HOME.s);
  holder.rotation.set(...HOME.rot);
  holder.position.set(0, HOME.y, 0);
  scene.add(holder);

  const resize = () => {
    const w = stageEl.clientWidth, h = stageEl.clientHeight; if (!w || !h) return;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h); labelRenderer.setSize(w, h);
  };
  resize(); addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stageEl);

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) clock.getDelta(); });
  (function tick() {
    requestAnimationFrame(tick);
    if (!running) return;
    api.update(clock.getDelta());
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  })();
  startCam();
}

async function startCam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    video.srcObject = stream; await video.play();
    if (perm) perm.style.display = 'none';
  } catch (e) {
    if (perm) { perm.style.display = ''; perm.innerHTML = '<b>Kamera tidak bisa dibuka.</b><br>Izinkan akses kamera lalu muat ulang halaman — atau buka <a href="/energi/3d/?m=' + slug + '" style="color:#7ef0b0">versi 3D tanpa kamera</a>.'; }
  }
}

// interaksi bebas: seret putar, cubit zoom, ketuk = tahap berikutnya
let pts = new Map(), last = null, pinchD = 0, moved = 0, downT = 0;
const dist = () => { const a = [...pts.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); };
stageEl.addEventListener('pointerdown', e => {
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pts.size === 1) { last = { x: e.clientX, y: e.clientY }; moved = 0; downT = performance.now(); }
  if (pts.size === 2) pinchD = dist();
});
stageEl.addEventListener('pointermove', e => {
  if (!pts.has(e.pointerId) || !holder) return;
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pts.size === 1 && last) {
    const dx = e.clientX - last.x, dy = e.clientY - last.y; moved += Math.abs(dx) + Math.abs(dy);
    holder.rotation.y += dx * .008; holder.rotation.x += dy * .008;
    holder.rotation.x = Math.max(-1.2, Math.min(1.2, holder.rotation.x));
    last = { x: e.clientX, y: e.clientY };
  } else if (pts.size === 2) {
    const d = dist();
    if (pinchD) { const s = holder.scale.x * (d / pinchD); holder.scale.setScalar(Math.max(.16, Math.min(1.4, s))); }
    pinchD = d; moved += 10;
  }
});
const pu = e => {
  const wasTap = pts.size === 1 && moved < 8 && (performance.now() - downT) < 400;
  pts.delete(e.pointerId); if (pts.size < 2) pinchD = 0; if (pts.size === 0) last = null;
  if (wasTap) advance();
};
stageEl.addEventListener('pointerup', pu);
stageEl.addEventListener('pointercancel', pu);

// ================= MODE MARKER (MindAR image-tracking) =================
let mindar = null, markerHolder = null, userRig = null, markerFound = false, markerFail = false;
let bobT = 0, popK = 1, baseScale = 1, uScale = 1;
const clockM = new THREE.Clock();

function initMarker() {
  mindar = new MindARThree({
    container: mstage,
    imageTargetSrc: `/energi/ar/${slug}.mind?v=1`,
    uiScanning: false, uiLoading: false, maxTrack: 1,
  });
  // vendor: resize() di sela start() bisa melempar getProjectionMatrix (listener internal) — redam.
  addEventListener('error', (e) => {
    if (e.message && e.message.indexOf('getProjectionMatrix') !== -1) e.preventDefault();
  });
  const ms = mindar.scene;
  ms.add(new THREE.HemisphereLight(0xffffff, 0x8393a7, 1.15));
  const md = new THREE.DirectionalLight(0xffffff, 1.25); md.position.set(1, 3, 2); ms.add(md);

  const api = materi.make();
  sceneApis.push(api);
  labelUis.push(buildLabels(api, materi));
  if (cur) api.setStage(cur);
  // DIORAMA BERDIRI DI ATAS KARTU (tabletop): rotasi +90° memetakan sumbu-Y adegan
  // → keluar dari kartu ke arah kamera, dasar papan duduk di permukaan kartu.
  // (Bug lama: -90°+0.5 membuat kamera melihat BAWAH papan = lempengan gelap.)
  userRig = new THREE.Group();          // lapisan interaksi: seret memutar + cubit zoom
  userRig.add(api.group);
  markerHolder = new THREE.Group();
  markerHolder.add(userRig);
  const bb = new THREE.Box3().setFromObject(api.group);
  const size = bb.getSize(new THREE.Vector3());
  const center = bb.getCenter(new THREE.Vector3());
  baseScale = .92 / Math.max(size.x, .001); // pas lebar kartu (lebar marker = 1 unit)
  api.group.position.set(-center.x, -bb.min.y, -center.z); // pusatkan & dudukkan di dasar
  markerHolder.scale.setScalar(baseScale);
  markerHolder.rotation.x = Math.PI / 2;
  markerHolder.position.set(0, 0, .02);

  const anchor = mindar.addAnchor(0);
  anchor.group.add(markerHolder);
  anchor.onTargetFound = () => {
    markerFound = true; popK = 0;
    document.body.classList.add('found');
    if (!cur) setHint(HINT.dapat);
  };
  anchor.onTargetLost = () => {
    markerFound = false;
    document.body.classList.remove('found');
    if (!cur) setHint(HINT.cari);
  };

  // label menempel di mode marker
  labelRenderer = new CSS2DRenderer();
  Object.assign(labelRenderer.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
  mstage.appendChild(labelRenderer.domElement);
  return api;
}

function coverEl(elm) { // video+kanvas MindAR menutupi layar (anti letterbox iOS)
  if (!elm) return;
  const s = elm.style;
  s.setProperty('position', 'absolute', 'important');
  s.setProperty('top', '0', 'important'); s.setProperty('left', '0', 'important');
  s.setProperty('width', '100%', 'important'); s.setProperty('height', '100%', 'important');
  s.setProperty('object-fit', 'cover', 'important');
  s.setProperty('margin', '0', 'important'); s.setProperty('transform', 'none', 'important');
}
function sizeMarker() { if (!mindar) return; coverEl(mindar.video); coverEl(mindar.renderer && mindar.renderer.domElement); if (labelRenderer) labelRenderer.setSize(mstage.clientWidth, mstage.clientHeight); }
addEventListener('resize', () => { if (mode === 'marker') sizeMarker(); });
addEventListener('orientationchange', () => setTimeout(() => { if (mode === 'marker') sizeMarker(); }, 250));

async function startMarker() {
  setHint('Memuat marker…');
  const api = initMarker();
  try { await mindar.start(); }
  catch (e) {
    markerFail = true;
    setHint('Kamera tidak bisa dibuka — izinkan akses kamera lalu muat ulang.');
    if (perm) perm.style.display = 'none';
    return;
  }
  markerFail = false;
  if (perm) perm.style.display = 'none';
  sizeMarker(); setTimeout(sizeMarker, 300); setTimeout(sizeMarker, 900);
  clockM.getDelta();
  mindar.renderer.setAnimationLoop(() => {
    const dt = clockM.getDelta();
    api.update(dt);
    bobT += dt;
    if (popK < 1) popK = Math.min(1, popK + dt * 2.4);
    const pop = 1 - Math.pow(1 - popK, 3);
    markerHolder.scale.setScalar(baseScale * (.6 + .4 * pop) * uScale);
    markerHolder.position.z = .02 + Math.sin(bobT * 1.6) * .012;
    mindar.renderer.render(mindar.scene, mindar.camera);
    labelRenderer.render(mindar.scene, mindar.camera);
  });
  if (!cur) setHint(markerFound ? HINT.dapat : HINT.cari);
}

// interaksi mode marker: seret memutar diorama, cubit zoom, ketuk = tahap berikutnya
let mpts = new Map(), mLast = null, mPinch = 0, mMoved = 0, mDownT = 0;
const mDist = () => { const a = [...mpts.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); };
mstage.addEventListener('pointerdown', e => {
  mpts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (mpts.size === 1) { mLast = { x: e.clientX, y: e.clientY }; mMoved = 0; mDownT = performance.now(); }
  if (mpts.size === 2) mPinch = mDist();
});
mstage.addEventListener('pointermove', e => {
  if (!mpts.has(e.pointerId) || !userRig) return;
  mpts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (mpts.size === 1 && mLast) {
    const dx = e.clientX - mLast.x, dy = e.clientY - mLast.y; mMoved += Math.abs(dx) + Math.abs(dy);
    userRig.rotation.y += dx * .009;                                     // yaw keliling diorama
    userRig.rotation.x = Math.max(-.5, Math.min(1.1, userRig.rotation.x + dy * .008)); // tilt lihat atas/bawah
    mLast = { x: e.clientX, y: e.clientY };
  } else if (mpts.size === 2) {
    const d = mDist();
    if (mPinch) uScale = Math.max(.45, Math.min(2.4, uScale * (d / mPinch)));
    mPinch = d; mMoved += 10;
  }
});
const mUp = e => {
  const wasTap = mpts.size === 1 && mMoved < 8 && (performance.now() - mDownT) < 400;
  mpts.delete(e.pointerId); if (mpts.size < 2) mPinch = 0; if (mpts.size === 0) mLast = null;
  if (wasTap) advance();
};
mstage.addEventListener('pointerup', mUp);
mstage.addEventListener('pointercancel', mUp);

// ================= GANTI MODE = NAVIGASI PENUH =================
document.getElementById('btnfree').addEventListener('click', () => {
  if (mode !== 'bebas') location.href = `${location.pathname}?m=${slug}`;
});
document.getElementById('btnmarker').addEventListener('click', () => {
  if (mode !== 'marker') location.href = `${location.pathname}?m=${slug}&mode=marker`;
});

// ---------- tombol bersama ----------
document.getElementById('reset').addEventListener('click', () => {
  if (holder) { holder.rotation.set(...HOME.rot); holder.scale.setScalar(HOME.s); holder.position.set(0, HOME.y, 0); }
  if (userRig) { userRig.rotation.set(0, 0, 0); uScale = 1; }
});
document.getElementById('snap').addEventListener('click', () => {
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
  } else if (renderer) {
    renderer.render(scene, camera);
    ctx.drawImage(renderer.domElement, 0, 0, w, h);
  }
  const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = `ar-energi-${slug}.png`; a.click();
});

try { document.documentElement.setAttribute('data-theme', localStorage.getItem('adindautami-theme') || 'terang'); } catch (e) { }

// status untuk QA headless / diagnosis
window.__AR = {
  get materi() { return slug; },
  get mode() { return mode; },
  get stage() { return cur; },
  get found() { return markerFound; },
  get fail() { return markerFail; },
  get proc() { return !!(mindar && mindar.controller && mindar.controller.processingVideo); },
  get pose() {
    if (holder) return { rx: +holder.rotation.x.toFixed(3), ry: +holder.rotation.y.toFixed(3), s: +holder.scale.x.toFixed(3) };
    if (userRig) return { rx: +userRig.rotation.x.toFixed(3), ry: +userRig.rotation.y.toFixed(3), s: +uScale.toFixed(3) };
    return null;
  },
  probe() { return sceneApis[0] ? sceneApis[0].debug() : null; },
  set(k) { setStage(k); },
  next() { advance(); },
};

// ---------- mulai ----------
if (mode === 'marker') {
  document.getElementById('btnfree').classList.remove('on');
  document.getElementById('btnmarker').classList.add('on');
  setStage(null);
  startMarker();
} else {
  setStage(null);
  initBebas();
}
