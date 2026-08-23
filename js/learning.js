// learning.js — add/list/delete entries for learning-log.html
document.addEventListener('DOMContentLoaded', () => {
  if (!requireLogin()) return; // redirected to login.html
  wireNav();

  const form = document.getElementById('learningForm');
  const topicInput = document.getElementById('topicInput');
  const noteInput = document.getElementById('noteInput');
  const listEl = document.getElementById('learningList');
  const countEl = document.getElementById('learningCount');

  function render() {
    const entries = getLearning().sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    countEl.textContent = `${entries.length} total`;

    if (entries.length === 0) {
      listEl.innerHTML = '<div class="empty-hint">No entries yet. Add what you learned today above.</div>';
      return;
    }

    listEl.innerHTML = entries.map(e => `
      <div class="ledger-row">
        <div class="ledger-date">${formatDateLabel(e.date)}</div>
        <div class="ledger-main">
          <div class="ledger-title">${escapeHtml(e.topic)}</div>
          ${e.note ? `<div class="ledger-note">${escapeHtml(e.note)}</div>` : ''}
        </div>
        <button class="btn btn-ghost" style="padding:6px 12px;font-size:12px;" data-delete="${e.id}">Delete</button>
      </div>`).join('');

    listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-delete'));
        saveLearning(getLearning().filter(e => e.id !== id));
        render();
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const topic = topicInput.value.trim();
    const note = noteInput.value.trim();
    if (!topic) {
      topicInput.focus();
      return;
    }
    const entries = getLearning();
    entries.push({ id: Date.now(), date: todayStr(), topic, note });
    saveLearning(entries);
    topicInput.value = '';
    noteInput.value = '';
    render();
  });

  render();
});
