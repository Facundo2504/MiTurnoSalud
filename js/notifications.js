// notifications.js – Preferencias y pruebas de notificaciones (mock)

const LS_SESSION = "mts.session";
const LS_PROFILE = "mts.user.profile";
const LS_HISTORY = "mts.notify.history";

document.addEventListener("DOMContentLoaded", () => {
  // Guard de sesión: si no hay sesión, mandar al login con next
  const session = JSON.parse(localStorage.getItem(LS_SESSION) || "null");
  if (!session) {
    const login = new URL("index.html", location.origin);
    login.searchParams.set("next", "notificaciones.html");
    location.replace(login.toString());
    return;
  }

  // Cargar perfil (si no existe, crear demo)
  let profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "null");
  if (!profile) {
    profile = {
      uid: "demo-uid",
      email: session.email || "demo@miturnosalud.com",
      displayName: "Usuario Demo",
      timeZone: "America/Argentina/Cordoba",
      locale: "es",
      notificationPrefs: { channel: "email", hoursBefore: 24, quietFrom: "22:00", quietTo: "07:00" }
    };
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
  }

  // UI
  const form = document.getElementById("form-notif");
  const channel = document.getElementById("channel");
  const hoursBefore = document.getElementById("hoursBefore");
  const lang = document.getElementById("lang");
  const quietFrom = document.getElementById("quietFrom");
  const quietTo = document.getElementById("quietTo");
  const testDest = document.getElementById("testDest");
  const historyEl = document.getElementById("history");
  const btnClear = document.getElementById("btnClear");
  const btnLogout = document.getElementById("btnLogout");

  // Rellenar con datos actuales
  const prefs = profile.notificationPrefs || { channel: "email", hoursBefore: 24, quietFrom: "22:00", quietTo: "07:00" };
  channel.value = prefs.channel || "email";
  hoursBefore.value = prefs.hoursBefore ?? 24;
  quietFrom.value = prefs.quietFrom || "22:00";
  quietTo.value = prefs.quietTo || "07:00";
  lang.value = profile.locale || "es";
  testDest.value = profile.email || "";

  // Guardar
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors(form);

    const hb = parseInt(hoursBefore.value || "24", 10);
    if (Number.isNaN(hb) || hb < 1 || hb > 168) {
      setFieldError(hoursBefore, "Debe estar entre 1 y 168.");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(quietFrom.value)) {
      setFieldError(quietFrom, "Formato inválido (HH:mm).");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(quietTo.value)) {
      setFieldError(quietTo, "Formato inválido (HH:mm).");
      return;
    }

    // Persistir en perfil
    profile.locale = lang.value;
    profile.notificationPrefs = {
      channel: channel.value,
      hoursBefore: hb,
      quietFrom: quietFrom.value,
      quietTo: quietTo.value
    };
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
    toast("Preferencias guardadas ✅");
  });

  // Probar envío (mock local)
  document.getElementById("btnTest").addEventListener("click", () => {
    clearErrors(form);
    const dest = testDest.value.trim();
    if (!dest) { setFieldError(testDest, "Completa un destino de prueba."); return; }

    const item = {
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      channel: channel.value,
      to: dest,
      preview: `Recordatorio de turno (T-${hoursBefore.value}h)`,
    };
    const hist = JSON.parse(localStorage.getItem(LS_HISTORY) || "[]");
    hist.unshift(item);
    localStorage.setItem(LS_HISTORY, JSON.stringify(hist));
    renderHistory(hist);
    toast(`Envío simulado por ${item.channel} → ${dest}`);
  });

  // Limpiar historial
  btnClear.addEventListener("click", () => {
    if (!confirm("¿Eliminar el historial local de pruebas?")) return;
    localStorage.removeItem(LS_HISTORY);
    renderHistory([]);
  });

  // Cerrar sesión
  btnLogout?.addEventListener("click", () => {
    localStorage.removeItem(LS_SESSION);
    location.href = "index.html";
  });

  // Render inicial del historial
  renderHistory(JSON.parse(localStorage.getItem(LS_HISTORY) || "[]"));
});

/* ---------- Helpers ---------- */
function toast(msg, ms = 2000) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => { t.style.display = "none"; t.textContent = ""; }, ms);
}

function renderHistory(items) {
  const el = document.getElementById("history");
  el.innerHTML = items.length
    ? items.map(n => `
      <article class="card" style="display:grid;grid-template-columns:1fr auto;gap:8px;">
        <div>
          <strong>${escapeHtml(n.preview)}</strong>
          <div class="hint">${new Date(n.at).toLocaleString()}</div>
          <div class="hint">Canal: ${n.channel} • Destino: ${escapeHtml(n.to)}</div>
        </div>
        <code style="align-self:center; font-size:.85rem;">#${n.id.slice(0,8)}</code>
      </article>
    `).join("")
    : `<p class="hint">Sin envíos de prueba aún.</p>`;
}

function setFieldError(input, message) {
  if (!input) return;
  input.setAttribute("aria-invalid", "true");
  input.classList.add("is-invalid");
  let hint = input.nextElementSibling?.classList?.contains("field-error")
    ? input.nextElementSibling
    : null;
  if (!hint) {
    hint = document.createElement("div");
    hint.className = "field-error";
    input.insertAdjacentElement("afterend", hint);
  }
  hint.textContent = message;
}
function clearErrors(scope) {
  scope.querySelectorAll(".field-error").forEach(n => n.remove());
  scope.querySelectorAll(".is-invalid").forEach(n => n.classList.remove("is-invalid"));
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
}
