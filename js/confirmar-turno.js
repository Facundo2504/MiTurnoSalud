/* confirmar-turno.js – Resumen final del turno confirmado
   - Muestra los datos completos del turno + institución
   - Enlaces a teléfono, WhatsApp y Google Calendar
   - Limpia el snapshot al regresar al inicio
   - Accesibilidad y seguridad mejoradas
*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    Auth.requireAuth();
  } catch {
    location.replace('index.html');
    return;
  }

  // --- Cargar snapshot del turno confirmado
  const snap = (() => {
    try {
      return JSON.parse(localStorage.getItem('mts:lastConfirm')) || null;
    } catch {
      return null;
    }
  })();

  if (!snap) {
    location.replace('dashboard.html');
    return;
  }

  // --- Helpers locales
  const { formatDateAR, formatTimeHHMM, telHref, waHref } = window.MTS;

  const safeText = (v, fallback = '—') =>
    (v == null || String(v).trim() === '') ? fallback : String(v);

  // Genera un link de Google Calendar (evento 1 hora)
  function buildGoogleCalendarLink({ title, dateISO, timeHHMM, location, details }) {
    try {
      const [y, m, d] = dateISO.split('-').map(Number);
      const [H, M] = timeHHMM.split(':').map(Number);
      const start = new Date(y, m - 1, d, H, M || 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const toUTC = (dt) =>
        `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}T${String(dt.getUTCHours()).padStart(2, '0')}${String(dt.getUTCMinutes()).padStart(2, '0')}00Z`;

      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title || 'Turno médico',
        dates: `${toUTC(start)}/${toUTC(end)}`,
        location: location || '',
        details: details || ''
      });

      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    } catch {
      return '#';
    }
  }

  // --- Preparar datos
  const dateDisplay = formatDateAR(snap.date);
  const timeDisplay = formatTimeHHMM(snap.time);
  const inst = snap.institution || {};
  const phoneHref = telHref(inst.phone);
  const waLink = waHref(inst.whatsapp);

  const hasPhone = !!inst.phone;
  const hasWhatsApp = !!inst.whatsapp;

  // --- Render del resumen <dl.definition>
  const dl = document.querySelector('.definition');
  if (dl) {
    dl.innerHTML = `
      <div class="definition__row"><dt>Especialidad</dt><dd>${safeText(snap.specialty)}</dd></div>
      <div class="definition__row"><dt>Médico</dt><dd>${safeText(snap.doctor)}</dd></div>
      <div class="definition__row"><dt>Institución</dt><dd>${safeText(inst.name)}</dd></div>
      <div class="definition__row"><dt>Dirección</dt><dd>${safeText(inst.address)}</dd></div>
      <div class="definition__row"><dt>Fecha</dt><dd>${dateDisplay}</dd></div>
      <div class="definition__row"><dt>Hora</dt><dd>${timeDisplay}</dd></div>
      <div class="definition__row">
        <dt>Contacto</dt>
        <dd>
          ${hasPhone ? `<a href="${phoneHref}" class="link">${inst.phone}</a>` : '—'}
          ${hasWhatsApp ? ` · <a href="${waLink}" target="_blank" rel="noopener" class="link">WhatsApp ${inst.whatsapp.replace('+54 ', '')}</a>` : ''}
        </dd>
      </div>
    `;

    // Bloque de servicios
    if (Array.isArray(inst.services) && inst.services.length) {
      const services = document.createElement('div');
      services.className = 'definition__row';
      services.innerHTML = `
        <dt>Servicios</dt>
        <dd>
          <details open>
            <summary class="muted">Ver detalles</summary>
            <ul class="list mt-1">
              ${inst.services.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </details>
        </dd>
      `;
      dl.appendChild(services);
    }
  }

  // --- Acciones: Tel / WhatsApp / Google Calendar
  const actions = document.querySelector('.actions');
  if (actions) {
    const frag = document.createDocumentFragment();

    if (hasPhone) {
      const callBtn = document.createElement('a');
      callBtn.className = 'btn btn--ghost';
      callBtn.href = phoneHref;
      callBtn.textContent = `Llamar: ${inst.phone}`;
      frag.appendChild(callBtn);
    }

    if (hasWhatsApp) {
      const waBtn = document.createElement('a');
      waBtn.className = 'btn btn--ghost';
      waBtn.href = waLink;
      waBtn.target = '_blank';
      waBtn.rel = 'noopener';
      waBtn.textContent = `WhatsApp ${inst.whatsapp.replace('+54 ', '')}`;
      frag.appendChild(waBtn);
    }

    const gcal = document.createElement('a');
    gcal.className = 'btn btn--ghost';
    gcal.href = buildGoogleCalendarLink({
      title: `${snap.specialty} — ${snap.doctor}`,
      dateISO: snap.date,
      timeHHMM: snap.time,
      location: `${inst.name} ${inst.address ? '— ' + inst.address : ''}`,
      details: `Turno confirmado en MiTurnoSalud.\nEspecialidad: ${snap.specialty}\nMédico: ${snap.doctor}`
    });
    gcal.target = '_blank';
    gcal.rel = 'noopener';
    gcal.textContent = 'Agregar a Google Calendar';
    frag.appendChild(gcal);

    actions.prepend(frag);

    // Limpiar snapshot al volver al dashboard
    const backLink = actions.querySelector('a[href="dashboard.html"]');
    backLink?.addEventListener('click', () => {
      localStorage.removeItem('mts:lastConfirm');
    });
  }
});
