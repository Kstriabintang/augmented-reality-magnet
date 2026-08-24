// Inti bersama modul TRANSFORMASI ENERGI (/energi/) — dipakai 6 builder adegan
// (baterai, surya, motor, fotosintesis, plta, pltu) + penampil 3D & AR.
// Pola sama dengan circuit3d.js: closure + track(disposables), tanpa kelas Three kustom.
import * as THREE from 'three';

// tekstur glow radial PUTIH (warna diberi lewat material.color)
export function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.72)');
  g.addColorStop(.65, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}

export const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .6, metalness: .1, ...o });

// kerangka adegan: group + state tahap + util
export function sceneBase(order) {
  const group = new THREE.Group();
  const disposables = [];
  const track = o => { if (o.geometry) disposables.push(o.geometry); if (o.material) disposables.push(o.material); return o; };
  const state = { stage: null, stT: 0, time: 0, speed: 1 };
  const idx = s => order.indexOf(s);
  const S = {
    group, disposables, track, state, order,
    glow: glowTexture(),
    setStage(s) { state.stage = s || null; state.stT = 0; },
    setSpeed(v) { state.speed = Math.max(.1, Math.min(3, v)); },
    at(s) { return state.stage !== null && idx(state.stage) >= idx(s); },   // tahap s sudah tercapai
    is(s) { return state.stage === s; },
    tick(dt) { dt = Math.min(dt, .05); state.time += dt; state.stT += dt; return dt; },
    // easing 0→1 dalam tahap, mulai detik `start` selama `dur`
    seq(start, dur = .6) { const k = Math.max(0, Math.min(1, (state.stT - start) / dur)); return k * k * (3 - 2 * k); },
    lerp(cur, target, dt, k = 5) { return cur + (target - cur) * Math.min(1, dt * k); },
    sprite(color, size, opacity = .8) {
      const m = new THREE.SpriteMaterial({ map: S.glow, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
      disposables.push(m);
      const sp = new THREE.Sprite(m); sp.scale.set(size, size, 1); return sp;
    },
    anchors: {},
    mkAnchors(defs) { for (const k in defs) { const a = new THREE.Object3D(); a.position.set(...defs[k]); group.add(a); S.anchors[k] = a; } },
    dispose() { disposables.forEach(d => d.dispose && d.dispose()); },
  };
  disposables.push(S.glow);
  return S;
}

// papan alas (identitas template: semua adegan berdiri di papan claymorphism)
export function makeBoard(S, w, d, { color = 0x243350, edge = 0x2f4266, top = 0 } = {}) {
  const board = S.track(new THREE.Mesh(new THREE.BoxGeometry(w, .28, d), std(color, { roughness: .92, metalness: .04 })));
  board.position.y = -.14; S.group.add(board);
  const trim = S.track(new THREE.Mesh(new THREE.BoxGeometry(w + .3, .14, d + .3), std(edge, { roughness: .8 })));
  trim.position.y = -.24; S.group.add(trim);
  if (top) { // lapisan permukaan (mis. rumput / tanah)
    const t = S.track(new THREE.Mesh(new THREE.BoxGeometry(w - .04, .04, d - .04), std(top, { roughness: .95 })));
    t.position.y = .02; S.group.add(t);
  }
  return board;
}

// ---------- aliran partikel di sepanjang kurva (elektron/air/uap/foton/bahan bakar) ----------
export class Flow {
  // points: array [x,y,z] | Vector3. opts: n, size, color, glow(warna|0), speed, shape('sphere'|'cone'),
  // front(true=barisan merambat dari awal kurva), fade(muncul-hilang di ujung), make(i)=>Mesh kustom
  constructor(S, parent, points, { n = 12, size = .06, color = 0xffffff, glow = 0, glowSize = 3.2, speed = .16, shape = 'sphere', front = false, fade = false, make = null, tension = .1, closed = false } = {}) {
    this.curve = new THREE.CatmullRomCurve3(points.map(p => Array.isArray(p) ? new THREE.Vector3(...p) : p), closed, 'catmullrom', tension);
    this.n = n; this.speed = speed; this.frontMode = front; this.front = front ? 0 : 1;
    this.fade = fade; this.orient = shape === 'cone';
    this.t = 0; this.active = false; this.items = [];
    let geo = null, mat = null;
    if (!make) {
      mat = new THREE.MeshBasicMaterial({ color }); S.disposables.push(mat);
      geo = shape === 'cone' ? new THREE.ConeGeometry(size, size * 2.4, 8) : new THREE.SphereGeometry(size, 10, 10);
      S.disposables.push(geo);
    }
    let gmat = null;
    if (glow) { gmat = new THREE.SpriteMaterial({ map: S.glow, color: glow, transparent: true, opacity: .8, blending: THREE.AdditiveBlending, depthWrite: false }); S.disposables.push(gmat); }
    for (let i = 0; i < n; i++) {
      const m = make ? make(i) : new THREE.Mesh(geo, mat);
      if (gmat) { const g = new THREE.Sprite(gmat); g.scale.setScalar(size * glowSize); m.add(g); }
      m.visible = false; parent.add(m); this.items.push(m);
    }
    this._up = new THREE.Vector3(0, 1, 0); this._tan = new THREE.Vector3();
  }
  setActive(v) { if (v && !this.active && this.frontMode) this.front = 0; this.active = v; if (!v) this.items.forEach(m => m.visible = false); }
  update(dt, speedMul = 1) {
    if (!this.active) return;
    if (this.frontMode && this.front < 1) this.front = Math.min(1, this.front + dt * this.speed * 1.5);
    this.t = (this.t + dt * this.speed * speedMul) % 1;
    for (let i = 0; i < this.n; i++) {
      const ti = (this.t + i / this.n) % 1;
      const m = this.items[i];
      const vis = ti <= this.front + .001;
      m.visible = vis; if (!vis) continue;
      this.curve.getPointAt(ti, m.position);
      if (this.orient) { this.curve.getTangentAt(ti, this._tan); m.quaternion.setFromUnitVectors(this._up, this._tan); }
      const k = this.fade ? Math.max(.001, Math.sin(Math.PI * ti)) : (.85 + .3 * Math.sin(ti * 12 + this.t * 9));
      m.scale.setScalar(Math.max(.001, k));
    }
  }
  uNear(pt) { // fraksi kurva terdekat ke titik — pemicu "energi TIBA di sini"
    let best = 1e9, u = 0; const p = Array.isArray(pt) ? new THREE.Vector3(...pt) : pt;
    for (let i = 0; i <= 200; i++) { const t = i / 200; const d = this.curve.getPointAt(t).distanceToSquared(p); if (d < best) { best = d; u = t; } }
    return u;
  }
}

// ---------- kepulan (asap/uap/panas) ----------
export class Puffs {
  constructor(S, parent, { origin = [0, 0, 0], dir = [0, 1, 0], spread = .12, len = .8, life = 1.6, size = .16, grow = 1.8, color = 0xffffff, opacity = .5, n = 7, add = false } = {}) {
    this.o = new THREE.Vector3(...origin); this.d = new THREE.Vector3(...dir).normalize();
    this.spread = spread; this.len = len; this.life = life; this.size = size; this.grow = grow; this.maxO = opacity;
    this.items = []; this.active = false;
    for (let i = 0; i < n; i++) {
      const mat = new THREE.SpriteMaterial({ map: S.glow, color, transparent: true, opacity: 0, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
      S.disposables.push(mat);
      const s = new THREE.Sprite(mat); s.visible = false; parent.add(s);
      this.items.push({ s, p: i / n, ox: Math.random() - .5, oz: Math.random() - .5, w: Math.random() * Math.PI * 2 });
    }
  }
  setActive(v) { this.active = v; if (!v) this.items.forEach(it => { it.s.visible = false; it.s.material.opacity = 0; }); }
  update(dt, time) {
    if (!this.active && !this.items.some(it => it.s.visible)) return;
    for (const it of this.items) {
      it.p += dt / this.life;
      if (it.p >= 1) {
        if (!this.active) { it.s.visible = false; continue; }
        it.p -= 1; it.ox = Math.random() - .5; it.oz = Math.random() - .5;
      }
      const p = it.p, wob = Math.sin(time * 2 + it.w) * this.spread * .5;
      it.s.visible = true;
      it.s.position.set(
        this.o.x + this.d.x * p * this.len + it.ox * this.spread * 2 + wob,
        this.o.y + this.d.y * p * this.len,
        this.o.z + this.d.z * p * this.len + it.oz * this.spread * 2);
      const sc = this.size * (1 + this.grow * p); it.s.scale.set(sc, sc, 1);
      it.s.material.opacity = this.maxO * Math.sin(Math.PI * Math.min(1, p));
    }
  }
}

// ---------- gelombang cincin (suara) ----------
export class Rings {
  constructor(S, parent, { origin = [0, 0, 0], normal = [0, 0, 1], r0 = .07, r1 = .55, life = 1.3, color = 0xffffff, opacity = .55, n = 3 } = {}) {
    const geo = new THREE.RingGeometry(.86, 1, 40); S.disposables.push(geo);
    this.r0 = r0; this.r1 = r1; this.life = life; this.maxO = opacity;
    this.items = []; this.active = false;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...normal).normalize());
    for (let i = 0; i < n; i++) {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
      S.disposables.push(mat);
      const m = new THREE.Mesh(geo, mat); m.position.set(...origin); m.quaternion.copy(q);
      m.visible = false; parent.add(m);
      this.items.push({ m, p: i / n });
    }
  }
  setActive(v) { this.active = v; if (!v) this.items.forEach(it => { it.m.visible = false; it.m.material.opacity = 0; }); }
  update(dt) {
    if (!this.active && !this.items.some(it => it.m.visible)) return;
    for (const it of this.items) {
      it.p += dt / this.life;
      if (it.p >= 1) { if (!this.active) { it.m.visible = false; continue; } it.p -= 1; }
      const r = this.r0 + (this.r1 - this.r0) * it.p;
      it.m.visible = true; it.m.scale.set(r, r, 1);
      it.m.material.opacity = this.maxO * (1 - it.p);
    }
  }
}

// ---------- objek yang dipakai beberapa adegan ----------

// matahari: bola memijar + glow
export function makeSun(S, { r = .26, pos = [0, 2.4, -0.8] } = {}) {
  const g = new THREE.Group();
  const core = S.track(new THREE.Mesh(new THREE.SphereGeometry(r, 22, 18),
    new THREE.MeshBasicMaterial({ color: 0xffd23e })));
  g.add(core);
  const halo = S.sprite(0xffc23e, r * 6, .75); g.add(halo);
  g.position.set(...pos); S.group.add(g);
  return { g, halo };
}

// rumah kecil: dinding + atap pelana + jendela yang bisa menyala
export function makeHouse(S, { scale = 1, pos = [0, 0, 0], ry = 0, wall = 0xf3e7d3, roof = 0xd97742 } = {}) {
  const g = new THREE.Group();
  const base = S.track(new THREE.Mesh(new THREE.BoxGeometry(1.15, .8, .95), std(wall, { roughness: .85 })));
  base.position.y = .4; g.add(base);
  const winMat = new THREE.MeshStandardMaterial({ color: 0x9db4d8, roughness: .4, emissive: 0x000000, emissiveIntensity: 1 });
  S.disposables.push(winMat);
  const winGeo = new THREE.BoxGeometry(.22, .22, .03); S.disposables.push(winGeo);
  [[-.3, .5, .49], [.3, .5, .49]].forEach(p => { const w = new THREE.Mesh(winGeo, winMat); w.position.set(...p); g.add(w); });
  const door = S.track(new THREE.Mesh(new THREE.BoxGeometry(.24, .4, .03), std(0x8a5a33)));
  door.position.set(0, .2, .49); g.add(door);
  // atap pelana: dua sisi miring + bubungan
  const roofMat = std(roof, { roughness: .8 }); S.disposables.push(roofMat);
  const slopeGeo = new THREE.BoxGeometry(.78, .06, 1.12); S.disposables.push(slopeGeo);
  const s1 = new THREE.Mesh(slopeGeo, roofMat); s1.position.set(-.31, 1.02, 0); s1.rotation.z = .62; g.add(s1);
  const s2 = new THREE.Mesh(slopeGeo, roofMat); s2.position.set(.31, 1.02, 0); s2.rotation.z = -.62; g.add(s2);
  const ridge = S.track(new THREE.Mesh(new THREE.BoxGeometry(.1, .07, 1.14), std(roof, { roughness: .7 })));
  ridge.position.y = 1.23; g.add(ridge);
  g.scale.setScalar(scale); g.position.set(...pos); g.rotation.y = ry;
  S.group.add(g);
  return { g, winMat, setLit(k) { winMat.emissive.setHex(0xffe9a8); winMat.emissiveIntensity = k * 1.6; winMat.color.setHex(k > .3 ? 0xffe9a8 : 0x9db4d8); } };
}

// tiang listrik: batang + palang
export function makePole(S, { pos = [0, 0, 0], h = 1.5 } = {}) {
  const g = new THREE.Group();
  const post = S.track(new THREE.Mesh(new THREE.CylinderGeometry(.045, .06, h, 10), std(0x77716a, { roughness: .9 })));
  post.position.y = h / 2; g.add(post);
  const arm = S.track(new THREE.Mesh(new THREE.BoxGeometry(.5, .05, .05), std(0x77716a, { roughness: .9 })));
  arm.position.y = h - .12; g.add(arm);
  g.position.set(...pos); S.group.add(g);
  return { g, top: new THREE.Vector3(pos[0], pos[1] + h - .1, pos[2]) };
}

// turbin (roda sudu, poros sumbu Z ke belakang) + generator (badan + cincin tembaga)
export function makeTurbineGen(S, { pos = [0, 0, 0] } = {}) {
  const g = new THREE.Group();
  // roda turbin menghadap depan (bidang XY)
  const wheel = new THREE.Group();
  const hub = S.track(new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .16, 14), std(0xcdd7e6, { metalness: .8, roughness: .3 })));
  hub.rotation.x = Math.PI / 2; wheel.add(hub);
  const rim = S.track(new THREE.Mesh(new THREE.TorusGeometry(.34, .035, 10, 30), std(0x8fa3c2, { metalness: .7, roughness: .35 })));
  wheel.add(rim);
  const bladeGeo = new THREE.BoxGeometry(.1, .3, .045); S.disposables.push(bladeGeo);
  const bladeMat = std(0x63a0ee, { metalness: .5, roughness: .4 }); S.disposables.push(bladeMat);
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Mesh(bladeGeo, bladeMat);
    const a = i / 6 * Math.PI * 2;
    b.position.set(Math.cos(a) * .22, Math.sin(a) * .22, 0);
    b.rotation.z = a + .5; wheel.add(b);
  }
  wheel.position.set(0, .5, .3); g.add(wheel);
  // poros ke generator (belakang)
  const shaft = S.track(new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .55, 10), std(0xcdd7e6, { metalness: .8, roughness: .3 })));
  shaft.rotation.x = Math.PI / 2; shaft.position.set(0, .5, -.02); g.add(shaft);
  // generator
  const gen = new THREE.Group();
  const body = S.track(new THREE.Mesh(new THREE.CylinderGeometry(.26, .26, .5, 20), std(0x4b5a74, { metalness: .5, roughness: .45 })));
  body.rotation.x = Math.PI / 2; gen.add(body);
  const coilMat = std(0xc98a3a, { metalness: .75, roughness: .3 }); S.disposables.push(coilMat);
  const coilGeo = new THREE.TorusGeometry(.27, .04, 8, 24); S.disposables.push(coilGeo);
  [-.1, .1].forEach(z => { const c = new THREE.Mesh(coilGeo, coilMat); c.position.z = z; gen.add(c); });
  const cap = S.track(new THREE.Mesh(new THREE.SphereGeometry(.26, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), std(0x63a0ee, { roughness: .4 })));
  cap.rotation.x = -Math.PI / 2; cap.position.z = -.25; gen.add(cap);
  gen.position.set(0, .5, -.42); g.add(gen);
  // dudukan
  const foot = S.track(new THREE.Mesh(new THREE.BoxGeometry(.8, .12, 1.1), std(0x2f4266)));
  foot.position.set(0, .06, -.05); g.add(foot);
  const spark = S.sprite(0xffd54a, .5, 0); spark.position.set(0, .92, -.42); g.add(spark);
  g.position.set(...pos); S.group.add(g);
  return {
    g, wheel, gen, spark,
    spin(dt, speed) { wheel.rotation.z -= dt * speed; },
    genTop: new THREE.Vector3(pos[0], pos[1] + .78, pos[2] - .42),
  };
}
