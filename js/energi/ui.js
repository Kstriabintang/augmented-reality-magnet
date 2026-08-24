// UI bersama halaman /energi/3d/ & /energi/ar/ — tombol tahap dinamis, pill rantai energi,
// label 3D (CSS2D) berwarna per bentuk energi, chips pemilih materi, narasi teks + suara.
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { ETYPE, ICON } from '/js/energi/registry.js?v=2';

export const typeColors = t => ETYPE[t] || ETYPE.listrik;

// ---------- tombol tahap (jumlah menyesuaikan materi: 3–5) ----------
export function buildStages(el, materi, onPick) {
  el.innerHTML = '';
  const btns = materi.stages.map(stg => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'stbtn'; b.dataset.stage = stg.key;
    const [c1, c2, tc] = typeColors(stg.type);
    b.style.setProperty('--c1', c1); b.style.setProperty('--c2', c2); b.style.setProperty('--tc', tc);
    b.innerHTML = `<span class="no">${stg.no}</span><svg viewBox="0 0 24 24">${ICON[stg.type] || ICON.listrik}</svg>${stg.btn}`;
    b.title = stg.title;
    b.addEventListener('click', () => onPick(stg.key));
    el.appendChild(b);
    return b;
  });
  if (materi.stages.length > 4) el.classList.add('many');
  return { set(cur) { btns.forEach(b => b.classList.toggle('on', b.dataset.stage === cur)); } };
}

// ---------- pill rantai energi (menyala bertahap sesuai stage.lit) ----------
export function buildChain(el, materi) {
  el.innerHTML = '';
  const pills = [], arrows = [];
  materi.chain.forEach((c, i) => {
    if (i) { const a = document.createElement('span'); a.className = 'car'; a.textContent = '→'; el.appendChild(a); arrows.push(a); }
    const p = document.createElement('span'); p.className = 'cpill';
    const [, c2, tc] = typeColors(c.t);
    p.dataset.c2 = c2; p.dataset.tc = tc;
    p.innerHTML = `<svg viewBox="0 0 24 24">${ICON[c.t] || ''}</svg>${c.l}`;
    el.appendChild(p); pills.push(p);
  });
  return {
    set(lit) {
      pills.forEach((p, i) => {
        const on = i < lit;
        p.classList.toggle('on', on);
        p.style.background = on ? p.dataset.c2 : '';
        p.style.color = on ? p.dataset.tc : '';
      });
      arrows.forEach((a, i) => a.classList.toggle('on', i < lit - 1));
    }
  };
}

// ---------- chips pemilih materi (tautan — ganti materi = navigasi URL penuh) ----------
export function buildChips(el, order, materiMap, cur, hrefFor) {
  el.innerHTML = '';
  order.forEach(slug => {
    const m = materiMap[slug];
    const a = document.createElement('a');
    a.className = 'mchip' + (slug === cur ? ' on' : '');
    a.href = hrefFor(slug);
    a.innerHTML = `<span class="em">${m.emoji}</span>${m.short}`;
    el.appendChild(a);
  });
  const on = el.querySelector('.mchip.on');
  if (on && on.scrollIntoView) { try { on.scrollIntoView({ inline: 'center', block: 'nearest' }); } catch (e) { } }
}

// ---------- label 3D menempel (CSS2D); label tahap MENIMPA label dasar pada anchor sama ----------
export function buildLabels(scene, materi) {
  const items = materi.labels.map(d => {
    const div = document.createElement('div');
    div.className = 'clabel' + (d.type ? ' tlab' : '');
    if (d.type) {
      const [, c2, tc] = typeColors(d.type);
      div.style.background = c2; div.style.color = tc; div.style.borderColor = 'rgba(255,255,255,.45)';
    }
    div.textContent = d.t;
    const o = new CSS2DObject(div);
    const anchor = scene.anchors[d.a];
    if (anchor) anchor.add(o);
    return { d, o, div, anchor };
  });
  function set(cur) {
    const stageOnAnchor = {};
    items.forEach(it => { if (it.d.st && cur && it.d.st.includes(cur)) stageOnAnchor[it.d.a] = true; });
    items.forEach(it => {
      const vis = it.d.st ? (!!cur && it.d.st.includes(cur)) : !stageOnAnchor[it.d.a];
      it.o.visible = vis;
      it.div.style.display = vis ? '' : 'none';
    });
  }
  set(null);
  return { set, dispose() { items.forEach(it => { if (it.anchor) it.anchor.remove(it.o); it.div.remove(); }); } };
}

// ---------- narasi teks + suara (SpeechSynthesis id-ID, preferensi tersimpan) ----------
export function makeNarator({ panelEl, titleEl, textEl, subEl, speakBtn, closeBtn, key = 'adindautami-nar', onClose = null }) {
  let on = true, cur = null;
  try { on = (localStorage.getItem(key) ?? '1') === '1'; } catch (e) { }
  function speak(txt) {
    if (!on || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt.replace(/[“”]/g, ''));
      u.lang = 'id-ID'; u.rate = .95;
      speechSynthesis.speak(u);
    } catch (e) { }
  }
  function stop() { try { speechSynthesis.cancel(); } catch (e) { } }
  function render() { speakBtn.classList.toggle('off', !on); }
  speakBtn.addEventListener('click', () => {
    on = !on;
    try { localStorage.setItem(key, on ? '1' : '0'); } catch (e) { }
    render();
    if (!on) stop(); else if (cur) speak(cur.text);
  });
  if (closeBtn) closeBtn.addEventListener('click', () => { panelEl.classList.remove('show'); stop(); if (onClose) onClose(); });
  function show(stg) {
    cur = stg;
    if (!stg) { panelEl.classList.remove('show'); stop(); return; }
    titleEl.textContent = stg.title;
    textEl.textContent = stg.text;
    subEl.textContent = stg.sub;
    panelEl.classList.add('show');
    speak(stg.text);
  }
  render();
  return { show, stop };
}
