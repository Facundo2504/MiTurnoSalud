/* registro.js – Alta de usuario en MiTurnoSalud
   - Valida: nombre, apellido, email, teléfono (opcional), contraseña (mín. 8)
   - Feedback accesible y bloqueo de botón al procesar
   - Usa Auth.register(...) y redirige al dashboard
*/
document.addEventListener('DOMContentLoaded', () => {
  // Si ya hay sesión activa, redirige al dashboard
  Auth.redirectIfAuth();

  const form = document.querySelector('form.form');
  if (!form) return;

  // Referencias
  const $ = (sel, root = document) => root.querySelector(sel);
  const nombre     = $('#nombre', form);
  const apellido   = $('#apellido', form);
  const email      = $('#email', form);
  const obraSocial = $('#obraSocial', form);
  const telefono   = $('#telefono', form);
  const password   = $('#password', form);
  const btnSubmit  = form.querySelector('button[type="submit"]');

  // Feedback general accesible
  let feedback = form.querySelector('.form__feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'form__feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);
  }

  // Limpiar errores visuales al escribir
  [nombre, apellido, email, obraSocial, telefono, password].forEach(inp => {
    inp?.addEventListener('input', () => clearFieldError(inp));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormFeedback();

    const data = {
      name: (nombre?.value || '').trim(),
      lastName: (apellido?.value || '').trim(),
      email: (email?.value || '').trim().toLowerCase(),
      obraSocial: (obraSocial?.value || '').trim(),
      telefono: (telefono?.value || '').trim(),
      password: (password?.value || '').trim()
    };

    const ok = validateAll(data);
    if (!ok) return;

    lock(true);
    try {
      Auth.register(data); // guarda y abre sesión
      showFormFeedback('✅ Registro exitoso. Redirigiendo…', 'success');
      setTimeout(() => location.assign('dashboard.html'), 800);
    } catch (err) {
      showFormFeedback(err.message || '❌ No se pudo completar el registro.', 'error');
    } finally {
      lock(false);
    }
  });

  /* ---------------------- Validaciones ---------------------- */
  function validateAll({ name, lastName, email, telefono, password }) {
    let valid = true;

    if (!/^.{2,}$/.test(name)) {
      setFieldError(nombre, 'El nombre debe tener al menos 2 caracteres.');
      valid = false;
    }

    if (!/^.{2,}$/.test(lastName)) {
      setFieldError(apellido, 'El apellido debe tener al menos 2 caracteres.');
      valid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(email, 'Ingresa un correo válido (ej: nombre@dominio.com).');
      valid = false;
    }

    if (telefono && telefono.value && !/^[0-9+\-() ]{6,}$/.test(telefono.value)) {
      setFieldError(telefono, 'El teléfono debe tener al menos 6 dígitos (se permiten + - ( ) y espacios).');
      valid = false;
    }

    if (!password || password.length < 8) {
      setFieldError(password, 'La contraseña debe tener al menos 8 caracteres.');
      valid = false;
    }

    if (!valid) {
      showFormFeedback('⚠️ Revisa los campos marcados en rojo.', 'error');
    }
    return valid;
  }

  /* ---------------------- UI Helpers ---------------------- */
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
    if (hint && hint.classList.contains('field-error')) {
      hint.remove();
    }
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
    btnSubmit.textContent = state ? 'Registrando…' : 'Registrarse';
  }
});
