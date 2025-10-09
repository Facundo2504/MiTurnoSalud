/* recuperar.js – Recuperación de contraseña en MiTurnoSalud
   - Usa Auth.recoverPassword(email) para simular envío de correo.
   - Incluye validación, feedback accesible y bloqueo temporal del botón.
*/
document.addEventListener('DOMContentLoaded', () => {
  // Si el usuario ya está autenticado, redirige al dashboard
  Auth.redirectIfAuth();

  const form = document.querySelector('form.form');
  if (!form) return;

  const emailInput = form.querySelector('#email');
  const btnSubmit  = form.querySelector('button[type="submit"]');

  // Feedback general accesible
  let feedback = form.querySelector('.form__feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form__feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);
  }

  // Limpiar errores al escribir
  emailInput?.addEventListener('input', () => clearFieldError(emailInput));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormFeedback();

    const email = (emailInput.value || '').trim().toLowerCase();
    if (!email) {
      setFieldError(emailInput, 'Ingresa tu correo electrónico.');
      showFormFeedback('⚠️ El correo electrónico es obligatorio.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(emailInput, 'Ingresa un formato de correo válido.');
      showFormFeedback('⚠️ Corrige el correo ingresado.', 'error');
      return;
    }

    lock(true);
    try {
      Auth.recoverPassword(email);
      showFormFeedback(`✅ Se envió un enlace de recuperación a ${email} (simulado).`, 'success');
      emailInput.value = '';
      emailInput.disabled = true;
      setTimeout(() => location.assign('index.html'), 2500);
    } catch (err) {
      showFormFeedback(err.message || '❌ No se pudo procesar la solicitud.', 'error');
    } finally {
      lock(false);
    }
  });

  /* -------------------- Helpers UI -------------------- */
  function setFieldError(input, message) {
    if (!input) return;
    input.setAttribute('aria-invalid', 'true');
    input.classList.add('is-invalid');

    let hint = input.nextElementSibling?.classList?.contains('field-error')
      ? input.nextElementSibling
      : null;

    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'field-error';
      input.insertAdjacentElement('afterend', hint);
    }
    hint.textContent = message;
  }

  function clearFieldError(input) {
    if (!input) return;
    input.removeAttribute('aria-invalid');
    input.classList.remove('is-invalid');
    const hint = input.nextElementSibling;
    if (hint && hint.classList.contains('field-error')) hint.remove();
  }

  function showFormFeedback(msg, type = 'info') {
    feedback.textContent = msg;
    feedback.classList.remove('error', 'success');
    feedback.classList.add(type);
  }

  function clearFormFeedback() {
    feedback.textContent = '';
    feedback.classList.remove('error', 'success');
  }

  function lock(state) {
    if (!btnSubmit) return;
    btnSubmit.disabled = state;
    btnSubmit.textContent = state ? 'Enviando…' : 'Enviar enlace';
  }
});
