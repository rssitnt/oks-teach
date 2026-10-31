"use strict";
(() => {
const FIELD_IDS = ["activities-a", "activities-b", "activities-c", "activities-d", "activities-e", "activities-f", "activities-g", "activities-h", "activities-i", "days-1", "days-2", "days-3", "days-4", "days-5", "days-6", "days-7", "continuous-1", "continuous-2", "continuous-3", "continuous-4", "continuous-5", "continuous-6", "continuous-7", "continuous-8", "continuous-9a", "continuous-9b"];
const REPORT_TEMPLATE = "English Homework\nSpotlight 4 | Lesson 2\nУченик: {{studentName}}\n\n1. Daily Activities\nA. watching TV — {{activities-a}}\nB. doing homework — {{activities-b}}\nC. reading a book — {{activities-c}}\nD. playing football — {{activities-d}}\nE. drawing a picture — {{activities-e}}\nF. riding a bike — {{activities-f}}\nG. listening to music — {{activities-g}}\nH. playing computer games — {{activities-h}}\nI. climbing a tree — {{activities-i}}\n\n2. Days of the Week\n1. Понедельник — {{days-1}}\n2. Четверг — {{days-2}}\n3. Воскресенье — {{days-3}}\n4. Среда — {{days-4}}\n5. Пятница — {{days-5}}\n6. Вторник — {{days-6}}\n7. Суббота — {{days-7}}\n\n3. Present Continuous\n1. I {{continuous-1}} my homework now.\n2. Lucy {{continuous-2}} a picture now.\n3. They {{continuous-3}} TV now.\n4. My brother {{continuous-4}} a bike now.\n5. We {{continuous-5}} to music now.\n6. The rabbit {{continuous-6}} a tree now.\n7. You {{continuous-7}} computer games now.\n8. My friends {{continuous-8}} football now.\n9. {{continuous-9a}} she {{continuous-9b}} a book now?\n";
const STORAGE_KEY = 'oks.lesson2.homework.v1';
const HOMEWORK_ID = 'lesson-2-v1';
const UNEXPECTED_REPLY = 'Сервер ответил неожиданно. Работа не сдана, попробуйте ещё раз позже.';
const ENDPOINT = 'https://homework-oks-teach.agent0.ru/api/submissions';
const $ = id => document.getElementById(id);
const text = (id, value) => { const element = $(id); element.textContent = value; element.hidden = !value; };
const length = value => value.length;
const validString = (value, max) => typeof value === 'string' && length(value) <= max;
function validReceipt(value) {
  if (!value || typeof value.submissionId !== 'string' || !uuid.test(value.submissionId) || !validString(value.receivedAt, 80)) return false;
  try { return new Date(value.receivedAt).toISOString() === value.receivedAt; } catch (_) { return false; }
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let state = { version: 1, homeworkId: HOMEWORK_ID, studentName: '', answers: Object.fromEntries(FIELD_IDS.map(id => [id, ''])), updatedAt: null, submission: null };
let pending = false;
let storageAvailable = true;
function validState(value) {
  return value && value.version === 1 && value.homeworkId === HOMEWORK_ID && validString(value.studentName, 80) && value.answers && Object.keys(value.answers).length === FIELD_IDS.length && FIELD_IDS.every(id => validString(value.answers[id], 500)) && (value.updatedAt === null || validString(value.updatedAt, 80)) && (value.submission === null || value.submission && uuid.test(value.submission.idempotencyKey) && validString(value.submission.signature, 40_000) && (value.submission.receipt === null || validReceipt(value.submission.receipt)));
}
const clone = value => JSON.parse(JSON.stringify(value));
const ALL_FIELDS = [...FIELD_IDS, 'studentName'];
const getField = (draft, id) => id === 'studentName' ? draft.studentName : draft.answers[id];
const setField = (draft, id, value) => { if (id === 'studentName') draft.studentName = value; else draft.answers[id] = value; };
let observed = clone(state);
let unreadableRaw = null;
const conflicts = new Map();
const conflictPanel = document.createElement('div');
conflictPanel.id = 'draft-conflicts';
$('storage-warning').appendChild(conflictPanel);
function readDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) { unreadableRaw = null; return { draft: { version: 1, homeworkId: HOMEWORK_ID, studentName: '', answers: Object.fromEntries(FIELD_IDS.map(id => [id, ''])), updatedAt: null, submission: null }, raw }; }
  let saved;
  try { saved = JSON.parse(raw); } catch (_) { unreadableRaw = raw; throw new Error('Не удалось восстановить сохранённый черновик.'); }
  if (!validState(saved)) { unreadableRaw = raw; throw new Error('Не удалось восстановить сохранённый черновик.'); }
  unreadableRaw = null; return { draft: saved, raw };
}
function storageFailure() {
  storageAvailable = false;
  text('storage-warning', unreadableRaw !== null
    ? 'Не удалось восстановить сохранённый черновик. Исходная запись сохранена без изменений. Скачайте копию ответов; восстановление доступно ниже.'
    : 'Ответы остаются в форме, но сохранение на устройстве недоступно. Скачайте копию перед закрытием страницы.');
  if (unreadableRaw !== null) {
    const recovery = document.createElement('button'); recovery.type = 'button'; recovery.textContent = 'Сохранить новый черновик';
    recovery.addEventListener('click', () => {
      const raw = unreadableRaw;
      withDraftLock(() => {
        // Explicit recovery only replaces the exact unreadable revision shown here.
        if (localStorage.getItem(STORAGE_KEY) !== raw) { unreadableRaw = null; reconcile(false); return; }
        localStorage.setItem(`${STORAGE_KEY}.recovery.${requestId()}`, raw);
        state.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        unreadableRaw = null; observed = clone(state); storageAvailable = true; text('storage-warning', ''); update();
      }).catch(storageFailure);
    });
    $('storage-warning').appendChild(recovery);
  }
}
try {
  const saved = readDraft(); state = saved.draft; observed = clone(state);
} catch (_) {
  // Retain readable answers from a damaged receipt without rewriting its raw record.
  if (unreadableRaw !== null) try {
    const saved = JSON.parse(unreadableRaw);
    if (saved && saved.submission && saved.submission.receipt !== null && !validReceipt(saved.submission.receipt)) {
      saved.submission.receipt = null;
      if (validState(saved)) { state = saved; observed = clone(state); }
    }
  } catch (_) {}
  storageFailure();
}
function withDraftLock(action) {
  if (!navigator.locks || !navigator.locks.request) return Promise.reject(new Error('Shared draft locking unavailable'));
  return navigator.locks.request(`${STORAGE_KEY}:draft`, action);
}
function syncInputs() {
  ALL_FIELDS.forEach(id => { const input = id === 'studentName' ? $('student-name') : $(id); if (input.value !== getField(state, id)) input.value = getField(state, id); });
}
function fieldLabel(id) {
  if (id === 'studentName') return 'Имя';
  const [exercise, number] = id.split('-');
  return `${exercise === 'activities' ? 'Daily Activities' : exercise === 'days' ? 'Days of the Week' : 'Present Continuous'}: ${exercise === 'activities' ? number.toUpperCase() : number}`;
}
function showConflicts() {
  text('storage-warning', 'Ответ изменён в другой вкладке. Ваш ответ остаётся в форме и в копии. Выберите ответ для сохранения.');
  conflictPanel.replaceChildren();
  for (const [id, conflict] of conflicts) {
    const row = document.createElement('div');
    const description = document.createElement('p'); description.textContent = `${fieldLabel(id)}: другая вкладка — ${conflict.remote}; Ваш ответ — ${getField(state, id)}`;
    row.appendChild(description);
    for (const [label, own] of [['Сохранить мой ответ', true], ['Взять ответ из другой вкладки', false]]) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
      button.addEventListener('click', () => {
        if (!own) setField(state, id, conflict.remote);
        conflicts.delete(id); save();
      }); row.appendChild(button);
    }
    conflictPanel.appendChild(row);
  }
  $('storage-warning').appendChild(conflictPanel);
}
function reconcile(write, receipt = null) {
  const latest = readDraft().draft;
  const merged = clone(state);
  ALL_FIELDS.forEach(id => {
    const local = getField(state, id), before = getField(observed, id), remote = getField(latest, id);
    if (conflicts.has(id) && local !== remote) conflicts.set(id, { remote });
    else if (local === before || local === remote) { setField(merged, id, remote); conflicts.delete(id); }
    else if (remote !== before) conflicts.set(id, { remote });
  });
  // Receipts and retry keys come from the latest shared record, never a stale tab.
  merged.submission = latest.submission;
  if (receipt) merged.submission = receipt;
  merged.updatedAt = latest.updatedAt;
  state = merged; observed = clone(latest); storageAvailable = true;
  if (conflicts.size) { syncInputs(); showConflicts(); update(); return false; }
  if (write) {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); observed = clone(state);
  }
  syncInputs(); text('storage-warning', ''); update(); return true;
}
function signature() { return JSON.stringify({ homeworkId: HOMEWORK_ID, studentName: state.studentName, answers: Object.fromEntries(FIELD_IDS.map(id => [id, state.answers[id]])) }); }
function requestId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function report() { return REPORT_TEMPLATE.replace(/\{\{([^}]+)\}\}/g, (_, id) => id === 'studentName' ? state.studentName : state.answers[id]); }
function update() {
  $('report-preview').value = report();
  const count = FIELD_IDS.filter(id => state.answers[id].trim()).length;
  $('draft-status').textContent = storageAvailable ? (state.updatedAt ? `Черновик сохранён на этом устройстве · заполнено ${count} из 26.` : 'Черновик пока пуст.') : `Заполнено ${count} из 26. Сохранение на устройстве недоступно.`;
  if (!pending) {
    const submission = state.submission;
    text('submission-status', submission && submission.receipt ? (submission.signature === signature() ? `Домашняя работа сдана. Номер: ${submission.receipt.submissionId}.` : `Предыдущая версия работы сдана. Номер: ${submission.receipt.submissionId}. Новые изменения ещё не сданы.`) : '');
    $('submit-homework').textContent = submission && submission.signature === signature() && submission.receipt ? 'Работа уже сдана' : 'Сдать домашку';
  }
}
function save() {
  return withDraftLock(() => reconcile(true)).catch(() => { storageFailure(); update(); return false; });
}
window.addEventListener('storage', event => {
  if (event.key === STORAGE_KEY || event.key === null) withDraftLock(() => reconcile(false)).catch(() => { storageFailure(); update(); });
});
window.addEventListener('focus', () => { withDraftLock(() => reconcile(false)).catch(() => { storageFailure(); update(); }); });
function clearError(id) {
  const input = id === 'studentName' ? $('student-name') : $(id);
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
  text(`error-${id}`, '');
}
function fieldError(id, message) {
  const input = id === 'studentName' ? $('student-name') : $(id);
  if (!input) return;
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', `error-${id}`);
  text(`error-${id}`, message);
}
$('student-name').value = state.studentName;
FIELD_IDS.forEach(id => { $(id).value = state.answers[id]; });
[...FIELD_IDS, 'studentName'].forEach(id => {
  const input = id === 'studentName' ? $('student-name') : $(id);
  input.addEventListener('input', () => {
    if (id === 'studentName') state.studentName = input.value; else state.answers[id] = input.value;
    clearError(id);
    text('submission-error', '');
    return save();
  });
});
$('homework-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (pending) return;
  // A known committed exact payload never needs another request.
  if (!navigator.locks || !navigator.locks.request) {
    if (state.submission && state.submission.signature === signature() && state.submission.receipt) { update(); return; }
    text('submission-error', 'Для безопасной сдачи откройте работу в современном браузере. Ответы можно скачать или скопировать.'); return;
  }
  pending = true; $('submit-homework').disabled = true; $('submit-homework').textContent = 'Ожидаем другую вкладку…';
  text('submission-status', 'Проверяем черновик и отправку из другой вкладки…');
  const waiting = new AbortController();
  const waitTimer = setTimeout(() => waiting.abort(), 30000);
  let submitted = null;
  try {
    await navigator.locks.request(`${STORAGE_KEY}:submission`, { signal: waiting.signal }, async () => {
      clearTimeout(waitTimer);
      if (!await withDraftLock(() => reconcile(true))) {
        text('submission-error', 'Сначала выберите ответы, изменённые в другой вкладке.'); return;
      }
      let firstError = null;
      ALL_FIELDS.forEach(id => {
        clearError(id); const value = getField(state, id);
        if (!value.trim() || length(value) > (id === 'studentName' ? 80 : 500)) {
          fieldError(id, !value.trim() ? (id === 'studentName' ? 'Укажите ваше имя.' : 'Заполните ответ.') : 'Ответ слишком длинный.'); firstError ||= id;
        }
      });
      if (firstError) { text('submission-error', 'Работа ещё не сдана. Заполните все ответы и укажите имя.'); (firstError === 'studentName' ? $('student-name') : $(firstError)).focus(); return; }
      const current = signature();
      if (state.submission && state.submission.signature === current && state.submission.receipt) return;
      submitted = state.submission && state.submission.signature === current ? clone(state.submission) : { idempotencyKey: requestId(), signature: current, receipt: null };
      const body = JSON.stringify({ ...JSON.parse(current), idempotencyKey: submitted.idempotencyKey });
      if (new TextEncoder().encode(body).length > 40_000) { text('submission-error', 'Работа ещё не сдана: общий объём ответов слишком большой. Сократите ответы и попробуйте снова.'); return; }
      if (!await withDraftLock(() => {
        if (!reconcile(false) || signature() !== current) return false;
        return reconcile(true, submitted);
      })) { text('submission-error', 'Черновик изменился в другой вкладке. Проверьте ответы и сдайте работу снова.'); return; }
      $('submit-homework').textContent = 'Сдаём работу…'; text('submission-error', ''); text('submission-status', 'Сохраняем ответы у преподавателя…');
      const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 25000);
      try {
        const response = await fetch(ENDPOINT, { method: 'POST', mode: 'cors', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body, signal: controller.signal });
        const result = await response.json().catch(() => null);
        if (!response.ok || !validReceipt(result)) {
          const reply = result !== null && typeof result === 'object' ? result : {};
          if (reply.fieldErrors && typeof reply.fieldErrors === 'object') Object.entries(reply.fieldErrors).forEach(([id, message]) => { if ((id === 'studentName' || FIELD_IDS.includes(id)) && typeof message === 'string') fieldError(id, message.slice(0, 500)); });
          throw Object.assign(new Error('Unexpected submission reply'), { pupilMessage: typeof reply.error === 'string' && reply.error.trim() ? `Работа ещё не сдана. Ответы остаются в форме. Попробуйте снова. ${reply.error.slice(0, 500)}` : UNEXPECTED_REPLY });
        }
        submitted.receipt = { submissionId: result.submissionId, receivedAt: result.receivedAt };
        state.submission = clone(submitted);
        // Persist confirmation even if concurrent edits now conflict. Keep those edits local.
        await withDraftLock(() => {
          const latest = readDraft().draft; latest.submission = submitted;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(latest));
          reconcile(false);
        });
      } finally { clearTimeout(timer); }
    });
  } catch (error) {
    if (unreadableRaw !== null || !storageAvailable) storageFailure();
    if (submitted && submitted.receipt) {
      storageAvailable = false;
      text('storage-warning', 'Работа сдана, но подтверждение не удалось сохранить на устройстве. Скопируйте номер сдачи перед закрытием страницы.');
      text('submission-error', '');
    } else {
    text('submission-status', '');
    text('submission-error', error.pupilMessage || `Работа ещё не сдана. Ответы остаются в форме. Попробуйте снова.${error.name === 'AbortError' ? ' Другая вкладка не завершила отправку или сервер не ответил вовремя.' : error instanceof TypeError ? ' Не удалось связаться с сервером.' : ''}`);
    }
  } finally {
    clearTimeout(waitTimer); pending = false; $('submit-homework').disabled = false; update();
  }
});
$('copy-report').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(report()); text('report-status', 'Ответы скопированы.'); }
  catch (_) { $('report-preview').focus(); $('report-preview').select(); text('report-status', 'Выделен текст ответов. Скопируйте его вручную.'); }
});
$('download-report').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([report()], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'English Homework.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  text('report-status', 'Копия ответов подготовлена для скачивания.');
});
function renderTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  $('theme-toggle').setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  $('theme-toggle').innerHTML = dark ? '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 15.4A8.5 8.5 0 018.6 4 8.5 8.5 0 1020 15.4z"/></svg>';
}
$('theme-toggle').addEventListener('click', () => { document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('oks.lesson2.theme', document.documentElement.dataset.theme); } catch (_) {} renderTheme(); });
renderTheme();
update();
})();
