/* confirmar-turno.js – Resumen y acciones del turno confirmado
   - Usa utilidades de app.js: MTS.formatDateAR, MTS.formatTimeHHMM, MTS.telHref, MTS.waHref
   - Muestra datos del turno + institución
   - Accesos rápidos: Llamar / WhatsApp
   - Extra: botón "Agregar a Google Calendar"
*/
document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  // --- Cargar snapshot del turno confirmado
  const snap = (() => {
    try { return JSON.parse(localStorage.getItem('mts:lastConfirm')) || null; }
    catch { return null; }
  })();

  if (!snap) {
    // Si no hay snapshot, volvemos al dashboard
    return location.replace('dashboard.html');
  }

  // --- Helpers locales
  const { formatDateAR, formatTimeHHMM, telHref, waHref } = window.MTS;

  function safeText(v, fallback = '—') {
    return (v == null || String(v).trim() === '') ? fallback : String(v);
  }

  // Construye link de Google Calendar (evento 1h)
  function buildGoogleCalendarLink({ title, dateISO, timeHHMM, location, details }) {
    try {
      // Fecha/hora local -> objeto Date
      const [y, m, d] = dateISO.split('-').map(Number);
      const [H, M] = timeHHMM.split(':').map(Number);
      const start = new Date(y, m - 1, d, H, M || 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1h

      const toGoogleTS = (dt) => {
        const YYYY = dt.getUTCFullYear();
        const MM   = String(dt.getUTCMonth() + 1).padStart(2, '0');
        const DD   = String(dt.getUTCDate()).padStart(2, '0');
        const hh   = String(dt.getUTCHours()).padStart(2, '0');
        const mm   = String(dt.getUTCMinutes()).padStart(2, '0');
        const ss   = String(dt.getUTCSeconds()).padStart(2, '0');
        return `${YYYY}${MM}${DD}T${hh}${mm}${ss}Z`;
      };

      const s = toGoogleTS(start);
      const e = toGoogleTS(end);

      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title || 'Turno médico',
        dates: `${s}/${e}`,
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
  const inst        = snap.institution || {};
  const phoneHref   = telHref(inst.phone);
  const waLink      = waHref(inst.whatsapp);
  const hasPhone    = !!inst.phone;
  const hasWhatsApp = !!inst.whatsapp;

  // --- Render principal <dl.definition>
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
          ${hasPhone    ? `<a href="${phoneHref}">${inst.phone}</a>` : '—'}
          ${hasWhatsApp ? ` · <a target="_blank" rel="noopener" href="${waLink}">WhatsApp ${inst.whatsapp.replace('+54 ','')}</a>` : ''}
        </dd>
      </div>
    `;

    // Si la institución tiene listado de servicios, los mostramos en un bloque adicional
    if (Array.isArray(inst.services) && inst.services.length) {
      const servicesBlock = document.createElement('div');
      servicesBlock.className = 'definition__row';
      servicesBlock.innerHTML = `
        <dt>Servicios</dt>
        <dd>
          <details open>
            <summary class="muted">Ver detalles</summary>
            <ul class="list" style="margin-top:.5rem;">
              ${inst.services.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </details>
        </dd>
      `;
      dl.appendChild(servicesBlock);
    }
  }

  // --- Acciones: agregar botones Tel/WhatsApp/Calendar y limpiar snapshot al salir
  const actions = document.querySelector('.actions');
  if (actions) {
    // Insertar accesos (antes del "Volver al inicio")
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
      waBtn.textContent = `WhatsApp ${inst.whatsapp.replace('+54 ','')}`;
      frag.appendChild(waBtn);
    }

    // Botón para agregar al Google Calendar
    const gcal = document.createElement('a');
    gcal.className = 'btn btn--ghost';
    gcal.href = buildGoogleCalendarLink({
      title: `${snap.specialty} — ${snap.doctor}`,
      dateISO: snap.date,
      timeHHMM: timeDisplay,
      location: `${safeText(inst.name)} ${inst.address ? '— ' + inst.address : ''}`,
      details: `Turno confirmado en MiTurnoSalud.\nEspecialidad: ${snap.specialty}\nMédico: ${snap.doctor}`
    });
    gcal.target = '_blank';
    gcal.rel = 'noopener';
    gcal.textContent = 'Agregar a Google Calendar';
    frag.appendChild(gcal);

    actions.prepend(frag);

    // Al volver al inicio, limpiamos el snapshot
    const backLink = actions.querySelector('a.btn.btn--primary[href="dashboard.html"]');
    backLink?.addEventListener('click', () => {
      localStorage.removeItem('mts:lastConfirm');
    });
  }
});
