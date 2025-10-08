/* confirmar-turno.js */
document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  const snap = (function(){
    try { return JSON.parse(localStorage.getItem('mts:lastConfirm')) || null; }
    catch { return null; }
  })();

  if (!snap) return location.replace('dashboard.html');

  const dl = document.querySelector('.definition');
  const phone = snap.institution?.phone || '';
  const fmtDate = (() => {
    const [y,m,d] = snap.date.split('-').map(Number);
    return new Date(y, m-1, d).toLocaleDateString('es-AR', { day:'2-digit', month:'long', year:'numeric' });
  })();

  dl.innerHTML = `
    <div class="definition__row"><dt>Especialidad</dt><dd>${snap.specialty}</dd></div>
    <div class="definition__row"><dt>Médico</dt><dd>${snap.doctor}</dd></div>
    <div class="definition__row"><dt>Institución</dt><dd>${snap.institution?.name ?? ''}</dd></div>
    <div class="definition__row"><dt>Fecha</dt><dd>${fmtDate}</dd></div>
    <div class="definition__row"><dt>Hora</dt><dd>${snap.time}</dd></div>
    <div class="definition__row"><dt>Teléfono</dt><dd><a href="tel:${phone.replace(/[^0-9]/g,'')}">${phone}</a></dd></div>
  `;

  document.querySelector('.actions a')?.addEventListener('click', () => {
    localStorage.removeItem('mts:lastConfirm');
  });
});
