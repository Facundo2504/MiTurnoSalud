// perfil.js – Perfil MiTurnoSalud (vanilla)
// - Guard de sesión con retorno a ?next=
// - Tabs accesibles
// - Tema claro/oscuro con persistencia (localStorage 'mts.theme')
// - Formularios: General, Seguridad, Notif, Privacidad (mock localStorage)

const LS_SESSION = "mts.session";
const LS_PROFILE = "mts.user.profile";
const LS_THEME   = "mts.theme";

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

  btnTheme.addEventListener("click", () => {
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
    btnTheme.setAttribute("aria-pressed", String(isLight));
    btnTheme.textContent = isLight ? "🌙 Noche" : "🌞 Día";
  }

  /* ---------- Tabs accesibles ---------- */
  setupTabs();

  /* ---------- Cargar/crear perfil ---------- */
  let profile = JSON.parse(localStorage.getItem(LS_PROFILE) || "null");
  if (!profile) {
    profile = {
      uid: "demo-uid",
      email: session.email,
      displayName: "Paciente Demo",
      timeZone: "America/Argentina/Cordoba",
      locale: "es",
      photoURL: "",
      accessibility: { highContrast: false, reducedMotion: false },
      notificationPrefs: { channel: "email", hoursBefore: 24 },
      privacy: { marketingOptIn: false, analyticsConsent: false }
    };
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
  }

  /* ---------- General ---------- */
  const fGen = document.getElementById("form-general");
  const displayName = document.getElementById("displayName");
  const timeZone = document.getElementById("timeZone");
  const locale = document.getElementById("locale");
  const avatarInput = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");
  const highContrast = document.getElementById("highContrast");
  const reducedMotion = document.getElementById("reducedMotion");

  displayName.value = profile.displayName || "";
  timeZone.value = profile.timeZone || "America/Argentina/Cordoba";
  locale.value = profile.locale || "es";
  if (profile.photoURL) avatarPreview.src = profile.photoURL;
  highContrast.checked = !!profile.accessibility?.highContrast;
  reducedMotion.checked = !!profile.accessibility?.reducedMotion;

  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { avatarPreview.src = reader.result; };
    reader.readAsDataURL(file);
  });

  fGen.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors(fGen);

    if (!displayName.value.trim()) {
      setFieldError(displayName, "El nombre es obligatorio.");
      return;
    }

    profile.displayName = displayName.value.trim();
    profile.timeZone = timeZone.value;
    profile.locale = locale.value;
    profile.photoURL = avatarPreview.src || "";
    profile.accessibility = {
      highContrast: highContrast.checked,
      reducedMotion: reducedMotion.checked
    };

    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
    // aplicar accesibilidad
    document.documentElement.classList.toggle("high-contrast", highContrast.checked);
    document.documentElement.classList.toggle("reduced-motion", reducedMotion.checked);

    toast("Perfil actualizado ✅");
  });

  /* ---------- Seguridad (mock) ---------- */
  const fSec = document.getElementById("form-seguridad");
  const currentEmail = document.getElementById("currentEmail");
  const currentPassword = document.getElementById("currentPassword");
  const newEmail = document.getElementById("newEmail");
  const newPassword = document.getElementById("newPassword");

  currentEmail.value = profile.email || session.email || "";

  fSec.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors(fSec);

    if (!currentEmail.value.trim() || !currentPassword.value) {
      setFieldError(currentEmail, "Email y contraseña actuales son requeridos.");
      return;
    }
    if (newEmail.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.value)) {
      setFieldError(newEmail, "Nuevo email inválido.");
      return;
    }
    if (newPassword.value && newPassword.value.length < 8) {
      setFieldError(newPassword, "La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newEmail.value) profile.email = newEmail.value.trim();
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));

    currentPassword.value = "";
    newPassword.value = "";
    toast("Seguridad actualizada (mock)");
  });

  /* ---------- Notificaciones ---------- */
  const fNot = document.getElementById("form-notif");
  const channel = document.getElementById("channel");
  const hoursBefore = document.getElementById("hoursBefore");

  channel.value = profile.notificationPrefs?.channel || "email";
  hoursBefore.value = profile.notificationPrefs?.hoursBefore ?? 24;

  fNot.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors(fNot);

    const hb = parseInt(hoursBefore.value || "24", 10);
    if (Number.isNaN(hb) || hb < 1 || hb > 168) {
      setFieldError(hoursBefore, "Debe estar entre 1 y 168.");
      return;
    }
    profile.notificationPrefs = { channel: channel.value, hoursBefore: hb };
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
    toast("Preferencias de notificación guardadas");
  });

  /* ---------- Privacidad ---------- */
  const fPriv = document.getElementById("form-priv");
  const marketingOptIn = document.getElementById("marketingOptIn");
  const analyticsConsent = document.getElementById("analyticsConsent");

  marketingOptIn.checked = !!profile.privacy?.marketingOptIn;
  analyticsConsent.checked = !!profile.privacy?.analyticsConsent;

  fPriv.addEventListener("submit", (e) => {
    e.preventDefault();
    profile.privacy = {
      marketingOptIn: marketingOptIn.checked,
      analyticsConsent: analyticsConsent.checked
    };
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
    toast("Preferencias de privacidad guardadas");
  });

  /* ---------- Cerrar sesión ---------- */
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem(LS_SESSION);
    location.href = "index.html";
  });

  /* ---------- Utils UI ---------- */
  function toast(msg, ms = 2000) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.hidden = false;
    setTimeout(() => { t.hidden = true; t.textContent = ""; }, ms);
  }

  function setFieldError(input, message) {
    if (!input) return;
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    let hint = input.nextElementSibling && input.nextElementSibling.classList?.contains("field-error")
      ? input.nextElementSibling
      : null;
    if (!hint) {
      hint = document.createElement("div");
      hint.className = "field-error";
      input.insertAdjacentElement("afterend", hint);
    }
    hint.textContent = message;
    input.focus();
  }

  function clearErrors(scope) {
    scope.querySelectorAll(".is-invalid").forEach(n => n.classList.remove("is-invalid"));
    scope.querySelectorAll(".field-error").forEach(n => n.remove());
  }
});

/* ===== Tabs accesibles ===== */
function setupTabs() {
  const list = document.querySelector('[role="tablist"]');
  const tabs = list.querySelectorAll('[role="tab"]');
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activateTab(tab, list));
    tab.addEventListener("keydown", (e) => {
      const idx = Array.from(tabs).indexOf(tab);
      if (e.key === "ArrowRight") tabs[Math.min(idx + 1, tabs.length - 1)].focus();
      if (e.key === "ArrowLeft")  tabs[Math.max(idx - 1, 0)].focus();
    });
    if (i > 0) tab.setAttribute("tabindex", "-1");
  });
}
function activateTab(tab, list) {
  const tabs = list.querySelectorAll('[role="tab"]');
  tabs.forEach(t => {
    const selected = t === tab;
    t.setAttribute("aria-selected", String(selected));
    t.setAttribute("tabindex", selected ? "0" : "-1");
    const panel = document.getElementById(t.getAttribute("aria-controls"));
    if (panel) panel.hidden = !selected;
  });
}
