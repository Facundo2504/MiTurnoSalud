// js/agendar-medico.js — Paso 2: seleccionar médico (versión final y chequeada)
document.addEventListener("DOMContentLoaded", () => {
  // --- Seguridad ---
  try { Auth.requireAuth(); } catch { location.href = "index.html"; return; }

  const draft = MTS.Draft.get();
  const feedback = document.querySelector(".form__feedback");
  const lista = document.getElementById("listaMedicos");
  const especialidadSeleccionada = document.getElementById("especialidadSeleccionada");
  const form = document.getElementById("formMedico");

  // --- Validación previa ---
  if (!draft.especialidad) {
    location.href = "agendar-especialidad.html";
    return;
  }

  // --- Mostrar especialidad actual ---
  especialidadSeleccionada.textContent = `Especialidad seleccionada: ${draft.especialidad}`;

  // --- Obtener médicos disponibles ---
  const data = MTS.Data().medicos[draft.especialidad] || [];

  if (data.length === 0) {
    lista.innerHTML = `<p class="hint">No hay médicos registrados para esta especialidad.</p>`;
    form.querySelector("button[type='submit']").disabled = true;
    return;
  }

  // --- Render dinámico de tarjetas ---
  lista.innerHTML = data.map((m, i) => `
    <label class="card card--option">
      <input type="radio" name="medico" value="${m.nombre}" ${i === 0 ? "checked" : ""}>
      <div>
        <h3>${m.nombre}</h3>
        <p class="muted">${m.centro}</p>
      </div>
    </label>
  `).join("");

  // --- Envío del formulario ---
  form.addEventListener("submit", e => {
    e.preventDefault();
    const seleccionado = form.querySelector("input[name='medico']:checked");
    if (!seleccionado) {
      feedback.textContent = "⚠️ Debes seleccionar un médico.";
      feedback.classList.remove("success");
      feedback.classList.add("error");
      return;
    }

    // Guardar elección en el draft
    const nuevoDraft = { ...draft, medico: seleccionado.value };
    MTS.Draft.set(nuevoDraft);

    feedback.textContent = "✅ Médico guardado. Redirigiendo…";
    feedback.classList.remove("error");
    feedback.classList.add("success");

    // --- Redirigir al siguiente paso ---
    setTimeout(() => {
      location.href = "agendar-fecha-hora.html";
    }, 800);
  });
});
