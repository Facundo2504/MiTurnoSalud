/* auth.js – Gestión de autenticación para MiTurnoSalud
   Compatible con app.js (MTS_KEYS, store)
   Incluye:
   - Registro con validación
   - Login seguro
   - Cierre de sesión con redirección
   - Protección de rutas (requireAuth / redirectIfAuth)
   - Simulación de recuperación de contraseña
*/
(function () {
  const { readJSON, writeJSON, remove } = window.store;
  const { SESSION, USERS } = window.MTS_KEYS;

  /* ------------------------------
     Helpers
  ------------------------------ */
  const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
  const cleanText = (t) => String(t || '').trim();
  const isEmailValid = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // 1) --- Helpers ---
  const isPasswordValid = (pwd) =>
    typeof pwd === 'string' && pwd.length >= 8;


  /* ------------------------------
     Core auth methods
  ------------------------------ */
  function currentUser() {
    return readJSON(SESSION, null);
  }

  function requireAuth() {
    if (!currentUser()) location.replace('index.html');
  }

  function redirectIfAuth(to = 'dashboard.html') {
    if (currentUser()) location.replace(to);
  }

  function login(email, password) {
    const users = readJSON(USERS, []);
    const user = users.find(u => u.email === normalizeEmail(email));
    if (!user) throw new Error('No existe una cuenta con ese correo electrónico.');
    if (user.password !== password) throw new Error('Contraseña incorrecta.');

    writeJSON(SESSION, { email: user.email, name: user.name });
    return user;
  }

  function logout(redirect = true) {
    remove(SESSION);
  // limpieza de datos temporales del flujo
    remove('mts:appointment:draft');
    remove('mts:lastConfirm');
    if (redirect) location.replace('index.html');
  }
  function register({ name, lastName, email, obraSocial, telefono, password }) {
    name = cleanText(name);
    lastName = cleanText(lastName);
    email = normalizeEmail(email);
    obraSocial = cleanText(obraSocial);
    telefono = cleanText(telefono);

    if (!isEmailValid(email)) throw new Error('El correo electrónico no es válido.');
    if (!isPasswordValid(password)) throw new Error('La contraseña debe tener al menos 6 caracteres.');

    const users = readJSON(USERS, []);
    if (users.some(u => u.email === email))
      throw new Error('Este correo ya está registrado.');

    const user = {
      name: `${name} ${lastName}`.trim(),
      email,
      obraSocial,
      telefono,
      password
    };

    users.push(user);
    writeJSON(USERS, users);
    writeJSON(SESSION, { email: user.email, name: user.name });
    return user;
  }

  /* ------------------------------
     Recuperar contraseña (simulado)
  ------------------------------ */
  function recoverPassword(email) {
    const users = readJSON(USERS, []);
    const user = users.find(u => u.email === normalizeEmail(email));
    if (!user) throw new Error('No se encontró una cuenta con ese correo.');
    // Simulación
    alert(`📩 Se envió un enlace de recuperación a ${email} (simulado).`);
    return true;
  }

  /* ------------------------------
     Exponer en window
  ------------------------------ */
  window.Auth = {
    currentUser,
    requireAuth,
    redirectIfAuth,
    login,
    logout,
    register,
    recoverPassword
  };
})();
