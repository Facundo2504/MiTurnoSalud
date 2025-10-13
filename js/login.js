/* login.js – MiTurnoSalud
   Funcionalidad definitiva:
   - Valida email y contraseña (mín. 8)
   - Guarda sesión en localStorage
   - Redirige a perfil o a ?next= si existe
   - Mensajes accesibles
   - Toggle de visibilidad de contraseña
*/
document.addEventListener("DOMContentLoaded", () => {
  // Si ya hay sesión activa, redirigir directamente
  const session = JSON.parse(localStorage.getItem("mts.session") || "null");
  if (session) {
    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "perfil.html";
    location.replace(next);
    return;
  }

  const form = document.querySelector("form.form");
  if (!form) return;

  const email = form.querySelector("#email");
  const password = form.querySelector("#password");
  const togglePwd = form.querySelector("#togglePassword");
  const btnSubmit = form.querySelector('button[type="submit"]');

  // feedback accesible
  let feedback = form.querySelector(".form__feedback");
  if (!feedback) {
    feedback = document.createElement("p");
    feedback.className = "form__feedback";
    feedback.setAttribute("aria-live", "polite");
    form.appendChild(feedback);
  }

  // limpiar errores al escribir
  [email, password].forEach(inp => {
    inp?.addEventListener("input", () => clearFieldError(inp));
  });

  // mostrar/ocultar contraseña
  togglePwd?.addEventListener("change", () => {
    password.type = togglePwd.checked ? "text" : "password";
    password.focus();
  });

  // envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearFormFeedback();

    const emailVal = (email?.value || "").trim().toLowerCase();
    const passVal = (password?.value || "").trim();

    let ok = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setFieldError(email, "Introduce un correo válido (ej: nombre@dominio.com).");
      ok = false;
    }
    if (!passVal || passVal.length < 8) {
      setFieldError(password, "La contraseña debe tener al menos 8 caracteres.");
      ok = false;
    }
    if (!ok) {
      showFormFeedback("⚠️ Revisa los campos marcados.", "error");
      return;
    }

    lock(true);
    try {
      // ------------------ Mock de autenticación ------------------
      // usuario demo: cualquier email + contraseña >=8
      const profileKey = "mts.user.profile";
      let profile = JSON.parse(localStorage.getItem(profileKey) || "null");
      if (!profile) {
        profile = {
          uid: "demo-uid",
          email: emailVal,
          displayName: "Usuario Demo",
          timeZone: "America/Argentina/Cordoba",
          locale: "es",
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(profileKey, JSON.stringify(profile));
      }

      // guardar sesión
      localStorage.setItem(
        "mts.session",
        JSON.stringify({
          email: emailVal,
          loggedInAt: new Date().toISOString()
        })
      );

      showFormFeedback("✅ Sesión iniciada. Redirigiendo…", "success");

      // redirección inteligente
      const params = new URLSearchParams(location.search);
      const next = params.get("next") || "perfil.html";
      setTimeout(() => location.assign(next), 500);
    } catch (err) {
      console.error(err);
      showFormFeedback("❌ No se pudo iniciar sesión.", "error");
    } finally {
      lock(false);
    }
  });

  /* ----------------- Helpers UI ----------------- */
  function lock(state) {
    if (!btnSubmit) return;
    btnSubmit.disabled = state;
    btnSubmit.textContent = state ? "Ingresando…" : "Iniciar sesión";
  }

  function setFieldError(input, message) {
    if (!input) return;
    input.setAttribute("aria-invalid", "true");
    input.classList.add("is-invalid");

    let hint = input.nextElementSibling?.classList?.contains("field-error")
      ? input.nextElementSibling
      : null;

    if (!hint) {
      hint = document.createElement("div");
      hint.className = "field-error";
      input.insertAdjacentElement("afterend", hint);
    }
    hint.textContent = message;
  }

  function clearFieldError(input) {
    if (!input) return;
    input.removeAttribute("aria-invalid");
    input.classList.remove("is-invalid");
    const hint = input.nextElementSibling;
    if (hint && hint.classList.contains("field-error")) hint.remove();
  }

  function showFormFeedback(msg, type = "info") {
    feedback.textContent = msg;
    feedback.classList.remove("error", "success");
    feedback.classList.add(type);
  }

  function clearFormFeedback() {
    feedback.textContent = "";
    feedback.classList.remove("error", "success");
  }
});
