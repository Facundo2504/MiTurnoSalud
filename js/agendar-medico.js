// js/agendar-medico.js — MiTurnoSalud
// Paso 2: seleccionar médico

document.addEventListener("DOMContentLoaded", () => {
  Auth.requireAuth();

  const draft = MTS.Draft.get();
  const feedback = document.querySelector(".form__feedback");
  const lista = document.getElementById("listaMedicos");
  const especialidadSeleccionada = document.getElementById("especialidadSeleccionada");
  const form = document.getElementById("formMedico");

  if (!draft.especialidad) {
    // Si no viene de la pantalla anterior, volver
    location.href = "agendar-especialidad.html";
    return;
  }

  especialidadSeleccionada.textContent = `Especialidad seleccionada: ${draft.especialidad}`;
  const data = MTS.Data().medicos[draft.especialidad] || [];

  if (data.length === 0) {
    lista.innerHTML = `<p class="hint">No hay médicos registrados para esta especialidad.</p>`;
    form.querySelector("button[type='submit']").disabled = true;
    return;
  }

  lista.innerHTML = data.map((m, i) => `
    <label class="card card--option">
      <input type="radio" name="medico" value="${m.nombre}" ${i === 0 ? "checked" : ""}>
      <div>
        <h3>${m.nombre}</h3>
        <p class="muted">${m.centro}</p>
      </div>
    </label>
  `).join("");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const seleccionado = form.querySelector("input[name='medico']:checked");
    if (!seleccionado) {
      feedback.textContent = "⚠️ Debes seleccionar un médico.";
      return;
    }

    draft.medico = seleccionado.value;
    MTS.Draft.set(draft);
    feedback.textContent = "✅ Médico guardado. Redirigiendo…";

    setTimeout(() => {
      location.href = "agendar-fecha.html";
    }, 800);
  });
});
