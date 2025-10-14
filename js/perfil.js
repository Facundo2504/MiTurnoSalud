/* perfil.js — versión final */
const LS_SESSION = "mts.session";
const LS_THEME = "mts.theme";

const ROUTES = new Map([
  ["/general", { tab: "tab-general", file: "perfil/general.html", title: "General" }],
  ["/seguridad", { tab: "tab-seguridad", file: "perfil/seguridad.html", title: "Seguridad" }],
  ["/notificaciones", { tab: "tab-notificaciones", file: "perfil/notificaciones.html", title: "Notificaciones" }],
  ["/privacidad", { tab: "tab-privacidad", file: "perfil/privacidad.html", title: "Privacidad" }],
]);

document.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(localStorage.getItem(LS_SESSION) || "null");
  if (!session) {
    const login = new URL("index.html", location.origin);
    login.searchParams.set("next", "perfil.html");
    location.replace(login.toString());
    return;
  }

  // Tema
  const root = document.documentElement;
  const btnTheme = document.getElementById("btnTheme");
  const saved = localStorage.getItem(LS_THEME);
  if (saved === "light") root.setAttribute("data-theme", "light");
  if (saved === "dark") root.removeAttribute("data-theme");
  updateThemeBtn();

  btnTheme.addEventListener("click", () => {
    if (root.getAttribute("data-theme") === "light") {
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
  }

  // Logout
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem(LS_SESSION);
    location.href = "index.html";
  });

  // Tabs
  const tabs = document.querySelectorAll("[role='tab']");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      location.hash = tab.dataset.route;
    });
  });

  if (!location.hash) location.replace("#/general");
  renderRoute();
  window.addEventListener("hashchange", renderRoute);
});

async function renderRoute() {
  const view = document.getElementById("view");
  const hash = location.hash.replace(/^#/, "");
  const route = ROUTES.get(hash) || ROUTES.get("/general");

  setActiveTab(route.tab);
  view.innerHTML = `<p class="hint">Cargando ${route.title}…</p>`;
  view.setAttribute("aria-busy", "true");

  try {
    const res = await fetch(route.file);
    const html = await res.text();
    view.innerHTML = html;

    // Si el subarchivo tiene su propio init
    if (typeof window.initPerfilView === "function") {
      window.initPerfilView(route.title.toLowerCase());
    }
  } catch (err) {
    view.innerHTML = `<p class="error">Error al cargar ${route.file}</p>`;
  } finally {
    view.removeAttribute("aria-busy");
  }
}

function setActiveTab(tabId) {
  document.querySelectorAll("[role='tab']").forEach(t => {
    const active = t.id === tabId;
    t.setAttribute("aria-selected", String(active));
  });
}
/* agendar-fecha-hora.js — versión final */