/* ============================================================================
   Bitácora de Hierro · aplicación
   ============================================================================ */
(function () {
'use strict';
const S = window.S, D = window.Data;

/* ---------- utilidades ---------- */
const $ = (s, r) => (r || document).querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const isoDay = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => isoDay(new Date());
const parseDay = (s) => { const p = String(s).split('-').map(Number); return new Date(p[0], (p[1] || 1) - 1, p[2] || 1); };
const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 864e5);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const num = (v) => { if (v === '' || v == null) return null; const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };
const e1rm = (w, r) => (w > 0 && r > 0) ? w * (1 + r / 30) : 0; // Epley
const r1 = (n) => (n == null || isNaN(n)) ? null : Math.round(n * 10) / 10;
const f1 = (n) => (n == null || isNaN(n)) ? '—' : String(r1(n));
const fmtDate = (s) => parseDay(s).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
const shortD = (d) => d ? parseDay(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';
const ago = (s) => { const d = daysBetween(s, today()); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : 'hace ' + d + ' días'; };
const plural = (n, a, b) => n + ' ' + (n === 1 ? a : b);
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || uid();
const MUSCLES = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Antebrazo', 'Cuádriceps', 'Femorales', 'Glúteos', 'Pantorrillas', 'Abdomen', 'Otro'];
const MEAS = [['shoulders', 'Hombros'], ['chest', 'Pecho'], ['armRelaxed', 'Brazo relajado'], ['armFlexed', 'Brazo contraído'], ['waist', 'Cintura'], ['hips', 'Cadera / glúteos'], ['thigh', 'Muslo'], ['calf', 'Pantorrilla']];
const EQUIP = ['Barra', 'Mancuernas', 'Máquina', 'Polea', 'Peso corporal', 'Smith', 'Kettlebell', 'Banda', 'Otro'];
const SET_T = { N: { l: '', name: 'Normal' }, W: { l: 'C', name: 'Calentamiento' }, D: { l: 'D', name: 'Drop set' }, F: { l: 'F', name: 'Al fallo' } };
const isWork = (x) => (x.type || 'N') !== 'W';
const TARGET = { get min() { return S.settings.setMin || 10; }, get max() { return S.settings.setMax || 20; } };
const exById = (id) => S.exercises.find((e) => e.id === id);

const IC = {
  train: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5M4 19h16M8 15l3-4 3 2 5-7"/></svg>',
  body: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7.5" width="18" height="9" rx="2"/><path d="M7 7.5v3.5M11 7.5v4.5M15 7.5v3.5M19 7.5v4.5"/></svg>',
  coach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5h16v11H9.5L5 20v-3.5H4z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="5.5" cy="12" r=".6"/><circle cx="12" cy="12" r=".6"/><circle cx="18.5" cy="12" r=".6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/></svg>',
  back: '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2L2 10l8 8"/></svg>'
};

/* ---------- estado de la interfaz ---------- */
let authed = false, view = 'train', draft = null;
let histTab = 'sessions', histEx = null, bodyTab = 'weight', bodyMetric = 'waist', moreSub = null;
let buildSel = [], foodDay = today(), foodMeal = null, calMonth = today().slice(0, 7), calDay = today();
let tplEdit = null, restUntil = 0, restTotal = 0, coachQ = '', exMus = 'Todos';
/* capas de navegación: lo que el botón «atrás» cierra primero (menús, hojas, subpantallas, pestaña) */
const layers = [];
const layerDel = (l) => { const i = layers.indexOf(l); if (i >= 0) layers.splice(i, 1); };

/* ---------- avisos, hojas y menús ---------- */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 2600);
}
const sheets = [];
function openSheet(o) {
  const el = document.createElement('div');
  el.className = 'back fade';
  el.innerHTML = '<div class="sheet' + (o.short ? ' short' : '') + '" role="dialog" aria-modal="true"><div class="sheet-h"><div class="hl"></div><h3></h3><div class="hr" style="text-align:right"></div></div><div class="sheet-b"></div></div>';
  delete LFS.pickQ; delete LFS.catQ;
  o.el = el; o.id = uid();
  el.addEventListener('click', (e) => { if (e.target === el && o.dismiss !== false) closeSheet(o); });
  $('#layer').appendChild(el);
  sheets.push(o); o._l = { close: () => closeSheet(o) }; layers.push(o._l);
  drawSheet(o, true);
  return o;
}
function drawSheet(o, first) {
  if (!o.el) return;
  const b = $('.sheet-b', o.el), st = b.scrollTop;
  $('.hl', o.el).innerHTML = o.left === null ? '' : '<button class="nb" data-act="sheetClose">' + esc(o.left || 'Cancelar') + '</button>';
  $('h3', o.el).textContent = o.title || '';
  $('.hr', o.el).innerHTML = o.right ? '<button class="nb b" data-act="sheetOk">' + esc(o.right) + '</button>' : '';
  b.innerHTML = o.body();
  if (!first) b.scrollTop = st;
  restoreLF(o.el);
  if (o.onDraw) o.onDraw(o);
}
function closeSheet(o) {
  o = o || sheets[sheets.length - 1]; if (!o) return;
  const i = sheets.indexOf(o); if (i >= 0) sheets.splice(i, 1);
  if (o._l) layerDel(o._l);
  if (o.el) o.el.remove();
  if (o.onClose) o.onClose();
}
const topSheet = () => sheets[sheets.length - 1];

function actionSheet(title, actions) {
  const el = document.createElement('div'); el.className = 'as-back';
  el.innerHTML = '<div class="as"><div class="g">' + (title ? '<div class="tt">' + esc(title) + '</div>' : '') +
    actions.map((a, i) => '<button data-i="' + i + '" class="' + (a.red ? 'red ' : '') + (a.bold ? 'b' : '') + '">' + esc(a.label) + '</button>').join('') +
    '</div><div class="g"><button class="b" data-i="-1">Cancelar</button></div></div>';
  const L = { close: () => { layerDel(L); el.remove(); } }; layers.push(L);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b || e.target === el) {
      const i = b ? +b.dataset.i : -1; layerDel(L); el.remove();
      if (i >= 0 && actions[i].fn) setTimeout(actions[i].fn, 0);
    }
  });
  $('#layer').appendChild(el);
}
const confirmAct = (title, label, fn) => actionSheet(title, [{ label, red: true, fn }]);

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
  try {
    const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'; document.body.appendChild(ta);
    ta.select(); ta.setSelectionRange(0, text.length); const ok = document.execCommand('copy'); ta.remove(); return ok;
  } catch (e) { return false; }
}
async function shareFile(name, text, mime) {
  try {
    const file = new File([text], name, { type: mime });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast('Archivo descargado: ' + name);
}

/* ---------- borrador de la sesión en curso (solo en este teléfono) ---------- */
let draftT = null;
function saveDraft(now) {
  clearTimeout(draftT);
  const run = () => D.saveDraft(draft);
  if (now) run(); else draftT = setTimeout(run, 250);
}

/* ---------- lógica de entrenamiento ---------- */
function nextTemplate() {
  const ts = S.templates; if (!ts.length) return null;
  const last = S.sessions.find((s) => s.templateId && ts.some((t) => t.id === s.templateId));
  if (!last) return ts[0];
  const i = ts.findIndex((t) => t.id === last.templateId); return ts[(i + 1) % ts.length];
}
function lastFor(exId, skipId) {
  for (const s of S.sessions) {
    if (s.id === skipId) continue;
    const ex = (s.exercises || []).find((e) => e.exerciseId === exId);
    const ws = ex && ex.sets ? ex.sets.filter(isWork) : [];
    if (ws.length) return { date: s.date, sets: ws };
  }
  return null;
}
function bestPrevE1(exId, skipId) {
  let b = 0;
  S.sessions.forEach((s) => { if (s.id === skipId) return; (s.exercises || []).forEach((e) => { if (e.exerciseId === exId) e.sets.filter(isWork).forEach((x) => { b = Math.max(b, e1rm(x.w, x.r)); }); }); });
  return b;
}
const catById = (id) => (window.CATALOG || []).find((c) => c.id === id) || null;
/* Valores propios de cada ejercicio (rango, descanso, series); si no tiene, usa los de la biblioteca o 8–12. */
function exDef(id) {
  const e = exById(id) || {}, c = catById(id) || {}, min = e.repMin || c.repMin || 8, max = e.repMax || c.repMax || 12;
  return { min: min, max: Math.max(min, max), rest: e.restSec || c.restSec || (max <= 8 ? 180 : 120), sets: e.defaultSets || 3 };
}
function newEntry(exId, it) {
  it = it || {};
  const ex = exById(exId) || {}, last = lastFor(exId), d = exDef(exId);
  const n = it.sets || (last ? last.sets.length : d.sets), sets = [];
  for (let i = 0; i < n; i++) {
    const p = last ? (last.sets[i] || last.sets[last.sets.length - 1]) : null;
    sets.push({ w: '', r: '', rir: '', type: 'N', done: false, pw: p ? p.w : null, pr: p ? p.r : null, prir: p ? p.rir : null });
  }
  return { exerciseId: exId, name: ex.name || 'Ejercicio', muscle: ex.muscle || '', repMin: it.repMin || d.min, repMax: it.repMax || d.max, restSec: it.restSec || d.rest, sets };
}
function startSession(t, custom) {
  const items = custom ? custom.items : (t ? t.items || [] : []);
  draft = {
    id: uid(), date: today(), startedAt: new Date().toISOString(), templateId: t ? t.id : null,
    templateName: custom ? custom.name : t ? t.name : 'Sesión libre', notes: '', energy: null, sleepH: '',
    kind: t ? 'rutina' : custom ? 'por_grupos' : 'libre',
    exercises: items.filter((it) => exById(it.exerciseId)).map((it) => newEntry(it.exerciseId, it))
  };
  restUntil = 0; saveDraft(true); view = 'train'; render(); window.scrollTo(0, 0);
}
function editSession(s) {
  if (draft) { toast('Termina o descarta la sesión activa primero.'); return; }
  draft = {
    id: s.id, editing: true, date: s.date, startedAt: s.startedAt, endedAt: s.endedAt, durationMin: s.durationMin, createdAt: s.createdAt, revision: s.revision || 1,
    templateId: s.templateId, templateName: s.templateName, notes: s.notes || '', energy: s.energy == null ? null : s.energy, sleepH: s.sleepH == null ? '' : String(s.sleepH), kind: s.kind || 'rutina',
    exercises: (s.exercises || []).map((e) => ({
      exerciseId: e.exerciseId, name: e.name, muscle: e.muscle, repMin: e.repMin || null, repMax: e.repMax || null, restSec: e.restSec || 120,
      sets: e.sets.map((x) => ({ w: String(x.w), r: String(x.r), rir: x.rir == null ? '' : String(x.rir), type: x.type || 'N', done: true, pw: null, pr: null, prir: null }))
    }))
  };
  saveDraft(true); closeAllSheets(); go('train');
}
function hintFor(en) {
  const last = lastFor(en.exerciseId, draft && draft.editing ? draft.id : null);
  const range = en.repMin && en.repMax ? 'Rango ' + en.repMin + '–' + en.repMax + ' reps · ' : '';
  if (!last) return range + 'Primera vez: registra una base.';
  const best = last.sets.reduce((b, x) => e1rm(x.w, x.r) > e1rm(b.w, b.r) ? x : b, last.sets[0]);
  let tip = '';
  if (en.repMax && last.sets.every((x) => (x.r || 0) >= en.repMax)) tip = ' · <b>Llegaste al tope: sube peso</b>';
  else if (en.repMax) tip = ' · Meta: +1 rep con el mismo peso';
  return range + 'Última (' + ago(last.date) + '): <b>' + last.sets.map((x) => f1(x.w) + '×' + x.r).join(', ') + '</b> · e1RM ' + f1(e1rm(best.w, best.r)) + tip;
}
function doneCount() { return draft ? draft.exercises.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0) : 0; }
function finishSession() {
  if (!doneCount()) {
    actionSheet('No marcaste ninguna serie. Si iniciaste la sesión por error, descártala y no quedará nada registrado.', [
      { label: 'Descartar sesión', red: true, fn: discardDraft }, { label: 'Seguir entrenando' }]);
    return;
  }
  const exs = draft.exercises.map((e) => {
    const ex = exById(e.exerciseId) || {};
    return { exerciseId: e.exerciseId, name: e.name, muscle: e.muscle, secondary: ex.secondary || [], equipment: ex.equipment || null, repMin: e.repMin, repMax: e.repMax, restSec: e.restSec || null,
      sets: e.sets.filter((x) => x.done).map((x) => ({ w: num(x.w) == null ? 0 : num(x.w), r: num(x.r) == null ? 0 : num(x.r), rir: num(x.rir), type: x.type || 'N' })) };
  }).filter((e) => e.sets.length);
  const end = draft.editing ? (draft.endedAt || new Date().toISOString()) : new Date().toISOString();
  const dur = draft.editing && draft.durationMin ? draft.durationMin : Math.max(1, Math.round((new Date(end) - new Date(draft.startedAt)) / 6e4));
  let prN = 0, prName = '';
  exs.forEach((e) => { const b = Math.max.apply(null, e.sets.filter(isWork).map((x) => e1rm(x.w, x.r)).concat([0])), pb = bestPrevE1(e.exerciseId, draft.editing ? draft.id : null); if (b > 0 && pb > 0 && b > pb + 0.05) { prN++; if (!prName) prName = e.name; } });
  D.saveSession({
    id: draft.id, date: draft.date, startedAt: draft.startedAt, endedAt: end, durationMin: dur, templateId: draft.templateId, templateName: draft.templateName,
    kind: draft.kind || 'rutina', muscles: [...new Set(exs.map((e) => e.muscle))], energy: draft.energy, sleepH: num(draft.sleepH), notes: draft.notes || '',
    revision: draft.editing ? (draft.revision || 1) + 1 : 1, createdAt: draft.createdAt, exercises: exs
  });
  const sets = exs.reduce((a, e) => a + e.sets.filter(isWork).length, 0), vol = exs.reduce((a, e) => a + e.sets.filter(isWork).reduce((b, x) => b + x.w * x.r, 0), 0);
  const wasEdit = draft.editing; draft = null; restUntil = 0; saveDraft(true);
  toast(wasEdit ? 'Sesión actualizada' : 'Sesión guardada · ' + plural(sets, 'serie', 'series') + ' · ' + Math.round(vol).toLocaleString('es-MX') + ' kg' + (prN ? ' · ' + (prN === 1 ? 'récord en ' + prName : prN + ' récords nuevos') : ''));
  histTab = 'sessions'; go('history');
}
function discardDraft() { draft = null; restUntil = 0; saveDraft(true); render(); toast('Sesión descartada. No quedó nada registrado.'); }
function buildItems(groups) {
  const per = groups.length >= 3 ? 2 : groups.length === 2 ? 3 : 4, items = [];
  groups.forEach((g) => {
    const use = {};
    S.sessions.slice(0, 40).forEach((s) => (s.exercises || []).forEach((e) => { if (e.muscle === g) use[e.exerciseId] = (use[e.exerciseId] || 0) + 1; }));
    S.templates.forEach((t) => (t.items || []).forEach((it) => { const e = exById(it.exerciseId); if (e && e.muscle === g) use[it.exerciseId] = (use[it.exerciseId] || 0) + 0.5; }));
    const ids = Object.keys(use).filter(exById).sort((a, b) => use[b] - use[a]);
    S.exercises.filter((e) => e.muscle === g && !e.archived && !ids.includes(e.id)).forEach((e) => ids.push(e.id));
    ids.slice(0, per).forEach((id) => {
      let tpl = null; S.templates.forEach((t) => (t.items || []).forEach((it) => { if (it.exerciseId === id && !tpl) tpl = it; }));
      const d = exDef(id); items.push(tpl ? Object.assign({}, tpl) : { exerciseId: id, sets: d.sets, repMin: d.min, repMax: d.max });
    });
  });
  return items;
}
function lastTrained() {
  const m = {};
  S.sessions.forEach((s) => (s.exercises || []).forEach((e) => {
    if (!e.sets.some(isWork)) return;
    [e.muscle].concat(e.secondary || []).forEach((k) => { if (k && (!m[k] || s.date > m[k])) m[k] = s.date; });
  }));
  return m;
}

/* ---------- estadísticas ---------- */
function weekAvg(off) {
  const end = new Date(); end.setDate(end.getDate() - 7 * off);
  const start = new Date(end); start.setDate(start.getDate() - 6);
  const a = isoDay(start), b = isoDay(end), v = S.bodyweight.filter((x) => x.date >= a && x.date <= b).map((x) => x.weight);
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
}
function setsByMuscle(days) {
  const from = new Date(); from.setDate(from.getDate() - (days - 1)); const a = isoDay(from), m = {};
  S.sessions.filter((s) => s.date >= a).forEach((s) => (s.exercises || []).forEach((e) => {
    const k = e.muscle || 'Otro', n = e.sets.filter(isWork).length; m[k] = (m[k] || 0) + n;
    (e.secondary || []).forEach((sc) => { if (sc !== k) m[sc] = (m[sc] || 0) + n * 0.5; });
  }));
  return Object.entries(m).sort((x, y) => y[1] - x[1]);
}
function records() {
  const R = {};
  S.sessions.forEach((s) => (s.exercises || []).forEach((e) => {
    const ws = e.sets.filter(isWork); if (!ws.length) return;
    const r = R[e.exerciseId] || (R[e.exerciseId] = { id: e.exerciseId, name: (exById(e.exerciseId) || e).name, muscle: e.muscle, e1: { v: 0 }, mw: { w: 0, r: 0 }, vol: { v: 0 } });
    ws.forEach((x) => {
      const v = e1rm(x.w, x.r); if (v > r.e1.v) r.e1 = { v: v, date: s.date, w: x.w, r: x.r };
      if (x.w > r.mw.w || (x.w === r.mw.w && x.r > r.mw.r)) r.mw = { w: x.w, r: x.r, date: s.date };
    });
    const vol = ws.reduce((a, x) => a + x.w * x.r, 0); if (vol > r.vol.v) r.vol = { v: vol, date: s.date };
  }));
  return Object.values(R).sort((a, b) => b.e1.v - a.e1.v);
}
const foodOn = (d) => S.food.filter((f) => f.date === d);
const dayTot = (es) => es.reduce((a, e) => ({ kcal: a.kcal + (e.kcal || 0), p: a.p + (e.p || 0), c: a.c + (e.c || 0), f: a.f + (e.f || 0) }), { kcal: 0, p: 0, c: 0, f: 0 });
function foodDays(n) {
  const out = {};
  S.food.forEach((f) => { if (daysBetween(f.date, today()) < n && daysBetween(f.date, today()) >= 0) (out[f.date] = out[f.date] || []).push(f); });
  return Object.keys(out).map((d) => Object.assign({ date: d }, dayTot(out[d])));
}
const MEALS = ['Desayuno', 'Comida', 'Cena', 'Snack'];
const defaultMeal = () => { const h = new Date().getHours(); return h < 11 ? 'Desayuno' : h < 17 ? 'Comida' : h < 21 ? 'Cena' : 'Snack'; };
function recentFoods() {
  const seen = new Map();
  S.food.slice().sort((a, b) => (b.at || '').localeCompare(a.at || '')).slice(0, 120).forEach((e) => { const k = (e.desc || '').toLowerCase(); if (k && !seen.has(k)) seen.set(k, e); });
  return [...seen.values()].slice(0, 8);
}

/* ---------- entrenador externo: prompts para pegar en Claude u otro agente ---------- */
const COACH_RULES = 'Eres el entrenador personal de fuerza e hipertrofia de esta persona. Hablas español de México, claro y directo, como un coach profesional que conoce la evidencia (progresión doble, RIR, volumen semanal de 10–20 series efectivas por grupo, frecuencia de 2 veces por semana por músculo, descargas cada 4–8 semanas o ante estancamiento).\n' +
  'Perfil: busca hipertrofia, mejor composición corporal y fuerza a largo plazo. Entrena 3 a 4 días por semana en días irregulares por su trabajo, rotando rutinas (Torso/Pierna A/B) o armando sesiones por grupos.\n' +
  'Reglas:\n- Basa todo en los DATOS que te paso; cita números concretos (fechas, kg×reps, RIR, series).\n- Si faltan datos para concluir algo, dilo y explica qué registrar.\n- Da recomendaciones accionables: qué peso, cuántas series y reps, qué ajustar la próxima sesión.\n- Sé breve: viñetas cortas, máximo unas 250 palabras salvo que pida más.\n- No des consejos médicos; ante dolor o lesión sugiere consultar a un profesional.\n- "C" = serie de calentamiento (no cuenta). "D" = drop set. "F" = al fallo. e1RM = 1RM estimado con Epley.';
function digest() {
  const L = [], t = today();
  L.push('Hoy: ' + t + '. Metas: ' + TARGET.min + '-' + TARGET.max + ' series efectivas/semana por grupo' + (S.settings.kcal ? ', ' + S.settings.kcal + ' kcal/día' : '') + (S.settings.protein ? ', ' + S.settings.protein + ' g de proteína/día' : '') + '.');
  L.push('Rutinas en rotación: ' + (S.templates.map((x) => x.name + ' [' + (x.items || []).map((i) => ((exById(i.exerciseId) || {}).name || '?') + ' ' + (i.sets || 3) + 'x' + (i.repMin || '?') + '-' + (i.repMax || '?')).join('; ') + ']').join(' | ') || 'ninguna'));
  L.push('\nSESIONES (más reciente primero, últimas 12 semanas):');
  S.sessions.filter((s) => daysBetween(s.date, t) <= 84).slice(0, 36).forEach((s) => {
    L.push(s.date + ' · ' + s.templateName + (s.energy ? ' · energía ' + s.energy + '/5' : '') + (s.sleepH ? ' · sueño ' + s.sleepH + ' h' : '') + (s.durationMin ? ' · ' + s.durationMin + ' min' : ''));
    (s.exercises || []).forEach((e) => L.push('  ' + e.name + ' (' + e.muscle + (e.repMin ? ', rango ' + e.repMin + '-' + e.repMax : '') + '): ' + e.sets.map((x) => (x.type === 'W' ? 'C ' : x.type === 'D' ? 'D ' : x.type === 'F' ? 'F ' : '') + f1(x.w) + 'x' + x.r + (x.rir != null ? '@' + x.rir : '')).join(', ')));
    if (s.notes) L.push('  Nota: ' + s.notes);
  });
  if (!S.sessions.length) L.push('(sin sesiones registradas todavía)');
  L.push('\nSERIES EFECTIVAS POR GRUPO, últimos 7 días: ' + (setsByMuscle(7).map((k) => k[0] + ' ' + f1(k[1])).join(', ') || 'ninguna'));
  L.push('Últimos 14 días: ' + (setsByMuscle(14).map((k) => k[0] + ' ' + f1(k[1])).join(', ') || 'ninguna'));
  const wk = []; for (let i = 0; i < 8; i++) { const a = weekAvg(i); if (a != null) wk.push('hace ' + i + ' sem: ' + f1(a)); }
  L.push('\nPESO CORPORAL (promedio de 7 días, kg): ' + (wk.join(' | ') || 'sin registros'));
  if (S.measurements.length) L.push('MEDIDAS (cm): ' + S.measurements.slice(0, 4).map((m) => m.date + ' ' + MEAS.map((k) => m[k[0]] != null ? k[1] + ' ' + m[k[0]] : '').filter(Boolean).join(', ')).join(' | '));
  const fd = foodDays(7);
  if (fd.length) L.push('COMIDA últimos 7 días (' + fd.length + ' días registrados): promedio ' + Math.round(fd.reduce((a, x) => a + x.kcal, 0) / fd.length) + ' kcal y ' + Math.round(fd.reduce((a, x) => a + x.p, 0) / fd.length) + ' g de proteína.');
  const pr = records().slice(0, 15).map((r) => r.name + ': e1RM ' + f1(r.e1.v) + ' (' + r.e1.date + '), máx ' + f1(r.mw.w) + 'x' + r.mw.r);
  if (pr.length) L.push('RÉCORDS: ' + pr.join(' | '));
  return L.join('\n');
}
function coachPrompt(q) { return COACH_RULES + '\n\nDATOS ACTUALES DE ENTRENAMIENTO:\n' + digest() + '\n\nMI PREGUNTA:\n' + q; }
function planPrompt() {
  const exs = draft.exercises.map((en) => {
    const hist = [];
    for (const s of S.sessions) { const e = (s.exercises || []).find((x) => x.exerciseId === en.exerciseId); if (e) { hist.push(s.date + ': ' + e.sets.map((x) => (x.type === 'W' ? 'C ' : '') + f1(x.w) + 'x' + x.r + (x.rir != null ? '@' + x.rir : '')).join(', ')); if (hist.length >= 4) break; } }
    return { exerciseId: en.exerciseId, nombre: en.name, rango: en.repMin ? en.repMin + '-' + en.repMax : 'sin rango', series: en.sets.filter(isWork).length || 3, historial: hist };
  });
  return COACH_RULES + '\n\nPlanea la sesión de HOY (' + draft.date + '). Energía hoy: ' + (draft.energy || 'no indicada') + '/5. Sueño: ' + (draft.sleepH || 'no indicado') + ' h.\nEjercicios:\n' + JSON.stringify(exs, null, 1) +
    '\n\nUsa progresión doble dentro del rango: si en la última sesión todas las series llegaron al tope con RIR>=1, sube 2.5 kg (1-2 kg en aislamientos o mancuernas); si no, mismo peso y busca +1 rep. Si la energía es 1-2 o el sueño menor a 6 h, mantén el peso y apunta a RIR 2-3. Sin historial, deja w en null.\n' +
    'Responde SOLO con JSON, sin texto adicional: [{"exerciseId":"...","sets":[{"w":80,"r":8,"rir":2}],"note":"frase corta de por qué"}] con tantas series como indica "series".';
}
function applyPlan(text) {
  const a = text.indexOf('['), b = text.lastIndexOf(']'); if (a < 0 || b < a) return 0;
  let out; try { out = JSON.parse(text.slice(a, b + 1)); } catch (e) { return 0; }
  let n = 0;
  (Array.isArray(out) ? out : []).forEach((p) => {
    const en = draft.exercises.find((e) => e.exerciseId === p.exerciseId); if (!en || !Array.isArray(p.sets) || !p.sets.length) return;
    n++; en.coachNote = String(p.note || '').slice(0, 240); let k = 0;
    en.sets.forEach((x) => {
      if (x.done || !isWork(x)) return; const q = p.sets[Math.min(k, p.sets.length - 1)]; k++; if (!q) return;
      x.sw = typeof q.w === 'number' ? q.w : null; x.sr = typeof q.r === 'number' ? q.r : null; x.srir = typeof q.rir === 'number' ? q.rir : null;
    });
  });
  if (n) { draft.planned = true; saveDraft(true); }
  return n;
}

/* ---------- exportación ---------- */
const csvCell = (v) => { if (v == null) return ''; const s = String(v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const toCsv = (head, rows) => '﻿' + [head].concat(rows).map((r) => r.map(csvCell).join(',')).join('\n');
function buildExport(k) {
  if (k === 'sets') {
    const rows = [];
    S.sessions.slice().reverse().forEach((s) => (s.exercises || []).forEach((e, ei) => e.sets.forEach((x, si) => {
      const ex = exById(e.exerciseId) || {}, w = isWork(x);
      rows.push([s.id, s.date, s.templateName, s.kind || 'rutina', ei + 1, e.exerciseId, e.name, e.muscle, (e.secondary || ex.secondary || []).join('|'), e.equipment || ex.equipment || '', si + 1, SET_T[x.type || 'N'].name, w ? 1 : 0, x.w, x.r, x.rir, w ? r1(e1rm(x.w, x.r)) : null, w ? r1(x.w * x.r) : 0]);
    })));
    return ['series.csv', toCsv(['sesion_id', 'fecha', 'rutina', 'tipo_sesion', 'orden_ejercicio', 'ejercicio_id', 'ejercicio', 'grupo_muscular', 'musculos_secundarios', 'equipo', 'serie', 'tipo_serie', 'es_efectiva', 'peso_kg', 'reps', 'rir', 'e1rm_kg', 'volumen_kg'], rows), 'text/csv'];
  }
  if (k === 'sessions') return ['sesiones.csv', toCsv(['sesion_id', 'fecha', 'rutina', 'tipo_sesion', 'grupos', 'inicio', 'fin', 'duracion_min', 'energia_1a5', 'sueno_h', 'ejercicios', 'series_efectivas', 'volumen_kg', 'notas', 'creada', 'actualizada', 'revision', 'eliminada'],
    S.sessions.concat(S.deleted).sort((a, b) => (a.date || '').localeCompare(b.date || '')).map((s) => [s.id, s.date, s.templateName, s.kind || 'rutina', (s.muscles || []).join('|'), s.startedAt, s.endedAt, s.durationMin, s.energy, s.sleepH, (s.exercises || []).length, (s.exercises || []).reduce((a, e) => a + e.sets.filter(isWork).length, 0), r1((s.exercises || []).reduce((a, e) => a + e.sets.filter(isWork).reduce((b, x) => b + x.w * x.r, 0), 0)), s.notes, s.createdAt, s.updatedAt, s.revision, s.deletedAt || ''])), 'text/csv'];
  if (k === 'meas') return ['medidas.csv', toCsv(['fecha'].concat(MEAS.map((m) => m[0] + '_cm'), ['peso_prom7_kg', 'notas']), S.measurements.slice().reverse().map((m) => [m.date].concat(MEAS.map((x) => m[x[0]]), [m.weightAvg7 != null ? r1(m.weightAvg7) : null, m.notes]))), 'text/csv'];
  if (k === 'bw') return ['peso.csv', toCsv(['fecha', 'peso_kg'], S.bodyweight.slice().reverse().map((p) => [p.date, p.weight])), 'text/csv'];
  if (k === 'food') return ['comidas.csv', toCsv(['fecha', 'comida', 'descripcion', 'kcal', 'proteina_g', 'carbohidratos_g', 'grasa_g'], S.food.slice().reverse().map((e) => [e.date, e.meal, e.desc, e.kcal, e.p, e.c, e.f])), 'text/csv'];
  if (k === 'ex') return ['ejercicios.csv', toCsv(['ejercicio_id', 'nombre', 'grupo_muscular', 'musculos_secundarios', 'equipo', 'nota'], S.exercises.map((e) => [e.id, e.name, e.muscle, (e.secondary || []).join('|'), e.equipment || '', e.note])), 'text/csv'];
  return ['bitacora-respaldo.json', JSON.stringify({ exportado: new Date().toISOString(), version: 2, exercises: S.exercises, templates: S.templates, sessions: S.sessions, deletedSessions: S.deleted, measurements: S.measurements, bodyweight: S.bodyweight, food: S.food, settings: S.settings }, null, 2), 'application/json'];
}

/* ---------- gráfica de líneas ---------- */
function lineChart(pts, opt) {
  opt = opt || {};
  const all = pts.concat(opt.pts2 || []);
  if (all.length < 1) return '<p class="muted small" style="margin:0">Sin datos suficientes para graficar todavía.</p>';
  const W = 340, H = 168, L = 38, R = 46, T = 12, B = 24;
  const xs = all.map((p) => parseDay(p.x).getTime()), ys = all.map((p) => p.y);
  let x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs); if (x0 === x1) { x0 -= 864e5 * 3; x1 += 864e5 * 3; }
  let y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys); const padY = (y1 - y0) * 0.15 || Math.max(1, y1 * 0.03); y0 -= padY; y1 += padY;
  const X = (t) => L + (t - x0) / (x1 - x0) * (W - L - R), Y = (v) => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
  let g = '';
  for (let i = 0; i <= 3; i++) { const v = y0 + (y1 - y0) * i / 3; g += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="axis" x="' + (L - 6) + '" y="' + (Y(v) + 3) + '" text-anchor="end">' + f1(v) + '</text>'; }
  const mo = { month: 'short', day: 'numeric' };
  g += '<text class="axis" x="' + L + '" y="' + (H - 6) + '">' + new Date(x0).toLocaleDateString('es-MX', mo) + '</text><text class="axis" x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">' + new Date(x1).toLocaleDateString('es-MX', mo) + '</text>';
  let s = '';
  (opt.pts2 || []).forEach((p) => { s += '<circle class="dot2" cx="' + X(parseDay(p.x).getTime()) + '" cy="' + Y(p.y) + '" r="2.6"/>'; });
  if (pts.length) {
    const P = pts.slice().sort((a, b) => a.x.localeCompare(b.x)).map((p) => [X(parseDay(p.x).getTime()), Y(p.y), p.y]);
    const path = P.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    if (P.length > 1) s += '<path class="area" d="' + path + ' L' + P[P.length - 1][0] + ' ' + (H - B) + ' L' + P[0][0] + ' ' + (H - B) + ' Z"/><path class="ln" d="' + path + '"/>';
    P.slice(0, -1).forEach((p) => { s += '<circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="2.8"/>'; });
    const e = P[P.length - 1]; s += '<circle class="end" cx="' + e[0] + '" cy="' + e[1] + '" r="4.5"/><text class="endl" x="' + (e[0] + 8) + '" y="' + (e[1] + 4) + '">' + f1(e[2]) + '</text>';
  }
  return '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.label || 'Gráfica') + '">' + g + s + '</svg></div>';
}

/* ---------- piezas de interfaz ---------- */
const dat = (o) => Object.keys(o).map((k) => ' data-' + k + '="' + esc(o[k]) + '"').join('');
function sec(head, body, foot, act) {
  return '<section class="sec">' + (head ? '<div class="h"><span>' + head + '</span>' + (act || '') + '</div>' : '') + '<div class="group">' + body + '</div>' + (foot ? '<div class="f">' + foot + '</div>' : '') + '</section>';
}
function li(title, o) {
  o = o || {};
  const inner = '<span class="t">' + title + (o.sub ? '<small>' + o.sub + '</small>' : '') + '</span>' + (o.v != null ? '<span class="v">' + o.v + '</span>' : '');
  const cls = 'li' + (o.chev ? ' chev' : '') + (o.red ? ' red' : '') + (o.blue ? ' blue' : '');
  if (o.d) return '<button class="' + cls + '"' + dat(o.d) + '>' + inner + '</button>';
  return '<div class="' + cls + '">' + inner + '</div>';
}
function seg(items, cur, act) {
  return '<div class="seg">' + items.map((i) => '<button class="' + (i[0] === cur ? 'on' : '') + '" data-act="' + act + '" data-v="' + i[0] + '">' + i[1] + '</button>').join('') + '</div>';
}
function tiles(arr) { return '<div class="tiles">' + arr.map((t) => '<div class="tile"><span class="n ' + (t[2] || '') + '">' + t[1] + '</span><span class="l">' + t[0] + '</span></div>').join('') + '</div>'; }
const emptyBox = (h, p, btn) => '<div class="empty"><h2>' + h + '</h2><p>' + p + '</p>' + (btn || '') + '</div>';
const backBtn = (label) => '<button class="nb" data-act="moreBack">' + IC.back + ' ' + label + '</button>';

function syncBanner() {
  if (!D.online) return '<div class="banner"><span>Sin conexión. Tus registros se guardan en el teléfono y se envían solos al reconectar.</span></div>';
  if (D.pending()) return '<div class="banner blue"><span>' + (D.syncing ? 'Enviando cambios…' : 'Hay cambios por enviar.') + '</span><button data-act="syncNow">Reintentar</button></div>';
  if (D.lastError) return '<div class="banner red"><span>' + esc(D.lastError) + '</span><button data-act="syncNow">Reintentar</button></div>';
  if (D.schemaOutdated) return '<div class="banner blue"><span>Un paso pendiente: actualizar tu base de datos para guardar rangos, favoritos y fichas de ejercicios.</span><button data-act="schemaSql">Ver cómo</button></div>';
  return '';
}
function schemaSheet() {
  let copied = false;
  openSheet({
    title: 'Actualizar base de datos', left: 'Cerrar',
    body: () => '<div class="sec"><div class="h"><span>Solo una vez</span></div><div class="group pad"><div class="sub" style="margin:0 0 10px">1. Toca «Copiar SQL».<br>2. Abre tu proyecto en supabase.com → <b>SQL Editor</b> → <b>New query</b>.<br>3. Pega y presiona <b>Run</b> (debe decir Success).<br>4. Vuelve aquí y toca «Sincronizar ahora» en Más → Cuenta.</div><textarea class="prompt" readonly rows="10" id="sqlTx" style="min-height:190px">' + esc(D.MIGRATION_SQL) + '</textarea><div style="margin-top:12px"><button class="btn" data-act="sqlCopy">' + (copied ? 'Copiado ✓' : 'Copiar SQL') + '</button></div></div><div class="f">Mientras tanto la app funciona igual; lo único que no se guarda en tu base son los rangos propios, favoritos y notas de técnica de cada ejercicio.</div></div>',
    copy: async function () { const ok = await copyText(D.MIGRATION_SQL); if (ok) { copied = true; toast('SQL copiado'); const b = $('[data-act=sqlCopy]'); if (b) b.textContent = 'Copiado ✓'; } else { const tx = $('#sqlTx'); if (tx) { tx.select(); tx.setSelectionRange(0, 9999); } toast('Selecciona el texto y cópialo.'); } }
  });
}

/* ---------- Entrenar ---------- */
function vTrain() {
  const t = nextTemplate(), last = S.sessions[0], lt = lastTrained(); let h = '';
  if (!S.templates.length) {
    h += emptyBox('Arma tu primera rutina', 'Crea tus rutinas (por ejemplo Torso A, Pierna A) y la app te dirá cuál sigue en tu rotación.', '<button class="btn inline" data-act="newTpl">Crear rutina</button>');
  } else {
    const lastT = S.sessions.find((s) => s.templateId === t.id);
    h += '<section class="hero"><div class="k">Siguiente en tu rotación</div><h2>' + esc(t.name) + '</h2><ul>' +
      (t.items || []).map((it) => { const e = exById(it.exerciseId); return e ? '<li><span>' + esc(e.name) + '</span><span>' + (it.sets || 3) + '×' + (it.repMin && it.repMax ? it.repMin + '–' + it.repMax : '—') + '</span></li>' : ''; }).join('') +
      '</ul><button class="btn" data-act="start" data-id="' + esc(t.id) + '">Empezar ' + esc(t.name) + '</button><div class="sub" style="text-align:center;margin-top:10px">' + (lastT ? 'La hiciste ' + ago(lastT.date) : 'Aún no la has hecho') + '</div></section>';
    const others = S.templates.filter((x) => x.id !== t.id);
    h += sec('¿Hoy toca otra?', others.map((o) => { const l = S.sessions.find((s) => s.templateId === o.id); return li(esc(o.name), { sub: l ? 'Última vez ' + ago(l.date) : 'Aún no la has hecho', chev: 1, d: { act: 'start', id: o.id } }); }).join('') +
      li('Sesión en blanco', { chev: 1, blue: 1, d: { act: 'startFree' } }));
  }
  const groups = MUSCLES.filter((m) => m !== 'Otro');
  h += sec('Armar sesión por grupos',
    '<div class="mus">' + groups.map((m) => {
      const d = lt[m] ? daysBetween(lt[m], today()) : null, cls = d == null ? '' : d >= 5 ? 'ok' : d >= 2 ? 'mid' : 'low';
      return '<button class="mchip ' + (buildSel.includes(m) ? 'on' : '') + '" data-act="buildTog" data-v="' + m + '" aria-pressed="' + buildSel.includes(m) + '"><b>' + m + '</b><small class="' + cls + '">' + (d == null ? 'sin datos' : d === 0 ? 'hoy' : d === 1 ? '1 día' : d + ' días') + '</small></button>';
    }).join('') + '</div><div class="pad"><button class="btn" data-act="buildGo" ' + (buildSel.length ? '' : 'disabled') + '>' + (buildSel.length ? 'Armar: ' + esc(buildSel.join(' + ')) : 'Elige uno o más grupos') + '</button></div>',
    'Por ejemplo pecho y espalda, o pecho y pierna. Debajo de cada grupo ves cuántos días lleva sin entrenarse.');
  if (last) {
    const sets = (last.exercises || []).reduce((a, e) => a + e.sets.filter(isWork).length, 0);
    h += sec('Última sesión', li(esc(last.templateName), { sub: ago(last.date) + ' · ' + plural((last.exercises || []).length, 'ejercicio', 'ejercicios') + ' · ' + plural(sets, 'serie', 'series') + ' · ' + (last.durationMin || '—') + ' min', chev: 1, d: { act: 'openSess', id: last.id } }));
  }
  const bw = weekAvg(0);
  h += sec('Peso de hoy', '<div class="li"><span class="t">Peso (kg)<small>Promedio 7 días: ' + f1(bw) + ' kg</small></span><input id="bwq" inputmode="decimal" placeholder="' + (S.bodyweight[0] ? f1(S.bodyweight[0].weight) : 'kg') + '" aria-label="Peso en kg" style="max-width:90px"><button class="nb b" data-act="saveBwQuick">Guardar</button></div>');
  return { title: 'Entrenar', html: h };
}

/* ---------- Sesión en curso ---------- */
function vSession() {
  const d = draft;
  let h = '';
  if (!d.editing && Date.now() - new Date(d.startedAt) > 8 * 36e5) {
    h += '<div class="banner"><span>Esta sesión lleva abierta ' + Math.floor((Date.now() - new Date(d.startedAt)) / 36e5) + ' h. ¿La iniciaste por error?</span><button data-act="discardAsk" style="color:var(--red)">Descartar</button></div>';
  }
  h += sec('Hoy',
    '<label class="li"><span class="t">Fecha</span><input type="date" id="sdate" data-bind="sess:date" value="' + esc(d.date) + '" style="flex:none;width:auto"></label>' +
    '<div class="li"><span class="t">Energía</span><div class="seg mini">' + [1, 2, 3, 4, 5].map((n) => '<button class="' + (d.energy === n ? 'on' : '') + '" data-act="energy" data-v="' + n + '" aria-label="Energía ' + n + ' de 5">' + n + '</button>').join('') + '</div></div>' +
    '<label class="li"><span class="t">Sueño (horas)</span><input id="ssleep" inputmode="decimal" data-bind="sess:sleepH" value="' + esc(d.sleepH) + '" placeholder="h"></label>' +
    (!d.editing && d.exercises.length ? '<button class="li chev" data-act="planSheet"><span class="t">Plan del entrenador<small>Pide a Claude el peso y las reps de hoy</small></span><span class="v">' + (d.planned ? 'Aplicado' : '') + '</span></button>' : ''));
  d.exercises.forEach((en, ei) => {
    const prevBest = bestPrevE1(en.exerciseId, d.editing ? d.id : null), ex = exById(en.exerciseId) || {};
    if (en.collapsed && exDone(en)) {
      const ws = en.sets.filter(isWork); let b = null, bv = -1, pr = false;
      ws.forEach((x) => { const v = e1rm(num(x.w), num(x.r)) || num(x.r) || 0; if (v > bv) { bv = v; b = x; } if (prevBest > 0 && e1rm(num(x.w), num(x.r)) > prevBest + 0.05) pr = true; });
      h += '<section class="xcard fold" data-di="sess" data-xi="' + ei + '"><div class="xh"><button class="grip" aria-label="Arrastra para reordenar">' + IC.grip + '</button><button class="fold-b" data-act="unfold" data-ei="' + ei + '" aria-label="Mostrar ' + esc(en.name) + '"><span class="fk">' + IC.check + '</span><span class="fn">' + esc(en.name) + '</span><span class="fs">' + plural(ws.length, 'serie', 'series') + (b ? ' · ' + (num(b.w) > 0 ? f1(num(b.w)) + '×' + b.r : b.r + ' reps') : '') + (pr ? ' · <b class="prt">PR</b>' : '') + '</span></button></div></section>';
      return;
    }
    h += '<section class="xcard" data-di="sess" data-xi="' + ei + '"><div class="xh"><button class="grip" aria-label="Arrastra para reordenar">' + IC.grip + '</button><h3><button class="lnk" data-act="exDetail" data-id="' + esc(en.exerciseId) + '">' + esc(en.name) + '</button><div class="sub" style="font-weight:400">' + esc(en.muscle || '') + '</div></h3><button class="more" data-act="exMenu" data-ei="' + ei + '" aria-label="Opciones del ejercicio">' + IC.dots + '</button></div>' +
      '<div class="hint">' + hintFor(en) + '</div>' + (ex.note ? '<div class="xnote"><b>Nota:</b> ' + esc(ex.note) + '</div>' : '') + (en.coachNote ? '<div class="cnote"><b>Entrenador:</b> ' + esc(en.coachNote) + '</div>' : '') +
      '<div class="sh"><span>Serie</span><span>Anterior</span><span>kg</span><span>Reps</span><span>RIR</span><span></span></div>';
    let wn = 0;
    en.sets.forEach((x, si) => {
      const t = x.type || 'N'; if (t !== 'W') wn++;
      const sw = x.sw != null ? x.sw : x.pw, sr = x.sr != null ? x.sr : x.pr, srir = x.srir != null ? x.srir : x.prir;
      const prev = x.pw != null ? f1(x.pw) + '×' + x.pr + (x.prir != null ? ' @' + x.prir : '') : '—';
      const isPR = x.done && t !== 'W' && prevBest > 0 && e1rm(num(x.w), num(x.r)) > prevBest + 0.05;
      h += '<div class="sr ' + (x.done ? 'done' : '') + '"><button class="sn ' + t + '" data-act="setMenu" data-ei="' + ei + '" data-si="' + si + '" aria-label="Serie ' + (si + 1) + ': ' + SET_T[t].name + '. Toca para cambiar">' + (t === 'N' ? wn : SET_T[t].l) + '</button>' +
        '<span class="pv">' + (isPR ? '<span class="tag g">PR</span>' : prev) + '</span>' +
        '<input id="w-' + ei + '-' + si + '" inputmode="decimal" data-ei="' + ei + '" data-si="' + si + '" data-f="w" value="' + esc(x.w) + '" placeholder="' + (x.done ? '' : sw != null ? f1(sw) : 'kg') + '" class="' + (x.sw != null && !x.done ? 'sug' : '') + '" aria-label="Peso serie ' + (si + 1) + '">' +
        '<input id="r-' + ei + '-' + si + '" inputmode="numeric" data-ei="' + ei + '" data-si="' + si + '" data-f="r" value="' + esc(x.r) + '" placeholder="' + (x.done ? '' : sr != null ? sr : 'reps') + '" class="' + (x.sr != null && !x.done ? 'sug' : '') + '" aria-label="Repeticiones serie ' + (si + 1) + '">' +
        '<input id="i-' + ei + '-' + si + '" inputmode="numeric" data-ei="' + ei + '" data-si="' + si + '" data-f="rir" value="' + esc(x.rir) + '" placeholder="' + (x.done ? '–' : srir != null ? srir : '–') + '" class="' + (x.srir != null && !x.done ? 'sug' : '') + '" aria-label="RIR serie ' + (si + 1) + '">' +
        '<button class="ck" data-act="chk" data-ei="' + ei + '" data-si="' + si + '" aria-label="Marcar serie ' + (si + 1) + ' como hecha" aria-pressed="' + x.done + '">' + IC.check + '</button></div>';
    });
    h += '<button class="addset" data-act="addSet" data-ei="' + ei + '">' + IC.plus.replace('<svg', '<svg width="16" height="16"') + ' Agregar serie</button><div class="xfoot"><span>Descanso objetivo</span><button data-act="restPick" data-ei="' + ei + '">' + fmtRest(en.restSec || 120) + ' ›</button></div></section>';
  });
  h += '<div style="margin:0 16px 24px"><button class="btn tint" data-act="addEx">' + IC.plus.replace('<svg', '<svg width="18" height="18"') + ' Agregar ejercicio</button></div>';
  h += sec('Notas de la sesión', '<div class="pad"><textarea class="field" id="snotes" data-bind="sess:notes" placeholder="Molestias, técnica, ajustes de máquina…">' + esc(d.notes) + '</textarea></div>', 'Toca el número de la serie para marcarla como calentamiento (C), drop set (D) o al fallo (F). El calentamiento no cuenta para volumen ni récords.');
  h += '<div style="margin:0 16px"><button class="btn" data-act="finish">' + (d.editing ? 'Guardar cambios' : 'Terminar y guardar sesión') + '</button></div>';
  return {
    title: d.editing ? 'Editando sesión' : d.templateName, small: d.templateName, html: h,
    left: '<button class="nb red" data-act="sessCancel">' + (d.editing ? 'Cancelar' : 'Cancelar') + '</button>',
    right: '<button class="nb b" data-act="finish">' + (d.editing ? 'Guardar' : 'Terminar') + '</button>'
  };
}
const fmtRest = (s) => s >= 60 ? Math.floor(s / 60) + ':' + pad(s % 60) : s + ' s';

/* ---------- Estadísticas ---------- */
let statP = 30, statTop = 'freq';
const MAIN_MUS = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Cuádriceps', 'Femorales', 'Glúteos', 'Pantorrillas', 'Abdomen'];
const PATTERN = { Pecho: 'Empuje', Hombros: 'Empuje', 'Tríceps': 'Empuje', Espalda: 'Jalón', 'Bíceps': 'Jalón', Antebrazo: 'Jalón', 'Cuádriceps': 'Pierna', Femorales: 'Pierna', 'Glúteos': 'Pierna', Pantorrillas: 'Pierna' };
const fmtVol = (v) => v >= 1000 ? f1(v / 1000) + ' t' : Math.round(v) + ' kg';
const fmtMin = (m) => m >= 60 ? f1(m / 60) + ' h' : Math.round(m) + ' min';
function statData() {
  const t = today(), from = statP ? isoDay(new Date(Date.now() - (statP - 1) * 864e5)) : '0000-00-00';
  const ss = S.sessions.filter((s) => s.date >= from && s.date <= t);
  const R = { ss: ss, sets: 0, vol: 0, mins: 0, dir: {}, eff: {}, ex: {} };
  ss.forEach((s) => {
    R.mins += s.durationMin || 0;
    (s.exercises || []).forEach((e) => {
      const ws = e.sets.filter(isWork); if (!ws.length) return;
      const k = e.muscle || 'Otro'; R.dir[k] = (R.dir[k] || 0) + ws.length; R.eff[k] = (R.eff[k] || 0) + ws.length;
      (e.secondary || []).forEach((sc) => { if (sc !== k) R.eff[sc] = (R.eff[sc] || 0) + ws.length * 0.5; });
      let v = 0; ws.forEach((x) => { v += (num(x.w) || 0) * (num(x.r) || 0); });
      R.sets += ws.length; R.vol += v;
      const r = R.ex[e.exerciseId] || (R.ex[e.exerciseId] = { id: e.exerciseId, name: (exById(e.exerciseId) || e).name || e.name, muscle: k, sess: 0, sets: 0, vol: 0 });
      r.sess++; r.sets += ws.length; r.vol += v;
    });
  });
  const first = S.sessions.reduce((m, x) => (!m || x.date < m ? x.date : m), null);
  R.days = statP || Math.max(7, first ? daysBetween(first, t) + 1 : 7); R.weeks = R.days / 7;
  return R;
}
function vStats() {
  const D2 = statData(), n = D2.ss.length;
  let h = seg([['7', '7 días'], ['30', '30 días'], ['90', '90 días'], ['0', 'Todo']], String(statP), 'statP');
  if (!S.sessions.length) return h + emptyBox('Sin estadísticas todavía', 'Registra tu primera sesión y aquí verás tus series por músculo, tu distribución y tus ejercicios principales.') + '<section class="sec"><div class="h"><span>Días entrenados</span></div></section>' + vCalendar();
  h += tiles([['Sesiones', n], ['Series', D2.sets], ['Volumen', fmtVol(D2.vol)]]);
  h += tiles([['Por semana', f1(n / D2.weeks)], ['Min por sesión', n && D2.mins ? Math.round(D2.mins / n) : '—'], ['Tiempo total', D2.mins ? fmtMin(D2.mins) : '—']]);
  // días entrenados (calendario del mes)
  h += '<section class="sec"><div class="h"><span>Días entrenados</span></div></section>' + vCalendar();
  // series por grupo
  const per = (v) => v / (statP === 7 ? 1 : D2.weeks), list = MAIN_MUS.map((m) => [m, per(D2.eff[m] || 0)]).concat(D2.eff.Antebrazo ? [['Antebrazo', per(D2.eff.Antebrazo)]] : []).sort((a, b) => b[1] - a[1]);
  const mx = Math.max(TARGET.max * 1.25, Math.max.apply(null, list.map((x) => x[1])));
  h += sec('Series por grupo muscular' + (statP === 7 ? ' · semana' : ' · promedio por semana'), '<div class="bars">' + list.map((k) => { const v = k[1], st = v < TARGET.min ? 'lo' : v > TARGET.max ? 'hi' : ''; return '<div class="bar"><span>' + esc(k[0]) + '</span><span class="trk"><b style="left:' + TARGET.min / mx * 100 + '%;width:' + (TARGET.max - TARGET.min) / mx * 100 + '%"></b><i class="' + st + '" style="width:' + Math.min(100, v / mx * 100) + '%"></i></span><span class="num" style="text-align:right">' + f1(v) + '</span></div>'; }).join('') + '</div>',
    'Entre las líneas punteadas está tu meta de ' + TARGET.min + ' a ' + TARGET.max + ' series por semana (naranja: por debajo, azul: por encima). El músculo secundario cuenta media serie y el calentamiento no cuenta.');
  // distribución
  const dt = Object.entries(D2.dir).sort((a, b) => b[1] - a[1]), tot = dt.reduce((a, x) => a + x[1], 0);
  if (tot) {
    h += sec('Distribución del trabajo', '<div class="bars">' + dt.map((k) => { const pc = k[1] / tot * 100; return '<div class="bar"><span>' + esc(k[0]) + '</span><span class="trk"><i style="width:' + pc / (dt[0][1] / tot * 100) * 100 + '%;background:var(--blue)"></i></span><span class="num" style="text-align:right">' + Math.round(pc) + '%</span></div>'; }).join('') + '</div>', 'Porcentaje de tus series directas (' + tot + ') que fue a cada músculo.');
    // equilibrio empuje / jalón / pierna
    const g = { Empuje: 0, 'Jalón': 0, Pierna: 0 }, core = D2.dir.Abdomen || 0; Object.keys(D2.dir).forEach((k) => { if (PATTERN[k]) g[PATTERN[k]] += D2.dir[k]; });
    const gt = g.Empuje + g['Jalón'] + g.Pierna;
    if (gt) {
      const col = { Empuje: 'var(--blue)', 'Jalón': 'var(--green)', Pierna: 'var(--orange)' }, up = g.Empuje + g['Jalón'];
      h += sec('Equilibrio', '<div class="pad"><div class="stk">' + Object.keys(g).map((k) => g[k] ? '<i style="flex:' + g[k] + ';background:' + col[k] + '"></i>' : '').join('') + '</div><div class="stkl">' + Object.keys(g).map((k) => '<span><i style="background:' + col[k] + '"></i>' + k + ' <b>' + Math.round(g[k] / gt * 100) + '%</b> · ' + g[k] + '</span>').join('') + '</div></div>',
        'Tren superior ' + Math.round(up / gt * 100) + '% · pierna ' + Math.round(g.Pierna / gt * 100) + '%' + (g.Empuje && g['Jalón'] ? '. Empuje : jalón = 1 : ' + f1(g['Jalón'] / g.Empuje) + ' (lo habitual es cerca de 1 : 1 o algo más de jalón)' : '') + (core ? '. Abdomen: ' + core + ' series, aparte.' : '.'));
    }
  }
  // ejercicios principales
  const exs = Object.values(D2.ex).sort((a, b) => statTop === 'vol' ? b.vol - a.vol : (b.sess - a.sess) || (b.sets - a.sets)).slice(0, 8);
  if (exs.length) {
    h += '<div class="seg" style="margin-top:4px"><button class="' + (statTop === 'freq' ? 'on' : '') + '" data-act="statTop" data-v="freq">Más frecuentes</button><button class="' + (statTop === 'vol' ? 'on' : '') + '" data-act="statTop" data-v="vol">Más volumen</button></div>';
    h += sec('Ejercicios principales', exs.map((e, i) => li((i + 1) + '. ' + esc(e.name), { sub: esc(e.muscle) + ' · ' + plural(e.sess, 'sesión', 'sesiones') + ' · ' + plural(e.sets, 'serie', 'series'), v: statTop === 'vol' ? fmtVol(e.vol) : e.sess + '×', chev: 1, d: { act: 'exDetail', id: e.id } })).join(''), 'Toca uno para ver su ficha: mejor peso, mejor volumen, récords e historial.');
  }
  // sesiones por semana
  const wk = [], t0 = parseDay(today()), mon = new Date(t0); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
  for (let i = 7; i >= 0; i--) { const a = new Date(mon); a.setDate(a.getDate() - 7 * i); const b = new Date(a); b.setDate(b.getDate() + 6); const a2 = isoDay(a), b2 = isoDay(b); wk.push([a, S.sessions.filter((x) => x.date >= a2 && x.date <= b2).length]); }
  const wm = Math.max(4, Math.max.apply(null, wk.map((x) => x[1])));
  h += sec('Sesiones por semana', '<div class="bars">' + wk.map((w) => '<div class="bar"><span>' + w[0].toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + '</span><span class="trk"><i style="width:' + w[1] / wm * 100 + '%;background:var(--blue)"></i></span><span class="num" style="text-align:right">' + w[1] + '</span></div>').join('') + '</div>', 'Últimas 8 semanas (cada una empieza en lunes).');
  return h;
}

/* ---------- Progreso ---------- */
function vHistory() {
  let h = '';
  if (histTab === 'calendar') histTab = 'stats';
  h += seg([['sessions', 'Sesiones'], ['stats', 'Estadísticas'], ['exercise', 'Ejercicio'], ['records', 'Récords']], histTab, 'histTab');
  if (histTab === 'records') h += vRecords();
  else if (histTab === 'stats') h += vStats();
  else if (histTab === 'exercise') h += vExerciseHistory();
  else {
    if (!S.sessions.length) h += emptyBox('Sin sesiones todavía', 'Cuando termines tu primera sesión aparecerá aquí con cada serie registrada.', '<button class="btn inline" data-act="tab" data-v="train">Ir a entrenar</button>');
    else h += sec('', S.sessions.map((s) => {
      const sets = (s.exercises || []).reduce((a, e) => a + e.sets.filter(isWork).length, 0), vol = (s.exercises || []).reduce((a, e) => a + e.sets.filter(isWork).reduce((b, x) => b + x.w * x.r, 0), 0);
      return li(esc(s.templateName), { sub: fmtDate(s.date) + ' · ' + plural(sets, 'serie', 'series') + ' · ' + Math.round(vol).toLocaleString('es-MX') + ' kg · ' + (s.durationMin || '—') + ' min', chev: 1, d: { act: 'openSess', id: s.id } });
    }).join(''));
    if (S.deleted.length) h += sec('', li('Papelera', { v: S.deleted.length, chev: 1, d: { act: 'openTrash' } }));
  }
  return { title: 'Progreso', html: h };
}
function vExerciseHistory() {
  const used = S.exercises.filter((e) => S.sessions.some((s) => (s.exercises || []).some((x) => x.exerciseId === e.id)));
  if (!used.length) return emptyBox('Sin datos de ejercicios', 'Registra sesiones para ver la progresión de cada ejercicio.');
  if (!histEx || !used.some((e) => e.id === histEx)) histEx = used[0].id;
  const rows = [];
  S.sessions.forEach((s) => (s.exercises || []).filter((e) => e.exerciseId === histEx).forEach((e0) => {
    const ws = e0.sets.filter(isWork); if (!ws.length) return;
    const best = ws.reduce((b, x) => e1rm(x.w, x.r) > e1rm(b.w, b.r) ? x : b, ws[0]);
    rows.push({ date: s.date, sets: ws, e1: e1rm(best.w, best.r), vol: ws.reduce((a, x) => a + x.w * x.r, 0) });
  }));
  const pr = Math.max.apply(null, rows.map((r) => r.e1)), maxW = Math.max.apply(null, rows.flatMap((r) => r.sets.map((x) => x.w)));
  return sec('', '<label class="li"><span class="t">Ejercicio</span><select id="histEx" data-sel="histEx" style="direction:rtl">' + used.map((e) => '<option value="' + esc(e.id) + '" ' + (e.id === histEx ? 'selected' : '') + '>' + esc(e.name) + '</option>').join('') + '</select></label>') +
    tiles([['Mejor e1RM', f1(pr)], ['Peso máx', f1(maxW)], ['Sesiones', rows.length]]) +
    sec('1RM estimado (kg)', '<div class="pad">' + lineChart(rows.map((r) => ({ x: r.date, y: r1(r.e1) })), { label: '1RM estimado por sesión' }) + '</div>', 'Fórmula de Epley con la mejor serie efectiva de cada sesión.') +
    '<section class="sec"><div class="group tbl"><table><thead><tr><th>Fecha</th><th>Series (kg×reps @RIR)</th><th>e1RM</th><th>Vol.</th></tr></thead><tbody>' +
    rows.map((r) => '<tr><td>' + fmtDate(r.date) + '</td><td>' + r.sets.map((x) => f1(x.w) + '×' + x.r + (x.rir != null ? '@' + x.rir : '')).join('  ') + '</td><td>' + f1(r.e1) + (r.e1 === pr ? ' <span class="tag g">PR</span>' : '') + '</td><td>' + Math.round(r.vol) + '</td></tr>').join('') + '</tbody></table></div></section>';
}
function vRecords() {
  const rs = records();
  if (!rs.length && !S.measurements.length && !S.bodyweight.length) return emptyBox('Aún no hay récords', 'Tus mejores marcas aparecerán aquí en cuanto registres sesiones y medidas.');
  let h = '';
  const ids = rs.map((r) => r.id);
  if (ids.length) {
    const sts = ids.map((id) => Object.assign({ id: id, name: exName(id) }, exStats(id))).filter((x) => x.sessions);
    const feed = []; sts.forEach((x) => x.prs.forEach((p) => { if (p.delta != null) feed.push(Object.assign({ id: x.id, name: x.name, bw: x.bodyweight }, p)); }));
    feed.sort((a, b) => b.date.localeCompare(a.date));
    if (feed.length) h += sec('Récords recientes', feed.slice(0, 6).map((p) => li(esc(p.name), { sub: shortD(p.date) + ' · ' + (p.bw ? p.r + ' reps' : f1(p.w) + ' kg × ' + p.r), v: f1(p.v) + (p.bw ? ' reps' : ' e1RM') + ' <span class="up">+' + f1(p.delta) + '</span>', chev: 1, d: { act: 'exDetail', id: p.id } })).join(''), 'Cada vez que superas tu mejor 1RM estimado de ese ejercicio.');
    sts.sort((a, b) => b.lastDate.localeCompare(a.lastDate));
    h += fg(sec('Por ejercicio', '<label class="li"><span class="t">Buscar</span><input id="recQ" data-lf=".rrow" placeholder="Nombre del ejercicio" autocomplete="off" style="text-align:left"></label>' + sts.map((x) => '<button class="li chev rrow" data-n="' + esc(norm(x.name)) + '" data-act="exDetail" data-id="' + esc(x.id) + '"><span class="t">' + esc(x.name) + '<small>' + (x.bodyweight ? 'Máx. ' + x.maxReps.r + ' reps' : 'Máx. ' + f1(x.maxW.w) + ' kg × ' + x.maxW.r) + ' · ' + ago(x.lastDate) + '</small></span><span class="v">' + (x.bodyweight ? x.maxReps.r + ' reps' : f1(x.best ? x.best.v : 0) + ' <small>e1RM</small>') + '</span></button>').join(''), 'Toca un ejercicio para ver su mejor peso por repeticiones, su progreso y sus récords.'));
  }
  if (S.measurements.length) {
    const rows = MEAS.map((k) => {
      const v = S.measurements.filter((m) => m[k[0]] != null); if (!v.length) return '';
      const lowGood = k[0] === 'waist', best = v.reduce((b, m) => (lowGood ? m[k[0]] < b[k[0]] : m[k[0]] > b[k[0]]) ? m : b, v[0]), first = v[v.length - 1], dlt = best[k[0]] - first[k[0]];
      return '<div class="rec"><div><b>' + k[1] + '</b><small>' + (lowGood ? 'Mínima' : 'Máxima') + ' · ' + shortD(best.date) + (v.length > 1 ? ' · desde el inicio ' + (dlt > 0 ? '+' : '') + f1(dlt) + ' cm' : '') + '</small></div><div class="v">' + f1(best[k[0]]) + '<small>cm</small></div></div>';
    }).join('');
    h += sec('Medidas', rows);
  }
  if (S.bodyweight.length) {
    const mx = S.bodyweight.reduce((b, p) => p.weight > b.weight ? p : b), mn = S.bodyweight.reduce((b, p) => p.weight < b.weight ? p : b);
    h += sec('Peso corporal', '<div class="rec"><div><b>Más alto</b><small>' + shortD(mx.date) + '</small></div><div class="v">' + f1(mx.weight) + '</div></div><div class="rec"><div><b>Más bajo</b><small>' + shortD(mn.date) + '</small></div><div class="v">' + f1(mn.weight) + '</div></div>');
  }
  return h;
}
function vCalendar() {
  const ym = calMonth.split('-').map(Number), y = ym[0], m = ym[1], first = new Date(y, m - 1, 1), off = (first.getDay() + 6) % 7, dim = new Date(y, m, 0).getDate();
  const byDay = {}; S.sessions.forEach((s) => (byDay[s.date] = byDay[s.date] || []).push(s));
  const md = new Set(S.measurements.map((x) => x.date)), fd = new Set(S.food.map((f) => f.date)), wd = new Set(S.bodyweight.map((x) => x.date));
  const monthS = S.sessions.filter((s) => s.date.startsWith(calMonth));
  let h = '<div class="calh"><button data-act="calNav" data-v="-1" aria-label="Mes anterior">‹</button><h2>' + first.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) + '</h2><button data-act="calNav" data-v="1" aria-label="Mes siguiente">›</button></div>';
  h += tiles([['Días entrenados', new Set(monthS.map((x) => x.date)).size], ['Días con comida', [...fd].filter((d) => d.startsWith(calMonth)).length], ['Por semana', f1(monthS.length / (dim / 7))]]);
  let cells = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => '<span class="dh">' + d + '</span>').join('') + '<span class="cd out"></span>'.repeat(off);
  for (let d = 1; d <= dim; d++) {
    const ds = calMonth + '-' + pad(d), ss = byDay[ds] || [], cls = ss.length ? (ss.some((s) => s.kind === 'rutina' || !s.kind) ? 'tr' : 'fr') : '';
    cells += '<button class="cd ' + cls + ' ' + (ds === today() ? 'tod' : '') + ' ' + (ds === calDay ? 'sel' : '') + '" data-act="calDay" data-v="' + ds + '" aria-label="' + ds + (ss.length ? ', ' + esc(ss.map((s) => s.templateName).join(', ')) : '') + '"><span>' + d + '</span><span class="mk">' + (md.has(ds) ? '<i class="m"></i>' : '') + (fd.has(ds) ? '<i class="f"></i>' : '') + (wd.has(ds) ? '<i class="w"></i>' : '') + '</span></button>';
  }
  h += '<section class="sec"><div class="group"><div class="cal">' + cells + '</div></div></section>';
  h += '<div class="legend" style="margin-bottom:20px"><span><i style="background:var(--blue)"></i>Rutina</span><span><i style="background:var(--label3)"></i>Por grupos o libre</span><span><i style="background:var(--orange)"></i>Medidas</span><span><i style="background:var(--green)"></i>Comida</span><span><i style="background:var(--label2)"></i>Peso</span></div>';
  if (calDay) {
    const ss = byDay[calDay] || [], bw = S.bodyweight.find((x) => x.date === calDay), ms = S.measurements.find((x) => x.date === calDay), fo = foodOn(calDay);
    let body = ss.map((s) => li(esc(s.templateName), { sub: plural((s.exercises || []).reduce((a, e) => a + e.sets.filter(isWork).length, 0), 'serie', 'series') + ' · ' + (s.durationMin || '—') + ' min', chev: 1, d: { act: 'openSess', id: s.id } })).join('') || li('Sin entrenamiento', { sub: '' });
    if (bw) body += li('Peso', { v: f1(bw.weight) + ' kg' });
    if (ms) body += li('Medición registrada');
    if (fo.length) { const t = dayTot(fo); body += li('Comida', { v: Math.round(t.kcal) + ' kcal · ' + Math.round(t.p) + ' g prot' }); }
    if (!ss.length && calDay <= today()) body += li('Registrar una sesión en este día', { blue: 1, d: { act: 'logPast' } });
    h += sec(fmtDate(calDay), body);
  }
  return h;
}

/* ---------- Cuerpo ---------- */
function vBody() {
  let h = seg([['weight', 'Peso'], ['meas', 'Medidas'], ['food', 'Comida']], bodyTab, 'bodyTab');
  if (bodyTab === 'food') h += vFood();
  else if (bodyTab === 'weight') {
    const a = weekAvg(0), b = weekAvg(1), dlt = a != null && b != null ? a - b : null;
    h += tiles([['Prom. 7 días', f1(a)], ['Semana previa', f1(b)], ['Cambio', dlt == null ? '—' : (dlt > 0 ? '+' : '') + f1(dlt), dlt > 0 ? 'up' : dlt < 0 ? 'dn' : '']]);
    h += sec('Registrar peso', '<label class="li"><span class="t">Fecha</span><input type="date" id="bwd" value="' + today() + '" style="flex:none;width:auto"></label><label class="li"><span class="t">Peso (kg)</span><input id="bwv" inputmode="decimal" placeholder="' + (S.bodyweight[0] ? f1(S.bodyweight[0].weight) : 'kg') + '"></label><div class="pad"><button class="btn" data-act="saveBw">Guardar peso</button></div>', 'Al despertar y en ayunas. Si registras dos veces el mismo día, se reemplaza.');
    const asc = S.bodyweight.slice().reverse();
    const avg = asc.map((p) => { const from = new Date(parseDay(p.date)); from.setDate(from.getDate() - 6); const f = isoDay(from), v = asc.filter((q) => q.date >= f && q.date <= p.date).map((q) => q.weight); return { x: p.date, y: r1(v.reduce((s, x) => s + x, 0) / v.length) }; });
    h += sec('Tendencia', '<div class="pad">' + lineChart(avg, { pts2: asc.map((p) => ({ x: p.date, y: p.weight })), label: 'Peso corporal' }) + '</div>', 'Línea: promedio de 7 días. Puntos: peso diario.');
    h += sec('Registros', S.bodyweight.slice(0, 30).map((p) => '<button class="li" data-act="delBw" data-id="' + p.date + '"><span class="t">' + fmtDate(p.date) + '</span><span class="v">' + f1(p.weight) + ' kg</span></button>').join('') || '<div class="li"><span class="t muted">Aún no registras tu peso.</span></div>', S.bodyweight.length ? 'Toca un registro para borrarlo.' : '');
  } else {
    const last = S.measurements[0], since = last ? daysBetween(last.date, today()) : null;
    const st = since == null ? ['b', 'Primera medición pendiente'] : since >= 28 ? ['o', 'Última hace ' + since + ' días: ya toca medir'] : since >= 14 ? ['b', 'Última hace ' + since + ' días: puedes medir esta semana'] : ['g', since === 0 ? 'Medido hoy' : 'Última hace ' + since + ' ' + (since === 1 ? 'día' : 'días')];
    h += '<div class="row between" style="margin:0 16px 16px"><span class="tag ' + st[0] + '">' + st[1] + '</span><button class="btn sm" data-act="newMeas">Nueva medición</button></div>';
    if (!S.measurements.length) h += emptyBox('Sin medidas todavía', 'Registra tus 8 perímetros cada 2 a 4 semanas, al despertar y en ayunas.');
    else {
      h += '<div class="chips">' + MEAS.map((k) => '<button class="chip ' + (bodyMetric === k[0] ? 'on' : '') + '" data-act="metric" data-v="' + k[0] + '">' + k[1] + '</button>').join('') + '</div>';
      h += sec((MEAS.find((x) => x[0] === bodyMetric) || [0, ''])[1] + ' (cm)', '<div class="pad">' + lineChart(S.measurements.filter((m) => m[bodyMetric] != null).map((m) => ({ x: m.date, y: m[bodyMetric] })), { label: 'Perímetro' }) + '</div>');
      const ms = S.measurements.slice(0, 12);
      h += '<section class="sec"><div class="h"><span>Historial</span></div><div class="group tbl"><table><thead><tr><th>Medida</th>' + ms.map((m) => '<th><button data-act="measMenu" data-id="' + m.date + '" style="color:var(--blue);font:inherit;text-transform:inherit">' + parseDay(m.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + '</button></th>').join('') + '</tr></thead><tbody>' +
        MEAS.map((k) => '<tr><td>' + k[1] + '</td>' + ms.map((m, i) => { const nx = ms[i + 1], d = nx && m[k[0]] != null && nx[k[0]] != null ? m[k[0]] - nx[k[0]] : null; return '<td>' + f1(m[k[0]]) + (d ? ' <small class="' + (d > 0 ? 'up' : 'dn') + '">' + (d > 0 ? '+' : '') + f1(d) + '</small>' : '') + '</td>'; }).join('') + '</tr>').join('') +
        '<tr><td>Peso prom. 7d</td>' + ms.map((m) => '<td>' + f1(m.weightAvg7) + '</td>').join('') + '</tr></tbody></table></div><div class="f">El cambio junto a cada valor se compara con la medición anterior. Toca una fecha para editar o borrar esa medición.</div></section>';
    }
  }
  return { title: 'Cuerpo', html: h };
}
function vFood() {
  if (!foodMeal) foodMeal = defaultMeal();
  const es = foodOn(foodDay), tot = dayTot(es), K = S.settings.kcal, P = S.settings.protein, fd = foodDays(7);
  let h = sec('', '<label class="li"><span class="t">Día</span><input type="date" id="fday" data-sel="fday" value="' + foodDay + '" style="flex:none;width:auto"></label>');
  h += '<div class="tiles" style="grid-template-columns:1fr 1fr"><div class="tile"><span class="l">Calorías</span><span class="big">' + Math.round(tot.kcal) + ' <small>' + (K ? '/ ' + K + ' kcal' : 'kcal') + '</small></span>' + (K ? '<div class="meter"><i class="' + (tot.kcal > K * 1.05 ? 'over' : '') + '" style="width:' + Math.min(100, tot.kcal / K * 100) + '%"></i></div>' : '') + '</div>' +
    '<div class="tile"><span class="l">Proteína</span><span class="big">' + Math.round(tot.p) + ' <small>' + (P ? '/ ' + P + ' g' : 'g') + '</small></span>' + (P ? '<div class="meter"><i style="width:' + Math.min(100, tot.p / P * 100) + '%"></i></div>' : '') + '</div></div>';
  if (tot.c || tot.f || fd.length) h += '<div class="legend" style="margin:-12px 0 20px">' + (tot.c || tot.f ? '<span>Carbohidratos ' + Math.round(tot.c) + ' g · Grasa ' + Math.round(tot.f) + ' g</span>' : '') + (fd.length ? '<span>Promedio 7 días: ' + Math.round(fd.reduce((a, x) => a + x.kcal, 0) / fd.length) + ' kcal · ' + Math.round(fd.reduce((a, x) => a + x.p, 0) / fd.length) + ' g prot</span>' : '') + '</div>';
  h += '<div style="margin:0 16px 16px"><button class="btn tint" data-act="importFood">Registrar con Claude</button></div>';
  if (!K && !P) h += '<div class="banner blue"><span>Define tus metas de calorías y proteína en Más → Ajustes.</span></div>';
  h += '<div class="seg">' + MEALS.map((m) => '<button class="' + (foodMeal === m ? 'on' : '') + '" data-act="meal" data-v="' + m + '">' + m + '</button>').join('') + '</div>';
  h += sec('Agregar a ' + foodMeal.toLowerCase(),
    '<label class="li"><span class="t">Qué comiste</span><input id="fdesc" placeholder="3 huevos y 2 tortillas" autocomplete="off"></label>' +
    '<label class="li"><span class="t">Calorías</span><input id="fk" inputmode="numeric" placeholder="kcal"></label><label class="li"><span class="t">Proteína (g)</span><input id="fp" inputmode="decimal" placeholder="g"></label>' +
    '<label class="li"><span class="t">Carbohidratos (g)</span><input id="fc" inputmode="decimal" placeholder="opcional"></label><label class="li"><span class="t">Grasa (g)</span><input id="ff" inputmode="decimal" placeholder="opcional"></label>' +
    '<div class="pad"><button class="btn" data-act="addFood">Agregar</button></div>', 'Si no conoces los números, pregúntale a Claude: “¿cuántas kcal y proteína tienen 3 huevos y 2 tortillas?”.');
  const rec = recentFoods();
  if (rec.length) h += sec('Repetir algo reciente', rec.map((e, i) => li(esc(e.desc), { sub: Math.round(e.kcal || 0) + ' kcal · ' + f1(e.p || 0) + ' g prot', v: '+', d: { act: 'foodAgain', i: i } })).join(''));
  MEALS.forEach((m) => {
    const xs = es.filter((e) => e.meal === m); if (!xs.length) return;
    h += sec(m + ' · ' + Math.round(xs.reduce((a, e) => a + (e.kcal || 0), 0)) + ' kcal', xs.map((e) => li(esc(e.desc || '—'), { sub: Math.round(e.kcal || 0) + ' kcal · ' + f1(e.p || 0) + ' g prot' + (e.c ? ' · ' + f1(e.c) + ' C' : '') + (e.f ? ' · ' + f1(e.f) + ' G' : ''), v: 'Borrar', d: { act: 'foodDel', id: e.id } })).join(''));
  });
  if (!es.length) h += '<p class="muted" style="text-align:center;margin:0">Sin comidas registradas este día.</p>';
  return h;
}

/* ---------- Entrenador (prompts para copiar) ---------- */
const PRESETS = [
  ['Revisar mi última semana', 'Revisa mi última semana de entrenamiento: volumen por grupo contra la meta, consistencia y qué ajustar.'],
  ['¿Dónde me estoy estancando?', 'Revisa mis ejercicios principales: ¿dónde estoy estancado o retrocediendo? Para cada uno dime qué hacer (subir peso, cambiar rango, descarga, cambiar ejercicio).'],
  ['¿Qué entreno hoy?', 'Según lo que he entrenado y cuántos días lleva cada grupo sin entrenarse, ¿qué me conviene entrenar hoy y con qué ejercicios y series?'],
  ['¿Necesito una descarga?', 'Con mis datos de rendimiento, energía y sueño, ¿necesito una semana de descarga? Explica por qué y cómo hacerla.'],
  ['Cuerpo y comida', 'Analiza mi peso, medidas y comida. ¿Voy bien para ganar músculo sin acumular mucha grasa? ¿Qué ajustarías?']
];
function vCoach() {
  let h = '<div class="sec"><div class="group pad"><b>Tu entrenador vive en Claude</b><div class="sub" style="margin-top:4px">La app prepara un prompt con tus sesiones de las últimas 12 semanas, volumen por grupo, peso, medidas, comida y récords. Lo copias, lo pegas en un chat de Claude o en tu agente y recibes la respuesta con tus números reales.</div></div></div>';
  h += sec('Preguntas rápidas', PRESETS.map((p, i) => li(p[0], { chev: 1, d: { act: 'preset', i: i } })).join(''));
  h += sec('Tu pregunta', '<div class="pad"><textarea class="field" id="coachQ" data-bind="coachQ" placeholder="Por ejemplo: ¿cuánto peso debería usar en press banca la próxima semana?">' + esc(coachQ) + '</textarea></div><div class="pad" style="padding-top:0"><button class="btn" data-act="coachFree">Preparar prompt</button></div>');
  h += sec('Cómo usarlo', '<div class="pad sub" style="margin:0">1. Toca una pregunta y luego “Copiar prompt”.<br>2. Abre Claude y pega el texto en un chat nuevo.<br>3. Para el plan del día: dentro de una sesión, usa “Plan del entrenador”; pega aquí la respuesta y los pesos se llenan solos.</div>');
  return { title: 'Entrenador', html: h };
}
function promptSheet(title, text, hint) {
  let copied = false;
  openSheet({
    title: title, left: 'Cerrar',
    body: () => '<div class="sec"><div class="f" style="padding-top:0;padding-bottom:10px">' + hint + '</div><textarea class="prompt" id="promptTx" readonly rows="12">' + esc(text) + '</textarea><div class="stack" style="margin-top:12px"><button class="btn" data-act="copyPrompt">' + (copied ? 'Copiado ✓' : 'Copiar prompt') + '</button><a class="btn gray" href="https://claude.ai/new" target="_blank" rel="noopener">Abrir Claude</a></div><div class="f">' + text.length.toLocaleString('es-MX') + ' caracteres. Se prepara en tu teléfono; no se envía a ningún lado hasta que tú lo pegues.</div></div>',
    copy: async function (o) { const ok = await copyText(text); if (ok) { copied = true; toast('Copiado. Pégalo en tu chat.'); drawSheet(o); } else { const tx = $('#promptTx'); if (tx) { tx.select(); tx.setSelectionRange(0, text.length); } toast('Selecciona el texto y cópialo manualmente.'); } }
  });
}
function planSheet() {
  const o = openSheet({
    title: 'Plan del entrenador', left: 'Cerrar', right: null,
    body: () => '<div class="sec"><div class="h"><span>Paso 1</span></div><div class="group pad"><div class="sub" style="margin:0 0 10px">Copia el prompt con tus ejercicios, tu historial, tu energía y tu sueño de hoy, y pégalo en Claude.</div><button class="btn" data-act="planCopy">Copiar prompt</button></div></div>' +
      '<div class="sec"><div class="h"><span>Paso 2</span></div><div class="group pad"><div class="sub" style="margin:0 0 10px">Pega aquí la respuesta de Claude (el JSON).</div><textarea class="field" id="planIn" placeholder="[{&quot;exerciseId&quot;: …}]" style="font-family:var(--mono);font-size:13px"></textarea><div style="margin-top:10px"><button class="btn gray" data-act="planApply">Aplicar propuesta</button></div></div><div class="f">Los números propuestos aparecen en azul en cada serie. Al marcar ✓ se registran.</div></div>'
  });
  return o;
}

/* ---------- Registrar con Claude: prompt → JSON → vista previa → guardar ---------- */
const DOW = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MEAL_ALIAS = { desayuno: 'Desayuno', almuerzo: 'Comida', comida: 'Comida', lunch: 'Comida', cena: 'Cena', merienda: 'Snack', colacion: 'Snack', snack: 'Snack', antojo: 'Snack', postre: 'Snack', preentreno: 'Snack', breakfast: 'Desayuno', dinner: 'Cena' };
const validDay = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && isoDay(parseDay(s)) === s;
function extractJson(text) {
  text = String(text || '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i); if (fence && fence[1].indexOf('{') >= 0) text = fence[1];
  const a = text.indexOf('{'), b = text.lastIndexOf('}'); if (a < 0 || b < a) return null;
  try { return JSON.parse(text.slice(a, b + 1)); } catch (e) { return null; }
}
function frequentFoods(n) {
  const m = new Map();
  S.food.forEach((e) => { const k = norm(e.desc).trim(); if (!k) return; const r = m.get(k) || { e: e, n: 0 }; r.n++; if ((e.at || '') > (r.e.at || '')) r.e = e; m.set(k, r); });
  return [...m.values()].sort((a, b) => b.n - a.n).slice(0, n).map((r) => r.e);
}
function importPrompt(kind) {
  const t = today(), d = parseDay(t);
  if (kind === 'ex') {
    return 'Eres mi asistente de entrenamiento de fuerza e hipertrofia. Quiero crear ejercicios nuevos para mi app de registro.\n\n' +
      'MIS EJERCICIOS ACTUALES (no los repitas):\n' + (S.exercises.map((e) => e.name).join('; ') || '(ninguno)') + '\n\n' +
      'GRUPOS MUSCULARES VÁLIDOS: ' + MUSCLES.join(', ') + '.\n\n' +
      'CÓMO RESPONDER:\n1. Si mi petición es vaga, hazme máximo 2 preguntas cortas antes de proponer.\n2. Para cada ejercicio da un rango de repeticiones típico (rep_min, rep_max), descanso en segundos y una nota breve de técnica (máx. 200 caracteres).\n3. Cuando esté listo, responde SOLO con un bloque JSON, sin texto alrededor, con este formato:\n' +
      '{"ejercicios":[{"nombre":"Press de pecho en máquina","grupo":"Pecho","secundarios":["Tríceps","Hombros"],"equipo":"Máquina","rep_min":8,"rep_max":12,"descanso_s":120,"notas":"Escápulas atrás y abajo; baja controlado."}]}\n\n' +
      'Después de este mensaje te digo qué ejercicios quiero.';
  }
  const goals = [S.settings.kcal ? S.settings.kcal + ' kcal' : null, S.settings.protein ? S.settings.protein + ' g de proteína' : null].filter(Boolean).join(' y ');
  const es = foodOn(t), tot = dayTot(es), fr = frequentFoods(25);
  return 'Eres mi asistente de nutrición. Voy a contarte lo que he comido y tú lo conviertes en registros para mi app de seguimiento.\n\n' +
    'FECHA DE HOY: ' + t + ' (' + DOW[d.getDay()] + ')\n' +
    'MIS METAS DIARIAS: ' + (goals || 'no definidas') + '\n\n' +
    'YA REGISTRADO HOY EN LA APP' + (es.length ? ' (total ' + Math.round(tot.kcal) + ' kcal, ' + Math.round(tot.p) + ' g prot):\n' + es.map((e) => '- ' + e.meal + ': ' + e.desc + ' · ' + Math.round(e.kcal || 0) + ' kcal, P ' + f1(e.p || 0) + ' g').join('\n') : ': nada todavía') + '\n\n' +
    'ALIMENTOS QUE COMO SEGUIDO (usa estos valores cuando coincidan):\n' + (fr.length ? fr.map((e) => '- ' + e.desc + ': ' + Math.round(e.kcal || 0) + ' kcal, P ' + f1(e.p || 0) + ' g, C ' + f1(e.c || 0) + ' g, G ' + f1(e.f || 0) + ' g').join('\n') : '(aún no hay)') + '\n\n' +
    'CÓMO RESPONDER:\n1. Si una porción es ambigua y cambia mucho el resultado, hazme como máximo 3 preguntas cortas antes de calcular. Si no, estima con porciones típicas.\n' +
    '2. Una entrada por alimento o platillo (no un total por comida), para poder borrarlas por separado.\n' +
    '3. No repitas lo que ya está registrado hoy, salvo que te pida corregirlo. Puedo escribirte varias veces en el día: cada vez devuelve solo lo nuevo.\n' +
    '4. Cuando esté listo, responde SOLO con un bloque JSON, sin texto alrededor, con este formato (el campo "peso" solo si te digo mi peso):\n' +
    '{"comidas":[{"fecha":"' + t + '","comida":"Desayuno","descripcion":"3 huevos revueltos y 2 tortillas","kcal":420,"proteina_g":24,"carbohidratos_g":30,"grasa_g":22}],"peso":[{"fecha":"' + t + '","kg":80.5}]}\n' +
    '"comida" debe ser exactamente: Desayuno, Comida, Cena o Snack. Usa números sin unidades.\n\n' +
    'Después de este mensaje te cuento lo que comí.';
}
function parseImport(text) {
  const j = extractJson(text); if (!j || typeof j !== 'object') return null;
  const out = { food: [], weights: [], ex: [], dup: 0, bad: 0 }, now0 = Date.now();
  (Array.isArray(j.comidas) ? j.comidas : []).forEach((x, i) => {
    if (!x || typeof x !== 'object') { out.bad++; return; }
    const date = x.fecha == null ? today() : x.fecha; if (!validDay(date)) { out.bad++; return; }
    const desc = String(x.descripcion || x.desc || '').trim().slice(0, 200);
    const p = num(x.proteina_g), c = num(x.carbohidratos_g), f = num(x.grasa_g); let k = num(x.kcal);
    if (k == null && (p != null || c != null || f != null)) k = Math.round((p || 0) * 4 + (c || 0) * 4 + (f || 0) * 9);
    if ((!desc && k == null) || (k != null && (k < 0 || k > 5000))) { out.bad++; return; }
    const mk = norm(String(x.comida || '').split(/[\s/]/)[0]);
    out.food.push({ id: uid() + i, date: date, meal: MEAL_ALIAS[mk] || 'Snack', desc: desc || 'Sin descripción', kcal: Math.round(k || 0), p: r1(p || 0), c: c == null ? null : r1(c), f: f == null ? null : r1(f), at: new Date(now0 + i).toISOString() });
  });
  (Array.isArray(j.peso) ? j.peso : []).forEach((x) => {
    const w = x && num(x.kg), date = x && (x.fecha == null ? today() : x.fecha);
    if (w == null || w < 20 || w > 400 || !validDay(date)) { out.bad++; return; }
    out.weights.push({ date: date, weight: r1(w) });
  });
  const used = new Set(S.exercises.map((e) => e.id)), names = new Set(S.exercises.map((e) => norm(e.name).trim()));
  (Array.isArray(j.ejercicios) ? j.ejercicios : []).forEach((x) => {
    const name = x && String(x.nombre || x.name || '').trim().slice(0, 80); if (!name) { out.bad++; return; }
    const nk = norm(name).trim(); if (names.has(nk)) { out.dup++; return; } names.add(nk);
    const cat = (window.CATALOG || []).find((c) => norm(c.name).trim() === nk && !used.has(c.id));
    const mus = MUSCLES.find((m) => norm(m) === norm(x.grupo || x.muscle)) || (cat ? cat.muscle : 'Otro');
    const sec2 = (Array.isArray(x.secundarios) ? x.secundarios : []).map((s) => MUSCLES.find((m) => norm(m) === norm(s))).filter((m) => m && m !== mus);
    let a = Math.round(num(x.rep_min)) || (cat && cat.repMin) || null, b = Math.round(num(x.rep_max)) || (cat && cat.repMax) || null; if (a && b && a > b) { const t = a; a = b; b = t; }
    let id = cat ? cat.id : slug(name); if (used.has(id)) id = id + '-' + uid().slice(-4); used.add(id);
    out.ex.push({ id: id, name: name, muscle: mus, secondary: sec2, equipment: String(x.equipo || (cat && cat.equipment) || '').slice(0, 40), note: '', repMin: a, repMax: b, restSec: Math.round(num(x.descanso_s)) || (cat && cat.restSec) || null, howTo: String(x.notas || x.tecnica || (cat && cat.tip) || '').slice(0, 400) });
  });
  return out;
}
function importSheet(kind) {
  const I = { kind: kind, parsed: null, mode: 'add', copied: false };
  const o = openSheet({
    title: kind === 'ex' ? 'Ejercicios con Claude' : 'Registrar con Claude', left: 'Cerrar', right: null, imp: I,
    body: () => I.parsed ? importPreview(I) :
      '<div class="sec"><div class="h"><span>Paso 1</span></div><div class="group pad"><div class="sub" style="margin:0 0 10px">' + (kind === 'ex' ? 'Copia el prompt, pégalo en un chat de Claude y dile qué ejercicios quieres (por ejemplo: «agrégame 6 ejercicios de pecho con mancuernas y poleas»).' : 'Copia el prompt (ya incluye tu fecha, tus metas, lo que registraste hoy y tus alimentos frecuentes), pégalo en un chat de Claude y cuéntale qué comiste. Puedes volver al mismo chat varias veces en el día.') + '</div><button class="btn" data-act="impCopy">' + (I.copied ? 'Copiado ✓' : 'Copiar prompt') + '</button></div></div>' +
      '<div class="sec"><div class="h"><span>Paso 2</span></div><div class="group pad"><div class="sub" style="margin:0 0 10px">Pega aquí la respuesta de Claude (el bloque JSON). Verás una vista previa antes de guardar nada.</div><textarea class="field" id="impIn" placeholder="{&quot;' + (kind === 'ex' ? 'ejercicios' : 'comidas') + '&quot;: [ … ]}" style="font-family:var(--mono);font-size:13px" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea><div style="margin-top:10px"><button class="btn gray" data-act="impParse">Ver vista previa</button></div></div></div>',
    ok: () => {
      const P = I.parsed; if (!P) return;
      if (P.food.length || I.mode === 'replace') {
        const dates = [...new Set(P.food.map((f) => f.date))], rep = I.mode === 'replace' ? dates : [];
        D.importFood(P.food, rep);
      }
      D.importWeights(P.weights);
      D.saveExercises(P.ex);
      const bits = [P.food.length ? plural(P.food.length, 'comida', 'comidas') : null, P.weights.length ? plural(P.weights.length, 'peso', 'pesos') : null, P.ex.length ? plural(P.ex.length, 'ejercicio', 'ejercicios') : null].filter(Boolean);
      closeSheet(o); toast('Guardado: ' + bits.join(', ')); render();
    }
  });
  return o;
}
function importPreview(I) {
  const P = I.parsed; let h = '';
  const total = P.food.length + P.weights.length + P.ex.length;
  if (!total) return '<div class="sec"><div class="group pad"><b>No encontré nada que guardar</b><div class="sub" style="margin-top:6px">' + (P.dup ? 'Todos los ejercicios ya existen en tu app. ' : '') + (P.bad ? plural(P.bad, 'elemento no era válido', 'elementos no eran válidos') + '. ' : '') + 'Pídele a Claude que respete el formato.</div><div style="margin-top:12px"><button class="btn gray" data-act="impBack">Volver a pegar</button></div></div></div>';
  if (P.food.length) {
    const days = [...new Set(P.food.map((f) => f.date))].sort(), clash = days.filter((d) => foodOn(d).length);
    days.forEach((d) => {
      const xs = P.food.filter((f) => f.date === d), t = dayTot(xs), have = foodOn(d);
      h += sec(fmtDate(d) + ' · ' + Math.round(t.kcal) + ' kcal · ' + Math.round(t.p) + ' g prot', xs.map((e) => li(esc(e.desc), { sub: e.meal + ' · ' + e.kcal + ' kcal · ' + f1(e.p) + ' g prot' + (e.c != null ? ' · ' + f1(e.c) + ' C' : '') + (e.f != null ? ' · ' + f1(e.f) + ' G' : '') })).join(''),
        have.length ? 'Ese día ya tienes ' + plural(have.length, 'entrada', 'entradas') + ' (' + Math.round(dayTot(have).kcal) + ' kcal).' : '');
    });
    if (clash.length) h += '<div class="seg" style="margin:0 16px 8px"><button class="' + (I.mode === 'add' ? 'on' : '') + '" data-act="impMode" data-v="add">Agregar a lo que ya hay</button><button class="' + (I.mode === 'replace' ? 'on' : '') + '" data-act="impMode" data-v="replace">Reemplazar esos días</button></div><div class="f" style="margin-bottom:12px">' + (I.mode === 'add' ? 'Se suma a lo ya registrado.' : 'Se borrará todo lo registrado en ' + clash.map(fmtDate).join(', ') + ' y quedará solo lo de la vista previa.') + '</div>';
  }
  if (P.weights.length) h += sec('Peso', P.weights.map((w) => li(fmtDate(w.date), { v: f1(w.weight) + ' kg' })).join(''), 'Si ya había un peso ese día, se reemplaza.');
  if (P.ex.length) h += sec('Ejercicios nuevos (' + P.ex.length + ')', P.ex.map((e) => li(esc(e.name), { sub: e.muscle + (e.equipment ? ' · ' + e.equipment : '') + (e.repMin && e.repMax ? ' · ' + e.repMin + '–' + e.repMax + ' reps' : '') })).join(''));
  if (P.dup || P.bad) h += '<p class="muted small" style="margin:0 16px 12px">' + [P.dup ? plural(P.dup, 'ejercicio omitido porque ya existe', 'ejercicios omitidos porque ya existen') : null, P.bad ? plural(P.bad, 'elemento omitido por datos inválidos', 'elementos omitidos por datos inválidos') : null].filter(Boolean).join(' · ') + '</p>';
  return h + '<div style="margin:0 16px 8px"><button class="btn gray" data-act="impBack">Volver a pegar</button></div>';
}
function importDraw(o) { o.right = o.imp.parsed && (o.imp.parsed.food.length || o.imp.parsed.weights.length || o.imp.parsed.ex.length) ? 'Guardar' : null; o.left = o.imp.parsed ? 'Cerrar' : 'Cerrar'; drawSheet(o); }

/* ---------- Más: rutinas, ejercicios, exportar, ajustes, cuenta ---------- */
const INSTALL_STEPS = [
  ['Abre la app en Safari', 'Escribe o pega la dirección donde alojaste la app. Tiene que ser Safari, no Chrome ni otro navegador.'],
  ['Toca Compartir', 'Es el cuadrito con la flecha hacia arriba, en la barra de abajo.'],
  ['Añadir a pantalla de inicio', 'Desliza el menú hacia abajo, toca “Añadir a pantalla de inicio” y luego “Añadir”.'],
  ['Ábrela desde el ícono', 'Se abre a pantalla completa, como una app nativa. Inicia sesión una sola vez: el teléfono recuerda tu cuenta.'],
  ['Úsala en el gimnasio sin señal', 'Lo que registres se guarda en el teléfono y se envía solo cuando vuelva el internet. La primera vez sí necesitas conexión para entrar.']
];
function vMore() {
  const back = backBtn('Más');
  if (moreSub === 'routines') {
    return { title: 'Rutinas', left: back, right: '<button class="nb b" data-act="newTpl">Nueva</button>', html: !S.templates.length ? emptyBox('Sin rutinas', 'Crea tus rutinas para que la app te sugiera cuál sigue.', '<button class="btn inline" data-act="newTpl">Crear rutina</button>') :
      sec('Orden de rotación', S.templates.map((t, i) => '<div class="li" data-di="routine"><button class="grip" aria-label="Arrastra para reordenar">' + IC.grip + '</button><button class="t" data-act="tplEdit" data-id="' + esc(t.id) + '">' + (i + 1) + '. ' + esc(t.name) + '<small>' + plural((t.items || []).length, 'ejercicio', 'ejercicios') + '</small></button></div>').join(''),
        'La app sugiere la siguiente rutina según este orden. Solo las sesiones hechas con una rutina avanzan la rotación; las sesiones por grupos o libres no la mueven. Arrastra el asa (⋮⋮) para cambiar el orden. Toca una rutina para editarla.') };
  }
  if (moreSub === 'exercises') {
    const use = lastUseMap(), live = S.exercises.filter((e) => !e.archived), arch = S.exercises.filter((e) => e.archived);
    const mus = MUSCLES.filter((m) => live.some((e) => e.muscle === m));
    if (exMus !== 'Todos' && exMus !== '★' && !mus.includes(exMus)) exMus = 'Todos';
    const rowH = (e) => '<button class="li chev exrow" data-n="' + esc(norm(e.name + ' ' + e.muscle)) + '" data-act="exDetail" data-id="' + esc(e.id) + '"><span class="t">' + esc(e.name) + (e.favorite ? ' <span style="color:var(--orange)">★</span>' : '') + '<small>' + esc([e.equipment, e.repMin && e.repMax ? e.repMin + '–' + e.repMax + ' reps' : null].filter(Boolean).join(' · ')) + '</small></span><span class="v">' + (use[e.id] ? ago(use[e.id]) : '') + '</span></button>';
    let h = '<div class="row" style="margin:0 16px 16px"><button class="btn tint sm grow" data-act="catOpen">Biblioteca (' + (window.CATALOG || []).length + ')</button><button class="btn tint sm grow" data-act="importEx">Pedir a Claude</button></div>';
    h += sec('', '<label class="li"><span class="t">Buscar</span><input id="exQ" data-lf=".exrow" placeholder="Nombre del ejercicio" autocomplete="off" style="text-align:left"></label>');
    h += '<div class="chips">' + [['Todos', 'Todos'], ['★', '★ Favoritos']].concat(mus.map((m) => [m, m])).map((c) => '<button class="chip ' + (exMus === c[0] ? 'on' : '') + '" data-act="exMus" data-v="' + esc(c[0]) + '">' + esc(c[1]) + '</button>').join('') + '</div>';
    if (exMus === 'Todos') {
      const fav = live.filter((e) => e.favorite);
      if (fav.length) h += fg(sec('Favoritos', fav.map(rowH).join('')));
      mus.forEach((m) => { const xs = live.filter((e) => e.muscle === m && !e.favorite); if (xs.length) h += fg(sec(m, xs.map(rowH).join(''))); });
      if (arch.length) h += fg(sec('Archivados', arch.map(rowH).join('')));
    } else {
      const xs = live.filter((e) => exMus === '★' ? e.favorite : e.muscle === exMus);
      h += xs.length ? fg(sec('', xs.map(rowH).join(''))) : emptyBox(exMus === '★' ? 'Sin favoritos' : 'Sin ejercicios', exMus === '★' ? 'Marca un ejercicio con la estrella en su ficha.' : 'Agrega ejercicios desde la biblioteca.');
    }
    return { title: 'Ejercicios', left: back, right: '<button class="nb b" data-act="exNew">Nuevo</button>', html: h };
  }
  if (moreSub === 'export') {
    const rows = [['sets', 'Series (una fila por serie)', 'La tabla principal: ideal para gráficas en Sheets, Looker Studio o Excel'], ['sessions', 'Sesiones', 'Una fila por sesión, con volumen, energía y sueño'], ['meas', 'Medidas', 'Los 8 perímetros por fecha'], ['bw', 'Peso corporal', 'Un registro por día'], ['food', 'Comidas', 'Calorías, proteína, carbohidratos y grasa'], ['ex', 'Ejercicios', 'Tu biblioteca'], ['json', 'Respaldo completo (JSON)', 'Todo junto, para guardar una copia']];
    return { title: 'Exportar', left: back, html: sec('Archivos', rows.map((r) => li(r[1], { sub: r[2], chev: 1, d: { act: 'exp', v: r[0] } })).join(''), 'Se abre el menú de compartir de iOS: guárdalos en Archivos, mándalos a Google Drive o ábrelos en Hojas de cálculo.') +
      sec('Para conectar con otras herramientas', '<div class="pad sub" style="margin:0">En Supabase (Table Editor / SQL) también tienes la vista <b>series_flat</b>: una fila por serie, con e1RM y volumen ya calculados. Puedes conectarla directamente a Looker Studio, Metabase o Google Sheets sin depender de esta app.</div>') };
  }
  if (moreSub === 'settings') {
    const s = S.settings || {};
    return { title: 'Ajustes', left: back, html: sec('Metas diarias', '<label class="li"><span class="t">Calorías (kcal)</span><input id="st_kcal" inputmode="numeric" value="' + esc(s.kcal == null ? '' : s.kcal) + '" placeholder="opcional"></label><label class="li"><span class="t">Proteína (g)</span><input id="st_prot" inputmode="numeric" value="' + esc(s.protein == null ? '' : s.protein) + '" placeholder="opcional"></label>') +
      sec('Series efectivas por semana, por grupo', '<label class="li"><span class="t">Mínimo</span><input id="st_min" inputmode="numeric" value="' + esc(TARGET.min) + '"></label><label class="li"><span class="t">Máximo</span><input id="st_max" inputmode="numeric" value="' + esc(TARGET.max) + '"></label>', 'Para hipertrofia suele recomendarse entre 10 y 20.') +
      '<div style="margin:0 16px"><button class="btn" data-act="saveSet">Guardar ajustes</button></div>' };
  }
  if (moreSub === 'account') {
    let dead = []; try { dead = JSON.parse(localStorage.getItem('bh.dead') || '[]') || []; } catch (e) {}
    const st = !D.online ? 'Sin conexión' : D.pending() ? D.pending() + ' por enviar' : 'Todo sincronizado';
    return { title: 'Cuenta', left: back, html: sec('Sesión', li('Correo', { v: esc(D.user ? D.user.email : '—') }) + li('Estado', { v: st }) + li('Última sincronización', { v: D.lastSync ? new Date(D.lastSync).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—' })) +
      (D.lastError ? '<div class="banner red"><span>' + esc(D.lastError) + '</span></div>' : '') +
      sec('', li('Sincronizar ahora', { blue: 1, d: { act: 'syncNow' } }) + (D.schemaOutdated ? li('Actualizar base de datos', { sub: 'Falta un paso de una sola vez', blue: 1, d: { act: 'schemaSql' } }) : '') + (dead.length ? li('Cambios que no se pudieron guardar (' + dead.length + ')', { sub: 'Toca para copiar el detalle', blue: 1, d: { act: 'copyDead' } }) : '')) +
      sec('', li('Cerrar sesión', { red: 1, d: { act: 'logout' } }), 'Tus datos quedan en Supabase. Al volver a entrar se descargan de nuevo.') };
  }
  if (moreSub === 'install') {
    return { title: 'Instalar en iPhone', left: back, html: sec('', INSTALL_STEPS.map((s, i) => '<div class="li col"><b>' + (i + 1) + '. ' + s[0] + '</b><div class="sub" style="margin:0">' + s[1] + '</div></div>').join('')) +
      sec('Android', '<div class="pad sub" style="margin:0">En Chrome abre el menú ⋮ y toca “Instalar app” o “Añadir a pantalla de inicio”.</div>') };
  }
  const pend = D.pending();
  return { title: 'Más', html:
    sec('', li('Rutinas', { sub: plural(S.templates.length, 'rutina', 'rutinas') + ' en rotación', chev: 1, d: { act: 'moreGo', v: 'routines' } }) + li('Ejercicios', { sub: plural(S.exercises.length, 'ejercicio', 'ejercicios'), chev: 1, d: { act: 'moreGo', v: 'exercises' } })) +
    sec('', li('Exportar datos', { sub: 'CSV y respaldo JSON', chev: 1, d: { act: 'moreGo', v: 'export' } }) + li('Ajustes', { sub: 'Metas de comida y series', chev: 1, d: { act: 'moreGo', v: 'settings' } })) +
    sec('', li('Cuenta y sincronización', { v: !D.online ? 'Sin conexión' : pend ? pend + ' por enviar' : 'Al día', chev: 1, d: { act: 'moreGo', v: 'account' } }) + li('Instalar en el iPhone', { chev: 1, d: { act: 'moreGo', v: 'install' } })) +
    '<p class="muted small" style="text-align:center;margin:0 16px">Bitácora de Hierro · tus datos viven en tu propia base de datos de Supabase.</p>' };
}

/* ---------- hojas de edición ---------- */
let tplO = null;
function tplSheet(t) {
  tplEdit = { id: t ? t.id : uid(), isNew: !t, name: t ? t.name : '', order: t ? t.order : S.templates.length, items: t ? (t.items || []).map((i) => Object.assign({}, i)) : [] };
  tplO = openSheet({
    title: t ? 'Editar rutina' : 'Nueva rutina', right: 'Guardar', onClose: () => { tplEdit = null; tplO = null; },
    body: () => sec('', '<label class="li"><span class="t">Nombre</span><input data-bind="tpl:name" value="' + esc(tplEdit.name) + '" placeholder="Torso A" autocomplete="off"></label>') +
      sec('Ejercicios', (tplEdit.items.map((it, i) => {
        const e = exById(it.exerciseId);
        return '<div class="li col" data-di="tpl"><div class="row between"><span class="row" style="gap:6px;min-width:0"><button class="grip" aria-label="Arrastra para reordenar">' + IC.grip + '</button><b>' + esc(e ? e.name : '(ejercicio borrado)') + '</b></span><span class="mvs"><button class="mv red" data-act="tplRm" data-i="' + i + '" aria-label="Quitar">✕</button></span></div>' +
          '<div class="cfg"><label>Series<input inputmode="numeric" data-tf="sets" data-i="' + i + '" value="' + esc(it.sets || 3) + '"></label><label>Reps mín.<input inputmode="numeric" data-tf="repMin" data-i="' + i + '" value="' + esc(it.repMin || '') + '"></label><label>Reps máx.<input inputmode="numeric" data-tf="repMax" data-i="' + i + '" value="' + esc(it.repMax || '') + '"></label></div></div>';
      }).join('') || '<div class="li"><span class="t muted">Aún no hay ejercicios.</span></div>') + li('Agregar ejercicio', { blue: 1, d: { act: 'tplAddEx' } }), 'El rango de repeticiones activa la progresión doble: al llegar al máximo en todas las series, la app te sugiere subir peso.') +
      (tplEdit.isNew ? '' : sec('', li('Eliminar rutina', { red: 1, d: { act: 'tplDelete' } }), 'Las sesiones ya registradas no se borran.')),
    ok: () => {
      const name = (tplEdit.name || '').trim(); if (!name) { toast('Ponle un nombre a la rutina.'); return; }
      if (!tplEdit.items.length) { toast('Agrega al menos un ejercicio.'); return; }
      const items = tplEdit.items.map((it) => { const a = Math.round(num(it.repMin)) || null, b = Math.round(num(it.repMax)) || null; return { exerciseId: it.exerciseId, sets: Math.max(1, Math.round(num(it.sets)) || 3), repMin: a && b && a > b ? b : a, repMax: a && b && a > b ? a : b, restSec: it.restSec || null }; });
      D.saveTemplate({ id: tplEdit.id, name: name, order: tplEdit.order, items: items });
      closeSheet(tplO); toast('Rutina guardada'); render();
    }
  });
}

function pickEx(cb, title) {
  const o = openSheet({
    title: title || 'Elegir ejercicio', left: 'Cancelar',
    body: () => {
      const use = lastUseMap(), act = S.exercises.filter((e) => !e.archived);
      const row = (e, ctx) => '<button class="li pk" data-n="' + esc(norm(e.name)) + '" data-act="pickPick" data-id="' + esc(e.id) + '"><span class="t">' + esc(e.name) + '<small>' + esc([ctx ? e.muscle : null, e.equipment].filter(Boolean).join(' · ')) + '</small></span><span class="v">' + (use[e.id] ? ago(use[e.id]) : '') + '</span></button>';
      let h = sec('', '<label class="li"><span class="t">Buscar</span><input id="pickQ" data-lf=".pk" placeholder="Nombre del ejercicio" autocomplete="off" style="text-align:left"></label>');
      h += sec('', li('Crear ejercicio nuevo', { blue: 1, d: { act: 'pickNew' } }) + li('Buscar en la biblioteca (' + (window.CATALOG || []).length + ')', { blue: 1, d: { act: 'pickCat' } }));
      const fav = act.filter((e) => e.favorite);
      if (fav.length) h += '<div data-fg>' + sec('Favoritos', fav.map((e) => row(e, true)).join('')) + '</div>';
      const rec = act.filter((e) => use[e.id] && !e.favorite).sort((a, b) => use[b.id].localeCompare(use[a.id])).slice(0, 6);
      if (rec.length) h += '<div data-fg>' + sec('Recientes', rec.map((e) => row(e, true)).join('')) + '</div>';
      MUSCLES.forEach((m) => { const xs = act.filter((e) => e.muscle === m); if (xs.length) h += '<div data-fg>' + sec(m, xs.map((e) => row(e, false)).join('')) + '</div>'; });
      return h;
    }
  });
  o.pick = (id) => { closeSheet(o); cb(id); };
  o.nuevo = () => exSheet(null, (id) => { closeSheet(o); cb(id); });
  o.catalog = () => catalogSheet({ q: LFS.pickQ, onAdd: (id) => { closeSheet(o); cb(id); } });
  return o;
}
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function exSheet(ex, cb) {
  const st = { id: ex ? ex.id : null, name: ex ? ex.name : '', muscle: ex ? ex.muscle : 'Pecho', equipment: ex ? ex.equipment || '' : '', secondary: ex ? (ex.secondary || []).slice() : [], note: ex ? ex.note || '' : '',
    repMin: ex && ex.repMin ? String(ex.repMin) : '', repMax: ex && ex.repMax ? String(ex.repMax) : '', restSec: ex && ex.restSec ? String(ex.restSec) : '', defaultSets: ex && ex.defaultSets ? String(ex.defaultSets) : '',
    howTo: ex ? ex.howTo || '' : '', favorite: !!(ex && ex.favorite), archived: !!(ex && ex.archived), imageUrl: ex ? ex.imageUrl || null : null };
  const o = openSheet({
    title: ex ? 'Editar ejercicio' : 'Nuevo ejercicio', right: 'Guardar',
    body: () => sec('', '<label class="li"><span class="t">Nombre</span><input data-bind="ex:name" value="' + esc(st.name) + '" placeholder="Press banca con barra" autocomplete="off"></label>' +
      '<label class="li"><span class="t">Grupo principal</span><select data-bind="ex:muscle">' + MUSCLES.map((m) => '<option ' + (m === st.muscle ? 'selected' : '') + '>' + m + '</option>').join('') + '</select></label>' +
      '<label class="li"><span class="t">Equipo</span><select data-bind="ex:equipment"><option value="">—</option>' + EQUIP.map((m) => '<option ' + (m === st.equipment ? 'selected' : '') + '>' + m + '</option>').join('') + '</select></label>' +
      '<label class="li"><span class="t">Favorito</span><input type="checkbox" class="switch" data-bind="ex:favorite" ' + (st.favorite ? 'checked' : '') + '></label>') +
      sec('Músculos secundarios', '<div class="chips wrapc" style="padding:12px 12px">' + MUSCLES.filter((m) => m !== 'Otro').map((m) => '<button class="chip ' + (st.secondary.includes(m) ? 'on' : '') + '" data-act="exSec" data-v="' + m + '">' + m + '</button>').join('') + '</div>', 'Cuentan media serie en tu volumen semanal.') +
      sec('Valores sugeridos', '<div class="li col"><div class="cfg" style="grid-template-columns:repeat(4,1fr)"><label>Reps mín.<input inputmode="numeric" data-bind="ex:repMin" value="' + esc(st.repMin) + '"></label><label>Reps máx.<input inputmode="numeric" data-bind="ex:repMax" value="' + esc(st.repMax) + '"></label><label>Descanso s<input inputmode="numeric" data-bind="ex:restSec" value="' + esc(st.restSec) + '"></label><label>Series<input inputmode="numeric" data-bind="ex:defaultSets" value="' + esc(st.defaultSets) + '"></label></div></div>', 'Cada ejercicio usa su propio rango. Al agregarlo o reemplazarlo en una sesión se aplican estos valores (las rutinas guardan los suyos).') +
      sec('Cómo hacerlo', '<div class="pad"><textarea class="field" data-bind="ex:howTo" placeholder="Indicaciones de técnica">' + esc(st.howTo) + '</textarea></div>') +
      sec('Nota personal', '<div class="pad"><textarea class="field" data-bind="ex:note" placeholder="Ajuste de asiento, agarre, molestias…">' + esc(st.note) + '</textarea></div>', 'La nota aparece como recordatorio dentro de la sesión.'),
    ok: () => {
      const name = st.name.trim(); if (!name) { toast('Ponle un nombre al ejercicio.'); return; }
      let id = st.id;
      if (!id) { id = slug(name); if (exById(id)) id += '-' + uid().slice(-3); }
      const prev = exById(id), iv = (v) => { const n = Math.round(num(v)); return n > 0 ? n : null; };
      let a = iv(st.repMin), b = iv(st.repMax); if (a && b && a > b) { const t = a; a = b; b = t; }
      D.saveExercise({ id: id, name: name, muscle: st.muscle, secondary: st.secondary.filter((m) => m !== st.muscle), equipment: st.equipment || null, note: st.note.trim(), repMin: a, repMax: b, restSec: iv(st.restSec), defaultSets: iv(st.defaultSets), howTo: st.howTo.trim(), favorite: st.favorite, archived: st.archived, imageUrl: st.imageUrl, createdAt: prev ? prev.createdAt : null });
      closeSheet(o); toast('Ejercicio guardado'); if (cb) cb(id); else render();
    }
  });
  o.st = st; return o;
}

function measSheet(m) {
  const last = S.measurements.find((x) => !m || x.date !== m.date) || null;
  const st = { orig: m ? m.date : null, date: m ? m.date : today(), notes: m ? m.notes || '' : '', vals: {} };
  MEAS.forEach((k) => { st.vals[k[0]] = m && m[k[0]] != null ? String(m[k[0]]) : ''; });
  const o = openSheet({
    title: m ? 'Editar medición' : 'Nueva medición', right: 'Guardar',
    body: () => sec('', '<label class="li"><span class="t">Fecha</span><input type="date" data-bind="meas:date" value="' + esc(st.date) + '" style="flex:none;width:auto"></label>') +
      sec('Perímetros (cm)', MEAS.map((k) => '<label class="li"><span class="t">' + k[1] + '</span><input inputmode="decimal" data-mf="' + k[0] + '" value="' + esc(st.vals[k[0]]) + '" placeholder="' + (last && last[k[0]] != null ? f1(last[k[0]]) : 'cm') + '"></label>').join(''), 'Mide al despertar y en ayunas, relajado, con la cinta sin apretar. El gris es tu medición anterior.') +
      sec('Notas', '<div class="pad"><textarea class="field" data-bind="meas:notes" placeholder="Opcional">' + esc(st.notes) + '</textarea></div>'),
    ok: () => {
      const rec = { date: st.date || today(), notes: st.notes.trim() };
      let any = false; MEAS.forEach((k) => { const v = num(st.vals[k[0]]); rec[k[0]] = v; if (v != null) any = true; });
      if (!any) { toast('Escribe al menos una medida.'); return; }
      const from = new Date(parseDay(rec.date)); from.setDate(from.getDate() - 6); const f = isoDay(from);
      const bw = S.bodyweight.filter((x) => x.date >= f && x.date <= rec.date).map((x) => x.weight);
      rec.weightAvg7 = bw.length ? r1(bw.reduce((a, x) => a + x, 0) / bw.length) : null;
      if (st.orig && st.orig !== rec.date) D.deleteMeasurement(st.orig);
      D.saveMeasurement(rec); closeSheet(o); toast('Medición guardada'); bodyTab = 'meas'; render();
    }
  });
  o.st = st; return o;
}

function sessSheet(id) {
  const o = openSheet({
    title: 'Sesión', left: 'Cerrar',
    body: () => {
      const s = S.sessions.find((x) => x.id === id) || S.deleted.find((x) => x.id === id); if (!s) return emptyBox('No encontrada', 'Esta sesión ya no existe.');
      const sets = (s.exercises || []).reduce((a, e) => a + e.sets.filter(isWork).length, 0), vol = (s.exercises || []).reduce((a, e) => a + e.sets.filter(isWork).reduce((b, x) => b + x.w * x.r, 0), 0);
      let h = '<h2 class="large" style="font-size:26px;margin-bottom:10px">' + esc(s.templateName) + '</h2>' +
        sec('', li('Fecha', { v: fmtDate(s.date) }) + li('Duración', { v: (s.durationMin || '—') + ' min' }) + li('Series efectivas', { v: sets }) + li('Volumen', { v: Math.round(vol).toLocaleString('es-MX') + ' kg' }) + (s.energy ? li('Energía', { v: s.energy + ' / 5' }) : '') + (s.sleepH ? li('Sueño', { v: s.sleepH + ' h' }) : ''));
      (s.exercises || []).forEach((e) => {
        let wn = 0;
        h += sec(esc(e.name) + ' · ' + esc(e.muscle || ''), e.sets.map((x) => { const t = x.type || 'N'; if (t !== 'W') wn++; return li((t === 'N' ? 'Serie ' + wn : SET_T[t].name), { v: f1(x.w) + ' kg × ' + x.r + (x.rir != null ? ' @' + x.rir : '') }); }).join(''));
      });
      if (s.notes) h += sec('Notas', '<div class="pad">' + esc(s.notes) + '</div>');
      if (s.deletedAt) h += sec('', li('Restaurar sesión', { blue: 1, d: { act: 'trashRestore', id: s.id } }));
      else h += sec('', li('Editar sesión', { blue: 1, d: { act: 'sessEdit', id: s.id } }) + li('Repetir esta sesión', { blue: 1, d: { act: 'sessRepeat', id: s.id } }) + li('Mover a la papelera', { red: 1, d: { act: 'sessTrash', id: s.id } }), 'Editar guarda una nueva revisión. La papelera no borra nada: puedes restaurarla.');
      return h;
    }
  });
  o.live = true; return o;
}
function trashSheet() {
  const o = openSheet({
    title: 'Papelera', left: 'Cerrar',
    body: () => S.deleted.length ? sec('', S.deleted.map((s) => li(esc(s.templateName), { sub: fmtDate(s.date), v: 'Restaurar', d: { act: 'trashRestore', id: s.id } })).join(''), 'Las sesiones aquí no cuentan en tus estadísticas ni récords.') : emptyBox('Papelera vacía', 'Las sesiones que muevas aquí podrás restaurarlas.')
  });
  o.live = true; return o;
}

/* ---------- filtro en vivo de listas ---------- */
const LFS = {};
const resetLF = () => { delete LFS.exQ; delete LFS.recQ; };
function applyLF(inp) {
  const k = norm(inp.value.trim()), sel = inp.dataset.lf, root = inp.closest('.sheet-b') || document;
  root.querySelectorAll(sel).forEach((r) => { r.hidden = !!k && !(r.dataset.n || '').includes(k); });
  root.querySelectorAll('[data-fg]').forEach((g) => { g.hidden = !g.querySelector(sel + ':not([hidden])'); });
}
function restoreLF(root) { root.querySelectorAll('input[data-lf]').forEach((i) => { if (LFS[i.id]) { i.value = LFS[i.id]; applyLF(i); } }); }
const fg = (html) => html.replace('<section class="sec">', '<section class="sec" data-fg>');
function lastUseMap() { const m = {}; S.sessions.forEach((s) => (s.exercises || []).forEach((e) => { if (e.sets.some(isWork) && (!m[e.exerciseId] || s.date > m[e.exerciseId])) m[e.exerciseId] = s.date; })); return m; }
const exName = (id) => { const e = exById(id); if (e) return e.name; for (const s of S.sessions) { const x = (s.exercises || []).find((q) => q.exerciseId === id); if (x) return x.name; } return id; };

/* ---------- estadísticas por ejercicio ---------- */
const REPS = [1, 2, 3, 5, 6, 8, 10, 12, 15];
function exStats(id) {
  const rows = [];
  S.sessions.slice().sort((a, b) => a.date.localeCompare(b.date) || (a.startedAt || '').localeCompare(b.startedAt || '')).forEach((s) => {
    (s.exercises || []).filter((e) => e.exerciseId === id).forEach((e) => {
      const ws = e.sets.filter(isWork).filter((x) => x.r > 0); if (ws.length) rows.push({ date: s.date, sets: ws });
    });
  });
  const bodyweight = rows.length > 0 && !rows.some((r) => r.sets.some((x) => x.w > 0));
  const metric = (x) => bodyweight ? x.r : e1rm(x.w, x.r);
  let best = 0, bestInfo = null, maxW = null, bestVol = null, maxReps = null; const prs = [], byRep = {}, series = [], wSeries = [];
  rows.forEach((r) => {
    let sb = 0, sx = null, vol = 0, mw = 0;
    r.sets.forEach((x) => {
      const m = metric(x); if (m > sb) { sb = m; sx = x; }
      vol += x.w * x.r; if (x.w > mw) mw = x.w;
      if (!maxW || x.w > maxW.w || (x.w === maxW.w && x.r > maxW.r)) maxW = { w: x.w, r: x.r, date: r.date };
      if (!maxReps || x.r > maxReps.r) maxReps = { r: x.r, w: x.w, date: r.date };
      REPS.forEach((n) => { if (x.r >= n && x.w > 0) { const c = byRep[n]; if (!c || x.w > c.w || (x.w === c.w && x.r > c.r)) byRep[n] = { w: x.w, r: x.r, date: r.date }; } });
    });
    r.e1 = sb; r.vol = vol; r.best = sx; r.maxW = mw;
    if (sb > best + 0.05) { prs.push({ date: r.date, v: sb, w: sx.w, r: sx.r, delta: best > 0 ? sb - best : null }); best = sb; bestInfo = { v: sb, w: sx.w, r: sx.r, date: r.date }; }
    if (!bestVol || vol > bestVol.v) bestVol = { v: vol, date: r.date };
    series.push({ x: r.date, y: r1(sb) }); wSeries.push({ x: r.date, y: mw });
  });
  return { rows: rows, sessions: rows.length, bodyweight: bodyweight, best: bestInfo, maxW: maxW, maxReps: maxReps, bestVol: bestVol, byRep: byRep, prs: prs.slice().reverse(), series: series, wSeries: wSeries, lastDate: rows.length ? rows[rows.length - 1].date : null };
}

/* ---------- ficha del ejercicio ---------- */
function exDetailBody(id) {
  const e = exById(id); if (!e) return emptyBox('No encontrado', 'Este ejercicio ya no existe.');
  const st = exStats(id), d = exDef(id), unit = st.bodyweight ? ' reps' : ' kg';
  let h = '<div style="padding:0 16px 14px"><h2 style="font-size:26px;line-height:1.15;margin:0 0 4px">' + esc(e.name) + (e.favorite ? ' <span style="color:var(--orange)">★</span>' : '') + '</h2><div class="sub" style="margin:0">' +
    esc([e.muscle].concat((e.secondary || []).length ? ['también ' + e.secondary.join(', ')] : [], e.equipment ? [e.equipment] : []).join(' · ')) + (e.archived ? ' · <b>Archivado</b>' : '') + '</div></div>';
  if (st.sessions) {
    h += st.bodyweight ? tiles([['Máx. repeticiones', st.maxReps.r], ['Sesiones', st.sessions], ['Última vez', ago(st.lastDate).replace('hace ', '')]])
      : tiles([['Mejor 1RM estimado', st.best ? f1(st.best.v) : '—'], ['Peso máximo', f1(st.maxW.w)], ['Sesiones', st.sessions]]);
    const reps = REPS.filter((n) => st.byRep[n]);
    if (!st.bodyweight && reps.length) h += sec('Mejor peso por repeticiones', reps.map((n) => { const x = st.byRep[n]; return '<div class="rec"><div><b>' + n + (n === 1 ? ' repetición' : ' repeticiones') + '</b><small>' + shortD(x.date) + (x.r > n ? ' · hizo ' + x.r : '') + '</small></div><div class="v">' + f1(x.w) + '<small>kg</small></div></div>'; }).join(''), 'Con cuántas repeticiones, como mínimo, levantaste ese peso. Solo series efectivas.');
    if (st.prs.length) h += sec('Récords rotos', st.prs.slice(0, 8).map((p) => '<div class="rec"><div><b>' + shortD(p.date) + '</b><small>' + (st.bodyweight ? p.r + ' reps' : f1(p.w) + ' kg × ' + p.r) + '</small></div><div class="v">' + f1(p.v) + '<small>' + (st.bodyweight ? 'reps' : 'e1RM') + (p.delta ? ' +' + f1(p.delta) : '') + '</small></div></div>').join(''), st.prs.length > 8 ? 'Se muestran los 8 más recientes.' : '');
    if (st.series.length > 1) h += sec(st.bodyweight ? 'Repeticiones por sesión' : '1RM estimado (kg)', '<div class="pad">' + lineChart(st.series, { label: 'Progreso de ' + e.name }) + '</div>');
    if (!st.bodyweight && st.wSeries.length > 1) h += sec('Peso máximo por sesión (kg)', '<div class="pad">' + lineChart(st.wSeries, { label: 'Peso máximo' }) + '</div>');
    if (st.bestVol && !st.bodyweight) h += sec('', '<div class="rec"><div><b>Mejor volumen en una sesión</b><small>' + shortD(st.bestVol.date) + '</small></div><div class="v">' + Math.round(st.bestVol.v).toLocaleString('es-MX') + '<small>kg</small></div></div>');
  } else h += '<p class="muted" style="margin:0 16px 20px">Aún no has registrado este ejercicio. Cuando lo hagas verás aquí tus récords y tu progreso.</p>';
  h += sec('Ficha', li('Rango de repeticiones', { v: d.min + '–' + d.max }) + li('Descanso sugerido', { v: fmtRest(d.rest) }) + li('Series sugeridas', { v: d.sets }) +
    '<button class="li" data-act="exFav"><span class="t">' + (e.favorite ? '★ Quitar de favoritos' : '☆ Marcar como favorito') + '</span></button>');
  const tip = e.howTo || (catById(id) || {}).tip;
  if (tip) h += sec('Cómo hacerlo', '<div class="pad">' + esc(tip) + '</div>');
  if (e.note) h += sec('Mi nota', '<div class="pad">' + esc(e.note) + '</div>');
  if (st.sessions) {
    h += '<section class="sec"><div class="h"><span>Historial</span></div><div class="group tbl"><table><thead><tr><th>Fecha</th><th>Series (kg×reps @RIR)</th><th>' + (st.bodyweight ? 'Reps' : 'e1RM') + '</th><th>Vol.</th></tr></thead><tbody>' +
      st.rows.slice().reverse().slice(0, 12).map((r) => '<tr><td>' + fmtDate(r.date) + '</td><td>' + r.sets.map((x) => f1(x.w) + '×' + x.r + (x.rir != null ? '@' + x.rir : '')).join('  ') + '</td><td>' + f1(r.e1) + '</td><td>' + Math.round(r.vol) + '</td></tr>').join('') + '</tbody></table></div></section>';
  }
  h += sec('', li(e.archived ? 'Restaurar ejercicio' : 'Archivar ejercicio', { red: !e.archived, blue: e.archived, d: { act: 'exArchive' } }), e.archived ? '' : 'Archivar lo oculta de las listas y del selector, pero conserva todo su historial y sus récords.');
  return h;
}
function exDetail(id) {
  const o = openSheet({ title: 'Ejercicio', left: 'Cerrar', right: 'Editar', body: () => exDetailBody(id), ok: () => { const e = exById(id); if (e) exSheet(e); } });
  o.exId = id; o.live = true; return o;
}

/* ---------- biblioteca ---------- */
const catToEx = (c) => ({ id: c.id, name: c.name, muscle: c.muscle, secondary: c.secondary, equipment: c.equipment, note: '', repMin: c.repMin, repMax: c.repMax, restSec: c.restSec, howTo: c.tip });
function catalogSheet(opts) {
  opts = opts || {}; const cs = { mus: 'Todos' };
  const o = openSheet({
    title: 'Biblioteca', left: 'Cerrar',
    body: () => {
      const have = new Set(S.exercises.map((e) => e.id)), C = window.CATALOG || [], mus = cs.mus;
      const list = C.filter((c) => mus === 'Todos' || c.muscle === mus), pend = list.filter((c) => !have.has(c.id));
      let h = sec('', '<label class="li"><span class="t">Buscar</span><input id="catQ" data-lf=".cr" placeholder="Nombre, músculo o equipo" autocomplete="off" style="text-align:left"></label>');
      h += '<div class="chips">' + ['Todos'].concat(MUSCLES.filter((m) => C.some((c) => c.muscle === m))).map((m) => '<button class="chip ' + (mus === m ? 'on' : '') + '" data-act="catMus" data-v="' + esc(m) + '">' + esc(m) + '</button>').join('') + '</div>';
      if (mus !== 'Todos' && pend.length) h += sec('', li('Agregar los ' + pend.length + ' que faltan de ' + mus, { blue: 1, d: { act: 'catAddAll' } }));
      h += '<section class="sec" data-fg><div class="group">' + list.map((c) => '<div class="li cr" data-n="' + esc(norm(c.name + ' ' + c.muscle + ' ' + (c.equipment || ''))) + '"><span class="t">' + esc(c.name) + '<small>' + esc([c.muscle, c.equipment, c.repMin + '–' + c.repMax].join(' · ')) + '</small><small>' + esc(c.tip) + '</small></span>' +
        (have.has(c.id) ? '<span class="tag g">En tu biblioteca</span>' : '<button class="btn sm" data-act="catAdd" data-id="' + esc(c.id) + '">Agregar</button>') + '</div>').join('') + '</div></section>';
      return h + '<p class="muted small" style="margin:-8px 16px 0">' + C.length + ' ejercicios en la biblioteca. ¿Falta alguno? En Ejercicios usa «Pedir a Claude» o créalo con «Nuevo».</p>';
    }
  });
  o.cs = cs; o.onAdd = opts.onAdd;
  if (opts.q) { LFS.catQ = opts.q; drawSheet(o); }
  return o;
}

/* ---------- navegación y dibujo ---------- */
const TABS = [['train', 'Entrenar', IC.train], ['history', 'Progreso', IC.history], ['body', 'Cuerpo', IC.body], ['coach', 'Entrenador', IC.coach], ['more', 'Más', IC.more]];
function current() {
  if (view === 'train') return draft ? vSession() : vTrain();
  if (view === 'history') return vHistory();
  if (view === 'body') return vBody();
  if (view === 'coach') return vCoach();
  return vMore();
}
function go(v) { resetLF(); view = v; if (v !== 'more') moreSub = null; render(); window.scrollTo(0, 0); }
function closeAllSheets() { while (sheets.length) closeSheet(); document.querySelectorAll('.as-back').forEach((e) => e.remove()); }
function updateNav() { $('#nav').classList.toggle('scrolled', window.scrollY > 34); }
function render() {
  if (!authed) return;
  const page = $('#page'), y = window.scrollY, r = current();
  $('#nav').hidden = false; $('#tabbar').hidden = false;
  $('#navL').innerHTML = r.left || ''; $('#navT').textContent = r.small || r.title; $('#navR').innerHTML = r.right || '';
  page.innerHTML = '<h1 class="large">' + esc(r.title) + '</h1>' + syncBanner() + r.html;
  $('#tabs').innerHTML = TABS.map((t) => '<button class="tab ' + (t[0] === view ? 'on' : '') + '" data-act="tab" data-v="' + t[0] + '" ' + (t[0] === view ? 'aria-current="page"' : '') + '>' + t[2] + '<span>' + t[1] + '</span>' + (t[0] === 'train' && draft ? '<i class="dot"></i>' : '') + '</button>').join('');
  tickPill(); drawProg(); window.scrollTo(0, y); updateNav(); syncNavLayers(); restoreLF(page);
}
const typing = () => { const a = document.activeElement; return !!a && a !== document.body && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && $('#page').contains(a); };
let dirty = false;
function onDataChange() {
  if (!authed) return;
  if (typing() || drag) { dirty = true; return; }
  render(); sheets.forEach((o) => { const a = document.activeElement; if (o.live && !(a && o.el.contains(a) && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) drawSheet(o); });
}
document.addEventListener('focusout', () => { if (dirty) setTimeout(() => { if (!typing()) { dirty = false; render(); } }, 80); });
window.addEventListener('scroll', updateNav, { passive: true });

/* ---------- mini barra: tiempo entrenando + descanso (visible en todas las pestañas) ---------- */
const clock = (s) => Math.floor(s / 60) + ':' + pad(s % 60);
const elapsedStr = (ms) => { const t = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), sc = t % 60; return h ? h + ':' + pad(m) + ':' + pad(sc) : m + ':' + pad(sc); };
/* un ejercicio está terminado cuando todas sus series de trabajo están marcadas (el calentamiento no cuenta) */
const exDone = (en) => { const w = en.sets.filter(isWork); return w.length > 0 && w.every((x) => x.done); };
function persistRest() { if (draft) { draft.restUntil = restUntil; draft.restTotal = restTotal; saveDraft(true); } }
function ensureMini() {
  const el = $('#mini'); if (el.dataset.built) return el; el.dataset.built = '1';
  el.innerHTML = '<button class="mn-main" data-act="miniGo" aria-label="Volver a la sesión"><i class="mn-dot"></i><b class="mn-clk"></b><span class="mn-ex"></span></button>' +
    '<div class="mn-rest" hidden><svg class="mn-ring" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="12" class="bg"/><circle cx="15" cy="15" r="12" class="fg"/></svg><b class="mn-rt"></b><button data-act="restAdd" aria-label="Sumar 15 segundos">+15</button><button data-act="restSkip" aria-label="Omitir descanso">' + '✕' + '</button></div>';
  return el;
}
const setTx = (el, t) => { if (el.textContent !== t) el.textContent = t; };
let wasOver = false;
function tickPill() {
  const el = $('#mini'), pg = $('#page'); if (!el) return;
  if (!authed || !draft || draft.editing) { el.hidden = true; pg.classList.remove('pill'); return; }
  ensureMini(); el.hidden = false; pg.classList.add('pill');
  const n = draft.exercises.length, nd = draft.exercises.filter(exDone).length, cur = draft.exercises.findIndex((e) => !exDone(e));
  setTx($('.mn-clk', el), elapsedStr(Date.now() - new Date(draft.startedAt || Date.now())));
  setTx($('.mn-ex', el), !n ? 'Sin ejercicios' : cur < 0 ? 'Todo listo · toca Terminar' : draft.exercises[cur].name + ' · ' + nd + '/' + n);
  const rest = $('.mn-rest', el);
  if (restUntil > 0) {
    const rem = Math.ceil((restUntil - Date.now()) / 1000), over = rem <= 0;
    if (rem < -1800) { restUntil = 0; persistRest(); rest.hidden = true; el.classList.remove('over'); return; }
    rest.hidden = false; el.classList.toggle('over', over);
    setTx($('.mn-rt', rest), over ? '+' + clock(-rem) : clock(rem));
    $('.fg', rest).style.strokeDashoffset = String(75.4 * (over ? 0 : 1 - Math.max(0, Math.min(1, rem / (restTotal || 120)))));
    if (over && !wasOver) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 2600); }
    wasOver = over;
  } else { rest.hidden = true; el.classList.remove('over'); wasOver = false; }
}
setInterval(tickPill, 500);
/* línea fina bajo la barra superior: un segmento por ejercicio, se llena con sus series */
function drawProg() {
  const el = $('#prog'); if (!el) return;
  if (!authed || !draft || draft.editing || view !== 'train' || !draft.exercises.length) { el.hidden = true; return; }
  el.hidden = false;
  const fr = draft.exercises.map((en) => { const w = en.sets.filter(isWork); return w.length ? w.filter((x) => x.done).length / w.length : 0; });
  if (el.children.length === fr.length) { fr.forEach((f, i) => { el.children[i].firstChild.style.width = Math.round(f * 100) + '%'; }); return; }
  el.innerHTML = draft.exercises.map((en) => { const w = en.sets.filter(isWork), f = w.length ? w.filter((x) => x.done).length / w.length : 0; return '<i><b style="width:' + Math.round(f * 100) + '%"></b></i>'; }).join('');
}
function scheduleFold(en) {
  setTimeout(() => {
    if (!draft || !draft.exercises.includes(en) || !exDone(en) || en.collapsed) return;
    const ei = draft.exercises.indexOf(en), card = $('.xcard[data-xi="' + ei + '"]');
    const fin = () => {
      if (!draft || !exDone(en)) return;
      en.collapsed = true; saveDraft(true);
      if (typing()) { dirty = true; return; }
      render();
      const nx = draft.exercises.findIndex((e) => !exDone(e)), c = nx >= 0 ? $('.xcard[data-xi="' + nx + '"]') : null;
      if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); else if (nx < 0) toast('Último ejercicio listo. Toca Terminar para guardar.');
    };
    if (!card || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { fin(); return; }
    card.style.height = card.offsetHeight + 'px'; card.classList.add('folding'); void card.offsetHeight; card.style.height = '58px';
    setTimeout(fin, 340);
  }, 700);
}

/* ---------- acciones ---------- */
const ACT = {};
const entry = (el) => draft && draft.exercises[+el.dataset.ei];
const setOf = (el) => { const e = entry(el); return e && e.sets[+el.dataset.si]; };
const ensureFree = () => { if (draft) { toast('Ya tienes una sesión en curso. Termínala o descártala primero.'); view = 'train'; render(); return false; } return true; };

ACT.tab = (el) => { const v = el.dataset.v; if (v === view) { if (v === 'more') moreSub = null; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); } else go(v); };
ACT.sheetOk = () => { const o = topSheet(); if (o && o.ok) o.ok(o); };
ACT.sheetClose = () => closeSheet(topSheet());
ACT.syncNow = () => { toast('Sincronizando…'); D.sync().then(() => { toast(D.lastError ? D.lastError : 'Todo sincronizado'); render(); }); };
ACT.start = (el) => { if (!ensureFree()) return; const t = S.templates.find((x) => x.id === el.dataset.id); if (t) startSession(t); };
ACT.startFree = () => { if (ensureFree()) startSession(null); };
ACT.logPast = () => { if (!ensureFree()) return; const d = calDay; startSession(null); draft.date = d; saveDraft(true); render(); };
ACT.buildTog = (el) => { const v = el.dataset.v, i = buildSel.indexOf(v); if (i >= 0) buildSel.splice(i, 1); else buildSel.push(v); render(); };
ACT.buildGo = () => {
  if (!buildSel.length || !ensureFree()) return;
  const items = buildItems(buildSel); if (!items.length) { toast('No hay ejercicios para esos grupos. Agrégalos en Más → Ejercicios.'); return; }
  const name = buildSel.join(' + '); buildSel = []; startSession(null, { name: name, items: items });
};
ACT.openSess = (el) => sessSheet(el.dataset.id);
ACT.openTrash = () => trashSheet();
ACT.sessEdit = (el) => { const s = S.sessions.find((x) => x.id === el.dataset.id); if (s) editSession(s); };
ACT.sessRepeat = (el) => {
  if (!ensureFree()) return; const s = S.sessions.find((x) => x.id === el.dataset.id); if (!s) return;
  closeAllSheets(); const t = s.templateId && S.templates.find((x) => x.id === s.templateId);
  if (t) startSession(t);
  else startSession(null, { name: s.templateName, items: (s.exercises || []).map((e) => ({ exerciseId: e.exerciseId, sets: e.sets.filter(isWork).length || 3, repMin: e.repMin, repMax: e.repMax, restSec: e.restSec })) });
};
ACT.sessTrash = (el) => { const id = el.dataset.id; confirmAct('¿Mover esta sesión a la papelera? Dejará de contar en tus estadísticas y récords, pero podrás restaurarla.', 'Mover a la papelera', () => { D.trashSession(id); closeAllSheets(); toast('Sesión en la papelera'); render(); }); };
ACT.trashRestore = (el) => { D.restoreSession(el.dataset.id); toast('Sesión restaurada'); const o = topSheet(); if (o && o.live) drawSheet(o); render(); };

/* sesión en curso */
ACT.energy = (el) => { const n = +el.dataset.v; draft.energy = draft.energy === n ? null : n; saveDraft(true); render(); };
ACT.chk = (el) => {
  const en = entry(el), x = setOf(el); if (!x) return;
  if (!x.done) {
    const ex = exById(en.exerciseId) || {};
    if (x.w === '' || x.w == null) { const v = x.sw != null ? x.sw : x.pw; if (v != null) x.w = String(v); else if (ex.equipment === 'Peso corporal') x.w = '0'; }
    if (x.r === '' || x.r == null) { const v = x.sr != null ? x.sr : x.pr; if (v != null) x.r = String(v); }
    if (x.rir === '' || x.rir == null) { const v = x.srir != null ? x.srir : x.prir; if (v != null) x.rir = String(v); }
    if (num(x.w) == null || num(x.r) == null || num(x.r) <= 0) { toast('Escribe el peso y las repeticiones.'); const i = $('#' + (num(x.w) == null ? 'w' : 'r') + '-' + el.dataset.ei + '-' + el.dataset.si); if (i) i.focus(); return; }
    x.done = true;
    if ((x.type || 'N') !== 'W') { restTotal = en.restSec || 120; restUntil = Date.now() + restTotal * 1000; wasOver = false; draft.restUntil = restUntil; draft.restTotal = restTotal; }
  } else { x.done = false; en.collapsed = false; }
  saveDraft(true); render(); tickPill();
  if (x.done) {
    const b = $('.ck[data-ei="' + el.dataset.ei + '"][data-si="' + el.dataset.si + '"]');
    if (b) { b.classList.add('pop'); const r = b.closest('.sr'); if (r) r.classList.add('flash'); }
    if (exDone(en)) scheduleFold(en);
  }
};
ACT.unfold = (el) => { const en = entry(el); if (!en) return; en.collapsed = false; saveDraft(true); render(); const c = $('.xcard[data-xi="' + el.dataset.ei + '"]'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
ACT.miniGo = () => {
  const go2 = () => { const i = draft ? draft.exercises.findIndex((e) => !exDone(e)) : -1, c = i >= 0 ? $('.xcard[data-xi="' + i + '"]') : null; if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo({ top: 0, behavior: 'smooth' }); };
  if (view !== 'train') { go('train'); setTimeout(go2, 60); } else go2();
};
ACT.addSet = (el) => {
  const en = entry(el), l = en.sets[en.sets.length - 1];
  en.sets.push({ w: '', r: '', rir: '', type: 'N', done: false, pw: l ? (num(l.w) != null ? num(l.w) : l.pw) : null, pr: l ? (num(l.r) != null ? num(l.r) : l.pr) : null, prir: l ? (num(l.rir) != null ? num(l.rir) : l.prir) : null });
  saveDraft(true); render(); const i = $('#w-' + el.dataset.ei + '-' + (en.sets.length - 1)); if (i) i.focus();
};
ACT.setMenu = (el) => {
  const en = entry(el), x = setOf(el), ei = el.dataset.ei, si = +el.dataset.si;
  actionSheet('Tipo de serie', ['N', 'W', 'D', 'F'].map((t) => ({ label: (x.type || 'N') === t ? '✓ ' + SET_T[t].name : SET_T[t].name, fn: () => { x.type = t; saveDraft(true); render(); } })).concat([{ label: 'Eliminar serie', red: true, fn: () => { en.sets.splice(si, 1); if (!en.sets.length) draft.exercises.splice(+ei, 1); saveDraft(true); render(); } }]));
};
ACT.exMenu = (el) => {
  const ei = +el.dataset.ei, en = draft.exercises[ei], anyDone = en.sets.some((s) => s.done);
  actionSheet(en.name, [
    { label: 'Reemplazar ejercicio', fn: () => { if (anyDone) { toast('Ya hay series hechas. Quita el ejercicio o agrega otro.'); return; } pickEx((id) => { draft.exercises[ei] = newEntry(id, { sets: en.sets.length }); saveDraft(true); render(); }, 'Reemplazar por'); } },
    { label: 'Ver historial y récords', fn: () => exDetail(en.exerciseId) },
    { label: 'Cambiar rango de repeticiones', fn: () => actionSheet('Rango de repeticiones de hoy', [[4, 6], [5, 8], [6, 10], [8, 12], [10, 15], [12, 20], [15, 25]].map((r) => ({ label: (en.repMin === r[0] && en.repMax === r[1] ? '✓ ' : '') + r[0] + '–' + r[1] + ' reps', fn: () => { en.repMin = r[0]; en.repMax = r[1]; saveDraft(true); render(); } }))) },
    { label: 'Subir', fn: () => { if (ei > 0) { const t = draft.exercises[ei]; draft.exercises[ei] = draft.exercises[ei - 1]; draft.exercises[ei - 1] = t; saveDraft(true); render(); } } },
    { label: 'Bajar', fn: () => { if (ei < draft.exercises.length - 1) { const t = draft.exercises[ei]; draft.exercises[ei] = draft.exercises[ei + 1]; draft.exercises[ei + 1] = t; saveDraft(true); render(); } } },
    { label: 'Quitar ejercicio', red: true, fn: () => { const rm = () => { draft.exercises.splice(ei, 1); saveDraft(true); render(); }; if (anyDone) confirmAct('Se quitarán también sus series hechas.', 'Quitar ejercicio', rm); else rm(); } }
  ]);
};
ACT.addEx = () => {
  pickEx((id) => { draft.exercises.push(newEntry(id, {})); saveDraft(true); render(); const c = document.querySelectorAll('.xcard'); if (c.length) c[c.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 'Agregar ejercicio');
};
ACT.restPick = (el) => { const en = entry(el); actionSheet('Descanso objetivo', [45, 60, 90, 120, 150, 180, 240, 300].map((s) => ({ label: (en.restSec === s ? '✓ ' : '') + fmtRest(s), fn: () => { en.restSec = s; saveDraft(true); render(); } }))); };
ACT.restAdd = () => { restUntil = Math.max(restUntil, Date.now()) + 15000; restTotal = Math.max(restTotal, Math.ceil((restUntil - Date.now()) / 1000)); wasOver = false; persistRest(); tickPill(); };
ACT.restSkip = () => { restUntil = 0; persistRest(); tickPill(); };
ACT.finish = () => finishSession();
ACT.sessCancel = () => {
  if (draft.editing) { draft = null; saveDraft(true); render(); toast('Cambios descartados'); return; }
  if (!doneCount()) discardDraft(); else confirmAct('Se perderán las series de esta sesión y no quedará nada registrado.', 'Descartar sesión', discardDraft);
};
ACT.discardAsk = () => confirmAct('Se descartará la sesión y no quedará nada registrado.', 'Descartar sesión', discardDraft);
ACT.planSheet = () => planSheet();
ACT.planCopy = async () => { const t = planPrompt(), ok = await copyText(t); if (ok) toast('Copiado. Pégalo en Claude y vuelve con la respuesta.'); else promptSheet('Prompt del plan', t, 'No pude copiarlo solo: mantén presionado el texto, selecciónalo todo y cópialo.'); };
ACT.planApply = () => {
  const tx = $('#planIn'), n = applyPlan(tx ? tx.value : '');
  if (n) { closeSheet(topSheet()); render(); toast('Plan aplicado a ' + plural(n, 'ejercicio', 'ejercicios') + '. Los números azules son la propuesta.'); }
  else toast('No pude leer la respuesta. Pega solo el JSON que te dio Claude.');
};
ACT.schemaSql = () => schemaSheet();
ACT.sqlCopy = () => { const o = topSheet(); if (o && o.copy) o.copy(o); };
ACT.copyPrompt = () => { const o = topSheet(); if (o && o.copy) o.copy(o); };


/* ejercicios, biblioteca y fichas */
ACT.exDetail = (el) => exDetail(el.dataset.id);
ACT.exFav = () => { const o = topSheet(), e = o && exById(o.exId); if (!e) return; D.saveExercise(Object.assign({}, e, { favorite: !e.favorite })); toast(e.favorite ? 'Quitado de favoritos' : 'Marcado como favorito'); };
ACT.exArchive = () => {
  const o = topSheet(), e = o && exById(o.exId); if (!e) return;
  if (e.archived) { D.saveExercise(Object.assign({}, e, { archived: false })); toast('Ejercicio restaurado'); return; }
  confirmAct('Se ocultará de las listas y del selector. Su historial y sus récords se conservan y podrás restaurarlo.', 'Archivar ejercicio', () => { D.saveExercise(Object.assign({}, e, { archived: true })); closeSheet(o); toast('Ejercicio archivado'); render(); });
};
ACT.exMus = (el) => { exMus = el.dataset.v; render(); };
ACT.catOpen = () => catalogSheet();
ACT.catMus = (el) => { const o = topSheet(); o.cs.mus = el.dataset.v; drawSheet(o); };
ACT.catAdd = (el) => {
  const c = catById(el.dataset.id), o = topSheet(); if (!c || exById(c.id)) return;
  D.saveExercises([catToEx(c)]); toast(c.name + ' agregado');
  if (o && o.onAdd) { closeSheet(o); o.onAdd(c.id); } else if (o) drawSheet(o);
};
ACT.catAddAll = () => {
  const o = topSheet(), have = new Set(S.exercises.map((e) => e.id)), list = (window.CATALOG || []).filter((c) => (o.cs.mus === 'Todos' || c.muscle === o.cs.mus) && !have.has(c.id));
  if (!list.length) return; D.saveExercises(list.map(catToEx)); toast(plural(list.length, 'ejercicio agregado', 'ejercicios agregados')); drawSheet(o);
};
ACT.pickCat = () => { const o = topSheet(); if (o && o.catalog) o.catalog(); };


/* registrar con Claude */
ACT.importFood = () => importSheet('food');
ACT.importEx = () => importSheet('ex');
ACT.impCopy = async () => {
  const o = topSheet(); if (!o || !o.imp) return;
  const t = importPrompt(o.imp.kind), ok = await copyText(t);
  if (ok) { o.imp.copied = true; const b = $('[data-act=impCopy]', o.el); if (b) b.textContent = 'Copiado ✓'; toast('Copiado. Pégalo en un chat de Claude.'); }
  else { closeSheet(o); promptSheet('Prompt', t, 'No pude copiarlo solo: mantén presionado el texto, selecciónalo todo y cópialo.'); }
};
ACT.impParse = () => {
  const o = topSheet(); if (!o || !o.imp) return; const tx = $('#impIn', o.el), v = tx ? tx.value.trim() : '';
  if (!v) { toast('Pega primero la respuesta de Claude.'); return; }
  const P = parseImport(v); if (!P) { toast('No pude leer el JSON. Pega solo el bloque que te dio Claude.'); return; }
  o.imp.parsed = P; o.imp.mode = 'add'; importDraw(o); const b = $('.sheet-b', o.el); if (b) b.scrollTop = 0;
};
ACT.impBack = () => { const o = topSheet(); if (!o || !o.imp) return; o.imp.parsed = null; importDraw(o); };
ACT.impMode = (el) => { const o = topSheet(); if (!o || !o.imp) return; o.imp.mode = el.dataset.v; importDraw(o); };

/* peso, medidas y comida */
ACT.saveBwQuick = () => { const w = num(($('#bwq') || {}).value); if (w == null || w < 20 || w > 400) { toast('Escribe un peso válido en kg.'); return; } D.saveWeight(today(), w); toast('Peso guardado'); render(); };
ACT.saveBw = () => { const d = ($('#bwd') || {}).value || today(), w = num(($('#bwv') || {}).value); if (w == null || w < 20 || w > 400) { toast('Escribe un peso válido en kg.'); return; } D.saveWeight(d, w); toast('Peso guardado'); render(); };
ACT.delBw = (el) => { const d = el.dataset.id; confirmAct('¿Borrar el peso del ' + fmtDate(d) + '?', 'Borrar registro', () => { D.deleteWeight(d); render(); }); };
ACT.newMeas = () => measSheet(null);
ACT.measMenu = (el) => { const m = S.measurements.find((x) => x.date === el.dataset.id); if (!m) return; actionSheet('Medición del ' + fmtDate(m.date), [{ label: 'Editar', fn: () => measSheet(m) }, { label: 'Borrar', red: true, fn: () => confirmAct('¿Borrar esta medición?', 'Borrar medición', () => { D.deleteMeasurement(m.date); render(); }) }]); };
ACT.metric = (el) => { bodyMetric = el.dataset.v; render(); };
ACT.bodyTab = (el) => { bodyTab = el.dataset.v; render(); };
ACT.statP = (el) => { statP = +el.dataset.v; render(); };
ACT.statTop = (el) => { statTop = el.dataset.v; render(); };
ACT.histTab = (el) => { resetLF(); histTab = el.dataset.v; render(); };
ACT.meal = (el) => { foodMeal = el.dataset.v; render(); };
ACT.calDay = (el) => { calDay = el.dataset.v; render(); };
ACT.calNav = (el) => { const p = calMonth.split('-').map(Number), d = new Date(p[0], p[1] - 1 + (+el.dataset.v), 1); calMonth = d.getFullYear() + '-' + pad(d.getMonth() + 1); render(); };
function addFood(o) {
  D.saveFood({ id: uid(), date: foodDay, meal: foodMeal || defaultMeal(), desc: o.desc, kcal: o.kcal, p: o.p, c: o.c, f: o.f, at: new Date().toISOString() });
  toast('Agregado a ' + (foodMeal || '').toLowerCase()); render();
}
ACT.addFood = () => {
  const v = (id) => ($('#' + id) || {}).value, desc = (v('fdesc') || '').trim(), kcal = num(v('fk')), p = num(v('fp'));
  if (!desc && kcal == null) { toast('Escribe qué comiste o sus calorías.'); return; }
  addFood({ desc: desc || 'Sin descripción', kcal: kcal || 0, p: p || 0, c: num(v('fc')), f: num(v('ff')) });
};
ACT.foodAgain = (el) => { const e = recentFoods()[+el.dataset.i]; if (e) addFood({ desc: e.desc, kcal: e.kcal, p: e.p, c: e.c, f: e.f }); };
ACT.foodDel = (el) => { D.deleteFood(el.dataset.id); render(); };

/* entrenador */
ACT.preset = (el) => { const p = PRESETS[+el.dataset.i]; promptSheet(p[0], coachPrompt(p[1]), 'Cópialo y pégalo en un chat de Claude (o en tu agente). Responderá con tus números reales.'); };
ACT.coachFree = () => { const q = (coachQ || '').trim(); if (!q) { toast('Escribe tu pregunta primero.'); return; } promptSheet('Tu pregunta', coachPrompt(q), 'Cópialo y pégalo en un chat de Claude (o en tu agente).'); };

/* más */
ACT.moreGo = (el) => { resetLF(); moreSub = el.dataset.v; render(); window.scrollTo(0, 0); };
ACT.moreBack = () => { resetLF(); moreSub = null; render(); window.scrollTo(0, 0); };
ACT.newTpl = () => tplSheet(null);
ACT.tplEdit = (el) => { const t = S.templates.find((x) => x.id === el.dataset.id); if (t) tplSheet(t); };
ACT.tplRm = (el) => { tplEdit.items.splice(+el.dataset.i, 1); drawSheet(tplO); };
ACT.tplAddEx = () => pickEx((id) => { const d = exDef(id); tplEdit.items.push({ exerciseId: id, sets: d.sets, repMin: d.min, repMax: d.max }); drawSheet(tplO); });
ACT.tplDelete = () => { const id = tplEdit.id; confirmAct('¿Eliminar esta rutina? Tus sesiones ya registradas no se borran.', 'Eliminar rutina', () => { D.deleteTemplate(id); closeSheet(tplO); toast('Rutina eliminada'); render(); }); };
ACT.pickPick = (el) => { const o = topSheet(); if (o && o.pick) o.pick(el.dataset.id); };
ACT.pickNew = () => { const o = topSheet(); if (o && o.nuevo) o.nuevo(); };
ACT.exNew = () => exSheet(null);
ACT.exEdit = (el) => { const e = exById(el.dataset.id); if (e) exSheet(e); };
ACT.exSec = (el) => { const o = topSheet(), a = o.st.secondary, v = el.dataset.v, i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); el.classList.toggle('on', i < 0); };
ACT.exp = (el) => { const r = buildExport(el.dataset.v); shareFile(r[0], r[1], r[2]); };
ACT.saveSet = () => {
  const g = (id) => num(($('#' + id) || {}).value), mn = g('st_min') || 10, mx = g('st_max') || 20;
  if (mn > mx) { toast('El mínimo no puede ser mayor que el máximo.'); return; }
  D.saveSettings({ kcal: g('st_kcal'), protein: g('st_prot'), setMin: Math.round(mn), setMax: Math.round(mx) }); toast('Ajustes guardados'); moreSub = null; render();
};
ACT.copyDead = async () => { let d = '[]'; try { d = localStorage.getItem('bh.dead') || '[]'; } catch (e) {} toast((await copyText(d)) ? 'Detalle copiado' : 'No se pudo copiar'); };
ACT.logout = () => confirmAct(D.pending() ? 'Tienes ' + plural(D.pending(), 'cambio', 'cambios') + ' sin enviar. Si cierras sesión ahora se perderán.' : 'Tus datos quedan guardados en Supabase.', 'Cerrar sesión', async () => {
  const had = D.pending(); await D.signOut(); if (!had) D.clearLocal(); draft = null; saveDraft(true); authed = false; renderAuth('login');
});

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  const h = ACT[el.dataset.act]; if (h) h(el, e);
});


/* ---------- botón «atrás» ---------- */
let exitArm = 0, navReady = false;
const navLayerTab = { close: () => { view = 'train'; moreSub = null; render(); window.scrollTo(0, 0); } };
const navLayerMore = { close: () => { moreSub = null; render(); window.scrollTo(0, 0); } };
/* Mantiene en `layers` las capas de navegación que corresponden a la pantalla actual. */
function syncNavLayers() {
  layerDel(navLayerTab); layerDel(navLayerMore);
  if (view === 'more' && moreSub) layers.unshift(navLayerMore);
  if (view !== 'train') layers.unshift(navLayerTab);
}
function armHistory() {
  if (navReady) return; navReady = true;
  try { history.replaceState({ bh: 0 }, ''); history.pushState({ bh: 1 }, ''); } catch (e) {}
}
['pointerdown', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, armHistory, { once: true, passive: true }));
window.addEventListener('popstate', () => {
  if (!navReady) return;
  const l = layers[layers.length - 1];
  if (l) { l.close(); try { history.pushState({ bh: 1 }, ''); } catch (e) {} return; }
  if (authed && Date.now() - exitArm > 2500) { exitArm = Date.now(); toast('Desliza atrás otra vez para salir'); try { history.pushState({ bh: 1 }, ''); } catch (e) {} return; }
  exitArm = 0; try { history.back(); } catch (e) {}
});

/* ---------- arrastrar para reordenar (mantén presionado el asa) ---------- */
let drag = null;
const moveItem = (a, from, to) => { const x = a.splice(from, 1)[0]; a.splice(to, 0, x); };
document.addEventListener('pointerdown', (e) => {
  const g = e.target.closest ? e.target.closest('.grip') : null; if (!g || drag) return;
  const item = g.closest('[data-di]'); if (!item) return;
  e.preventDefault();
  const kind = item.dataset.di, parent = item.parentElement, compact = kind === 'sess', sc = item.closest('.sheet-b');
  if (compact) $('#page').classList.add('compact');
  const items = [].slice.call(parent.children).filter((c) => c.dataset.di === kind);
  const s0 = sc ? sc.scrollTop : window.scrollY, rects = items.map((c) => c.getBoundingClientRect()), from = items.indexOf(item), h = rects[from].height;
  const gap = items.length > 1 ? (from < items.length - 1 ? rects[from + 1].top - rects[from].bottom : rects[from].top - rects[from - 1].bottom) : 0;
  drag = { g: g, item: item, items: items, sc: sc, kind: kind, from: from, to: from, y0: e.clientY, cy: e.clientY, s0: s0, pid: e.pointerId,
    ctr: rects.map((r) => r.top + s0 + r.height / 2), shift: h + gap, off: compact ? e.clientY - (rects[from].top + h / 2) : 0, top0: rects[from].top };
  try { g.setPointerCapture(e.pointerId); } catch (x) {}
  item.classList.add('dragging'); items.forEach((c) => { if (c !== item) c.classList.add('shifty'); });
  document.body.classList.add('dragging-now');
  try { navigator.vibrate && navigator.vibrate(8); } catch (x) {}
  dragLoop();
});
document.addEventListener('pointermove', (e) => { if (drag && e.pointerId === drag.pid) { drag.cy = e.clientY; e.preventDefault(); } }, { passive: false });
function dragLoop() {
  const d = drag; if (!d) return;
  const box = d.sc ? d.sc.getBoundingClientRect() : { top: 56, bottom: window.innerHeight - 60 };
  let v = 0; const edge = 80;
  if (d.cy < box.top + edge) v = -Math.ceil((box.top + edge - d.cy) / 5); else if (d.cy > box.bottom - edge) v = Math.ceil((d.cy - (box.bottom - edge)) / 5);
  if (v) { v = Math.max(-20, Math.min(20, v)); if (d.sc) d.sc.scrollTop += v; else window.scrollBy(0, v); }
  const sNow = d.sc ? d.sc.scrollTop : window.scrollY, dy = (d.cy - d.y0) + (sNow - d.s0) + d.off;
  d.item.style.transform = 'translateY(' + dy + 'px)';
  const mine = d.ctr[d.from] + dy - d.off * 0; let to = 0;
  d.ctr.forEach((c, i) => { if (i !== d.from && c < mine) to++; });
  d.to = to;
  d.items.forEach((c, i) => {
    if (i === d.from) return;
    let t = 0; if (d.from < to && i > d.from && i <= to) t = -d.shift; else if (d.from > to && i >= to && i < d.from) t = d.shift;
    c.style.transform = t ? 'translateY(' + t + 'px)' : '';
  });
  d.raf = requestAnimationFrame(dragLoop);
}
function dragEnd(e) {
  const d = drag; if (!d || (e && e.pointerId !== d.pid)) return;
  drag = null; cancelAnimationFrame(d.raf);
  d.items.forEach((c) => { c.style.transform = ''; c.classList.remove('shifty', 'dragging'); });
  document.body.classList.remove('dragging-now'); $('#page').classList.remove('compact');
  if (d.to === d.from) { render(); return; }
  if (d.kind === 'sess' && draft) { moveItem(draft.exercises, d.from, d.to); saveDraft(true); render(); const c = document.querySelectorAll('.xcard')[d.to]; if (c) c.scrollIntoView({ block: 'center' }); }
  else if (d.kind === 'tpl' && tplEdit) { moveItem(tplEdit.items, d.from, d.to); drawSheet(tplO); }
  else if (d.kind === 'routine') { const list = S.templates.slice(); moveItem(list, d.from, d.to); D.reorderTemplates(list); render(); }
}
document.addEventListener('pointerup', dragEnd); document.addEventListener('pointercancel', dragEnd);
document.addEventListener('contextmenu', (e) => { if (e.target.closest && e.target.closest('.grip')) e.preventDefault(); });

/* ---------- campos ---------- */
function bindSet(key, val) {
  if (key === 'coachQ') { coachQ = val; return; }
  const p = key.split(':'), ns = p[0], f = p[1];
  if (ns === 'sess' && draft) { if (f === 'date' && !val) return; draft[f] = val; saveDraft(); }
  else if (ns === 'tpl' && tplEdit) tplEdit[f] = val;
  else if (ns === 'ex' || ns === 'meas' || ns === 'cat') { const o = topSheet(); if (o && o.st) o.st[f] = val; }
}
document.addEventListener('input', (e) => {
  const t = e.target, d = t.dataset || {};
  if (d.lf) { LFS[t.id] = t.value; applyLF(t); }
  if (d.f && draft) { const s = draft.exercises[+d.ei].sets[+d.si]; if (s) { s[d.f] = t.value; saveDraft(); } return; }
  if (d.bind) bindSet(d.bind, t.value);
  else if (d.tf && tplEdit) tplEdit.items[+d.i][d.tf] = t.value;
  else if (d.mf) { const o = topSheet(); if (o && o.st) o.st.vals[d.mf] = t.value; }
});
document.addEventListener('change', (e) => {
  const t = e.target, d = t.dataset || {};
  if (d.bind) bindSet(d.bind, t.type === 'checkbox' ? t.checked : t.value);
  else if (d.sel === 'histEx') { histEx = t.value; render(); }
  else if (d.sel === 'fday') { foodDay = t.value || today(); render(); }
});
document.addEventListener('focusin', (e) => { const t = e.target; if (t.matches && t.matches('.sr input, .cfg input')) setTimeout(() => { try { t.select(); } catch (x) {} }, 0); });
document.addEventListener('keydown', (e) => {
  const t = e.target; if (e.key !== 'Enter' || !t.matches || !t.matches('.sr input')) return;
  e.preventDefault(); const d = t.dataset;
  if (d.f === 'w') { const n = $('#r-' + d.ei + '-' + d.si); if (n) n.focus(); }
  else if (d.f === 'r') { const n = $('#i-' + d.ei + '-' + d.si); if (n) n.focus(); }
  else { const b = t.closest('.sr').querySelector('.ck'); t.blur(); if (b && !t.closest('.sr').classList.contains('done')) b.click(); }
});

/* ---------- pantallas de acceso ---------- */
function renderAuth(mode, msg, prefill) {
  authed = false; closeAllSheets(); const mn = $('#mini'); if (mn) mn.hidden = true;
  $('#nav').hidden = true; $('#tabbar').hidden = true; $('#page').classList.remove('pill');
  const logo = '<img class="logo" src="icons/icon-180.png" alt="">';
  let h;
  if (mode === 'setup') {
    const c = prefill || D.config() || {};
    h = logo + '<h1>Conectar con Supabase</h1><p>Pega los dos datos de tu proyecto (Project Settings → API). Se guardan solo en este teléfono.</p>' +
      (msg ? '<p class="err">' + esc(msg) + '</p>' : '') +
      '<div class="group"><label class="li"><span class="t">URL</span><input id="cfgUrl" type="url" inputmode="url" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="https://xxxx.supabase.co" value="' + esc(c.url || '') + '" style="text-align:left"></label>' +
      '<label class="li"><span class="t">Clave</span><input id="cfgKey" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="anon public" value="' + esc(c.key || '') + '" style="text-align:left"></label></div>' +
      '<button class="btn" data-act="cfgSave">Continuar</button><p class="muted small" style="margin-top:16px">Si prefieres no escribir esto en el teléfono, edita el archivo config.js antes de subir la app.</p>';
  } else if (mode === 'nolib') {
    h = logo + '<h1>Falta un archivo</h1><p>No se cargó vendor/supabase.js. Revisa que subiste la carpeta completa de la app y vuelve a abrirla.</p><button class="btn" data-act="reload">Reintentar</button>';
  } else {
    h = logo + '<h1>Bitácora de Hierro</h1><p>Entra con tu cuenta para ver tus entrenamientos.</p>' +
      (msg ? '<p class="err">' + esc(msg) + '</p>' : '') +
      '<form id="loginForm" novalidate><div class="group"><label class="li"><span class="t">Correo</span><input id="lgEmail" type="email" name="username" autocomplete="username" autocapitalize="off" autocorrect="off" inputmode="email" placeholder="tu@correo.com" style="text-align:left" value="' + esc((D.user && D.user.email) || (function () { try { return (JSON.parse(localStorage.getItem('bh.user') || 'null') || {}).email || ''; } catch (e) { return ''; } })()) + '"></label>' +
      '<label class="li"><span class="t">Contraseña</span><input id="lgPass" type="password" name="password" autocomplete="current-password" placeholder="Requerida" style="text-align:left"></label></div>' +
      '<button class="btn" id="lgBtn" type="submit">Entrar</button></form><button class="nb" data-act="cfgOpen" style="margin:14px auto 0;font-size:15px;color:var(--label2)">Configurar conexión</button>';
  }
  $('#page').innerHTML = '<div class="auth">' + h + '</div>'; window.scrollTo(0, 0);
}
ACT.reload = () => location.reload();
ACT.cfgOpen = () => renderAuth('setup');
ACT.cfgSave = () => {
  const url = ($('#cfgUrl').value || '').trim().replace(/\/+$/, ''), key = ($('#cfgKey').value || '').trim();
  if (!/^https:\/\/[^\s]+\.[a-z]/i.test(url)) { renderAuth('setup', 'La URL debe empezar con https:// (por ejemplo https://abcd.supabase.co).', { url: url, key: key }); return; }
  if (key.length < 20) { renderAuth('setup', 'La clave parece incompleta. Copia la “anon public” completa.', { url: url, key: key }); return; }
  D.saveConfig(url, key); boot();
};
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'loginForm') return; e.preventDefault();
  const em = $('#lgEmail').value.trim(), pw = $('#lgPass').value, b = $('#lgBtn');
  if (!em || !pw) { renderAuth('login', 'Escribe tu correo y tu contraseña.'); return; }
  b.disabled = true; b.textContent = 'Entrando…';
  try { await D.signIn(em, pw); afterLogin(); }
  catch (err) {
    const m = String((err && err.message) || err);
    renderAuth('login', /invalid login|invalid credentials/i.test(m) ? 'Correo o contraseña incorrectos.' : /fetch|network|failed|load/i.test(m) ? 'Sin conexión. La primera vez necesitas internet para entrar.' : /confirm/i.test(m) ? 'Tu correo aún no está confirmado en Supabase.' : m);
  }
});

/* ---------- arranque ---------- */
function maybeSeed() {
  if (!D.user) return; const k = 'bh.seeded.' + D.user.id; let done = null; try { done = localStorage.getItem(k); } catch (e) {}
  if (done || !D.lastSync || D.lastError || D.pending()) return;
  try { localStorage.setItem(k, '1'); } catch (e) {}
  if (D.isEmpty()) { D.seedStarter(); toast('Cargué una biblioteca de ejercicios y 4 rutinas para empezar. Edítalas a tu gusto.'); render(); }
}
async function afterLogin() {
  authed = true; D.onChange = onDataChange;
  D.onAuth = (ok) => { if (!ok && authed) renderAuth('login', 'Tu sesión venció. Vuelve a entrar.'); };
  draft = D.loadDraft(); if (draft && !Array.isArray(draft.exercises)) draft = null; restUntil = draft ? (draft.restUntil || 0) : 0; restTotal = draft ? (draft.restTotal || 0) : 0;
  view = 'train'; moreSub = null; render(); window.scrollTo(0, 0);
  try { await D.sync(); } catch (e) {}
  maybeSeed(); render();
}
async function boot() {
  $('#page').innerHTML = '<div class="spin" aria-label="Cargando"></div>';
  let st = 'login'; try { st = await D.init(); } catch (e) { console.error(e); }
  if (st === 'setup' || st === 'nolib' || st === 'login') return renderAuth(st);
  afterLogin();
}
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
boot();
})();
