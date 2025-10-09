/* dashboard.js – Panel principal de MiTurnoSalud
   Funcionalidades:
   - Listar turnos del usuario actual en orden cronológico
   - Cancelar turno con confirmación
   - Simular recordatorio
   - Actualización dinámica accesible
*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    Auth.requireAuth();
  } catch {
    location.replace('index.html');
    return;
  }

  const user = Auth.currentUser();
  const listContainer = document.querySelector('.cards');
  const btnRecordatorio = document.querySelector('#btnRecordatorio');
  const liveRegion = document.createElement('div');
  liveRegion.className = 'sr-only';
  liveRegion.setAttribute('aria-live', 'polite');
  document.body.appendChild(liveRegion);

  if (!listContainer || !user) return;

  const { formatDateAR, formatTimeHHMM } = MTS;

  /* ---------- Render inicial ---------- */
  renderAppointments();

  /* ---------- Recordatorio (simulado) ---------- */
  btnRecordatorio?.addEventListener('click', () => {
    const appts = MTS.Appointments.upcoming({ userEmail: user.email });
    if (!appts.length) {
      alert('No tienes turnos próximos.');
      return;
    }

    const msg = `📅 Se envió recordatorio para ${appts.length} turno${appts.length > 1 ? 's' : ''}.`;
    alert(msg);
    liveRegion.textContent = msg;
  });

  /* ---------- Delegación: Cancelar turno ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-cancel');
    if (!btn) return;

    const card = btn.closest('.card');
    const id = card?.dataset.id;
    if (!id) return;

    const appt = MTS.Appointments.list().find(a => a.id === id);
    if (!appt) return;

    const confirmMsg = `¿Seguro que deseas cancelar el turno de ${appt.specialty} con ${appt.doctor} (${formatDateAR(appt.date)} ${appt.time})?`;
    if (!confirm(confirmMsg)) return;

    // Animación antes de eliminar
    card.style.opacity = '0.6';
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
      MTS.Appointments.removeById(id);
      liveRegion.textContent = 'Turno cancelado correctamente.';
      renderAppointments();
    }, 250);
  });

  /* ---------- Render de turnos ---------- */
  function renderAppointments() {
    const appts = MTS.Appointments.upcoming({ userEmail: user.email });

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

    // A11y: anunciar la actualización de lista
    liveRegion.textContent = `Lista actualizada: ${appts.length} turno${appts.length > 1 ? 's' : ''} en total.`;
  }
});
