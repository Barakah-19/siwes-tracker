// dashboard.js — stats + recent activity for index.html
document.addEventListener("DOMContentLoaded", () => {
  const user = requireLogin();
  if (!user) return; // redirected to login.html
  wireNav();

  document.getElementById("welcomeHeading").textContent = `Welcome, ${user}`;

  const attendance = getAttendance();
  const learning = getLearning();

  document.getElementById("statDays").textContent = attendance.filter(
    (r) => r.signIn,
  ).length;
  document.getElementById("statEntries").textContent = learning.length;

  const recentAttendance = [...attendance]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const attEl = document.getElementById("recentAttendance");
  attEl.innerHTML = recentAttendance.length
    ? recentAttendance
        .map((r) => {
          let label = "IN PROGRESS",
            cls = "";
          if (r.signIn && r.signOut) {
            label = r.signIn <= "09:00" ? "FULL DAY" : "LATE";
            cls = r.signIn <= "09:00" ? "" : "out";
          }
          return `
      <div class="ledger-row">
        <div class="ledger-date">${formatDateLabel(r.date)}</div>
        <div class="ledger-main"><div class="ledger-title">Signed in ${r.signIn || "—"} · Signed out ${r.signOut || "—"}</div></div>
        <div class="stamp ${cls}">${label}</div>
      </div>`;
        })
        .join("")
    : `
  <div class="empty-hint">No attendance yet. Your records will look like this:</div>
  <div class="ledger-row sample-row">
    <div class="ledger-date">SAMPLE</div>
    <div class="ledger-main"><div class="ledger-title">Signed in 08:50 · Signed out 17:00</div></div>
    <div class="stamp">FULL DAY</div>
  </div>`;

  const recentLearning = [...learning]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 2);
  const learnEl = document.getElementById("recentLearning");
  learnEl.innerHTML = recentLearning.length
    ? recentLearning
        .map(
          (e) => `
    <div class="ledger-row">
      <div class="ledger-date">${formatDateLabel(e.date)}</div>
      <div class="ledger-main">
        <div class="ledger-title">${escapeHtml(e.topic)}</div>
        ${e.note ? `<div class="ledger-note">${escapeHtml(e.note)}</div>` : ""}
      </div>
    </div>`,
        )
        .join("")
    : `
  <div class="empty-hint">No learning entries yet. Here's an example:</div>
  <div class="ledger-row sample-row">
    <div class="ledger-date">SAMPLE</div>
    <div class="ledger-main">
      <div class="ledger-title">JavaScript array methods</div>
      <div class="ledger-note">Used map and filter to render a list from data.</div>
    </div>
  </div>`;
  // --- Backup & Restore ---
  document
    .getElementById("exportBtn")
    .addEventListener("click", exportUserData);

  const importInput = document.getElementById("importInput");
  const importStatus = document.getElementById("importStatus");
  importInput.addEventListener("change", () => {
    const file = importInput.files[0];
    if (!file) return;
    importUserData(
      file,
      () => {
        importStatus.textContent = "Import successful — reloading…";
        setTimeout(() => window.location.reload(), 800);
      },
      (err) => {
        importStatus.textContent = `Import failed: ${err.message}`;
      },
    );
  });
});
