/* =========================================================
   perfil/general.js — Datos personales del usuario
   ========================================================= */
window.initPerfilView = function (viewName) {
  if (viewName !== "general") return;

  const form = document.getElementById("formGeneral");
  const msg = document.getElementById("msgGeneral");

  // Obtener perfil actual o crear uno por defecto
  const LS_PROFILE = "mts.user.profile";
  let profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "null");

  if (!profile) {
    const session = JSON.parse(localStorage.getItem("mts.session") || "{}");
    profile = {
      nombre: "Usuario",
      email: session.email || "",
      telefono: "",
      zona: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
  }

  // Rellenar campos
  form.nombre.value = profile.nombre || "";
  form.email.value = profile.email || "";
  form.telefono.value = profile.telefono || "";
  form.zona.value = profile.zona || Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Guardar cambios
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    msg.textContent = "";
    msg.className = "form__feedback";

    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const telefono = form.telefono.value.trim();
    const zona = form.zona.value;

    if (!nombre || !email) {
      msg.textContent = "⚠️ El nombre y el correo son obligatorios.";
      msg.classList.add("error");
      return;
    }

    const nuevo = { nombre, email, telefono, zona };
    localStorage.setItem(LS_PROFILE, JSON.stringify(nuevo));

    msg.textContent = "✅ Cambios guardados correctamente.";
    msg.classList.add("success");

    toast("Datos personales actualizados ✅");
  });

  // Restablecer campos a los valores almacenados
  form.addEventListener("reset", (e) => {
    e.preventDefault();
    form.nombre.value = profile.nombre || "";
    form.email.value = profile.email || "";
    form.telefono.value = profile.telefono || "";
    form.zona.value = profile.zona || Intl.DateTimeFormat().resolvedOptions().timeZone;
    msg.textContent = "Formulario restablecido.";
    msg.className = "form__feedback";
  });
};
