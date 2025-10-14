// js/recuperar.js — MiTurnoSalud (mock sin backend)
// - Valida email
// - Evita enumeración (mensaje de éxito siempre igual)
// - Si el usuario existe en mts.users, genera un token y lo guarda en mts.resetRequests
// - Redirige luego al login

const LS_USERS = "mts.users";
const LS_RESETS = "mts.resetRequests";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRecuperar");
  const email = document.getElementById("email");
  const feedback = form.querySelector(".form__feedback");
  const btn = form.querySelector('button[type="submit"]');

  // Limpia feedback al tipear
  email.addEventListener("input", () => {
    clearError(email);
    feedback.textContent = "";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    feedback.textContent = "";

    const value = (email.value || "").trim().toLowerCase();

    // Validación simple de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(email, "Introduce un correo válido (ej: nombre@dominio.com).");
      feedback.textContent = "⚠️ Revisa el campo marcado.";
      return;
    }

    // Lock UI
    lock(true);

    try {
      // Carga usuarios y resets
      const users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
      const exists = users.some(u => u.email === value);

      // Siempre respondemos "OK" para evitar enumeración
      if (exists) {
        // Genera y guarda solicitud de reseteo (mock)
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h

        const resets = JSON.parse(localStorage.getItem(LS_RESETS) || "[]");
        resets.push({
          email: value,
          token,
          createdAt: new Date().toISOString(),
          expiresAt,
          used: false
        });
        localStorage.setItem(LS_RESETS, JSON.stringify(resets));

        // (Opcional para desarrollo) — ver el token por consola
        console.info("[recuperar.js] Reset token (mock):", token);
        // Si luego querés implementar reset.html, podrías usar:
        // console.info(`Sugerido: reset.html?token=${encodeURIComponent(token)}`);
      }

      feedback.textContent = "✅ Si tu correo está registrado, te enviaremos instrucciones para restablecer la contraseña.";
      // Redireccionar al login después de un respiro
      setTimeout(() => {
        // Si tu login respeta ?next=, podrías volver a donde estabas:
        // const next = new URLSearchParams(location.search).get("next") || "index.html";
        location.href = "index.html";
      }, 1200);
    } catch (err) {
      console.error(err);
      feedback.textContent = "❌ Ocurrió un error. Intenta nuevamente.";
    } finally {
      lock(false);
    }
  });

  /* ---------- Helpers ---------- */
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
    if (hint && hint.classList && hint.classList.contains("field-error")) {
      hint.remove();
    }
  }

  function lock(state) {
    btn.disabled = state;
    btn.textContent = state ? "Enviando…" : "Enviar";
  }
});
