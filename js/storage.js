// storage.js — shared data helpers used by every page.
// All data lives in localStorage under these keys.
const STORAGE_KEYS = {
  ATTENDANCE: 'siwes_attendance',
  LEARNING: 'siwes_learning',
  USER: 'siwes_user'
};

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "2026-08-22"
}

function nowTimeStr() {
  return new Date().toTimeString().slice(0, 5); // "08:52"
}

function shiftDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Mock auth (no backend — just remembers a name) ---
function getUser() {
  return localStorage.getItem(STORAGE_KEYS.USER) || null;
}

function saveUser(name) {
  localStorage.setItem(STORAGE_KEYS.USER, name);
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// Call at the top of every protected page. Sends to login.html if no
// name is stored yet, so people can't skip straight to the dashboard.
function requireLogin() {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

// Fills in the nav's "signed in as ..." text and wires the Log out
// button, if the current page has them.
function wireNav() {
  const user = getUser();
  const userEl = document.getElementById('navUser');
  const logoutBtn = document.getElementById('logoutBtn');
  if (userEl && user) userEl.textContent = user;
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearUser();
      window.location.href = 'login.html';
    });
  }
}

// --- Attendance ---
function getAttendance() {
  const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  if (!raw) {
    // First time opening the app: seed a few sample days so the UI
    // isn't empty. Delete these anytime from the Attendance page.
    const seed = [
      { date: shiftDate(-4), signIn: '08:50', signOut: '16:55' },
      { date: shiftDate(-3), signIn: '08:55', signOut: '17:01' },
      { date: shiftDate(-2), signIn: '08:47', signOut: '17:02' },
      { date: shiftDate(-1), signIn: '10:15', signOut: '17:00' }
    ];
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw);
}

function saveAttendance(records) {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
}

// --- Learning log ---
function getLearning() {
  const raw = localStorage.getItem(STORAGE_KEYS.LEARNING);
  if (!raw) {
    const seed = [
      { id: 1, date: shiftDate(-3), topic: 'JS array methods', note: 'map, filter, and forEach for rendering lists from data.' },
      { id: 2, date: shiftDate(-2), topic: 'DOM event listeners', note: 'Wired up a form submit handler and prevented default reload.' },
      { id: 3, date: shiftDate(-1), topic: 'JavaScript localStorage basics', note: 'Learned getItem/setItem and JSON.stringify for saving data.' }
    ];
    localStorage.setItem(STORAGE_KEYS.LEARNING, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw);
}

function saveLearning(entries) {
  localStorage.setItem(STORAGE_KEYS.LEARNING, JSON.stringify(entries));
}
