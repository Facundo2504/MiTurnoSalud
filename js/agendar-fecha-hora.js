/* agendar-fecha-hora.js */
document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  const draft = MTS.Draft.get();
  if (!draft.specialty || !draft.doctor) return location.replace('agendar-especialidad.html');

  const form = document.querySelector('form.form');
  const inputDate = document.querySelector('#fecha');
  const inputTime = document.querySelector('#hora');

  // Restricción mínima: hoy
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  inputDate.min = `${yyyy}-${mm}-${dd}`;

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = inputDate.value;   // yyyy-mm-dd
    const time = inputTime.value;   // HH:mm
    if (!date || !time) return alert('Completa fecha y hora.');
    MTS.Draft.set({ date, time });
    location.assign('agendar-institucion.html');
  });
});
