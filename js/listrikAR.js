// AR markerless rangkaian listrik — kamera + rangkaian 3D melayang, seret memutar, cubit zoom, ketuk saklar.
import * as THREE from 'three';
import { makeCircuit } from '/js/circuit3d.js?v=1';

const stage = document.getElementById('stage');
const video = document.getElementById('cam');
const perm = document.getElementById('perm');

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
const HOME = { scale: 0.46, rot: [-0.6, 0.6, 0], pos: [0, 0.1, 0] };
holder.scale.setScalar(HOME.scale);
holder.rotation.set(...HOME.rot);
holder.position.set(...HOME.pos);
scene.add(holder);

// ---------- kamera perangkat ----------
async function startCam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    video.srcObject = stream; await video.play();
    if (perm) perm.style.display = 'none';
  } catch (e) {
    if (perm) perm.innerHTML = '<b>Kamera tidak bisa dibuka.</b><br>Izinkan akses kamera, lalu muat ulang halaman.';
  }
}
startCam();

// ---------- interaksi: seret putar, cubit zoom, ketuk toggle ----------
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
  if (wasTap) setOn(!circuit.isOn);
}
function dist() { const a = [...pts.values()]; return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }
stage.addEventListener('pointerdown', pd); stage.addEventListener('pointermove', pm);
stage.addEventListener('pointerup', pu); stage.addEventListener('pointercancel', pu);

// ---------- UI ----------
const btn = document.getElementById('toggle');
function setOn(v) {
  circuit.setOn(v);
  btn.className = 'dockbtn' + (v ? ' on' : '');
  btn.querySelector('span').textContent = v ? 'Matikan' : 'Nyalakan';
}
btn.addEventListener('click', () => setOn(!circuit.isOn));
setOn(false);

document.getElementById('reset').addEventListener('click', () => {
  holder.rotation.set(...HOME.rot); holder.scale.setScalar(HOME.scale); holder.position.set(...HOME.pos);
});

// jepret foto (video + kanvas 3D)
document.getElementById('snap').addEventListener('click', () => {
  const w = stage.clientWidth, h = stage.clientHeight;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
  if (video.videoWidth) {
    const vr = video.videoWidth / video.videoHeight, sr = w / h; let dw = w, dh = h, dx = 0, dy = 0;
    if (vr > sr) { dw = h * vr; dx = (w - dw) / 2; } else { dh = w / vr; dy = (h - dh) / 2; }
    ctx.drawImage(video, dx, dy, dw, dh);
  }
  ctx.drawImage(renderer.domElement, 0, 0, w, h);
  const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = 'rangkaian-listrik-ar.png'; a.click();
});

// tema (untuk chrome overlay)
const KEY = 'adindautami-theme';
try { document.documentElement.setAttribute('data-theme', localStorage.getItem(KEY) || 'terang'); } catch (e) { }

// ---------- resize + loop ----------
function resize() { const w = stage.clientWidth, h = stage.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); }
resize(); addEventListener('resize', resize);
const clock = new THREE.Clock();
function tick() { requestAnimationFrame(tick); circuit.update(clock.getDelta()); renderer.render(scene, camera); }
tick();
