/* =========================================================
   perfil/privacidad.js — Preferencias de privacidad
   ========================================================= */
window.initPerfilView = function (viewName) {
  if (viewName !== "privacidad") return;

  const LS_PROFILE = "mts.user.profile";
  let profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "{}");

  const form = document.getElementById("formPrivacidad");
  const msg  = document.getElementById("msgPrivacidad");

  const mostrarEmail     = form.mostrarEmail;
  const mostrarTelefono  = form.mostrarTelefono;
  const aceptaPromos     = form.aceptaPromos;
  const aceptaEncuestas  = form.aceptaEncuestas;
  const btnExportar      = document.getElementById("btnExportar");
  const btnEliminarDatos = document.getElementById("btnEliminarDatos");

  // Valores iniciales por defecto
  const prefs = profile.privacidad || {
    mostrarEmail: false,
    mostrarTelefono: false,
    aceptaPromos: true,
    aceptaEncuestas: false,
  };

  // Cargar al formulario
  mostrarEmail.checked = prefs.mostrarEmail;
  mostrarTelefono.checked = prefs.mostrarTelefono;
  aceptaPromos.checked = prefs.aceptaPromos;
  aceptaEncuestas.checked = prefs.aceptaEncuestas;

  /* ===== Guardar preferencias ===== */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevos = {
      mostrarEmail: mostrarEmail.checked,
      mostrarTelefono: mostrarTelefono.checked,
      aceptaPromos: aceptaPromos.checked,
      aceptaEncuestas: aceptaEncuestas.checked,
    };

    profile.privacidad = nuevos;
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));

    msg.textContent = "✅ Preferencias de privacidad guardadas correctamente.";
    msg.className = "form__feedback success";
    toast("Privacidad actualizada ✅");
  });

  /* ===== Restablecer ===== */
  form.addEventListener("reset", (e) => {
    e.preventDefault();
    mostrarEmail.checked = prefs.mostrarEmail;
    mostrarTelefono.checked = prefs.mostrarTelefono;
    aceptaPromos.checked = prefs.aceptaPromos;
    aceptaEncuestas.checked = prefs.aceptaEncuestas;

    msg.textContent = "Preferencias restablecidas.";
    msg.className = "form__feedback";
  });

  /* ===== Exportar datos ===== */
  btnExportar?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "MiTurnoSalud_datos.json";
    a.click();
    URL.revokeObjectURL(url);

    toast("Descarga de datos completada 📦");
  });

  /* ===== Eliminar datos ===== */
  btnEliminarDatos?.addEventListener("click", () => {
    if (!confirm("Esto eliminará todos tus datos personales locales. ¿Continuar?")) return;

    localStorage.removeItem(LS_PROFILE);
    toast("Datos personales eliminados 🗑️");

    msg.textContent = "Los datos personales se eliminaron correctamente (mock).";
    msg.className = "form__feedback success";
  });
};
