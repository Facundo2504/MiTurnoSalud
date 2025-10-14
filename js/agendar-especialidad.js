/* agendar-especialidad.js – Paso 1 (versión final)
   - Valida especialidad (contra datalist o dataset local)
   - Guarda en localStorage como `especialidad` (clave consistente)
   - Mergea con el draft previo (sin sobrescribir)
   - Avanza a agendar-medico.html
*/
document.addEventListener('DOMContentLoaded', () => {
  // Guard de sesión
  try { Auth?.requireAuth?.(); } catch { location.replace('index.html'); return; }

  const form  = document.querySelector('form.form');
  const input = document.querySelector('#especialidad');
  const btn   = form?.querySelector('button[type="submit"]');

  if (!form || !input) return;

  // Feedback accesible
  let feedback = form.querySelector('.form__feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form__feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);
  }

  // Fuente de verdad para validación: opciones del datalist (fallback a MTS.Data)
  const datalistOptions = Array.from(document.querySelectorAll('#especialidades option'))
    .map(o => (o.value || '').trim())
    .filter(Boolean);

  const fallback = (typeof MTS?.Data === 'function' && Array.isArray(MTS.Data().specialties))
    ? MTS.Data().specialties
    : [];

  const validList = (datalistOptions.length ? datalistOptions : fallback)
    .map(s => s.toLowerCase());

  // Limpia errores al tipear
  input.addEventListener('input', () => clearFeedback());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback();

    const valor = (input.value || '').trim();
    if (!validList.includes(valor.toLowerCase())) {
      setError(input, '⚠️ Seleccioná una especialidad válida del listado.');
      return;
    }

    lock(true);

    // Merge seguro del borrador (SIN sobrescribir otras claves)
    const prev = JSON.parse(localStorage.getItem('mts.draft') || '{}');
    const next = { ...prev, especialidad: valor };
    localStorage.setItem('mts.draft', JSON.stringify(next));

    show('✅ Especialidad guardada. Avanzando…', 'success');
    setTimeout(() => location.assign('agendar-medico.html'), 600);
  });

  /* ---------- Helpers UI ---------- */
  function show(msg, type='info'){
    feedback.textContent = msg;
    feedback.classList.remove('error','success');
    feedback.classList.add(type);
  }
  function clearFeedback(){
    feedback.textContent = '';
    feedback.classList.remove('error','success');
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
  }
  function setError(el, msg){
    el.classList.add('is-invalid');
    el.setAttribute('aria-invalid','true');
    show(msg,'error');
    el.focus();
  }
  function lock(state){
    if (!btn) return;
    btn.disabled = state;
    btn.textContent = state ? 'Guardando…' : 'Siguiente — Elegir médico';
  }
});
