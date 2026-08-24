// Adegan 6 — PLTU: Batu bara (Energi KIMIA) → PEMBAKARAN (Energi PANAS) → air menjadi
// UAP bertekanan tinggi (Energi KINETIK) → TURBIN berputar (Energi MEKANIK) → GENERATOR
// → Energi LISTRIK → rumah masyarakat. Tahap: kimia → panas → uap → mekanik → listrik.
import * as THREE from 'three';
import { sceneBase, makeBoard, makeHouse, makePole, makeTurbineGen, std, Flow, Puffs } from '/js/energi/core.js?v=1';

export function makePLTU() {
  const S = sceneBase(['kimia', 'panas', 'uap', 'mekanik', 'listrik']);
  const { group, track, state } = S;
  makeBoard(S, 5.6, 3.4);

  // ---------- tumpukan batu bara (kiri) ----------
  const coalMat = std(0x232a36, { roughness: .95 }); S.disposables.push(coalMat);
  const coalGeo = new THREE.DodecahedronGeometry(.13, 0); S.disposables.push(coalGeo);
  const pile = new THREE.Group(); pile.position.set(-2.25, 0, .55); group.add(pile);
  [[0, .1, 0], [.2, .1, .16], [-.2, .1, .14], [.08, .1, -.2], [-.13, .1, -.16], [.02, .3, 0], [-.15, .28, .05], [.16, .28, -.04]].forEach(p => {
    const m = new THREE.Mesh(coalGeo, coalMat); m.position.set(...p);
    m.rotation.set(Math.random() * 3, Math.random() * 3, 0); pile.add(m);
  });
  const coalGlow = S.sprite(0xffc23e, .9, 0); coalGlow.position.set(-2.25, .35, .55); group.add(coalGlow);

  // batu bara "berjalan" ke tungku
  const coalFlow = new Flow(S, group, [[-2.1, .22, .5], [-1.85, .28, .4], [-1.62, .34, .3]],
    { n: 4, speed: .16, fade: true, make: () => new THREE.Mesh(coalGeo, coalMat) });

  // ---------- tungku + boiler ----------
  const furnace = track(new THREE.Mesh(new THREE.BoxGeometry(1.0, .95, 1.05), std(0x9a4632, { roughness: .85 })));
  furnace.position.set(-1.15, .48, .1); group.add(furnace);
  // pintu tungku (bara menyala)
  const matDoor = new THREE.MeshStandardMaterial({ color: 0x351410, roughness: .6, emissive: 0x000000, emissiveIntensity: 1 });
  S.disposables.push(matDoor);
  const doorF = track(new THREE.Mesh(new THREE.BoxGeometry(.4, .34, .05), matDoor));
  doorF.position.set(-1.5, .38, .62); doorF.rotation.y = -.15; group.add(doorF);
  // api dalam tungku
  const flames = [];
  [[-1.35, .55, .45, .5], [-1.15, .62, .4, .62], [-.95, .52, .45, .45]].forEach(([x, y, z, s], i) => {
    const f = S.sprite(i === 1 ? 0xff8a3c : 0xffb020, s, 0); f.position.set(x, y, z);
    f.userData = { ph: i * 1.7, s }; group.add(f); flames.push(f);
  });
  // boiler: tangki air di atas tungku, jendela kaca memperlihatkan air + gelembung
  const boiler = track(new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 1.0, 20), std(0x8fa3c2, { metalness: .55, roughness: .35 })));
  boiler.position.set(-1.15, 1.5, .1); group.add(boiler);
  const matBWater = new THREE.MeshStandardMaterial({ color: 0x3aa2e0, roughness: .3, transparent: true, opacity: .9, emissive: 0x0a3a5c, emissiveIntensity: .3 });
  S.disposables.push(matBWater);
  const bWin = track(new THREE.Mesh(new THREE.BoxGeometry(.5, .62, .1), matBWater));
  bWin.position.set(-1.15, 1.42, .5); group.add(bWin);
  const bWinFrame = track(new THREE.Mesh(new THREE.BoxGeometry(.58, .7, .06), std(0x4b5a74, { metalness: .5 })));
  bWinFrame.position.set(-1.15, 1.42, .46); group.add(bWinFrame);
  const heatGlow = S.sprite(0xff6a3c, 1.1, 0); heatGlow.position.set(-1.15, 1.0, .35); group.add(heatGlow);
  // gelembung air mendidih (naik di jendela boiler)
  const bubbles = new Puffs(S, group, { origin: [-1.15, 1.2, .52], dir: [0, 1, 0], spread: .16, len: .42, life: 1.1, size: .07, grow: .8, color: 0xd6ecff, opacity: .8, n: 7 });

  // cerobong + asap
  const stack = track(new THREE.Mesh(new THREE.CylinderGeometry(.14, .18, 1.7, 12), std(0xb8c2d4)));
  stack.position.set(-1.72, 1.6, -.5); group.add(stack);
  const smoke = new Puffs(S, group, { origin: [-1.72, 2.5, -.5], dir: [.25, 1, -.05], spread: .2, len: 1.0, life: 2.2, size: .2, grow: 2.2, color: 0xcbd5e1, opacity: .4, n: 8 });

  // ---------- pipa uap: boiler → turbin ----------
  const steamPts = [[-1.15, 2.05, .1], [-.6, 2.25, .15], [0, 1.7, .2], [.35, 1.0, .2], [.62, .62, .25]];
  const matPipe = std(0x8fa3c2, { transparent: true, opacity: .4, roughness: .25, depthWrite: false }); S.disposables.push(matPipe);
  {
    const curve = new THREE.CatmullRomCurve3(steamPts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', .1);
    const g = new THREE.TubeGeometry(curve, 40, .11, 12, false); S.disposables.push(g);
    group.add(new THREE.Mesh(g, matPipe));
  }
  const steam = new Flow(S, group, steamPts, { n: 14, size: .065, color: 0xeef4fb, glow: 0xdbeafe, glowSize: 3.6, speed: .26, front: true });

  // ---------- turbin + generator ----------
  const tg = makeTurbineGen(S, { pos: [.85, 0, .2] });

  // ---------- transmisi + rumah ----------
  const pole = makePole(S, { pos: [1.85, 0, -.6], h: 1.6 });
  const houseA = makeHouse(S, { scale: .6, pos: [2.42, 0, .6], ry: -.5 });
  const houseB = makeHouse(S, { scale: .5, pos: [2.42, 0, -1.15], ry: .3 });
  const cableAPts = [[.85, .78, -.22], [1.35, 1.3, -.42], pole.top.toArray(), [2.2, 1.12, -.05], [2.42, .75, .5]];
  const cableBPts = [pole.top.toArray(), [2.3, 1.0, -.72], [2.42, .62, -1.05]];
  const matCable = std(0x1c2434, { roughness: .6 }); S.disposables.push(matCable);
  for (const pts of [cableAPts, cableBPts]) {
    const curve = new THREE.CatmullRomCurve3(pts.map(p => Array.isArray(p) ? new THREE.Vector3(...p) : p), false, 'catmullrom', .3);
    const g = new THREE.TubeGeometry(curve, 30, .022, 6, false); S.disposables.push(g);
    group.add(new THREE.Mesh(g, matCable));
  }
  const currentA = new Flow(S, group, cableAPts, { n: 10, size: .045, color: 0xffd54a, glow: 0xffc23e, glowSize: 4.2, speed: .22, front: true });
  const currentB = new Flow(S, group, cableBPts, { n: 6, size: .045, color: 0xffd54a, glow: 0xffc23e, glowSize: 4.2, speed: .22, front: true });

  // ---------- anchor label ----------
  S.mkAnchors({
    batubara: [-2.25, .85, .55],
    tungku: [-1.5, .05, 1.0],
    boiler: [-1.15, 2.35, .1],
    uap: [-.35, 2.5, .2],
    turbin: [.85, 1.25, .55],
    generator: [1.1, 1.35, -.35],
    listrik: [1.85, 1.95, -.55],
    rumah: [2.55, 1.3, .6],
  });

  // ---------- update ----------
  let fire = 0, spin = 0, lit = 0;
  function update(dt) {
    dt = S.tick(dt);
    const t = state.time;

    // ① kimia: batu bara disorot + masuk tungku
    coalGlow.material.opacity = S.at('kimia') ? (.28 + .22 * (0.5 + 0.5 * Math.sin(t * 2.4))) : 0;
    coalFlow.setActive(S.at('kimia'));
    coalFlow.update(dt, state.speed);

    // ② panas: api membakar, boiler memerah, air mendidih, cerobong berasap
    fire = S.lerp(fire, S.at('panas') ? 1 : 0, dt, 3);
    for (const f of flames) {
      f.material.opacity = fire * (.5 + .4 * (0.5 + 0.5 * Math.sin(t * 6 + f.userData.ph)));
      const s = f.userData.s * (1 + .22 * Math.sin(t * 7 + f.userData.ph)); f.scale.set(s, s, 1);
    }
    matDoor.emissive.setHex(0xff5a2c); matDoor.emissiveIntensity = fire * 1.3;
    heatGlow.material.opacity = fire * (.2 + .16 * (0.5 + 0.5 * Math.sin(t * 3)));
    matBWater.emissiveIntensity = .3 + fire * .5;
    bubbles.setActive(fire > .5);
    bubbles.update(dt, t);
    smoke.setActive(fire > .5);
    smoke.update(dt, t);

    // ③ uap bertekanan tinggi menuju turbin
    steam.setActive(S.at('uap'));
    steam.update(dt, state.speed);

    // ④ mekanik: turbin + generator berputar
    const mek = S.at('mekanik');
    spin = S.lerp(spin, mek ? 8.5 * state.speed : 0, dt, 2.2);
    tg.spin(dt, spin);
    tg.gen.rotation.z -= spin * dt * .9;

    // ⑤ listrik: arus ke rumah, jendela menyala
    const el = S.at('listrik');
    tg.spark.material.opacity = el ? (.35 + .3 * (0.5 + 0.5 * Math.sin(t * 5))) : 0;
    currentA.setActive(el); currentB.setActive(el);
    currentA.update(dt, state.speed); currentB.update(dt, state.speed);
    lit = S.lerp(lit, el && currentA.front > .85 ? 1 : 0, dt, 3);
    houseA.setLit(lit); houseB.setLit(lit);
  }

  return {
    group, update,
    setStage: S.setStage, setSpeed: S.setSpeed, anchors: S.anchors, dispose: S.dispose,
    debug: () => ({ stage: state.stage, fire: +fire.toFixed(2), steam: steam.active, spin: +spin.toFixed(1), lit: +lit.toFixed(2) }),
  };
}
