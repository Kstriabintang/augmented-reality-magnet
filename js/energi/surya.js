// Adegan 2 — PANEL SURYA → ENERGI LISTRIK → PERALATAN RUMAH.
// Matahari memancarkan cahaya → panel surya DI ATAP mengubahnya jadi listrik →
// kabel → peralatan DI DALAM rumah (rumah dibelah) menyala SATU PER SATU: lampu (cahaya), kipas (gerak), setrika (panas).
// Tahap: cahaya → listrik → alat.
import * as THREE from 'three';
import { sceneBase, makeBoard, makeSun, std, Flow, Puffs } from '/js/energi/core.js?v=1';

export function makeSurya() {
  const S = sceneBase(['cahaya', 'listrik', 'alat']);
  const { group, track, state } = S;
  makeBoard(S, 5.2, 3.4, { top: 0x6db263 });

  // ---------- matahari ----------
  const sun = makeSun(S, { r: .3, pos: [-1.95, 2.55, -.75] });

  // ---------- RUMAH DIBELAH (revisi Dinda 2026-11-18) ----------
  // Lampu, kipas, setrika adalah peralatan DI DALAM rumah: dinding depan (+z) & kanan (+x) dibuka
  // seperti rumah boneka, sehingga isi rumah terlihat dari kamera 3D maupun dari depan kartu marker.
  const HX = .45, HZ = -.25, HW = 3.0, HD = 2.0, HH = 1.3, WT = .08;     // pusat, lebar, dalam, tinggi, tebal dinding
  const X0 = HX - HW / 2, X1 = HX + HW / 2, Z0 = HZ - HD / 2, Z1 = HZ + HD / 2;
  const wall = std(0xf3e7d3, { roughness: .85 }); S.disposables.push(wall);
  const wallIn = std(0xfbf3e4, { roughness: .9 }); S.disposables.push(wallIn);
  const addBox = (w, h, d, x, y, z, mat) => { const m = track(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y, z); group.add(m); return m; };
  addBox(HW, HH, WT, HX, HH / 2, Z0 + WT / 2, wall);                   // dinding belakang
  addBox(WT, HH, HD, X0 + WT / 2, HH / 2, HZ, wall);                   // dinding kiri (panel di atap sisi ini)
  addBox(HW - .04, .035, HD - .04, HX, .065, HZ, std(0xe7d6b8, { roughness: .9 }));   // lantai
  addBox(1.3, .02, .9, HX + .1, .09, HZ + .1, std(0xc96f5a, { roughness: .95 }));     // karpet
  // tepi potongan dinding (garis tebal) supaya jelas "dibelah"
  const cutMat = std(0xd9c7a6, { roughness: .9 }); S.disposables.push(cutMat);
  addBox(WT + .02, HH, .06, X0 + WT / 2, HH / 2, Z1 - .03, cutMat);     // ujung dinding kiri
  addBox(.06, HH, WT + .02, X1 - .03, HH / 2, Z0 + WT / 2, cutMat);     // ujung dinding belakang
  // segitiga pelana belakang menutup atap
  {
    const sh = new THREE.Shape(); sh.moveTo(-HW / 2, 0); sh.lineTo(HW / 2, 0); sh.lineTo(0, .78); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: WT, bevelEnabled: false }); S.disposables.push(g);
    const m = new THREE.Mesh(g, wall); m.position.set(HX, HH, Z0); group.add(m);
  }
  // jendela di dinding belakang & kiri (menyala saat alat hidup)
  const winMat = new THREE.MeshStandardMaterial({ color: 0x9db4d8, roughness: .4, emissive: 0x000000, emissiveIntensity: 1 });
  S.disposables.push(winMat);
  const winGeo = new THREE.BoxGeometry(.42, .36, .03); S.disposables.push(winGeo);
  [[HX - .55, .82, Z0 + WT + .016], [HX + .75, .82, Z0 + WT + .016]].forEach(p => { const w = new THREE.Mesh(winGeo, winMat); w.position.set(...p); group.add(w); });
  { const w = new THREE.Mesh(winGeo, winMat); w.position.set(X0 + WT + .016, .82, HZ + .35); w.rotation.y = Math.PI / 2; group.add(w); }
  const door = track(new THREE.Mesh(new THREE.BoxGeometry(.03, .7, .38), std(0x8a5a33)));
  door.position.set(X0 + WT + .016, .37, HZ - .45); group.add(door);
  // atap pelana (bubungan sejajar sumbu z), sisi kiri memegang panel
  const ROT = .47, SL = 1.75;                                            // kemiringan & panjang sisi atap
  // atap hanya menutup bagian BELAKANG rumah (potongan atap) agar isi rumah tetap terlihat dari atas kartu
  const RZ0 = Z0 - .11, RZ1 = HZ + .05, RD = RZ1 - RZ0, RMZ = (RZ0 + RZ1) / 2;
  const roofMat = std(0xd97742, { roughness: .8 }); S.disposables.push(roofMat);
  const slopeGeo = new THREE.BoxGeometry(SL, .07, RD); S.disposables.push(slopeGeo);
  const sx = SL / 2 * Math.cos(ROT), sy = HH + SL / 2 * Math.sin(ROT);
  const s1 = new THREE.Mesh(slopeGeo, roofMat); s1.position.set(HX - sx, sy, RMZ); s1.rotation.z = ROT; group.add(s1);
  const s2 = new THREE.Mesh(slopeGeo, roofMat); s2.position.set(HX + sx, sy, RMZ); s2.rotation.z = -ROT; group.add(s2);
  const ridge = track(new THREE.Mesh(new THREE.BoxGeometry(.12, .09, RD + .02), std(0xb85c2e)));
  ridge.position.set(HX, HH + SL * Math.sin(ROT) + .02, RMZ); group.add(ridge);
  // panel surya menempel di sisi kiri atap
  const panelTex = makePanelTexture(); S.disposables.push(panelTex);
  const matPanel = new THREE.MeshStandardMaterial({ map: panelTex, roughness: .25, metalness: .35, emissive: 0x0a1e46, emissiveIntensity: .3 });
  S.disposables.push(matPanel);
  const nx = -Math.sin(ROT) * .065, ny = Math.cos(ROT) * .065;          // geser keluar dari permukaan atap
  const panel = track(new THREE.Mesh(new THREE.BoxGeometry(1.2, .06, RD - .2), matPanel));
  panel.position.set(HX - sx + nx, sy + ny, RMZ); panel.rotation.z = ROT; group.add(panel);
  const panelFlash = S.sprite(0xbfe2ff, 1.0, 0); panelFlash.position.set(HX - sx + nx * 3, sy + ny * 3, RMZ); group.add(panelFlash);
  const panelCenter = [HX - sx + nx * 1.6, sy + ny * 1.6, RMZ];

  // ---------- pancaran matahari → panel (foton kerucut kuning) ----------
  const rays = new Flow(S, group, [[-1.85, 2.4, -.72], [-1.2, 2.15, -.5], panelCenter],
    { n: 10, size: .075, shape: 'cone', color: 0xffe08a, glow: 0xffd23e, glowSize: 3.4, speed: .3, fade: true });

  // ---------- tiga alat DI DALAM rumah, dideretkan tegak lurus arah pandang agar label tidak bertumpuk ----------
  const PERP = [.78, -.62], C_IN = [HX + .05, HZ + .2], GAP = 1.05;
  const at = k => [C_IN[0] + PERP[0] * GAP * k, 0, C_IN[1] + PERP[1] * GAP * k];
  const P_LAMP = at(-1), P_FAN = at(0), P_IRON = at(1);

  // ---------- kabel: panel → turun di sisi dalam dinding kiri → menyusuri lantai ke tiap alat ----------
  const matWire = std(0x374357, { roughness: .5 }); S.disposables.push(matWire);
  const behind = (p, k = .34) => [p[0] - .62 * k, .1, p[2] - .78 * k];
  const wirePts = [[X0 + .35, HH + .12, RMZ], [X0 + WT + .07, HH - .1, HZ - .55], [X0 + WT + .07, .1, HZ - .55],
    behind(P_LAMP), behind(P_FAN), behind(P_IRON)];
  {
    const curve = new THREE.CatmullRomCurve3(wirePts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', .1);
    const g = new THREE.TubeGeometry(curve, 60, .045, 8, false); S.disposables.push(g);
    group.add(new THREE.Mesh(g, matWire));
  }
  // arus listrik di kabel
  const current = new Flow(S, group, wirePts, { n: 14, size: .05, color: 0xffd54a, glow: 0xffc23e, glowSize: 4, speed: .2, front: true });

  // meja kecil tempat alat berdiri
  const pedGeo = new THREE.CylinderGeometry(.24, .28, .2, 18); S.disposables.push(pedGeo);
  const pedMat = std(0x8a6a4a, { roughness: .8 }); S.disposables.push(pedMat);
  [P_LAMP, P_FAN, P_IRON].forEach(p => { const m = new THREE.Mesh(pedGeo, pedMat); m.position.set(p[0], .18, p[2]); group.add(m); });

  // lampu meja
  const lamp = new THREE.Group();
  const lampPost = track(new THREE.Mesh(new THREE.CylinderGeometry(.035, .05, .5, 10), std(0x8a94ad)));
  lampPost.position.y = .25; lamp.add(lampPost);
  const matBulb = new THREE.MeshStandardMaterial({ color: 0xf1f5fb, roughness: .3, emissive: 0x000000, emissiveIntensity: 1 });
  S.disposables.push(matBulb);
  const bulb = track(new THREE.Mesh(new THREE.SphereGeometry(.14, 18, 14), matBulb));
  bulb.position.y = .58; lamp.add(bulb);
  const lampGlow = S.sprite(0xffe08a, 1.1, 0); lampGlow.position.y = .58; lamp.add(lampGlow);
  const lampLight = new THREE.PointLight(0xffe9a8, 0, 2.6, 2); lampLight.position.y = .6; lamp.add(lampLight);
  lamp.position.set(P_LAMP[0], .28, P_LAMP[2]); group.add(lamp);

  // kipas angin: tiang + kepala + 3 baling + ring pelindung
  const fan = new THREE.Group();
  const fanPost = track(new THREE.Mesh(new THREE.CylinderGeometry(.04, .055, .55, 10), std(0x63a0ee)));
  fanPost.position.y = .28; fan.add(fanPost);
  const head = new THREE.Group(); head.position.set(0, .62, .06);
  const hub = track(new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .1, 12), std(0x2f6fd0)));
  hub.rotation.x = Math.PI / 2; head.add(hub);
  const blades = new THREE.Group();
  const bladeGeo = new THREE.BoxGeometry(.09, .3, .02); S.disposables.push(bladeGeo);
  const bladeMat = std(0x9cc2f5, { transparent: true, opacity: .95 }); S.disposables.push(bladeMat);
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(bladeGeo, bladeMat);
    const a = i / 3 * Math.PI * 2;
    b.position.set(Math.cos(a + Math.PI / 2) * .17, Math.sin(a + Math.PI / 2) * .17, 0);
    b.rotation.z = a; blades.add(b);
  }
  blades.position.z = .06; head.add(blades);
  const cage = track(new THREE.Mesh(new THREE.TorusGeometry(.24, .014, 8, 26), std(0x8a94ad)));
  cage.position.z = .06; head.add(cage);
  fan.add(head);
  fan.position.set(P_FAN[0], .28, P_FAN[2]); fan.rotation.y = .62; group.add(fan);   // menghadap penonton
  // hembusan angin (gerak)
  const wind = new Puffs(S, group, { origin: [P_FAN[0] + .2, .92, P_FAN[2] + .28], dir: [.58, .02, .81], len: .85, life: 1.1, size: .13, color: 0xdbeafe, opacity: .35, n: 6 });

  // setrika: badan wedge + pegangan + alas panas
  const iron = new THREE.Group();
  const ironBody = track(new THREE.Mesh(new THREE.CylinderGeometry(.19, .26, .16, 4, 1), std(0xf0f4fa, { roughness: .4 })));
  ironBody.scale.set(1.5, 1, 1); ironBody.rotation.y = Math.PI / 4; ironBody.position.y = .12; iron.add(ironBody);
  const matPlate = new THREE.MeshStandardMaterial({ color: 0x8a94ad, roughness: .35, metalness: .7, emissive: 0x000000, emissiveIntensity: 1 });
  S.disposables.push(matPlate);
  const plate = track(new THREE.Mesh(new THREE.CylinderGeometry(.27, .27, .05, 4, 1), matPlate));
  plate.scale.set(1.5, 1, 1); plate.rotation.y = Math.PI / 4; plate.position.y = .025; iron.add(plate);
  const handle = track(new THREE.Mesh(new THREE.TorusGeometry(.14, .035, 10, 20, Math.PI), std(0x2f6fd0)));
  handle.position.y = .22; iron.add(handle);
  iron.position.set(P_IRON[0], .28, P_IRON[2]); iron.rotation.y = -.5; group.add(iron);
  const steam = new Puffs(S, group, { origin: [P_IRON[0], .61, P_IRON[2]], dir: [0, 1, 0], len: .55, life: 1.4, size: .15, color: 0xffc4ad, opacity: .34, n: 5 });

  // ---------- anchor label ----------
  S.mkAnchors({
    matahari: [-1.95, 3.15, -.75],
    cahaya: [-1.25, 2.45, -.55],
    panel: [HX - sx - .35, sy + .5, RMZ],
    listrik: [(P_LAMP[0] + P_FAN[0]) / 2 - .35, .2, (P_LAMP[2] + P_FAN[2]) / 2 - .3],
    rumah: [HX + .55, 2.35, Z0 + .1],
    lampu: [P_LAMP[0] - .2, 1.2, P_LAMP[2]],
    kipas: [P_FAN[0] - .55, 1.7, P_FAN[2]],
    setrika: [P_IRON[0] + .1, 1.15, P_IRON[2]],
  });

  // ---------- update ----------
  let fanSpin = 0, lampK = 0, ironK = 0, winK = 0;
  function update(dt) {
    dt = S.tick(dt);
    const t = state.time;

    // matahari berdenyut halus
    sun.halo.material.opacity = .55 + .2 * Math.sin(t * 1.8);
    const hs = 1.8 * (1 + .06 * Math.sin(t * 2.3)); sun.halo.scale.set(hs, hs, 1);

    // ① cahaya: foton mengalir matahari → panel (aktif di semua tahap ≥ cahaya)
    rays.setActive(S.at('cahaya'));
    rays.update(dt, state.speed);

    // ② listrik: panel "berkedip" mengubah energi + arus mengalir di kabel
    const el = S.at('listrik');
    panelFlash.material.opacity = el ? (.3 + .3 * (0.5 + 0.5 * Math.sin(t * 4))) : 0;
    matPanel.emissiveIntensity = el ? .9 : .3;
    current.setActive(el);
    current.update(dt, state.speed);

    // ③ alat menyala SATU PER SATU (lampu → kipas → setrika)
    const on = S.is('alat');
    const kLamp = on ? S.seq(.1, .5) : 0;
    const kFan = on ? S.seq(1.0, .7) : 0;
    const kIron = on ? S.seq(2.0, .8) : 0;
    lampK = S.lerp(lampK, kLamp, dt, 6);
    matBulb.emissive.setHex(0xffdf6b); matBulb.emissiveIntensity = lampK * 2.1;
    lampGlow.material.opacity = lampK * .75;
    lampLight.intensity = lampK * 2.0;
    winK = S.lerp(winK, on ? 1 : 0, dt, 4);
    winMat.emissive.setHex(0xffe9a8); winMat.emissiveIntensity = winK * 1.5;
    fanSpin = S.lerp(fanSpin, kFan * 14 * state.speed, dt, 2.5);
    blades.rotation.z -= fanSpin * dt;
    wind.setActive(kFan > .6);
    wind.update(dt, t);
    ironK = S.lerp(ironK, kIron, dt, 4);
    matPlate.emissive.setHex(0xff5a3c); matPlate.emissiveIntensity = ironK * 1.4;
    steam.setActive(ironK > .6);
    steam.update(dt, t);
  }

  return {
    group, update,
    setStage: S.setStage, setSpeed: S.setSpeed, anchors: S.anchors, dispose: S.dispose,
    debug: () => ({ stage: state.stage, rays: rays.active, front: +current.front.toFixed(2), lamp: +lampK.toFixed(2), fan: +fanSpin.toFixed(1), iron: +ironK.toFixed(2) }),
  };
}

// tekstur panel surya: sel biru grid
function makePanelTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 160;
  const x = c.getContext('2d');
  x.fillStyle = '#12305e'; x.fillRect(0, 0, 128, 160);
  for (let r = 0; r < 5; r++) for (let q = 0; q < 4; q++) {
    const g = x.createLinearGradient(0, r * 32, 32, r * 32 + 28);
    g.addColorStop(0, '#1d4f9e'); g.addColorStop(1, '#153a75');
    x.fillStyle = g;
    x.fillRect(q * 32 + 3, r * 32 + 3, 26, 26);
    x.strokeStyle = 'rgba(160,200,255,.5)'; x.lineWidth = 1;
    x.strokeRect(q * 32 + 3.5, r * 32 + 3.5, 25, 25);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
  return t;
}
