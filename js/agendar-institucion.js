/* agendar-institucion.js – Paso 4: Selección de institución
   - Render dinámico desde MTS.Data().institutions
   - Selección con clic o teclado (Enter/Espacio)
   - Guarda la institución en MTS.Draft
   - Crea el turno en mts:appointments y snapshot en mts:lastConfirm
   - Feedback accesible y validación del flujo
*/
document.addEventListener('DOMContentLoaded', () => {
  try {
    Auth.requireAuth();
  } catch {
    location.replace('index.html');
    return;
  }

  const draft = MTS.Draft.get();
  const ready = draft.specialty && draft.doctor && draft.date && draft.time;
  if (!ready) {
    location.replace('agendar-especialidad.html');
    return;
  }

  const data = MTS.Data();
  const list = document.querySelector('.list--cards');
  const btnConfirmar = document.querySelector('.actions .btn.btn--primary');

  // Feedback accesible global
  let feedback = document.querySelector('.form__feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form__feedback';
    feedback.setAttribute('aria-live', 'polite');
    const panel = document.querySelector('.panel');
    panel?.appendChild(feedback);
  }

  /* ----------------- Helpers ----------------- */
  const digitsOnly = (v = '') => (v || '').toString().replace(/\D/g, '');
  const ariaSelect = (cardEl, selected) => {
    cardEl.setAttribute('aria-selected', selected ? 'true' : 'false');
    cardEl.style.outline = selected ? '3px solid var(--brand-500)' : '';
  };

  const buildServices = (services = []) =>
    services.length
      ? `
        <details>
          <summary><strong>Servicios</strong></summary>
          <ul class="list">
            ${services.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </details>
      `
      : '';

  const buildActions = (inst) => {
    const telHref = inst.phone ? `tel:${digitsOnly(inst.phone)}` : null;
    const waHref  = inst.whatsapp ? `https://wa.me/${digitsOnly(inst.whatsapp)}` : null;

    const telBtn = inst.phone
      ? `<a class="btn btn--ghost" href="${telHref}">Tel: ${inst.phone.replace('+54 ', '')}</a>`
      : '';

    const waBtn = inst.whatsapp
      ? `<a class="btn btn--ghost" target="_blank" rel="noopener" href="${waHref}">WhatsApp ${inst.whatsapp.replace('+54 ', '')}</a>`
      : '';

    return `<div class="actions mt-4">${waBtn}${telBtn}</div>`;
  };

  /* ----------------- Renderizado ----------------- */
  function renderInstitutions() {
    if (!list) return;
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

  /* ----------------- Selección ----------------- */
  let selected = null;

  // Selección por clic
  list?.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-select');
    if (!btn) return;

    const id = btn.dataset.id;
    selected = data.institutions.find(i => i.id === id) || null;

    document.querySelectorAll('.js-card').forEach(c => ariaSelect(c, false));
    const card = btn.closest('.js-card');
    if (card) ariaSelect(card, true);

    showFeedback(`🏥 ${selected?.name} seleccionada.`, 'success');
  });

  // Selección por teclado (Enter o Espacio)
  list?.addEventListener('keydown', (e) => {
    const card = e.target.closest('.js-card');
    if (!card) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const id = card.dataset.id;
      selected = data.institutions.find(i => i.id === id) || null;

      document.querySelectorAll('.js-card').forEach(c => ariaSelect(c, false));
      ariaSelect(card, true);
      showFeedback(`🏥 ${selected?.name} seleccionada.`, 'success');
    }
  });

  /* ----------------- Confirmación ----------------- */
  btnConfirmar?.addEventListener('click', (e) => {
    e.preventDefault();

    if (!selected) {
      showFeedback('⚠️ Debes seleccionar una institución antes de confirmar.', 'error');
      const firstCard = document.querySelector('.js-card');
      firstCard?.focus();
      return;
    }

    MTS.Draft.set({ institution: selected });
    const user = Auth.currentUser();

    const newAppt = MTS.Appointments.add({
      userEmail: user.email,
      ...MTS.Draft.get()
    });

    // Guardar snapshot de confirmación y limpiar draft
    localStorage.setItem('mts:lastConfirm', JSON.stringify(newAppt));
    MTS.Draft.clear();

    showFeedback('✅ Turno confirmado. Redirigiendo…', 'success');
    setTimeout(() => location.assign('confirmar-turno.html'), 700);
  });

  /* ----------------- Feedback Helper ----------------- */
  function showFeedback(msg, type = 'info') {
    feedback.textContent = msg;
    feedback.classList.remove('error', 'success');
    feedback.classList.add(type);
  }
});
