/* global AFRAME */
/*
 * Komponen A-Frame: <a-entity magnetic-field>
 *
 * Menampilkan medan magnet 3D dari DUA batang magnet (S–N) secara fisika:
 *  - Tiap magnet = dua kutub titik (N = muatan +, S = muatan -).
 *  - Garis medan dihasilkan dengan MENELUSURI arah medan B (field-line tracing)
 *    mulai dari kutub N, melengkung di ruang 3D, lalu masuk ke kutub S.
 *  - Partikel mengalir sepanjang tiap garis (N -> S) dgn kecepatan seragam.
 *  - Garis berwarna gradien merah (N) -> biru (S).
 *
 * Karena ditelusuri di ruang 3D (bukan cuma bidang foto), saat HP digerakkan/
 * dimiringkan, medannya terlihat punya volume -> kesan 3D.
 *
 * Koordinat (mengikuti MindAR image target):
 *   lebar foto target = 1 unit -> x: -0.5..0.5 ; +y atas ; +z ke arah kamera.
 */
AFRAME.registerComponent('magnetic-field', {
  schema: {
    showMagnets:   { type: 'boolean', default: true },
    particleSpeed: { type: 'number',  default: 0.12 },  // satuan-dunia per detik (seragam semua garis)
    seedsPerPole:  { type: 'number',  default: 16 },    // jumlah garis medan per kutub N
    density:       { type: 'number',  default: 0.05 },  // jarak antar partikel (makin kecil = makin rapat)
    poleZ:         { type: 'number',  default: 0.05 }    // ketinggian sumbu magnet di atas foto
  },

  init: function () {
    const THREE = AFRAME.THREE;
    this.THREE = THREE;
    this.group = new THREE.Group();
    this.el.object3D.add(this.group);

    const z = this.data.poleZ;
    // Dua magnet pada sumbu x (di atas foto, y=0). S=kiri(-), N=kanan(+).
    this.magnets = [
      { sx: -0.345, nx: -0.045 },  // magnet kiri
      { sx:  0.045, nx:  0.345 }   // magnet kanan
    ];
    // Kutub titik untuk perhitungan medan: N = +1, S = -1
    this.poles = [];
    this.magnets.forEach((m) => {
      this.poles.push({ p: new THREE.Vector3(m.sx, 0, z), q: -1 });
      this.poles.push({ p: new THREE.Vector3(m.nx, 0, z), q: +1 });
    });

    this.lines = [];
    this.dotTex = this._makeDotTexture();
    this._tmp = new THREE.Vector3();

    if (this.data.showMagnets) this._buildMagnets();
    this._buildFieldLines();
  },

  remove: function () {
    if (this.group) this.el.object3D.remove(this.group);
  },

  // ---- animasi: geser partikel sepanjang tiap garis, kecepatan seragam ----
  tick: function (time, dt) {
    if (!dt) return;
    const sec = dt / 1000;
    const v = this._tmp;
    const speed = this.data.particleSpeed;
    for (const L of this.lines) {
      const dT = (speed * sec) / L.length;       // ubah kecepatan dunia -> fraksi kurva
      const pos = L.points.geometry.attributes.position;
      for (let i = 0; i < L.offsets.length; i++) {
        L.offsets[i] = (L.offsets[i] + dT) % 1;
        L.curve.getPointAt(L.offsets[i], v);      // t=0 di N, t=1 menuju S
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      pos.needsUpdate = true;
    }
  },

  // ===== FISIKA: medan B dari kumpulan kutub titik (model muatan magnet) =====
  _fieldAt: function (r, out) {
    out.set(0, 0, 0);
    const d = this._fTmp || (this._fTmp = new this.THREE.Vector3());
    for (const pole of this.poles) {
      d.subVectors(r, pole.p);
      const len = d.length();
      if (len < 1e-4) continue;
      const f = pole.q / (len * len * len);       // ~ q * r / |r|^3
      out.addScaledVector(d, f);
    }
    return out;
  },

  // Arah medan ternormalisasi (unit). null kalau medan ~0.
  _unitField: function (r, out) {
    this._fieldAt(r, out);
    const len = out.length();
    if (len < 1e-9) return null;
    out.multiplyScalar(1 / len);
    return out;
  },

  // Telusuri satu garis medan dari titik seed mengikuti arah B (N -> S).
  _trace: function (seed) {
    const THREE = this.THREE;
    const ds = 0.012, maxSteps = 600, bound = 0.95, rStop = 0.045;
    const pts = [seed.clone()];
    const r = seed.clone();
    const k1 = new THREE.Vector3(), k2 = new THREE.Vector3(), mid = new THREE.Vector3();
    for (let s = 0; s < maxSteps; s++) {
      if (!this._unitField(r, k1)) break;                 // langkah RK2 (midpoint)
      mid.copy(r).addScaledVector(k1, ds * 0.5);
      if (!this._unitField(mid, k2)) break;
      r.addScaledVector(k2, ds);
      if (r.length() > bound) break;                      // keluar area -> berhenti
      pts.push(r.clone());
      // berhenti kalau sudah dekat kutub S (muatan negatif)
      let done = false;
      for (const pole of this.poles) {
        if (pole.q < 0 && r.distanceTo(pole.p) < rStop) { done = true; break; }
      }
      if (done) break;
    }
    return pts;
  },

  _buildFieldLines: function () {
    const THREE = this.THREE;
    const n = this.data.seedsPerPole;
    const r0 = 0.03;                       // jarak seed dari ujung kutub N
    // Seed garis dari tiap kutub N (muatan +), arah tersebar merata di bola 3D.
    for (const pole of this.poles) {
      if (pole.q <= 0) continue;
      for (const dir of this._fibSphere(n)) {
        const seed = pole.p.clone().addScaledVector(dir, r0);
        const pts = this._trace(seed);
        if (pts.length >= 4) this._addLine(pts);
      }
    }
  },

  // Tambah satu garis medan: jejak (gradien merah->biru) + partikel mengalir
  _addLine: function (pts) {
    const THREE = this.THREE;
    const curve = new THREE.CatmullRomCurve3(pts);
    const length = curve.getLength();

    // --- jejak garis dengan gradien warna N(merah) -> S(biru) ---
    const segs = Math.min(120, Math.max(20, Math.round(length / 0.01)));
    const linePts = curve.getPoints(segs);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
    const colors = new Float32Array((segs + 1) * 3);
    const cN = new THREE.Color('#ff4a33'), cMid = new THREE.Color('#eef3ff'), cS = new THREE.Color('#3a7bff');
    const tmpC = new THREE.Color();
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      if (t < 0.5) tmpC.copy(cN).lerp(cMid, t / 0.5);
      else tmpC.copy(cMid).lerp(cS, (t - 0.5) / 0.5);
      colors[i * 3] = tmpC.r; colors[i * 3 + 1] = tmpC.g; colors[i * 3 + 2] = tmpC.b;
    }
    lineGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55 });
    this.group.add(new THREE.Line(lineGeo, lineMat));

    // --- partikel mengalir; jumlahnya proporsional panjang garis ---
    const count = Math.min(24, Math.max(3, Math.round(length / this.data.density)));
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xeaf6ff, size: 0.018, map: this.dotTex, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    });
    const points = new THREE.Points(pGeo, pMat);
    this.group.add(points);

    const offsets = [];
    for (let i = 0; i < count; i++) offsets.push(i / count);
    this.lines.push({ curve, length, points, offsets });
  },

  // Balok magnet 3D: separuh N (merah) + separuh S (biru), berlabel huruf.
  _buildMagnets: function () {
    const THREE = this.THREE;
    const z = this.data.poleZ, hy = 0.06, dz = 0.06;
    const half = (x, w, color) => {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color), roughness: 0.35, metalness: 0.25
      });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, hy, dz), mat);
      mesh.position.set(x, 0, z);
      this.group.add(mesh);
    };
    this.magnets.forEach((m) => {
      const mid = (m.sx + m.nx) / 2, w = (m.nx - m.sx) / 2;
      half(m.sx + w / 2, w, '#1f5fd0');   // S (biru, kiri)
      half(m.nx - w / 2, w, '#e2331e');   // N (merah, kanan)
      this._label('S', m.sx + w / 2, z + dz / 2 + 0.001);
      this._label('N', m.nx - w / 2, z + dz / 2 + 0.001);
    });
  },

  _label: function (text, x, zTop) {
    const THREE = this.THREE;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 92px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 70);
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.045), mat);
    plane.position.set(x, 0, zTop);     // di permukaan depan magnet, menghadap kamera (+z)
    this.group.add(plane);
  },

  // Arah tersebar merata di permukaan bola (Fibonacci sphere) -> distribusi 3D.
  _fibSphere: function (n) {
    const THREE = this.THREE;
    const dirs = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / Math.max(1, n - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const th = phi * i;
      dirs.push(new THREE.Vector3(Math.cos(th) * rad, y, Math.sin(th) * rad));
    }
    return dirs;
  },

  _makeDotTexture: function () {
    const THREE = this.THREE;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(190,235,255,0.9)');
    g.addColorStop(1.0, 'rgba(120,200,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
    return t;
  }
});
