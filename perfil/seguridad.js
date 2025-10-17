/* =========================================================
   perfil/seguridad.js — Cambios de correo y contraseña
   - Requiere contraseña actual
   - Valida nuevo correo (sin duplicados)
   - Valida nueva contraseña y confirmación
   - Actualiza mts.users, mts.user.profile y mts.session
   - Acciones avanzadas (logout otros dispositivos / eliminar cuenta - mock)
   ========================================================= */
window.initPerfilView = function (viewName) {
  if (viewName !== "seguridad") return;

  const LS_USERS   = "mts.users";
  const LS_PROFILE = "mts.user.profile";
  const LS_SESSION = "mts.session";

  const form = document.getElementById("formSeguridad");
  const msg  = document.getElementById("msgSeguridad");

  const currentEmail   = document.getElementById("currentEmail");
  const currentPassword= document.getElementById("currentPassword");
  const newEmail       = document.getElementById("newEmail");
  const newPassword    = document.getElementById("newPassword");
  const newPassword2   = document.getElementById("newPassword2");

  const btnLogoutAll = document.getElementById("btnLogoutAll");
  const btnDelete    = document.getElementById("btnDelete");

  // Helpers UI
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const session = JSON.parse(localStorage.getItem(LS_SESSION) || "null") || {};
  let profile   = JSON.parse(localStorage.getItem(LS_PROFILE) || "null") || {};
  let users     = JSON.parse(localStorage.getItem(LS_USERS) || "[]");

  // Asegurar usuario actual
  const emailActual = profile.email || session.email || "";
  const idxUser = users.findIndex(u => u.email === emailActual);
  if (idxUser === -1) {
    // Si no está en mts.users, creamos uno básico para no romper el flujo (mock)
    users.push({
      uid: crypto.randomUUID(),
      email: emailActual,
      password: "12345678", // mock; en real no se haría así
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }

  // Refrescar nuevamente el índice por si acabamos de insertar
  const idx = users.findIndex(u => u.email === emailActual);
  const user = users[idx];

  // Precargar
  currentEmail.value = emailActual;

  // Toggle de visibilidad de contraseñas
  document.querySelectorAll(".toggle-pass").forEach(btn => {
    const targetId = btn.getAttribute("data-for");
    const input = document.getElementById(targetId);
    btn.addEventListener("click", () => {
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "👁️" : "🙈";
    });
  });

  // Limpiar errores cuando el usuario escribe
  [currentPassword, newEmail, newPassword, newPassword2].forEach(inp => {
    inp?.addEventListener("input", () => clearError(inp));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearFormFeedback();

    // Validar contraseña actual
    if (!currentPassword.value) {
      return setError(currentPassword, "Ingresá tu contraseña actual.");
    }
    if (!user || user.password !== currentPassword.value) {
      return setError(currentPassword, "La contraseña actual no es correcta.");
    }

    // Validar nuevo correo (opcional)
    const emailNuevo = (newEmail.value || "").trim().toLowerCase();
    if (emailNuevo) {
      if (!emailRegex.test(emailNuevo)) {
        return setError(newEmail, "Correo inválido (ej: nombre@dominio.com).");
      }
      const taken = users.some((u, i) => i !== idx && u.email === emailNuevo);
      if (taken) {
        return setError(newEmail, "Ese correo ya está registrado por otro usuario.");
      }
    }

    // Validar nueva contraseña (opcional)
    const pass1 = newPassword.value;
    const pass2 = newPassword2.value;
    if (pass1 || pass2) {
      if (pass1.length < 8) return setError(newPassword, "La nueva contraseña debe tener al menos 8 caracteres.");
      if (pass1 !== pass2) return setError(newPassword2, "Las contraseñas no coinciden.");
    }

    // Si no hay cambios, avisar
    if (!emailNuevo && !pass1) {
      return setFormFeedback("No hay cambios para guardar.", "error");
    }

    // Aplicar cambios
    if (emailNuevo) {
      users[idx].email = emailNuevo;
      profile.email = emailNuevo;
      session.email = emailNuevo;
      currentEmail.value = emailNuevo;
    }
    if (pass1) {
      users[idx].password = pass1;
    }

    // Persistir
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
    localStorage.setItem(LS_SESSION, JSON.stringify(session));

    // Limpiar campos sensibles
    currentPassword.value = "";
    newPassword.value = "";
    newPassword2.value = "";

    setFormFeedback("✅ Cambios de seguridad guardados correctamente.", "success");
    toast("Seguridad actualizada ✅");
  });

  // Cerrar sesión en otros dispositivos (mock)
  btnLogoutAll?.addEventListener("click", () => {
    // En un backend real invalidarías sesiones por token/refresh. Aquí simulamos feedback.
    toast("Sesiones remotas cerradas (mock).");
    setFormFeedback("Se forzó el cierre de sesión en otros dispositivos (simulado).", "success");
  });

  // Eliminar cuenta (mock)
  btnDelete?.addEventListener("click", () => {
    if (!confirm("Esta acción eliminará tu cuenta en este dispositivo (mock) y cerrará tu sesión. ¿Continuar?")) return;

    // Eliminar de mts.users
    const users2 = JSON.parse(localStorage.getItem(LS_USERS) || "[]").filter(u => u.email !== (profile.email || session.email));
    localStorage.setItem(LS_USERS, JSON.stringify(users2));

    // Limpiar perfil y sesión locales
    localStorage.removeItem(LS_PROFILE);
    localStorage.removeItem(LS_SESSION);

    toast("Cuenta eliminada. Redirigiendo…");
    setTimeout(() => location.href = "index.html", 700);
  });

  /* ---------------- Helpers UI ---------------- */
  function setError(input, message) {
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    let hint = input.nextElementSibling;
    if (!hint || !hint.classList || !hint.classList.contains("field-error")) {
      hint = document.createElement("div");
      hint.className = "field-error";
      input.insertAdjacentElement("afterend", hint);
    }
    hint.textContent = message;
    input.focus();
  }
  function clearError(input) {
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
    const hint = input.nextElementSibling;
    if (hint && hint.classList && hint.classList.contains("field-error")) hint.remove();
  }
  function setFormFeedback(text, type = "info") {
    msg.textContent = text;
    msg.className = `form__feedback ${type}`;
  }
  function clearFormFeedback() {
    msg.textContent = "";
    msg.className = "form__feedback";
    [currentPassword, newEmail, newPassword, newPassword2].forEach(clearError);
  }
};
