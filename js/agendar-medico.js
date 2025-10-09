/* agendar-medico.js – Paso 2 del flujo de turnos
   - Muestra médicos según la especialidad seleccionada
   - Valida selección, guarda en MTS.Draft y avanza a agendar-fecha-hora.html
   - Feedback accesible y UX coherente con todo el sistema
*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    Auth.requireAuth();
  } catch {
    location.replace('index.html');
    return;
  }

  const draft = MTS.Draft.get();
  const data = MTS.Data();

  // Si no hay especialidad previa, volver al paso 1
  if (!draft.specialty) {
    location.replace('agendar-especialidad.html');
    return;
  }

  const sel = document.querySelector('#medico');
  const form = document.querySelector('form.form');
  const btnSubmit = form?.querySelector('button[type="submit"]');
  const espLabel = document.querySelector('#especialidad-activa');

  // Mostrar especialidad seleccionada
  if (espLabel) espLabel.textContent = `Especialidad seleccionada: ${draft.specialty}`;

  // Feedback accesible (si no existe, crear)
  let feedback = form.querySelector('.form__feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form__feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);
  }

  // Cargar médicos según la especialidad
  const doctors = data.doctorsBySpecialty[draft.specialty] || [];
  sel.innerHTML = `<option value="" disabled selected>Seleccione…</option>`
    + doctors.map(d => `<option value="${d}">${d}</option>`).join('');

  // Limpiar feedback al cambiar
  sel?.addEventListener('change', clearFeedback);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback();

    const doctor = sel.value;
    if (!doctor) {
      sel.classList.add('is-invalid');
      showFeedback('⚠️ Selecciona un médico para continuar.', 'error');
      return;
    }

    lock(true);
    MTS.Draft.set({ doctor });
    showFeedback('✅ Médico seleccionado. Avanzando…', 'success');
    setTimeout(() => location.assign('agendar-fecha-hora.html'), 600);
  });

  /* ------------------ Helpers ------------------ */
  function showFeedback(msg, type = 'info') {
    feedback.textContent = msg;
    feedback.classList.remove('error', 'success');
    feedback.classList.add(type);
  }

  function clearFeedback() {
    sel.classList.remove('is-invalid');
    feedback.textContent = '';
    feedback.classList.remove('error', 'success');
  }

  function lock(state) {
    if (!btnSubmit) return;
    btnSubmit.disabled = state;
    btnSubmit.textContent = state ? 'Guardando…' : 'Continuar';
  }
});
