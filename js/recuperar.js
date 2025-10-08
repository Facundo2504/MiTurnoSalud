/* registro.js */
document.addEventListener('DOMContentLoaded', () => {
  Auth.redirectIfAuth();
  const form = document.querySelector('form.form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      name: form.nombre.value.trim(),
      lastName: form.apellido.value.trim(),
      email: form.email.value.trim(),
      obraSocial: form.obraSocial?.value?.trim() || '',
      telefono: form.telefono?.value?.trim() || '',
      password: prompt('Crea una contraseña (mín. 8 caracteres):', '') || '' // demo simple
    };
    if (payload.password.length < 8) return alert('La contraseña debe tener al menos 8 caracteres.');
    try {
      Auth.register(payload);
      location.assign('dashboard.html');
    } catch (err) {
      alert(err.message);
    }
  });
});
