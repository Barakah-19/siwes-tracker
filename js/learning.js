// learning.js — add/edit/list/delete entries for learning-log.html
document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return; // redirected to login.html
  wireNav();

  const form = document.getElementById("learningForm");
  const topicInput = document.getElementById("topicInput");
  const noteInput = document.getElementById("noteInput");
  const listEl = document.getElementById("learningList");
  const countEl = document.getElementById("learningCount");
  const submitBtn = document.getElementById("submitBtn");
  const editingBanner = document.getElementById("editingBanner");
  const editingLabel = document.getElementById("editingLabel");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  let editingId = null; // null = adding a new entry, otherwise the id being edited

  function enterEditMode(entry) {
    editingId = entry.id;
    topicInput.value = entry.topic;
    noteInput.value = entry.note || "";
    submitBtn.textContent = "Update Entry";
    editingLabel.textContent = `Editing "${entry.topic}"`;
    editingBanner.classList.add("show");
    topicInput.focus();
  }

  function exitEditMode() {
    editingId = null;
    submitBtn.textContent = "Save Entry";
    editingBanner.classList.remove("show");
    form.reset();
  }

  function render() {
    const entries = getLearning().sort(
      (a, b) => b.date.localeCompare(a.date) || b.id - a.id,
    );
    countEl.textContent = `${entries.length} total`;

    if (entries.length === 0) {
      listEl.innerHTML = `
  <div class="empty-hint">No entries yet. Add what you learned today above. Here's an example:</div>
  <div class="ledger-row sample-row">
    <div class="ledger-date">SAMPLE</div>
    <div class="ledger-main">
      <div class="ledger-title">JavaScript array methods</div>
      <div class="ledger-note">Used map and filter to render a list from data.</div>
    </div>
  </div>`;
      return;
    }

    listEl.innerHTML = entries
      .map(
        (e) => `
      <div class="ledger-row">
        <div class="ledger-date">${formatDateLabel(e.date)}</div>
        <div class="ledger-main">
          <div class="ledger-title">${escapeHtml(e.topic)}</div>
          ${e.note ? `<div class="ledger-note">${escapeHtml(e.note)}</div>` : ""}
        </div>
        <div class="ledger-actions">
          <button class="btn btn-ghost btn-small" data-edit="${e.id}">Edit</button>
          <button class="btn btn-ghost btn-small" data-delete="${e.id}">Delete</button>
        </div>
      </div>`,
      )
      .join("");

    listEl.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-edit"));
        const entry = getLearning().find((e) => e.id === id);
        if (entry) enterEditMode(entry);
      });
    });

    listEl.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-delete"));
        saveLearning(getLearning().filter((e) => e.id !== id));
        if (editingId === id) exitEditMode();
        render();
      });
    });
  }

  cancelEditBtn.addEventListener("click", exitEditMode);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const topic = topicInput.value.trim();
    const note = noteInput.value.trim();
    if (!topic) {
      topicInput.focus();
      return;
    }

    if (editingId !== null) {
      // Update the existing entry in place, keep its original date/id
      const entries = getLearning().map((entry) =>
        entry.id === editingId ? { ...entry, topic, note } : entry,
      );
      saveLearning(entries);
    } else {
      const entries = getLearning();
      entries.push({ id: Date.now(), date: todayStr(), topic, note });
      saveLearning(entries);
    }

    exitEditMode();
    render();
  });

  render();
});
