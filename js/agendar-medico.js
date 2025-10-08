/* agendar-medico.js */
document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  const draft = MTS.Draft.get();
  const data = MTS.Data();

  if (!draft.specialty) return location.replace('agendar-especialidad.html');

  const sel = document.querySelector('#medico');
  const form = document.querySelector('form.form');

  // Cargar médicos según especialidad
  const doctors = data.doctorsBySpecialty[draft.specialty] || [];
  sel.innerHTML = `<option value="" disabled selected>Seleccione…</option>`
    + doctors.map(d => `<option>${d}</option>`).join('');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const doctor = sel.value;
    if (!doctor) return alert('Selecciona un médico.');
    MTS.Draft.set({ doctor });
    location.assign('agendar-fecha-hora.html');
  });
});
