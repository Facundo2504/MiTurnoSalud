// notifications.js — final coherente con el layout global
const LS_SESSION = "mts.session";
const LS_PROFILE = "mts.user.profile";
const LS_HISTORY = "mts.notify.history";

document.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(localStorage.getItem(LS_SESSION) || "null");
  if (!session) {
    const login = new URL("index.html", location.origin);
    login.searchParams.set("next", "notificaciones.html");
    location.replace(login.toString());
    return;
  }

  // Perfil
  let profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "null");
  if (!profile) {
    profile = {
      uid: crypto.randomUUID(),
      email: session.email || "demo@miturnosalud.com",
      displayName: "Usuario Demo",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: "es",
      notificationPrefs: { channel: "email", hoursBefore: 24, quietFrom: "22:00", quietTo: "07:00" }
    };
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
  }

  // UI refs
  const form = document.getElementById("form-notif");
  const channel = form.querySelector("#channel");
  const hoursBefore = form.querySelector("#hoursBefore");
  const lang = form.querySelector("#lang");
  const quietFrom = form.querySelector("#quietFrom");
  const quietTo = form.querySelector("#quietTo");
  const testDest = form.querySelector("#testDest");
  const historyEl = document.getElementById("history");

  const prefs = profile.notificationPrefs || {};
  channel.value = prefs.channel || "email";
  hoursBefore.value = prefs.hoursBefore ?? 24;
  quietFrom.value = prefs.quietFrom || "22:00";
  quietTo.value = prefs.quietTo || "07:00";
  lang.value = profile.locale || "es";
  testDest.value = profile.email || "";

  // Guardar preferencias
  form.addEventListener("submit", e => {
    e.preventDefault();
    clearErrors(form);
    const hb = parseInt(hoursBefore.value || "24", 10);
    if (Number.isNaN(hb) || hb < 1 || hb > 168)
      return setFieldError(hoursBefore, "Debe estar entre 1 y 168 horas.");

    if (!/^\d{2}:\d{2}$/.test(quietFrom.value))
      return setFieldError(quietFrom, "Formato inválido (HH:mm).");

    if (!/^\d{2}:\d{2}$/.test(quietTo.value))
      return setFieldError(quietTo, "Formato inválido (HH:mm).");

    profile.locale = lang.value;
    profile.notificationPrefs = { channel: channel.value, hoursBefore: hb, quietFrom: quietFrom.value, quietTo: quietTo.value };
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
    toast("Preferencias guardadas ✅");
  });

  // Probar envío (mock)
  document.getElementById("btnTest").addEventListener("click", () => {
    clearErrors(form);
    const dest = testDest.value.trim();
    if (!dest) return setFieldError(testDest, "Completa un destino de prueba.");

    const item = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      channel: channel.value,
      to: dest,
      preview: `Recordatorio de turno (${hoursBefore.value}h antes)`
    };
    const hist = JSON.parse(localStorage.getItem(LS_HISTORY) || "[]");
    hist.unshift(item);
    localStorage.setItem(LS_HISTORY, JSON.stringify(hist));
    renderHistory(hist);
    toast(`Simulado por ${item.channel} → ${dest}`);
  });

  document.getElementById("btnClear").addEventListener("click", () => {
    if (!confirm("¿Eliminar el historial de pruebas?")) return;
    localStorage.removeItem(LS_HISTORY);
    renderHistory([]);
  });

  document.getElementById("btnLogout").addEventListener("click", () => {
    localStorage.removeItem(LS_SESSION);
    location.href = "index.html";
  });

  renderHistory(JSON.parse(localStorage.getItem(LS_HISTORY) || "[]"));
});

/* ---------- Helpers ---------- */
function toast(msg, ms = 2000) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("visible");
  setTimeout(() => {
    t.classList.remove("visible");
    t.textContent = "";
  }, ms);
}
function renderHistory(items) {
  const el = document.getElementById("history");
  el.innerHTML = items.length
    ? items.map(n => `
      <article class="card">
        <strong>${escapeHtml(n.preview)}</strong>
        <div class="hint">${new Date(n.at).toLocaleString()}</div>
        <div class="hint">Canal: ${n.channel} • Destino: ${escapeHtml(n.to)}</div>
      </article>
    `).join("")
    : `<p class="hint">Sin envíos de prueba aún.</p>`;
}
function setFieldError(input, msg) {
  input.classList.add("is-invalid");
  const div = document.createElement("div");
  div.className = "field-error";
  div.textContent = msg;
  input.insertAdjacentElement("afterend", div);
}
function clearErrors(scope) {
  scope.querySelectorAll(".field-error").forEach(e => e.remove());
  scope.querySelectorAll(".is-invalid").forEach(e => e.classList.remove("is-invalid"));
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
