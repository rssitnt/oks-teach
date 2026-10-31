(() => {
  'use strict';
  const KEY = 'oks.lesson2.progress.v1';
  const SCHEMA = 1;
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const data = window.LessonData;
  const task = $('#task');
  let storageMessage = '';
  if (!data || !Array.isArray(data.stages) || !data.stages.length) {
    task.innerHTML = '<h2>Приключение пока недоступно</h2><p>Не удалось загрузить материалы урока. Попробуйте обновить страницу. Ваш сохранённый прогресс не удалён.</p><a href="../index.html">К диагностике</a>';
    return;
  }
  const stages = data.stages;
  const all = stages.flatMap(stage => stage.steps.map(step => ({ stage, step })));
  const retiredPositions = Object.freeze({
    'hello-welcome': 'words-nine-cards', 'hello-feeling': 'words-nine-cards',
    'hello-hidden-pictures': 'words-nine-cards', 'hello-today': 'words-nine-cards',
    'words-ing-draw': 'words-extra-ing', 'words-ing-homework': 'words-extra-ing',
    'words-ing-climb': 'words-extra-ing',
    'adventure-tom-kind': 'adventure-tom-helping',
    'exit-three-responses': 'report'
  });
  const newState = () => ({ version: SCHEMA, contentVersion: data.version, route: 'full50', position: all[0].step.id, records: {}, notes: {}, history: [], view: 'lesson', startedAt: new Date().toISOString(), completedAt: null });
  const newRecord = () => ({ done: false, attempts: 0, firstAttempt: null, assisted: false, interrupted: false, status: '', draft: '', selected: '', tokens: [], tokenOrder: [], errorSelection: null, history: [], manual: null, itemIndex: 0, itemRecords: {}, queue: null, queueIndex: 0, flipped: false, cardPending: false, cardResult: '', revealed: [], calendarDay: '', exampleDraft: '', exampleAttempts: 0, exampleDone: false, exampleAssisted: false, exampleFeedback: '', oralMode: false, hero: 0, adjectives: [], animationIndex: 0, exit: {}, helpOpen: false });
  let state = newState();
  let baselineRaw = null;
  let storageBlocked = false;
  let transactionActive = false;
  let resetSnapshotRaw = null;
  let recovery = null;
  function blockStorage(reason, raw) {
    storageBlocked = true;
    recovery = recovery || { reason, originalRaw: baselineRaw };
    recovery.latestRaw = raw;
    warn(reason === 'corrupt'
      ? 'Часть сохранения не удалось прочитать. Доступные ответы восстановлены. Исходное сохранение не изменяется: скачайте JSON для восстановления. Новая работа остаётся только в этой вкладке до подтверждённого сброса.'
      : 'Сохранение изменилось в другой вкладке или недоступно. Эта вкладка больше его не заменяет. Новая работа остаётся здесь: скачайте JSON перед закрытием, затем обновите страницу.');
  }
  // The same origin-wide lock covers the latest-snapshot check and every mutation/write.
  // Unsupported lock APIs fail closed: local work and export remain available.
  function transact(change, reset = false) {
    const run = () => {
      transactionActive = true;
      try {
        let latest;
        try { latest = localStorage.getItem(KEY); }
        catch (_) { blockStorage('unavailable', null); }
        if (latest !== undefined && latest !== baselineRaw) blockStorage('conflict', latest);
        if (reset) {
          if (latest === undefined || latest !== resetSnapshotRaw || (recovery && recovery.reason !== 'corrupt')) {
            blockStorage('conflict', latest ?? null);
            dialog.close();
            return false;
          }
          storageBlocked = false;
          recovery = null;
        }
        return change();
      } finally { transactionActive = false; }
    };
    if (typeof navigator !== 'undefined' && navigator.locks?.request) {
      let entered = false;
      return navigator.locks.request(KEY, { mode: 'exclusive' }, () => { entered = true; return run(); }).catch(error => {
        if (entered) throw error;
        blockStorage('unavailable', baselineRaw);
        if (!reset) return change();
        dialog.close();
        return false;
      });
    }
    blockStorage('unavailable', baselineRaw);
    if (!reset) return Promise.resolve(change());
    dialog.close();
    return Promise.resolve(false);
  }
  function onMutation(element, type, change) {
    element.addEventListener(type, event => {
      // Capture input now, before a queued lock can outlive this DOM event.
      const inputValue = event.target.value;
      if (type === 'submit' || type === 'drop') event.preventDefault();
      void transact(() => change(event, inputValue));
    });
  }
  function warn(message) {
    storageMessage = message;
    $('#storage-warning').textContent = message;
    $('#storage-warning').hidden = !message;
  }
  function validRecord(rec) {
    if (!plainObject(rec)) return false;
    const defaults = newRecord();
    for (const [key, value] of Object.entries(rec)) {
      if (!(key in defaults)) continue;
      const def = defaults[key];
      if (Array.isArray(def) && !Array.isArray(value)) return false;
      if (def !== null && !Array.isArray(def) && typeof value !== typeof def) return false;
      if (typeof def === 'number' && (!Number.isInteger(value) || value < 0)) return false;
    }
    if (rec.queue !== undefined && rec.queue !== null && (!Array.isArray(rec.queue) || rec.queue.some(x => typeof x !== 'string'))) return false;
    if (rec.tokens && rec.tokens.some(x => !Number.isInteger(x) || x < 0)) return false;
    if (rec.tokenOrder && rec.tokenOrder.some(x => !Number.isInteger(x) || x < 0)) return false;
    if (rec.revealed && rec.revealed.some(x => !Number.isInteger(x) || x < 0)) return false;
    if (rec.adjectives && rec.adjectives.some(x => typeof x !== 'string')) return false;
    if (rec.errorSelection !== undefined && rec.errorSelection !== null && typeof rec.errorSelection !== 'string') return false;
    if (rec.firstAttempt !== undefined && rec.firstAttempt !== null && !plainObject(rec.firstAttempt)) return false;
    if (rec.manual !== undefined && rec.manual !== null && !['independent', 'assisted', 'notyet', 'skipped'].includes(rec.manual)) return false;
    for (const values of [rec.itemRecords, rec.exit]) {
      if (values !== undefined && (!plainObject(values) || Object.values(values).some(x =>
        !plainObject(x) ||
        (x.history !== undefined && !Array.isArray(x.history)) ||
        (x.draft !== undefined && typeof x.draft !== 'string') ||
        (x.exampleDraft !== undefined && typeof x.exampleDraft !== 'string') ||
        (x.status !== undefined && typeof x.status !== 'string') ||
        (x.correct !== undefined && typeof x.correct !== 'boolean') ||
        (x.attempts !== undefined && (!Number.isInteger(x.attempts) || x.attempts < 0)) ||
        (x.firstAttempt !== undefined && x.firstAttempt !== null && !plainObject(x.firstAttempt))
      ))) return false;
    }
    return true;
  }
  try {
    const raw = localStorage.getItem(KEY);
    baselineRaw = raw;
    if (raw) {
      const saved = JSON.parse(raw);
      if (!plainObject(saved) || saved.version !== SCHEMA || saved.contentVersion !== data.version || !plainObject(saved.records) || !plainObject(saved.notes) || !Array.isArray(saved.history) || !['full50', 'short45'].includes(saved.route) || (!all.some(x => x.step.id === saved.position) && !Object.hasOwn(retiredPositions, saved.position)) || Object.values(saved.notes).some(x => typeof x !== 'string')) throw new Error('Malformed lesson state');
      state = { ...newState(), ...saved, records: {} };
      if (Object.hasOwn(retiredPositions, saved.position)) {
        if (retiredPositions[saved.position] === 'report') {
          state.position = all.filter(x => saved.route !== 'short45' || !x.step.optionalMinutes).at(-1).step.id;
          state.view = 'report';
        } else {
          const destination = all.findIndex(x => x.step.id === retiredPositions[saved.position]);
          state.position = all.slice(destination).find(x => saved.route !== 'short45' || !x.step.optionalMinutes).step.id;
          state.view = 'lesson';
        }
      }
      // Keep retired assessments unchanged for export; only current tasks count.
      for (const id of Object.keys(retiredPositions)) {
        if (Object.hasOwn(saved.records, id)) {
          if (validRecord(saved.records[id])) state.records[id] = saved.records[id];
          else blockStorage('corrupt', raw);
        }
      }
      for (const { step } of all) {
        if (!saved.records[step.id]) continue;
        try {
          if (!validRecord(saved.records[step.id])) throw new Error('Malformed lesson record');
          const rec = { ...newRecord(), ...saved.records[step.id] };
          // Clone nested maps; validating one record must never mutate the raw saved snapshot.
          rec.itemRecords = JSON.parse(JSON.stringify(rec.itemRecords));
          rec.exit = JSON.parse(JSON.stringify(rec.exit));
          // Retire only the ambiguous picture card, preserving all earlier assessments.
          if (step.id === 'words-nine-cards' && Array.isArray(rec.queue) && rec.queue.includes('word-now')) {
            if (rec.queueIndex > rec.queue.length) throw new Error('Invalid recall queue position');
            const removedCurrent = rec.queue[rec.queueIndex] === 'word-now';
            const position = rec.queue.slice(0, rec.queueIndex).filter(id => id !== 'word-now').length;
            rec.queue = rec.queue.filter(id => id !== 'word-now');
            rec.queueIndex = position;
            if (removedCurrent) { rec.flipped = false; rec.cardPending = false; rec.cardResult = ''; rec.manual = null; }
            rec.done = rec.queueIndex >= rec.queue.length;
          }
          if (step.items && rec.itemIndex > step.items.length) throw new Error('Invalid item position');
          if (step.heroes && rec.hero >= step.heroes.length) throw new Error('Invalid hero');
          if (step.words && (rec.tokens.some(id => id >= step.words.length) || (rec.tokenOrder.length && (rec.tokenOrder.length !== step.words.length || new Set(rec.tokenOrder).size !== step.words.length || rec.tokenOrder.some(id => id >= step.words.length))))) throw new Error('Invalid token order');
          if (rec.queue && (step.type !== 'flashcards' || rec.queueIndex > rec.queue.length || rec.queue.some(id => !step.items.some(item => item.id === id)))) throw new Error('Invalid recall queue');
          if (step.items && rec.revealed.some(id => id >= step.items.length)) throw new Error('Invalid reveal');
          for (const values of [rec.itemRecords, rec.exit]) {
            for (const [id, item] of Object.entries(values)) values[id] = { history: [], attempts: 0, firstAttempt: null, status: '', draft: '', ...item };
          }
          state.records[step.id] = rec;
        } catch (_) { blockStorage('corrupt', raw); }
      }
      if (Object.values(saved.records).some(rec => !validRecord(rec))) blockStorage('corrupt', raw);
      if (!['lesson', 'report'].includes(state.view)) state.view = 'lesson';
    }
  } catch (_) {
    state = newState();
    blockStorage('corrupt', baselineRaw);
  }
  function save() {
    if (!transactionActive || storageBlocked) return;
    try {
      const raw = JSON.stringify(state);
      localStorage.setItem(KEY, raw);
      baselineRaw = raw;
    } catch (_) { blockStorage('unavailable', baselineRaw); }
  }
  function record(step) { return state.records[step.id] || (state.records[step.id] = newRecord()); }
  function path() { return all.filter(({ step }) => state.route !== 'short45' || !step.optionalMinutes); }
  function current() { return path().find(x => x.step.id === state.position) || path()[0]; }
  function log(rec, entry) {
    const item = { at: new Date().toISOString(), ...entry };
    rec.history.push(item);
    state.history.push({ stepId: current().step.id, ...item });
  }
  function normal(value) {
    return String(value).toLowerCase().replace(/[’‘`]/g, "'")
      .replace(/\b(i'm)\b/g, 'i am').replace(/\b(he|she|it|that|what|who)'s\b/g, '$1 is')
      .replace(/\b(you|we|they)'re\b/g, '$1 are').replace(/\bisn't\b/g, 'is not')
      .replace(/\baren't\b/g, 'are not').replace(/[.!?,;:]+(?=\s|$)/g, '').replace(/\s+/g, ' ').trim();
  }
  function commandKey(value) {
    return String(value ?? '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'")
      .replace(/\s+/g, ' ').trim().replace(/[.!?;:,]+$/, '').trim();
  }
  function contextTranslation(value) {
    return value ? `<p class="context-translation" lang="ru">${esc(value)}</p>` : '';
  }
  function pupilPrompt(value, prefix = '', translation = '') {
    if (!value || commandKey(value) === commandKey(current().step.title)) return '';
    return `<p class="prompt" lang="en">${esc(prefix + value)}</p>${contextTranslation(translation)}`;
  }
  function matches(value, answers, optionalNow = true) {
    const raw = String(value).replace(/[’‘`]/g, "'").trim();
    // A positive short answer keeps the full auxiliary: Yes, he is, not Yes, he's.
    // Contractions remain valid in full statements such as He's watching TV.
    if (/^yes[\s.!?,;:]+(?:i'm|(?:he|she|it)'s|(?:you|we|they)'re)\s*[.!?,;:]*\s*$/i.test(raw)) return false;
    if (/[a-z][.!?,;:]+[a-z]/i.test(raw)) return false;
    const given = normal(value);
    return (answers || []).some(answer => {
      const expected = normal(answer);
      if (given === expected) return true;
      return optionalNow && /\b(am|is|are) \w+ing\b/.test(expected) && given.replace(/ now$/, '') === expected.replace(/ now$/, '');
    });
  }
  function scene(key, label) {
    if (!key) return '';
    try {
      if (typeof window.LessonArt === 'function') return `<div class="scene">${window.LessonArt(key, { context: current().step.id, ...(label ? { label } : {}) })}</div>`;
    } catch (_) { /* Keep the text task usable even if illustration delivery fails. */ }
    return '<div class="scene scene-placeholder" role="img" aria-label="Иллюстрация недоступна">Иллюстрация не загрузилась. Попробуйте обновить страницу.</div>';
  }
  const button = (text, action, attrs = '', cls = '') => `<button type="button" data-action="${action}" ${attrs} class="${cls}">${text}</button>`;
  const body = html => html ? `<div class="body-copy">${html}</div>` : '';
  function grade(rec, correct, response, extra = {}) {
    rec.attempts += 1;
    if (rec.firstAttempt === null) rec.firstAttempt = { response, correct, independent: correct && !rec.assisted, assisted: rec.assisted, at: new Date().toISOString() };
    log(rec, { kind: 'attempt', response, correct, attempt: rec.attempts, assisted: rec.assisted, ...extra });
    rec.status = correct ? 'correct' : rec.attempts < 2 ? 'retry' : 'reveal';
    if (correct) rec.done = true;
    if (!correct && rec.attempts >= 2 && !current().step.example) rec.done = true;
  }
  function revealAnswer(step) {
    if (step.type === 'build' || step.type === 'order') return step.words.join(' ');
    if (step.type === 'mistake') {
      const replacement = step.corrections.find(word => matches(word, [step.answer], false));
      if (!replacement) return step.answer;
      const words = step.words.slice();
      if (step.errorIndex === -1) words.splice(1, 0, replacement);
      else words[step.errorIndex] = replacement;
      return words.join(' ');
    }
    if (step.type === 'hotspot') return 'You found the rabbit!';
    return (step.answers || []).join(' / ');
  }
  function feedback(step, rec, answer) {
    if (!rec.status) return '';
    if (rec.status === 'correct') return `<section class="feedback correct" role="status" tabindex="-1" data-feedback><h3>${step.type === 'hotspot' ? 'You found the rabbit!' : 'Верно'}</h3>${answer ? `<p>${esc(answer)}</p>` : ''}</section>`;
    if (rec.status === 'retry') return '<section class="feedback" role="status" tabindex="-1" data-feedback>Попробуй ещё раз.</section>';
    return `<section class="feedback reveal" role="status" tabindex="-1" data-feedback><p class="answer-reveal" lang="en">${esc(answer || revealAnswer(step))}</p>${step.explanation ? `<p>${step.explanation}</p>` : ''}${exampleUI(step, rec)}</section>`;
  }
  function exampleUI(step, rec) {
    const ex = step.example;
    if (!ex) return '';
    return `<div class="remediation"><h3>Твой новый пример</h3>${scene(ex.scene)}<p class="prompt" lang="en">${esc(ex.prompt)}</p>${contextTranslation(ex.contextTranslation)}
      <form data-form="example"><label for="example-answer">Ответ на английском</label><input id="example-answer" type="text" data-draft="example" autocomplete="off" spellcheck="false" value="${esc(rec.exampleDraft)}" ${rec.exampleDone ? 'readonly' : ''}><div class="button-row">${button('Проверить пример', 'example-check', rec.exampleDone ? 'disabled' : '', 'primary')}</div></form>
      ${exampleResultUI(rec)}
      ${exampleSupportUI(ex, rec, 'example-assisted', step.explanation)}
    </div>`;
  }
  function exampleResultUI(rec) {
    if (!rec.exampleFeedback) return '';
    return `<p role="status">${rec.exampleDone ? rec.exampleAssisted ? 'С помощью' : 'Верно' : 'Попробуй ещё раз.'}</p>`;
  }
  function exampleSupportUI(ex, rec, action, explanation) {
    if (rec.exampleDone || (rec.exampleAttempts || 0) < 2) return '';
    return `<div class="example-support" data-example-reveal>
      <h3>Повторим с преподавателем</h3>
      <p class="answer-reveal" lang="en">${esc(ex.answers[0])}</p>
      ${ex.explanation || explanation ? `<p>${ex.explanation || explanation}</p>` : ''}
      ${button('Повторили с учителем', action, '', 'primary')}
    </div>`;
  }
  function helpUI(rec) {
    if (!rec.helpOpen) return '';
    return '<section class="help-panel"><h3>Present Continuous</h3><p>Когда действие происходит сейчас: кто + am / is / are + действие с -ing.</p><div class="grammar-scheme"><div>I<strong>am</strong></div><div>he · she · it<strong>is</strong></div><div>you · we · they<strong>are</strong></div></div><p lang="en">I am reading a book now.<br>I am not reading a book.<br>Are you reading a book? — Yes, I am. / No, I\'m not.</p></section>';
  }
  function isLocked(rec) { return rec.status === 'correct' || rec.status === 'reveal'; }
  // Feedback comes only from a real checked response, not from the answer key or brand selection.
  function latestResult(rec, kind = 'attempt') {
    const history = rec.history || [];
    for (let i = history.length - 1; i >= 0; i--) {
      const entry = history[i];
      if (plainObject(entry) && typeof entry.correct === 'boolean' &&
          (entry.kind === kind || (kind === 'associate' && !entry.kind))) return entry;
    }
    return null;
  }
  function answerResult(entry, label, chosen = true) {
    if (!entry || !chosen) return { attrs: '', cls: '' };
    const result = entry.correct ? 'correct' : 'incorrect';
    const cue = entry.correct ? 'Верно' : 'Неверно';
    return { attrs: `data-answer-result="${result}" aria-label="${esc(label)} — ${cue}"`, cls: `answer-${result}` };
  }
  function clearAnswerResult(target) {
    if (!target.hasAttribute('data-answer-result')) return;
    target.classList.remove('answer-correct', 'answer-incorrect');
    target.removeAttribute('data-answer-result');
    target.removeAttribute('aria-label');
  }
  function choiceUI(step, rec) {
    const picture = step.type === 'pictureChoice';
    const latest = latestResult(rec);
    return `<div class="${picture ? 'picture-options' : 'options'}">${step.options.map((option, index) => {
      const text = typeof option === 'string' ? option : option.text;
      const chosen = latest && (Number.isInteger(latest.selectionIndex) ? latest.selectionIndex === index : latest.response === text);
      const result = answerResult(latest, text, chosen);
      return button(`${picture ? scene(option.scene) : ''}<span class="option-text" lang="en">${esc(text)}</span>`, 'choice', `data-index="${index}" aria-pressed="${!!chosen}" ${result.attrs} ${isLocked(rec) ? 'disabled' : ''}`, `${picture ? 'picture-choice' : ''} ${chosen ? 'selected' : ''} ${result.cls}`);
    }).join('')}</div>${feedback(step, rec)}`;
  }
  function inputUI(step, rec) {
    if (rec.oralMode) return button('Вернуться к письменному ответу', 'written-mode');
    const latest = latestResult(rec);
    const result = answerResult(latest, 'Твой ответ на английском', latest?.response === rec.draft);
    return `<form class="answer-form" data-form="answer">
      <label for="answer-input">Твой ответ на английском</label>
      <input id="answer-input" class="${result.cls}" ${result.attrs} type="text" data-draft="answer" value="${esc(rec.draft)}" autocomplete="off" spellcheck="false" ${isLocked(rec) ? 'readonly' : ''}>
      <div class="button-row">${button('Проверить', 'input-check', isLocked(rec) ? 'disabled' : '', 'primary')}${step.oralAllowed ? button('Ответить устно', 'oral-mode', rec.status === 'correct' ? 'disabled' : '') : ''}</div>
    </form>${feedback(step, rec)}`;
  }
  function shuffled(length) {
    const ids = Array.from({ length }, (_, i) => i);
    for (let i = length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    if (length > 1 && ids.every((id, i) => id === i)) ids.push(ids.shift());
    return ids;
  }
  function tokenUI(step, rec) {
    if (!rec.tokenOrder.length) rec.tokenOrder = shuffled(step.words.length);
    rec.tokens = rec.tokens.filter((id, i, list) => id < step.words.length && list.indexOf(id) === i);
    const locked = isLocked(rec);
    const latest = latestResult(rec);
    const result = answerResult(latest, 'Собранный ответ', latest?.response === rec.tokens.map(id => step.words[id]).join(' '));
    const bank = rec.tokenOrder.filter(id => !rec.tokens.includes(id)).map(id => button(esc(step.words[id]), 'token-add', `data-token="${id}" draggable="${!locked}" ${locked ? 'disabled' : ''}`, 'token')).join('');
    const answer = rec.tokens.map((id, index) => `<div class="token-unit" data-token-position="${index}" data-token="${id}">
      ${button(esc(step.words[id]), 'token-remove', `data-token="${id}" draggable="${!locked}" aria-label="Убрать ${esc(step.words[id])}" ${locked ? 'disabled' : ''}`, 'token')}
      <div class="reorder-controls">
        ${button('←', 'token-left', `data-token="${id}" aria-label="${esc(step.words[id])}: передвинуть влево" ${locked || !index ? 'disabled' : ''}`)}
        ${button('→', 'token-right', `data-token="${id}" aria-label="${esc(step.words[id])}: передвинуть вправо" ${locked || index === rec.tokens.length - 1 ? 'disabled' : ''}`)}
      </div>
    </div>`).join('');
    return `<div class="token-bank" data-drop="bank" aria-label="Слова для ответа">${bank}</div>
      <div class="token-output ${result.cls}" role="group" data-drop="answer" ${result.attrs || 'aria-label="Собранный ответ"'}>${answer}</div>
      <div class="button-row">${button('Проверить', 'token-check', locked || rec.tokens.length !== step.words.length ? 'disabled' : '', 'primary')}${button('Убрать все слова', 'token-clear', locked || !rec.tokens.length ? 'disabled' : '')}</div>${feedback(step, rec)}`;
  }
  function mistakeUI(step, rec) {
    const locked = isLocked(rec);
    const sentence = step.words.map((word, index) => `${button('＋', 'error-select', `data-selection="gap:${index}" aria-label="Промежуток перед ${esc(word)}" aria-pressed="${rec.errorSelection === `gap:${index}`}" ${locked ? 'disabled' : ''}`, 'gap')}${button(esc(word), 'error-select', `data-selection="word:${index}" aria-pressed="${rec.errorSelection === `word:${index}`}" ${locked ? 'disabled' : ''}`)}`).join('') + button('＋', 'error-select', `data-selection="gap:${step.words.length}" aria-label="Промежуток в конце" aria-pressed="${rec.errorSelection === `gap:${step.words.length}`}" ${locked ? 'disabled' : ''}`, 'gap');
    const latest = latestResult(rec);
    const corrections = step.corrections.map((word, index) => {
      const chosen = latest?.selection === rec.errorSelection && latest?.correction === word;
      const result = answerResult(latest, word, chosen);
      return button(esc(word), 'error-correct', `data-index="${index}" aria-pressed="${!!chosen}" ${result.attrs} ${locked ? 'disabled' : ''}`, result.cls);
    }).join('');
    return `<div class="error-sentence" lang="en" aria-label="Найди ошибку или пропущенное слово">${sentence}</div>${rec.errorSelection !== null ? `<div class="options">${corrections}</div>` : ''}${feedback(step, rec)}`;
  }
  function cardsUI(step, rec) {
    const isFlash = step.type === 'flashcards';
    if (isFlash && !rec.queue) rec.queue = step.items.map(item => item.id);
    const completed = rec.done;
    const length = isFlash ? rec.queue.length : step.items.length;
    const index = Math.min(isFlash ? rec.queueIndex : rec.itemIndex, length - 1);
    const item = isFlash ? step.items.find(x => x.id === rec.queue[index]) : step.items[index];
    if (!item) { rec.queue = step.items.map(x => x.id); rec.queueIndex = 0; return cardsUI(step, rec); }
    const response = completed ? '' : rec.cardPending
      ? `<div class="button-row">${button(index + 1 >= length && rec.cardResult !== 'practise' ? 'Дальше →' : 'Следующая карточка →', 'card-next', '', 'primary')}</div>`
      : rec.flipped
        ? isFlash
          ? `<div class="button-row">${button('Вспомнил', 'card-recall', '', 'primary')}${button('Ещё потренироваться', 'card-practise')}</div>`
          : ''
        : '';
    return `<p class="card-count">${isFlash && index >= step.items.length ? 'ПОВТОРЕНИЕ · ' : ''}Карточка ${index + 1} / ${length}</p>${pupilPrompt(isFlash ? 'Can you remember this word?' : "What's this?")}${scene(item.scene, 'Карточка: назови то, что видишь')}<div class="flip-area">${completed || rec.flipped ? `<p class="card-label" lang="en">${esc(item.word)}<small lang="ru">${esc(item.translation)}</small></p>` : button('Открыть слово', 'card-flip')}</div>${response}`;
  }
  function associateUI(step, rec) {
    const item = step.items[Math.min(rec.itemIndex, step.items.length - 1)];
    const ir = rec.itemRecords[item.pronoun] || {};
    let response = '';
    if (ir.status === 'correct') response = `<div class="feedback correct" role="status" tabindex="-1" data-feedback><p lang="en">${esc(item.example)}</p>${rec.done ? '' : button('Следующее местоимение →', 'associate-next', '', 'primary')}</div>`;
    else if (ir.status === 'retry') response = '<div class="feedback" role="status" tabindex="-1" data-feedback>Попробуй ещё раз.</div>';
    else if (ir.status === 'reveal') {
      const ex = step.example || { prompt: 'Complete: The rabbit ___ climbing.', answers: ['is'] };
      response = `<div class="feedback reveal" role="status" tabindex="-1" data-feedback>
        <p lang="en">${esc(item.pronoun)} ${esc(item.answer)}. ${esc(item.example)}</p><p>I → am; he / she / it → is; you / we / they → are.</p>
        <div class="remediation"><h3>Отдельный похожий пример</h3>${scene(ex.scene)}<p class="prompt" lang="en">${esc(ex.prompt)}</p>${contextTranslation(ex.contextTranslation)}
          <form data-form="associate-example"><label for="associate-example">Твой ответ</label><input id="associate-example" type="text" data-draft="associate-example" value="${esc(ir.exampleDraft || '')}" autocomplete="off" spellcheck="false" ${ir.exampleDone ? 'readonly' : ''}><div class="button-row">${button('Проверить пример', 'associate-example-check', ir.exampleDone ? 'disabled' : '', 'primary')}</div></form>
          ${exampleResultUI(ir)}
          ${exampleSupportUI(ex, ir, 'associate-example-assisted', step.explanation)}
          ${ir.exampleDone && !rec.done ? button('Следующее местоимение →', 'associate-next', '', 'primary') : ''}
        </div>
      </div>`;
    }
    const latest = latestResult(ir, 'associate');
    const options = step.options.map(option => {
      const chosen = latest?.response === option;
      const result = answerResult(latest, option, chosen);
      return button(esc(option), 'associate', `data-value="${esc(option)}" aria-pressed="${!!chosen}" ${result.attrs} ${ir.status === 'correct' || ir.status === 'reveal' ? 'disabled' : ''}`, result.cls);
    }).join('');
    return `<div class="pronoun-progress">${step.items.map((x, i) => `<span class="${i < rec.itemIndex ? 'checked' : ''}">${esc(x.pronoun)}</span>`).join('')}</div>${pupilPrompt(`${item.pronoun} …`)}<div class="options">${options}</div>${response}`;
  }
  function revealListUI(step, rec) {
    if (step.type === 'morph') return `<div class="interactive-list">${step.items.map((item, index) => button(`${esc(item.base)}${rec.revealed.includes(index) ? `<strong> → ${esc(item.ing)}</strong>` : ''}`, 'reveal-item', `data-index="${index}" aria-pressed="${rec.revealed.includes(index)}"`)).join('')}</div>`;
    if (step.type === 'calendar') {
      const chosen = step.items.find(item => item.word === rec.calendarDay);
      return `<label class="speech-setting"><input type="checkbox" id="speech-enabled"> Озвучивать</label>
        <section id="calendar-detail" class="calendar-detail selected-day" data-selected-day="${esc(chosen?.word || '')}" aria-live="polite" aria-label="Выбранный день">
          ${chosen ? `<h3 id="calendar-spelling" lang="en">${esc(chosen.word)}</h3><p id="calendar-translation">${esc(chosen.translation)}</p><p id="calendar-pronunciation">${esc(chosen.pronunciation)}</p>` : ''}
        </section>
        <div class="calendar-list">${step.items.map((item, index) => button(`<span lang="en">${esc(item.word)}</span><small>${esc(item.translation)}${rec.revealed.includes(index) ? ' · повторили' : ''}</small>`, 'calendar-word', `data-index="${index}" aria-pressed="${rec.calendarDay === item.word}"`)).join('')}</div>`;
    }
    if (step.type === 'activityPairs') return `<div class="interactive-list">${step.items.map((item, index) => button(`<small>${esc(item.day)}</small><span lang="en">${esc(item.base)}</span>${rec.revealed.includes(index) ? `<strong lang="en"> → ${esc(item.ing)}</strong>${scene(item.scene)}` : ''}`, 'reveal-item', `data-index="${index}" aria-pressed="${rec.revealed.includes(index)}"`)).join('')}</div>`;
    return '';
  }
  function charactersUI(step, rec) {
    const item = step.items[rec.itemIndex] || step.items[0];
    const revealed = rec.revealed.includes(rec.itemIndex);
    return `<div class="hero-options">${step.items.map((x, index) => button(esc(x.name), 'character-select', `data-index="${index}" aria-pressed="${index === rec.itemIndex}"`)).join('')}</div>${scene(item.scene)}<p class="character-story" lang="en">${esc(item.story)}</p>${contextTranslation(item.contextTranslation)}${revealed ? `<p class="card-label" lang="en">${esc(item.word)}<small lang="ru">${esc(item.translation)}</small></p>` : button('Открыть слово', 'character-reveal', '', 'primary')}<p class="card-count">Открыто ${rec.revealed.length} / ${step.items.length}</p>`;
  }
  function description(step, rec) {
    const hero = step.heroes[rec.hero] || step.heroes[0];
    const subject = normal(hero.subject);
    const start = /^(she|she is)$/.test(subject) ? "She's" : /^(he|he is)$/.test(subject) ? "He's" : /^(they|they are)$/.test(subject) ? "They're" : `${hero.subject}${/\b(is|are|am)$/.test(subject) ? '' : ' is'}`;
    return rec.adjectives.length ? `${start} ${rec.adjectives.join(' and ')}.` : '';
  }
  function describeUI(step, rec) {
    const hero = step.heroes[rec.hero] || step.heroes[0];
    return `<div class="hero-options">${step.heroes.map((x, index) => button(esc(x.name), 'hero-select', `data-index="${index}" aria-pressed="${index === rec.hero}"`)).join('')}</div>${scene(hero.scene)}<div class="options">${step.adjectives.map((word, index) => button(esc(word), 'adjective', `data-index="${index}" aria-pressed="${rec.adjectives.includes(word)}"`)).join('')}</div>${rec.adjectives.length ? `<div class="description" lang="en">${esc(description(step, rec))}</div>` : ''}`;
  }
  function exitUI(step, rec) {
    const submitted = step.items.every(item => rec.exit[item.id]?.attempts > 0);
    const passed = step.items.every(item => rec.exit[item.id]?.correct);
    return `${rec.interrupted ? '<p class="feedback" role="status">Билет прерван. Продолжаем с опорой.</p>' : ''}
      <form data-form="exit">${step.items.map((item, index) => {
        const ir = rec.exit[item.id] || {};
        const result = ir.correct ? 'Верно' : 'Попробуй ещё раз.';
        return `<section class="exit-item">${scene(item.scene, 'Иллюстрация для ответа')}
          ${pupilPrompt(item.prompt, `${index + 1}. `)}
          <label for="exit-${esc(item.id)}">Ответ ${index + 1} на английском</label>
          <input id="exit-${esc(item.id)}" type="text" data-exit-id="${esc(item.id)}" autocomplete="off" spellcheck="false" value="${esc(ir.draft || '')}" ${ir.correct || rec.done ? 'readonly' : ''}>
          ${submitted ? `<div class="exit-result ${ir.correct ? 'correct' : ''}" role="status">${result}</div>` : ''}
        </section>`;
      }).join('')}
      <div class="button-row">${button(submitted ? 'Проверить новые ответы' : 'Проверить все', 'exit-check', passed || rec.done ? 'disabled' : '', 'primary')}${submitted ? button('Завершить урок →', 'exit-finish', '', passed ? 'primary' : '') : ''}</div>
      </form>`;
  }
  function exerciseUI(step, rec) {
    switch (step.type) {
      case 'oralCards': case 'flashcards': return cardsUI(step, rec);
      case 'hotspot': return `${pupilPrompt(step.prompt)}${scene(step.scene || 'room', 'Комната: найди предмет на картинке')}${feedback(step, rec)}`;
      case 'pictureChoice': case 'choice': return choiceUI(step, rec);
      case 'input': return inputUI(step, rec);
      case 'build': case 'order': return tokenUI(step, rec);
      case 'mistake': return mistakeUI(step, rec);
      case 'teach': return `${step.scenes ? `<div class="scene-grid">${step.scenes.map(key => scene(key)).join('')}</div>` : ''}${step.animation?.length ? `<div class="animation-line" lang="en">${esc(step.animation[Math.min(rec.animationIndex, step.animation.length - 1)])}</div>${button('Добавить часть предложения →', 'animation-next', rec.animationIndex >= step.animation.length - 1 ? 'disabled' : '')}` : ''}`;
      case 'associate': return associateUI(step, rec);
      case 'morph': case 'calendar': case 'activityPairs': return revealListUI(step, rec);
      case 'characters': return charactersUI(step, rec);
      case 'describe': return describeUI(step, rec);
      case 'oral': return '';
      case 'exit': return exitUI(step, rec);
      default: return '<p role="alert">Этот тип задания не распознан. Обратитесь к преподавателю.</p>';
    }
  }
  function canNext(step, rec) {
    if (step.type === 'oral' || (step.type === 'input' && rec.oralMode)) return true;
    if (step.type === 'describe') return rec.done || rec.adjectives.length > 0;
    if (step.type === 'teach') return !step.animation || rec.animationIndex >= step.animation.length - 1;
    return rec.done;
  }
  function manualLabel(value) { return ({ independent: 'самостоятельно', assisted: 'с помощью', notyet: 'пока не получилось', skipped: 'ответ пропущен' })[value] || 'не оценено'; }
  function renderNav() {
    const active = path();
    const completed = active.filter(x => record(x.step).done).length;
    $('#route').value = state.route;
    $('#mobile-progress').textContent = `${completed} / ${active.length}`;
    $('#stage-nav').innerHTML = stages.map((stage, index) => {
      const steps = active.filter(x => x.stage.id === stage.id);
      const done = steps.filter(x => record(x.step).done).length;
      const minutes = stage.minutes - (state.route === 'short45' ? stage.steps.reduce((sum, step) => sum + (step.optionalMinutes || 0), 0) : 0);
      return `<button type="button" class="stage-link ${current().stage.id === stage.id && state.view === 'lesson' ? 'current' : ''} ${done === steps.length ? 'complete' : ''}" data-action="stage" data-stage="${esc(stage.id)}" ${current().stage.id === stage.id && state.view === 'lesson' ? 'aria-current="step"' : ''}><span class="stage-number">${done === steps.length ? '✓' : index + 1}</span><span class="stage-label">${esc(stage.title)}<small>≈ ${minutes} мин · ${done} / ${steps.length}</small></span></button>`;
    }).join('');
  }
  function render(focus = false, focusSelector = '') {
    renderTheme();
    renderNav();
    $('#show-report').disabled = false;
    $('#show-report').removeAttribute('title');
    if (state.view === 'report') { renderReport(); if (focus) task.focus(); save(); return; }
    const { stage, step } = current();
    const rec = record(step);
    const active = path();
    const stageSteps = active.filter(x => x.stage.id === stage.id);
    const stageIndex = stageSteps.findIndex(x => x.step.id === step.id);
    const stepIndex = active.findIndex(x => x.step.id === step.id);
    $('#stage-heading').innerHTML = `<p><strong>${esc(stage.title)}</strong><br>Этап ${stages.indexOf(stage) + 1} из ${stages.length}</p><div>Шаг ${stageIndex + 1} / ${stageSteps.length}<div class="progress-bar" aria-hidden="true"><span style="width:${((stageIndex + 1) / stageSteps.length) * 100}%"></span></div></div>`;
    task.dataset.stepId = step.id;
    task.dataset.type = step.type;
    const genericScene = !['hotspot', 'oralCards', 'flashcards', 'exit', 'characters', 'describe', 'pictureChoice'].includes(step.type) ? scene(step.scene) : '';
    const commonPrompt = step.prompt && ['choice', 'pictureChoice', 'input', 'build', 'order', 'oral'].includes(step.type) ? pupilPrompt(step.prompt, '', step.contextTranslation) : '';
    task.innerHTML = `<h2 lang="en">${esc(step.title)}</h2>
      ${step.type !== 'exit' && step.reminder ? `<div class="reminder">${step.reminder}</div>` : ''}
      ${!['exit', 'characters', 'describe'].includes(step.type) ? body(step.body) : ''}${commonPrompt}${genericScene}${exerciseUI(step, rec)}
      ${step.type !== 'exit' ? helpUI(rec) : ''}
      <footer class="task-footer">
        <div class="secondary-actions">${button('← Назад', 'previous', stepIndex === 0 ? 'disabled' : '', 'quiet')}${step.type !== 'exit' ? button(rec.helpOpen ? 'Закрыть помощь' : 'Мне нужна помощь', 'help', '', 'quiet') : ''}</div>
        ${step.type !== 'exit' ? button(stepIndex === active.length - 1 ? 'К отчёту →' : 'Дальше →', 'next', !canNext(step, rec) ? 'disabled' : '', 'primary next') : ''}
      </footer>`;
    $('#teacher-area').innerHTML = '';
    $('#show-report').disabled = step.type === 'exit' && !rec.done;
    if (step.type === 'exit' && !rec.done) $('#show-report').title = 'Отчёт откроется после завершения самостоятельного билета.';
    if (step.type === 'hotspot') {
      const latest = latestResult(rec);
      task.querySelectorAll('[data-hotspot]').forEach((target, index) => {
        const locked = isLocked(rec);
        const label = `Выбрать предмет ${index + 1} на картинке`;
        const result = answerResult(latest, label, latest?.response === target.dataset.hotspot);
        target.setAttribute('tabindex', locked ? '-1' : '0');
        if (target.tagName === 'BUTTON') {
          target.type = 'button';
          target.disabled = locked;
        } else target.setAttribute('role', 'button');
        // Object names would give away the rabbit before the learner has chosen it.
        target.setAttribute('aria-label', result.cls ? `${label} — ${latest.correct ? 'Верно' : 'Неверно'}` : label);
        target.setAttribute('aria-disabled', String(locked));
        if (result.cls) {
          target.classList.add(result.cls);
          target.dataset.answerResult = latest.correct ? 'correct' : 'incorrect';
        }
        if (target.dataset.hotspot === step.answer && locked) target.classList.add('hotspot-revealed');
      });
    }
    save();
    if (focusSelector) { const target = $(focusSelector, task); if (target) target.focus(); else if (focus) task.focus(); }
    else if (focus) task.focus();
  }
  function goTo(stageId, stepId) {
    const active = path();
    let destination = stepId ? active.find(x => x.step.id === stepId && (!stageId || x.stage.id === stageId)) : active.find(x => x.stage.id === stageId && !record(x.step).done) || active.find(x => x.stage.id === stageId);
    if (!destination) return false;
    const source = current().step;
    const ticket = record(source);
    if (state.view === 'lesson' && source.type === 'exit' && !ticket.done && destination.step.type !== 'exit') {
      ticket.assisted = true;
      ticket.interrupted = true;
      log(ticket, { kind: 'exit-departure', destination: destination.step.id, assisted: true });
    }
    state.position = destination.step.id;
    state.view = 'lesson';
    if (matchMedia('(max-width: 760px)').matches) $('#stage-menu').open = false;
    render(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return true;
  }
  function next() {
    const { step } = current();
    const rec = record(step);
    if (!canNext(step, rec)) return;
    if (!rec.done && (step.type === 'oral' || step.type === 'describe' || (step.type === 'input' && rec.oralMode))) {
      rec.done = true;
      log(rec, step.type === 'describe' ? { kind: 'description-continue', response: description(step, rec) } : { kind: 'oral-continue' });
    }
    if (step.type === 'teach') { rec.done = true; log(rec, { kind: 'read' }); }
    const active = path();
    const index = active.findIndex(x => x.step.id === step.id);
    if (index < active.length - 1) goTo(active[index + 1].stage.id, active[index + 1].step.id);
    else showReport();
  }
  function checkExample(step, rec) {
    if (!step.example || rec.exampleDone || !rec.exampleDraft.trim()) return;
    const correct = matches(rec.exampleDraft, step.example.answers);
    rec.exampleAttempts += 1;
    log(rec, { kind: 'remedial', response: rec.exampleDraft, correct, attempt: rec.exampleAttempts });
    rec.exampleDone = correct;
    rec.done = correct;
    rec.exampleFeedback = correct ? 'Верно' : 'Попробуй ещё раз.';
    render(false, '[data-feedback]');
  }
  function checkExit(step, rec) {
    if (rec.done) return;
    if (!step.items.every(item => (rec.exit[item.id]?.draft || '').trim())) {
      let notice = $('[data-exit-notice]', task);
      if (!notice) { notice = document.createElement('p'); notice.dataset.exitNotice = ''; notice.setAttribute('role', 'status'); $('form', task).append(notice); }
      notice.textContent = 'Заполни все три ответа.';
      return;
    }
    for (const item of step.items) {
      const ir = rec.exit[item.id] || { draft: '', attempts: 0, history: [], firstAttempt: null };
      if (ir.correct) continue;
      const correct = matches(ir.draft, item.answers);
      ir.attempts = (ir.attempts || 0) + 1;
      ir.history = ir.history || [];
      const entry = { at: new Date().toISOString(), response: ir.draft, correct, attempt: ir.attempts, assisted: rec.assisted };
      ir.history.push(entry);
      if (!ir.firstAttempt) ir.firstAttempt = { ...entry, independent: correct && !rec.assisted };
      ir.correct = correct;
      rec.exit[item.id] = ir;
      log(rec, { kind: 'exit', itemId: item.id, ...entry });
    }
    rec.attempts += 1;
    if (!rec.firstAttempt) rec.firstAttempt = { correct: step.items.every(item => rec.exit[item.id].firstAttempt.correct), independent: !rec.assisted && step.items.every(item => rec.exit[item.id].firstAttempt.independent), assisted: rec.assisted, at: new Date().toISOString() };
    render(false, '[data-action="exit-finish"]');
  }
  function handleAction(action, target) {
    const { step } = current();
    const rec = record(step);
    if (action === 'stage') { goTo(target.dataset.stage); return; }
    if (action === 'report-return') { state.view = 'lesson'; render(true); return; }
    if (action === 'report-continue') {
      const incomplete = path().find(x => !record(x.step).done);
      if (incomplete) goTo(incomplete.stage.id, incomplete.step.id);
      return;
    }
    if (action === 'previous') {
      const active = path(); const index = active.findIndex(x => x.step.id === step.id);
      if (index > 0) goTo(active[index - 1].stage.id, active[index - 1].step.id);
      return;
    }
    if (action === 'next') { next(); return; }
    if (action === 'help' && step.type !== 'exit') {
      rec.helpOpen = !rec.helpOpen;
      if (rec.helpOpen) { rec.assisted = true; log(rec, { kind: 'help' }); }
      render(false, '[data-action="help"]'); return;
    }
    if (action === 'choice' && !isLocked(rec)) {
      const option = step.options[Number(target.dataset.index)];
      rec.selected = typeof option === 'string' ? option : option.text;
      grade(rec, matches(rec.selected, step.answers, false), rec.selected, { selectionIndex: Number(target.dataset.index) });
      render(false, '[data-feedback]'); return;
    } else if (action === 'input-check' && !isLocked(rec) && !rec.oralMode) {
      if (!rec.draft.trim()) { $('#answer-input').focus(); return; }
      grade(rec, matches(rec.draft, step.answers), rec.draft);
      render(false, '[data-feedback]'); return;
    } else if (action === 'oral-mode' && step.oralAllowed) {
      rec.oralMode = true;
      log(rec, { kind: 'oral-mode' });
    } else if (action === 'written-mode' && step.oralAllowed) {
      rec.oralMode = false;
      rec.manual = null;
      if (!isLocked(rec)) rec.done = false;
      log(rec, { kind: 'written-mode' });
    } else if (action === 'example-check') { checkExample(step, rec); return; }
    else if (action === 'example-assisted' && rec.exampleAttempts >= 2 && !rec.exampleDone) {
      rec.exampleDone = true;
      rec.exampleAssisted = true;
      rec.assisted = true;
      rec.done = true;
      rec.exampleFeedback = 'С помощью';
      log(rec, { kind: 'remedial-assisted', assessment: 'assisted', response: step.example.answers[0], independent: false });
    }
    else if (action === 'token-add' && !isLocked(rec)) {
      const id = Number(target.dataset.token); if (!rec.tokens.includes(id)) rec.tokens.push(id);
    } else if (action === 'token-remove' && !isLocked(rec)) { rec.tokens = rec.tokens.filter(x => x !== Number(target.dataset.token)); }
    else if ((action === 'token-left' || action === 'token-right') && !isLocked(rec)) {
      const index = rec.tokens.indexOf(Number(target.dataset.token)); const to = index + (action === 'token-left' ? -1 : 1);
      if (index >= 0 && to >= 0 && to < rec.tokens.length) [rec.tokens[index], rec.tokens[to]] = [rec.tokens[to], rec.tokens[index]];
    } else if (action === 'token-clear' && !isLocked(rec)) { rec.tokens = []; }
    else if (action === 'token-check' && !isLocked(rec) && rec.tokens.length === step.words.length) {
      const response = rec.tokens.map(id => step.words[id]).join(' ');
      grade(rec, matches(response, [step.words.join(' ')], false), response);
      render(false, '[data-feedback]'); return;
    } else if (action === 'error-select' && !isLocked(rec)) { rec.errorSelection = target.dataset.selection; }
    else if (action === 'error-correct' && !isLocked(rec) && rec.errorSelection !== null) {
      const correction = step.corrections[Number(target.dataset.index)];
      const location = step.errorIndex === -1 ? 'gap:1' : `word:${step.errorIndex}`;
      let fixed = step.words.slice();
      if (rec.errorSelection.startsWith('word:')) fixed[Number(rec.errorSelection.split(':')[1])] = correction;
      else fixed.splice(Number(rec.errorSelection.split(':')[1]), 0, correction);
      const correctReplacement = matches(correction, [step.answer], false) || matches(fixed.join(' '), [step.answer], false);
      grade(rec, rec.errorSelection === location && correctReplacement, fixed.join(' '), { selection: rec.errorSelection, correction });
      render(false, '[data-feedback]'); return;
    } else if (action === 'card-flip') { rec.flipped = true; }
    else if ((action === 'card-recall' || action === 'card-practise') && step.type === 'flashcards' && rec.flipped && !rec.cardPending) {
      const id = rec.queue[rec.queueIndex];
      const itemRec = rec.itemRecords[id] || { history: [], firstAttempt: null };
      const recalled = action === 'card-recall';
      const entry = { at: new Date().toISOString(), kind: 'recall', recalled, review: rec.queueIndex >= step.items.length };
      itemRec.history.push(entry);
      if (itemRec.firstAttempt === null) itemRec.firstAttempt = { correct: recalled, independent: recalled && !rec.assisted };
      itemRec.recalled = recalled;
      rec.itemRecords[id] = itemRec;
      log(rec, { ...entry, itemId: id });
      if (!recalled) rec.queue.push(id);
      rec.cardPending = true;
      rec.cardResult = recalled ? 'recalled' : 'practise';
    } else if (action === 'card-next' && rec.cardPending) {
      if (step.type === 'flashcards') rec.queueIndex += 1;
      else rec.itemIndex += 1;
      rec.cardPending = false;
      rec.cardResult = '';
      rec.flipped = false;
      rec.manual = null;
      rec.done = step.type === 'flashcards' ? rec.queueIndex >= rec.queue.length : rec.itemIndex >= step.items.length;
      if (rec.done) { next(); return; }
    } else if (action === 'associate' && rec.itemIndex < step.items.length) {
      const item = step.items[rec.itemIndex];
      const ir = rec.itemRecords[item.pronoun] || { attempts: 0, history: [], firstAttempt: null, status: '' };
      if (['correct', 'reveal'].includes(ir.status)) return;
      const correct = target.dataset.value === item.answer;
      ir.attempts += 1;
      ir.status = correct ? 'correct' : ir.attempts < 2 ? 'retry' : 'reveal';
      const entry = { at: new Date().toISOString(), response: target.dataset.value, correct, attempt: ir.attempts };
      ir.history.push(entry);
      if (!ir.firstAttempt) ir.firstAttempt = { ...entry, independent: correct && !rec.assisted };
      rec.itemRecords[item.pronoun] = ir;
      log(rec, { kind: 'associate', itemId: item.pronoun, ...entry });
    } else if (action === 'associate-example-check') {
      const item = step.items[rec.itemIndex];
      const ir = rec.itemRecords[item.pronoun];
      if (!ir || ir.status !== 'reveal' || ir.exampleDone || !ir.exampleDraft?.trim()) return;
      const correct = matches(ir.exampleDraft, step.example?.answers || ['is']);
      ir.exampleAttempts = (ir.exampleAttempts || 0) + 1;
      ir.exampleDone = correct;
      ir.exampleFeedback = correct ? 'Новый пример получился! Первая попытка сохранена отдельно.' : 'Прочитай схему и попробуй ещё раз.';
      rec.exampleAttempts += 1;
      const entry = { kind: 'associate-remedial', itemId: item.pronoun, response: ir.exampleDraft, correct, attempt: ir.exampleAttempts };
      ir.history.push({ ...entry, at: new Date().toISOString() });
      log(rec, entry);
    } else if (action === 'associate-example-assisted') {
      const item = step.items[rec.itemIndex];
      const ir = rec.itemRecords[item.pronoun];
      if (!ir || (ir.exampleAttempts || 0) < 2 || ir.exampleDone) return;
      ir.exampleDone = true;
      ir.exampleAssisted = true;
      ir.exampleFeedback = 'С помощью';
      rec.assisted = true;
      rec.exampleAssisted = true;
      const entry = { kind: 'associate-remedial-assisted', itemId: item.pronoun, response: step.example?.answers[0] || 'is', assessment: 'assisted', independent: false };
      ir.history.push({ ...entry, at: new Date().toISOString() });
      log(rec, entry);
    } else if (action === 'associate-next') {
      const item = step.items[rec.itemIndex];
      const ir = rec.itemRecords[item.pronoun];
      if (!ir || (ir.status !== 'correct' && !ir.exampleDone)) return;
      rec.itemIndex += 1; rec.done = rec.itemIndex >= step.items.length;
      if (rec.done) { next(); return; }
    } else if (action === 'reveal-item' || action === 'calendar-word') {
      const index = Number(target.dataset.index);
      if (!rec.revealed.includes(index)) { rec.revealed.push(index); log(rec, { kind: 'explore', item: index }); }
      rec.done = rec.revealed.length >= step.items.length;
      if (action === 'calendar-word') rec.calendarDay = step.items[index].word;
      const speechEnabled = $('#speech-enabled')?.checked;
      if (action === 'calendar-word' && speechEnabled && 'speechSynthesis' in window) {
        try { const speech = new SpeechSynthesisUtterance(step.items[index].word); speech.lang = 'en-GB'; speech.rate = .8; speechSynthesis.cancel(); speechSynthesis.speak(speech); } catch (_) { /* Teacher and visible pronunciation remain available offline. */ }
      }
      render(false, `[data-action="${action}"][data-index="${index}"]`);
      if ($('#speech-enabled')) $('#speech-enabled').checked = speechEnabled;
      return;
    } else if (action === 'character-select') { rec.itemIndex = Number(target.dataset.index); }
    else if (action === 'character-reveal') {
      if (!rec.revealed.includes(rec.itemIndex)) { rec.revealed.push(rec.itemIndex); log(rec, { kind: 'character', item: rec.itemIndex }); }
      rec.done = rec.revealed.length >= step.items.length;
    } else if (action === 'hero-select') { rec.hero = Number(target.dataset.index); rec.manual = null; rec.done = false; }
    else if (action === 'adjective') {
      const word = step.adjectives[Number(target.dataset.index)];
      if (rec.adjectives.includes(word)) rec.adjectives = rec.adjectives.filter(x => x !== word);
      else if (rec.adjectives.length < 2) rec.adjectives.push(word);
      rec.manual = null; rec.done = false;
    } else if (action === 'animation-next') { rec.animationIndex = Math.min(rec.animationIndex + 1, step.animation.length - 1); }
    else if (action === 'exit-check') { checkExit(step, rec); return; }
    else if (action === 'exit-finish' && step.items.every(item => rec.exit[item.id]?.attempts > 0)) {
      rec.done = true;
      log(rec, { kind: 'exit-finished' });
      showReport(); return;
    } else return;
    const focusSelector = target.dataset.index !== undefined ? `[data-action="${action}"][data-index="${target.dataset.index}"]` : `[data-action="${action}"]`;
    render(true, ['card-recall', 'card-practise', 'associate', 'associate-example-check'].includes(action) && $('[data-feedback]', task) ? '[data-feedback]' : focusSelector);
  }
  function showReport() {
    if (current().step.type === 'exit' && !record(current().step).done) return;
    state.view = 'report';
    if (path().every(x => record(x.step).done) && !state.completedAt) state.completedAt = new Date().toISOString();
    $('.tools').open = false;
    render(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  function unassessedOral(step, rec) {
    return (step.type === 'oral' || step.type === 'describe' || (step.type === 'input' && rec.oralMode)) && !rec.firstAttempt && !rec.manual;
  }
  function outcome(step, rec) {
    if (!rec.done) return rec.attempts ? 'в работе' : 'ещё не пройдено';
    if (unassessedOral(step, rec)) return 'Пройдено без оценки';
    if (rec.manual) return manualLabel(rec.manual);
    if (rec.firstAttempt?.independent) return 'самостоятельно с первой попытки';
    if (rec.exampleAssisted) return 'похожий пример повторили с преподавателем';
    if (rec.status === 'reveal' && rec.exampleDone) return 'разобрали вместе; похожий пример получился';
    if (rec.status === 'correct') return rec.assisted ? 'после помощи' : 'после повторной попытки';
    if (step.type === 'exit') return 'билет завершён';
    return 'пройдено';
  }
  function reportItemResults(step, rec) {
    if (step.type === 'exit') return `<ul>${step.items.map(item => {
      const ir = rec.exit[item.id] || {};
      const firstLabel = ir.firstAttempt?.independent ? 'самостоятельно, верно' : ir.firstAttempt?.correct ? 'верно с опорой' : 'пока не получилось';
      return `<li><strong>${esc(item.prompt)}</strong><br>${ir.attempts ? `Первый ответ: ${esc(ir.firstAttempt?.response || '')} — ${firstLabel}. Сейчас: ${esc(ir.draft || '')} — ${ir.correct ? 'верно' : 'нужно повторить'}${ir.history?.[ir.history.length - 1]?.assisted ? ' (с опорой)' : ''}. Попыток: ${ir.attempts}.` : 'Ещё не отвечал.'}${rec.done && ir.attempts ? `<br>Возможный ответ: <span lang="en">${esc(item.answers[0])}</span>` : ''}</li>`;
    }).join('')}</ul>`;
    if (step.type === 'oralCards' || step.type === 'flashcards') return `<ul>${step.items.map((item, index) => {
      const ir = rec.itemRecords[item.id];
      return `<li>${ir ? esc(item.word) : `Карточка ${index + 1}`} — ${ir ? `${ir.manual ? manualLabel(ir.manual) : ir.recalled ? 'вспомнил' : 'повторяем'}; первая попытка: ${ir.firstAttempt?.independent ? 'самостоятельно' : 'с опорой / не вспомнил'}; записей: ${ir.history.length}` : 'не оценено'}</li>`;
    }).join('')}</ul>`;
    if (step.type === 'associate') return `<ul>${step.items.map(item => {
      const ir = rec.itemRecords[item.pronoun];
      return `<li>${esc(item.pronoun)} — ${ir ? `${ir.firstAttempt?.independent ? 'с первой попытки' : 'после тренировки'}; попыток: ${ir.attempts}${ir.exampleAssisted ? '; похожий пример повторили с преподавателем' : ir.exampleDone ? '; похожий пример получился' : ''}` : 'ещё не отвечал'}</li>`;
    }).join('')}</ul>`;
    return '';
  }
  function renderReport() {
    const active = path();
    const finished = active.every(x => record(x.step).done);
    const done = active.filter(x => record(x.step).done).length;
    const graded = active.filter(x => ['choice', 'pictureChoice', 'input', 'build', 'order', 'mistake', 'hotspot', 'exit', 'oral', 'describe'].includes(x.step.type) && !unassessedOral(x.step, record(x.step)));
    const independent = graded.filter(x => record(x.step).firstAttempt?.independent).length;
    task.dataset.stepId = 'report';
    task.dataset.type = 'report';
    const totalMinutes = stages.reduce((sum, stage) => sum + stage.minutes, 0);
    const optionalMinutes = all.reduce((sum, { step }) => sum + (step.optionalMinutes || 0), 0);
    $('#stage-heading').innerHTML = `<p><strong>Карта твоих открытий</strong><br>${state.route === 'short45' ? `Короткий маршрут · ≈ ${totalMinutes - optionalMinutes} мин` : `Полный маршрут · ≈ ${totalMinutes} мин`}</p>`;
    const stageReports = stages.map(stage => {
      const entries = stage.steps.map(step => {
        const rec = record(step);
        const omitted = state.route === 'short45' && step.optionalMinutes;
        return `<li><strong>${esc(step.title)}</strong>
          <span class="report-tag">${omitted ? 'дополнительное · вне короткого маршрута' : esc(outcome(step, rec))}</span>
          ${rec.attempts ? `<br>Попыток: ${rec.attempts}. ${rec.exampleAttempts ? `Похожий пример: ${rec.exampleAssisted ? 'повторили с преподавателем' : rec.exampleDone ? 'получился' : 'в работе'}, попыток ${rec.exampleAttempts}.` : ''}` : ''}
          ${rec.draft ? `<br>Сохранённый ответ: <span lang="en">${esc(rec.draft)}</span>` : ''}
          ${reportItemResults(step, rec)}
          ${rec.history.length ? `<details class="history-details"><summary>История (${rec.history.length})</summary><pre>${esc(JSON.stringify(rec.history, null, 2))}</pre></details>` : ''}
        </li>`;
      }).join('');
      const script = stage.id !== 'exit' || stage.steps.every(step => record(step).done)
        ? `<details class="teacher-panel"><summary>Реплики преподавателя · ${esc(stage.title)}</summary><ul>${(stage.teacher || []).map(text => `<li>${text}</li>`).join('')}</ul></details>` : '';
      return `<section class="report-stage"><h3>${esc(stage.title)}</h3><ul>${entries}</ul>${script}
        <div class="report-notes"><label for="report-note-${esc(stage.id)}">Заметки преподавателя</label><textarea id="report-note-${esc(stage.id)}" data-note="${esc(stage.id)}">${esc(state.notes[stage.id] || '')}</textarea></div>
      </section>`;
    }).join('');
    task.innerHTML = `<span class="eyebrow">${finished ? 'ADVENTURE COMPLETE' : 'YOUR JOURNEY SO FAR'}</span>
      <h2 lang="en">${finished ? 'Great work today!' : 'Look how far you’ve come!'}</h2>
      <p class="instruction">${finished ? 'Приключение пройдено. Ты учился, пробовал и говорил по-английски — это главное.' : 'Это промежуточный отчёт. Можно вернуться и пройти все обязательные задания.'}</p>
      <div class="report-intro"><strong>${done} / ${active.length} шагов пройдено</strong>
        <p>Самостоятельно с первой попытки: ${independent} из ${graded.length} заданий с фиксированным или устным ответом. Это наблюдение, а не оценка.</p>
        <p>Помощь, исправления и новые примеры сохраняются отдельно. За ошибки ничего не отнимается.</p>
      </div>
      <div class="button-row">${!finished ? button('Продолжить с первого непройденного →', 'report-continue', '', 'primary') : button('Вернуться к заданиям', 'report-return', '', 'primary')}${!finished ? button('Назад к текущему шагу', 'report-return') : ''}</div>
      ${stageReports}
      <div class="button-row">${button('Скачать полный JSON', 'export-report', '', 'primary')}${!finished ? button('Продолжить урок →', 'report-continue') : button('Ещё раз посмотреть урок', 'report-return')}</div>
      <p><small>Прогресс хранится только на этом устройстве. ${storageMessage ? 'Сохранение недоступно — обязательно скачайте JSON.' : 'JSON включает все ответы, первые попытки, очередь повторения и заметки.'}</small></p>`;
    $('#teacher-area').innerHTML = '';
  }
  function exportState() {
    const exported = { exportedAt: new Date().toISOString(), lesson: 'English Adventure / 02', ...state };
    if (recovery) {
      exported.recovery = { ...recovery };
      try { exported.recovery.latestRaw = localStorage.getItem(KEY); } catch (_) { /* Retain the last readable raw snapshot. */ }
    }
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `english-adventure-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function renderTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $('#theme-toggle').setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    $('#theme-toggle').innerHTML = dark ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.5 14.2A8.7 8.7 0 0 1 9.8 3.5a8.7 8.7 0 1 0 10.7 10.7Z"/></svg>';
  }
  onMutation(document, 'click', (event, inputValue) => {
    const hotspot = event.target.closest('[data-hotspot]');
    if (hotspot && current().step.type === 'hotspot' && state.view === 'lesson') {
      const { step } = current(); const rec = record(step);
      if (!hotspot.disabled && hotspot.getAttribute('aria-disabled') !== 'true' && !isLocked(rec)) { grade(rec, hotspot.dataset.hotspot === step.answer, hotspot.dataset.hotspot); render(false, '[data-feedback]'); }
      return;
    }
    const target = event.target.closest('[data-action]');
    if (!target || target.disabled) return;
    if (target.dataset.action === 'export-report') { exportState(); return; }
    handleAction(target.dataset.action, target);
  });
  document.addEventListener('keydown', event => {
    const hotspot = event.target.closest('[data-hotspot]');
    // Native buttons already generate one keyboard click; dispatch only for legacy custom hotspots.
    if (hotspot && hotspot.tagName !== 'BUTTON' && !event.defaultPrevented &&
        hotspot.getAttribute('aria-disabled') !== 'true' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      hotspot.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });
  onMutation(document, 'input', (event, inputValue) => {
    const target = event.target;
    const rec = record(current().step);
    if (target.dataset.draft === 'answer') { rec.draft = inputValue; clearAnswerResult(target); }
    else if (target.dataset.draft === 'example') rec.exampleDraft = inputValue;
    else if (target.dataset.draft === 'associate-example') {
      const item = current().step.items[rec.itemIndex];
      rec.itemRecords[item.pronoun].exampleDraft = inputValue;
    }
    else if (target.dataset.exitId) {
      const id = target.dataset.exitId;
      const ir = rec.exit[id] || { draft: '', attempts: 0, history: [], firstAttempt: null, correct: false };
      if (!ir.correct && !rec.done) ir.draft = inputValue;
      rec.exit[id] = ir;
    } else if (target.dataset.note) state.notes[target.dataset.note] = inputValue;
    else return;
    save();
  });
  onMutation(document, 'submit', (event, inputValue) => {
    const form = event.target;
    if (!form.dataset.form) return;
    event.preventDefault();
    const action = { answer: 'input-check', example: 'example-check', exit: 'exit-check', 'associate-example': 'associate-example-check' }[form.dataset.form];
    const target = $(`[data-action="${action}"]`, form);
    if (target && !target.disabled) handleAction(action, target);
  });
  let dragging = null;
  task.addEventListener('dragstart', event => {
    const target = event.target.closest('[data-token]');
    const { step } = current(); const rec = record(step);
    if (!target || !['build', 'order'].includes(step.type) || isLocked(rec)) { event.preventDefault(); return; }
    dragging = Number(target.dataset.token);
    event.dataTransfer.setData('text/plain', String(dragging)); event.dataTransfer.effectAllowed = 'move';
  });
  task.addEventListener('dragover', event => {
    const target = event.target.closest('[data-drop]');
    if (target && dragging !== null) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; target.classList.add('drag-over'); }
  });
  task.addEventListener('dragleave', event => { const target = event.target.closest('[data-drop]'); if (target && !target.contains(event.relatedTarget)) target.classList.remove('drag-over'); });
  task.addEventListener('drop', event => {
    event.preventDefault();
    const target = event.target.closest('[data-drop]');
    const id = dragging;
    dragging = null;
    if (!target || id === null) return;
    const zone = target.dataset.drop;
    const unit = event.target.closest('[data-token-position]');
    const beforeId = unit ? Number(unit.dataset.token) : null;
    void transact(() => {
      const { step } = current(); const rec = record(step);
      if (!['build', 'order'].includes(step.type) || isLocked(rec) || id < 0 || id >= step.words.length) return;
      if (zone === 'bank') rec.tokens = rec.tokens.filter(x => x !== id);
      else if (beforeId !== id) {
        rec.tokens = rec.tokens.filter(x => x !== id);
        const index = beforeId === null ? -1 : rec.tokens.indexOf(beforeId);
        rec.tokens.splice(index < 0 ? rec.tokens.length : index, 0, id);
      }
      render(false, `[data-action="token-remove"][data-token="${id}"]`);
    });
  });
  task.addEventListener('dragend', () => { dragging = null; task.querySelectorAll('.drag-over').forEach(x => x.classList.remove('drag-over')); });
  $('#theme-toggle').addEventListener('click', () => {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('oks.lesson2.theme', document.documentElement.dataset.theme); } catch (_) { /* Theme remains available for this tab. */ }
    renderTheme();
  });
  onMutation($('#route'), 'change', (event, inputValue) => {
    state.route = inputValue;
    if (!path().some(x => x.step.id === state.position)) {
      const index = all.findIndex(x => x.step.id === state.position);
      state.position = path().find(x => all.indexOf(x) > index)?.step.id || path()[0].step.id;
    }
    log(record(current().step), { kind: 'route', route: state.route });
    render(true);
  });
  $('#show-report').addEventListener('click', () => { void transact(showReport); });
  $('#export-state').addEventListener('click', () => { void transact(exportState); });
  const dialog = $('#reset-dialog');
  $('#reset-state').addEventListener('click', () => { $('.tools').open = false; resetSnapshotRaw = baselineRaw; dialog.showModal(); $('#cancel-reset').focus(); });
  $('#cancel-reset').addEventListener('click', () => { dialog.close(); $('.tools > summary').focus(); });
  $('#confirm-reset').addEventListener('click', () => { void transact(() => { state = newState(); dialog.close(); save(); render(true); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, true); });
  dialog.addEventListener('cancel', () => { setTimeout(() => $('.tools > summary').focus(), 0); });
  if (matchMedia('(max-width: 760px)').matches) $('#stage-menu').open = false;
  // Small inspection API: navigation uses the same route rules as the visible UI.
  window.LessonApp = { get state() { return JSON.parse(JSON.stringify(state)); }, goTo(stageId, stepId) { return transact(() => goTo(stageId, stepId)); }, reset() { $('#reset-state').click(); } };
  void transact(() => render());
})();
