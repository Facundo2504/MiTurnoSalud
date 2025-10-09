/* agendar-fecha-hora.js – Paso 3 (versión final) */
document.addEventListener('DOMContentLoaded', () => {
  try { Auth.requireAuth(); } catch { location.replace('index.html'); return; }

  const draft = MTS.Draft.get();
  if (!draft.specialty || !draft.doctor) { location.replace('agendar-especialidad.html'); return; }

  const form = document.querySelector('form.form');
  const inputDate = document.querySelector('#fecha');
  const btnSubmit = form?.querySelector('button[type="submit"]');

  // feedback accesible
  let feedback = form.querySelector('.form__feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form__feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);
  }

  // --- Helpers de fecha robustos ---
  const todayIso = MTS.todayISO();
  if (inputDate) inputDate.min = todayIso;

  const toIso = (val) => {
    if (!val) return null;
    const v = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;                // YYYY-MM-DD
    const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);           // DD/MM/YYYY
    return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
  };
  const ymdNum = (iso) => iso ? iso.split('-').map(Number).reduce((a,b,i)=>a* (i?100:1) + b) : NaN;

  // resalta horario seleccionado (opcional)
  document.querySelectorAll('.time input[name="hora"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.time').forEach(el => el.classList.remove('time--selected'));
      e.target.closest('.time')?.classList.add('time--selected');
      clearFeedback();
    });
  });

  inputDate?.addEventListener('input', clearFeedback);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFeedback();

    const dateIso = toIso(inputDate?.value);
    const timeEl  = document.querySelector('input[name="hora"]:checked');
    const time    = timeEl ? timeEl.value : '';

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

    lock(true);
    MTS.Draft.set({ date: dateIso, time });
    showFeedback('✅ Fecha y hora guardadas. Avanzando…', 'success');
    setTimeout(() => location.assign('agendar-institucion.html'), 600);
  });

  /* -------- Helpers UI -------- */
  function showFeedback(msg, type='info'){ feedback.textContent = msg; feedback.classList.remove('error','success'); feedback.classList.add(type); }
  function clearFeedback(){
    feedback.textContent = ''; feedback.classList.remove('error','success');
    inputDate?.classList.remove('is-invalid');
    document.querySelectorAll('.time').forEach(el => el.classList.remove('is-invalid'));
  }
  function lock(state){ if(!btnSubmit) return; btnSubmit.disabled = state; btnSubmit.textContent = state ? 'Guardando…' : 'Continuar — Elegir institución'; }
});
