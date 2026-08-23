// Rangkaian listrik 3D — builder bersama untuk penampil 3D (/listrik/3d/) & AR (/listrik/ar/).
// makeCircuit() -> { group, setOn(bool), toggle(), update(dt), setSpeed(s), setStage(s), anchors, isOn, stage, lit, dispose() }
// Konvensi: baterai di depan (z+), lampu di belakang (z-), saklar di kanan (x+). Kutub + kanan (merah), − kiri (biru).
//
// setStage(s) — alur transformasi energi (permintaan dosen, 2026-08-24):
//   null           : mode klasik (setOn/partikel arus kuning, dipakai penampil 3D)
//   'kimia'        : baterai cutaway transparan → reaksi kimia (zat kimia + ion + ✨), saklar terbuka
//   'listrik'      : saklar menutup, ELEKTRON (bola cahaya biru) mengalir DI DALAM kabel semi-transparan
//                    dari kutub − ke + ; lampu mulai menyala saat barisan elektron TIBA di lampu
//   'transformasi' : lampu menyala penuh + berdenyut — energi listrik → energi cahaya
import * as THREE from 'three';

export function makeCircuit() {
  const group = new THREE.Group();
  const disposables = [];
  const track = o => { if (o.geometry) disposables.push(o.geometry); if (o.material) disposables.push(o.material); return o; };

  // ---------- material ----------
  const matBoard = new THREE.MeshStandardMaterial({ color: 0x243350, roughness: .92, metalness: .04 });
  const matBoardEdge = new THREE.MeshStandardMaterial({ color: 0x2f4266, roughness: .8, metalness: .1 });
  const matWire = new THREE.MeshStandardMaterial({ color: 0xd08a3c, roughness: .32, metalness: .72, emissive: 0x2a1400, emissiveIntensity: .25, transparent: true, opacity: 1 });
  const matMetal = new THREE.MeshStandardMaterial({ color: 0xcdd7e6, roughness: .3, metalness: .8 });
  const matBattery = new THREE.MeshStandardMaterial({ color: 0x2b3446, roughness: .5, metalness: .3, transparent: true, opacity: 1 });
  const matPos = new THREE.MeshStandardMaterial({ color: 0xe8462f, roughness: .4, emissive: 0x3a0e08, emissiveIntensity: .4 });
  const matNeg = new THREE.MeshStandardMaterial({ color: 0x2f6fd0, roughness: .4, emissive: 0x081a3a, emissiveIntensity: .4 });
  const matBase = new THREE.MeshStandardMaterial({ color: 0x8a6a2a, roughness: .6, metalness: .4 });
  const matGlass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, metalness: 0, transmission: .9, transparent: true, opacity: .35, thickness: .4, ior: 1.4 });
  const matFil = new THREE.MeshStandardMaterial({ color: 0x6b7280, emissive: 0x000000, emissiveIntensity: 1, roughness: .4 });
  const matCurrent = new THREE.MeshBasicMaterial({ color: 0xffd54a });
  // material alur energi
  const matAnoda = new THREE.MeshStandardMaterial({ color: 0x46587c, roughness: .55, metalness: .3, emissive: 0x0a1530, emissiveIntensity: .5 });
  const matKatoda = new THREE.MeshStandardMaterial({ color: 0xc98a3a, roughness: .4, metalness: .6, emissive: 0x2a1400, emissiveIntensity: .4 });
  const matElek = new THREE.MeshStandardMaterial({ color: 0x59d8e8, roughness: .3, transparent: true, opacity: .42, emissive: 0x0a3a44, emissiveIntensity: .8 });
  const matChem = new THREE.MeshStandardMaterial({ color: 0x5e7038, roughness: .7, emissive: 0x1a2408, emissiveIntensity: .6 });
  const matIon = new THREE.MeshBasicMaterial({ color: 0x7ef0d0 });
  const matElectron = new THREE.MeshBasicMaterial({ color: 0x9fd8ff });
  [matBoard, matBoardEdge, matWire, matMetal, matBattery, matPos, matNeg, matBase, matGlass, matFil, matCurrent,
    matAnoda, matKatoda, matElek, matChem, matIon, matElectron].forEach(m => disposables.push(m));

  const glowTex = makeGlowTexture(); disposables.push(glowTex);

  // ---------- papan ----------
  const board = track(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.28, 3.4), matBoard));
  board.position.y = -0.14; board.receiveShadow = true; group.add(board);
  const trim = track(new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.14, 3.7), matBoardEdge));
  trim.position.y = -0.24; group.add(trim);

  // ---------- baterai (depan, sepanjang X) ----------
  const bat = new THREE.Group();
  const body = track(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.5, 28), matBattery));
  body.rotation.z = Math.PI / 2; bat.add(body);
  // tutup + (kanan, merah) & − (kiri, biru)
  const capP = track(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 20), matPos));
  capP.rotation.z = Math.PI / 2; capP.position.x = 0.82; bat.add(capP);
  const nubP = track(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16), matPos));
  nubP.rotation.z = Math.PI / 2; nubP.position.x = 0.95; bat.add(nubP);
  const capN = track(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 20), matNeg));
  capN.rotation.z = Math.PI / 2; capN.position.x = -0.78; bat.add(capN);
  bat.position.set(0, 0.34, 1.05); group.add(bat);

  // ----- isi baterai (cutaway): anoda − | elektrolit | katoda + , zat kimia, ion -----
  const interior = new THREE.Group(); interior.visible = false; bat.add(interior);
  const anoda = track(new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.42), matAnoda));
  anoda.position.x = -0.44; interior.add(anoda);
  const elek = track(new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.38), matElek));
  elek.position.x = 0; interior.add(elek);
  const katoda = track(new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.42), matKatoda));
  katoda.position.x = 0.44; interior.add(katoda);
  // zat kimia (butiran bergetar = reaksi)
  const chemGeo = new THREE.SphereGeometry(0.05, 8, 8); disposables.push(chemGeo);
  const chems = [];
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Mesh(chemGeo, matChem);
    c.userData.base = new THREE.Vector3(-0.62 + Math.random() * 0.6, -0.13 + Math.random() * 0.26, -0.13 + Math.random() * 0.26);
    c.userData.ph = Math.random() * Math.PI * 2;
    c.position.copy(c.userData.base); interior.add(c); chems.push(c);
  }
  // ion mengalir di elektrolit (anoda → katoda)
  const ionGeo = new THREE.SphereGeometry(0.042, 8, 8); disposables.push(ionGeo);
  const ions = [];
  for (let i = 0; i < 5; i++) {
    const io = new THREE.Mesh(ionGeo, matIon);
    io.userData.ph = i / 5; io.userData.wob = Math.random() * Math.PI * 2;
    interior.add(io); ions.push(io);
  }
  // ✨ kilau energi kimia di atas baterai
  const matSpark = new THREE.SpriteMaterial({ map: glowTex, color: 0xd0ff9e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  disposables.push(matSpark);
  const sparks = [];
  [[-0.25, 0.62, 0.08, .34], [0.15, 0.8, -0.1, .26], [0.48, 0.6, 0.1, .3]].forEach(([x, y, z, s], i) => {
    const sp = new THREE.Sprite(matSpark.clone()); disposables.push(sp.material);
    sp.position.set(x, y, z); sp.scale.set(s, s, 1); sp.userData.ph = i * 2.1; sp.userData.s = s;
    bat.add(sp); sparks.push(sp);
  });

  // ---------- lampu (belakang tengah) ----------
  const bulb = new THREE.Group();
  const bulbBase = track(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.34, 20), matBase));
  bulbBase.position.y = 0.17; bulb.add(bulbBase);
  const glass = track(new THREE.Mesh(new THREE.SphereGeometry(0.32, 26, 20), matGlass));
  glass.position.y = 0.62; bulb.add(glass);
  const filament = track(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 8, 20), matFil));
  filament.position.y = 0.6; filament.rotation.x = Math.PI / 2.2; bulb.add(filament);
  const bulbLight = new THREE.PointLight(0xffe9a8, 0, 4, 2); bulbLight.position.set(0, 0.62, 0); bulb.add(bulbLight);
  const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffe08a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  disposables.push(glowMat);
  const glow = new THREE.Sprite(glowMat); glow.scale.set(2.2, 2.2, 1); glow.position.y = 0.62; bulb.add(glow);
  bulb.position.set(0, 0.14, -1.15); group.add(bulb);

  // ---------- saklar (kanan) ----------
  const sw = new THREE.Group();
  const postA = track(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.24, 14), matMetal));
  postA.position.set(0, 0.12, 0.32); sw.add(postA);
  const postB = track(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.24, 14), matMetal));
  postB.position.set(0, 0.12, -0.32); sw.add(postB);
  const pivot = new THREE.Group(); pivot.position.set(0, 0.2, 0.32);
  const lever = track(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.72, 12), matMetal));
  lever.rotation.x = Math.PI / 2; lever.position.z = -0.32; pivot.add(lever);
  const knob = track(new THREE.Mesh(new THREE.SphereGeometry(0.08, 14, 12), matPos));
  knob.position.z = -0.64; pivot.add(knob);
  sw.add(pivot); sw.position.set(1.7, 0.14, 0); group.add(sw);

  // ---------- kabel (tabung, ada celah di saklar) ----------
  const wr = 0.082, yW = 0.12;
  const P = {
    posT: new THREE.Vector3(1.02, 0.34, 1.05),
    r1: new THREE.Vector3(1.7, yW, 1.05),
    swTop: new THREE.Vector3(1.7, yW + 0.14, 0.34),   // ke post depan saklar
    swBot: new THREE.Vector3(1.7, yW + 0.14, -0.34),  // dari post belakang saklar
    r2: new THREE.Vector3(1.7, yW, -1.15),
    bulbR: new THREE.Vector3(0.28, yW, -1.15),
    bulbL: new THREE.Vector3(-0.28, yW, -1.15),
    l1: new THREE.Vector3(-1.7, yW, -1.15),
    l2: new THREE.Vector3(-1.7, yW, 1.05),
    negT: new THREE.Vector3(-1.02, 0.34, 1.05),
  };
  // segmen kabel terlihat (kecuali celah swTop<->swBot yang dijembatani lever)
  const wirePaths = [
    [P.posT, P.r1, P.swTop],
    [P.swBot, P.r2, P.bulbR],
    [P.bulbL, P.l1, P.l2, P.negT],
  ];
  const wireMeshes = [];
  for (const pts of wirePaths) {
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .1);
    const g = new THREE.TubeGeometry(curve, Math.max(16, pts.length * 8), wr, 10, false);
    disposables.push(g);
    const m = track(new THREE.Mesh(g, matWire)); group.add(m); wireMeshes.push(m);
    // sambungan bulat di titik belok
    pts.forEach(p => { const j = track(new THREE.Mesh(new THREE.SphereGeometry(wr, 8, 8), matWire)); j.position.copy(p); group.add(j); });
  }

  // ---------- kurva arus klasik (loop tertutup penuh, utk partikel kuning) ----------
  const loopPts = [P.posT, P.r1, P.swTop, P.swBot, P.r2, P.bulbR, P.bulbL, P.l1, P.l2, P.negT,
    new THREE.Vector3(0, 0.34, 1.05)]; // lewat baterai menutup loop
  const loop = new THREE.CatmullRomCurve3(loopPts, true, 'catmullrom', .1);
  const NP = 22, particles = [];
  const pGeo = new THREE.SphereGeometry(0.075, 10, 10); disposables.push(pGeo);
  for (let i = 0; i < NP; i++) {
    const p = new THREE.Mesh(pGeo, matCurrent); p.visible = false; group.add(p); particles.push(p);
  }

  // ---------- jalur ELEKTRON: kutub − → kabel → kutub + (aliran elektron sebenarnya) ----------
  const eCurve = new THREE.CatmullRomCurve3(
    [P.negT, P.l2, P.l1, P.bulbL, P.bulbR, P.r2, P.swBot, P.swTop, P.r1, P.posT],
    false, 'catmullrom', .1);
  // fraksi lintasan saat elektron TIBA di lampu (titik bulbL)
  let uBulb = 0.4;
  { let best = 1e9; for (let i = 0; i <= 240; i++) { const u = i / 240; const d = eCurve.getPointAt(u).distanceToSquared(P.bulbL); if (d < best) { best = d; uBulb = u; } } }
  const NE = 26, electrons = [];
  const eGeo = new THREE.SphereGeometry(0.06, 10, 10); disposables.push(eGeo);
  const matEGlow = new THREE.SpriteMaterial({ map: glowTex, color: 0x9fd8ff, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false });
  disposables.push(matEGlow);
  for (let i = 0; i < NE; i++) {
    const e = new THREE.Mesh(eGeo, matElectron);
    const gl = new THREE.Sprite(matEGlow); gl.scale.set(0.3, 0.3, 1); e.add(gl);
    e.visible = false; e.renderOrder = 3; group.add(e); electrons.push(e);
  }

  // ---------- state ----------
  const state = { on: false, speed: 1, t: 0, lit: 0, stage: null, cut: 0, wcut: 0, front: 0, eT: 0, time: 0 };
  function setOn(v) { state.on = !!v; }
  function toggle() { setOn(!state.on); return state.on; }
  function setSpeed(s) { state.speed = Math.max(0.1, Math.min(3, s)); }
  function setStage(s) {
    const prev = state.stage;
    state.stage = s || null;
    if (state.stage === 'listrik' && prev !== 'transformasi') state.front = 0; // barisan elektron berangkat dari baterai
    if (state.stage === 'transformasi' && prev !== 'listrik') state.front = 1;
    if (!state.stage) state.on = false;
  }

  function update(dt) {
    dt = Math.min(dt, 0.05);
    state.time += dt;
    const st = state.stage;

    // saklar: menutup saat ON (klasik) atau tahap beraliran (listrik/transformasi)
    const closed = st ? (st !== 'kimia') : state.on;
    const targetRot = closed ? 0 : -0.73;
    pivot.rotation.x += (targetRot - pivot.rotation.x) * Math.min(1, dt * 10);

    // cutaway baterai: tampil di semua tahap alur energi
    const cutT = st ? 1 : 0;
    state.cut += (cutT - state.cut) * Math.min(1, dt * 5);
    matBattery.opacity = 1 - 0.8 * state.cut;
    matBattery.depthWrite = state.cut < 0.03;
    interior.visible = state.cut > 0.03;
    if (interior.visible) {
      for (const c of chems) { // getaran reaksi kimia
        c.position.set(
          c.userData.base.x + Math.sin(state.time * 7 + c.userData.ph) * 0.022,
          c.userData.base.y + Math.cos(state.time * 6.3 + c.userData.ph * 2) * 0.02,
          c.userData.base.z + Math.sin(state.time * 5.1 + c.userData.ph) * 0.02);
      }
      for (const io of ions) { // ion menyeberang elektrolit (− → +)
        const u = (state.time * 0.22 + io.userData.ph) % 1;
        io.position.set(-0.55 + u * 1.1, Math.sin(state.time * 3 + io.userData.wob) * 0.1, Math.cos(state.time * 2.6 + io.userData.wob) * 0.1);
        io.scale.setScalar(0.85 + 0.3 * Math.sin(state.time * 5 + io.userData.wob));
      }
    }
    for (const sp of sparks) { // ✨ energi kimia
      const vis = state.cut > 0.3;
      sp.material.opacity = vis ? (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(state.time * 2.4 + sp.userData.ph))) : 0;
      const s = sp.userData.s * (1 + 0.15 * Math.sin(state.time * 3.1 + sp.userData.ph));
      sp.scale.set(s, s, 1);
    }

    // kabel semi-transparan saat elektron diperlihatkan
    const wcT = (st === 'listrik' || st === 'transformasi') ? 1 : 0;
    state.wcut += (wcT - state.wcut) * Math.min(1, dt * 5);
    matWire.opacity = 1 - 0.55 * state.wcut;
    matWire.depthWrite = state.wcut < 0.03;

    // elektron − → + (front barisan merambat; lampu menunggu kedatangannya)
    const eActive = st === 'listrik' || st === 'transformasi';
    if (eActive) {
      if (state.front < 1) state.front = Math.min(1, state.front + dt * 0.22);
      state.eT = (state.eT + dt * 0.16 * state.speed) % 1;
      for (let i = 0; i < NE; i++) {
        const ti = (state.eT + i / NE) % 1;
        const vis = ti <= state.front + 0.001;
        electrons[i].visible = vis;
        if (vis) {
          eCurve.getPointAt(ti, electrons[i].position);
          electrons[i].scale.setScalar(0.85 + 0.3 * Math.sin((ti * 6 + state.time) * Math.PI * 2));
        }
      }
    } else if (electrons[0].visible) {
      electrons.forEach(e => e.visible = false);
    }

    // lampu: klasik ikut saklar; tahap 'listrik' menunggu elektron tiba; 'transformasi' penuh
    let litT;
    if (!st) litT = state.on ? 1 : 0;
    else if (st === 'kimia') litT = 0;
    else if (st === 'listrik') litT = state.front >= uBulb ? 0.5 : 0;
    else litT = 1;
    state.lit += (litT - state.lit) * Math.min(1, dt * 3.5);
    matFil.emissive.setHex(0xffdf6b); matFil.emissiveIntensity = state.lit * 2.2;
    matFil.color.setRGB(0.42 + state.lit * 0.55, 0.45 + state.lit * 0.5, 0.5 + state.lit * 0.1);
    bulbLight.intensity = state.lit * 2.4;
    glowMat.opacity = state.lit * 0.8;
    const gs = 2.2 * (1 + (st === 'transformasi' ? 0.1 * Math.sin(state.time * 3.2) : 0));
    glow.scale.set(gs, gs, 1);

    // partikel arus klasik (hanya mode klasik)
    if (!st && (state.on || state.lit > 0.01)) {
      state.t = (state.t + dt * 0.14 * state.speed) % 1;
      for (let i = 0; i < NP; i++) {
        const t = (state.t + i / NP) % 1;
        loop.getPointAt(t, particles[i].position);
        const s = 0.7 + 0.6 * Math.sin((t + state.t) * Math.PI * 6);
        particles[i].scale.setScalar(state.lit * (0.6 + 0.4 * s) + 0.001);
        particles[i].visible = state.on;
      }
    } else if (st && particles[0].visible) {
      particles.forEach(p => p.visible = false);
    }
  }

  // ---------- anchor label ----------
  const mkAnchor = (x, y, z) => { const a = new THREE.Object3D(); a.position.set(x, y, z); group.add(a); return a; };
  const anchors = {
    baterai: mkAnchor(0, 0.9, 1.05),
    kabel: mkAnchor(-1.7, 0.55, -0.05),
    saklar: mkAnchor(1.7, 0.95, 0),
    lampu: mkAnchor(0, 1.15, -1.15),
  };

  pivot.rotation.x = -0.73; // mulai OFF

  return {
    group, anchors, setOn, toggle, setSpeed, setStage, update,
    get isOn() { return state.on; },
    get stage() { return state.stage; },
    get lit() { return state.lit; },
    dispose() { disposables.forEach(d => d.dispose && d.dispose()); },
  };
}

// tekstur glow radial
function makeGlowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,224,138,.9)');
  g.addColorStop(.6, 'rgba(255,200,80,.25)'); g.addColorStop(1, 'rgba(255,200,80,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}
