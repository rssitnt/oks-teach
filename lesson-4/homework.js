'use strict';
(() => {
  const DATA = window.Homework4Data;
  const STORAGE_KEY = DATA.storageKey;
  const THEME_KEY = 'oks.lesson4.theme';
  const LIMIT = { closed: 200, free: 300, name: 80 };
  const $ = id => document.getElementById(id);
  const all = DATA.exercises.flatMap(exercise => exercise.items.map(item => ({ item, exercise })));
  const closed = all.filter(entry => !entry.item.free);
  const ids = all.map(entry => entry.item.id);
  const exerciseOf = Object.fromEntries(all.map(entry => [entry.item.id, entry.exercise]));
  const itemOf = Object.fromEntries(all.map(entry => [entry.item.id, entry.item]));

  let state = { studentName: '', answers: Object.fromEntries(ids.map(id => [id, ''])), updatedAt: null };
  let results = {};
  let checked = false;
  let revealed = false;
  let storageOk = true;
  let damaged = false;

  function normal(value) {
    return String(value == null ? '' : value).normalize('NFKC').toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '').replace(/[’‘`´ʼ′]/g, "'")
      .replace(/\bthere's\b/g, 'there is').replace(/\baren't\b/g, 'are not').replace(/\bisn't\b/g, 'is not')
      .replace(/\bdon't\b/g, 'do not').replace(/\bdoesn't\b/g, 'does not')
      .replace(/-/g, ' ').replace(/[.!?,;:]+(?=\s|$)/g, '').replace(/\s+/g, ' ').trim();
  }
  const isCorrect = (item, value) => !!normal(value) && item.answers.some(answer => normal(answer) === normal(value));

  function readStorage() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === null) return;
      const saved = JSON.parse(raw);
      if (!saved || saved.version !== 1 || !saved.answers || typeof saved.answers !== 'object') throw new Error('shape');
      ids.forEach(id => {
        const limit = itemOf[id].free ? LIMIT.free : LIMIT.closed;
        const value = saved.answers[id];
        state.answers[id] = typeof value === 'string' && value.length <= limit ? value : '';
      });
      state.studentName = typeof saved.studentName === 'string' && saved.studentName.length <= LIMIT.name ? saved.studentName : '';
      state.updatedAt = typeof saved.updatedAt === 'string' ? saved.updatedAt : null;
    } catch (error) {
      if (error && error.name === 'SecurityError') storageOk = false;
      else if (error instanceof SyntaxError || (error && error.message === 'shape')) damaged = true;
      else storageOk = false;
    }
  }
  function writeStorage() {
    state.updatedAt = new Date().toISOString();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, studentName: state.studentName, answers: state.answers, updatedAt: state.updatedAt }));
      storageOk = true; damaged = false;
    } catch (_) { storageOk = false; }
  }
  readStorage();

  const make = (tag, attrs = {}, text) => {
    const element = document.createElement(tag);
    Object.entries(attrs).forEach(([name, value]) => { if (value !== undefined && value !== false) element.setAttribute(name, value === true ? '' : value); });
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function buildField(item, number, exercise) {
    const wrap = make('div', { class: 'homework-question' + (item.image ? ' picture-card' : ''), 'data-question': item.id });
    if (item.image) {
      const figure = make('figure');
      figure.appendChild(make('img', { src: item.image, alt: item.alt, width: 640, height: 480, loading: 'lazy', decoding: 'async' }));
      wrap.appendChild(figure);
    }
    const prompt = make('p', { class: 'question-prompt', lang: 'en', id: 'prompt-' + item.id });
    prompt.appendChild(make('b', {}, number + '.'));
    prompt.appendChild(document.createTextNode(' ' + item.prompt));
    wrap.appendChild(prompt);
    if (item.free) wrap.appendChild(make('p', { class: 'question-hint', lang: 'en' }, 'Например: ' + item.start));
    const label = make('label', { class: 'answer-field', for: item.id });
    label.appendChild(make('span', {}, item.free ? 'Твой ответ' : 'Ответ'));
    const input = make('input', {
      id: item.id, class: 'answer-input', type: 'text', maxlength: item.free ? LIMIT.free : LIMIT.closed, spellcheck: 'false', autocomplete: 'off', autocapitalize: 'none',
      'aria-label': item.image ? 'Картинка ' + number + ': ' + item.alt : number + '. ' + item.prompt
    });
    input.value = state.answers[item.id];
    label.appendChild(input);
    wrap.appendChild(label);
    if (item.free) {
      wrap.appendChild(make('span', { class: 'teacher-note' }, 'Проверит преподаватель'));
    } else {
      wrap.appendChild(make('span', { class: 'field-mark', id: 'mark-' + item.id, 'data-mark-for': item.id }));
      wrap.appendChild(make('span', { class: 'field-answer', id: 'answer-' + item.id, hidden: true }));
    }
    return wrap;
  }

  function buildPage() {
    const host = $('exercises');
    DATA.exercises.forEach((exercise, index) => {
      const section = make('section', { class: 'exercise', id: 'exercise-' + exercise.id, 'aria-labelledby': 'title-' + exercise.id });
      section.appendChild(make('h2', { id: 'title-' + exercise.id, lang: 'en' }, (index + 1) + '. ' + exercise.title));
      section.appendChild(make('p', { lang: 'en' }, exercise.english));
      section.appendChild(make('p', {}, exercise.instruction));
      const list = make('div', { class: exercise.kind === 'picture' ? 'picture-grid' : 'question-list' });
      exercise.items.forEach((item, position) => list.appendChild(buildField(item, position + 1, exercise)));
      section.appendChild(list);
      if (exercise.hint) section.appendChild(make('p', { class: 'exercise-hint', id: 'hint-' + exercise.id, hidden: true }, exercise.hint));
      host.appendChild(section);
    });
  }
  buildPage();
  $('student-name').value = state.studentName;

  const text = (id, value) => { const element = $(id); element.textContent = value; element.hidden = !value; };
  const filled = () => ids.filter(id => state.answers[id].trim()).length;
  const okCount = () => closed.filter(entry => results[entry.item.id] === true).length;

  function warning() {
    if (!storageOk) text('storage-warning', 'Ответы остаются в форме, но сохранение на этом устройстве недоступно. Скопируй или скачай ответы перед закрытием страницы.');
    else if (damaged) text('storage-warning', 'Сохранённый черновик не удалось прочитать. Можно начать заново: новая запись заменит старую.');
    else text('storage-warning', '');
  }
  function status() {
    const count = filled();
    $('draft-status').textContent = storageOk ? (state.updatedAt ? `Черновик сохранён на этом устройстве · заполнено ${count} из ${ids.length}.` : 'Черновик пока пуст.') : `Заполнено ${count} из ${ids.length}. Сохранение на устройстве недоступно.`;
  }

  function report() {
    const total = closed.length, done = Object.keys(results).length;
    const lines = ['English Homework', 'Spotlight 4 | Lesson 4', 'Ученик: ' + state.studentName, ''];
    lines.push(checked ? `Результат проверки на странице: ${okCount()} из ${total}` + (done < total ? ` (проверено полей: ${done})` : '') : 'Результат проверки на странице: ещё не проверено', '');
    DATA.exercises.forEach((exercise, index) => {
      lines.push(`${index + 1}. ${exercise.title}` + (exercise.items[0].free ? ' (проверит преподаватель)' : ''));
      exercise.items.forEach((item, position) => {
        const answer = state.answers[item.id].trim() || '(пусто)';
        const mark = item.free ? '' : results[item.id] === true ? ' ✓' : results[item.id] === false ? ' ✗' : '';
        const label = item.image ? 'картинка (' + item.alt + ')' : item.prompt;
        lines.push(`${position + 1}. ${label} — ${answer}${mark}`);
      });
      lines.push('');
    });
    lines.push('Свободные ответы упражнения ' + DATA.exercises.length + ' сайт не проверяет: их проверит преподаватель.');
    return lines.join('\n') + '\n';
  }
  function refresh() { status(); warning(); $('report-preview').value = report(); }

  function renderMark(id) {
    const mark = $('mark-' + id), input = $(id), answer = $('answer-' + id);
    mark.textContent = ''; mark.classList.remove('ok', 'bad'); input.removeAttribute('aria-invalid'); input.classList.remove('is-ok');
    const described = ['mark-' + id];
    answer.hidden = true; answer.textContent = '';
    if (results[id] === true) { mark.classList.add('ok'); mark.textContent = '✓ Верно'; input.classList.add('is-ok'); }
    else if (results[id] === false) {
      mark.classList.add('bad');
      mark.textContent = (state.answers[id].trim() ? '✗ Пока не так. ' : '✗ Пока пусто. ') + 'Посмотри в уроке: ' + exerciseOf[id].lesson + '.';
      input.setAttribute('aria-invalid', 'true');
      if (revealed) { answer.textContent = 'Правильный ответ: ' + itemOf[id].answers[0]; answer.hidden = false; described.push('answer-' + id); }
    }
    input.setAttribute('aria-describedby', described.join(' '));
  }
  function renderHints() {
    DATA.exercises.forEach(exercise => {
      const hint = $('hint-' + exercise.id);
      if (hint) hint.hidden = !exercise.items.some(item => results[item.id] === false);
    });
  }
  function renderScore() {
    const total = closed.length, ok = okCount(), pending = closed.filter(entry => results[entry.item.id] === undefined).length;
    let message = `Верно: ${ok} из ${total}.`;
    if (pending) message += ' Изменённые ответы проверь кнопкой «Проверить».';
    else if (ok === total) message += ' Отлично, всё верно!';
    else message += ' Исправь ответы с ✗ и нажми «Проверить» ещё раз.';
    message += ' Свободные ответы упражнения ' + DATA.exercises.length + ' проверит преподаватель.';
    $('score').textContent = message;
  }
  function renderAll() { closed.forEach(entry => renderMark(entry.item.id)); renderHints(); renderScore(); $('show-answers').disabled = !checked; }

  function check() {
    results = {};
    closed.forEach(entry => { results[entry.item.id] = isCorrect(entry.item, state.answers[entry.item.id]); });
    checked = true;
    renderAll(); refresh();
  }

  all.forEach(({ item }) => {
    $(item.id).addEventListener('input', event => {
      state.answers[item.id] = event.target.value;
      if (!item.free && results[item.id] !== undefined) {
        delete results[item.id];
        renderMark(item.id); renderHints(); renderScore();
      }
      writeStorage(); refresh();
    });
  });
  $('student-name').addEventListener('input', event => { state.studentName = event.target.value; writeStorage(); refresh(); });
  $('homework-form').addEventListener('submit', event => { event.preventDefault(); check(); });
  $('show-answers').addEventListener('click', () => { revealed = true; renderAll(); });

  $('copy-report').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(report()); text('report-status', 'Ответы скопированы. Отправь их преподавателю.'); }
    catch (_) { $('report-preview').focus(); $('report-preview').select(); text('report-status', 'Текст выделен. Скопируй его вручную и отправь преподавателю.'); }
  });
  $('download-report').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([report()], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'English Homework 4.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    text('report-status', 'Файл с ответами подготовлен. Отправь его преподавателю.');
  });

  function renderTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $('theme-toggle').setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    $('theme-toggle').innerHTML = dark ? '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 15.4A8.5 8.5 0 018.6 4 8.5 8.5 0 1020 15.4z"/></svg>';
  }
  $('theme-toggle').addEventListener('click', () => {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { window.localStorage.setItem(THEME_KEY, document.documentElement.dataset.theme); } catch (_) { }
    renderTheme();
  });
  renderTheme();
  renderScore();
  refresh();
})();
