// js/dashboard.js — versión final
// Controla acceso, renderiza próximos turnos y maneja recordatorios (mock)

const LS_SESSION = "mts.session";
const LS_TURNOS = "mts.turnos";
const LS_PROFILE = "mts.user.profile";

// Espera a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Guard de sesión
  const session = JSON.parse(localStorage.getItem(LS_SESSION) || "null");
  if (!session) {
    const login = new URL("index.html", location.origin);
    login.searchParams.set("next", "dashboard.html");
    location.replace(login.toString());
    return;
  }

  // Logout handler
  window.Auth = {
    logout() {
      localStorage.removeItem(LS_SESSION);
      location.href = "index.html";
    },
  };

  // Mostrar perfil básico (si existe)
  const profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "{}");
  const saludo = document.querySelector("h1");
  if (profile.displayName) {
    saludo.textContent = `Hola, ${profile.displayName.split(" ")[0]} 👋`;
  }

  // Inicializar contenedor de turnos
  const contenedor = document.querySelector(".cards");
  if (!contenedor) return;

  // Cargar turnos simulados si no hay
  let turnos = JSON.parse(localStorage.getItem(LS_TURNOS) || "[]");
  if (turnos.length === 0) {
    turnos = [
      {
        id: 1,
        fecha: "2025-10-20T09:00:00",
        medico: "Dra. Pérez (Clínica Médica)",
        estado: "Confirmado",
      },
      {
        id: 2,
        fecha: "2025-11-02T14:30:00",
        medico: "Dr. López (Cardiología)",
        estado: "Pendiente",
      },
    ];
    localStorage.setItem(LS_TURNOS, JSON.stringify(turnos));
  }

  // Renderizar tarjetas
  renderTurnos(turnos, contenedor);

  // Botón “Enviar recordatorio”
  document
    .getElementById("btnRecordatorio")
    ?.addEventListener("click", () => {
      if (turnos.length === 0) {
        toast("No hay turnos para recordar.");
        return;
      }
      toast(`📅 Se enviaron recordatorios para ${turnos.length} turno(s).`);
    });
});

// Render de turnos
function renderTurnos(turnos, contenedor) {
  if (turnos.length === 0) {
    contenedor.innerHTML = `<p class="hint">No tenés turnos próximos. <a href="agendar-especialidad.html">Agendar uno</a>.</p>`;
    return;
  }

  contenedor.innerHTML = turnos
    .map(
      (t) => `
    <article class="card turno">
      <h3>${new Date(t.fecha).toLocaleDateString("es-AR", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}</h3>
      <p><strong>Médico:</strong> ${t.medico}</p>
      <p><strong>Estado:</strong> ${t.estado}</p>
    </article>`
    )
    .join("");
}

// Mini toast reutilizable
function toast(msg, ms = 2000) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => {
    t.classList.add("hidden");
    t.textContent = "";
  }, ms);
}
