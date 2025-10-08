/* agendar-institucion.js */
document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  const draft = MTS.Draft.get();
  if (!draft.specialty || !draft.doctor || !draft.date || !draft.time)
    return location.replace('agendar-especialidad.html');

  const data = MTS.Data();
  const list = document.querySelector('.list--cards');
  const btnConfirmar = document.querySelector('.actions .btn');

  // Render instituciones
  list.innerHTML = data.institutions.map(inst => `
    <li>
      <article class="card" data-id="${inst.id}">
        <div class="card__body">
          <h3 class="card__title">${inst.name}</h3>
          <p><a href="#" tabindex="-1">${inst.address}</a></p>
          <p><a href="tel:${inst.phone.replace(/[^0-9]/g,'')}">${inst.phone}</a></p>
        </div>
        <footer class="card__footer">
          <button class="btn btn--primary js-select" data-id="${inst.id}">Seleccionar</button>
        </footer>
      </article>
    </li>
  `).join('');

  let selected = null;

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-select');
    if (!btn) return;
    selected = data.institutions.find(i => i.id === btn.dataset.id);
    document.querySelectorAll('.card').forEach(c => c.style.outline = '');
    btn.closest('.card').style.outline = '3px solid var(--brand-500)';
  });

  btnConfirmar?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!selected) return alert('Selecciona una institución.');
    MTS.Draft.set({ institution: selected });
    // Guardar turno final
    const user = Auth.currentUser();
    MTS.Appointments.add({
      userEmail: user.email,
      ...MTS.Draft.get()
    });
    const last = MTS.Draft.get();
    // Mantener un snapshot para confirmación y limpiar draft
    localStorage.setItem('mts:lastConfirm', JSON.stringify(last));
    MTS.Draft.clear();
    location.assign('confirmar-turno.html');
  });
});
