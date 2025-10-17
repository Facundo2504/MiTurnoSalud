/* =========================================================
   perfil.js — versión definitiva
   SPA interna del módulo Perfil
   ========================================================= */

const LS_SESSION = "mts.session";
const LS_THEME = "mts.theme";

const ROUTES = new Map([
  ["/general",        { tab: "tab-general",        file: "perfil/general.html",        title: "General" }],
  ["/seguridad",      { tab: "tab-seguridad",      file: "perfil/seguridad.html",      title: "Seguridad" }],
  ["/privacidad",     { tab: "tab-privacidad",     file: "perfil/privacidad.html",     title: "Privacidad" }],
  ["/notificaciones", { tab: "tab-notificaciones", file: "perfil/notificaciones.html", title: "Notificaciones" }],
]);

document.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(localStorage.getItem(LS_SESSION) || "null");
  if (!session) {
    const login = new URL("index.html", location.origin);
    login.searchParams.set("next", "perfil.html");
    location.replace(login.toString());
    return;
  }

  /* ====== Tema Día/Noche ====== */
  const root = document.documentElement;
  const btnTheme = document.getElementById("btnTheme");
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
    btnTheme.textContent = isLight ? "🌙 Modo noche" : "🌞 Modo día";
  }

  /* ====== Logout ====== */
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem(LS_SESSION);
    location.href = "index.html";
  });

  /* ====== Navegación interna ====== */
  const tabs = document.querySelectorAll("[role='tab']");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const route = tab.dataset.route;
      if (route) location.hash = route;
    });
  });

  // Hash inicial seguro
  if (!location.hash) history.replaceState(null, "", "#/general");
  renderRoute();
  window.addEventListener("hashchange", renderRoute);
});

/* =========================================================
   Renderizado de rutas internas
   ========================================================= */
async function renderRoute() {
  const view = document.getElementById("view");
  const hash = location.hash.replace(/^#/, "");
  const route = ROUTES.get(hash) || ROUTES.get("/general");

  // Limpiar contenido y marcar estado
  setActiveTab(route.tab);
  view.innerHTML = `<p class="hint">Cargando ${route.title}…</p>`;
  view.setAttribute("aria-busy", "true");

  try {
    const res = await fetch(route.file);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    view.innerHTML = html;

    // Enfocar la vista para lectores de pantalla
    view.focus();

    // Inicializar lógica específica del submódulo
    if (typeof window.initPerfilView === "function") {
      window.initPerfilView(route.title.toLowerCase());
    }
  } catch (err) {
    console.error("Error al cargar vista de perfil:", err);
    view.innerHTML = `<p class="form__feedback error">⚠️ Error al cargar <code>${route.file}</code></p>`;
  } finally {
    view.removeAttribute("aria-busy");
  }
}

/* =========================================================
   Utilidad: marcar pestaña activa
   ========================================================= */
function setActiveTab(tabId) {
  document.querySelectorAll("[role='tab']").forEach(t => {
    const active = t.id === tabId;
    t.setAttribute("aria-selected", String(active));
  });
}
