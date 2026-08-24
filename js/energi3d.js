// Penampil 3D Transformasi Energi — orbit + label menempel + tahap interaktif, 6 materi (?m=slug).
// Fallback WebGL (akselerasi grafis mati → pesan + tautan), pola sama listrik3d.js.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { MATERI, ORDER, getMateri } from '/js/energi/registry.js?v=1';
import { buildStages, buildChain, buildChips, buildLabels, makeNarator } from '/js/energi/ui.js?v=1';

const slug = getMateri(new URLSearchParams(location.search).get('m'));
const materi = MATERI[slug];
document.title = `${materi.title} 3D — Transformasi Energi | adindautami`;
document.getElementById('ttl').textContent = materi.title;

const stageEl = document.getElementById('stage');
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

function showNoWebGL() {
  stageEl.innerHTML = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:26px;color:var(--ink)">
    <div style="font-size:40px">🧩</div>
    <div style="font-family:var(--font-d,inherit);font-weight:800;font-size:18px">Penampil 3D butuh WebGL</div>
    <div style="max-width:340px;color:var(--sub);font-size:13.5px;line-height:1.6;font-weight:600">Browser ini belum mengaktifkan akselerasi grafis (WebGL), jadi model 3D tidak bisa tampil. Aktifkan <b>hardware acceleration</b> di pengaturan browser, atau buka lewat HP.</div>
    <a href="/energi/" style="display:inline-flex;align-items:center;gap:8px;font-family:var(--font-d,inherit);font-weight:800;font-size:14.5px;color:#fff;background:linear-gradient(160deg,#5ad48d,#1c8a4b);padding:12px 20px;border-radius:14px;text-decoration:none">← Kembali ke Menu Energi</a>
  </div>`;
}
function webglOK() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); }
  catch (e) { return false; }
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(44, 1, .1, 100);
camera.position.set(...materi.cam.pos);

let renderer;
try {
  if (!webglOK()) throw new Error('no-webgl');
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { showNoWebGL(); throw e; }
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
stageEl.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
Object.assign(labelRenderer.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
stageEl.appendChild(labelRenderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, .55));
scene.add(new THREE.HemisphereLight(0xffffff, 0x28324c, .7));
const dir = new THREE.DirectionalLight(0xffffff, 1.15); dir.position.set(4, 7, 5); scene.add(dir);
const dir2 = new THREE.DirectionalLight(0xbcd4ff, .4); dir2.position.set(-5, 3, -2); scene.add(dir2);

const sceneApi = materi.make();
scene.add(sceneApi.group);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.enablePan = false; // cegah objek "melayang" saat cubit-zoom di HP
controls.minDistance = 3.6; controls.maxDistance = 12; controls.maxPolarAngle = Math.PI * .52;
controls.target.set(...materi.cam.tgt);
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
let autoRotate = !reduce;
controls.autoRotate = autoRotate; controls.autoRotateSpeed = .9;

// ---------- UI dinamis ----------
buildChips(document.getElementById('chips'), ORDER, MATERI, slug, s => `/energi/3d/?m=${s}`);
const chainUi = buildChain(document.getElementById('chain'), materi);
const labelUi = buildLabels(sceneApi, materi);
const narUi = makeNarator({
  panelEl: document.getElementById('narasi'),
  titleEl: document.getElementById('nartitle'),
  textEl: document.getElementById('nartext'),
  subEl: document.getElementById('narsub'),
  speakBtn: document.getElementById('narspeak'),
  closeBtn: document.getElementById('narclose'),
  onClose: () => setStage(null),
});
document.getElementById('info').textContent = materi.info;

const FLOW = [null, ...materi.stages.map(s => s.key)];
let cur = null;
const stagesUi = buildStages(document.getElementById('stgroup'), materi, k => setStage(cur === k ? null : k));

function setStage(k) {
  if (cur === k) { if (k === null) return; }
  cur = k;
  sceneApi.setStage(k);
  stagesUi.set(k);
  labelUi.set(k);
  const stg = materi.stages.find(s => s.key === k);
  chainUi.set(stg ? stg.lit : 0);
  narUi.show(stg || null);
  document.body.dataset.stage = k || '';
}
function advance() { setStage(FLOW[(FLOW.indexOf(cur) + 1) % FLOW.length]); }
document.getElementById('next').addEventListener('click', advance);

// ketuk objek → tahap berikutnya (tap, bukan drag)
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let downXY = null;
renderer.domElement.addEventListener('pointerdown', e => { downXY = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downXY) return;
  const moved = Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]); downXY = null;
  if (moved > 6) return;
  const r = renderer.domElement.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1; ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  if (ray.intersectObject(sceneApi.group, true).length) advance();
});

// putar otomatis + kecepatan
const rot = document.getElementById('rot');
rot.addEventListener('click', () => { autoRotate = !autoRotate; controls.autoRotate = autoRotate; rot.classList.toggle('on', autoRotate); });
rot.classList.toggle('on', autoRotate);
const speed = document.getElementById('speed'), speedv = document.getElementById('speedv');
speed.addEventListener('input', () => { const s = +speed.value; sceneApi.setSpeed(s); speedv.textContent = s.toFixed(2).replace(/\.?0+$/, '') + '×'; });

// tema
const KEY = 'adindautami-theme';
const MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 14a8 8 0 1 1-10-10 8 8 0 0 0 10 10z"/></svg>';
const SUN = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4.5"/><g stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></g></svg>';
const getT = () => { try { return localStorage.getItem(KEY) || 'terang'; } catch (e) { return 'terang'; } };
function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); const b = document.getElementById('theme'); if (b) b.innerHTML = t === 'gelap' ? SUN : MOON; }
applyTheme(getT());
document.getElementById('theme').addEventListener('click', () => { const t = getT() === 'gelap' ? 'terang' : 'gelap'; try { localStorage.setItem(KEY, t); } catch (e) { } applyTheme(t); });

// resize + loop
function resize() { const w = stageEl.clientWidth, h = stageEl.clientHeight; if (!w || !h) return; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); labelRenderer.setSize(w, h); }
resize(); addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(stageEl);
addEventListener('load', resize); setTimeout(resize, 250);
const clock = new THREE.Clock();
let running = true;
document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) clock.getDelta(); });
function tick() {
  requestAnimationFrame(tick);
  if (!running) return;
  controls.update();
  sceneApi.update(clock.getDelta());
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
tick();

// deep-link tahap (mis. #kimia) + status QA
const h = location.hash.replace('#', '');
if (materi.stages.some(s => s.key === h)) setStage(h);
window.__E3D = {
  get materi() { return slug; },
  get stage() { return cur; },
  probe() { return sceneApi.debug(); },
  set(k) { setStage(k); },
  next() { advance(); },
};
