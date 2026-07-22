// Penampil 3D rangkaian listrik — orbit, label menempel, ketuk saklar, kecepatan, terang/gelap.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { makeCircuit } from '/js/circuit3d.js?v=1';

const stage = document.getElementById('stage');
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
camera.position.set(4.8, 3.8, 5.6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
Object.assign(labelRenderer.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
stage.appendChild(labelRenderer.domElement);

// pencahayaan
scene.add(new THREE.AmbientLight(0xffffff, .55));
scene.add(new THREE.HemisphereLight(0xffffff, 0x28324c, .7));
const dir = new THREE.DirectionalLight(0xffffff, 1.15); dir.position.set(4, 7, 5); scene.add(dir);
const dir2 = new THREE.DirectionalLight(0xbcd4ff, .4); dir2.position.set(-5, 3, -2); scene.add(dir2);

const circuit = makeCircuit();
scene.add(circuit.group);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.minDistance = 3.6; controls.maxDistance = 13; controls.maxPolarAngle = Math.PI * 0.52;
controls.target.set(0, 0.4, 0);
let autoRotate = !reduce;
controls.autoRotate = autoRotate; controls.autoRotateSpeed = 0.9;

// label menempel
function label(text) { const d = document.createElement('div'); d.className = 'clabel'; d.textContent = text; return new CSS2DObject(d); }
circuit.anchors.baterai.add(label('Baterai'));
circuit.anchors.kabel.add(label('Kabel'));
circuit.anchors.saklar.add(label('Saklar'));
circuit.anchors.lampu.add(label('Lampu'));

// ketuk objek -> toggle saklar (tap, bukan drag)
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let downXY = null;
renderer.domElement.addEventListener('pointerdown', e => { downXY = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downXY) return; const moved = Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]); downXY = null;
  if (moved > 6) return;
  const r = renderer.domElement.getBoundingClientRect();
  ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1; ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  if (ray.intersectObject(circuit.group, true).length) setOn(!circuit.isOn);
});

// ---- UI ----
const btn = document.getElementById('toggle'), status = document.getElementById('status');
function setOn(v) {
  circuit.setOn(v);
  btn.className = 'bigbtn' + (v ? ' on' : ''); btn.textContent = v ? 'Matikan Saklar' : 'Nyalakan Saklar';
  status.className = 'status ' + (v ? 'on' : 'off');
  status.innerHTML = v
    ? '<b>Rangkaian Tertutup</b>Arus mengalir dari + ke −, lampu menyala.'
    : '<b>Rangkaian Terbuka</b>Saklar terbuka, arus tidak mengalir, lampu mati.';
}
btn.addEventListener('click', () => setOn(!circuit.isOn));
setOn(/on/.test(location.hash)); // #on = mulai menyala (deep-link)

const rot = document.getElementById('rot');
rot.addEventListener('click', () => { autoRotate = !autoRotate; controls.autoRotate = autoRotate; rot.classList.toggle('on', autoRotate); });
rot.classList.toggle('on', autoRotate);

const speed = document.getElementById('speed'), speedv = document.getElementById('speedv');
speed.addEventListener('input', () => { const s = +speed.value; circuit.setSpeed(s); speedv.textContent = s.toFixed(2).replace(/\.?0+$/, '') + '×'; });

// tema
const KEY = 'adindautami-theme';
function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); const b = document.getElementById('theme'); if (b) b.innerHTML = t === 'gelap' ? SUN : MOON; }
const MOON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 14a8 8 0 1 1-10-10 8 8 0 0 0 10 10z"/></svg>';
const SUN = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4.5"/><g stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></g></svg>';
const getT = () => { try { return localStorage.getItem(KEY) || 'terang'; } catch (e) { return 'terang'; } };
applyTheme(getT());
document.getElementById('theme').addEventListener('click', () => { const t = getT() === 'gelap' ? 'terang' : 'gelap'; try { localStorage.setItem(KEY, t); } catch (e) { } applyTheme(t); });

// resize + loop
function resize() { const w = stage.clientWidth, h = stage.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); labelRenderer.setSize(w, h); }
resize(); addEventListener('resize', resize);
const clock = new THREE.Clock();
let running = true; document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) clock.getDelta(); });
function tick() { requestAnimationFrame(tick); if (!running) return; const dt = clock.getDelta(); controls.update(); circuit.update(dt); renderer.render(scene, camera); labelRenderer.render(scene, camera); }
tick();
