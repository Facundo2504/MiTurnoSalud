/* =========================================================
   perfil/seguridad.js — Gestión de correo y contraseña
   ========================================================= */
window.initPerfilView = function (viewName) {
  if (viewName !== "seguridad") return;

  const LS_USERS   = "mts.users";
  const LS_PROFILE = "mts.user.profile";
  const LS_SESSION = "mts.session";

  const form = document.getElementById("formSeguridad");
  const msg  = document.getElementById("msgSeguridad");

  const currentEmail    = document.getElementById("currentEmail");
  const currentPassword = document.getElementById("currentPassword");
  const newEmail        = document.getElementById("newEmail");
  const newPassword     = document.getElementById("newPassword");
  const newPassword2    = document.getElementById("newPassword2");

  const btnLogoutAll = document.getElementById("btnLogoutAll");
  const btnDelete    = document.getElementById("btnDelete");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const session = JSON.parse(localStorage.getItem(LS_SESSION) || "null") || {};
  let profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "null") || {};
  let users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");

  const emailActual = profile.email || session.email || "";
  let idx = users.findIndex(u => u.email === emailActual);

  if (idx === -1) {
    users.push({
      uid: crypto.randomUUID(),
      email: emailActual,
      password: "12345678",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    idx = users.length - 1;
  }

  const user = users[idx];
  currentEmail.value = emailActual;

  // Mostrar / ocultar contraseñas
  document.querySelectorAll(".toggle-pass").forEach(btn => {
    const input = document.getElementById(btn.dataset.for);
    btn.addEventListener("click", () => {
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "🙈" : "👁️";
    });
  });

  // Reset feedback al escribir
  [currentPassword, newEmail, newPassword, newPassword2].forEach(inp => {
    inp?.addEventListener("input", () => clearError(inp));
  });

  /* ===== Submit ===== */
  form.addEventListener("submit", e => {
    e.preventDefault();
    clearFormFeedback();

    if (!currentPassword.value) return setError(currentPassword, "Ingresá tu contraseña actual.");
    if (user.password !== currentPassword.value)
      return setError(currentPassword, "La contraseña actual no es correcta.");

    const emailNuevo = (newEmail.value || "").trim().toLowerCase();
    const pass1 = newPassword.value;
    const pass2 = newPassword2.value;

    if (emailNuevo) {
      if (!emailRegex.test(emailNuevo))
        return setError(newEmail, "Correo inválido (ej: nombre@dominio.com).");
      if (users.some((u, i) => i !== idx && u.email === emailNuevo))
        return setError(newEmail, "Ese correo ya está registrado.");
    }

    if (pass1 || pass2) {
      if (pass1.length < 8)
        return setError(newPassword, "La nueva contraseña debe tener al menos 8 caracteres.");
      if (pass1 !== pass2)
        return setError(newPassword2, "Las contraseñas no coinciden.");
    }

    if (!emailNuevo && !pass1)
      return setFormFeedback("No hay cambios para guardar.", "error");

    if (emailNuevo) {
      user.email = emailNuevo;
      profile.email = emailNuevo;
      session.email = emailNuevo;
      currentEmail.value = emailNuevo;
    }
    if (pass1) user.password = pass1;

    localStorage.setItem(LS_USERS, JSON.stringify(users));
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
    localStorage.setItem(LS_SESSION, JSON.stringify(session));

    currentPassword.value = newPassword.value = newPassword2.value = "";

    setFormFeedback("✅ Cambios de seguridad guardados correctamente.", "success");
    toast("Seguridad actualizada ✅");
  });

  btnLogoutAll?.addEventListener("click", () => {
    toast("Sesiones remotas cerradas (mock).");
    setFormFeedback("Sesiones cerradas en otros dispositivos (simulado).", "success");
  });

  btnDelete?.addEventListener("click", () => {
    if (!confirm("¿Eliminar tu cuenta y cerrar sesión (mock)?")) return;

    users = users.filter(u => u.email !== emailActual);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    localStorage.removeItem(LS_PROFILE);
    localStorage.removeItem(LS_SESSION);

    toast("Cuenta eliminada. Redirigiendo…");
    setTimeout(() => (location.href = "index.html"), 700);
  });

  /* ===== Helpers ===== */
  function setError(input, msgText) {
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    let hint = input.nextElementSibling;
    if (!hint || !hint.classList.contains("field-error")) {
      hint = document.createElement("div");
      hint.className = "field-error";
      input.insertAdjacentElement("afterend", hint);
    }
    hint.textContent = msgText;
    input.focus();
  }
  function clearError(input) {
    input.classList.remove("is-invalid");
    input.removeAttribute("aria-invalid");
    const hint = input.nextElementSibling;
    if (hint?.classList.contains("field-error")) hint.remove();
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
