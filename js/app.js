/* app.js */
(function () {
  /* ---------- Constantes de storage ---------- */
  const KEYS = {
    USERS: 'mts:users',
    SESSION: 'mts:session',
    APPOINTMENTS: 'mts:appointments',
    DRAFT: 'mts:appointment:draft',
    DATA: 'mts:data'
  };
  window.MTS_KEYS = KEYS;

  /* ---------- Utils DOM ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

  window.$ = $; window.$$ = $$; window.on = on;

  /* ---------- Storage helpers ---------- */
  const readJSON = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
    catch { return fallback; }
  };
  const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  window.store = { readJSON, writeJSON };

  /* ---------- Seed de datos para demo ---------- */
  function seedIfNeeded() {
    if (!readJSON(KEYS.DATA)) {
      const data = {
        specialties: ['Cardiología', 'Clínica Médica', 'Dermatología'],
        doctorsBySpecialty: {
          'Cardiología': ['Dr. Esteban González', 'Dr. Bordon'],
          'Clínica Médica': ['Dra. Pérez', 'Dr. Castro'],
          'Dermatología': ['Dra. López']
        },
        institutions: [
          {
            id: 'pla-tita',
            name: 'Clínica Sunchales "Dr. Plácido Tita"',
            address: '1 de Mayo 174 - Sunchales, Santa Fe',
            phone: '3493-416732'
          }
        ]
      };
      writeJSON(KEYS.DATA, data);
    }
    if (!readJSON(KEYS.USERS)) writeJSON(KEYS.USERS, [
      { email: 'demo@miturnosalud.com', name: 'Paciente Demo', password: 'demo1234' }
    ]);
    if (!readJSON(KEYS.APPOINTMENTS)) writeJSON(KEYS.APPOINTMENTS, []);
  }
  seedIfNeeded();

  /* ---------- Navegación UI (sidebar active) ---------- */
  (function markActiveNav() {
    const path = location.pathname.split('/').pop();
    $$('.sidebar a').forEach(a => {
      const hrefLast = (a.getAttribute('href') || '').split('/').pop();
      if (hrefLast && hrefLast === path) a.setAttribute('aria-current', 'page');
    });
  })();

  /* ---------- Exponer helpers de flujo de turno ---------- */
  const Draft = {
    get: () => readJSON(KEYS.DRAFT, {}),
    set: (partial) => writeJSON(KEYS.DRAFT, { ...Draft.get(), ...partial }),
    clear: () => localStorage.removeItem(KEYS.DRAFT)
  };
  const Data = () => readJSON(KEYS.DATA, { specialties: [], doctorsBySpecialty: {}, institutions: [] });
  const Appointments = {
    list: () => readJSON(KEYS.APPOINTMENTS, []),
    add: (appt) => {
      const all = Appointments.list();
      all.push({ id: crypto.randomUUID(), ...appt, createdAt: Date.now() });
      writeJSON(KEYS.APPOINTMENTS, all);
    }
  };

  window.MTS = { Draft, Data, Appointments };
})();
