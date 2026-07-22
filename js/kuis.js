// Kuis Magnet & Listrik — utamiii.my.id
// Input nama + kelas + sekolah · 20 soal · tiap benar = 5 poin (maks 100) · salah -> kunci + pembahasan.
// Wajib jawab semua sebelum mengumpulkan. Hasil disimpan ke Supabase (tabel hasil_kuis_utami).
import { SUPABASE_URL, SUPABASE_ANON_KEY, TABLE, isConfigured } from '/js/config.js?v=1';

const POINTS_PER = 5;

// ---------- diagram SVG (selalu di atas kartu terang) ----------
import { FIG, QUESTIONS } from '/js/soal.js?v=2';


// ---------- util DOM ----------
const el = (t, c) => { const n = document.createElement(t); if (c) n.className = c; return n; };
const LETTERS = ["A", "B", "C", "D"];
const app = document.getElementById('app');
const escapeHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const state = { nama: "", kelas: "", sekolah: "", answers: new Array(QUESTIONS.length).fill(null), idx: 0, startedAt: 0 };

async function saveResult(row) {
  if (!isConfigured()) return { ok: false, skipped: true };
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
      body: JSON.stringify(row),
    });
    return { ok: r.ok, status: r.status };
  } catch (e) { return { ok: false, error: e.message }; }
}

function screenStart() {
  app.innerHTML = "";
  const wrap = el('div', 'k-wrap');
  wrap.innerHTML = `
    <div class="k-hero">
      <div class="k-badge">📝 Kuis</div>
      <h1>Kuis Magnet &amp; Listrik</h1>
      <p>20 soal pilihan ganda. Setiap jawaban benar bernilai <b>5 poin</b> (nilai maksimal <b>100</b>). Isi identitasmu dulu, ya.</p>
    </div>
    <form class="k-card k-form" id="k-form" novalidate>
      <label class="k-field"><span>Nama lengkap</span><input id="f-nama" type="text" autocomplete="name" placeholder="mis. Ananda Putri" required><em class="k-err" id="e-nama"></em></label>
      <label class="k-field"><span>Kelas</span><input id="f-kelas" type="text" autocomplete="off" placeholder="mis. VI-A" required><em class="k-err" id="e-kelas"></em></label>
      <label class="k-field"><span>Nama sekolah</span><input id="f-sekolah" type="text" autocomplete="off" placeholder="mis. SD Negeri 1" required><em class="k-err" id="e-sekolah"></em></label>
      <button class="k-btn k-btn-primary" type="submit">Mulai Kuis →</button>
      <a class="k-back" href="/">← Kembali ke beranda</a>
    </form>`;
  app.appendChild(wrap);
  document.getElementById('k-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('f-nama').value.trim(), kelas = document.getElementById('f-kelas').value.trim(), sekolah = document.getElementById('f-sekolah').value.trim();
    let ok = true;
    document.getElementById('e-nama').textContent = nama ? "" : (ok = false, "Nama wajib diisi.");
    document.getElementById('e-kelas').textContent = kelas ? "" : (ok = false, "Kelas wajib diisi.");
    document.getElementById('e-sekolah').textContent = sekolah ? "" : (ok = false, "Nama sekolah wajib diisi.");
    if (!ok) return;
    Object.assign(state, { nama, kelas, sekolah, answers: new Array(QUESTIONS.length).fill(null), idx: 0, startedAt: Date.now() });
    screenQuiz();
  });
}

function screenQuiz() {
  app.innerHTML = "";
  const i = state.idx, Q = QUESTIONS[i], total = QUESTIONS.length;
  const answered = state.answers.filter(a => a !== null).length;
  const unanswered = state.answers.map((a, k) => a === null ? k : -1).filter(k => k >= 0);
  const complete = unanswered.length === 0;
  const wrap = el('div', 'k-wrap');
  const top = el('div', 'k-quiztop');
  top.innerHTML = `<div class="k-prog"><div class="k-prog-bar" style="width:${Math.round(answered / total * 100)}%"></div></div>
    <div class="k-progtext"><span>Soal <b>${i + 1}</b> / ${total}</span><span>${answered}/${total} terjawab</span></div>`;
  wrap.appendChild(top);
  const card = el('div', 'k-card k-qcard');
  card.innerHTML = `<div class="k-qnum">Soal ${i + 1} · ${escapeHtml(Q.t)}</div><div class="k-qtext">${escapeHtml(Q.q)}</div>${Q.fig ? `<div class="k-fig">${FIG[Q.fig]}</div>` : ""}`;
  const opts = el('div', 'k-opts');
  Q.opts.forEach((o, k) => {
    const b = el('button', 'k-opt'); b.type = 'button';
    if (state.answers[i] === k) b.classList.add('is-sel');
    b.innerHTML = `<span class="k-optl">${LETTERS[k]}</span><span class="k-optt">${escapeHtml(o)}</span>`;
    b.addEventListener('click', () => { state.answers[i] = k; screenQuiz(); });
    opts.appendChild(b);
  });
  card.appendChild(opts); wrap.appendChild(card);
  const nav = el('div', 'k-nav');
  const prev = el('button', 'k-btn k-btn-ghost'); prev.type = 'button'; prev.textContent = '← Sebelumnya'; prev.disabled = i === 0;
  prev.addEventListener('click', () => { state.idx = Math.max(0, i - 1); screenQuiz(); });
  nav.appendChild(prev);
  if (i < total - 1) {
    const next = el('button', 'k-btn k-btn-primary'); next.type = 'button'; next.textContent = 'Berikutnya →';
    next.addEventListener('click', () => { state.idx = Math.min(total - 1, i + 1); screenQuiz(); });
    nav.appendChild(next);
  } else {
    const fin = el('button', 'k-btn k-btn-primary'); fin.type = 'button';
    fin.textContent = complete ? 'Kumpulkan Jawaban ✓' : `Kurang ${unanswered.length} soal`; fin.disabled = !complete;
    fin.addEventListener('click', () => { if (complete) screenResult(); });
    nav.appendChild(fin);
  }
  wrap.appendChild(nav);
  if (!complete) {
    const warn = el('div', 'k-unans'); warn.innerHTML = `<b>Wajib jawab semua soal.</b> Belum dijawab: `;
    const chips = el('span', 'k-unans-chips');
    unanswered.forEach((k) => { const c = el('button', 'k-unans-chip'); c.type = 'button'; c.textContent = k + 1; c.addEventListener('click', () => { state.idx = k; screenQuiz(); }); chips.appendChild(c); });
    warn.appendChild(chips); wrap.appendChild(warn);
  }
  app.appendChild(wrap); window.scrollTo(0, 0);
}

async function screenResult() {
  const total = QUESTIONS.length;
  let benar = 0; QUESTIONS.forEach((Q, i) => { if (state.answers[i] === Q.correct) benar++; });
  const nilai = benar * POINTS_PER, salah = total - benar;
  const durasi = state.startedAt ? Math.round((Date.now() - state.startedAt) / 1000) : null;
  const grade = nilai >= 85 ? { t: "Sangat Baik", c: "#1f9c4d" } : nilai >= 70 ? { t: "Baik", c: "#2f6fd0" } : nilai >= 55 ? { t: "Cukup", c: "#c78a00" } : { t: "Perlu Belajar Lagi", c: "#e23c3c" };
  const savePromise = saveResult({ nama: state.nama, kelas: state.kelas, sekolah: state.sekolah, jawaban: state.answers, benar, salah, nilai, jumlah_soal: total, durasi_detik: durasi });

  app.innerHTML = "";
  const wrap = el('div', 'k-wrap');
  const head = el('div', 'k-card k-result');
  head.innerHTML = `
    <div class="k-rident">${escapeHtml(state.nama)} · <span>${escapeHtml(state.kelas)} · ${escapeHtml(state.sekolah)}</span></div>
    <div class="k-score">
      <div class="k-ring" style="--v:${nilai};--gc:${grade.c}"><div class="k-ring-in"><b>${nilai}</b><small>/100</small></div></div>
      <div class="k-scoremeta"><div class="k-grade" style="color:${grade.c}">${grade.t}</div>
        <div class="k-benar">Benar <b>${benar}</b> dari ${total} · Salah <b>${salah}</b></div>
        <div class="k-rule">Tiap soal benar = ${POINTS_PER} poin</div><div class="k-save" id="k-save">Menyimpan hasil…</div></div>
    </div>
    <div class="k-ractions"><button class="k-btn k-btn-primary" id="k-again" type="button">Ulangi Kuis</button><a class="k-btn k-btn-ghost" href="/">Beranda</a></div>`;
  wrap.appendChild(head);
  const rev = el('div', 'k-review');
  rev.innerHTML = `<h2 class="k-revh">Pembahasan</h2><p class="k-revsub">Jawaban salah ditandai merah beserta kunci &amp; penjelasannya.</p>`;
  QUESTIONS.forEach((Q, i) => {
    const ua = state.answers[i], ok = ua === Q.correct;
    const item = el('div', 'k-ritem ' + (ok ? 'is-ok' : 'is-no'));
    let html = `<div class="k-rq"><span class="k-rmark">${ok ? '✓' : '✕'}</span><span><b>Soal ${i + 1}.</b> ${escapeHtml(Q.q)}</span></div>${Q.fig ? `<div class="k-fig k-fig-sm">${FIG[Q.fig]}</div>` : ""}<ul class="k-ropts">`;
    Q.opts.forEach((o, k) => {
      let cls = k === Q.correct ? "k-correct" : (k === ua ? "k-wrong" : "");
      const tag = k === Q.correct ? ' <em>(kunci)</em>' : (k === ua && !ok ? ' <em>(jawabanmu)</em>' : '');
      html += `<li class="${cls}"><span class="k-optl">${LETTERS[k]}</span> ${escapeHtml(o)}${tag}</li>`;
    });
    html += `</ul>`;
    if (ua === null) html += `<div class="k-note k-note-empty">Tidak dijawab.</div>`;
    html += `<div class="k-note"><b>Pembahasan:</b> ${escapeHtml(Q.pembahasan)}</div>`;
    item.innerHTML = html; rev.appendChild(item);
  });
  wrap.appendChild(rev); app.appendChild(wrap); window.scrollTo(0, 0);
  document.getElementById('k-again').addEventListener('click', screenStart);
  const saveEl = document.getElementById('k-save');
  const res = await savePromise;
  if (res.ok) saveEl.innerHTML = '<span class="k-save-ok">✓ Hasil tersimpan</span>';
  else if (res.skipped) saveEl.style.display = 'none';
  else saveEl.innerHTML = '<span class="k-save-no">⚠ Gagal menyimpan (nilai tetap tampil)</span>';
}

screenStart();
