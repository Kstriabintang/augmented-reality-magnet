// Adegan 4 — FOTOSINTESIS: energi cahaya → energi kimia (glukosa) + O₂ → pertumbuhan.
// Konsep dosen (WAJIB): matahari TIDAK "memasak" buah — energi cahaya dipakai daun untuk
// fotosintesis, hasilnya glukosa (energi kimia) yang dipakai tumbuh & membentuk bunga/buah.
// Tahap: cahaya → bahan (H₂O naik + CO₂ masuk) → proses (glukosa + O₂) → tumbuh.
import * as THREE from 'three';
import { sceneBase, makeBoard, makeSun, std, Flow } from '/js/energi/core.js?v=1';

export function makeFotosintesis() {
  const S = sceneBase(['cahaya', 'bahan', 'proses', 'tumbuh']);
  const { group, track, state } = S;
  makeBoard(S, 4.8, 3.4, { top: 0x6db263 });

  // ---------- matahari ----------
  const sun = makeSun(S, { r: .28, pos: [1.85, 2.65, -.8] });

  // ---------- pohon ----------
  const tree = new THREE.Group(); tree.position.set(-.35, 0, -.15); group.add(tree);
  const trunk = track(new THREE.Mesh(new THREE.CylinderGeometry(.15, .23, 1.35, 12), std(0x8a5a33, { roughness: .9 })));
  trunk.position.y = .67; tree.add(trunk);
  const branch = track(new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, .55, 8), std(0x8a5a33, { roughness: .9 })));
  branch.position.set(.3, 1.25, .08); branch.rotation.z = -.7; tree.add(branch);
  // akar terlihat di permukaan
  const rootGeo = new THREE.CylinderGeometry(.045, .09, .5, 8); S.disposables.push(rootGeo);
  const rootMat = std(0x7a4d2b, { roughness: .95 }); S.disposables.push(rootMat);
  [[.24, .05, .18, .9], [-.26, .04, .2, -.85], [.05, .05, -.3, .1]].forEach(([x, y, z, rz]) => {
    const r = new THREE.Mesh(rootGeo, rootMat);
    r.position.set(x, y, z); r.rotation.z = rz; r.rotation.x = z < 0 ? .9 : -.25; tree.add(r);
  });
  // tajuk daun (di-scale saat tumbuh)
  const canopy = new THREE.Group(); canopy.position.y = 1.75; tree.add(canopy);
  const leafMat = std(0x3f9d4e, { roughness: .8, emissive: 0x0c2b12, emissiveIntensity: .35 }); S.disposables.push(leafMat);
  const leafGeo1 = new THREE.SphereGeometry(.58, 18, 14); S.disposables.push(leafGeo1);
  const leafGeo2 = new THREE.SphereGeometry(.4, 16, 12); S.disposables.push(leafGeo2);
  canopy.add(new THREE.Mesh(leafGeo1, leafMat));
  [[.52, -.18, .12], [-.5, -.14, .15], [.1, .28, -.3], [-.15, .12, .38]].forEach(p => {
    const m = new THREE.Mesh(leafGeo2, leafMat); m.position.set(...p); canopy.add(m);
  });
  // pendar fotosintesis di tajuk
  const leafGlow = S.sprite(0xa7f3d0, 2.0, 0); canopy.add(leafGlow);

  // bunga & buah (muncul saat tumbuh)
  const fruitMat = std(0xe8462f, { roughness: .5, emissive: 0x3a0e08, emissiveIntensity: .3 }); S.disposables.push(fruitMat);
  const fruitGeo = new THREE.SphereGeometry(.11, 12, 10); S.disposables.push(fruitGeo);
  const flowerMat = std(0xf9a8d0, { roughness: .6, emissive: 0x50122e, emissiveIntensity: .25 }); S.disposables.push(flowerMat);
  const flowerGeo = new THREE.SphereGeometry(.07, 8, 8); S.disposables.push(flowerGeo);
  const fruits = [];
  [[.45, -.32, .38, 0], [-.5, -.35, .3, 1], [.15, -.5, .5, 2]].forEach(([x, y, z, i]) => {
    const f = new THREE.Mesh(fruitGeo, fruitMat); f.position.set(x, y, z); f.scale.setScalar(.001);
    f.userData.delay = .3 + i * .5; canopy.add(f); fruits.push(f);
  });
  const flowers = [];
  [[.6, .18, .3, 0], [-.55, .22, -.1, 1], [-.05, .55, .3, 2]].forEach(([x, y, z, i]) => {
    const f = new THREE.Mesh(flowerGeo, flowerMat); f.position.set(x, y, z); f.scale.setScalar(.001);
    f.userData.delay = .15 + i * .45; canopy.add(f); flowers.push(f);
  });

  // ---------- aliran ----------
  // cahaya matahari → daun
  const rays = new Flow(S, group, [[1.75, 2.5, -.78], [.9, 2.25, -.5], [-.05, 1.95, -.2]],
    { n: 10, size: .07, shape: 'cone', color: 0xffe08a, glow: 0xffd23e, glowSize: 3.4, speed: .3, fade: true });
  // air dari akar naik lewat batang ke daun (tetes biru)
  const water = new Flow(S, group, [[.05, .06, .35], [-.15, .5, .12], [-.5, 1.05, -.02], [-.3, 1.6, -.1]],
    { n: 8, size: .05, color: 0x63c8f0, glow: 0x9fd8ff, glowSize: 3.2, speed: .14, front: true });
  // CO₂ dari udara masuk ke daun (molekul: 1 C hitam + 2 O abu terang)
  const co2 = new Flow(S, group, [[-2.05, 1.15, .75], [-1.45, 1.35, .45], [-.85, 1.6, .15]],
    {
      n: 5, speed: .12, fade: true, make: () => {
        const g = new THREE.Group();
        const cM = new THREE.MeshBasicMaterial({ color: 0x475569 }); S.disposables.push(cM);
        const oM = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 }); S.disposables.push(oM);
        const cG = new THREE.SphereGeometry(.05, 8, 8); S.disposables.push(cG);
        const oG = new THREE.SphereGeometry(.038, 8, 8); S.disposables.push(oG);
        g.add(new THREE.Mesh(cG, cM));
        const o1 = new THREE.Mesh(oG, oM); o1.position.x = .075; g.add(o1);
        const o2 = new THREE.Mesh(oG, oM); o2.position.x = -.075; g.add(o2);
        return g;
      }
    });
  // O₂ keluar dari daun ke udara (gelembung ganda biru muda)
  const o2 = new Flow(S, group, [[.15, 2.35, -.1], [.55, 2.85, -.3], [1.0, 3.3, -.5]],
    {
      n: 5, speed: .11, fade: true, make: () => {
        const g = new THREE.Group();
        const m = new THREE.MeshBasicMaterial({ color: 0xbfe2ff, transparent: true, opacity: .95 }); S.disposables.push(m);
        const gg = new THREE.SphereGeometry(.045, 8, 8); S.disposables.push(gg);
        g.add(new THREE.Mesh(gg, m));
        const b = new THREE.Mesh(gg, m); b.position.x = .07; g.add(b);
        return g;
      }
    });
  // glukosa (heksagon emas) dari daun turun ke batang/buah — energi kimia disimpan
  const glukosa = new Flow(S, group, [[-.2, 1.85, .15], [-.45, 1.35, .3], [-.35, .8, .35], [-.3, .35, .3]],
    {
      n: 4, speed: .1, fade: true, make: () => {
        const m = new THREE.MeshBasicMaterial({ color: 0xffd23e }); S.disposables.push(m);
        const g = new THREE.CylinderGeometry(.075, .075, .03, 6); S.disposables.push(g);
        const h = new THREE.Mesh(g, m); h.rotation.x = Math.PI / 2; return h;
      }
    });

  // ---------- anchor label ----------
  S.mkAnchors({
    matahari: [1.85, 3.3, -.8],
    cahaya: [.95, 2.6, -.5],
    daun: [-.35, 2.55, -.15],
    air: [-.9, .55, .35],
    co2: [-1.75, 1.7, .6],
    o2: [.75, 3.3, -.4],
    glukosa: [-1.05, 1.25, .45],
    tumbuh: [.55, 1.1, .45],
  });

  // ---------- update ----------
  let grow = 0, glowK = 0;
  function update(dt) {
    dt = S.tick(dt);
    const t = state.time;

    sun.halo.material.opacity = .55 + .2 * Math.sin(t * 1.8);
    const hs = 1.7 * (1 + .06 * Math.sin(t * 2.3)); sun.halo.scale.set(hs, hs, 1);

    // ① cahaya menuju daun
    rays.setActive(S.at('cahaya'));
    rays.update(dt, state.speed);

    // ② bahan baku: air naik dari akar + CO₂ masuk daun
    water.setActive(S.at('bahan'));
    water.update(dt, state.speed);
    co2.setActive(S.at('bahan'));
    co2.update(dt, state.speed);

    // ③ proses di daun: pendar + glukosa terbentuk + O₂ dilepas
    const proc = S.at('proses');
    glowK = S.lerp(glowK, proc ? 1 : 0, dt, 4);
    leafGlow.material.opacity = glowK * (.3 + .22 * (0.5 + 0.5 * Math.sin(t * 3.2)));
    leafMat.emissiveIntensity = .35 + glowK * .55;
    glukosa.setActive(proc);
    glukosa.update(dt, state.speed);
    o2.setActive(proc);
    o2.update(dt, state.speed);

    // ④ tumbuh: tajuk membesar, bunga & buah muncul bertahap
    const g = S.is('tumbuh') ? 1 : 0;
    grow = S.lerp(grow, g, dt, 2.2);
    canopy.scale.setScalar(1 + grow * .14);
    for (const f of [...fruits, ...flowers]) {
      const k = S.is('tumbuh') ? S.seq(f.userData.delay, .7) : 0;
      const target = k * (f.geometry === fruitGeo ? 1 : 1);
      f.scale.setScalar(Math.max(.001, S.lerp(f.scale.x, target, dt, 6)));
    }
    // angin sepoi: tajuk bergoyang halus
    canopy.rotation.z = Math.sin(t * .9) * .022;
    canopy.rotation.x = Math.cos(t * .7) * .016;
  }

  return {
    group, update,
    setStage: S.setStage, setSpeed: S.setSpeed, anchors: S.anchors, dispose: S.dispose,
    debug: () => ({ stage: state.stage, rays: rays.active, water: water.active, co2: co2.active, o2: o2.active, grow: +grow.toFixed(2), fruit: +fruits[0].scale.x.toFixed(2) }),
  };
}
