/*
  UNKSO demo data store
  ---------------------
  A mock backend for the MVP. Members and the change log are saved in the visitor's
  browser (localStorage), seeded from SEED below. Every page talks to the data only
  through window.UNKSO, so this file can later be replaced by calls to a real API
  (for example Cloudflare Pages Functions + D1) without changing the pages.

  Sign-in is a demo role picker with no passwords. It is not security: anyone can
  pick "Admin". Real access control must happen on a server.
*/
(function () {
  var KEY = 'unkso-demo-v1';
  var SESSION_KEY = 'unkso-demo-session';

  var COMPANIES = [
    { id: 'bravo', name: 'Bravo', game: 'Modern Warfare 4', short: 'MW4', page: 'company-mw4.html' },
    { id: 'charlie', name: 'Charlie', game: 'Battlefield 6', short: 'BF6', page: 'company-bf6.html' },
    { id: 'delta', name: 'Delta', game: 'Escape From Tarkov', short: 'EFT', page: 'company-eft.html' }
  ];

  // Most senior first; used for sorting rosters.
  var RANKS = ['COL', 'LTC', 'MAJ', 'CPT', '1LT', '2LT', 'CW5', 'CW4', 'CW3', 'CW2', 'WO1',
               'CSM', 'SGM', '1SG', 'MSG', 'SFC', 'SSG', 'SGT', 'CPL', 'SPC', 'PFC', 'PV2', 'PVT', 'RCT'];
  var POSITIONS = ['Company Commander', 'Executive Officer', 'First Sergeant', 'Squad Leader', 'Team Leader', 'Member'];
  var UNITS = ['Company', '1st Squad', '2nd Squad'];
  var STATUSES = ['Active', 'Leave of Absence'];

  var SEED = {
    members: [
      { id: 'm-civoen', company: 'bravo', callsign: 'Civoen', rank: '2LT', position: 'Company Commander', unit: 'Company', status: 'Active', joined: '' },
      { id: 'm-midkng', company: 'bravo', callsign: 'MidKng', rank: 'SSG', position: 'First Sergeant', unit: 'Company', status: 'Active', joined: '' },
      { id: 'm-actualstevee', company: 'bravo', callsign: 'ACTUALSTEVEE', rank: 'SGT', position: 'Squad Leader', unit: '1st Squad', status: 'Active', joined: '' }
    ],
    log: []
  };

  var memory = null; // fallback when localStorage is unavailable

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return memory || clone(SEED);
  }
  function write(db) {
    memory = db;
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {}
  }
  function uid() { return 'm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function rankIndex(r) { var i = RANKS.indexOf(r); return i === -1 ? 999 : i; }
  function posIndex(p) { var i = POSITIONS.indexOf(p); return i === -1 ? 999 : i; }
  function sortMembers(list) {
    return list.slice().sort(function (a, b) {
      return posIndex(a.position) - posIndex(b.position) || rankIndex(a.rank) - rankIndex(b.rank) || a.callsign.localeCompare(b.callsign);
    });
  }
  function displayName(m) { return m.rank + '.' + m.callsign; }
  function company(id) { return COMPANIES.filter(function (c) { return c.id === id; })[0]; }

  // ---- Session (demo) ----
  function getSession() {
    try { var s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); if (s && s.name) return s; } catch (e) {}
    return null;
  }
  function signIn(name, role) {
    var s = { name: name, role: role };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }
  function signOut() { try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }
  function canManage(s) { s = s || getSession(); return !!s && (s.role === 'Moderator' || s.role === 'Admin'); }

  // ---- Validation ----
  function validate(m, db, ignoreId) {
    var errors = {};
    var cs = (m.callsign || '').trim();
    if (!cs) errors.callsign = 'Enter a callsign.';
    else if (!/^[A-Za-z0-9_\-]{2,24}$/.test(cs)) errors.callsign = 'Use 2 to 24 letters, numbers, - or _ (no spaces or dots).';
    else if (db.members.some(function (x) { return x.id !== ignoreId && x.callsign.toLowerCase() === cs.toLowerCase(); }))
      errors.callsign = 'A member with this callsign already exists.';
    if (RANKS.indexOf(m.rank) === -1) errors.rank = 'Choose a rank.';
    if (POSITIONS.indexOf(m.position) === -1) errors.position = 'Choose a position.';
    if (!company(m.company)) errors.company = 'Choose a company.';
    if (UNITS.indexOf(m.unit) === -1) errors.unit = 'Choose a unit.';
    if (STATUSES.indexOf(m.status) === -1) errors.status = 'Choose a status.';
    if (m.position === 'Company Commander' || m.position === 'First Sergeant' || m.position === 'Executive Officer') {
      var taken = db.members.filter(function (x) { return x.id !== ignoreId && x.company === m.company && x.position === m.position; })[0];
      if (taken) errors.position = displayName(taken) + ' is already ' + m.position + ' of ' + company(m.company).name + ' Company.';
    }
    return errors;
  }

  function addLog(db, text) {
    var s = getSession();
    db.log.unshift({ at: new Date().toISOString(), by: s ? s.name + ' (' + s.role + ')' : 'Unknown', text: text });
    db.log = db.log.slice(0, 50);
  }

  function requireAccess() {
    if (!canManage()) throw new Error('Only Moderators and Admins can change members.');
  }

  var api = {
    COMPANIES: COMPANIES, RANKS: RANKS, POSITIONS: POSITIONS, UNITS: UNITS, STATUSES: STATUSES,
    company: company,
    displayName: displayName,
    list: function (companyId) {
      var all = read().members;
      return sortMembers(companyId ? all.filter(function (m) { return m.company === companyId; }) : all);
    },
    get: function (id) { return read().members.filter(function (m) { return m.id === id; })[0] || null; },
    log: function () { return read().log; },
    add: function (m) {
      requireAccess();
      var db = read();
      var rec = { id: uid(), company: m.company, callsign: (m.callsign || '').trim(), rank: m.rank, position: m.position, unit: m.unit, status: m.status || 'Active', joined: m.joined || '' };
      var errors = validate(rec, db, null);
      if (Object.keys(errors).length) return { ok: false, errors: errors };
      db.members.push(rec);
      addLog(db, 'Added ' + displayName(rec) + ' to ' + company(rec.company).name + ' Company as ' + rec.position + '.');
      write(db);
      return { ok: true, member: rec };
    },
    update: function (id, patch) {
      requireAccess();
      var db = read();
      var cur = db.members.filter(function (x) { return x.id === id; })[0];
      if (!cur) return { ok: false, errors: { form: 'This member no longer exists.' } };
      var next = Object.assign({}, cur, patch, { callsign: ((patch.callsign != null ? patch.callsign : cur.callsign) || '').trim() });
      var errors = validate(next, db, id);
      if (Object.keys(errors).length) return { ok: false, errors: errors };
      var changes = [];
      ['callsign', 'rank', 'position', 'unit', 'status', 'joined'].forEach(function (k) {
        if ((cur[k] || '') !== (next[k] || '')) changes.push(k === 'joined' ? 'join date' : k);
      });
      if (cur.company !== next.company) changes.push('moved to ' + company(next.company).name + ' Company');
      Object.assign(cur, next);
      addLog(db, 'Updated ' + displayName(cur) + (changes.length ? ': ' + changes.join(', ') + '.' : '.'));
      write(db);
      return { ok: true, member: cur };
    },
    remove: function (id) {
      requireAccess();
      var db = read();
      var cur = db.members.filter(function (x) { return x.id === id; })[0];
      if (!cur) return { ok: false };
      db.members = db.members.filter(function (x) { return x.id !== id; });
      addLog(db, 'Removed ' + displayName(cur) + ' from ' + company(cur.company).name + ' Company.');
      write(db);
      return { ok: true, member: cur };
    },
    reset: function () {
      var s = getSession();
      if (!s || s.role !== 'Admin') throw new Error('Only Admins can reset the demo data.');
      var db = clone(SEED);
      addLog(db, 'Reset the demo data.');
      write(db);
    },
    session: getSession,
    signIn: signIn,
    signOut: signOut,
    canManage: canManage,
    // Re-render when another tab changes the data.
    onChange: function (fn) {
      window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === SESSION_KEY) fn(); });
    }
  };

  window.UNKSO = api;
})();
