/* login.js – Inicio de sesión en MiTurnoSalud
   - Valida email y contraseña (mín. 8)
   - Mensajes accesibles y limpieza de errores al tipear
   - Toggle de visibilidad de contraseña
   - Bloqueo del botón mientras procesa
*/
document.addEventListener('DOMContentLoaded', () => {
  // Si ya hay sesión activa, ir al dashboard
  Auth.redirectIfAuth();

  const form = document.querySelector('form.form');
  if (!form) return;

  const email     = form.querySelector('#email');
  const password  = form.querySelector('#password');
  const btnSubmit = form.querySelector('button[type="submit"]');
  const togglePwd = form.querySelector('#togglePassword');

  // feedback accesible (crea si no existe en el HTML)
  let feedback = form.querySelector('.form__feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form__feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);
  }

  // Limpiar error visual al escribir
  [email, password].forEach(inp => {
    inp?.addEventListener('input', () => clearFieldError(inp));
  });

  // Mostrar/ocultar contraseña
  togglePwd?.addEventListener('change', () => {
    password.type = togglePwd.checked ? 'text' : 'password';
    password.focus();
  });

  // Envío del formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormFeedback();

    const emailVal = (email?.value || '').trim().toLowerCase();
    const passVal  = (password?.value || '').trim();

    let ok = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setFieldError(email, 'Ingresa un correo válido (ej: nombre@dominio.com).');
      ok = false;
    }
    if (!passVal || passVal.length < 8) {
      setFieldError(password, 'La contraseña debe tener al menos 8 caracteres.');
      ok = false;
    }
    if (!ok) {
      showFormFeedback('⚠️ Revisa los campos marcados.', 'error');
      return;
    }

    lock(true);
    try {
      Auth.login(emailVal, passVal);
      showFormFeedback('✅ Sesión iniciada. Redirigiendo…', 'success');
      setTimeout(() => location.assign('dashboard.html'), 400);
    } catch (err) {
      showFormFeedback(err?.message || '❌ No se pudo iniciar sesión.', 'error');
    } finally {
      lock(false);
    }
  });

  /* ----------------- Helpers UI ----------------- */
  function lock(state) {
    if (!btnSubmit) return;
    btnSubmit.disabled = state;
    btnSubmit.textContent = state ? 'Ingresando…' : 'Iniciar sesión';
  }

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
});
