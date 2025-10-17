/* =========================================================
   perfil/notificaciones.js — Configuración de notificaciones
   ========================================================= */
window.initPerfilView = function (viewName) {
  if (viewName !== "notificaciones") return;

  const LS_PROFILE = "mts.user.profile";
  const LS_HISTORY = "mts.notify.history";
  let profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "null") || {};

  const form = document.getElementById("formNotifPerfil");
  const msg = document.getElementById("msgNotifPerfil");
  const historyEl = document.getElementById("notifHistory");

  const channel = form.channel;
  const hoursBefore = form.hoursBefore;
  const lang = form.lang;
  const quietFrom = form.quietFrom;
  const quietTo = form.quietTo;
  const testDest = form.testDest;

  const btnTest = document.getElementById("btnTestNotif");
  const btnClear = document.getElementById("btnClearNotif");

  // Cargar datos iniciales
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

  // --- Guardar preferencias ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const hb = parseInt(hoursBefore.value || "24", 10);
    if (isNaN(hb) || hb < 1 || hb > 168) {
      msg.textContent = "⚠️ Las horas deben estar entre 1 y 168.";
      msg.className = "form__feedback error";
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

    msg.textContent = "✅ Preferencias guardadas correctamente.";
    msg.className = "form__feedback success";
    toast("Notificaciones actualizadas ✅");
  });

  // --- Simular envío de prueba ---
  btnTest?.addEventListener("click", () => {
    const dest = testDest.value.trim();
    if (!dest) {
      msg.textContent = "⚠️ Ingresá un destino de prueba.";
      msg.className = "form__feedback error";
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
    toast(`Simulado por ${item.channel} → ${dest}`);
  });

  // --- Limpiar historial ---
  btnClear?.addEventListener("click", () => {
    if (!confirm("¿Eliminar el historial de notificaciones?")) return;
    localStorage.removeItem(LS_HISTORY);
    renderHistory([]);
  });

  renderHistory(JSON.parse(localStorage.getItem(LS_HISTORY) || "[]"));

  // --- Helpers ---
  function renderHistory(items) {
    historyEl.innerHTML = items.length
      ? items.map(n => `
          <article class="card">
            <strong>${escapeHtml(n.preview)}</strong>
            <div class="hint">${new Date(n.at).toLocaleString()}</div>
            <div class="hint">Canal: ${n.channel} • Destino: ${escapeHtml(n.to)}</div>
          </article>
        `).join("")
      : `<p class="hint">No hay envíos de prueba aún.</p>`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
};
