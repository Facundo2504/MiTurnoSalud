/* =========================================================
   perfil/notificaciones.js — Configuración de notificaciones
   ========================================================= */
window.initPerfilView = function (viewName) {
  if (viewName !== "notificaciones") return;

  const LS_PROFILE = "mts.user.profile";
  const LS_HISTORY = "mts.notify.history";
  let profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "{}");

  const form = document.getElementById("formNotifPerfil");
  const msg = document.getElementById("msgNotifPerfil");
  const historyEl = document.getElementById("notifHistory");

  const { channel, hoursBefore, lang, quietFrom, quietTo, testDest } = form;
  const btnTest = document.getElementById("btnTestNotif");
  const btnClear = document.getElementById("btnClearNotif");

  // --- Cargar valores guardados ---
  const prefs = profile.notificationPrefs || {
    channel: "email",
    hoursBefore: 24,
    quietFrom: "22:00",
    quietTo: "07:00",
    lang: "es",
  };

  channel.value = prefs.channel;
  hoursBefore.value = prefs.hoursBefore;
  quietFrom.value = prefs.quietFrom;
  quietTo.value = prefs.quietTo;
  lang.value = profile.locale || prefs.lang;
  testDest.value = profile.email || "";

  /* ===== Guardar preferencias ===== */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const hb = parseInt(hoursBefore.value || "24", 10);
    if (isNaN(hb) || hb < 1 || hb > 168) {
      setFeedback("⚠️ Las horas deben estar entre 1 y 168.", "error");
      return;
    }

    profile.notificationPrefs = {
      channel: channel.value,
      hoursBefore: hb,
      quietFrom: quietFrom.value,
      quietTo: quietTo.value,
      lang: lang.value,
    };
    profile.locale = lang.value;
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));

    setFeedback("✅ Preferencias de notificaciones guardadas correctamente.", "success");
    toast("Notificaciones actualizadas ✅");
  });

  /* ===== Simular envío de prueba ===== */
  btnTest?.addEventListener("click", () => {
    const dest = testDest.value.trim();
    if (!dest) {
      setFeedback("⚠️ Ingresá un destino de prueba válido.", "error");
      return;
    }

    const item = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      channel: channel.value,
      to: dest,
      preview: `Recordatorio (${hoursBefore.value}h antes del turno)`,
    };

    const hist = JSON.parse(localStorage.getItem(LS_HISTORY) || "[]");
    hist.unshift(item);
    localStorage.setItem(LS_HISTORY, JSON.stringify(hist));
    renderHistory(hist);
    toast(`Envío simulado por ${item.channel} → ${dest}`);
  });

  /* ===== Limpiar historial ===== */
  btnClear?.addEventListener("click", () => {
    if (!confirm("¿Eliminar el historial de notificaciones simuladas?")) return;
    localStorage.removeItem(LS_HISTORY);
    renderHistory([]);
    toast("Historial de notificaciones eliminado 🧹");
  });

  /* ===== Render inicial ===== */
  renderHistory(JSON.parse(localStorage.getItem(LS_HISTORY) || "[]"));

  /* ===== Helpers ===== */
  function renderHistory(items) {
    historyEl.innerHTML = items.length
      ? items.map(n => `
          <article class="card">
            <strong>${escapeHtml(n.preview)}</strong>
            <div class="hint">${new Date(n.at).toLocaleString()}</div>
            <div class="hint">Canal: ${n.channel} • Destino: ${escapeHtml(n.to)}</div>
          </article>
        `).join("")
      : `<p class="hint">No hay notificaciones de prueba registradas.</p>`;
  }

  function setFeedback(text, type = "info") {
    msg.textContent = text;
    msg.className = `form__feedback ${type}`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
};
