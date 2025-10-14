// agendar-institucion.js — Paso 4 (versión coherente con pasos previos)
document.addEventListener("DOMContentLoaded", () => {
  Auth.requireAuth();

  const draft = MTS.Draft.get();
  const ready = draft.especialidad && draft.medico && draft.fecha && draft.hora;
  if (!ready) {
    location.replace("agendar-especialidad.html");
    return;
  }

  const data = MTS.Data();
  const list = document.querySelector(".list--cards");
  const feedback = document.querySelector(".form__feedback");
  const btnConfirmar = document.getElementById("btnConfirmar");

  let selected = null;

  list?.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-select");
    if (!btn) return;

    const id = btn.dataset.id;
    selected = data.institutions.find(i => i.id === id) || null;

    document.querySelectorAll(".js-card").forEach(c => c.classList.remove("selected"));
    btn.closest(".js-card")?.classList.add("selected");

    feedback.textContent = `🏥 ${selected?.name} seleccionada.`;
    feedback.className = "form__feedback success";
  });

  btnConfirmar?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!selected) {
      feedback.textContent = "⚠️ Debes seleccionar una institución antes de confirmar.";
      feedback.className = "form__feedback error";
      return;
    }

    MTS.Draft.set({ institucion: selected });
    const user = Auth.currentUser();

    const newTurno = MTS.Appointments.add({
      email: user.email,
      ...MTS.Draft.get(),
    });

    localStorage.setItem("mts:lastConfirm", JSON.stringify(newTurno));
    MTS.Draft.clear();

    feedback.textContent = "✅ Turno confirmado. Redirigiendo…";
    feedback.className = "form__feedback success";

    setTimeout(() => location.assign("confirmar-turno.html"), 700);
  });
});
