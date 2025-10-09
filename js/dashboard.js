/* dashboard.js – Panel principal de MiTurnoSalud
   Funcionalidades:
   - Listar turnos del usuario actual
   - Cancelar turno con confirmación
   - Simular recordatorio
   - Actualización dinámica del listado
*/
document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();

  const user = Auth.currentUser();
  const listContainer = document.querySelector('.cards');
  const btnRecordatorio = document.querySelector('#btnRecordatorio');
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.className = 'sr-only';
  document.body.appendChild(liveRegion);

  // Helpers del núcleo (app.js)
  const { formatDateAR, formatTimeHHMM } = MTS;

  // Render inicial
  renderAppointments();

  // ---- Recordatorio (simulado)
  btnRecordatorio?.addEventListener('click', () => {
    const appts = MTS.Appointments.list({ userEmail: user.email });
    if (!appts.length) return alert('No tienes turnos próximos.');
    alert(`📅 Recordatorio enviado para ${appts.length} turno(s).`);
    liveRegion.textContent = `Recordatorio enviado para ${appts.length} turno${appts.length > 1 ? 's' : ''}.`;
  });

  // ---- Render de turnos
  function renderAppointments() {
    const appts = MTS.Appointments.list({ userEmail: user.email });

    if (!listContainer) return;
    if (!appts.length) {
      listContainer.innerHTML = `
        <div class="empty">
          <p class="muted">Aún no tienes turnos agendados.</p>
          <a href="agendar-especialidad.html" class="btn btn--primary mt-2">Agendar un turno</a>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = appts.map(appt => `
      <article class="card card--turno" data-id="${appt.id}">
        <header class="card__header">
          <div aria-hidden="true">📅</div>
          <p class="card__subtitle">${formatDateAR(appt.date)}, ${formatTimeHHMM(appt.time)}</p>
        </header>
        <div class="card__body">
          <div class="card__title">${appt.specialty} — ${appt.doctor}</div>
          <p class="muted">${appt.institution?.name ?? ''}</p>
          <p class="muted">${appt.institution?.address ?? ''}</p>
        </div>
        <footer class="card__footer">
          <button class="btn btn--ghost js-cancel">Cancelar turno</button>
        </footer>
      </article>
    `).join('');

    attachCancelHandlers();
  }

  // ---- Cancelación de turno
  function attachCancelHandlers() {
    listContainer.querySelectorAll('.js-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        const id = card?.dataset.id;
        if (!id) return;
        const appt = MTS.Appointments.list().find(a => a.id === id);
        if (!appt) return;

        const confirmMsg = `¿Seguro que deseas cancelar el turno de ${appt.specialty} con ${appt.doctor} (${formatDateAR(appt.date)} ${appt.time})?`;
        if (!confirm(confirmMsg)) return;

        MTS.Appointments.removeById(id);
        alert('Turno cancelado con éxito.');
        liveRegion.textContent = 'Turno cancelado correctamente.';
        renderAppointments();
      });
    });
  }
});
