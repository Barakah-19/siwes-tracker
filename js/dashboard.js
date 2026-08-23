// dashboard.js — stats + recent activity for index.html
function computeStreak(records) {
  const daySet = new Set(records.filter(r => r.signIn).map(r => r.date));
  let streak = 0;
  const d = new Date();
  while (true) {
    const dateStr = d.toISOString().slice(0, 10);
    if (!daySet.has(dateStr)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

document.addEventListener('DOMContentLoaded', () => {
  const user = requireLogin();
  if (!user) return; // redirected to login.html
  wireNav();

  document.getElementById('welcomeHeading').textContent = `Welcome, ${user}`;

  const attendance = getAttendance();
  const learning = getLearning();

  document.getElementById('statDays').textContent = attendance.filter(r => r.signIn).length;
  document.getElementById('statEntries').textContent = learning.length;
  document.getElementById('statStreak').textContent = computeStreak(attendance);

  const recentAttendance = [...attendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const attEl = document.getElementById('recentAttendance');
  attEl.innerHTML = recentAttendance.length ? recentAttendance.map(r => {
    let label = 'IN PROGRESS', cls = '';
    if (r.signIn && r.signOut) {
      label = r.signIn <= '09:00' ? 'FULL DAY' : 'LATE';
      cls = r.signIn <= '09:00' ? '' : 'out';
    }
    return `
      <div class="ledger-row">
        <div class="ledger-date">${formatDateLabel(r.date)}</div>
        <div class="ledger-main"><div class="ledger-title">Signed in ${r.signIn || '—'} · Signed out ${r.signOut || '—'}</div></div>
        <div class="stamp ${cls}">${label}</div>
      </div>`;
  }).join('') : '<div class="empty-hint">No attendance yet.</div>';

  const recentLearning = [...learning].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);
  const learnEl = document.getElementById('recentLearning');
  learnEl.innerHTML = recentLearning.length ? recentLearning.map(e => `
    <div class="ledger-row">
      <div class="ledger-date">${formatDateLabel(e.date)}</div>
      <div class="ledger-main">
        <div class="ledger-title">${escapeHtml(e.topic)}</div>
        ${e.note ? `<div class="ledger-note">${escapeHtml(e.note)}</div>` : ''}
      </div>
    </div>`).join('') : '<div class="empty-hint">No learning entries yet.</div>';
});
