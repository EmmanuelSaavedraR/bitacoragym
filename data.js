/* ============================================================================
   Capa de datos · Bitácora de Hierro
   - Supabase (Postgres) como base de datos, con inicio de sesión.
   - Caché local: la app abre al instante y se puede consultar sin internet.
   - Cola de cambios (outbox): si no hay señal, los registros se guardan en el
     teléfono y se envían solos cuando vuelve la conexión.
   ============================================================================ */
(function () {
  'use strict';
  var LS = (function () { try { return window.localStorage; } catch (e) { return null; } })();
  var lsGet = function (k) { try { return LS ? LS.getItem(k) : null; } catch (e) { return null; } };
  var lsSet = function (k, v) { try { if (LS) LS.setItem(k, v); return true; } catch (e) { return false; } };
  var lsDel = function (k) { try { if (LS) LS.removeItem(k); } catch (e) {} };

  var now = function () { return new Date().toISOString(); };

  /* ---------- Estado visible para la interfaz ---------- */
  var S = { exercises: [], templates: [], sessions: [], deleted: [], measurements: [], bodyweight: [], food: [], settings: {} };

  /* ---------- Definición de tablas ---------- */
  var PK = {
    exercises: ['id'], templates: ['id'], template_items: ['template_id', 'position'],
    sessions: ['id'], session_sets: ['session_id', 'exercise_pos', 'set_pos'],
    measurements: ['date'], bodyweight: ['date'], food_entries: ['id'], settings: []
  };
  var ORDER = {
    exercises: ['id'], templates: ['id'], template_items: ['template_id', 'position'],
    sessions: ['id'], session_sets: ['session_id', 'exercise_pos', 'set_pos'],
    measurements: ['date'], bodyweight: ['date'], food_entries: ['id'], settings: ['user_id']
  };
  var TABLES = Object.keys(PK);
  var EX_NEW = ['rep_min', 'rep_max', 'rest_sec', 'default_sets', 'how_to', 'favorite', 'archived', 'image_url'];
  var RAW = {};
  TABLES.forEach(function (t) { RAW[t] = []; });

  var D = {
    S: S, client: null, user: null, ready: false, online: navigator.onLine !== false,
    syncing: false, lastSync: null, lastError: '', schemaOutdated: false, onChange: function () {}, onAuth: function () {},
    MIGRATION_SQL: "alter table public.exercises\n  add column if not exists rep_min int,\n  add column if not exists rep_max int,\n  add column if not exists rest_sec int,\n  add column if not exists default_sets int,\n  add column if not exists how_to text not null default '',\n  add column if not exists favorite boolean not null default false,\n  add column if not exists archived boolean not null default false,\n  add column if not exists image_url text;\n\nnotify pgrst, 'reload schema';"
  };
  var outbox = [], pulling = false, needAuth = false;

  /* ---------- Configuración ---------- */
  D.config = function () {
    var c = window.BH_CONFIG || {};
    var url = (c.SUPABASE_URL || '').trim(), key = (c.SUPABASE_ANON_KEY || '').trim();
    if (!url || /TU-PROYECTO|YOUR|xxxx/i.test(url) || !key || /TU-CLAVE|YOUR|xxxx/i.test(key)) {
      try { var s = JSON.parse(lsGet('bh.cfg') || 'null'); if (s && s.url && s.key) return s; } catch (e) {}
      return null;
    }
    return { url: url, key: key };
  };
  D.saveConfig = function (url, key) { lsSet('bh.cfg', JSON.stringify({ url: url.trim(), key: key.trim() })); };

  /* ---------- Conversión filas ⇄ estado ---------- */
  var n = function (v) { return v == null ? null : Number(v); };
  function assemble() {
    S.exercises = RAW.exercises.map(function (r) {
      return { id: r.id, name: r.name, muscle: r.muscle || 'Otro', secondary: r.secondary || [], equipment: r.equipment || null, note: r.note || '', repMin: n(r.rep_min), repMax: n(r.rep_max), restSec: n(r.rest_sec), defaultSets: n(r.default_sets), howTo: r.how_to || '', favorite: !!r.favorite, archived: !!r.archived, imageUrl: r.image_url || null, createdAt: r.created_at, updatedAt: r.updated_at };
    }).sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });

    var items = {};
    RAW.template_items.forEach(function (r) { (items[r.template_id] = items[r.template_id] || []).push(r); });
    S.templates = RAW.templates.map(function (r) {
      return {
        id: r.id, name: r.name, order: r.position,
        items: (items[r.id] || []).slice().sort(function (a, b) { return a.position - b.position; }).map(function (i) {
          return { exerciseId: i.exercise_id, sets: i.sets, repMin: i.rep_min, repMax: i.rep_max, restSec: i.rest_sec };
        })
      };
    }).sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

    var sets = {};
    RAW.session_sets.forEach(function (r) { (sets[r.session_id] = sets[r.session_id] || []).push(r); });
    var all = RAW.sessions.map(function (r) {
      var rows = (sets[r.id] || []).slice().sort(function (a, b) { return a.exercise_pos - b.exercise_pos || a.set_pos - b.set_pos; });
      var exs = [], cur = null;
      rows.forEach(function (x) {
        if (!cur || cur.pos !== x.exercise_pos) {
          cur = { pos: x.exercise_pos, exerciseId: x.exercise_id, name: x.exercise_name, muscle: x.muscle || 'Otro', secondary: x.secondary || [], equipment: x.equipment || null, repMin: x.rep_min, repMax: x.rep_max, restSec: x.rest_sec, sets: [] };
          exs.push(cur);
        }
        cur.sets.push({ w: Number(x.weight_kg) || 0, r: Number(x.reps) || 0, rir: n(x.rir), type: x.set_type || 'N' });
      });
      return {
        id: r.id, date: r.date, startedAt: r.started_at, endedAt: r.ended_at, durationMin: r.duration_min,
        templateId: r.template_id, templateName: r.template_name || 'Sesión', kind: r.kind || 'rutina',
        energy: r.energy, sleepH: n(r.sleep_h), notes: r.notes || '', revision: r.revision || 1,
        createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at,
        muscles: r.muscles || [], exercises: exs
      };
    });
    var byDate = function (a, b) { return (b.date || '').localeCompare(a.date || '') || (b.startedAt || '').localeCompare(a.startedAt || ''); };
    S.sessions = all.filter(function (s) { return !s.deletedAt; }).sort(byDate);
    S.deleted = all.filter(function (s) { return s.deletedAt; }).sort(byDate);

    S.measurements = RAW.measurements.map(function (r) {
      return { id: r.date, date: r.date, shoulders: n(r.shoulders), chest: n(r.chest), armRelaxed: n(r.arm_relaxed), armFlexed: n(r.arm_flexed), waist: n(r.waist), hips: n(r.hips), thigh: n(r.thigh), calf: n(r.calf), weightAvg7: n(r.weight_avg7), notes: r.notes || '' };
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
    S.bodyweight = RAW.bodyweight.map(function (r) { return { id: r.date, date: r.date, weight: Number(r.weight_kg) }; })
      .sort(function (a, b) { return b.date.localeCompare(a.date); });
    S.food = RAW.food_entries.map(function (r) {
      return { id: r.id, date: r.date, meal: r.meal, desc: r.description || '', kcal: Number(r.kcal) || 0, p: Number(r.protein_g) || 0, c: n(r.carbs_g), f: n(r.fat_g), at: r.created_at };
    }).sort(function (a, b) { return b.date.localeCompare(a.date) || (a.at || '').localeCompare(b.at || ''); });
    var st = RAW.settings[0];
    S.settings = st ? { kcal: st.kcal, protein: st.protein_g, setMin: st.set_min, setMax: st.set_max } : {};
  }

  /* ---------- Aplicar operaciones al estado local ---------- */
  function keyOf(table, row) { return PK[table].map(function (k) { return row[k]; }).join('\u0001'); }
  function applyLocal(op) {
    var rows = RAW[op.table];
    if (op.t === 'upsert') {
      var idx = {};
      rows.forEach(function (r, i) { idx[keyOf(op.table, r)] = i; });
      op.rows.forEach(function (row) {
        var k = keyOf(op.table, row);
        if (op.table === 'settings') { rows.length ? Object.assign(rows[0], row) : rows.push(Object.assign({}, row)); }
        else if (k in idx) { Object.assign(rows[idx[k]], row); }
        else { rows.push(Object.assign({}, row)); idx[k] = rows.length - 1; }
      });
    } else if (op.t === 'delete') {
      RAW[op.table] = rows.filter(function (r) { return !Object.keys(op.match).every(function (k) { return r[k] === op.match[k]; }); });
    } else if (op.t === 'update') {
      rows.forEach(function (r) { if (Object.keys(op.match).every(function (k) { return r[k] === op.match[k]; })) Object.assign(r, op.patch); });
    }
  }

  /* ---------- Persistencia local ---------- */
  var cacheKey = function () { return 'bh.cache.' + (D.user ? D.user.id : '_'); };
  var boxKey = function () { return 'bh.outbox.' + (D.user ? D.user.id : '_'); };
  function persist() {
    if (!D.user) return;
    lsSet(cacheKey(), JSON.stringify({ raw: RAW, at: D.lastSync }));
    lsSet(boxKey(), JSON.stringify(outbox));
  }
  function loadLocal() {
    try {
      var c = JSON.parse(lsGet(cacheKey()) || 'null');
      if (c && c.raw) { TABLES.forEach(function (t) { RAW[t] = c.raw[t] || []; }); D.lastSync = c.at || null; }
      outbox = JSON.parse(lsGet(boxKey()) || '[]') || [];
    } catch (e) { outbox = []; }
    assemble();
  }
  var changed = function () { try { D.onChange(); } catch (e) { console.error(e); } };

  /* ---------- Sincronización ---------- */
  var isNetErr = function (e) { return !e || e.status === 0 || /fetch|network|failed to|load failed|timeout/i.test(String(e.message || e)); };
  var isAuthErr = function (e) { return e && (e.status === 401 || /jwt|not authenticated|invalid claim/i.test(String(e.message || ''))); };

  async function send(op) {
    var c = D.client.from(op.table), uid = D.user.id, res;
    if (op.t === 'upsert') {
      var rows = op.rows.map(function (r) { return Object.assign({}, r, { user_id: uid }); });
      var conflict = ['user_id'].concat(PK[op.table]).join(',');
      res = await c.upsert(rows, { onConflict: conflict });
      if (res && res.error && op.table === 'exercises' && /PGRST204|schema cache|column/i.test((res.error.code || '') + ' ' + (res.error.message || ''))) {
        // La base de datos aún no tiene las columnas nuevas: se guarda lo básico y se avisa en la app.
        D.schemaOutdated = true;
        rows = rows.map(function (r) { var o = Object.assign({}, r); EX_NEW.forEach(function (k) { delete o[k]; }); return o; });
        res = await c.upsert(rows, { onConflict: conflict });
      }
    } else if (op.t === 'delete') {
      var q = c.delete(); Object.keys(op.match).forEach(function (k) { q = q.eq(k, op.match[k]); }); res = await q;
    } else {
      var u = c.update(op.patch); Object.keys(op.match).forEach(function (k) { u = u.eq(k, op.match[k]); }); res = await u;
    }
    if (res && res.error) { var e = res.error; e.status = res.status; throw e; }
  }

  D.pending = function () { return outbox.length; };
  D.flush = async function () {
    if (D.syncing || !D.client || !D.user || !outbox.length) return;
    D.syncing = true; changed();
    try {
      while (outbox.length) {
        var op = outbox[0];
        try { await send(op); outbox.shift(); persist(); D.lastError = ''; }
        catch (e) {
          if (isNetErr(e)) { D.online = false; D.lastError = 'Sin conexión'; break; }
          if (isAuthErr(e)) { needAuth = true; D.lastError = 'Tu sesión venció. Vuelve a entrar.'; break; }
          // error permanente: se aparta para no bloquear el resto
          var dead = []; try { dead = JSON.parse(lsGet('bh.dead') || '[]'); } catch (x) {}
          dead.push({ op: op, error: String(e.message || e), at: now() }); lsSet('bh.dead', JSON.stringify(dead.slice(-20)));
          outbox.shift(); persist(); D.lastError = 'Un cambio no se pudo guardar: ' + String(e.message || e);
        }
      }
    } finally { D.syncing = false; changed(); }
    if (needAuth) D.onAuth(false);
  };

  async function pullTable(t) {
    var all = [], from = 0, step = 1000;
    for (;;) {
      var q = D.client.from(t).select('*');
      ORDER[t].forEach(function (c) { q = q.order(c, { ascending: true }); });
      var res = await q.range(from, from + step - 1);
      if (res.error) { res.error.status = res.status; throw res.error; }
      var data = res.data || [];
      all = all.concat(data);
      if (data.length < step) break;
      from += step;
    }
    return all;
  }

  D.pull = async function () {
    if (!D.client || !D.user || pulling) return false;
    if (outbox.length) return false; // primero se envían los cambios pendientes
    pulling = true;
    try {
      var fresh = {};
      for (var i = 0; i < TABLES.length; i++) fresh[TABLES[i]] = await pullTable(TABLES[i]);
      if (outbox.length) return false; // se registró algo mientras se descargaba
      TABLES.forEach(function (t) { RAW[t] = fresh[t]; });
      if (fresh.exercises.length) D.schemaOutdated = !('rep_min' in fresh.exercises[0]);
      D.lastSync = now(); D.online = true; D.lastError = '';
      assemble(); persist(); changed();
      return true;
    } catch (e) {
      if (isNetErr(e)) { D.online = false; D.lastError = 'Sin conexión'; }
      else if (isAuthErr(e)) { needAuth = true; D.onAuth(false); }
      else D.lastError = 'No se pudo actualizar: ' + String(e.message || e);
      changed(); return false;
    } finally { pulling = false; }
  };

  D.sync = async function () { await D.flush(); if (!outbox.length) await D.pull(); changed(); };

  function enqueue(ops) {
    ops.forEach(function (op) { applyLocal(op); outbox.push(op); });
    assemble(); persist(); changed();
    D.flush().then(function () { changed(); });
  }

  /* ---------- Sesión de usuario ---------- */
  D.init = async function () {
    var cfg = D.config();
    if (!cfg) return 'setup';
    if (!window.supabase || !window.supabase.createClient) return 'nolib';
    D.client = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
    D.client.auth.onAuthStateChange(function (ev) { if (ev === 'SIGNED_OUT') { D.user = null; D.onAuth(false); } });
    var user = null;
    try { var r = await D.client.auth.getSession(); user = r && r.data && r.data.session ? r.data.session.user : null; } catch (e) {}
    if (!user) { // sin red: usar la última cuenta conocida para poder consultar
      try { var cu = JSON.parse(lsGet('bh.user') || 'null'); if (cu && !navigator.onLine) user = cu; } catch (e) {}
    }
    if (!user) return 'login';
    D.user = { id: user.id, email: user.email }; lsSet('bh.user', JSON.stringify(D.user));
    loadLocal(); D.ready = true;
    return 'ok';
  };
  D.signIn = async function (email, password) {
    var r = await D.client.auth.signInWithPassword({ email: email, password: password });
    if (r.error) throw r.error;
    D.user = { id: r.data.user.id, email: r.data.user.email }; lsSet('bh.user', JSON.stringify(D.user));
    needAuth = false; loadLocal(); D.ready = true;
  };
  D.signOut = async function () {
    try { await D.client.auth.signOut(); } catch (e) {}
    lsDel('bh.user'); D.user = null; D.ready = false;
  };
  D.isEmpty = function () { return !RAW.exercises.length && !RAW.templates.length && !RAW.sessions.length; };

  window.addEventListener('online', function () { D.online = true; changed(); D.sync(); });
  window.addEventListener('offline', function () { D.online = false; changed(); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && D.user) { if (!D.lastSync || Date.now() - new Date(D.lastSync) > 45000 || outbox.length) D.sync(); }
  });
  setInterval(function () { if (D.user && outbox.length && !D.syncing) D.flush(); }, 20000);

  /* ---------- Escrituras (la interfaz solo usa estas funciones) ---------- */
  D.saveExercise = function (e) {
    enqueue([{ t: 'upsert', table: 'exercises', rows: [exRow(e)] }]);
  };
  function exRow(e) {
    return { id: e.id, name: e.name, muscle: e.muscle || 'Otro', secondary: e.secondary || [], equipment: e.equipment || null, note: e.note || '',
      rep_min: e.repMin || null, rep_max: e.repMax || null, rest_sec: e.restSec || null, default_sets: e.defaultSets || null, how_to: e.howTo || '',
      favorite: !!e.favorite, archived: !!e.archived, image_url: e.imageUrl || null, created_at: e.createdAt || now(), updated_at: now() };
  }
  /* Agrega varios ejercicios de golpe (biblioteca o importación). */
  D.saveExercises = function (list) { if (list.length) enqueue([{ t: 'upsert', table: 'exercises', rows: list.map(exRow) }]); };
  /* Comidas importadas: opcionalmente reemplaza los días indicados. */
  D.importFood = function (entries, replaceDates) {
    var ops = [];
    (replaceDates || []).forEach(function (d) { ops.push({ t: 'delete', table: 'food_entries', match: { date: d } }); });
    if (entries.length) ops.push({ t: 'upsert', table: 'food_entries', rows: entries.map(function (f) {
      return { id: f.id, date: f.date, meal: f.meal, description: f.desc || '', kcal: f.kcal || 0, protein_g: f.p || 0, carbs_g: f.c == null ? null : f.c, fat_g: f.f == null ? null : f.f, created_at: f.at || now() };
    }) });
    if (ops.length) enqueue(ops);
  };
  D.importWeights = function (list) {
    if (list.length) enqueue([{ t: 'upsert', table: 'bodyweight', rows: list.map(function (w) { return { date: w.date, weight_kg: w.weight, updated_at: now() }; }) }]);
  };
  D.saveTemplate = function (t) {
    var ops = [{ t: 'upsert', table: 'templates', rows: [{ id: t.id, name: t.name, position: t.order || 0, updated_at: now() }] },
      { t: 'delete', table: 'template_items', match: { template_id: t.id } }];
    if (t.items.length) ops.push({ t: 'upsert', table: 'template_items', rows: t.items.map(function (it, i) {
      return { template_id: t.id, position: i, exercise_id: it.exerciseId, sets: it.sets || 3, rep_min: it.repMin || null, rep_max: it.repMax || null, rest_sec: it.restSec || null };
    }) });
    enqueue(ops);
  };
  D.reorderTemplates = function (list) {
    enqueue([{ t: 'upsert', table: 'templates', rows: list.map(function (t, i) { return { id: t.id, name: t.name, position: i, updated_at: now() }; }) }]);
  };
  D.deleteTemplate = function (id) {
    enqueue([{ t: 'delete', table: 'template_items', match: { template_id: id } }, { t: 'delete', table: 'templates', match: { id: id } }]);
  };
  D.saveSession = function (s) {
    var exs = s.exercises, rows = [];
    exs.forEach(function (e, ei) {
      e.sets.forEach(function (x, si) {
        rows.push({ session_id: s.id, exercise_pos: ei, set_pos: si, exercise_id: e.exerciseId, exercise_name: e.name, muscle: e.muscle || null, secondary: e.secondary || [], equipment: e.equipment || null, rep_min: e.repMin || null, rep_max: e.repMax || null, rest_sec: e.restSec || null, set_type: x.type || 'N', weight_kg: x.w || 0, reps: x.r || 0, rir: x.rir == null ? null : x.rir });
      });
    });
    var ops = [{ t: 'upsert', table: 'sessions', rows: [{ id: s.id, date: s.date, started_at: s.startedAt, ended_at: s.endedAt, duration_min: s.durationMin, template_id: s.templateId || null, template_name: s.templateName, kind: s.kind || 'rutina', muscles: s.muscles || [], energy: s.energy == null ? null : s.energy, sleep_h: s.sleepH == null ? null : s.sleepH, notes: s.notes || '', revision: s.revision || 1, schema_version: 2, created_at: s.createdAt || now(), updated_at: now(), deleted_at: null }] },
      { t: 'delete', table: 'session_sets', match: { session_id: s.id } }];
    if (rows.length) ops.push({ t: 'upsert', table: 'session_sets', rows: rows });
    enqueue(ops);
  };
  D.trashSession = function (id) { enqueue([{ t: 'update', table: 'sessions', match: { id: id }, patch: { deleted_at: now(), updated_at: now() } }]); };
  D.restoreSession = function (id) { enqueue([{ t: 'update', table: 'sessions', match: { id: id }, patch: { deleted_at: null, updated_at: now() } }]); };
  D.saveMeasurement = function (m) {
    enqueue([{ t: 'upsert', table: 'measurements', rows: [{ date: m.date, shoulders: m.shoulders, chest: m.chest, arm_relaxed: m.armRelaxed, arm_flexed: m.armFlexed, waist: m.waist, hips: m.hips, thigh: m.thigh, calf: m.calf, weight_avg7: m.weightAvg7, notes: m.notes || '', updated_at: now() }] }]);
  };
  D.deleteMeasurement = function (date) { enqueue([{ t: 'delete', table: 'measurements', match: { date: date } }]); };
  D.saveWeight = function (date, w) { enqueue([{ t: 'upsert', table: 'bodyweight', rows: [{ date: date, weight_kg: w, updated_at: now() }] }]); };
  D.deleteWeight = function (date) { enqueue([{ t: 'delete', table: 'bodyweight', match: { date: date } }]); };
  D.saveFood = function (f) {
    enqueue([{ t: 'upsert', table: 'food_entries', rows: [{ id: f.id, date: f.date, meal: f.meal, description: f.desc || '', kcal: f.kcal || 0, protein_g: f.p || 0, carbs_g: f.c == null ? null : f.c, fat_g: f.f == null ? null : f.f, created_at: f.at || now() }] }]);
  };
  D.deleteFood = function (id) { enqueue([{ t: 'delete', table: 'food_entries', match: { id: id } }]); };
  D.saveSettings = function (s) {
    enqueue([{ t: 'upsert', table: 'settings', rows: [{ kcal: s.kcal, protein_g: s.protein, set_min: s.setMin || 10, set_max: s.setMax || 20, updated_at: now() }] }]);
  };

  /* ---------- Biblioteca inicial (solo se carga una vez en una cuenta vacía) ---------- */
  var EX = [
    ['press-banca', 'Press banca con barra', 'Pecho', 'Barra', ['Tríceps', 'Hombros']],
    ['press-inclinado-mancuernas', 'Press inclinado con mancuernas', 'Pecho', 'Mancuernas', ['Hombros', 'Tríceps']],
    ['aperturas-polea', 'Aperturas en polea', 'Pecho', 'Polea', []],
    ['fondos', 'Fondos en paralelas', 'Pecho', 'Peso corporal', ['Tríceps', 'Hombros']],
    ['dominadas', 'Dominadas', 'Espalda', 'Peso corporal', ['Bíceps']],
    ['jalon-pecho', 'Jalón al pecho', 'Espalda', 'Polea', ['Bíceps']],
    ['remo-barra', 'Remo con barra', 'Espalda', 'Barra', ['Bíceps']],
    ['remo-polea-sentado', 'Remo en polea sentado', 'Espalda', 'Polea', ['Bíceps']],
    ['remo-mancuerna', 'Remo con mancuerna a una mano', 'Espalda', 'Mancuernas', ['Bíceps']],
    ['press-militar', 'Press militar con barra', 'Hombros', 'Barra', ['Tríceps']],
    ['press-hombro-mancuernas', 'Press de hombro con mancuernas', 'Hombros', 'Mancuernas', ['Tríceps']],
    ['elevaciones-laterales', 'Elevaciones laterales', 'Hombros', 'Mancuernas', []],
    ['face-pull', 'Face pull', 'Hombros', 'Polea', ['Espalda']],
    ['curl-barra', 'Curl con barra', 'Bíceps', 'Barra', []],
    ['curl-martillo', 'Curl martillo', 'Bíceps', 'Mancuernas', ['Antebrazo']],
    ['curl-inclinado', 'Curl inclinado con mancuernas', 'Bíceps', 'Mancuernas', []],
    ['extension-triceps-polea', 'Extensión de tríceps en polea', 'Tríceps', 'Polea', []],
    ['press-frances', 'Press francés', 'Tríceps', 'Barra', []],
    ['extension-triceps-sobre-cabeza', 'Extensión de tríceps sobre la cabeza', 'Tríceps', 'Polea', []],
    ['sentadilla', 'Sentadilla con barra', 'Cuádriceps', 'Barra', ['Glúteos']],
    ['prensa', 'Prensa de piernas', 'Cuádriceps', 'Máquina', ['Glúteos']],
    ['extension-cuadriceps', 'Extensión de cuádriceps', 'Cuádriceps', 'Máquina', []],
    ['sentadilla-bulgara', 'Sentadilla búlgara', 'Cuádriceps', 'Mancuernas', ['Glúteos']],
    ['peso-muerto', 'Peso muerto', 'Femorales', 'Barra', ['Glúteos', 'Espalda']],
    ['peso-muerto-rumano', 'Peso muerto rumano', 'Femorales', 'Barra', ['Glúteos']],
    ['curl-femoral-tumbado', 'Curl femoral tumbado', 'Femorales', 'Máquina', []],
    ['curl-femoral-sentado', 'Curl femoral sentado', 'Femorales', 'Máquina', []],
    ['hip-thrust', 'Hip thrust', 'Glúteos', 'Barra', ['Femorales']],
    ['talones-de-pie', 'Elevación de talones de pie', 'Pantorrillas', 'Máquina', []],
    ['talones-sentado', 'Elevación de talones sentado', 'Pantorrillas', 'Máquina', []],
    ['crunch-polea', 'Crunch en polea', 'Abdomen', 'Polea', []],
    ['elevacion-piernas', 'Elevación de piernas colgado', 'Abdomen', 'Peso corporal', []]
  ];
  var TPL = [
    ['torso-a', 'Torso A', [['press-banca', 3, 6, 10], ['remo-barra', 3, 6, 10], ['press-militar', 3, 6, 10], ['jalon-pecho', 3, 8, 12], ['curl-barra', 3, 8, 12], ['extension-triceps-polea', 3, 10, 15]]],
    ['pierna-a', 'Pierna A', [['sentadilla', 3, 5, 8], ['peso-muerto-rumano', 3, 6, 10], ['prensa', 3, 10, 15], ['curl-femoral-tumbado', 3, 10, 15], ['talones-de-pie', 4, 8, 12], ['crunch-polea', 3, 10, 15]]],
    ['torso-b', 'Torso B', [['press-inclinado-mancuernas', 3, 8, 12], ['dominadas', 3, 6, 10], ['elevaciones-laterales', 4, 12, 20], ['remo-polea-sentado', 3, 8, 12], ['curl-martillo', 3, 10, 15], ['fondos', 3, 8, 12]]],
    ['pierna-b', 'Pierna B', [['peso-muerto', 3, 4, 6], ['sentadilla-bulgara', 3, 8, 12], ['extension-cuadriceps', 3, 12, 15], ['hip-thrust', 3, 8, 12], ['curl-femoral-sentado', 3, 10, 15], ['talones-sentado', 4, 12, 20]]]
  ];
  D.seedStarter = function () {
    var cat = {}; (window.CATALOG || []).forEach(function (c) { cat[c.id] = c; });
    var exs = EX.map(function (e) { var c = cat[e[0]] || {}; return { id: e[0], name: e[1], muscle: e[2], equipment: e[3], secondary: e[4], note: '', repMin: c.repMin, repMax: c.repMax, restSec: c.restSec, howTo: c.tip || '' }; });
    var ops = [{ t: 'upsert', table: 'exercises', rows: exs.map(exRow) },
      { t: 'upsert', table: 'templates', rows: TPL.map(function (t, i) { return { id: t[0], name: t[1], position: i, updated_at: now() }; }) }];
    var items = [];
    TPL.forEach(function (t) { t[2].forEach(function (it, i) { items.push({ template_id: t[0], position: i, exercise_id: it[0], sets: it[1], rep_min: it[2], rep_max: it[3], rest_sec: null }); }); });
    ops.push({ t: 'upsert', table: 'template_items', rows: items });
    enqueue(ops);
  };

  /* ---------- Borrador de sesión (solo en este teléfono) ---------- */
  D.loadDraft = function () { try { return JSON.parse(lsGet('bh.draft.' + (D.user ? D.user.id : '_')) || 'null'); } catch (e) { return null; } };
  D.saveDraft = function (d) { var k = 'bh.draft.' + (D.user ? D.user.id : '_'); if (d) lsSet(k, JSON.stringify(d)); else lsDel(k); };
  D.clearLocal = function () { if (D.user) { lsDel(cacheKey()); lsDel(boxKey()); } };

  window.Data = D; window.S = S;
})();
