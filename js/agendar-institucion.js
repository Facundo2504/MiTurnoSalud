// agendar-institucion.js — Paso 4 (versión final y coherente)
document.addEventListener("DOMContentLoaded", () => {
  // --- Guard de sesión ---
  try { Auth.requireAuth(); } catch { location.replace("index.html"); return; }

  // --- Validar que vengan los pasos previos ---
  const draft = MTS.Draft.get();
  const listo = draft.especialidad && draft.medico && draft.fecha && draft.hora;
  if (!listo) { location.replace("agendar-especialidad.html"); return; }

  // --- UI refs ---
  const list = document.querySelector(".list--cards");
  const feedback = document.querySelector(".form__feedback") || createFeedback();
  const btnConfirmar = document.getElementById("btnConfirmar");

  // --- Dataset de instituciones (desde mock global o fallback) ---
  const data = (typeof MTS?.Data === "function" ? MTS.Data() : { institutions: [] });
  const instituciones = Array.isArray(data.institutions) ? data.institutions : [];
  if (!listoListado(instituciones)) {
    list.innerHTML = `<p class="hint">No hay instituciones configuradas para seleccionar.</p>`;
    btnConfirmar?.setAttribute("disabled", "true");
    return;
  }

  // --- Selección de institución (click/teclado) ---
  let seleccionada = null;

  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-select");
    if (!btn) return;
    setSeleccion(btn.dataset.id);
  });

  list.addEventListener("keydown", (e) => {
    if (!["Enter", " "].includes(e.key)) return;
    const card = e.target.closest(".js-card");
    if (!card) return;
    e.preventDefault();
    const id = card.dataset.id || card.querySelector(".js-select")?.dataset.id;
    if (id) setSeleccion(id);
  });

  function setSeleccion(id) {
    seleccionada = instituciones.find(i => i.id === id) || null;
    document.querySelectorAll(".js-card").forEach(c => c.classList.remove("selected"));
    const card = document.querySelector(`.js-card[data-id="${CSS.escape(id)}"]`);
    card?.classList.add("selected");
    ok(`🏥 ${seleccionada?.name || "Institución"} seleccionada.`);
  }

  // --- Confirmar turno ---
  btnConfirmar?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!seleccionada) return err("⚠️ Elegí una institución antes de confirmar.");

    lock(true);

    try {
      // Persistir selección en el borrador
      MTS.Draft.set({ institucion: seleccionada });

      // Crear turno definitivo
      const session = JSON.parse(localStorage.getItem("mts.session") || "{}");
      const turno = MTS.Appointments.add({
        email: session.email || "",
        especialidad: draft.especialidad,
        medico: draft.medico,
        fecha: draft.fecha,
        hora: draft.hora,
        institucion: seleccionada,
        estado: "Confirmado"
      });

      // Snapshot para pantalla de confirmación
      localStorage.setItem("mts:lastConfirm", JSON.stringify(turno));

      // Limpiar draft
      MTS.Draft.clear();

      ok("✅ Turno confirmado. Redirigiendo…");
      setTimeout(() => location.assign("confirmar-turno.html"), 650);
    } catch (e) {
      console.error(e);
      err("❌ No se pudo confirmar el turno. Intentá nuevamente.");
      lock(false);
    }
  });

  /* ================== Helpers ================== */
  function listoListado(arr){ return Array.isArray(arr) && arr.length > 0; }
  function createFeedback(){
    const p = document.createElement("p");
    p.className = "form__feedback";
    p.setAttribute("aria-live", "polite");
    document.querySelector(".panel")?.appendChild(p);
    return p;
  }
  function setMsg(msg, type){
    feedback.textContent = msg;
    feedback.className = `form__feedback ${type}`;
  }
  function ok(msg){ setMsg(msg, "success"); }
  function err(msg){ setMsg(msg, "error"); }
  function lock(state){
    if (!btnConfirmar) return;
    btnConfirmar.disabled = state;
    btnConfirmar.textContent = state ? "Confirmando…" : "Confirmar turno";
  }
});
// notifications.js — Simulador de notificaciones