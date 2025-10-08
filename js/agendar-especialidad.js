/* agendar-especialidad.js */
document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  const data = MTS.Data();
  const input = document.querySelector('#especialidad');
  const form = document.querySelector('form.form');

  // Autocompletar (datalist ya ayuda, esto valida)
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const specialty = (input.value || '').trim();
    if (!data.specialties.includes(specialty)) {
      return alert('Selecciona una especialidad válida.');
    }
    MTS.Draft.set({ specialty });
    location.assign('agendar-medico.html');
  });
});
