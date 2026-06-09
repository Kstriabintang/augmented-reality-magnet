/* global AFRAME */
/*
 * Komponen A-Frame: <a-entity magnetic-field>
 *
 * WebAR pop-out 3D ala Assemblr Edu untuk medan magnet, dengan 3 MODE interaktif:
 *   A = Bar magnet tunggal (N–S)
 *   B = Dua magnet kutub BEDA berhadapan (N–S)  -> tarik-menarik, garis menyambung
 *   C = Dua magnet kutub SAMA berhadapan (N–N)  -> tolak-menolak, garis menjauh
 *
 * Garis medan dihitung dgn FIELD-LINE TRACING dari kutub titik (fisika asli),
 * jadi efek tarik/tolak muncul otomatis dari konfigurasi tanda kutub.
 * Ganti mode -> geometri dibangun ulang dgn transisi CROSS-FADE (halus, bukan pop).
 *
 * Hirarki: anchor -> group (mengambang) -> spinner (berputar di sumbu z).
 *   Konten 3D (magnet+medan+partikel) di SPINNER; chip label di GROUP (tak berputar),
 *   garis penunjuknya dilacak tiap frame mengikuti rotasi.
 */
AFRAME.registerComponent('magnetic-field', {
  schema: {
    mode:          { type: 'string',  default: 'B' },   // A | B | C
    showMagnets:   { type: 'boolean', default: true },
    showLabels:    { type: 'boolean', default: true },
    autoRotate:    { type: 'boolean', default: true },
    rotateSpeed:   { type: 'number',  default: 10 },
    lift:          { type: 'number',  default: 0.11 },
    particleSpeed: { type: 'number',  default: 0.12 },
    seedsPerPole:  { type: 'number',  default: 18 },
    density:       { type: 'number',  default: 0.05 }
  },

  init: function () {
    const THREE = AFRAME.THREE;
    this.THREE = THREE;
    this.Z = new THREE.Vector3(0, 0, 1);

    this.group = new THREE.Group();
    this.group.position.set(0, 0, this.data.lift);
    this.el.object3D.add(this.group);
    this.spinner = new THREE.Group();
    this.group.add(this.spinner);

    this.lines = [];        // entri partikel aktif (gabungan semua bundle terlihat)
    this.labels = [];       // entri callout aktif
    this.fades = [];         // animasi opacity berjalan
    this._removals = [];     // bundle menunggu dihapus setelah fade-out
    this.dotTex = this._makeDotTexture();
    this._tmp = new THREE.Vector3();
    this._ax = new THREE.Vector3();
    this._t = 0; this._spin = 0;

    this.mode = this.data.mode;
    this._switchTo(this.mode, true);   // bangun mode awal tanpa fade
    this._initDrag();
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

  // API publik dipanggil dari tombol UI
  setMode: function (mode) {
    if (mode === this.mode) return;
    this.mode = mode;
    this._switchTo(mode, false);
  },

  tick: function (time, dt) {
    if (!dt) return;
    const sec = dt / 1000;
    this._t += sec;

    // hapus bundle lama yang sudah selesai fade-out
    for (let i = this._removals.length - 1; i >= 0; i--) {
      const r = this._removals[i]; r.t += sec;
      if (r.t >= r.dur) { this._disposeBundle(r.bundle); this._removals.splice(i, 1); }
    }
    // animasi fade opacity
    for (let i = this.fades.length - 1; i >= 0; i--) {
      const f = this.fades[i]; f.t += sec;
      const k = Math.min(1, f.t / f.dur);
      f.mat.opacity = f.from + (f.to - f.from) * k;
      if (k >= 1) this.fades.splice(i, 1);
    }

    // mengambang + berputar
    this.group.position.z = this.data.lift + 0.012 * Math.sin(this._t * 1.5);
    if (this.data.autoRotate && !this._dragging) {
      this._spin += this.data.rotateSpeed * sec * Math.PI / 180;
    }
    this.spinner.rotation.z = this._spin;

    // partikel mengalir
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
    // garis penunjuk label melacak anchor yang ikut berputar
    const ax = this._ax;
    for (const lb of this.labels) {
      ax.copy(lb.anchor).applyAxisAngle(this.Z, this._spin);
      const p = lb.line.geometry.attributes.position;
      p.setXYZ(0, lb.chip.x, lb.chip.y, lb.chip.z);
      p.setXYZ(1, ax.x, ax.y, ax.z);
      p.needsUpdate = true;
      lb.dot.position.copy(ax);
    }
  },

  // ===== Pergantian mode + cross-fade =====
  _switchTo: function (mode, immediate) {
    const nb = this._buildBundle(mode);
    nb.lineEntries.forEach((e) => this.lines.push(e));
    nb.labelEntries.forEach((e) => this.labels.push(e));

    if (immediate) {
      nb.fadeMats.forEach((f) => { f.mat.opacity = f.target; });
    } else {
      const D = 0.45;
      nb.fadeMats.forEach((f) => {
        f.mat.transparent = true; f.mat.opacity = 0;
        this.fades.push({ mat: f.mat, from: 0, to: f.target, t: 0, dur: D });
      });
      if (this.currentBundle) {
        const ob = this.currentBundle;
        ob.fadeMats.forEach((f) => {
          f.mat.transparent = true;
          this.fades.push({ mat: f.mat, from: f.mat.opacity, to: 0, t: 0, dur: D });
        });
        this._removals.push({ bundle: ob, t: 0, dur: D + 0.05 });
      }
    }
    this.currentBundle = nb;
  },

  _disposeBundle: function (b) {
    const drop = (o) => {
      if (o.parent) o.parent.remove(o);
      if (o.geometry) o.geometry.dispose();
      if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
    };
    b.spinnerObjs.forEach(drop);
    b.groupObjs.forEach(drop);
    this.lines = this.lines.filter((e) => b.lineEntries.indexOf(e) === -1);
    this.labels = this.labels.filter((e) => b.labelEntries.indexOf(e) === -1);
  },

  _buildBundle: function (mode) {
    const THREE = this.THREE;
    const bundle = { spinnerObjs: [], groupObjs: [], lineEntries: [], labelEntries: [], fadeMats: [] };
    const addSpin = (o) => { this.spinner.add(o); bundle.spinnerObjs.push(o); };
    const addGroup = (o) => { this.group.add(o); bundle.groupObjs.push(o); };
    const fade = (mat, target) => { mat.transparent = true; bundle.fadeMats.push({ mat, target }); return mat; };

    const cfg = this._modeConfig(mode);
    const poles = [];
    cfg.bars.forEach((b) => {
      poles.push({ p: new THREE.Vector3(b.x0, 0, 0), q: b.q0 });
      poles.push({ p: new THREE.Vector3(b.x1, 0, 0), q: b.q1 });
    });

    if (this.data.showMagnets) cfg.bars.forEach((b) => this._addBar(b, addSpin, fade));
    this._addFieldLines(poles, addSpin, fade, bundle);
    if (this.data.showLabels) this._addLabels(cfg, addGroup, fade, bundle);
    return bundle;
  },

  // Definisi tiap mode (posisi & tanda kutub + teks label)
  _modeConfig: function (mode) {
    if (mode === 'A') {
      return {
        bars: [{ x0: -0.16, x1: 0.16, q0: +1, q1: -1 }],   // N(kiri)–S(kanan)
        title: 'Bar Magnet Tunggal',
        callouts: [
          { t: 'Kutub Utara (N)',  a: [-0.16, 0, 0.04], c: [-0.5, 0.20, 0.12] },
          { t: 'Kutub Selatan (S)', a: [0.16, 0, 0.04], c: [0.5, 0.20, 0.12] },
          { t: 'Garis Gaya Magnet', a: [0, 0.18, 0.06], c: [0, 0.34, 0.13] }
        ]
      };
    }
    if (mode === 'C') {
      return {
        bars: [
          { x0: -0.345, x1: -0.045, q0: -1, q1: +1 },   // kiri: S..N (N hadap celah)
          { x0: 0.045, x1: 0.345, q0: +1, q1: -1 }       // kanan: N..S (N hadap celah)
        ],
        title: 'Kutub Sama (N–N): Tolak-menolak',
        callouts: [
          { t: 'N', a: [-0.045, 0, 0.04], c: [-0.42, 0.22, 0.12] },
          { t: 'N', a: [0.045, 0, 0.04], c: [0.42, 0.22, 0.12] },
          { t: 'Garis menjauh (tolak)', a: [0, 0.20, 0.06], c: [0, 0.34, 0.13] }
        ]
      };
    }
    // mode B (default)
    return {
      bars: [
        { x0: -0.345, x1: -0.045, q0: -1, q1: +1 },   // kiri: S..N (N hadap celah)
        { x0: 0.045, x1: 0.345, q0: -1, q1: +1 }       // kanan: S..N (S hadap celah)
      ],
      title: 'Kutub Beda (N–S): Tarik-menarik',
      callouts: [
        { t: 'Kutub Utara (N)', a: [0.345, 0, 0.04], c: [0.50, 0.20, 0.12] },
        { t: 'Kutub Selatan (S)', a: [-0.345, 0, 0.04], c: [-0.50, 0.20, 0.12] },
        { t: 'Garis merapat (tarik)', a: [0, 0, 0.03], c: [0, -0.30, 0.11] }
      ]
    };
  },

  // ===== FISIKA medan (pakai poles aktif saat tracing) =====
  _fieldAt: function (r, out) {
    out.set(0, 0, 0);
    const d = this._fTmp || (this._fTmp = new this.THREE.Vector3());
    for (const pole of this._tracePoles) {
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
      for (const pole of this._tracePoles) {
        if (pole.q < 0 && r.distanceTo(pole.p) < rStop) { done = true; break; }
      }
      if (done) break;
    }
    return pts;
  },
  _addFieldLines: function (poles, addSpin, fade, bundle) {
    this._tracePoles = poles;
    const r0 = 0.03;
    for (const pole of poles) {
      if (pole.q <= 0) continue;
      for (const dir of this._fibSphere(this.data.seedsPerPole)) {
        const pts = this._trace(pole.p.clone().addScaledVector(dir, r0));
        if (pts.length >= 4) this._addLine(pts, addSpin, fade, bundle);
      }
    }
  },
  _addLine: function (pts, addSpin, fade, bundle) {
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
    const lineMat = fade(new THREE.LineBasicMaterial({ vertexColors: true }), 0.6);
    addSpin(new THREE.Line(lineGeo, lineMat));

    const count = Math.min(24, Math.max(3, Math.round(length / this.data.density)));
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const pMat = fade(new THREE.PointsMaterial({
      color: 0xeaf6ff, size: 0.018, map: this.dotTex,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }), 0.95);
    const points = new THREE.Points(pGeo, pMat);
    addSpin(points);

    const offsets = [];
    for (let i = 0; i < count; i++) offsets.push(i / count);
    bundle.lineEntries.push({ curve, length, points, offsets });
  },

  // ===== Magnet 3D =====
  _addBar: function (b, addSpin, fade) {
    const THREE = this.THREE;
    const hy = 0.08, dz = 0.08;
    const mk = (cx, w, q) => {
      const geo = new THREE.BoxGeometry(Math.max(0.01, w), hy, dz);
      const mat = fade(new THREE.MeshStandardMaterial({
        color: new THREE.Color(q > 0 ? '#e2331e' : '#1f5fd0'), roughness: 0.3, metalness: 0.35
      }), 1);
      const mesh = new THREE.Mesh(geo, mat); mesh.position.set(cx, 0, 0); addSpin(mesh);
      const em = fade(new THREE.LineBasicMaterial({ color: 0x101418 }), 0.5);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), em);
      edges.position.copy(mesh.position); addSpin(edges);
      this._addLetter(q > 0 ? 'N' : 'S', cx, dz / 2 + 0.001, addSpin, fade);
    };
    const mid = (b.x0 + b.x1) / 2;
    mk((b.x0 + mid) / 2, mid - b.x0, b.q0);
    mk((mid + b.x1) / 2, b.x1 - mid, b.q1);
  },
  _addLetter: function (text, x, zTop, addSpin, fade) {
    const THREE = this.THREE;
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.font = 'bold 96px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 70);
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true;
    const mat = fade(new THREE.MeshBasicMaterial({ map: tex }), 1);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05), mat);
    plane.position.set(x, 0, zTop); addSpin(plane);
  },

  // ===== Label callout =====
  _addLabels: function (cfg, addGroup, fade, bundle) {
    const THREE = this.THREE;
    // judul (tanpa penunjuk)
    const tt = this._chip(cfg.title, true);
    const tspr = new THREE.Sprite(fade(new THREE.SpriteMaterial({ map: tt.tex, depthTest: false }), 1));
    const th = 0.062; tspr.scale.set(th * tt.aspect, th, 1);
    tspr.position.set(0, 0.47, 0.14); addGroup(tspr);

    cfg.callouts.forEach((co) => {
      const anchor = new THREE.Vector3(co.a[0], co.a[1], co.a[2]);
      const chip = new THREE.Vector3(co.c[0], co.c[1], co.c[2]);
      const lmat = fade(new THREE.LineBasicMaterial({ color: 0xffffff, depthTest: false }), 0.75);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([anchor.clone(), chip.clone()]), lmat);
      line.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage); addGroup(line);
      const dmat = fade(new THREE.MeshBasicMaterial({ color: 0xffcf66, depthTest: false }), 1);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 12), dmat);
      dot.position.copy(anchor); addGroup(dot);
      const ch = this._chip(co.t, false);
      const spr = new THREE.Sprite(fade(new THREE.SpriteMaterial({ map: ch.tex, depthTest: false }), 1));
      const h = 0.055; spr.scale.set(h * ch.aspect, h, 1);
      spr.position.copy(chip); addGroup(spr);
      bundle.labelEntries.push({ line, dot, anchor: anchor.clone(), chip: chip.clone() });
    });
  },
  _chip: function (text, isTitle) {
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
    ctx.fillStyle = isTitle ? 'rgba(30,95,208,0.96)' : 'rgba(255,150,20,0.96)';
    ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + 2);
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true;
    return { tex, aspect: w / h };
  },

  // ===== Seret untuk memutar =====
  _initDrag: function () {
    let lastX = null;
    const start = (x) => { lastX = x; this._dragging = true; };
    const move = (x) => { if (lastX != null) { this._spin += (x - lastX) * 0.01; lastX = x; } };
    const end = () => { lastX = null; this._dragging = false; };
    const sceneEl = this.el.sceneEl;
    const canvas = (sceneEl && sceneEl.canvas) ? sceneEl.canvas : window;
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
