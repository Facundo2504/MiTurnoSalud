/* perfil/general.js */
window.initPerfilView = function (viewName) {
  if (viewName !== "general") return;

  const LS_PROFILE = "mts.user.profile";
  const form = document.getElementById("formGeneral");
  const msg = document.getElementById("msgGeneral");

  // Cargar perfil guardado
  const profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "{}");
  if (profile.nombre) form.nombre.value = profile.nombre;
  if (profile.email) form.email.value = profile.email;
  if (profile.telefono) form.telefono.value = profile.telefono;
  if (profile.zona) form.zona.value = profile.zona;

  // Guardar cambios
  form.addEventListener("submit", e => {
    e.preventDefault();

    const nuevo = {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      zona: form.zona.value,
    };

    localStorage.setItem(LS_PROFILE, JSON.stringify(nuevo));

    msg.textContent = "✅ Datos personales actualizados correctamente.";
    msg.className = "form__feedback success";

    toast("Perfil guardado 💾");
  });

  // Restablecer valores previos
  form.addEventListener("reset", e => {
    e.preventDefault();
    form.nombre.value = profile.nombre || "";
    form.email.value = profile.email || "";
    form.telefono.value = profile.telefono || "";
    form.zona.value = profile.zona || "America/Argentina/Buenos_Aires";

    msg.textContent = "Datos restablecidos.";
    msg.className = "form__feedback";
  });
};
