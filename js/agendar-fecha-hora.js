/* agendar-fecha-hora.js – Paso 3 del flujo de turnos
   - Valida fecha y hora seleccionadas
   - Guarda en MTS.Draft y avanza a agendar-institucion.html
   - Feedback accesible y UX coherente con los pasos previos
*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    Auth.requireAuth();
  } catch {
    location.replace('index.html');
    return;
  }

  const draft = MTS.Draft.get();
  if (!draft.specialty || !draft.doctor) {
    location.replace('agendar-especialidad.html');
    return;
  }

  const form = document.querySelector('form.form');
  const inputDate = document.querySelector('#fecha');
  const inputTime = document.querySelector('#hora');
  const btnSubmit = form?.querySelector('button[type="submit"]');

  // Feedback accesible
  let feedback = form.querySelector('.form__feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form__feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);
  }

  // Establecer fecha mínima (hoy)
  const today = MTS.todayISO();
  if (inputDate) inputDate.min = today;

  // Limpiar feedback al cambiar valores
  [inputDate, inputTime].forEach(el => el?.addEventListener('input', clearFeedback));

  // Envío del formulario
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback();

    const date = inputDate.value;
    const time = inputTime.value;

    if (!date || !time) {
      if (!date) inputDate.classList.add('is-invalid');
      if (!time) inputTime.classList.add('is-invalid');
      showFeedback('⚠️ Debes seleccionar fecha y hora.', 'error');
      return;
    }

    // Validar que la fecha no sea anterior a hoy
    if (date < today) {
      inputDate.classList.add('is-invalid');
      showFeedback('⚠️ La fecha seleccionada no puede ser anterior a hoy.', 'error');
      return;
    }

    lock(true);
    MTS.Draft.set({ date, time });
    showFeedback('✅ Fecha y hora guardadas. Avanzando…', 'success');
    setTimeout(() => location.assign('agendar-institucion.html'), 600);
  });

  /* -------------------- Helpers -------------------- */
  function showFeedback(msg, type = 'info') {
    feedback.textContent = msg;
    feedback.classList.remove('error', 'success');
    feedback.classList.add(type);
  }

  function clearFeedback() {
    feedback.textContent = '';
    feedback.classList.remove('error', 'success');
    inputDate?.classList.remove('is-invalid');
    inputTime?.classList.remove('is-invalid');
  }

  function lock(state) {
    if (!btnSubmit) return;
    btnSubmit.disabled = state;
    btnSubmit.textContent = state ? 'Guardando…' : 'Continuar';
  }
});
