// login.js — mock "auth": no password, no database, just a name
// that gets remembered in localStorage for this browser.
document.addEventListener('DOMContentLoaded', () => {
  // Already "logged in" from a previous visit — skip straight in.
  if (getUser()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const nameInput = document.getElementById('nameInput');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    saveUser(name);
    window.location.href = 'index.html';
  });
});
