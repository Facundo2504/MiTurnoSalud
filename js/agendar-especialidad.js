/* agendar-especialidad.js – Paso 1 del flujo de turnos
   - Valida especialidad seleccionada o escrita
   - Guarda en MTS.Draft y avanza a agendar-medico.html
   - Feedback accesible y bloqueo de envío duplicado
*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    Auth.requireAuth();
  } catch {
    location.replace('index.html');
    return;
  }

  const data = MTS.Data();
  const input = document.querySelector('#especialidad');
  const form  = document.querySelector('form.form');
  const btnSubmit = form?.querySelector('button[type="submit"]');

  // feedback accesible (crea si no existe)
  let feedback = form.querySelector('.form__feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form__feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);
  }

  if (!form || !input) return;

  // limpiar error al escribir
  input.addEventListener('input', () => clearFeedback());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback();

    const specialty = (input.value || '').trim();
    const validSpecialties = data.specialties.map(s => s.toLowerCase());
    if (!validSpecialties.includes(specialty.toLowerCase())) {
      showFeedback('⚠️ Selecciona una especialidad válida del listado.', 'error');
      input.classList.add('is-invalid');
      input.focus();
      return;
    }

    // guardar en draft y avanzar
    lock(true);
    MTS.Draft.set({ specialty });
    showFeedback('✅ Especialidad guardada. Avanzando…', 'success');
    setTimeout(() => location.assign('agendar-medico.html'), 600);
  });

  /* ------------------ Helpers UI ------------------ */
  function showFeedback(msg, type = 'info') {
    feedback.textContent = msg;
    feedback.classList.remove('error', 'success');
    feedback.classList.add(type);
  }

  function clearFeedback() {
    feedback.textContent = '';
    feedback.classList.remove('error', 'success');
    input.classList.remove('is-invalid');
  }

  function lock(state) {
    if (!btnSubmit) return;
    btnSubmit.disabled = state;
    btnSubmit.textContent = state ? 'Guardando…' : 'Continuar';
  }
});
