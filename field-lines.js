/* global AFRAME */
/*
 * Komponen A-Frame: <a-entity magnetic-field>
 *
 * Mode "pop-out 3D": objek magnet + medan magnet melayang di atas marker,
 * mengambang + berputar pelan, lengkap dengan label info melayang.
 * (Konsep sama dgn AR edukasi Assemblr: model 3D muncul di atas kartu.)
 *
 * Isi:
 *  - DUA batang magnet 3D (separuh N merah, separuh S biru, berlabel huruf).
 *  - Garis medan 3D hasil FIELD-LINE TRACING (telusuri arah medan B dari N->S).
 *  - Partikel mengalir sepanjang tiap garis (N -> S), kecepatan seragam.
 *  - Label callout melayang (billboard) + garis penunjuk.
 *  - Mengambang (bob) + auto-rotate seperti model 3D pada contoh.
 *
 * Koordinat MindAR image target: lebar foto = 1 unit (x: -0.5..0.5),
 * +y atas, +z keluar dari kartu menuju kamera (arah "pop-out").
 */
AFRAME.registerComponent('magnetic-field', {
  schema: {
    showMagnets:   { type: 'boolean', default: true },
    showLabels:    { type: 'boolean', default: true },
    autoRotate:    { type: 'boolean', default: true },
    rotateSpeed:   { type: 'number',  default: 14 },    // derajat per detik
    lift:          { type: 'number',  default: 0.12 },  // tinggi mengambang di atas kartu
    particleSpeed: { type: 'number',  default: 0.12 },  // satuan-dunia per detik (seragam)
    seedsPerPole:  { type: 'number',  default: 18 },    // jumlah garis medan per kutub N
    density:       { type: 'number',  default: 0.05 }   // jarak antar partikel
  },

  init: function () {
    const THREE = AFRAME.THREE;
    this.THREE = THREE;
    this.group = new THREE.Group();
    this.group.position.set(0, 0, this.data.lift);   // melayang di atas kartu
    this.el.object3D.add(this.group);

    const z = 0;  // sumbu magnet di pusat group (group sendiri yg diangkat)
    this.magnets = [
      { sx: -0.345, nx: -0.045 },  // magnet kiri:  S(-) ... N(+)
      { sx:  0.045, nx:  0.345 }   // magnet kanan
    ];
    this.poles = [];
    this.magnets.forEach((m) => {
      this.poles.push({ p: new THREE.Vector3(m.sx, 0, z), q: -1 });   // S
      this.poles.push({ p: new THREE.Vector3(m.nx, 0, z), q: +1 });   // N
    });

    this.lines = [];
    this.dotTex = this._makeDotTexture();
    this._tmp = new THREE.Vector3();
    this._t = 0;
    this._spin = 0;

    if (this.data.showMagnets) this._buildMagnets();
    this._buildFieldLines();
    if (this.data.showLabels) this._buildLabels();

    this._initDrag();   // sentuh/seret untuk memutar manual
  },

  remove: function () {
    if (this.group) this.el.object3D.remove(this.group);
    if (this._onMove) {
      window.removeEventListener('touchmove', this._onMove);
      window.removeEventListener('mousemove', this._onMove);
      window.removeEventListener('touchend', this._onUp);
      window.removeEventListener('mouseup', this._onUp);
    }
  },

  tick: function (time, dt) {
    if (!dt) return;
    const sec = dt / 1000;
    this._t += sec;

    // mengambang + berputar (seperti model 3D pada contoh)
    this.group.position.z = this.data.lift + 0.012 * Math.sin(this._t * 1.5);
    if (this.data.autoRotate && !this._dragging) {
      this._spin += this.data.rotateSpeed * sec * Math.PI / 180;
    }
    this.group.rotation.z = this._spin;

    // alirkan partikel sepanjang tiap garis (kecepatan dunia seragam)
    const v = this._tmp, speed = this.data.particleSpeed;
    for (const L of this.lines) {
      const dT = (speed * sec) / L.length;
      const pos = L.points.geometry.attributes.position;
      for (let i = 0; i < L.offsets.length; i++) {
        L.offsets[i] = (L.offsets[i] + dT) % 1;
        L.curve.getPointAt(L.offsets[i], v);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      pos.needsUpdate = true;
    }
  },

  // ===== FISIKA medan: jumlah kontribusi tiap kutub titik =====
  _fieldAt: function (r, out) {
    out.set(0, 0, 0);
    const d = this._fTmp || (this._fTmp = new this.THREE.Vector3());
    for (const pole of this.poles) {
      d.subVectors(r, pole.p);
      const len = d.length();
      if (len < 1e-4) continue;
      out.addScaledVector(d, pole.q / (len * len * len));
    }
    return out;
  },
  _unitField: function (r, out) {
    this._fieldAt(r, out);
    const len = out.length();
    if (len < 1e-9) return null;
    out.multiplyScalar(1 / len);
    return out;
  },
  _trace: function (seed) {
    const THREE = this.THREE;
    const ds = 0.012, maxSteps = 600, bound = 0.95, rStop = 0.045;
    const pts = [seed.clone()];
    const r = seed.clone();
    const k1 = new THREE.Vector3(), k2 = new THREE.Vector3(), mid = new THREE.Vector3();
    for (let s = 0; s < maxSteps; s++) {
      if (!this._unitField(r, k1)) break;
      mid.copy(r).addScaledVector(k1, ds * 0.5);
      if (!this._unitField(mid, k2)) break;
      r.addScaledVector(k2, ds);
      if (r.length() > bound) break;
      pts.push(r.clone());
      let done = false;
      for (const pole of this.poles) {
        if (pole.q < 0 && r.distanceTo(pole.p) < rStop) { done = true; break; }
      }
      if (done) break;
    }
    return pts;
  },
  _buildFieldLines: function () {
    const r0 = 0.03;
    for (const pole of this.poles) {
      if (pole.q <= 0) continue;
      for (const dir of this._fibSphere(this.data.seedsPerPole)) {
        const pts = this._trace(pole.p.clone().addScaledVector(dir, r0));
        if (pts.length >= 4) this._addLine(pts);
      }
    }
  },
  _addLine: function (pts) {
    const THREE = this.THREE;
    const curve = new THREE.CatmullRomCurve3(pts);
    const length = curve.getLength();

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
    this.group.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.6
    })));

    const count = Math.min(24, Math.max(3, Math.round(length / this.data.density)));
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const points = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xeaf6ff, size: 0.018, map: this.dotTex, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    this.group.add(points);

    const offsets = [];
    for (let i = 0; i < count; i++) offsets.push(i / count);
    this.lines.push({ curve, length, points, offsets });
  },

  // ===== Magnet 3D =====
  _buildMagnets: function () {
    const THREE = this.THREE;
    const hy = 0.07, dz = 0.07;
    const half = (x, w, color) => {
      const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.3, metalness: 0.35 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, hy, dz), mat);
      mesh.position.set(x, 0, 0);
      this.group.add(mesh);
    };
    this.magnets.forEach((m) => {
      const w = (m.nx - m.sx) / 2;
      half(m.sx + w / 2, w, '#1f5fd0');   // S biru
      half(m.nx - w / 2, w, '#e2331e');   // N merah
      this._letter('S', m.sx + w / 2, dz / 2 + 0.001);
      this._letter('N', m.nx - w / 2, dz / 2 + 0.001);
    });
  },
  _letter: function (text, x, zTop) {
    const THREE = this.THREE;
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.font = 'bold 92px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 70);
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.045),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    plane.position.set(x, 0, zTop);
    this.group.add(plane);
  },

  // ===== Label callout melayang (billboard) + garis penunjuk =====
  _buildLabels: function () {
    const THREE = this.THREE;
    const A = (x, y, z) => new THREE.Vector3(x, y, z);
    const left = this.magnets[0], right = this.magnets[1];
    this._callout('Kutub Utara (N)', A(right.nx, 0, 0.03), A(0.46, 0.20, 0.10));
    this._callout('Kutub Selatan (S)', A(left.sx, 0, 0.03), A(-0.46, 0.20, 0.10));
    this._callout('Garis Gaya Magnet', A(0, 0.22, 0.05), A(0.0, 0.34, 0.12));
    this._callout('Tarik-menarik N–S', A((left.nx + right.sx) / 2, 0, 0.02), A(0.0, -0.26, 0.10));
  },
  _callout: function (text, anchor, chipPos) {
    const THREE = this.THREE;
    // garis penunjuk
    this.group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([anchor.clone(), chipPos.clone()]),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthTest: false })
    ));
    // titik di anchor
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffcf66, depthTest: false }));
    dot.position.copy(anchor); this.group.add(dot);
    // chip teks (billboard menghadap kamera)
    const { tex, aspect } = this._chip(text);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    const h = 0.055; spr.scale.set(h * aspect, h, 1);
    spr.position.copy(chipPos);
    this.group.add(spr);
  },
  _chip: function (text) {
    const THREE = this.THREE;
    const fs = 48, pad = 30;
    let c = document.createElement('canvas');
    let ctx = c.getContext('2d');
    ctx.font = 'bold ' + fs + 'px sans-serif';
    const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
    const h = fs + pad;
    c.width = w; c.height = h;
    ctx = c.getContext('2d');
    ctx.font = 'bold ' + fs + 'px sans-serif';
    const r = h / 2;
    ctx.beginPath();
    ctx.moveTo(r, 0); ctx.arcTo(w, 0, w, h, r); ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r); ctx.arcTo(0, 0, w, 0, r); ctx.closePath();
    ctx.fillStyle = 'rgba(255,150,20,0.96)'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + 2);
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true;
    return { tex, aspect: w / h };
  },

  // ===== Seret untuk memutar manual (sentuh/mouse) =====
  _initDrag: function () {
    let lastX = null;
    const start = (x) => { lastX = x; this._dragging = true; };
    const move = (x) => {
      if (lastX == null) return;
      this._spin += (x - lastX) * 0.01;
      lastX = x;
    };
    const end = () => { lastX = null; this._dragging = false; };
    const sceneEl = this.el.sceneEl;
    const canvas = sceneEl && sceneEl.canvas ? sceneEl.canvas : window;
    canvas.addEventListener('touchstart', (e) => start(e.touches[0].clientX));
    canvas.addEventListener('mousedown', (e) => start(e.clientX));
    this._onMove = (e) => move(e.touches ? e.touches[0].clientX : e.clientX);
    this._onUp = end;
    window.addEventListener('touchmove', this._onMove);
    window.addEventListener('mousemove', this._onMove);
    window.addEventListener('touchend', this._onUp);
    window.addEventListener('mouseup', this._onUp);
  },

  _fibSphere: function (n) {
    const THREE = this.THREE;
    const dirs = [], phi = Math.PI * (3 - Math.sqrt(5));
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
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0.0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(190,235,255,0.9)');
    g.addColorStop(1.0, 'rgba(120,200,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.needsUpdate = true;
    return t;
  }
});
