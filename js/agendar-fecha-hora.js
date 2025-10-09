/* agendar-fecha-hora.js – Paso 3 del flujo de turnos */
document.addEventListener('DOMContentLoaded', () => {
  try { Auth.requireAuth(); } catch { location.replace('index.html'); return; }

  const draft = MTS.Draft.get();
  if (!draft.specialty || !draft.doctor) { location.replace('agendar-especialidad.html'); return; }

  const form = document.querySelector('form.form');
  const inputDate = document.querySelector('#fecha');
  const inputTime = document.querySelector('#hora');
  const btnSubmit = form?.querySelector('button[type="submit"]');

  let feedback = form.querySelector('.form__feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form__feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);
  }

  // --- Helpers de fecha robustos ---
  const todayIso = MTS.todayISO(); // "YYYY-MM-DD"
  if (inputDate) inputDate.min = todayIso;

  const toIso = (val) => {
    if (!val) return null;
    const v = String(val).trim();
    // "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    // "DD/MM/YYYY"
    const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return null; // formato desconocido
  };

  const ymdNum = (iso) => {
    if (!iso) return NaN;
    const [y, m, d] = iso.split('-').map(Number);
    return y * 10000 + m * 100 + d;
  };

  // Limpiar feedback al cambiar
  [inputDate, inputTime].forEach(el => el?.addEventListener('input', clearFeedback));

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback();

    const dateRaw = inputDate.value;          // puede ser "2025-11-25" o "25/11/2025" según entorno
    const dateIso = toIso(dateRaw);           // normalizamos a "YYYY-MM-DD"
    const time    = inputTime.value;
    const todayN  = ymdNum(todayIso);
    const dateN   = ymdNum(dateIso);

    if (!dateIso || !time) {
      if (!dateIso) inputDate.classList.add('is-invalid');
      if (!time)    inputTime.classList.add('is-invalid');
      showFeedback('⚠️ Debes seleccionar fecha y hora.', 'error');
      return;
    }

    if (isNaN(dateN) || dateN < todayN) {
      inputDate.classList.add('is-invalid');
      showFeedback('⚠️ La fecha seleccionada no puede ser anterior a hoy.', 'error');
      return;
    }

    lock(true);
    MTS.Draft.set({ date: dateIso, time });
    showFeedback('✅ Fecha y hora guardadas. Avanzando…', 'success');
    setTimeout(() => location.assign('agendar-institucion.html'), 600);
  });

  // --- Helpers UI ---
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
