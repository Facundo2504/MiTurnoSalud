/* js/agendar-institucion.js
   Paso 4: Seleccionar institución + Confirmar turno
   - Render dinámico desde MTS.Data().institutions (con servicios, tel y WhatsApp)
   - Selección accesible con mouse/teclado (Enter/Espacio)
   - Validación de flujo (requiere draft completo)
   - Guarda turno en mts:appointments y snapshot en mts:lastConfirm
*/
document.addEventListener('DOMContentLoaded', () => {
  // 1) Seguridad de ruta
  Auth.requireAuth();

  // 2) Verificar que el draft tenga los pasos previos completos
  const draft = MTS.Draft.get();
  const hasStep1 = !!draft.specialty;
  const hasStep2 = !!draft.doctor;
  const hasStep3 = !!draft.date && !!draft.time;
  if (!hasStep1 || !hasStep2 || !hasStep3) {
    // Si falta algo, volvemos al inicio del flujo
    return location.replace('agendar-especialidad.html');
  }

  // 3) Referencias de UI
  const data = MTS.Data();
  const list = document.querySelector('.list--cards');
  const btnConfirmar = document.querySelector('.actions .btn.btn--primary');

  // 4) Helpers locales
  const digitsOnly = (v = '') => (v || '').toString().replace(/\D/g, '');
  const ariaSelect = (cardEl, selected) => {
    cardEl.setAttribute('aria-selected', selected ? 'true' : 'false');
    cardEl.style.outline = selected ? '3px solid var(--brand-500)' : '';
  };
  const buildServices = (services) => {
    if (!Array.isArray(services) || !services.length) return '';
    return `
      <details>
        <summary><strong>Servicios</strong></summary>
        <ul class="list">
          ${services.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </details>
    `;
  };
  const buildActions = (inst) => {
    const telHref = inst.phone ? `tel:${digitsOnly(inst.phone)}` : null;
    const waHref  = inst.whatsapp ? `https://wa.me/${digitsOnly(inst.whatsapp)}` : null;

    const telBtn = inst.phone
      ? `<a class="btn btn--ghost" href="${telHref}">Tel: ${inst.phone.replace('+54 ','')}</a>`
      : '';

    const waBtn = inst.whatsapp
      ? `<a class="btn btn--ghost" target="_blank" rel="noopener" href="${waHref}">WhatsApp ${inst.whatsapp.replace('+54 ','')}</a>`
      : '';

    return `<div class="actions mt-4">${waBtn}${telBtn}</div>`;
  };

  // 5) Renderizado de instituciones
  function renderInstitutions() {
    if (!data.institutions?.length) {
      list.innerHTML = `<li class="muted">No hay instituciones cargadas. Intenta más tarde.</li>`;
      return;
    }

    list.innerHTML = data.institutions.map(inst => `
      <li>
        <article class="card js-card" data-id="${inst.id}" tabindex="0" role="option" aria-selected="false">
          <div class="card__body">
            <h3 class="card__title">${inst.name}</h3>
            ${inst.address ? `<p class="muted">Dirección: ${inst.address}</p>` : ''}
            ${buildServices(inst.services)}
            ${buildActions(inst)}
          </div>
          <footer class="card__footer">
            <button class="btn btn--primary js-select" data-id="${inst.id}">Seleccionar</button>
          </footer>
        </article>
      </li>
    `).join('');
  }

  renderInstitutions();

  // 6) Manejo de selección
  let selected = null;

  // Click en botón "Seleccionar"
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-select');
    if (!btn) return;

    const id = btn.dataset.id;
    selected = data.institutions.find(i => i.id === id) || null;

    // Visual de selección (limpiar y marcar)
    document.querySelectorAll('.js-card').forEach(c => ariaSelect(c, false));
    const card = btn.closest('.js-card');
    if (card) ariaSelect(card, true);
  });

  // Seleccionar con Enter/Espacio sobre toda la tarjeta
  list.addEventListener('keydown', (e) => {
    const card = e.target.closest('.js-card');
    if (!card) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const id = card.dataset.id;
      selected = data.institutions.find(i => i.id === id) || null;

      document.querySelectorAll('.js-card').forEach(c => ariaSelect(c, false));
      ariaSelect(card, true);
    }
  });

  // 7) Confirmar turno
  btnConfirmar?.addEventListener('click', (e) => {
    e.preventDefault();

    if (!selected) {
      alert('Selecciona una institución para continuar.');
      // Llevar el foco a la primera tarjeta si no hay selección
      const firstCard = document.querySelector('.js-card');
      firstCard?.focus();
      return;
    }

    // Persistir institución en el draft
    MTS.Draft.set({ institution: selected });

    // Guardar turno final en APPOINTMENTS
    const user = Auth.currentUser();
    MTS.Appointments.add({
      userEmail: user.email,
      ...MTS.Draft.get()
    });

    // Guardar snapshot para la pantalla de confirmación y limpiar draft
    localStorage.setItem('mts:lastConfirm', JSON.stringify(MTS.Draft.get()));
    MTS.Draft.clear();

    // Redirigir a Confirmación
    location.assign('confirmar-turno.html');
  });
});
