/* app.js – Core común de MiTurnoSalud
   - Seed con versionado y datos de instituciones reales
   - Helpers de Storage (JSON seguro), DOM, fechas (TZ AR), teléfonos/WhatsApp
   - API: MTS.Draft, MTS.Data, MTS.Appointments
   - Extras: sortByDate, upcoming, clearFlowData
   - Retro-compatible con scripts existentes (login, registro, agendamiento, dashboard)
*/
(function () {
  'use strict';

  /* ================================
     Constantes y llaves de storage
  ==================================*/
  const KEYS = {
    USERS: 'mts:users',
    SESSION: 'mts:session',
    APPOINTMENTS: 'mts:appointments',
    DRAFT: 'mts:appointment:draft',
    DATA: 'mts:data',
    DATA_VERSION: 'mts:data:version',
    LAST_CONFIRM: 'mts:lastConfirm'
  };
  const DATA_VERSION = 2; // ⟵ aumenta cuando cambie el seed para forzar actualización
  const APP_TZ = 'America/Argentina/Cordoba';

  // Exponer KEYS temprano (útil para otras cargas muy al inicio)
  window.MTS_KEYS = KEYS;

  /* ================================
     Utils: DOM
  ==================================*/
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  // Delegación de eventos
  function delegate(root, event, selector, handler) {
    on(root, event, (e) => {
      const t = e.target.closest(selector);
      if (t && root.contains(t)) handler(e, t);
    });
  }

  window.$ = $; window.$$ = $$; window.on = on; window.delegate = delegate;

  /* ================================
     Utils: Storage (JSON seguro)
  ==================================*/
  const readJSON = (k, fallback) => {
    try {
      const raw = localStorage.getItem(k);
      return raw == null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  };
  const writeJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const remove = (k) => localStorage.removeItem(k);

  window.store = { readJSON, writeJSON, remove };

  /* ================================
     Utils: Tel/WhatsApp
  ==================================*/
  const onlyDigits = (v = '') => String(v).replace(/\D/g, '');
  const telHref   = (phone) => phone ? `tel:${onlyDigits(phone)}` : '';
  const waHref    = (phone) => phone ? `https://wa.me/${onlyDigits(phone)}` : '';

  /* ================================
     Utils: Fechas y horas (TZ AR)
  ==================================*/
  // Hoy en formato YYYY-MM-DD usando TZ específica
  function todayISO(tz = APP_TZ) {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('es-AR', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'
    });
    // Devuelve p.ej. "08/10/2025" -> convertir a "2025-10-08"
    const [{ value: d }, , { value: m }, , { value: y }] = fmt.formatToParts(now);
    return `${y}-${m}-${d}`;
  }

  // "2025-10-08" -> "08 de octubre de 2025" (es-AR)
  function formatDateAR(dateISO, tz = APP_TZ) {
    try {
      const [y, m, d] = dateISO.split('-').map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // mediodía UTC para evitar desfases
      return dt.toLocaleDateString('es-AR', {
        timeZone: tz, day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch { return dateISO; }
  }

  // "HH:mm" -> "HH:mm" validado
  function formatTimeHHMM(t = '') {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? t : String(t).substring(0,5);
  }

  /* ================================
     Seed de datos (con versionado)
  ==================================*/
  function seedData() {
    const data = {
      specialties: ['Cardiología', 'Clínica Médica', 'Dermatología'],
      doctorsBySpecialty: {
        'Cardiología': ['Dr. Esteban González', 'Dr. Bordon'],
        'Clínica Médica': ['Dra. Pérez', 'Dr. Castro'],
        'Dermatología': ['Dra. López']
      },
      institutions: [
        {
          id: 'clinica-placido-tita',
          name: 'Clínica Sunchales “Dr. Plácido Tita”',
          address: '1° de Mayo 174, Sunchales',
          phone: '+54 3493 434055',   // Ecografías / alternativo
          whatsapp: '+54 3493 420589', // Turnos por WhatsApp
          services: [
            'Radiografías y análisis de sangre sin turno (orden de llegada)',
            'Turnos para ecografías por WhatsApp',
            'Atención de urgencias 24 horas'
          ]
        },
        {
          id: 'clinica-atilra-10-sept',
          name: 'Clínica Atilra Diez de Septiembre',
          address: '25 de Mayo 69, Sunchales',
          phone: '+54 3493 429300',
          whatsapp: null,
          services: [
            'Centro de alta complejidad con especialidades médicas',
            'Diagnóstico por imágenes',
            'Tecnología innovadora'
          ]
        }
      ]
    };
    writeJSON(KEYS.DATA, data);
    localStorage.setItem(KEYS.DATA_VERSION, String(DATA_VERSION));
  }

  function seedUsersIfNeeded() {
    if (!readJSON(KEYS.USERS)) {
      writeJSON(KEYS.USERS, [
        { email: 'demo@miturnosalud.com', name: 'Paciente Demo', password: 'demo1234' }
      ]);
    }
  }
  function seedAppointmentsIfNeeded() {
    if (!readJSON(KEYS.APPOINTMENTS)) writeJSON(KEYS.APPOINTMENTS, []);
  }

  function ensureSeed() {
    const currentVersion = Number(localStorage.getItem(KEYS.DATA_VERSION) || 0);
    const hasData = !!readJSON(KEYS.DATA);
    if (!hasData || currentVersion < DATA_VERSION) {
      seedData(); // actualiza DATA + version
    }
    seedUsersIfNeeded();
    seedAppointmentsIfNeeded();
  }

  ensureSeed();

  /* ================================
     Navegación: resaltar item activo
  ==================================*/
  (function markActiveNav() {
    const path = location.pathname.split('/').pop();
    $$('.sidebar a').forEach(a => {
      const hrefLast = (a.getAttribute('href') || '').split('/').pop();
      if (hrefLast && hrefLast === path) a.setAttribute('aria-current', 'page');
    });
  })();

  /* ================================
     API: Draft, Data, Appointments
  ==================================*/
  // Fallback crypto.randomUUID para navegadores viejos
  function uid() {
    if (crypto?.randomUUID) return crypto.randomUUID();
    return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  const Draft = {
    get: () => readJSON(KEYS.DRAFT, {}),
    set: (partial) => writeJSON(KEYS.DRAFT, { ...Draft.get(), ...partial }),
    clear: () => remove(KEYS.DRAFT),
    // Validar pasos previos del flujo
    requireSteps(step) {
      const d = Draft.get();
      const ok1 = !!d.specialty;
      const ok2 = ok1 && !!d.doctor;
      const ok3 = ok2 && !!d.date && !!d.time;
      if (step >= 1 && !ok1) return false;
      if (step >= 2 && !ok2) return false;
      if (step >= 3 && !ok3) return false;
      return true;
    }
  };

  const Data = () => readJSON(KEYS.DATA, {
    specialties: [], doctorsBySpecialty: {}, institutions: []
  });

  const Appointments = {
    list: (filter = {}) => {
      const all = readJSON(KEYS.APPOINTMENTS, []);
      if (!filter || !Object.keys(filter).length) return all;
      return all.filter(a => Object.entries(filter).every(([k, v]) => a[k] === v));
    },
    add: (appt) => {
      const all = Appointments.list();
      const record = {
        id: uid(),
        createdAt: Date.now(),
        // Guardamos ISO, time y display preformateado (para UI)
        date: appt.date,                    // "YYYY-MM-DD"
        time: formatTimeHHMM(appt.time),    // "HH:mm"
        dateDisplay: formatDateAR(appt.date),
        ...appt
      };
      all.push(record);
      writeJSON(KEYS.APPOINTMENTS, all);
      return record;
    },
    clearAll: () => writeJSON(KEYS.APPOINTMENTS, []),
    removeById: (id) => {
      const next = Appointments.list().filter(a => a.id !== id);
      writeJSON(KEYS.APPOINTMENTS, next);
    },
    // ⟵ NUEVOS HELPERS
    sortByDate(list) {
      // ordena asc por fecha y hora (YYYY-MM-DD + HH:mm)
      return [...list].sort((a, b) => {
        if (a.date === b.date) return (a.time || '').localeCompare(b.time || '');
        return (a.date || '').localeCompare(b.date || '');
      });
    },
    upcoming(filter = {}) {
      // devuelve turnos con fecha >= hoy ordenados
      const all = Appointments.list(filter);
      const today = todayISO();
      const next = all.filter(a => (a.date || '') >= today);
      return Appointments.sortByDate(next);
    }
  };

  /* ================================
     Sesión actual (helper liviano)
  ==================================*/
  function currentUser() {
    return readJSON(KEYS.SESSION, null);
  }

  /* ================================
     Limpieza de datos temporales
  ==================================*/
  function clearFlowData() {
    remove(KEYS.DRAFT);
    remove(KEYS.LAST_CONFIRM);
  }

  /* ================================
     Helpers expuestos globalmente
  ==================================*/
  window.MTS = {
    // Claves y versión
    KEYS, DATA_VERSION, APP_TZ,
    // DOM utils
    $, $$, on, delegate,
    // Storage utils
    store: { readJSON, writeJSON, remove },
    // Tel/WA utils
    onlyDigits, telHref, waHref,
    // Fecha utils
    todayISO, formatDateAR, formatTimeHHMM,
    // APIs principales
    Draft, Data, Appointments,
    // Sesión y limpieza
    currentUser,
    clearFlowData
  };
})();
