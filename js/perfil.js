/* =========================================================
   perfil.js — MiTurnoSalud (versión final)
   - Guard de sesión con ?next=perfil.html
   - Router por hash (#/general, #/seguridad, #/notificaciones, #/privacidad)
   - Carga de vistas desde /perfil/*.html (fragmento o página completa)
   - Tabs accesibles (aria-selected/tabindex) y foco gestionado
   - Tema Día/Noche persistente en localStorage
   - Toast global reutilizable
   ========================================================= */

const LS_SESSION = "mts.session";
const LS_THEME   = "mts.theme";

const ROUTES = new Map([
  ["/general",        { tab: "tab-general",        file: "perfil/general.html",        title: "General" }],
  ["/seguridad",      { tab: "tab-seguridad",      file: "perfil/seguridad.html",      title: "Seguridad" }],
  ["/notificaciones", { tab: "tab-notificaciones", file: "perfil/notificaciones.html", title: "Notificaciones" }],
  ["/privacidad",     { tab: "tab-privacidad",     file: "perfil/privacidad.html",     title: "Privacidad" }]
]);

// Cache simple en memoria para evitar recargas innecesarias
const viewCache = new Map();

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Guard de sesión ---------- */
  const session = JSON.parse(localStorage.getItem(LS_SESSION) || "null");
  if (!session) {
    const login = new URL("index.html", location.origin);
    login.searchParams.set("next", "perfil.html");
    location.replace(login.toString());
    return;
  }

  /* ---------- Tema (día/noche) ---------- */
  const root = document.documentElement;
  const btnTheme = document.getElementById("btnTheme");
  const savedTheme = localStorage.getItem(LS_THEME); // 'light' | 'dark' | null
  if (savedTheme === "light") root.setAttribute("data-theme", "light");
  if (savedTheme === "dark")  root.removeAttribute("data-theme"); // dark por defecto

  updateThemeButton();
  btnTheme?.addEventListener("click", () => {
    if (root.getAttribute("data-theme") === "light") {
      root.removeAttribute("data-theme");     // -> dark
      localStorage.setItem(LS_THEME, "dark");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem(LS_THEME, "light");
    }
    updateThemeButton();
  });
  function updateThemeButton() {
    const isLight = root.getAttribute("data-theme") === "light";
    btnTheme?.setAttribute("aria-pressed", String(isLight));
    if (btnTheme) btnTheme.textContent = isLight ? "🌙 Noche" : "🌞 Día";
  }

  /* ---------- Logout ---------- */
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem(LS_SESSION);
    location.href = "index.html";
  });

  /* ---------- Tabs (marcado accesible) ---------- */
  const tablist = document.querySelector('[role="tablist"]');
  const tabs = tablist?.querySelectorAll('[role="tab"]') || [];
  tabs.forEach((tab, i) => {
    // Navegación con teclado
    tab.addEventListener("keydown", (e) => {
      const arr = Array.from(tabs);
      const idx = arr.indexOf(tab);
      if (e.key === "ArrowRight") arr[Math.min(idx + 1, arr.length - 1)].focus();
      if (e.key === "ArrowLeft")  arr[Math.max(idx - 1, 0)].focus();
    });
    // Asegura tabindex inicial
    if (i > 0) tab.setAttribute("tabindex", "-1");
  });

  /* ---------- Router ---------- */
  if (!location.hash) location.replace("#/general");
  renderRoute();
  window.addEventListener("hashchange", renderRoute);

  // Accesibilidad: foco inicial al main
  document.getElementById("main")?.focus({ preventScroll: true });
});

/* =========================================================
   Router principal
   ========================================================= */
async function renderRoute() {
  const view = document.getElementById("view");
  if (!view) return;

  // Normaliza hash → "/general"
  const hash = location.hash.replace(/^#/, "");
  const route = ROUTES.get(hash) || ROUTES.get("/general");

  // Activa el tab correspondiente
  setActiveTab(route.tab);

  // UX: llevar el contenedor arriba (sin saltos bruscos)
  try { view.scrollTo({ top: 0, behavior: "smooth" }); } catch {}

  // Estado de carga
  view.setAttribute("aria-busy", "true");
  view.innerHTML = `<p class="hint">Cargando ${route.title}…</p>`;

  try {
    // Usa cache si existe
    let html;
    if (viewCache.has(route.file)) {
      html = viewCache.get(route.file);
    } else {
      const resp = await fetch(route.file, { cache: "no-cache" });
      if (!resp.ok) throw new Error(`No se pudo cargar ${route.file} (${resp.status})`);
      html = await resp.text();
      viewCache.set(route.file, html);
    }

    // Si es página completa, extrae solo <body> — si es fragmento, úsalo tal cual
    const fragment = extractBodyOrFragment(html);
    view.innerHTML = fragment;

    // Hook de inicialización de la vista
    if (typeof window.initPerfilView === "function") {
      // "#/general" → "general"
      const viewName = (location.hash.replace(/^#\//, "") || "general");
      try { window.initPerfilView(viewName); } catch (e) { console.warn("initPerfilView error:", e); }
    }
  } catch (err) {
    console.error(err);
    view.innerHTML = `
      <div>
        <h2>Error</h2>
        <p>No pudimos cargar <code>${route.file}</code>.</p>
        <p class="hint">${String(err.message || err)}</p>
      </div>`;
  } finally {
    view.setAttribute("aria-busy", "false");

    // Gestión de foco accesible al primer título del panel
    const firstHeading = view.querySelector("h1, h2, [role='heading']");
    if (firstHeading) firstHeading.tabIndex = -1;
    (firstHeading || view).focus?.({ preventScroll: true });
  }
}

/* =========================================================
   Utilidades
   ========================================================= */
function setActiveTab(tabId) {
  document.querySelectorAll('[role="tab"]').forEach((el) => {
    const active = el.id === tabId;
    el.setAttribute("aria-selected", String(active));
    el.setAttribute("tabindex", active ? "0" : "-1");
  });
}

function extractBodyOrFragment(html) {
  // Detecta <body> y devuelve su innerHTML; si no, retorna el fragmento tal cual
  const hasBody = /<body[\s\S]*<\/body>/i.test(html);
  if (!hasBody) return html;
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : html;
}

// Toast global reutilizable (usa .toast del DOM si existe; si no, crea uno)
window.toast = function toast(msg, ms = 2000) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.remove("hidden");
  // Si hay clase .visible en estilos globales, también la aplicamos
  t.classList.add("visible");
  setTimeout(() => {
    t.classList.add("hidden");
    t.classList.remove("visible");
    t.textContent = "";
  }, ms);
};
