// report.js — supervisor-facing summary: printable view + CSV export
document.addEventListener("DOMContentLoaded", () => {
  const user = requireLogin();
  if (!user) return; // redirected to login.html
  wireNav();

  const attendance = [...getAttendance()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const learning = [...getLearning()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  document.getElementById("reportIntern").textContent = `Intern: ${user}`;
  document.getElementById("reportGenerated").textContent =
    `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

  document.getElementById("statDays").textContent = attendance.filter(
    (r) => r.signIn,
  ).length;
  document.getElementById("statEntries").textContent = learning.length;

  function statusFor(r) {
    if (r.signIn && !r.signOut) return "In progress";
    if (r.signIn && r.signOut) return r.signIn <= "09:00" ? "Full day" : "Late";
    return "—";
  }

  const attBody = document.getElementById("reportAttendanceBody");
  attBody.innerHTML = attendance.length
    ? attendance
        .map(
          (r) => `
        <tr>
          <td>${formatDateLabel(r.date)}</td>
          <td>${r.signIn || "—"}</td>
          <td>${r.signOut || "—"}</td>
          <td>${statusFor(r)}</td>
        </tr>`,
        )
        .join("")
    : `<tr><td colspan="4" class="empty-hint">No attendance records yet.</td></tr>`;

  const learnBody = document.getElementById("reportLearningBody");
  learnBody.innerHTML = learning.length
    ? learning
        .map(
          (e) => `
        <tr>
          <td>${formatDateLabel(e.date)}</td>
          <td>${escapeHtml(e.topic)}</td>
          <td>${escapeHtml(e.note || "")}</td>
        </tr>`,
        )
        .join("")
    : `<tr><td colspan="3" class="empty-hint">No learning entries yet.</td></tr>`;

  document
    .getElementById("printBtn")
    .addEventListener("click", () => window.print());

  document.getElementById("csvBtn").addEventListener("click", () => {
    const rows = [["Type", "Date", "Detail 1", "Detail 2", "Detail 3"]];
    attendance.forEach((r) =>
      rows.push([
        "Attendance",
        r.date,
        r.signIn || "",
        r.signOut || "",
        statusFor(r),
      ]),
    );
    learning.forEach((e) =>
      rows.push(["Learning", e.date, e.topic, e.note || "", ""]),
    );

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `siwes-report-${user.trim().toLowerCase().replace(/\s+/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
});
