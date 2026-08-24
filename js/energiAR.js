// AR Transformasi Energi — markerless: kamera HP + adegan 3D melayang, 6 materi (?m=slug).
// Seret memutar · cubit zoom · ketuk = tahap berikutnya. Label menempel (CSS2D),
// rantai energi, narasi teks + suara. Ganti materi = navigasi URL (adegan selalu bersih).
import * as THREE from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { MATERI, ORDER, getMateri } from '/js/energi/registry.js?v=1';
import { buildStages, buildChain, buildChips, buildLabels, makeNarator } from '/js/energi/ui.js?v=1';

const slug = getMateri(new URLSearchParams(location.search).get('m'));
const materi = MATERI[slug];
document.title = `AR ${materi.title} — Transformasi Energi | adindautami`;

const stageEl = document.getElementById('stage');
const video = document.getElementById('cam');
const perm = document.getElementById('perm');
const hintEl = document.getElementById('hint');
document.getElementById('ttl').textContent = materi.short;

// ---------- three: kamera video di belakang, kanvas transparan di depan ----------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
camera.position.set(0, 0, 5);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
stageEl.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
Object.assign(labelRenderer.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
stageEl.appendChild(labelRenderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, .8));
const dir = new THREE.DirectionalLight(0xffffff, 1.2); dir.position.set(3, 6, 4); scene.add(dir);
const dir2 = new THREE.DirectionalLight(0xbcd4ff, .4); dir2.position.set(-4, 2, -2); scene.add(dir2);

const sceneApi = materi.make();
const holder = new THREE.Group();
holder.add(sceneApi.group);
const HOME = materi.home;
holder.scale.setScalar(HOME.s);
holder.rotation.set(...HOME.rot);
holder.position.set(0, HOME.y, 0);
scene.add(holder);

// ---------- UI dinamis ----------
const chips = document.getElementById('chips');
buildChips(chips, ORDER, MATERI, slug, s => `/energi/ar/?m=${s}`);
const chainUi = buildChain(document.getElementById('chain'), materi);
const labelUi = buildLabels(sceneApi, materi);
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

function setStage(k) {
  cur = k;
  sceneApi.setStage(k);
  stagesUi.set(k);
  labelUi.set(k);
  const stg = materi.stages.find(s => s.key === k);
  chainUi.set(stg ? stg.lit : 0);
  narUi.show(stg || null);
  document.body.dataset.stage = k || '';
  hintEl.style.display = k ? 'none' : '';
}
function advance() { setStage(FLOW[(FLOW.indexOf(cur) + 1) % FLOW.length]); }

// ---------- kamera perangkat ----------
async function startCam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    video.srcObject = stream; await video.play();
    if (perm) perm.style.display = 'none';
  } catch (e) {
    if (perm) { perm.style.display = ''; perm.innerHTML = '<b>Kamera tidak bisa dibuka.</b><br>Izinkan akses kamera lalu muat ulang halaman — atau buka <a href="/energi/3d/?m=' + slug + '" style="color:#7ef0b0">versi 3D tanpa kamera</a>.'; }
  }
}

// ---------- interaksi: seret putar, cubit zoom, ketuk = tahap berikutnya ----------
let pts = new Map(), last = null, pinchD = 0, moved = 0, downT = 0;
const dist = () => { const a = [...pts.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); };
stageEl.addEventListener('pointerdown', e => {
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pts.size === 1) { last = { x: e.clientX, y: e.clientY }; moved = 0; downT = performance.now(); }
  if (pts.size === 2) pinchD = dist();
});
stageEl.addEventListener('pointermove', e => {
  if (!pts.has(e.pointerId)) return;
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

// ---------- tombol ----------
document.getElementById('reset').addEventListener('click', () => {
  holder.rotation.set(...HOME.rot); holder.scale.setScalar(HOME.s); holder.position.set(0, HOME.y, 0);
});
document.getElementById('snap').addEventListener('click', () => {
  const w = innerWidth, h = innerHeight;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
  if (video.videoWidth) {
    const s = Math.max(w / video.videoWidth, h / video.videoHeight);
    const dw = video.videoWidth * s, dh = video.videoHeight * s;
    ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }
  renderer.render(scene, camera);
  ctx.drawImage(renderer.domElement, 0, 0, w, h);
  const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = `ar-energi-${slug}.png`; a.click();
});

// tema chrome overlay
try { document.documentElement.setAttribute('data-theme', localStorage.getItem('adindautami-theme') || 'terang'); } catch (e) { }

// ---------- resize + loop ----------
function resize() {
  const w = stageEl.clientWidth, h = stageEl.clientHeight; if (!w || !h) return;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h); labelRenderer.setSize(w, h);
}
resize(); addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(stageEl);

const clock = new THREE.Clock();
let running = true;
document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) clock.getDelta(); });
function tick() {
  requestAnimationFrame(tick);
  if (!running) return;
  sceneApi.update(clock.getDelta());
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
tick();

// status untuk QA headless / diagnosis di perangkat
window.__AR = {
  get materi() { return slug; },
  get stage() { return cur; },
  get pose() { return { rx: +holder.rotation.x.toFixed(3), ry: +holder.rotation.y.toFixed(3), s: +holder.scale.x.toFixed(3) }; },
  probe() { return sceneApi.debug(); },
  set(k) { setStage(k); },
  next() { advance(); },
};

setStage(null);
startCam();
