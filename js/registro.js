// js/registro.js — versión final coherente con login.js y dashboard.js
const LS_USERS = "mts.users";
const LS_SESSION = "mts.session";
const LS_PROFILE = "mts.user.profile";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");
  if (!form) return;

  const nombre = form.querySelector("#nombre");
  const apellido = form.querySelector("#apellido");
  const email = form.querySelector("#email");
  const obraSocial = form.querySelector("#obraSocial");
  const telefono = form.querySelector("#telefono");
  const password = form.querySelector("#password");
  const btn = form.querySelector('button[type="submit"]');

  // feedback
  let feedback = document.createElement("p");
  feedback.className = "form__feedback";
  feedback.setAttribute("aria-live", "polite");
  form.appendChild(feedback);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    feedback.textContent = "";

    // validaciones básicas
    if (!nombre.value.trim() || !apellido.value.trim() || !email.value.trim() || !password.value.trim()) {
      feedback.textContent = "⚠️ Completa todos los campos obligatorios.";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      feedback.textContent = "Correo electrónico inválido.";
      email.focus();
      return;
    }

    if (password.value.length < 8) {
      feedback.textContent = "La contraseña debe tener al menos 8 caracteres.";
      password.focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = "Registrando…";

    try {
      // obtener lista de usuarios (mock)
      const users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
      if (users.some(u => u.email === email.value.trim().toLowerCase())) {
        feedback.textContent = "Este correo ya está registrado.";
        btn.disabled = false;
        btn.textContent = "Registrarse";
        return;
      }

      // crear nuevo usuario
      const newUser = {
        uid: crypto.randomUUID(),
        nombre: nombre.value.trim(),
        apellido: apellido.value.trim(),
        email: email.value.trim().toLowerCase(),
        obraSocial: obraSocial.value.trim() || "",
        telefono: telefono.value.trim() || "",
        password: password.value,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem(LS_USERS, JSON.stringify(users));

      // crear perfil asociado
      const profile = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: `${newUser.nombre} ${newUser.apellido}`,
        obraSocial: newUser.obraSocial,
        telefono: newUser.telefono,
        locale: "es",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        createdAt: newUser.createdAt
      };
      localStorage.setItem(LS_PROFILE, JSON.stringify(profile));

      // crear sesión
      localStorage.setItem(LS_SESSION, JSON.stringify({
        email: newUser.email,
        loggedInAt: new Date().toISOString()
      }));

      feedback.textContent = "✅ Registro exitoso. Redirigiendo…";
      setTimeout(() => {
        location.href = "dashboard.html";
      }, 800);
    } catch (err) {
      console.error(err);
      feedback.textContent = "❌ Error al registrar usuario.";
    } finally {
      btn.disabled = false;
      btn.textContent = "Registrarse";
    }
  });
});
