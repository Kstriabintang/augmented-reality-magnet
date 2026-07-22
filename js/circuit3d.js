// Rangkaian listrik 3D — builder bersama untuk penampil 3D (/listrik/3d/) & AR (/listrik/ar/).
// makeCircuit() -> { group, setOn(bool), toggle(), update(dt), setSpeed(s), anchors, isOn, dispose() }
// Konvensi: baterai di depan (z+), lampu di belakang (z-), saklar di kanan (x+). Kutub + kanan (merah), − kiri (biru).
import * as THREE from 'three';

export function makeCircuit() {
  const group = new THREE.Group();
  const disposables = [];
  const track = o => { if (o.geometry) disposables.push(o.geometry); if (o.material) disposables.push(o.material); return o; };

  // ---------- material ----------
  const matBoard = new THREE.MeshStandardMaterial({ color: 0x243350, roughness: .92, metalness: .04 });
  const matBoardEdge = new THREE.MeshStandardMaterial({ color: 0x2f4266, roughness: .8, metalness: .1 });
  const matWire = new THREE.MeshStandardMaterial({ color: 0xd08a3c, roughness: .32, metalness: .72, emissive: 0x2a1400, emissiveIntensity: .25 });
  const matMetal = new THREE.MeshStandardMaterial({ color: 0xcdd7e6, roughness: .3, metalness: .8 });
  const matBattery = new THREE.MeshStandardMaterial({ color: 0x2b3446, roughness: .5, metalness: .3 });
  const matPos = new THREE.MeshStandardMaterial({ color: 0xe8462f, roughness: .4, emissive: 0x3a0e08, emissiveIntensity: .4 });
  const matNeg = new THREE.MeshStandardMaterial({ color: 0x2f6fd0, roughness: .4, emissive: 0x081a3a, emissiveIntensity: .4 });
  const matBase = new THREE.MeshStandardMaterial({ color: 0x8a6a2a, roughness: .6, metalness: .4 });
  const matGlass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, metalness: 0, transmission: .9, transparent: true, opacity: .35, thickness: .4, ior: 1.4 });
  const matFil = new THREE.MeshStandardMaterial({ color: 0x6b7280, emissive: 0x000000, emissiveIntensity: 1, roughness: .4 });
  const matCurrent = new THREE.MeshBasicMaterial({ color: 0xffd54a });
  [matBoard, matBoardEdge, matWire, matMetal, matBattery, matPos, matNeg, matBase, matGlass, matFil, matCurrent].forEach(m => disposables.push(m));

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
  const posTerm = new THREE.Vector3(1.02, 0.34, 1.05);   // + keluar kanan
  const negTerm = new THREE.Vector3(-1.02, 0.34, 1.05);  // − keluar kiri

  // ---------- lampu (belakang tengah) ----------
  const bulb = new THREE.Group();
  const bulbBase = track(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.34, 20), matBase));
  bulbBase.position.y = 0.17; bulb.add(bulbBase);
  const glass = track(new THREE.Mesh(new THREE.SphereGeometry(0.32, 26, 20), matGlass));
  glass.position.y = 0.62; bulb.add(glass);
  const filament = track(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 8, 20), matFil));
  filament.position.y = 0.6; filament.rotation.x = Math.PI / 2.2; bulb.add(filament);
  const bulbLight = new THREE.PointLight(0xffe9a8, 0, 4, 2); bulbLight.position.set(0, 0.62, 0); bulb.add(bulbLight);
  // glow sprite
  const glowTex = makeGlowTexture(); disposables.push(glowTex);
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

  // ---------- kurva arus (loop tertutup penuh, utk partikel) ----------
  const loopPts = [P.posT, P.r1, P.swTop, P.swBot, P.r2, P.bulbR, P.bulbL, P.l1, P.l2, P.negT,
    new THREE.Vector3(0, 0.34, 1.05)]; // lewat baterai menutup loop
  const loop = new THREE.CatmullRomCurve3(loopPts, true, 'catmullrom', .1);
  const NP = 22, particles = [];
  const pGeo = new THREE.SphereGeometry(0.075, 10, 10); disposables.push(pGeo);
  for (let i = 0; i < NP; i++) {
    const p = new THREE.Mesh(pGeo, matCurrent); p.visible = false; group.add(p); particles.push(p);
  }

  // ---------- state ----------
  const state = { on: false, speed: 1, t: 0, litTarget: 0, lit: 0 };
  function setOn(v) {
    state.on = !!v;
    state.litTarget = v ? 1 : 0;
    particles.forEach(p => p.visible = state.on);
  }
  function toggle() { setOn(!state.on); return state.on; }
  function setSpeed(s) { state.speed = Math.max(0.1, Math.min(3, s)); }

  function update(dt) {
    dt = Math.min(dt, 0.05);
    // saklar: lever menutup (0°) saat ON, membuka (-42°) saat OFF
    const targetRot = state.on ? 0 : -0.73;
    pivot.rotation.x += (targetRot - pivot.rotation.x) * Math.min(1, dt * 10);
    // lampu menyala halus
    state.lit += (state.litTarget - state.lit) * Math.min(1, dt * 6);
    matFil.emissive.setHex(0xffdf6b); matFil.emissiveIntensity = state.lit * 2.2;
    matFil.color.setRGB(0.42 + state.lit * 0.55, 0.45 + state.lit * 0.5, 0.5 + state.lit * 0.1);
    bulbLight.intensity = state.lit * 2.4;
    glowMat.opacity = state.lit * 0.8;
    // partikel arus
    if (state.on || state.lit > 0.01) {
      state.t = (state.t + dt * 0.14 * state.speed) % 1;
      for (let i = 0; i < NP; i++) {
        const t = (state.t + i / NP) % 1;
        loop.getPointAt(t, particles[i].position);
        const s = 0.7 + 0.6 * Math.sin((t + state.t) * Math.PI * 6);
        particles[i].scale.setScalar(state.lit * (0.6 + 0.4 * s) + 0.001);
        particles[i].visible = state.on;
      }
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
    group, anchors, setOn, toggle, setSpeed, update,
    get isOn() { return state.on; },
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
