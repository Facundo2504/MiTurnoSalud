/* dashboard.js */
document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  const user = Auth.currentUser();
  const listContainer = document.querySelector('.cards');
  const btnRecordatorio = document.querySelector('.btn.btn--primary');

  // Render turnos del usuario
  const appts = MTS.Appointments.list().filter(a => a.userEmail === user.email);
  renderAppointments(appts);

  btnRecordatorio?.addEventListener('click', () => {
    if (!appts.length) return alert('No tienes turnos próximos.');
    // Simulación de recordatorio
    alert('Recordatorio enviado ✅');
  });

  function renderAppointments(items) {
    if (!listContainer) return;
    if (!items.length) {
      listContainer.innerHTML = `<p class="muted">No tienes turnos aún. <a href="agendar-especialidad.html">Agenda uno</a>.</p>`;
      return;
    }
    listContainer.innerHTML = items.map(appt => `
      <article class="card card--turno">
        <header class="card__header">
          <div aria-hidden="true">📅</div>
          <p class="card__subtitle">${formatDateTime(appt.date, appt.time)}</p>
        </header>
        <div class="card__body">
          <div class="card__title">${appt.specialty} - ${appt.doctor}</div>
          <p class="muted">${appt.institution?.name ?? ''}</p>
        </div>
      </article>
    `).join('');
  }

  function formatDateTime(dateISO, time) {
    try {
      const [y, m, d] = dateISO.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) + `, ${time}`;
    } catch { return `${dateISO} ${time}`; }
  }
});
