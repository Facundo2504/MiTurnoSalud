// js/reset.js — flujo final de recuperación (mock localStorage)
const LS_USERS = "mts.users";
const LS_RESETS = "mts.resetRequests";

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const view = document.getElementById("resetView");

  if (!token) {
    view.innerHTML = `<p class="hint">❌ Enlace inválido o incompleto.</p>`;
    return;
  }

  const resets = JSON.parse(localStorage.getItem(LS_RESETS) || "[]");
  const request = resets.find(r => r.token === token);

  // Validar token
  if (!request) {
    view.innerHTML = `<p class="hint">❌ Este enlace no es válido.</p>`;
    return;
  }
  if (request.used) {
    view.innerHTML = `<p class="hint">⚠️ Este enlace ya fue utilizado.</p>`;
    return;
  }
  if (new Date(request.expiresAt) < new Date()) {
    view.innerHTML = `<p class="hint">⌛ Este enlace expiró. Solicitá uno nuevo desde la página de recuperación.</p>`;
    return;
  }

  // Mostrar formulario
  view.innerHTML = `
    <form id="formReset" class="form" novalidate>
      <div class="form__group">
        <label for="password">Nueva contraseña</label>
        <input id="password" name="password" type="password" required minlength="8"
               placeholder="Mínimo 8 caracteres">
      </div>
      <div class="form__group">
        <label for="password2">Repetir contraseña</label>
        <input id="password2" name="password2" type="password" required minlength="8">
      </div>
      <p class="form__feedback" aria-live="polite"></p>
      <button type="submit" class="btn btn--primary">Guardar</button>
    </form>
  `;

  const form = document.getElementById("formReset");
  const pass1 = document.getElementById("password");
  const pass2 = document.getElementById("password2");
  const feedback = form.querySelector(".form__feedback");
  const btn = form.querySelector("button");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    feedback.textContent = "";

    if (!pass1.value || pass1.value.length < 8) {
      feedback.textContent = "⚠️ La contraseña debe tener al menos 8 caracteres.";
      pass1.focus();
      return;
    }
    if (pass1.value !== pass2.value) {
      feedback.textContent = "⚠️ Las contraseñas no coinciden.";
      pass2.focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = "Guardando…";

    try {
      const users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
      const idx = users.findIndex(u => u.email === request.email);

      if (idx === -1) {
        feedback.textContent = "❌ No se encontró el usuario asociado.";
        btn.disabled = false;
        btn.textContent = "Guardar";
        return;
      }

      // Actualizar contraseña
      users[idx].password = pass1.value;
      localStorage.setItem(LS_USERS, JSON.stringify(users));

      // Marcar token como usado
      const upd = resets.map(r => r.token === token ? { ...r, used: true } : r);
      localStorage.setItem(LS_RESETS, JSON.stringify(upd));

      feedback.textContent = "✅ Contraseña actualizada correctamente. Redirigiendo…";
      setTimeout(() => location.href = "reset-exito.html", 800);

    } catch (err) {
      console.error(err);
      feedback.textContent = "❌ Error al actualizar contraseña.";
    } finally {
      btn.disabled = false;
      btn.textContent = "Guardar";
    }
  });
});
