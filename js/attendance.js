// attendance.js — sign in/out logic and history list for attendance.html
document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return; // redirected to login.html
  wireNav();

  const signInBtn = document.getElementById("signInBtn");
  const signOutBtn = document.getElementById("signOutBtn");
  const statusEl = document.getElementById("punchStatus");
  const historyEl = document.getElementById("attendanceHistory");
  const countEl = document.getElementById("attendanceCount");

  function getTodayRecord(records) {
    return records.find((r) => r.date === todayStr());
  }

  function stampFor(record) {
    if (record.signIn && !record.signOut)
      return { label: "IN PROGRESS", cls: "" };
    if (record.signIn && record.signOut) {
      return record.signIn <= "09:00"
        ? { label: "FULL DAY", cls: "" }
        : { label: "LATE", cls: "out" };
    }
    return { label: "—", cls: "" };
  }

  function render() {
    const records = getAttendance();
    const today = getTodayRecord(records);

    if (!today || !today.signIn) {
      statusEl.textContent = "Not signed in yet today";
      signInBtn.disabled = false;
      signOutBtn.disabled = true;
    } else if (today.signIn && !today.signOut) {
      statusEl.textContent = `Signed in at ${today.signIn} — not signed out yet`;
      signInBtn.disabled = true;
      signOutBtn.disabled = false;
    } else {
      statusEl.textContent = `Signed in ${today.signIn} · Signed out ${today.signOut}`;
      signInBtn.disabled = true;
      signOutBtn.disabled = true;
    }

    const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
    countEl.textContent = `${records.length} record${records.length === 1 ? "" : "s"}`;

    if (sorted.length === 0) {
      historyEl.innerHTML =
        '<div class="empty-hint">No attendance recorded yet. Sign in above to start your log.</div>';
      return;
    }

    historyEl.innerHTML = sorted
      .map((r) => {
        const stamp = stampFor(r);
        return `
        <div class="ledger-row">
          <div class="ledger-date">${formatDateLabel(r.date)}</div>
          <div class="ledger-main"><div class="ledger-title">${r.signIn || "—"} → ${r.signOut || "—"}</div></div>
          <div class="stamp ${stamp.cls}">${stamp.label}</div>
        </div>`;
      })
      .join("");
  }

  signInBtn.addEventListener("click", () => {
    const records = getAttendance();
    let today = getTodayRecord(records);
    if (!today) {
      records.push({ date: todayStr(), signIn: nowTimeStr(), signOut: null });
    } else if (!today.signIn) {
      today.signIn = nowTimeStr();
    }
    saveAttendance(records);
    render();
  });

  signOutBtn.addEventListener("click", () => {
    const records = getAttendance();
    const today = getTodayRecord(records);
    if (today && today.signIn && !today.signOut) {
      today.signOut = nowTimeStr();
      saveAttendance(records);
      render();
    }
  });

  render();
});
