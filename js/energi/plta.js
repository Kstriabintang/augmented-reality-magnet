// Adegan 5 — PLTA: Energi POTENSIAL gravitasi air (waduk tinggi) → Energi KINETIK
// (air turun deras lewat saluran/pipa pesat DI DALAM bendungan) → Energi MEKANIK (turbin memutar
// generator) → Energi LISTRIK → rumah masyarakat. Tahap: potensial → kinetik → mekanik → listrik.
// Revisi Dinda 2026-11-18: tidak ada "selang" di luar bendungan. Bendungan DIBELAH (potongan
// melintang) sehingga saluran air di dalam tubuh bendungan terlihat turun ke turbin di kakinya.
import * as THREE from 'three';
import { sceneBase, makeBoard, makeHouse, makePole, makeTurbineGen, std, Flow } from '/js/energi/core.js?v=1';

export function makePLTA() {
  const S = sceneBase(['potensial', 'kinetik', 'mekanik', 'listrik']);
  const { group, track, state } = S;
  makeBoard(S, 5.6, 3.4, { top: 0x6db263 });

  // potongan melintang di bidang z = ZC: bukit, waduk, dan bendungan berhenti di sini
  const ZC = .35, ZB = -1.3;
  const DZ = ZC - ZB, MZ = (ZC + ZB) / 2;

  // ---------- bukit + waduk (kiri, tinggi) ----------
  const hill = track(new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, DZ), std(0x74a06a, { roughness: .95 })));
  hill.position.set(-1.85, .75, MZ); group.add(hill);
  // air waduk (permukaan)
  const matWater = new THREE.MeshStandardMaterial({ color: 0x3aa2e0, roughness: .25, transparent: true, opacity: .85, emissive: 0x0a3a5c, emissiveIntensity: .35 });
  S.disposables.push(matWater);
  const lake = track(new THREE.Mesh(new THREE.BoxGeometry(1.6, .22, DZ), matWater));
  lake.position.set(-1.85, 1.5, MZ); group.add(lake);
  const lakeGlow = S.sprite(0x7fd0ff, 1.6, 0); lakeGlow.position.set(-1.85, 1.75, MZ); group.add(lakeGlow);

  // ---------- bendungan: profil trapesium (hulu tegak, hilir miring), diekstrusi sepanjang z ----------
  // titik profil (x, y): hulu-bawah, hulu-atas (puncak), hilir-atas, kaki hilir
  const DAM = [[-1.02, 0], [-1.02, 1.66], [-.74, 1.66], [-.28, 0]];
  const damShape = poly(DAM);
  const damGeo = new THREE.ExtrudeGeometry(damShape, { depth: DZ, bevelEnabled: false }); S.disposables.push(damGeo);
  const dam = new THREE.Mesh(damGeo, std(0xcfd6e2, { roughness: .7 })); S.disposables.push(dam.material);
  dam.position.z = ZB; group.add(dam);

  // ---------- bidang belahan (z = ZC) ----------
  // tanah bukit dengan cekungan waduk yang dalam di dekat bendungan
  const SOIL = [[-2.75, 0], [-1.02, 0], [-1.02, .98], [-1.7, .98], [-2.2, 1.5], [-2.75, 1.5]];
  const soilCut = track(new THREE.Mesh(new THREE.ShapeGeometry(poly(SOIL)), std(0x6b5a40, { roughness: 1 })));
  soilCut.position.z = ZC + .002; group.add(soilCut);
  // air waduk terpotong: mengisi cekungan sampai permukaan → mulut saluran TERENDAM air
  const LAKE_CUT = [[-2.65, 1.5], [-2.2, 1.5], [-1.7, .98], [-1.02, .98], [-1.02, 1.61], [-2.65, 1.61]];
  const lakeCut = new THREE.Mesh(new THREE.ShapeGeometry(poly(LAKE_CUT)), new THREE.MeshStandardMaterial({ color: 0x3a9ee0, roughness: .3, emissive: 0x0a3a5c, emissiveIntensity: .35 }));
  S.disposables.push(lakeCut.geometry, lakeCut.material); lakeCut.position.z = ZC + .004; group.add(lakeCut);
  // bendungan: tepi gelap + beton terang berarsir (tanda "potongan") + saluran (pipa pesat) biru tua
  const hatch = makeHatchTexture(); S.disposables.push(hatch);
  const rim = new THREE.Mesh(new THREE.ShapeGeometry(damShape), new THREE.MeshBasicMaterial({ color: 0x3b4658 }));
  S.disposables.push(rim.geometry, rim.material); rim.position.z = ZC + .002; group.add(rim);
  const cutFace = new THREE.Mesh(new THREE.ShapeGeometry(insetShape(DAM, .035)), new THREE.MeshStandardMaterial({ map: hatch, roughness: .85 }));
  S.disposables.push(cutFace.geometry, cutFace.material);
  cutFace.position.z = ZC + .006; group.add(cutFace);
  const chanPts = [[-1.04, 1.25], [-.8, .98], [-.56, .72], [-.3, .62]];    // garis tengah saluran (x, y): mulut di dinding hulu
  // saluran berisi AIR dari waduk (warna sama dengan air waduk) — bukan selang; menyala & mengalir deras saat tahap ≥ 2
  const chanMat = new THREE.MeshStandardMaterial({ color: 0x3a9ee0, roughness: .3, emissive: 0x0a3a5c, emissiveIntensity: .35 });
  S.disposables.push(chanMat);
  for (let i = 0; i < chanPts.length - 1; i++) {
    const [x0, y0] = chanPts[i], [x1, y1] = chanPts[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const seg = track(new THREE.Mesh(new THREE.BoxGeometry(len + .1, .2, .02), chanMat));
    seg.position.set((x0 + x1) / 2, (y0 + y1) / 2, ZC + .016); seg.rotation.z = Math.atan2(y1 - y0, x1 - x0);
    group.add(seg);
  }

  // ---------- turbin di kaki bendungan; jalur air: waduk → mulut saluran → dalam bendungan → sudu turbin ----------
  const TX = .08, TZ = ZC - .28;
  const tg = makeTurbineGen(S, { pos: [TX, 0, TZ] });
  const WZ = ZC + .05;                                                      // air tampil tepat di depan bidang belahan
  const waterPts = [[-1.45, 1.3, WZ], ...chanPts.map(([x, y]) => [x, y, WZ]), [TX - .3, .78, ZC + .02], [TX - .05, .86, ZC + .02]];
  const water = new Flow(S, group, waterPts, { n: 16, size: .06, color: 0xbfeaff, glow: 0x7fd0ff, glowSize: 2, speed: .3, front: true });
  // air keluar dari turbin → sungai di bawah (air tidak "hilang")
  const riverMat = new THREE.MeshStandardMaterial({ color: 0x4fb3ea, roughness: .3, transparent: true, opacity: .8, emissive: 0x0a3a5c, emissiveIntensity: .25 });
  S.disposables.push(riverMat);
  const riverPts = [[TX + .1, .06, TZ + .33], [TX + .25, .05, TZ + .8], [TX + .05, .05, 1.2], [TX + .2, .05, 1.65]];
  {
    const curve = new THREE.CatmullRomCurve3(riverPts.map(p => new THREE.Vector3(...p)));
    const pts = curve.getSpacedPoints(30), w = .16, pos = [], idx = [];
    pts.forEach((p, i) => { const tg2 = curve.getTangentAt(i / 30); const nx = -tg2.z, nz = tg2.x; const l = Math.hypot(nx, nz) || 1;
      pos.push(p.x + nx / l * w, .055, p.z + nz / l * w, p.x - nx / l * w, .055, p.z - nz / l * w);
      if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    S.disposables.push(g);
    const river = new THREE.Mesh(g, riverMat); river.material.side = THREE.DoubleSide; group.add(river);
  }
  const outflow = new Flow(S, group, riverPts.map(([x, y, z]) => [x, .09, z]), { n: 8, size: .05, color: 0xbfe9ff, speed: .2, front: true });

  // ---------- transmisi: tiang + kabel → 2 rumah ----------
  const pole = makePole(S, { pos: [1.72, 0, -.65], h: 1.6 });
  const houseA = makeHouse(S, { scale: .62, pos: [2.35, 0, .55], ry: -.5 });
  const houseB = makeHouse(S, { scale: .5, pos: [2.35, 0, -1.15], ry: .3 });
  const cableAPts = [tg.genTop.toArray(), [.9, 1.35, -.5], pole.top.toArray(), [2.1, 1.15, -.1], [2.35, .78, .45]];
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
    waduk: [-1.55, 2.25, ZB + .3],
    potensial: [-1.2, 1.9, ZC - .05],
    pipa: [-.8, .05, 1.05],
    turbin: [TX + .75, .1, TZ + 1.0],
    generator: [TX + .35, 1.9, TZ - .6],
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

    // ② kinetik: air deras turun lewat saluran (pipa pesat) di dalam bendungan
    water.setActive(S.at('kinetik'));
    water.update(dt, state.speed);
    const kin = S.at('kinetik');
    chanMat.emissiveIntensity = kin ? .6 + .35 * (0.5 + 0.5 * Math.sin(t * 4)) : .35;
    outflow.setActive(S.at('mekanik'));
    outflow.update(dt, state.speed);

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

// tekstur arsir diagonal (konvensi gambar potongan) untuk bidang belahan bendungan
function makeHatchTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = '#eef1f5'; x.fillRect(0, 0, 64, 64);
  x.strokeStyle = 'rgba(120,134,156,.55)'; x.lineWidth = 3;
  for (let k = -64; k <= 64; k += 16) { x.beginPath(); x.moveTo(k, 64); x.lineTo(k + 64, 0); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); t.needsUpdate = true;
  return t;
}
// poligon diperkecil ke arah pusatnya (tepi gelap terlihat di sekeliling bidang belahan)
function insetShape(pts, d) {
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const sh = new THREE.Shape();
  pts.forEach(([x, y], i) => { const dx = cx - x, dy = cy - y, l = Math.hypot(dx, dy) || 1; const q = [x + dx / l * d, y + dy / l * d]; i ? sh.lineTo(...q) : sh.moveTo(...q); });
  sh.closePath(); return sh;
}
// poligon (x, y) → THREE.Shape
function poly(pts) { const sh = new THREE.Shape(); sh.moveTo(...pts[0]); pts.slice(1).forEach(p => sh.lineTo(...p)); sh.closePath(); return sh; }
