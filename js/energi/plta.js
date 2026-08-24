// Adegan 5 — PLTA: Energi POTENSIAL gravitasi air (waduk tinggi) → Energi KINETIK
// (air mengalir di pipa pesat) → Energi MEKANIK (turbin memutar generator) →
// Energi LISTRIK → rumah masyarakat. Tahap: potensial → kinetik → mekanik → listrik.
import * as THREE from 'three';
import { sceneBase, makeBoard, makeHouse, makePole, makeTurbineGen, std, Flow } from '/js/energi/core.js?v=1';

export function makePLTA() {
  const S = sceneBase(['potensial', 'kinetik', 'mekanik', 'listrik']);
  const { group, track, state } = S;
  makeBoard(S, 5.6, 3.4, { top: 0x6db263 });

  // ---------- bukit + waduk (kiri, tinggi) ----------
  const hill = track(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 3.1), std(0x74a06a, { roughness: .95 })));
  hill.position.set(-1.85, .75, 0); group.add(hill);
  const hillFace = track(new THREE.Mesh(new THREE.BoxGeometry(.18, 1.5, 3.1), std(0x8a7a5c, { roughness: .95 })));
  hillFace.position.set(-.93, .75, 0); group.add(hillFace);
  // dinding bendungan
  const dam = track(new THREE.Mesh(new THREE.BoxGeometry(.3, 1.62, 2.6), std(0xcfd6e2, { roughness: .7 })));
  dam.position.set(-.86, .81, 0); group.add(dam);
  const damTop = track(new THREE.Mesh(new THREE.BoxGeometry(.44, .1, 2.7), std(0xb8c2d4)));
  damTop.position.set(-.86, 1.66, 0); group.add(damTop);
  // air waduk
  const matWater = new THREE.MeshStandardMaterial({ color: 0x3aa2e0, roughness: .25, transparent: true, opacity: .85, emissive: 0x0a3a5c, emissiveIntensity: .35 });
  S.disposables.push(matWater);
  const lake = track(new THREE.Mesh(new THREE.BoxGeometry(1.6, .22, 2.6), matWater));
  lake.position.set(-1.85, 1.5, 0); group.add(lake);
  const lakeGlow = S.sprite(0x7fd0ff, 1.6, 0); lakeGlow.position.set(-1.85, 1.75, 0); group.add(lakeGlow);

  // ---------- pipa pesat (penstock) semi transparan: waduk → turbin ----------
  const penPts = [[-1.35, 1.32, .25], [-.7, .95, .25], [-.15, .55, .25], [.35, .42, .25]];
  const matPipe = std(0x8fa3c2, { transparent: true, opacity: .4, roughness: .25, depthWrite: false }); S.disposables.push(matPipe);
  {
    const curve = new THREE.CatmullRomCurve3(penPts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', .1);
    const g = new THREE.TubeGeometry(curve, 40, .15, 12, false); S.disposables.push(g);
    group.add(new THREE.Mesh(g, matPipe));
    // mulut pipa di waduk
    const inlet = track(new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .2, 12), std(0x63a0ee)));
    inlet.position.set(-1.35, 1.32, .25); inlet.rotation.z = 1.05; group.add(inlet);
  }
  // air di dalam pipa (deras saat tahap ≥ kinetik)
  const water = new Flow(S, group, penPts, { n: 14, size: .07, color: 0x9fe0ff, glow: 0x7fd0ff, glowSize: 3.4, speed: .3, front: true });

  // ---------- turbin + generator ----------
  const tg = makeTurbineGen(S, { pos: [.62, 0, .2] });

  // ---------- transmisi: tiang + kabel → 2 rumah ----------
  const pole = makePole(S, { pos: [1.72, 0, -.65], h: 1.6 });
  const houseA = makeHouse(S, { scale: .62, pos: [2.35, 0, .55], ry: -.5 });
  const houseB = makeHouse(S, { scale: .5, pos: [2.35, 0, -1.15], ry: .3 });
  const cableAPts = [[.62, .78, -.22], [1.15, 1.3, -.45], pole.top.toArray(), [2.1, 1.15, -.1], [2.35, .78, .45]];
  const cableBPts = [pole.top.toArray(), [2.2, 1.0, -.75], [2.35, .62, -1.05]];
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
    waduk: [-1.85, 2.15, 0],
    potensial: [-1.85, 1.15, 1.35],
    pipa: [-.55, 1.35, .35],
    turbin: [.62, 1.25, .55],
    generator: [.85, 1.35, -.35],
    listrik: [1.72, 1.95, -.6],
    rumah: [2.5, 1.35, .55],
  });

  // ---------- update ----------
  let spin = 0, lit = 0;
  function update(dt) {
    dt = S.tick(dt);
    const t = state.time;

    // ① potensial: permukaan waduk berkilau + bergerak halus (air tersimpan TINGGI)
    const pot = S.at('potensial');
    lakeGlow.material.opacity = pot ? (.22 + .2 * (0.5 + 0.5 * Math.sin(t * 2.2))) : 0;
    matWater.emissiveIntensity = .35 + (pot ? .3 * (0.5 + 0.5 * Math.sin(t * 2.2)) : 0);
    lake.position.y = 1.5 + Math.sin(t * 1.6) * .012;

    // ② kinetik: air deras di pipa pesat
    water.setActive(S.at('kinetik'));
    water.update(dt, state.speed);

    // ③ mekanik: turbin & generator berputar (air terus mengalir)
    const mek = S.at('mekanik');
    spin = S.lerp(spin, mek ? 8.5 * state.speed : 0, dt, 2.2);
    tg.spin(dt, spin);
    tg.gen.rotation.z -= spin * dt * .9;

    // ④ listrik: percikan generator + arus di kabel + rumah menyala
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
    debug: () => ({ stage: state.stage, water: water.active, spin: +spin.toFixed(1), lit: +lit.toFixed(2), frontA: +currentA.front.toFixed(2) }),
  };
}
