// Penampil 3D medan magnet — garis gaya numerik (tabung gradient N→S), orbit, 3 mode kutub.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const stage = document.getElementById('stage');
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

function showNoWebGL() {
  stage.innerHTML = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:26px;color:var(--ink)">
    <div style="font-size:40px">🧩</div>
    <div style="font-family:var(--font-d,inherit);font-weight:800;font-size:18px">Penampil 3D butuh WebGL</div>
    <div style="max-width:340px;color:var(--sub);font-size:13.5px;line-height:1.6;font-weight:600">Browser ini belum mengaktifkan akselerasi grafis (WebGL). Aktifkan <b>hardware acceleration</b> di pengaturan browser, atau coba <b>Simulasi 2D</b> yang berjalan di semua perangkat.</div>
    <a href="/magnet/2d/" style="display:inline-flex;align-items:center;gap:8px;font-family:var(--font-d,inherit);font-weight:800;font-size:14.5px;color:#fff;background:linear-gradient(160deg,#ff7a5c,#e8462f);padding:12px 20px;border-radius:14px;text-decoration:none">Buka Simulasi 2D →</a>
  </div>`;
}
function webglOK() { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; } }

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
camera.position.set(0, 3.4, 7.2);

let renderer;
try { if (!webglOK()) throw new Error('no-webgl'); renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
catch (e) { showNoWebGL(); throw e; }
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
Object.assign(labelRenderer.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
stage.appendChild(labelRenderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, .6));
scene.add(new THREE.HemisphereLight(0xffffff, 0x33263a, .7));
const dir = new THREE.DirectionalLight(0xffffff, 1.05); dir.position.set(4, 7, 5); scene.add(dir);
const dir2 = new THREE.DirectionalLight(0xffd0c0, .35); dir2.position.set(-5, 2, -3); scene.add(dir2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.enablePan = false; // cegah objek "melayang" saat cubit-zoom di HP
controls.minDistance = 4; controls.maxDistance = 16;
controls.target.set(0, 0, 0);
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
let autoRotate = !reduce; controls.autoRotate = autoRotate; controls.autoRotateSpeed = 0.8;

// ---------- konfigurasi kutub per mode (N=+1 merah, S=-1 biru) ----------
const RED = new THREE.Color(0xe8462f), BLUE = new THREE.Color(0x2f6fd0);
function config(mode) {
  if (mode === 'single') return {
    charges: [{ x: -0.95, q: 1 }, { x: 0.95, q: -1 }],
    bars: [{ x0: -1.25, x1: 1.25, mid: 0, left: 'N', right: 'S' }],
  };
  if (mode === 'attract') return { // kutub berbeda berhadapan (S kiri ↔ N kanan)
    charges: [{ x: -2.35, q: 1 }, { x: -0.85, q: -1 }, { x: 0.85, q: 1 }, { x: 2.35, q: -1 }],
    bars: [{ x0: -2.65, x1: -0.55, mid: -1.6, left: 'N', right: 'S' }, { x0: 0.55, x1: 2.65, mid: 1.6, left: 'N', right: 'S' }],
  };
  return { // repel: kutub sama (N ↔ N) berhadapan
    charges: [{ x: -2.35, q: -1 }, { x: -0.85, q: 1 }, { x: 0.85, q: 1 }, { x: 2.35, q: -1 }],
    bars: [{ x0: -2.65, x1: -0.55, mid: -1.6, left: 'S', right: 'N' }, { x0: 0.55, x1: 2.65, mid: 1.6, left: 'N', right: 'S' }],
  };
}
function fieldAt(p, ch) {
  let bx = 0, by = 0, bz = 0;
  for (const c of ch) { const dx = p.x - c.x, dy = p.y, dz = p.z; let r2 = dx * dx + dy * dy + dz * dz; if (r2 < 0.02) r2 = 0.02; const r = Math.sqrt(r2); const inv = c.q / (r2 * r); bx += dx * inv; by += dy * inv; bz += dz * inv; }
  return new THREE.Vector3(bx, by, bz);
}
function traceLine(seed, ch) {
  const pts = [seed.clone()]; const p = seed.clone(); const step = 0.07;
  for (let i = 0; i < 300; i++) {
    const b = fieldAt(p, ch); const m = b.length(); if (m < 1e-6) break;
    p.addScaledVector(b, step / m);
    if (Math.abs(p.x) > 7 || Math.hypot(p.y, p.z) > 5) break;
    let stop = false; for (const c of ch) { if (c.q < 0 && Math.hypot(p.x - c.x, p.y, p.z) < 0.16) { pts.push(new THREE.Vector3(c.x, 0, 0)); stop = true; break; } }
    pts.push(p.clone()); if (stop) break;
  }
  return pts;
}

let fieldGroup = null; const disposers = [];
function clearField() {
  if (fieldGroup) { scene.remove(fieldGroup); fieldGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); }
  labelRoot.forEach(l => l.parent && l.parent.remove(l)); labelRoot.length = 0;
  fieldGroup = new THREE.Group(); scene.add(fieldGroup);
}
const labelRoot = [];
function label(text, x, y, z) {
  const d = document.createElement('div'); d.className = 'clabel'; d.textContent = text;
  const o = new CSS2DObject(d); o.position.set(x, y, z); fieldGroup.add(o); labelRoot.push(o);
}
const barMat = { N: new THREE.MeshStandardMaterial({ color: 0xe8462f, roughness: .5, metalness: .25 }), S: new THREE.MeshStandardMaterial({ color: 0x2f6fd0, roughness: .5, metalness: .25 }) };
disposers.push(barMat.N, barMat.S);
const lineMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .92 });
disposers.push(lineMat);

function buildField(mode) {
  clearField();
  const { charges, bars } = config(mode);
  // batang magnet
  for (const b of bars) {
    const len = b.x1 - b.x0, half = len / 2;
    const gN = new THREE.BoxGeometry(half, 0.5, 0.5); const mN = new THREE.Mesh(gN, b.left === 'N' ? barMat.N : barMat.S); mN.position.set(b.x0 + half / 2, 0, 0); fieldGroup.add(mN);
    const gS = new THREE.BoxGeometry(half, 0.5, 0.5); const mS = new THREE.Mesh(gS, b.right === 'N' ? barMat.N : barMat.S); mS.position.set(b.x1 - half / 2, 0, 0); fieldGroup.add(mS);
    disposers.push(gN, gS);
    label(b.left, b.x0 - 0.15, 0.55, 0); label(b.right, b.x1 + 0.15, 0.55, 0);
  }
  // garis gaya: seed di sekeliling tiap kutub Utara, telusuri searah medan
  const azis = [0, 72, 144, 216, 288].map(d => d * Math.PI / 180);
  const pols = [42, 90, 138].map(d => d * Math.PI / 180);
  for (const c of charges) {
    if (c.q <= 0) continue;
    for (const a of azis) for (const pol of pols) {
      const dirv = new THREE.Vector3(Math.cos(pol), Math.sin(pol) * Math.cos(a), Math.sin(pol) * Math.sin(a));
      const seed = new THREE.Vector3(c.x, 0, 0).addScaledVector(dirv, 0.17);
      const pts = traceLine(seed, charges);
      if (pts.length < 5) continue;
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubular = Math.min(80, Math.max(12, pts.length));
      const geo = new THREE.TubeGeometry(curve, tubular, 0.022, 5, false);
      // warna vertex: merah (dekat N) → biru (dekat S) sepanjang tabung
      const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3), tmp = new THREE.Color();
      const ring = 6; // radialSegments+1
      for (let i = 0; i < pos.count; i++) { const t = Math.floor(i / ring) / tubular; tmp.copy(RED).lerp(BLUE, t); cols[i * 3] = tmp.r; cols[i * 3 + 1] = tmp.g; cols[i * 3 + 2] = tmp.b; }
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      const mesh = new THREE.Mesh(geo, lineMat); fieldGroup.add(mesh);
    }
  }
}

// ---------- UI mode ----------
const TEXT = {
  single: { t: 'Magnet Tunggal', d: 'Satu batang magnet dengan kutub Utara (merah) dan Selatan (biru). Garis gaya keluar dari kutub Utara, melengkung di ruang sekitar, lalu masuk ke kutub Selatan.' },
  attract: { t: 'Tarik-menarik (N–S)', d: 'Dua kutub berbeda saling berhadapan. Garis gaya menyambung dari Utara satu magnet ke Selatan magnet lain — keduanya saling tarik-menarik.' },
  repel: { t: 'Tolak-menolak (N–N)', d: 'Dua kutub sama (Utara–Utara) berhadapan. Garis gaya saling menekan dan membelok menjauhi celah — keduanya saling tolak-menolak.' },
};
let mode = 'single';
function setMode(m) {
  mode = m; buildField(m);
  document.querySelectorAll('.mbtn').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  const pt = document.getElementById('p-title'), px = document.getElementById('p-text');
  if (pt) pt.textContent = TEXT[m].t; if (px) px.textContent = TEXT[m].d;
}
document.getElementById('modes').addEventListener('click', e => { const b = e.target.closest('.mbtn'); if (b) setMode(b.dataset.mode); });
setMode('single');

const rot = document.getElementById('rot');
if (rot) { rot.classList.toggle('on', autoRotate); rot.addEventListener('click', () => { autoRotate = !autoRotate; controls.autoRotate = autoRotate; rot.classList.toggle('on', autoRotate); }); }

// tema
const KEY = 'adindautami-theme';
const MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 14a8 8 0 1 1-10-10 8 8 0 0 0 10 10z"/></svg>';
const SUN = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4.5"/><g stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></g></svg>';
const getT = () => { try { return localStorage.getItem(KEY) || 'terang'; } catch (e) { return 'terang'; } };
function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); const b = document.getElementById('theme'); if (b) b.innerHTML = t === 'gelap' ? SUN : MOON; }
applyTheme(getT());
document.getElementById('theme').addEventListener('click', () => { const t = getT() === 'gelap' ? 'terang' : 'gelap'; try { localStorage.setItem(KEY, t); } catch (e) { } applyTheme(t); });

// resize + loop
function resize() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); labelRenderer.setSize(w, h); }
resize(); addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
addEventListener('load', resize); setTimeout(resize, 250);
let running = true; document.addEventListener('visibilitychange', () => { running = !document.hidden; });
function tick() { requestAnimationFrame(tick); if (!running) return; controls.update(); renderer.render(scene, camera); labelRenderer.render(scene, camera); }
tick();
