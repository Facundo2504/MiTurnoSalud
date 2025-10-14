// perfil.js — Shell de Perfil con vistas externas
// - Carga /perfil/<vista>.html según el hash (#/general, #/seguridad, …)
// - Mantiene tab activo y foco accesible
// - Guard de sesión y toggle de tema

const LS_SESSION = "mts.session";
const LS_THEME   = "mts.theme";

// ------- Bootstrap -------
document.addEventListener("DOMContentLoaded", () => {
  // Guard de sesión
  const session = JSON.parse(localStorage.getItem(LS_SESSION) || "null");
  if (!session) {
    const login = new URL("index.html", location.origin);
    login.searchParams.set("next", "perfil.html");
    location.replace(login.toString());
    return;
  }

  // Tema persistente (oscuro por defecto)
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(LS_THEME);
  if (savedTheme === "light") root.setAttribute("data-theme", "light");

  // Toggle tema
  const btnTheme = document.getElementById("btnTheme");
  updateThemeButton();
  btnTheme.addEventListener("click", () => {
    if (root.getAttribute("data-theme") === "light") {
      root.removeAttribute("data-theme"); // dark
      localStorage.setItem(LS_THEME, "dark");
    } else {
      root.setAttribute("data-theme", "light");
      localStorage.setItem(LS_THEME, "light");
    }
    updateThemeButton();
  });
  function updateThemeButton() {
    const isLight = root.getAttribute("data-theme") === "light";
    btnTheme.setAttribute("aria-pressed", String(isLight));
    btnTheme.textContent = isLight ? "🌙 Noche" : "🌞 Día";
  }

  // Logout
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem(LS_SESSION);
    location.href = "index.html";
  });

  // Router inicial y listeners
  if (!location.hash) location.replace("#/general");
  renderRoute();
  window.addEventListener("hashchange", renderRoute);

  // Mejoras: focus al main después de cargar
  document.getElementById("main").focus({ preventScroll: true });
});

// ------- Router -------
const ROUTES = new Map([
  ["/general",        { tab: "tab-general",        file: "perfil/general.html",        title: "General" }],
  ["/seguridad",      { tab: "tab-seguridad",      file: "perfil/seguridad.html",      title: "Seguridad" }],
  ["/notificaciones", { tab: "tab-notificaciones", file: "perfil/notificaciones.html", title: "Notificaciones" }],
  ["/privacidad",     { tab: "tab-privacidad",     file: "perfil/privacidad.html",     title: "Privacidad" }]
]);

async function renderRoute() {
  const view = document.getElementById("view");
  const hash = location.hash.replace(/^#/, ""); // "#/general" -> "/general"
  const route = ROUTES.get(hash) || ROUTES.get("/general");

  // Activar tab adecuado
  setActiveTab(route.tab);

  // Cargar vista
  view.setAttribute("aria-busy", "true");
  view.innerHTML = `<p class="hint">Cargando ${route.title}…</p>`;
  view.scrollTo({ top: 0, behavior: "smooth" });
  try {
    const html = await fetch(route.file, { cache: "no-cache" }).then(r => {
      if (!r.ok) throw new Error(`No se pudo cargar ${route.file} (${r.status})`);
      return r.text();
    });
    // Si es una página completa, extraer <body>; si es fragmento, usar tal cual
    const fragment = extractBodyOrFragment(html);
    view.innerHTML = fragment;

    // Auto-inicialización opcional: si la vista adjunta window.initPerfilView
    if (typeof window.initPerfilView === "function") {
      try { window.initPerfilView(hash.slice(1)); } catch {}
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
    // Mover foco al título principal de la vista si existe
    const firstHeading = view.querySelector("h1, h2, [role='heading']");
    (firstHeading || view).focus?.({ preventScroll: true });
    
  }
}

function setActiveTab(tabId) {
  document.querySelectorAll('[role="tab"]').forEach((el) => {
    const active = el.id === tabId;
    el.setAttribute("aria-selected", String(active));
    el.setAttribute("tabindex", active ? "0" : "-1");
  });
}

function extractBodyOrFragment(html) {
  // Si el HTML contiene <body>, capturar su contenido; si no, devolver tal cual (fragmento)
  const hasBody = /<body[\s\S]*<\/body>/i.test(html);
  if (!hasBody) return html;
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : html;
}

// ------- Utils opcionales -------
function toast(msg, ms = 2000) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => { t.classList.add("hidden"); t.textContent = ""; }, ms);
}
