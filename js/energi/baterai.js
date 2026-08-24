// Adegan 1 — BATERAI → ENERGI LISTRIK → SMARTPHONE.
// Konsep (spesifikasi dosen): ion bergerak DI DALAM baterai (internal); elektron mengalir
// lewat RANGKAIAN LUAR (kabel) dari kutub − ke +; listrik di smartphone menjadi
// cahaya (layar) + suara (speaker) + panas. Tahap: kimia → listrik → guna.
import * as THREE from 'three';
import { sceneBase, makeBoard, std, Flow, Puffs, Rings } from '/js/energi/core.js?v=1';

export function makeBaterai() {
  const S = sceneBase(['kimia', 'listrik', 'guna']);
  const { group, track, state } = S;
  makeBoard(S, 5.0, 3.2);

  // ---------- baterai (kiri, sumbu X; + kanan merah, − kiri biru) ----------
  const bat = new THREE.Group();
  const matBattery = std(0x2b3446, { roughness: .5, metalness: .3, transparent: true });
  S.disposables.push(matBattery);
  const body = track(new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, 1.5, 28), matBattery));
  body.rotation.z = Math.PI / 2; bat.add(body);
  const matPos = std(0xe8462f, { emissive: 0x3a0e08, emissiveIntensity: .4 }); S.disposables.push(matPos);
  const matNeg = std(0x2f6fd0, { emissive: 0x081a3a, emissiveIntensity: .4 }); S.disposables.push(matNeg);
  const capP = track(new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .16, 20), matPos));
  capP.rotation.z = Math.PI / 2; capP.position.x = .82; bat.add(capP);
  const nubP = track(new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .12, 16), matPos));
  nubP.rotation.z = Math.PI / 2; nubP.position.x = .95; bat.add(nubP);
  const capN = track(new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, .06, 20), matNeg));
  capN.rotation.z = Math.PI / 2; capN.position.x = -.78; bat.add(capN);
  bat.position.set(-1.15, .34, .55); group.add(bat);

  // isi baterai (cutaway): anoda − | pemisah | elektrolit | katoda + ; ion menyeberang DI DALAM
  const interior = new THREE.Group(); interior.visible = false; bat.add(interior);
  const anoda = track(new THREE.Mesh(new THREE.BoxGeometry(.38, .42, .42), std(0x46587c, { emissive: 0x0a1530, emissiveIntensity: .5 })));
  anoda.position.x = -.44; interior.add(anoda);
  const elek = track(new THREE.Mesh(new THREE.BoxGeometry(.4, .38, .38), std(0x59d8e8, { transparent: true, opacity: .4, emissive: 0x0a3a44, emissiveIntensity: .8 })));
  interior.add(elek);
  // pemisah/separator (garis tipis di tengah elektrolit)
  const sep = track(new THREE.Mesh(new THREE.BoxGeometry(.03, .4, .4), std(0xf1f5fb, { transparent: true, opacity: .8 })));
  interior.add(sep);
  const katoda = track(new THREE.Mesh(new THREE.BoxGeometry(.38, .42, .42), std(0xc98a3a, { metalness: .6, emissive: 0x2a1400, emissiveIntensity: .4 })));
  katoda.position.x = .44; interior.add(katoda);
  // ion + (hijau-toska, − → + ) dan ion − (ungu muda, + → −) — simbol ion bergerak internal
  const ionGeoP = new THREE.SphereGeometry(.045, 8, 8); S.disposables.push(ionGeoP);
  const matIonP = new THREE.MeshBasicMaterial({ color: 0x7ef0d0 }); S.disposables.push(matIonP);
  const matIonN = new THREE.MeshBasicMaterial({ color: 0xd8b4fe }); S.disposables.push(matIonN);
  const ions = [];
  for (let i = 0; i < 8; i++) {
    const neg = i % 2 === 1;
    const io = new THREE.Mesh(ionGeoP, neg ? matIonN : matIonP);
    io.userData = { ph: i / 8, wob: Math.random() * Math.PI * 2, neg };
    interior.add(io); ions.push(io);
  }
  // butir zat kimia bergetar (reaksi)
  const chemGeo = new THREE.SphereGeometry(.05, 8, 8); S.disposables.push(chemGeo);
  const matChem = std(0x5e7038, { emissive: 0x1a2408, emissiveIntensity: .6 }); S.disposables.push(matChem);
  const chems = [];
  for (let i = 0; i < 8; i++) {
    const c = new THREE.Mesh(chemGeo, matChem);
    c.userData = { base: new THREE.Vector3(-.62 + Math.random() * 1.2, -.13 + Math.random() * .26, -.13 + Math.random() * .26), ph: Math.random() * Math.PI * 2 };
    c.position.copy(c.userData.base); interior.add(c); chems.push(c);
  }
  // ✨ kilau reaksi kimia
  const sparks = [];
  [[-.3, .6, .1, .32], [.1, .78, -.08, .26], [.45, .58, .12, .3]].forEach(([x, y, z, s], i) => {
    const sp = S.sprite(0xd0ff9e, s, 0); sp.position.set(x, y, z); sp.userData = { ph: i * 2.1, s };
    bat.add(sp); sparks.push(sp);
  });

  // ---------- smartphone (kanan, berdiri di dudukan) ----------
  const phone = new THREE.Group();
  const frame = track(new THREE.Mesh(new THREE.BoxGeometry(.9, 1.7, .1), std(0x1c2434, { roughness: .35, metalness: .5 })));
  phone.add(frame);
  // layar: tekstur kanvas "UI HP" + emissive dinaikkan saat menyala
  const scrTex = makeScreenTexture(); S.disposables.push(scrTex);
  const matScr = new THREE.MeshStandardMaterial({ map: scrTex, roughness: .3, emissive: 0xffffff, emissiveMap: scrTex, emissiveIntensity: 0, color: 0x232c3e });
  S.disposables.push(matScr);
  const scr = track(new THREE.Mesh(new THREE.PlaneGeometry(.78, 1.56), matScr));
  scr.position.z = .052; phone.add(scr);
  const camDot = track(new THREE.Mesh(new THREE.CircleGeometry(.03, 12), new THREE.MeshBasicMaterial({ color: 0x0a0f1a })));
  camDot.position.set(0, .7, .056); phone.add(camDot);
  // speaker bawah
  const spk = track(new THREE.Mesh(new THREE.BoxGeometry(.3, .035, .03), std(0x0e1420)));
  spk.position.set(0, -.79, .052); phone.add(spk);
  const scrGlow = S.sprite(0xbfe2ff, 2.1, 0); scrGlow.position.z = .3; phone.add(scrGlow);
  const scrLight = new THREE.PointLight(0xcfe6ff, 0, 3.4, 2); scrLight.position.set(0, 0, .5); phone.add(scrLight);
  phone.position.set(1.5, 1.13, -.35); phone.rotation.y = -.34;
  group.add(phone);
  // dudukan
  const dockM = std(0x2f4266, { roughness: .8 }); S.disposables.push(dockM);
  const dock = track(new THREE.Mesh(new THREE.BoxGeometry(.66, .28, .5), dockM));
  dock.position.set(1.5, .14, -.35); group.add(dock);

  // suara: cincin dari speaker · panas: kepulan di belakang HP
  const rings = new Rings(S, group, { origin: [1.44, .5, -.12], normal: [.28, -.6, .75], color: 0xbfe2ff, opacity: .5, r1: .62 });
  const heat = new Puffs(S, group, { origin: [1.72, 2.05, -.62], dir: [.12, 1, -.1], len: .7, life: 1.5, size: .2, color: 0xffb199, opacity: .3, n: 6 });

  // ---------- kabel: + → HP → − (dua jalur terlihat, elektron mengalir − → +) ----------
  const wr = .07;
  const matWire = std(0xd08a3c, { metalness: .72, roughness: .32, emissive: 0x2a1400, emissiveIntensity: .25, transparent: true });
  S.disposables.push(matWire);
  const posT = [-.2, .34, .55], negT = [-2.1, .34, .55];
  const portIn = [1.28, .35, -.13], portOut = [1.62, .3, -.5]; // masuk/keluar bawah HP
  const pathA = [posT, [-.1, .12, 1.1], [.9, .12, .75], [1.5, .12, .25], portIn];             // + → HP
  const pathB = [portOut, [1.35, .12, -1.05], [-.6, .12, -1.15], [-2.3, .12, -.55], [-2.35, .2, .2], negT]; // HP → −
  for (const pts of [pathA, pathB]) {
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', .1);
    const g = new THREE.TubeGeometry(curve, 40, wr, 10, false); S.disposables.push(g);
    group.add(new THREE.Mesh(g, matWire));
    pts.forEach(p => { const j = new THREE.Mesh(new THREE.SphereGeometry(wr, 8, 8), matWire); S.disposables.push(j.geometry); j.position.set(...p); group.add(j); });
  }
  // elektron: kutub − → (jalur B terbalik) → HP → (jalur A terbalik) → kutub +
  const ePts = [negT, [-2.35, .2, .2], [-2.3, .12, -.55], [-.6, .12, -1.15], [1.35, .12, -1.05], portOut,
    [1.5, .22, -.33], portIn, [1.5, .12, .25], [.9, .12, .75], [-.1, .12, 1.1], posT];
  const electrons = new Flow(S, group, ePts, { n: 24, size: .055, color: 0x9fd8ff, glow: 0x9fd8ff, glowSize: 4.5, speed: .14, front: true });
  const uPhone = electrons.uNear(portOut); // elektron TIBA di HP → layar mulai redup menyala

  // ---------- anchor label ----------
  S.mkAnchors({
    baterai: [-1.15, 1.0, .55],
    hp: [1.5, 2.2, -.35],
    anoda: [-1.62, -.02, .95],
    katoda: [-.68, -.02, .95],
    ion: [-1.15, -.18, 1.1],
    elektron: [-.5, .42, -1.15],
    listrik: [1.15, .45, .55],
    layar: [.85, 1.75, -.1],
    suara: [1.6, .18, .35],
    panas: [2.05, 1.9, -.75],
  });

  // ---------- update ----------
  let cut = 0, lit = 0, wcut = 0;
  function update(dt) {
    dt = S.tick(dt);
    const t = state.time;

    // cutaway baterai tampil di semua tahap
    cut = S.lerp(cut, state.stage ? 1 : 0, dt, 5);
    matBattery.opacity = 1 - .8 * cut;
    matBattery.depthWrite = cut < .03;
    interior.visible = cut > .03;
    if (interior.visible) {
      for (const c of chems) {
        c.position.set(
          c.userData.base.x + Math.sin(t * 7 + c.userData.ph) * .022,
          c.userData.base.y + Math.cos(t * 6.3 + c.userData.ph * 2) * .02,
          c.userData.base.z + Math.sin(t * 5.1 + c.userData.ph) * .02);
      }
      for (const io of ions) { // ion + ke kanan (→ katoda), ion − ke kiri (→ anoda) — internal
        const u = (t * .2 * state.speed + io.userData.ph) % 1;
        const x = io.userData.neg ? (.5 - u) : (u - .5);
        io.position.set(x * 1.1, Math.sin(t * 3 + io.userData.wob) * .1, Math.cos(t * 2.6 + io.userData.wob) * .1);
        io.scale.setScalar(.85 + .3 * Math.sin(t * 5 + io.userData.wob));
      }
    }
    for (const sp of sparks) {
      sp.material.opacity = cut > .3 ? (.28 + .4 * (0.5 + 0.5 * Math.sin(t * 2.4 + sp.userData.ph))) : 0;
      const s = sp.userData.s * (1 + .15 * Math.sin(t * 3.1 + sp.userData.ph));
      sp.scale.set(s, s, 1);
    }

    // kabel semi-transparan saat elektron terlihat
    wcut = S.lerp(wcut, S.at('listrik') ? 1 : 0, dt, 5);
    matWire.opacity = 1 - .55 * wcut;
    matWire.depthWrite = wcut < .03;

    electrons.setActive(S.at('listrik'));
    electrons.update(dt, state.speed);

    // layar HP: mulai redup saat elektron TIBA (sebab-akibat), penuh di tahap guna
    let litT = 0;
    if (S.is('listrik')) litT = electrons.front >= uPhone ? .38 : 0;
    else if (S.is('guna')) litT = 1;
    lit = S.lerp(lit, litT, dt, 3.5);
    matScr.emissiveIntensity = lit * 1.15;
    scrGlow.material.opacity = lit * .5 * (1 + (S.is('guna') ? .12 * Math.sin(t * 3) : 0));
    scrLight.intensity = lit * 1.8;

    // hasil: suara (cincin) + panas (kepulan) hanya tahap guna
    rings.setActive(S.is('guna'));
    rings.update(dt);
    heat.setActive(S.is('guna'));
    heat.update(dt, t);
  }

  return {
    group, update,
    setStage: S.setStage, setSpeed: S.setSpeed, anchors: S.anchors, dispose: S.dispose,
    debug: () => ({ stage: state.stage, cut: +cut.toFixed(2), lit: +lit.toFixed(2), front: +electrons.front.toFixed(2), rings: rings.active, heat: heat.active }),
  };
}

// tekstur layar HP (UI sederhana: status bar + ikon aplikasi)
function makeScreenTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256;
  const x = c.getContext('2d');
  const bg = x.createLinearGradient(0, 0, 0, 256);
  bg.addColorStop(0, '#3d6ff0'); bg.addColorStop(1, '#7c3aed');
  x.fillStyle = bg; x.fillRect(0, 0, 128, 256);
  x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(10, 8, 34, 6); // jam
  x.beginPath(); x.arc(112, 11, 4, 0, 7); x.fill();
  const cols = ['#ffd23e', '#7ef0b0', '#ff8a6d', '#bfe2ff', '#f9a8d0', '#fff3b0', '#a7f3d0', '#c4b5fd'];
  let i = 0;
  for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) {
    x.fillStyle = cols[i++ % cols.length];
    roundRect(x, 12 + q * 28, 34 + r * 30, 20, 20, 5);
  }
  x.fillStyle = 'rgba(255,255,255,.85)'; roundRect(x, 14, 172, 100, 30, 8);
  x.fillStyle = 'rgba(255,255,255,.6)'; roundRect(x, 14, 210, 100, 30, 8);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
  return t;
}
function roundRect(x, a, b, w, h, r) {
  x.beginPath(); x.moveTo(a + r, b);
  x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r);
  x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); x.fill();
}
