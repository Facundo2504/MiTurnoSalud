/* =========================================================
   agendar-fecha-hora.js — Paso 3 del flujo MiTurnoSalud
   - Controla validación de fecha y hora
   - Persiste datos en localStorage (draft)
   - Redirige al paso 4: institución
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // --- Seguridad ---
  try { Auth.requireAuth(); } catch { location.replace('index.html'); return; }

  const draft = MTS.Draft.get();

  // --- Validación de pasos previos ---
  if (!draft.especialidad || !draft.medico) {
    location.replace('agendar-especialidad.html');
    return;
  }

  // --- Referencias principales ---
  const form = document.getElementById('formFechaHora');
  const inputDate = document.getElementById('fecha');
  const btnSubmit = form?.querySelector('button[type="submit"]');
  let feedback = form.querySelector('.form__feedback');

  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form__feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);
  }

  // --- Configurar fecha mínima ---
  const todayIso = MTS.todayISO();
  if (inputDate) inputDate.min = todayIso;

  // --- Funciones auxiliares ---
  const toIso = (val) => {
    if (!val) return null;
    const v = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; // YYYY-MM-DD
    const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); // DD/MM/YYYY
    return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
  };

  const ymdNum = (iso) => iso ? iso.split('-').map(Number).reduce((a, b, i) => a * (i ? 100 : 1) + b) : NaN;

  // --- Interactividad visual ---
  document.querySelectorAll('.time input[name="hora"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.time').forEach(el => el.classList.remove('time--selected'));
      e.target.closest('.time')?.classList.add('time--selected');
      clearFeedback();
    });
  });

  inputDate?.addEventListener('input', clearFeedback);

  // --- Evento de envío ---
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback();

    const dateIso = toIso(inputDate?.value);
    const timeEl  = document.querySelector('input[name="hora"]:checked');
    const time    = timeEl ? timeEl.value : '';

    // Validaciones básicas
    if (!dateIso || !time) {
      if (!dateIso) inputDate?.classList.add('is-invalid');
      if (!time) document.querySelectorAll('.time').forEach(el => el.classList.add('is-invalid'));
      showFeedback('⚠️ Debes seleccionar fecha y hora.', 'error');
      return;
    }

    if (isNaN(ymdNum(dateIso)) || ymdNum(dateIso) < ymdNum(todayIso)) {
      inputDate?.classList.add('is-invalid');
      showFeedback('⚠️ La fecha seleccionada no puede ser anterior a hoy.', 'error');
      return;
    }

    // --- Guardar en el draft ---
    lock(true);
    MTS.Draft.set({ fecha: dateIso, hora: time });

    showFeedback('✅ Fecha y hora guardadas. Redirigiendo…', 'success');
    setTimeout(() => location.assign('agendar-institucion.html'), 600);
  });

  // --- Funciones de interfaz ---
  function showFeedback(msg, type = 'info') {
    feedback.textContent = msg;
    feedback.classList.remove('error', 'success');
    feedback.classList.add(type);
  }

  function clearFeedback() {
    feedback.textContent = '';
    feedback.classList.remove('error', 'success');
    inputDate?.classList.remove('is-invalid');
    document.querySelectorAll('.time').forEach(el => el.classList.remove('is-invalid'));
  }

  function lock(state) {
    if (!btnSubmit) return;
    btnSubmit.disabled = state;
    btnSubmit.textContent = state ? 'Guardando…' : 'Continuar — Elegir institución';
  }
});
