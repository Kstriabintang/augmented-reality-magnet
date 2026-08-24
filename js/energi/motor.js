// Adegan 3 — KENDARAAN BERMOTOR: BENSIN → GERAK.
// Konsep dosen (WAJIB): Energi KIMIA (bensin) → PEMBAKARAN → Energi PANAS →
// Energi MEKANIK (piston & mesin) → Energi KINETIK (kendaraan bergerak).
// ❌ jangan "kinetik → gerak". Energi terbuang: panas ke lingkungan + suara.
// Tahap: kimia → panas → mekanik → kinetik.
import * as THREE from 'three';
import { sceneBase, makeBoard, std, Flow, Puffs, Rings } from '/js/energi/core.js?v=1';

export function makeMotor() {
  const S = sceneBase(['kimia', 'panas', 'mekanik', 'kinetik']);
  const { group, track, state } = S;
  makeBoard(S, 5.4, 3.0);

  // ---------- jalan (tekstur menggulung ke belakang saat mobil "melaju") ----------
  const roadTex = makeRoadTexture(); S.disposables.push(roadTex);
  roadTex.wrapS = THREE.RepeatWrapping; roadTex.repeat.set(3, 1);
  const road = track(new THREE.Mesh(new THREE.BoxGeometry(5.34, .05, 1.9),
    new THREE.MeshStandardMaterial({ map: roadTex, roughness: .95 })));
  road.position.set(0, .025, .35); group.add(road);

  // ---------- mobil (depan = +x) ----------
  const car = new THREE.Group();
  const bodyMat = std(0xe8462f, { roughness: .45, metalness: .2 }); S.disposables.push(bodyMat);
  const chassis = track(new THREE.Mesh(new THREE.BoxGeometry(2.5, .5, 1.05), bodyMat));
  chassis.position.y = .62; car.add(chassis);
  const cabin = track(new THREE.Mesh(new THREE.BoxGeometry(1.2, .5, .98), bodyMat));
  cabin.position.set(-.25, 1.08, 0); car.add(cabin);
  const glassMat = std(0xbfe2ff, { roughness: .2, metalness: .3, transparent: true, opacity: .85 }); S.disposables.push(glassMat);
  const windshield = track(new THREE.Mesh(new THREE.BoxGeometry(.42, .38, .9), glassMat));
  windshield.position.set(.42, 1.06, 0); windshield.rotation.z = -.35; car.add(windshield);
  const glassR = track(new THREE.Mesh(new THREE.BoxGeometry(.04, .32, .88), glassMat));
  glassR.position.set(-.87, 1.06, 0); car.add(glassR);
  const lampF = track(new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff3b0 })));
  lampF.position.set(1.25, .68, .35); car.add(lampF);
  const lampF2 = lampF.clone(); lampF2.position.z = -.35; car.add(lampF2);

  // roda (4) + pelek jari-jari — berputar di tahap kinetik
  const wheels = [];
  const tireGeo = new THREE.CylinderGeometry(.34, .34, .2, 22); S.disposables.push(tireGeo);
  const tireMat = std(0x1c2434, { roughness: .9 }); S.disposables.push(tireMat);
  const rimGeo = new THREE.CylinderGeometry(.17, .17, .22, 14); S.disposables.push(rimGeo);
  const rimMat = std(0xcdd7e6, { metalness: .8, roughness: .3 }); S.disposables.push(rimMat);
  const spokeGeo = new THREE.BoxGeometry(.26, .23, .045); S.disposables.push(spokeGeo);
  for (const [x, z] of [[.8, .56], [.8, -.56], [-.8, .56], [-.8, -.56]]) {
    const w = new THREE.Group();
    const tire = new THREE.Mesh(tireGeo, tireMat); tire.rotation.x = Math.PI / 2; w.add(tire);
    const rim = new THREE.Mesh(rimGeo, rimMat); rim.rotation.x = Math.PI / 2; w.add(rim);
    const sp1 = new THREE.Mesh(spokeGeo, tireMat); w.add(sp1);
    const sp2 = sp1.clone(); sp2.rotation.z = Math.PI / 2; w.add(sp2);
    w.position.set(x, .34, z); car.add(w); wheels.push(w);
  }

  // ---------- mesin cutaway (kap depan terbuka) ----------
  // blok mesin transparan berisi 1 silinder + piston + engkol
  const engine = new THREE.Group(); engine.position.set(.85, .95, 0); car.add(engine);
  const caseMat = std(0x8fa3c2, { transparent: true, opacity: .3, roughness: .2, depthWrite: false }); S.disposables.push(caseMat);
  const engCase = track(new THREE.Mesh(new THREE.BoxGeometry(.66, .62, .6), caseMat));
  engCase.position.y = .02; engine.add(engCase);
  // silinder (dinding transparan)
  const cylMat = std(0xf1f5fb, { transparent: true, opacity: .35, roughness: .15, depthWrite: false }); S.disposables.push(cylMat);
  const cyl = track(new THREE.Mesh(new THREE.CylinderGeometry(.145, .145, .4, 18, 1, true), cylMat));
  cyl.position.y = .06; engine.add(cyl);
  // piston
  const piston = track(new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .12, 16), std(0xcdd7e6, { metalness: .8, roughness: .3 })));
  engine.add(piston);
  // engkol: piringan + pin, sumbu Z (menghadap samping)
  const crank = new THREE.Group(); crank.position.y = -.28; engine.add(crank);
  const disc = track(new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .07, 20), std(0x63a0ee, { metalness: .5 })));
  disc.rotation.x = Math.PI / 2; crank.add(disc);
  const pin = track(new THREE.Mesh(new THREE.SphereGeometry(.045, 10, 8), std(0xe8462f)));
  pin.position.set(.1, 0, .05); crank.add(pin);
  // batang penghubung piston ↔ pin (diorientasikan tiap frame)
  const rod = track(new THREE.Mesh(new THREE.CylinderGeometry(.032, .032, 1, 8), std(0x8a94ad, { metalness: .6 })));
  engine.add(rod);
  // ledakan pembakaran di atas silinder
  const flame = S.sprite(0xff8a3c, .55, 0); flame.position.set(0, .3, 0); engine.add(flame);

  // ---------- tangki bensin (belakang) + selang ke mesin ----------
  const tank = new THREE.Group(); tank.position.set(-.98, 1.0, 0); car.add(tank);
  const tankMat = std(0xf59e0b, { roughness: .4, emissive: 0x2a1400, emissiveIntensity: .3 }); S.disposables.push(tankMat);
  const tankBody = track(new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .5, 16), tankMat));
  tankBody.rotation.x = Math.PI / 2; tank.add(tankBody);
  const tankCap = track(new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .08, 10), std(0x8a5a33)));
  tankCap.position.y = .24; tank.add(tankCap);
  const tankGlow = S.sprite(0xffc23e, .8, 0); tank.add(tankGlow);
  // selang bahan bakar (di dalam bodi, digambar sebagai tabung tipis)
  const fuelPts = [[-.98, .95, .2], [-.3, .8, .3], [.4, .78, .25], [.85, .9, .1]];
  {
    const curve = new THREE.CatmullRomCurve3(fuelPts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', .1);
    const g = new THREE.TubeGeometry(curve, 30, .028, 8, false); S.disposables.push(g);
    const m = new THREE.Mesh(g, std(0x8a5a33, { transparent: true, opacity: .85 })); S.disposables.push(m.material);
    car.add(m);
  }
  const fuel = new Flow(S, car, fuelPts, { n: 8, size: .04, color: 0xffb020, glow: 0xffc23e, glowSize: 3.4, speed: .2, front: true });

  // ---------- efek lingkungan ----------
  // panas terbuang dari mesin + suara (cincin) + knalpot
  const heat = new Puffs(S, car, { origin: [.85, 1.5, 0], dir: [0, 1, 0], len: .7, life: 1.4, size: .18, color: 0xffb199, opacity: .32, n: 6 });
  const sound = new Rings(S, car, { origin: [1.05, .8, .58], normal: [.25, .1, 1], color: 0xdbeafe, opacity: .45, r1: .6 });
  const exhaust = new Puffs(S, car, { origin: [-1.3, .38, .42], dir: [-1, .25, .1], len: .8, life: 1.2, size: .14, color: 0xcbd5e1, opacity: .4, n: 6 });
  // garis angin saat melaju
  const windL = new Flow(S, group, [[2.6, 1.15, .75], [-.2, 1.2, .8], [-2.6, 1.25, .85]],
    { n: 4, size: .05, shape: 'cone', color: 0xdbeafe, glow: 0xbfdbfe, glowSize: 3, speed: .5, fade: true });
  const windL2 = new Flow(S, group, [[2.6, 1.5, -.75], [0, 1.6, -.8], [-2.6, 1.7, -.85]],
    { n: 4, size: .05, shape: 'cone', color: 0xdbeafe, glow: 0xbfdbfe, glowSize: 3, speed: .42, fade: true });

  car.position.y = .06; group.add(car);

  // ---------- anchor label ----------
  S.mkAnchors({
    tank: [-.98, 1.75, 0],
    mesin: [.85, 2.0, 0],
    piston: [1.45, 1.35, .3],
    roda: [.8, -.1, .85],
    kinetik: [-1.9, 1.3, .75],
    buang: [-1.75, .85, .6],
  });

  // ---------- update ----------
  let rpm = 0, roll = 0, theta = 0;
  const pinLocal = new THREE.Vector3(), pistonV = new THREE.Vector3(), mid = new THREE.Vector3(), dirV = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);
  function update(dt) {
    dt = S.tick(dt);
    const t = state.time;

    // ① bensin: tangki menyala + bahan bakar mengalir ke mesin
    tankGlow.material.opacity = S.at('kimia') ? (.3 + .25 * (0.5 + 0.5 * Math.sin(t * 2.6))) : 0;
    fuel.setActive(S.at('kimia'));
    fuel.update(dt, state.speed);

    // ② pembakaran: mesin hidup pelan (idle) — ledakan + panas
    // ③ mekanik: putaran penuh — piston/engkol/poros bekerja
    // ④ kinetik: roda berputar, jalan menggulung, angin — mobil melaju
    const idle = S.is('panas') ? 3.2 : 0;
    const run = S.is('mekanik') ? 9 : (S.is('kinetik') ? 13 : 0);
    rpm = S.lerp(rpm, (idle + run) * state.speed, dt, 2.2);
    theta += rpm * dt;
    crank.rotation.z = theta;
    // piston mengikuti engkol (pendekatan sinus + koreksi batang)
    const crankR = .1, rodLen = .3;
    const py = -.28 + crankR * Math.sin(theta) + Math.sqrt(Math.max(.01, rodLen * rodLen - Math.pow(crankR * Math.cos(theta), 2)));
    piston.position.set(0, py, 0);
    // batang penghubung: pin (dunia lokal engine) ↔ piston bawah
    pinLocal.set(crankR * Math.cos(theta), -.28 + crankR * Math.sin(theta), .05);
    pistonV.set(0, py - .06, 0);
    mid.addVectors(pinLocal, pistonV).multiplyScalar(.5);
    rod.position.copy(mid);
    dirV.subVectors(pistonV, pinLocal);
    const len = Math.max(.05, dirV.length());
    rod.scale.set(1, len, 1);
    rod.quaternion.setFromUnitVectors(UP, dirV.normalize());
    // ledakan pembakaran: berkedip mengikuti putaran (di tahap panas jelas terlihat)
    const fire = S.at('panas') ? Math.max(0, Math.sin(theta * 1 + 1.2)) : 0;
    flame.material.opacity = (S.is('panas') ? .85 : .45) * fire * (rpm > .4 ? 1 : 0);
    const fs = .45 + .25 * fire; flame.scale.set(fs, fs, 1);
    heat.setActive(S.at('panas'));
    heat.update(dt, t);

    // suara mesin sejak hidup; knalpot mengepul saat melaju
    sound.setActive(S.at('panas') && rpm > 1);
    sound.update(dt);

    const go = S.is('kinetik') ? 1 : 0;
    roll = S.lerp(roll, go * 7.5 * state.speed, dt, 2.4);
    for (const w of wheels) w.rotation.z -= roll * dt;
    roadTex.offset.x += roll * dt * .11;
    exhaust.setActive(go > 0 && roll > 2);
    exhaust.update(dt, t);
    windL.setActive(go > 0); windL2.setActive(go > 0);
    windL.update(dt, state.speed); windL2.update(dt, state.speed);
    // bodi sedikit bergetar saat mesin hidup
    car.position.y = .06 + (rpm > .4 ? Math.sin(t * 21) * .006 * Math.min(1, rpm / 8) : 0);
  }

  return {
    group, update,
    setStage: S.setStage, setSpeed: S.setSpeed, anchors: S.anchors, dispose: S.dispose,
    debug: () => ({ stage: state.stage, rpm: +rpm.toFixed(1), roll: +roll.toFixed(1), fuel: fuel.active, heat: heat.active, sound: sound.active }),
  };
}

// tekstur aspal + garis putus
function makeRoadTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 96;
  const x = c.getContext('2d');
  x.fillStyle = '#3a4254'; x.fillRect(0, 0, 256, 96);
  x.fillStyle = 'rgba(255,255,255,.06)';
  for (let i = 0; i < 130; i++) x.fillRect(Math.random() * 256, Math.random() * 96, 2, 2);
  x.fillStyle = '#e9edf5';
  for (let i = 0; i < 4; i++) x.fillRect(i * 64 + 10, 44, 34, 8);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
  return t;
}
