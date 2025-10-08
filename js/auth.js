/* auth.js */
(function () {
  const { readJSON, writeJSON } = window.store;
  const { SESSION, USERS } = window.MTS_KEYS;

  function currentUser() { return readJSON(SESSION, null); }
  function requireAuth() {
    if (!currentUser()) location.replace('index.html');
  }
  function redirectIfAuth(to = 'dashboard.html') {
    if (currentUser()) location.replace(to);
  }

  function login(email, password) {
    const users = readJSON(USERS, []);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error('Credenciales inválidas');
    writeJSON(SESSION, { email: user.email, name: user.name });
    return user;
  }

  function logout() { localStorage.removeItem(SESSION); }

  function register({ name, lastName, email, obraSocial, telefono, password }) {
    const users = readJSON(USERS, []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase()))
      throw new Error('El correo ya está registrado');
    const user = { name: `${name} ${lastName}`.trim(), email, obraSocial, telefono, password };
    users.push(user); writeJSON(USERS, users);
    writeJSON(SESSION, { email: user.email, name: user.name });
    return user;
  }

  window.Auth = { currentUser, requireAuth, redirectIfAuth, login, logout, register };
})();
