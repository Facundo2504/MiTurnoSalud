/* =========================================================
   js/dashboard.js — versión definitiva
   Módulo principal del panel de usuario.
   Controla sesión, renderiza próximos turnos y recordatorios.
   ========================================================= */

const LS_SESSION = "mts.session";
const LS_TURNOS = "mts.turnos";
const LS_PROFILE = "mts.user.profile";

/* =========================================================
   Inicio
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(localStorage.getItem(LS_SESSION) || "null");

  // --- Protección de acceso ---
  if (!session) {
    const login = new URL("index.html", location.origin);
    login.searchParams.set("next", "dashboard.html");
    location.replace(login.toString());
    return;
  }

  /* ===== Logout ===== */
  const btnLogout = document.getElementById("btnLogout");
  btnLogout?.addEventListener("click", () => {
    localStorage.removeItem(LS_SESSION);
    toast("Sesión finalizada 👋");
    setTimeout(() => (location.href = "index.html"), 900);
  });

  /* ===== Cambio de tema ===== */
  const btnTheme = document.getElementById("btnTheme");
  const root = document.documentElement;
  const LS_THEME = "mts.theme";
  const savedTheme = localStorage.getItem(LS_THEME);

  if (savedTheme === "light") root.setAttribute("data-theme", "light");
  else if (savedTheme === "dark") root.removeAttribute("data-theme");

  updateThemeBtn();

  btnTheme?.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    if (isLight) {
      root.removeAttribute("data-theme");
      localStorage.setItem(LS_THEME, "dark");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem(LS_THEME, "light");
    }
    updateThemeBtn();
  });

  function updateThemeBtn() {
    const isLight = root.getAttribute("data-theme") === "light";
    btnTheme.textContent = isLight ? "🌙 Noche" : "🌞 Día";
    btnTheme.setAttribute("aria-pressed", String(isLight));
  }

  /* ===== Saludo dinámico ===== */
  const profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "{}");
  const saludo = document.querySelector("h1");
  if (profile.displayName) {
    const nombre = profile.displayName.split(" ")[0];
    saludo.textContent = `Hola, ${nombre} 👋`;
  }

  /* ===== Render de turnos ===== */
  const contenedor = document.getElementById("cardsTurnos");
  if (!contenedor) return;

  let turnos = JSON.parse(localStorage.getItem(LS_TURNOS) || "[]");

  // Generar datos simulados si está vacío
  if (turnos.length === 0) {
    turnos = [
      {
        id: crypto.randomUUID(),
        fecha: "2025-10-20T09:00:00",
        medico: "Dra. Pérez (Clínica Médica)",
        estado: "Confirmado",
      },
      {
        id: crypto.randomUUID(),
        fecha: "2025-11-02T14:30:00",
        medico: "Dr. López (Cardiología)",
        estado: "Pendiente",
      },
    ];
    localStorage.setItem(LS_TURNOS, JSON.stringify(turnos));
  }

  renderTurnos(turnos);

  /* ===== Recordatorios ===== */
  const btnRecordatorio = document.getElementById("btnRecordatorio");
  btnRecordatorio?.addEventListener("click", () => {
    if (turnos.length === 0) {
      toast("No hay turnos para recordar ⚠️");
      return;
    }
    toast(`📅 Se enviaron recordatorios para ${turnos.length} turno(s).`);
  });
});

/* =========================================================
   Render de tarjetas de turnos
========================================================= */
function renderTurnos(turnos) {
  const contenedor = document.getElementById("cardsTurnos");
  if (!contenedor) return;

  if (turnos.length === 0) {
    contenedor.innerHTML = `
      <p class="hint">
        No tenés turnos próximos.
        <a href="agendar-especialidad.html">Agendar uno</a>.
      </p>`;
    return;
  }

  contenedor.innerHTML = turnos
    .map(
      (t) => `
      <article class="card card--turno" aria-label="Turno médico">
        <div class="card__header">
          <div>🩺</div>
          <div>
            <strong>${new Date(t.fecha).toLocaleDateString("es-AR", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}</strong>
            <div class="card__subtitle">${t.medico}</div>
          </div>
        </div>
        <div class="card__body">
          <p><strong>Estado:</strong> ${t.estado}</p>
        </div>
      </article>`
    )
    .join("");
}

/* =========================================================
   Toast reutilizable
========================================================= */
function toast(msg, ms = 2200) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("visible");
  setTimeout(() => t.classList.remove("visible"), ms);
}
