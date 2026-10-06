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
  back: '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2L2 10l8 8"/></svg>'
};

/* ---------- estado de la interfaz ---------- */
let authed = false, view = 'train', draft = null;
let histTab = 'sessions', histEx = null, bodyTab = 'weight', bodyMetric = 'waist', moreSub = null;
let buildSel = [], foodDay = today(), foodMeal = null, calMonth = today().slice(0, 7), calDay = today();
let tplEdit = null, restUntil = 0, restTotal = 0, restHidden = false, coachQ = '';

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
  o.el = el; o.id = uid();
  el.addEventListener('click', (e) => { if (e.target === el && o.dismiss !== false) closeSheet(o); });
  $('#layer').appendChild(el);
  sheets.push(o);
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
  if (o.onDraw) o.onDraw(o);
}
function closeSheet(o) {
  o = o || sheets[sheets.length - 1]; if (!o) return;
  const i = sheets.indexOf(o); if (i >= 0) sheets.splice(i, 1);
  if (o.el) o.el.remove();
  if (o.onClose) o.onClose();
}
const topSheet = () => sheets[sheets.length - 1];

function actionSheet(title, actions) {
  const el = document.createElement('div'); el.className = 'as-back';
  el.innerHTML = '<div class="as"><div class="g">' + (title ? '<div class="tt">' + esc(title) + '</div>' : '') +
    actions.map((a, i) => '<button data-i="' + i + '" class="' + (a.red ? 'red ' : '') + (a.bold ? 'b' : '') + '">' + esc(a.label) + '</button>').join('') +
    '</div><div class="g"><button class="b" data-i="-1">Cancelar</button></div></div>';
  el.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b || e.target === el) {
      const i = b ? +b.dataset.i : -1; el.remove();
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
function newEntry(exId, it) {
  it = it || {};
  const ex = exById(exId) || {}, last = lastFor(exId);
  const n = it.sets || (last ? last.sets.length : 3), sets = [];
  for (let i = 0; i < n; i++) {
    const p = last ? (last.sets[i] || last.sets[last.sets.length - 1]) : null;
    sets.push({ w: '', r: '', rir: '', type: 'N', done: false, pw: p ? p.w : null, pr: p ? p.r : null, prir: p ? p.rir : null });
  }
  return { exerciseId: exId, name: ex.name || 'Ejercicio', muscle: ex.muscle || '', repMin: it.repMin || null, repMax: it.repMax || null, restSec: it.restSec || (it.repMax && it.repMax <= 8 ? 180 : 120), sets };
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
  D.saveSession({
    id: draft.id, date: draft.date, startedAt: draft.startedAt, endedAt: end, durationMin: dur, templateId: draft.templateId, templateName: draft.templateName,
    kind: draft.kind || 'rutina', muscles: [...new Set(exs.map((e) => e.muscle))], energy: draft.energy, sleepH: num(draft.sleepH), notes: draft.notes || '',
    revision: draft.editing ? (draft.revision || 1) + 1 : 1, createdAt: draft.createdAt, exercises: exs
  });
  const sets = exs.reduce((a, e) => a + e.sets.filter(isWork).length, 0), vol = exs.reduce((a, e) => a + e.sets.filter(isWork).reduce((b, x) => b + x.w * x.r, 0), 0);
  const wasEdit = draft.editing; draft = null; restUntil = 0; saveDraft(true);
  toast(wasEdit ? 'Sesión actualizada' : 'Sesión guardada · ' + plural(sets, 'serie', 'series') + ' · ' + Math.round(vol).toLocaleString('es-MX') + ' kg');
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
    S.exercises.filter((e) => e.muscle === g && !ids.includes(e.id)).forEach((e) => ids.push(e.id));
    ids.slice(0, per).forEach((id) => {
      let tpl = null; S.templates.forEach((t) => (t.items || []).forEach((it) => { if (it.exerciseId === id && !tpl) tpl = it; }));
      items.push(tpl ? Object.assign({}, tpl) : { exerciseId: id, sets: 3, repMin: 8, repMax: 12 });
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
  return '';
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
    h += '<section class="xcard"><div class="xh"><h3>' + esc(en.name) + '<div class="sub" style="font-weight:400">' + esc(en.muscle || '') + '</div></h3><button class="more" data-act="exMenu" data-ei="' + ei + '" aria-label="Opciones del ejercicio">' + IC.dots + '</button></div>' +
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

/* ---------- Progreso ---------- */
function vHistory() {
  let h = '';
  const n30 = S.sessions.filter((s) => daysBetween(s.date, today()) < 30).length;
  const wk = setsByMuscle(7), from7 = isoDay(new Date(Date.now() - 6 * 864e5)), tot = S.sessions.filter((x) => x.date >= from7).reduce((a, x) => a + (x.exercises || []).reduce((b, e) => b + e.sets.filter(isWork).length, 0), 0);
  h += tiles([['Sesiones 30 d', n30], ['Series 7 d', tot], ['Sesiones totales', S.sessions.length]]);
  if (wk.length) {
    const mx = Math.max(TARGET.max * 1.25, Math.max.apply(null, wk.map((x) => x[1])));
    h += sec('Series efectivas por grupo · 7 días',
      '<div class="bars">' + wk.map((k) => { const v = k[1], st = v < TARGET.min ? 'lo' : v > TARGET.max ? 'hi' : ''; return '<div class="bar"><span>' + esc(k[0]) + '</span><span class="trk"><b style="left:' + TARGET.min / mx * 100 + '%;width:' + (TARGET.max - TARGET.min) / mx * 100 + '%"></b><i class="' + st + '" style="width:' + Math.min(100, v / mx * 100) + '%"></i></span><span class="num" style="text-align:right">' + f1(v) + '</span></div>'; }).join('') + '</div>',
      'Entre las líneas punteadas está tu meta de ' + TARGET.min + ' a ' + TARGET.max + ' series por semana. El músculo secundario cuenta media serie y el calentamiento no cuenta.');
  }
  h += seg([['sessions', 'Sesiones'], ['exercise', 'Ejercicio'], ['records', 'Récords'], ['calendar', 'Calendario']], histTab, 'histTab');
  if (histTab === 'records') h += vRecords();
  else if (histTab === 'calendar') h += vCalendar();
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
  if (rs.length) {
    const recent = rs.filter((r) => daysBetween(r.e1.date, today()) <= 14);
    if (recent.length) h += '<div class="banner" style="background:var(--green-t)"><span><b>Récords de las últimas 2 semanas:</b> ' + recent.map((r) => esc(r.name) + ' ' + f1(r.e1.v) + ' kg').join(' · ') + '</span></div>';
    h += sec('Fuerza', rs.map((r) => '<div class="rec"><div><b>' + esc(r.name) + '</b><small>Máx ' + f1(r.mw.w) + ' kg × ' + r.mw.r + ' (' + shortD(r.mw.date) + ')<br>Mejor volumen ' + Math.round(r.vol.v).toLocaleString('es-MX') + ' kg</small></div><div class="v">' + f1(r.e1.v) + '<small>e1RM · ' + shortD(r.e1.date) + '</small></div></div>').join(''), 'Solo cuentan las series efectivas (sin calentamiento).');
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
  h += tiles([['Sesiones', monthS.length], ['Días con comida', [...fd].filter((d) => d.startsWith(calMonth)).length], ['Por semana', f1(monthS.length / (dim / 7))]]);
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
      sec('Orden de rotación', S.templates.map((t, i) => '<div class="li"><button class="t" data-act="tplEdit" data-id="' + esc(t.id) + '">' + (i + 1) + '. ' + esc(t.name) + '<small>' + plural((t.items || []).length, 'ejercicio', 'ejercicios') + '</small></button><span class="mvs"><button class="mv" data-act="tplMove" data-id="' + esc(t.id) + '" data-d="-1" aria-label="Subir en la rotación"' + (i === 0 ? ' disabled' : '') + '>↑</button><button class="mv" data-act="tplMove" data-id="' + esc(t.id) + '" data-d="1" aria-label="Bajar en la rotación"' + (i === S.templates.length - 1 ? ' disabled' : '') + '>↓</button></span></div>').join(''),
        'La app sugiere la siguiente rutina según este orden. Solo las sesiones hechas con una rutina avanzan la rotación; las sesiones por grupos o libres no la mueven. Toca una rutina para editarla.') };
  }
  if (moreSub === 'exercises') {
    let h = '';
    MUSCLES.forEach((m) => {
      const xs = S.exercises.filter((e) => e.muscle === m); if (!xs.length) return;
      h += sec(m, xs.map((e) => li(esc(e.name), { sub: esc([e.equipment].concat((e.secondary || []).length ? ['también: ' + e.secondary.join(', ')] : []).filter(Boolean).join(' · ')), chev: 1, d: { act: 'exEdit', id: e.id } })).join(''));
    });
    return { title: 'Ejercicios', left: back, right: '<button class="nb b" data-act="exNew">Nuevo</button>', html: (h || emptyBox('Sin ejercicios', 'Agrega tu primer ejercicio.')) + '<p class="muted small" style="margin:-8px 16px 24px">Los ejercicios no se borran para no perder el historial de tus sesiones.</p>' };
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
      sec('', li('Sincronizar ahora', { blue: 1, d: { act: 'syncNow' } }) + (dead.length ? li('Cambios que no se pudieron guardar (' + dead.length + ')', { sub: 'Toca para copiar el detalle', blue: 1, d: { act: 'copyDead' } }) : '')) +
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
        return '<div class="li col"><div class="row between"><b>' + esc(e ? e.name : '(ejercicio borrado)') + '</b><span class="mvs"><button class="mv" data-act="tplUp" data-i="' + i + '" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>↑</button><button class="mv" data-act="tplDn" data-i="' + i + '" aria-label="Bajar"' + (i === tplEdit.items.length - 1 ? ' disabled' : '') + '>↓</button><button class="mv red" data-act="tplRm" data-i="' + i + '" aria-label="Quitar">✕</button></span></div>' +
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
      let h = sec('', '<label class="li"><span class="t">Buscar</span><input id="pickQ" placeholder="Nombre del ejercicio" autocomplete="off" style="text-align:left"></label>') + sec('', li('Crear ejercicio nuevo', { blue: 1, d: { act: 'pickNew' } }));
      MUSCLES.forEach((m) => {
        const xs = S.exercises.filter((e) => e.muscle === m); if (!xs.length) return;
        h += '<div class="pgroup">' + sec(m, xs.map((e) => '<button class="li pk" data-n="' + esc(norm(e.name)) + '" data-act="pickPick" data-id="' + esc(e.id) + '"><span class="t">' + esc(e.name) + '<small>' + esc(e.equipment || '') + '</small></span></button>').join('')) + '</div>';
      });
      return h;
    }
  });
  o.pick = (id) => { closeSheet(o); cb(id); };
  o.nuevo = () => exSheet(null, (id) => { closeSheet(o); cb(id); });
  return o;
}
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function filterPick(q) {
  const o = topSheet(); if (!o || !o.el) return; const k = norm(q.trim());
  o.el.querySelectorAll('.pk').forEach((b) => { b.hidden = !!k && !b.dataset.n.includes(k); });
  o.el.querySelectorAll('.pgroup').forEach((g) => { g.hidden = !g.querySelector('.pk:not([hidden])'); });
}

function exSheet(ex, cb) {
  const st = { id: ex ? ex.id : null, name: ex ? ex.name : '', muscle: ex ? ex.muscle : 'Pecho', equipment: ex ? ex.equipment || '' : '', secondary: ex ? (ex.secondary || []).slice() : [], note: ex ? ex.note || '' : '' };
  const o = openSheet({
    title: ex ? 'Editar ejercicio' : 'Nuevo ejercicio', right: 'Guardar',
    body: () => sec('', '<label class="li"><span class="t">Nombre</span><input data-bind="ex:name" value="' + esc(st.name) + '" placeholder="Press banca con barra" autocomplete="off"></label>' +
      '<label class="li"><span class="t">Grupo principal</span><select data-bind="ex:muscle">' + MUSCLES.map((m) => '<option ' + (m === st.muscle ? 'selected' : '') + '>' + m + '</option>').join('') + '</select></label>' +
      '<label class="li"><span class="t">Equipo</span><select data-bind="ex:equipment"><option value="">—</option>' + EQUIP.map((m) => '<option ' + (m === st.equipment ? 'selected' : '') + '>' + m + '</option>').join('') + '</select></label>') +
      sec('Músculos secundarios', '<div class="chips wrapc" style="padding:12px 12px">' + MUSCLES.filter((m) => m !== 'Otro').map((m) => '<button class="chip ' + (st.secondary.includes(m) ? 'on' : '') + '" data-act="exSec" data-v="' + m + '">' + m + '</button>').join('') + '</div>', 'Cuentan media serie en tu volumen semanal.') +
      sec('Nota', '<div class="pad"><textarea class="field" data-bind="ex:note" placeholder="Ajuste de asiento, agarre, técnica…">' + esc(st.note) + '</textarea></div>', 'Aparece como recordatorio dentro de la sesión.'),
    ok: () => {
      const name = st.name.trim(); if (!name) { toast('Ponle un nombre al ejercicio.'); return; }
      let id = st.id;
      if (!id) { id = slug(name); if (exById(id)) id += '-' + uid().slice(-3); }
      const prev = exById(id);
      D.saveExercise({ id: id, name: name, muscle: st.muscle, secondary: st.secondary.filter((m) => m !== st.muscle), equipment: st.equipment || null, note: st.note.trim(), createdAt: prev ? prev.createdAt : null });
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

/* ---------- navegación y dibujo ---------- */
const TABS = [['train', 'Entrenar', IC.train], ['history', 'Progreso', IC.history], ['body', 'Cuerpo', IC.body], ['coach', 'Entrenador', IC.coach], ['more', 'Más', IC.more]];
function current() {
  if (view === 'train') return draft ? vSession() : vTrain();
  if (view === 'history') return vHistory();
  if (view === 'body') return vBody();
  if (view === 'coach') return vCoach();
  return vMore();
}
function go(v) { view = v; if (v !== 'more') moreSub = null; render(); window.scrollTo(0, 0); }
function closeAllSheets() { while (sheets.length) closeSheet(); document.querySelectorAll('.as-back').forEach((e) => e.remove()); }
function updateNav() { $('#nav').classList.toggle('scrolled', window.scrollY > 34); }
function render() {
  if (!authed) return;
  const page = $('#page'), y = window.scrollY, r = current();
  $('#nav').hidden = false; $('#tabbar').hidden = false;
  $('#navL').innerHTML = r.left || ''; $('#navT').textContent = r.small || r.title; $('#navR').innerHTML = r.right || '';
  page.innerHTML = '<h1 class="large">' + esc(r.title) + '</h1>' + syncBanner() + r.html;
  $('#tabs').innerHTML = TABS.map((t) => '<button class="tab ' + (t[0] === view ? 'on' : '') + '" data-act="tab" data-v="' + t[0] + '" ' + (t[0] === view ? 'aria-current="page"' : '') + '>' + t[2] + '<span>' + t[1] + '</span>' + (t[0] === 'train' && draft ? '<i class="dot"></i>' : '') + '</button>').join('');
  tickPill(); window.scrollTo(0, y); updateNav();
}
const typing = () => { const a = document.activeElement; return !!a && a !== document.body && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && $('#page').contains(a); };
let dirty = false;
function onDataChange() {
  if (!authed) return;
  if (typing()) { dirty = true; return; }
  render(); sheets.forEach((o) => { if (o.live && !(document.activeElement && o.el.contains(document.activeElement))) drawSheet(o); });
}
document.addEventListener('focusout', () => { if (dirty) setTimeout(() => { if (!typing()) { dirty = false; render(); } }, 80); });
window.addEventListener('scroll', updateNav, { passive: true });

/* ---------- temporizador de descanso ---------- */
const clock = (s) => Math.floor(s / 60) + ':' + pad(s % 60);
let buzzed = false;
function pillOn() { return !!draft && view === 'train' && restUntil > 0 && !restHidden; }
function tickPill() {
  let el = $('#restpill');
  if (!pillOn()) { if (el) el.remove(); $('#page').classList.remove('pill'); return; }
  const rem = Math.ceil((restUntil - Date.now()) / 1000);
  if (rem < -8) { restUntil = 0; if (el) el.remove(); $('#page').classList.remove('pill'); return; }
  if (!el) {
    el = document.createElement('div'); el.id = 'restpill'; el.className = 'restpill'; el.setAttribute('role', 'timer');
    el.innerHTML = '<span class="tm"></span><button data-act="restAdd">+15 s</button><button data-act="restSkip">Omitir</button>';
    document.body.appendChild(el); buzzed = false;
  }
  el.classList.toggle('over', rem <= 0);
  $('.tm', el).textContent = rem > 0 ? clock(rem) : '¡Listo!';
  if (rem <= 0 && !buzzed) { buzzed = true; try { navigator.vibrate && navigator.vibrate([180, 80, 180]); } catch (e) {} }
  $('#page').classList.add('pill');
}
setInterval(tickPill, 500);

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
    if ((x.type || 'N') !== 'W') { restTotal = en.restSec || 120; restUntil = Date.now() + restTotal * 1000; restHidden = false; }
  } else x.done = false;
  saveDraft(true); render();
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
    { label: 'Reemplazar ejercicio', fn: () => { if (anyDone) { toast('Ya hay series hechas. Quita el ejercicio o agrega otro.'); return; } pickEx((id) => { draft.exercises[ei] = newEntry(id, { sets: en.sets.length, repMin: en.repMin, repMax: en.repMax, restSec: en.restSec }); saveDraft(true); render(); }, 'Reemplazar por'); } },
    { label: 'Subir', fn: () => { if (ei > 0) { const t = draft.exercises[ei]; draft.exercises[ei] = draft.exercises[ei - 1]; draft.exercises[ei - 1] = t; saveDraft(true); render(); } } },
    { label: 'Bajar', fn: () => { if (ei < draft.exercises.length - 1) { const t = draft.exercises[ei]; draft.exercises[ei] = draft.exercises[ei + 1]; draft.exercises[ei + 1] = t; saveDraft(true); render(); } } },
    { label: 'Quitar ejercicio', red: true, fn: () => { const rm = () => { draft.exercises.splice(ei, 1); saveDraft(true); render(); }; if (anyDone) confirmAct('Se quitarán también sus series hechas.', 'Quitar ejercicio', rm); else rm(); } }
  ]);
};
ACT.addEx = () => {
  pickEx((id) => { draft.exercises.push(newEntry(id, { sets: 3, repMin: 8, repMax: 12 })); saveDraft(true); render(); const c = document.querySelectorAll('.xcard'); if (c.length) c[c.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 'Agregar ejercicio');
};
ACT.restPick = (el) => { const en = entry(el); actionSheet('Descanso objetivo', [45, 60, 90, 120, 150, 180, 240, 300].map((s) => ({ label: (en.restSec === s ? '✓ ' : '') + fmtRest(s), fn: () => { en.restSec = s; saveDraft(true); render(); } }))); };
ACT.restAdd = () => { restUntil = Math.max(restUntil, Date.now()) + 15000; buzzed = false; tickPill(); };
ACT.restSkip = () => { restUntil = 0; tickPill(); };
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
ACT.copyPrompt = () => { const o = topSheet(); if (o && o.copy) o.copy(o); };

/* peso, medidas y comida */
ACT.saveBwQuick = () => { const w = num(($('#bwq') || {}).value); if (w == null || w < 20 || w > 400) { toast('Escribe un peso válido en kg.'); return; } D.saveWeight(today(), w); toast('Peso guardado'); render(); };
ACT.saveBw = () => { const d = ($('#bwd') || {}).value || today(), w = num(($('#bwv') || {}).value); if (w == null || w < 20 || w > 400) { toast('Escribe un peso válido en kg.'); return; } D.saveWeight(d, w); toast('Peso guardado'); render(); };
ACT.delBw = (el) => { const d = el.dataset.id; confirmAct('¿Borrar el peso del ' + fmtDate(d) + '?', 'Borrar registro', () => { D.deleteWeight(d); render(); }); };
ACT.newMeas = () => measSheet(null);
ACT.measMenu = (el) => { const m = S.measurements.find((x) => x.date === el.dataset.id); if (!m) return; actionSheet('Medición del ' + fmtDate(m.date), [{ label: 'Editar', fn: () => measSheet(m) }, { label: 'Borrar', red: true, fn: () => confirmAct('¿Borrar esta medición?', 'Borrar medición', () => { D.deleteMeasurement(m.date); render(); }) }]); };
ACT.metric = (el) => { bodyMetric = el.dataset.v; render(); };
ACT.bodyTab = (el) => { bodyTab = el.dataset.v; render(); };
ACT.histTab = (el) => { histTab = el.dataset.v; render(); };
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
ACT.moreGo = (el) => { moreSub = el.dataset.v; render(); window.scrollTo(0, 0); };
ACT.moreBack = () => { moreSub = null; render(); window.scrollTo(0, 0); };
ACT.newTpl = () => tplSheet(null);
ACT.tplEdit = (el) => { const t = S.templates.find((x) => x.id === el.dataset.id); if (t) tplSheet(t); };
ACT.tplMove = (el) => {
  const list = S.templates.slice(), i = list.findIndex((x) => x.id === el.dataset.id), j = i + (+el.dataset.d); if (i < 0 || j < 0 || j >= list.length) return;
  const t = list[i]; list[i] = list[j]; list[j] = t; D.reorderTemplates(list); render();
};
ACT.tplUp = (el) => { const i = +el.dataset.i, a = tplEdit.items; if (i > 0) { const t = a[i]; a[i] = a[i - 1]; a[i - 1] = t; drawSheet(tplO); } };
ACT.tplDn = (el) => { const i = +el.dataset.i, a = tplEdit.items; if (i < a.length - 1) { const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; drawSheet(tplO); } };
ACT.tplRm = (el) => { tplEdit.items.splice(+el.dataset.i, 1); drawSheet(tplO); };
ACT.tplAddEx = () => pickEx((id) => { tplEdit.items.push({ exerciseId: id, sets: 3, repMin: 8, repMax: 12 }); drawSheet(tplO); });
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

/* ---------- campos ---------- */
function bindSet(key, val) {
  if (key === 'coachQ') { coachQ = val; return; }
  const p = key.split(':'), ns = p[0], f = p[1];
  if (ns === 'sess' && draft) { if (f === 'date' && !val) return; draft[f] = val; saveDraft(); }
  else if (ns === 'tpl' && tplEdit) tplEdit[f] = val;
  else if (ns === 'ex' || ns === 'meas') { const o = topSheet(); if (o && o.st) o.st[f] = val; }
}
document.addEventListener('input', (e) => {
  const t = e.target, d = t.dataset || {};
  if (d.f && draft) { const s = draft.exercises[+d.ei].sets[+d.si]; if (s) { s[d.f] = t.value; saveDraft(); } return; }
  if (d.bind) bindSet(d.bind, t.value);
  else if (d.tf && tplEdit) tplEdit.items[+d.i][d.tf] = t.value;
  else if (d.mf) { const o = topSheet(); if (o && o.st) o.st.vals[d.mf] = t.value; }
  else if (t.id === 'pickQ') filterPick(t.value);
});
document.addEventListener('change', (e) => {
  const t = e.target, d = t.dataset || {};
  if (d.bind) bindSet(d.bind, t.value);
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
  authed = false; closeAllSheets(); const old = $('#restpill'); if (old) old.remove();
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
  draft = D.loadDraft(); if (draft && !Array.isArray(draft.exercises)) draft = null;
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
