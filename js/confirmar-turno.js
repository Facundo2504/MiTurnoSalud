// confirmar-turno.js — versión coherente con el flujo MiTurnoSalud
document.addEventListener("DOMContentLoaded", () => {
  try { Auth.requireAuth(); } catch { location.replace("index.html"); return; }

  const snap = (() => {
    try { return JSON.parse(localStorage.getItem("mts:lastConfirm")) || null; }
    catch { return null; }
  })();

  if (!snap) {
    location.replace("dashboard.html");
    return;
  }

  // --- Helpers locales ---
  const formatDateAR = iso => {
    try {
      const [y, m, d] = iso.split("-");
      return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });
    } catch { return iso; }
  };
  const formatTime = hhmm => hhmm || "—";
  const telHref = num => num ? `tel:${num.replace(/[^0-9+]/g, "")}` : "#";
  const waHref = num => num ? `https://wa.me/${num.replace(/[^0-9]/g, "")}` : "#";

  const buildGoogleCalendarLink = ({ title, dateISO, timeHHMM, location, details }) => {
    try {
      const [y, m, d] = dateISO.split("-").map(Number);
      const [H, M] = timeHHMM.split(":").map(Number);
      const start = new Date(y, m - 1, d, H, M || 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const fmt = d =>
        `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,"0")}${String(d.getUTCDate()).padStart(2,"0")}T${String(d.getUTCHours()).padStart(2,"0")}${String(d.getUTCMinutes()).padStart(2,"0")}00Z`;
      const params = new URLSearchParams({
        action:"TEMPLATE",
        text:title||"Turno médico",
        dates:`${fmt(start)}/${fmt(end)}`,
        location:location||"",
        details:details||""
      });
      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    } catch { return "#"; }
  };

  // --- Preparar datos ---
  const dateDisplay = formatDateAR(snap.fecha);
  const timeDisplay = formatTime(snap.hora);
  const inst = snap.institucion || {};
  const phoneHref = telHref(inst.telefono || "");
  const waLink = waHref(inst.whatsapp || "");

  const hasPhone = !!inst.telefono;
  const hasWhatsApp = !!inst.whatsapp;

  const safeText = (v, fb="—") => (v==null||String(v).trim()==="")?fb:String(v);

  // --- Render del resumen
  const dl = document.querySelector(".definition");
  if (dl) {
    dl.innerHTML = `
      <div class="definition__row"><dt>Especialidad</dt><dd>${safeText(snap.especialidad)}</dd></div>
      <div class="definition__row"><dt>Médico</dt><dd>${safeText(snap.medico)}</dd></div>
      <div class="definition__row"><dt>Institución</dt><dd>${safeText(inst.name)}</dd></div>
      <div class="definition__row"><dt>Dirección</dt><dd>${safeText(inst.address)}</dd></div>
      <div class="definition__row"><dt>Fecha</dt><dd>${dateDisplay}</dd></div>
      <div class="definition__row"><dt>Hora</dt><dd>${timeDisplay}</dd></div>
    `;
  }

  // --- Acciones dinámicas
  const actions = document.querySelector(".actions");
  if (actions) {
    const frag = document.createDocumentFragment();

    if (hasPhone) {
      const callBtn = document.createElement("a");
      callBtn.className = "btn btn--ghost";
      callBtn.href = phoneHref;
      callBtn.textContent = `Llamar: ${inst.telefono}`;
      frag.appendChild(callBtn);
    }

    if (hasWhatsApp) {
      const waBtn = document.createElement("a");
      waBtn.className = "btn btn--ghost";
      waBtn.href = waLink;
      waBtn.target = "_blank";
      waBtn.rel = "noopener";
      waBtn.textContent = `WhatsApp ${inst.whatsapp.replace("+54 ", "")}`;
      frag.appendChild(waBtn);
    }

    const gcal = document.createElement("a");
    gcal.className = "btn btn--ghost";
    gcal.href = buildGoogleCalendarLink({
      title: `${snap.especialidad} — ${snap.medico}`,
      dateISO: snap.fecha,
      timeHHMM: snap.hora,
      location: `${inst.name || ""} ${inst.address || ""}`,
      details: `Turno confirmado en MiTurnoSalud.\nEspecialidad: ${snap.especialidad}\nMédico: ${snap.medico}`
    });
    gcal.target = "_blank";
    gcal.rel = "noopener";
    gcal.textContent = "Agregar a Google Calendar";
    frag.appendChild(gcal);

    actions.prepend(frag);

    const backLink = actions.querySelector('a[href="dashboard.html"]');
    backLink?.addEventListener("click", () => {
      localStorage.removeItem("mts:lastConfirm");
    });
  }
});
