/* recuperar.js – Recuperación de contraseña en MiTurnoSalud
   Usa Auth.recoverPassword(email) para simular envío de correo.
   Incluye validación visual y mensajes accesibles.
*/
document.addEventListener('DOMContentLoaded', () => {
  // Si el usuario ya está autenticado, lo redirigimos
  Auth.redirectIfAuth();

  const form = document.querySelector('form');
  const emailInput = form.querySelector('#email');

  const feedback = document.createElement('p');
  feedback.className = 'form__feedback';
  feedback.setAttribute('aria-live', 'polite');
  form.appendChild(feedback);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim().toLowerCase();

    // Validación básica
    if (!email) {
      showFeedback('⚠️ Ingresa un correo electrónico.', 'error');
      emailInput.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback('⚠️ El formato del correo no es válido.', 'error');
      emailInput.focus();
      return;
    }

    try {
      Auth.recoverPassword(email);
      showFeedback(`✅ Se envió un enlace de recuperación a ${email} (simulado).`, 'success');

      // Limpieza visual
      emailInput.value = '';
      emailInput.disabled = true;

      // Redirigir tras unos segundos
      setTimeout(() => location.assign('index.html'), 2500);
    } catch (err) {
      showFeedback(err.message || '❌ No se pudo procesar la solicitud.', 'error');
    }
  });

  function showFeedback(msg, type = 'info') {
    feedback.textContent = msg;
    feedback.classList.remove('error', 'success');
    feedback.classList.add(type);
  }
});
