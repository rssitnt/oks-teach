(() => {
  'use strict';
  const KEY = 'oks.lesson5';
  const THEME_KEY = 'oks.lesson5.theme';
  const LESSON = Number(KEY.match(/\d+/)[0]);
  const LESSON_WORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][LESSON];
  const SCHEMA = 1;
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const data = window.Lesson5Data;
  const task = $('#task');
  const live = document.createElement('div');
  live.id = 'lesson-live'; live.className = 'sr-only'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
  document.body.append(live);
  const announce = text => { live.textContent = text; };
  const stages = data.stages;
  const all = stages.flatMap(stage => stage.steps.map(step => ({ stage, step })));
  const GRADED = ['choice', 'input', 'build', 'sort', 'match', 'gaps'];
  const SAVE_ERR = 'Не удалось сохранить прогресс в браузере. Скачайте JSON, чтобы не потерять ответы.';
  const NEWER_ERR = 'Сохранение из другой версии, начато заново. Его копия сохранена отдельно.';
  const LOAD_ERR = 'Хранилище браузера недоступно: прогресс не сохранится. Скачайте JSON в конце урока.';
  const TRANSIENT = [SAVE_ERR, LOAD_ERR];
  const MAX_ANSWER = 200, MAX_GAP = 60, MAX_NOTE = 3000, MAX_HISTORY = 50;
  const CYRILLIC = /[\u0400-\u04FF]/;
  const langOf = text => (/[а-яё]/i.test(text) ? 'ru' : 'en');
  const NO_LETTERS = 'В ответе русская буква — переключи раскладку на английскую';
  let storageMessage = '';
  const narrow = matchMedia('(max-width: 760px)');
  let noSave = false;

  const newRecord = () => ({ done: false, attempts: 0, firstAttempt: null, assisted: false, status: '', draft: '', response: '', gapDrafts: {}, selected: '', tokens: [], tokenOrder: [], assign: {}, pick: null, picks: {}, results: {}, manual: '', helpOpen: false, history: [] });
  const newState = () => ({ version: SCHEMA, contentVersion: data.version, rev: 0, position: all[0].step.id, records: {}, notes: {}, view: 'lesson', startedAt: new Date().toISOString(), completedAt: null });
  let state = newState();

  function warn(message) {
    storageMessage = message;
    const box = $('#storage-warning');
    box.textContent = message;
    box.hidden = !message;
  }
  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (_) { warn(LOAD_ERR); return; }
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (plainObject(saved) && typeof saved.version === 'number' && saved.version > SCHEMA) { const e = new Error('newer'); e.newer = true; throw e; }
      if (!plainObject(saved) || saved.version !== SCHEMA || !plainObject(saved.records)) throw new Error('shape');
      state = { ...newState(), ...saved, rev: cleanRev(saved.rev), records: {}, notes: {} };
      if (plainObject(saved.notes)) for (const k of Object.keys(saved.notes)) state.notes[k] = String(saved.notes[k] ?? '').slice(0, MAX_NOTE);
      for (const { step } of all) {
        const r = saved.records[step.id];
        if (!plainObject(r)) continue;
        const rec = { ...newRecord(), ...r };
        for (const k of ['tokens', 'tokenOrder', 'history']) if (!Array.isArray(rec[k])) rec[k] = [];
        rec.history = rec.history.filter(plainObject).slice(-MAX_HISTORY);
        for (const k of ['assign', 'picks', 'results', 'gapDrafts']) if (!plainObject(rec[k])) rec[k] = {};
        rec.attempts = Math.max(0, Math.floor(Number(rec.attempts)) || 0);
        if (!['', 'retry', 'correct', 'reveal'].includes(rec.status)) rec.status = '';
        rec.done = rec.done === true || locked(rec);
        for (const k of ['draft', 'selected', 'manual']) rec[k] = String(rec[k] ?? '').slice(0, MAX_ANSWER);
        rec.response = String(r.response ?? rec.history.filter(h => h.kind === 'attempt').pop()?.response ?? rec.draft).slice(0, MAX_ANSWER);
        for (const k of ['picks', 'assign', 'gapDrafts']) for (const key of Object.keys(rec[k])) rec[k][key] = String(rec[k][key] ?? '').slice(0, k === 'gapDrafts' ? MAX_GAP : MAX_ANSWER);
        for (const k of ['tokens', 'tokenOrder']) rec[k] = rec[k].map(Number).filter(n => Number.isInteger(n) && n >= 0);
        rec.pick = Number.isInteger(rec.pick) ? rec.pick : null;
        state.records[step.id] = rec;
      }
      if (!all.some(x => x.step.id === state.position)) state.position = state.position === 'wrap-summary' ? all[all.length - 1].step.id : all[0].step.id;
      if (!['lesson', 'report'].includes(state.view)) state.view = 'lesson';
      if (!all.every(x => state.records[x.step.id]?.done)) state.completedAt = null;
    } catch (err) {
      try { localStorage.setItem(KEY + (err && err.newer ? '.newer' : '.corrupt'), raw); } catch (__) { }
      state = newState();
      warn(err && err.newer ? NEWER_ERR : 'Сохранённый прогресс повреждён и не прочитан. Его копия сохранена отдельно; урок начат заново.');
    }
  }
  function cleanRev(value) { const n = Math.floor(Number(value)); return Number.isSafeInteger(n) && n > 0 ? n : 0; }
  function storedRev() {
    try { const raw = localStorage.getItem(KEY); return raw ? cleanRev(JSON.parse(raw).rev) : 0; } catch (_) { return 0; }
  }
  const FOCUS_ATTRS = ['data-action', 'data-index', 'data-token', 'data-item', 'data-box', 'data-value', 'data-stage', 'data-match'];
  function selectorOf(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const attrs = FOCUS_ATTRS.filter(a => el.hasAttribute(a)).map(a => `[${a}="${CSS.escape(el.getAttribute(a))}"]`).join('');
    return attrs ? el.tagName.toLowerCase() + attrs : '';
  }
  function typedField() {
    const el = document.activeElement;
    if (!el || !task.contains(el) || !el.matches('input[data-draft], input[data-gap], textarea[data-note]')) return null;
    const { step } = current();
    const fields = [...task.querySelectorAll('input[data-draft], input[data-gap], textarea[data-note]')].map(field => ({ draft: field.hasAttribute('data-draft'), gap: field.dataset.gap, note: field.dataset.note, value: field.value.slice(0, field.hasAttribute('data-note') ? MAX_NOTE : field.hasAttribute('data-gap') ? MAX_GAP : MAX_ANSWER) }));
    return { restore: () => {
      for (const field of fields) {
        if (field.note !== undefined) state.notes[field.note] = field.value;
        else if (field.draft) record(step).draft = field.value;
        else if (locked(record(step))) record(step).gapDrafts[field.gap] = field.value;
        else record(step).picks[field.gap] = field.value;
      }
    } };
  }
  function sync() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (_) { }
    const typing = typedField(), before = { position: state.position, view: state.view };
    const active = document.activeElement, spot = active && active !== document.body && (task.contains(active) || $('#stage-nav').contains(active)) ? { sel: selectorOf(active), step: before.position, start: active.selectionStart, end: active.selectionEnd } : null;
    if (raw) load(); else state = newState();
    if (typing) { state.position = before.position; state.view = before.view; typing.restore(); }
    noSave = true;
    try { render(); } finally { noSave = false; }
    if (!spot || !spot.sel) return;
    const again = $(spot.sel);
    if (again && !again.disabled && state.position === spot.step) {
      again.focus({ preventScroll: true });
      if (typeof spot.start === 'number' && again.setSelectionRange) try { again.setSelectionRange(spot.start, spot.end); } catch (_) { }
    } else focusTop();
  }
  function save() {
    if (noSave) return;
    try {
      if (storedRev() > (state.rev || 0)) { sync(); return; }
      if (!all.every(x => state.records[x.step.id]?.done)) state.completedAt = null;
      state.rev = (state.rev || 0) + 1;
      localStorage.setItem(KEY, JSON.stringify(state));
      if (TRANSIENT.includes(storageMessage)) warn('');
    } catch (_) { warn(SAVE_ERR); }
  }
  const record = step => state.records[step.id] || (state.records[step.id] = newRecord());
  const current = () => all.find(x => x.step.id === state.position) || all[0];
  const locked = rec => rec.status === 'correct' || rec.status === 'reveal';
  function log(rec, entry) {
    if (typeof entry.response === 'string') entry.response = entry.response.slice(0, MAX_ANSWER);
    rec.history.push({ at: new Date().toISOString(), ...entry });
    if (rec.history.length > MAX_HISTORY) rec.history.splice(0, rec.history.length - MAX_HISTORY);
  }

  function normal(value) {
    return String(value ?? '').replace(/\u00B4/g, "'").normalize('NFKC').toLowerCase().replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '').replace(/[’‘`´ʼ′]/g, "'")
      .replace(/^'s (\w+ing)\b/, 'is $1').replace(/\bi'm\b/g, 'i am').replace(/\b(he|she|it|that|what|who|there)'s\b/g, '$1 is').replace(/\b([a-z]+)'s (\w+ing)\b/g, '$1 is $2')
      .replace(/\b(you|we|they)'re\b/g, '$1 are').replace(/\bisn't\b/g, 'is not').replace(/\baren't\b/g, 'are not')
      .replace(/\bdoesn't\b/g, 'does not').replace(/\bdon't\b/g, 'do not')
      .replace(/[.!?,;:]+(?=\s|$)/g, '').replace(/\s+/g, ' ').trim();
  }
  const matches = (value, answers) => (answers || []).some(a => normal(a) === normal(value));
  function gapOk(row, value) {
    if (matches(value, row.answers)) return true;
    const v = normal(value), lead = normal(row.before).split(' ').filter(Boolean);
    for (let k = 1; k <= lead.length; k++) {
      const prefix = lead.slice(-k).join(' ') + ' ';
      if (v.startsWith(prefix) && matches(v.slice(prefix.length), row.answers)) return true;
    }
    return row.answers.some(a => v === normal(`${row.before} ${a} ${row.after}`) || v === normal(`${a} ${row.after}`));
  }

  function inputRow(step) {
    const parts = String(step.prompt || '').replace(/^\s*\([^)]*\)\s*/, '').split('___');
    if (parts.length !== 2) return null;
    const before = normal(parts[0]), after = normal(parts[1]).split(' ').filter(Boolean);
    const answers = step.answers.map(answer => {
      let core = normal(answer);
      if (before && core.startsWith(before + ' ')) core = core.slice(before.length + 1);
      for (let k = after.length; k > 0; k--) {
        const suffix = ' ' + after.slice(0, k).join(' ');
        if (core.endsWith(suffix)) { core = core.slice(0, -suffix.length); break; }
      }
      return core;
    });
    return { before: parts[0].trim(), after: parts[1].trim(), answers: answers.filter(a => !answers.some(b => b !== a && a.startsWith(b + ' '))) };
  }
  function inputOk(step, value) {
    if (matches(value, step.answers)) return true;
    const row = inputRow(step);
    if (!row) return false;
    const before = normal(row.before);
    return gapOk(row, value) || step.answers.some(a => {
      const answer = normal(a);
      return before && !answer.startsWith(before + ' ') && normal(value) === normal(`${row.before} ${a}`);
    });
  }

  const button = (text, action, attrs = '', cls = '') => `<button type="button" data-action="${action}" ${attrs} class="${cls}">${text}</button>`;
  const en = text => langOf(text) === 'en' ? ' lang="en"' : '';
  const link = l => `<a class="btn${l.primary ? ' primary' : ''}" href="${esc(l.href)}"${l.blank ? ' target="_blank" rel="noopener"' : ''}>${esc(l.text)}${l.blank ? ' ↗' : ''}</a>`;
  const linkRow = links => links && links.length ? `<div class="link-row">${links.map(link).join('')}</div>` : '';
  const SIZES = { music: [1000, 667], read: [960, 640], football: [1000, 667], games: [501, 750], bike: [260, 325] };
  function scene(key) {
    const img = data.images[key];
    if (!img) return '';
    const [w, h] = Number(img[2]) > 0 && Number(img[3]) > 0 ? [Number(img[2]), Number(img[3])] : SIZES[key] || [640, 480];
    return `<div class="scene"><img class="scene-image" src="${esc(img[0])}" alt="${esc(img[1])}" width="${w}" height="${h}" decoding="async"></div>`;
  }

  function grade(rec, correct, response, once) {
    response = String(response).slice(0, MAX_ANSWER);
    if (once && rec.status === 'retry' && rec.history.some(h => h.kind === 'attempt' && normal(h.response) === normal(response))) return false;
    rec.attempts += 1;
    if (!rec.firstAttempt) rec.firstAttempt = { response, correct, independent: correct && !rec.assisted, assisted: rec.assisted, at: new Date().toISOString() };
    log(rec, { kind: 'attempt', response, correct, attempt: rec.attempts, assisted: rec.assisted });
    rec.response = response;
    rec.status = correct ? 'correct' : rec.attempts < 2 ? 'retry' : 'reveal';
    if (rec.status !== 'retry') rec.done = true;
    return true;
  }
  const tried = (rec, option) => rec.status === 'retry' && rec.history.some(h => h.kind === 'attempt' && h.response === option && !h.correct);
  const revealText = step => {
    if (step.type === 'sort') return step.items.map(i => `${i.text} → ${step.boxes.find(b => b.id === i.box).label}`).join(' · ');
    if (step.type === 'match') return step.rows.map(r => `${r.prompt} → ${r.answer}`).join(' · ');
    if (step.type === 'gaps') return step.rows.map(r => `${r.before} ${r.answers[0]} ${r.after}`).join(' · ');
    return step.answers[0];
  };
  const inputDraft = rec => locked(rec) && rec.draft !== rec.response;
  const gapDraft = rec => locked(rec) && Object.keys(rec.gapDrafts).some(i => rec.gapDrafts[i] !== rec.picks[i]);
  function feedback(step, rec) {
    if (!rec.status) return '';
    if (locked(rec) && ((step.type === 'input' && inputDraft(rec)) || (step.type === 'gaps' && gapDraft(rec)))) {
      const checked = step.type === 'input' ? rec.response : step.rows.map((_, i) => rec.picks[i]).join(' · ');
      return `<section class="feedback" role="status" tabindex="-1" data-feedback><h3>${rec.status === 'correct' ? 'Верно — проверенный ответ' : 'Ответ разобран'}</h3><p lang="en">${esc(checked)}</p>${rec.status === 'reveal' ? `<p class="answer-reveal" lang="en">${esc(revealText(step))}</p><p>${esc(step.explain)}</p>` : ''}<p>В поле сохранён Ваш черновик — он не проверен. Проверенный результат выше не изменён.</p></section>`;
    }
    if (rec.status === 'correct') return `<section class="feedback correct" role="status" tabindex="-1" data-feedback><h3>Верно</h3></section>`;
    if (rec.status === 'retry') return `<section class="feedback" role="status" tabindex="-1" data-feedback><p>Пока не так. Попробуй ещё раз.</p><p>${esc(step.hint)}</p></section>`;
    return `<section class="feedback reveal" role="status" tabindex="-1" data-feedback><p class="answer-reveal" lang="en">${esc(revealText(step))}</p><p>${esc(step.explain)}</p></section>`;
  }
  const result = (rec, response) => {
    const last = rec.history.filter(h => h.kind === 'attempt').pop();
    return last && last.response === response ? (last.correct ? 'answer-correct' : 'answer-incorrect') : '';
  };

  function choiceUI(step, rec) {
    return `<div class="options"${step.prompt ? ' role="group" aria-labelledby="task-prompt"' : ''}>${step.options.map((option, index) => {
      const cls = result(rec, option);
      return button(`<span class="option-text" lang="en">${esc(option)}</span>`, 'choice', `data-index="${index}" aria-pressed="${rec.selected === option}" ${locked(rec) || tried(rec, option) ? 'disabled' : ''}`, `${rec.selected === option ? 'selected' : ''} ${cls}`);
    }).join('')}</div>${feedback(step, rec)}`;
  }
  function inputUI(step, rec) {
    return `<form class="answer-form" data-form="answer"><label for="answer-input">Твой ответ на английском</label>
      <input id="answer-input" class="${inputDraft(rec) ? '' : result(rec, rec.draft)}" type="text" data-draft="answer" value="${esc(rec.draft)}" maxlength="${MAX_ANSWER}" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"${step.prompt ? ' aria-describedby="task-prompt"' : ''} ${locked(rec) && !inputDraft(rec) ? 'readonly' : ''}>
      <p class="notice" role="status" data-notice></p>
      <div class="button-row">${button('Проверить', 'input-check', locked(rec) ? 'disabled' : '', 'primary')}</div></form>${feedback(step, rec)}`;
  }
  function shuffled(length) {
    const ids = Array.from({ length }, (_, i) => i);
    for (let i = length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    if (length > 1 && ids.every((id, i) => id === i)) ids.push(ids.shift());
    return ids;
  }
  function buildUI(step, rec) {
    if (rec.tokenOrder.length !== step.words.length) rec.tokenOrder = shuffled(step.words.length);
    rec.tokens = rec.tokens.filter((id, i, list) => id < step.words.length && list.indexOf(id) === i);
    const lk = locked(rec);
    const bank = rec.tokenOrder.filter(id => !rec.tokens.includes(id)).map(id => button(esc(step.words[id]), 'token-add', `data-token="${id}"${en(step.words[id])} ${lk ? 'disabled' : ''}`, 'token')).join('');
    const built = rec.tokens.map(id => button(esc(step.words[id]), 'token-remove', `data-token="${id}"${en(step.words[id])} aria-label="Убрать ${esc(step.words[id])}" ${lk ? 'disabled' : ''}`, 'token')).join('');
    const cls = result(rec, rec.tokens.map(id => step.words[id]).join(' '));
    return `<div class="token-bank" role="group" aria-label="Слова для ответа">${bank}</div>
      <div class="token-output ${cls}" role="group" aria-label="Собранный ответ">${built}</div>
      <div class="button-row">${button('Проверить', 'token-check', lk || rec.tokens.length !== step.words.length ? 'disabled' : '', 'primary')}${button('Убрать все слова', 'token-clear', lk || !rec.tokens.length ? 'disabled' : '')}</div>${feedback(step, rec)}`;
  }
  function sortUI(step, rec) {
    const lk = locked(rec);
    const chip = (i, extra = '') => {
      const res = rec.results[i];
      const cls = res === true ? 'right' : res === false ? 'wrong' : '';
      return button(esc(step.items[i].text), extra, `data-item="${i}"${en(step.items[i].text)} ${lk ? 'disabled' : ''} ${rec.pick === i ? 'aria-pressed="true"' : ''}`, `chip ${cls}`);
    };
    const bank = step.items.map((_, i) => i).filter(i => rec.assign[i] === undefined);
    const boxes = step.boxes.map(box => `<div class="sort-box" role="group" aria-label="${esc(box.label)}" data-box="${esc(box.id)}">
      ${button(`<strong>${esc(box.label)}</strong><small lang="en">${esc(box.note)}</small>`, 'sort-drop', `data-box="${esc(box.id)}" ${lk ? 'disabled' : ''}`, 'drop')}
      ${step.items.map((_, i) => i).filter(i => rec.assign[i] === box.id).map(i => chip(i, 'sort-unassign')).join('')}</div>`).join('');
    return `<div class="sort-bank" role="group" aria-label="Слова и предложения для сортировки">${bank.map(i => chip(i, 'sort-pick')).join('') || '<span>Всё разложено. Нажми «Проверить».</span>'}</div>
      <div class="sort-boxes">${boxes}</div>
      <div class="button-row">${button('Проверить', 'sort-check', lk || bank.length ? 'disabled' : '', 'primary')}</div>${feedback(step, rec)}`;
  }
  function matchUI(step, rec) {
    const lk = locked(rec);
    const rows = step.rows.map((row, i) => {
      const res = rec.results[i];
      const cls = res === true ? 'answer-correct' : res === false ? 'answer-incorrect' : '';
      return `<div class="match-row"><label for="match-${i}" lang="${/[а-я]/i.test(row.prompt) ? 'ru' : 'en'}">${esc(row.prompt)}</label>
        <select id="match-${i}" class="${cls}" data-match="${i}" ${lk ? 'disabled' : ''}><option value="">Выбери…</option>${step.options.map(o => `<option value="${esc(o)}"${en(o)} ${rec.picks[i] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
    }).join('');
    const full = step.rows.every((_, i) => rec.picks[i]);
    return `<div class="match-rows">${rows}</div><div class="button-row">${button('Проверить', 'match-check', lk || !full ? 'disabled' : '', 'primary')}</div>${feedback(step, rec)}`;
  }
  function gapsUI(step, rec) {
    const lk = locked(rec), editing = gapDraft(rec);
    const rows = step.rows.map((row, i) => {
      const res = editing ? undefined : rec.results[i];
      const cls = res === true ? 'answer-correct' : res === false ? 'answer-incorrect' : '';
      return `<li class="gap-row" lang="en"><span>${esc(row.before)}</span><input id="gap-${i}" class="${cls}" type="text" data-gap="${i}" value="${esc(editing ? rec.gapDrafts[i] ?? rec.picks[i] : rec.picks[i])}" aria-label="Пропуск ${i + 1}: ${esc(row.before)} … ${esc(row.after)} (${esc(row.verb)})" maxlength="${MAX_GAP}" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" ${lk && !editing ? 'readonly' : ''}><span class="gap-verb">(${esc(row.verb)})</span><span>${esc(row.after)}</span></li>`;
    }).join('');
    const full = step.rows.every((_, i) => String(rec.picks[i] ?? '').trim());
    return `<form class="gap-form" data-form="gaps"><ol class="gap-rows">${rows}</ol><p class="notice" role="status" data-notice></p><div class="button-row">${button('Проверить', 'gaps-check', lk || !full ? 'disabled' : '', 'primary')}</div></form>${feedback(step, rec)}`;
  }
  function oralUI(step, rec) {
    const labels = { independent: 'Сам(а)', assisted: 'С помощью', notyet: 'Пока не получилось' };
    return `<div class="cue">${esc(step.cue)}</div><div class="button-row manual-row" role="group" aria-label="Как получилось (по желанию)">${Object.entries(labels).map(([k, v]) => button(v, 'manual', `data-value="${k}" aria-pressed="${rec.manual === k}"`, rec.manual === k ? 'selected' : '')).join('')}</div>`;
  }
  function exerciseUI(step, rec) {
    if (step.type === 'choice') return choiceUI(step, rec);
    if (step.type === 'input') return inputUI(step, rec);
    if (step.type === 'build') return buildUI(step, rec);
    if (step.type === 'sort') return sortUI(step, rec);
    if (step.type === 'match') return matchUI(step, rec);
    if (step.type === 'gaps') return gapsUI(step, rec);
    if (step.type === 'oral') return oralUI(step, rec);
    return '';
  }
  const canNext = (step, rec) => !GRADED.includes(step.type) || rec.done;

  function renderTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const toggle = $('#theme-toggle');
    toggle.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    toggle.innerHTML = dark
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20.5 14.2A8.7 8.7 0 0 1 9.8 3.5a8.7 8.7 0 1 0 10.7 10.7Z"/></svg>';
  }
  function renderNav() {
    const completed = all.filter(x => record(x.step).done).length;
    $('#mobile-progress').textContent = `${completed} / ${all.length}`;
    const cur = current();
    $('#stage-nav').innerHTML = stages.map((stage, index) => {
      const done = stage.steps.filter(s => record(s).done).length;
      const isCurrent = cur.stage.id === stage.id && state.view === 'lesson';
      return `<button type="button" class="stage-link ${isCurrent ? 'current' : ''} ${done === stage.steps.length ? 'complete' : ''}" data-action="stage" data-stage="${esc(stage.id)}" ${isCurrent ? 'aria-current="step"' : ''}><span class="stage-number">${done === stage.steps.length ? '✓' : index + 1}</span><span class="stage-label">${esc(stage.title)}<small>≈ ${stage.minutes} мин · ${done} / ${stage.steps.length}</small></span></button>`;
    }).join('');
  }
  function render(focus = false, focusSelector = '') {
    announce('');
    renderTheme();
    renderNav();
    if (state.view === 'report') { renderReport(); if (focus) focusTop(); save(); return; }
    const { stage, step } = current();
    const rec = record(step);
    const index = stage.steps.indexOf(step);
    const position = all.findIndex(x => x.step === step);
    $('#stage-heading').innerHTML = `<p><strong>${esc(stage.title)}</strong><br>Этап ${stages.indexOf(stage) + 1} из ${stages.length} · ≈ ${stage.minutes} мин</p><div>Шаг ${index + 1} / ${stage.steps.length}<div class="progress-bar" aria-hidden="true"><span style="width:${((index + 1) / stage.steps.length) * 100}%"></span></div></div>`;
    task.dataset.stepId = step.id;
    task.dataset.type = step.type;
    const graded = GRADED.includes(step.type);
    const prompt = step.prompt ? `<p class="prompt" id="task-prompt" lang="${/[а-я]/i.test(step.prompt) ? 'ru' : 'en'}">${esc(step.prompt)}</p>` : '';
    task.innerHTML = `<h2 tabindex="-1" lang="${langOf(step.title)}">${esc(step.title)}</h2>
      ${step.instruction ? `<p class="instruction">${esc(step.instruction)}</p>` : ''}
      ${step.body ? `<div class="body-copy">${step.body}</div>` : ''}${prompt}${step.scene ? scene(step.scene) : ''}
      ${linkRow(step.links)}${exerciseUI(step, rec)}
      ${graded && rec.helpOpen ? `<div class="hint-panel" id="hint-panel"><strong>Подсказка.</strong> ${esc(step.hint)}</div>` : ''}
      <footer class="task-footer">
        <div class="secondary-actions">${button('← Назад', 'previous', position === 0 ? 'disabled' : '', 'quiet')}${graded && !locked(rec) ? button(rec.helpOpen ? 'Скрыть подсказку' : 'Подсказка', 'help', `aria-expanded="${rec.helpOpen}"${rec.helpOpen ? ' aria-controls="hint-panel"' : ''}`, 'quiet') : ''}</div>
        ${button(position === all.length - 1 ? 'К отчёту →' : 'Дальше →', 'next', canNext(step, rec) ? '' : 'disabled', 'primary next')}
      </footer>`;
    task.querySelectorAll('.scene-image').forEach(img => img.addEventListener('error', () => {
      img.closest('.scene').innerHTML = '<p class="scene-placeholder">Фото не загрузилось. Обновите страницу.</p>';
    }));
    save();
    if (focusSelector) {
      const t = [...task.querySelectorAll(focusSelector)].find(el => !el.disabled);
      if (t) t.focus(); else if (focus) focusTop(); else (task.querySelector('[data-action$="-check"]:not(:disabled)') || task).focus();
    } else if (focus) focusTop();
  }
  const focusTop = () => ($('h2', task) || task).focus();

  function goTo(stageId, stepId) {
    const dest = stepId ? all.find(x => x.step.id === stepId) : all.find(x => x.stage.id === stageId && !record(x.step).done) || all.find(x => x.stage.id === stageId);
    if (!dest) return false;
    state.position = dest.step.id;
    state.view = 'lesson';
    if (narrow.matches) $('#stage-menu').open = false;
    render(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return true;
  }
  function next() {
    const { step } = current();
    const rec = record(step);
    if (!canNext(step, rec)) return;
    if (!rec.done) { rec.done = true; log(rec, { kind: step.type === 'oral' ? 'oral-continue' : 'read' }); }
    const index = all.findIndex(x => x.step === step);
    if (index < all.length - 1) goTo(all[index + 1].stage.id, all[index + 1].step.id);
    else showReport();
  }
  function showReport() {
    state.view = 'report';
    if (all.every(x => record(x.step).done) && !state.completedAt) state.completedAt = new Date().toISOString();
    $('.tools').open = false;
    render(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  function outcome(step, rec) {
    if (!rec.done) return rec.attempts ? 'в работе' : 'ещё не пройдено';
    if (step.type === 'oral') return rec.manual ? ({ independent: 'самостоятельно', assisted: 'с помощью', notyet: 'пока не получилось' })[rec.manual] : 'пройдено без оценки';
    if (!GRADED.includes(step.type)) return 'пройдено';
    if (rec.firstAttempt?.independent) return 'самостоятельно с первой попытки';
    if (rec.status === 'reveal') return 'разобрали вместе';
    return rec.assisted ? 'после подсказки' : 'после повторной попытки';
  }
  function renderReport() {
    const done = all.filter(x => record(x.step).done).length;
    const finished = done === all.length;
    const graded = all.filter(x => GRADED.includes(x.step.type));
    const independent = graded.filter(x => record(x.step).firstAttempt?.independent).length;
    task.dataset.stepId = 'report';
    task.dataset.type = 'report';
    $('#stage-heading').innerHTML = `<p><strong>Отчёт об уроке</strong><br>Урок ${LESSON} · ≈ ${stages.reduce((sum, stage) => sum + stage.minutes, 0)} мин</p>`;
    const stageReports = stages.map(stage => `<section class="report-stage"><h3>${esc(stage.title)}</h3><ul>${stage.steps.map(step => {
      const rec = record(step);
      return `<li><strong>${esc(step.title)}</strong> <span class="report-tag">${esc(outcome(step, rec))}</span>${rec.attempts ? `<br>Попыток: ${Number(rec.attempts) || 0}.` : ''}${rec.history.length ? `<details class="history-details"><summary>История (${rec.history.length})</summary><pre>${esc(JSON.stringify(rec.history, null, 2))}</pre></details>` : ''}</li>`;
    }).join('')}</ul><div class="report-notes"><label for="note-${esc(stage.id)}">Заметки преподавателя</label><textarea id="note-${esc(stage.id)}" data-note="${esc(stage.id)}" maxlength="${MAX_NOTE}">${esc(state.notes[stage.id] || '')}</textarea></div></section>`).join('');
    task.innerHTML = `<span class="eyebrow">${finished ? 'LESSON COMPLETE' : 'PROGRESS'}</span>
      <h2 lang="en" tabindex="-1">${finished ? 'Great work today!' : `Lesson ${LESSON_WORD} so far`}</h2>
      <div class="report-intro"><strong>${done} / ${all.length} шагов пройдено</strong>
        <p>Самостоятельно с первой попытки: ${independent} из ${graded.length} заданий с проверкой. Это наблюдение, а не оценка.</p></div>
      <div class="link-row">${finished ? button('Ещё раз посмотреть урок', 'report-return') : button('Продолжить с первого непройденного →', 'report-continue', '', 'primary')}${button('Скачать JSON', 'export')}</div>
      ${stageReports}
      <p><small>Прогресс хранится только на этом устройстве. ${TRANSIENT.includes(storageMessage) ? 'Сохранение недоступно — обязательно скачайте JSON.' : 'JSON включает ответы, попытки и заметки.'}</small></p>`;
  }
  function exportState() {
    if (!all.every(x => state.records[x.step.id]?.done)) state.completedAt = null;
    const exported = { exportedAt: new Date().toISOString(), lesson: `English Adventure / ${String(LESSON).padStart(2, '0')}`, ...state };
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date(), day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    a.href = url; a.download = `english-lesson-${LESSON}-${day}.json`;
    document.body.append(a); a.click(); a.remove();
    $('.tools').open = false;
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function checkSort(step, rec) {
    const results = {};
    step.items.forEach((item, i) => { results[i] = rec.assign[i] === item.box; });
    const ok = Object.values(results).every(Boolean);
    rec.results = results;
    grade(rec, ok, JSON.stringify(rec.assign));
    if (rec.status === 'retry') step.items.forEach((_, i) => { if (!results[i]) delete rec.assign[i]; });
    if (rec.status === 'reveal') { step.items.forEach((item, i) => { rec.assign[i] = item.box; results[i] = true; }); }
    rec.pick = null;
  }
  function checkMatch(step, rec) {
    const results = {};
    step.rows.forEach((row, i) => { results[i] = rec.picks[i] === row.answer; });
    const ok = Object.values(results).every(Boolean);
    rec.results = results;
    grade(rec, ok, JSON.stringify(rec.picks));
    if (rec.status === 'retry') step.rows.forEach((_, i) => { if (!results[i]) delete rec.picks[i]; });
    if (rec.status === 'reveal') step.rows.forEach((row, i) => { rec.picks[i] = row.answer; results[i] = true; });
  }

  function checkGaps(step, rec) {
    const results = {};
    step.rows.forEach((row, i) => { results[i] = gapOk(row, rec.picks[i]); });
    rec.results = results;
    grade(rec, Object.values(results).every(Boolean), JSON.stringify(rec.picks));
    if (rec.status === 'retry') step.rows.forEach((_, i) => { if (!results[i]) delete rec.picks[i]; });
    if (rec.status === 'reveal') step.rows.forEach((row, i) => { rec.picks[i] = row.answers[0]; results[i] = true; });
  }

  function notice(text, focusSelector) {
    const box = $('[data-notice]', task);
    if (box) box.textContent = text;
    const field = focusSelector && $(focusSelector, task);
    if (field) field.focus();
  }
  function handleAction(action, target) {
    if (action === 'stage') { goTo(target.dataset.stage); return; }
    if (action === 'report-return') { state.view = 'lesson'; render(true); return; }
    if (action === 'report-continue') { const t = all.find(x => !record(x.step).done); if (t) goTo(t.stage.id, t.step.id); return; }
    if (action === 'export') { exportState(); return; }
    const { step } = current();
    const rec = record(step);
    if (action === 'previous') { const i = all.findIndex(x => x.step === step); if (i > 0) goTo(all[i - 1].stage.id, all[i - 1].step.id); return; }
    if (action === 'next') { next(); return; }
    if (action === 'help') { rec.helpOpen = !rec.helpOpen; if (rec.helpOpen) { rec.assisted = true; log(rec, { kind: 'help' }); } render(false, '[data-action="help"]'); if (rec.helpOpen) announce(`Подсказка. ${step.hint}`); return; }
    if (action === 'manual') { rec.manual = target.dataset.value; log(rec, { kind: 'manual', value: rec.manual }); render(false, `[data-value="${rec.manual}"]`); return; }
    if (locked(rec)) return;
    if (action === 'choice') {
      rec.selected = step.options[Number(target.dataset.index)];
      grade(rec, matches(rec.selected, step.answers), rec.selected, true);
      render(false, '[data-feedback]');
    } else if (action === 'input-check') {
      if (!rec.draft.trim()) { notice('Впиши ответ', '#answer-input'); return; }
      if (CYRILLIC.test(rec.draft)) { notice(NO_LETTERS, '#answer-input'); return; }
      grade(rec, inputOk(step, rec.draft), rec.draft, true);
      render(false, '[data-feedback]');
    } else if (action === 'token-add') { rec.tokens.push(Number(target.dataset.token)); render(false, '.token-bank .token');
    } else if (action === 'token-remove') { rec.tokens = rec.tokens.filter(id => id !== Number(target.dataset.token)); render(false, '.token-output .token, .token-bank .token');
    } else if (action === 'token-clear') { rec.tokens = []; render(false, '.token-bank .token');
    } else if (action === 'token-check') {
      if (rec.tokens.length !== step.words.length) return;
      grade(rec, matches(rec.tokens.map(id => step.words[id]).join(' '), step.answers), rec.tokens.map(id => step.words[id]).join(' '), true);
      render(false, '[data-feedback]');
    } else if (action === 'sort-pick') { rec.pick = rec.pick === Number(target.dataset.item) ? null : Number(target.dataset.item); rec.results = {}; render(false, `.sort-box [data-action="sort-drop"]`);
    } else if (action === 'sort-drop') {
      if (rec.pick === null) return;
      rec.assign[rec.pick] = target.dataset.box; rec.pick = null; rec.results = {};
      render(false, '.sort-bank [data-action="sort-pick"]');
    } else if (action === 'sort-unassign') { delete rec.assign[Number(target.dataset.item)]; rec.results = {}; render(false, '.sort-bank [data-action="sort-pick"]');
    } else if (action === 'sort-check') { checkSort(step, rec); render(false, '[data-feedback]');
    } else if (action === 'match-check') { checkMatch(step, rec); render(false, '[data-feedback]');
    } else if (action === 'gaps-check') {
      const empty = step.rows.findIndex((_, i) => !String(rec.picks[i] ?? '').trim());
      if (empty >= 0) { notice('Впиши ответ', `#gap-${empty}`); return; }
      const bad = step.rows.findIndex((_, i) => CYRILLIC.test(rec.picks[i]));
      if (bad >= 0) { notice(NO_LETTERS, `#gap-${bad}`); return; }
      checkGaps(step, rec); render(false, '[data-feedback]'); }
  }

  task.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (target && !target.disabled) handleAction(target.dataset.action, target);
  });
  $('#stage-nav').addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (target) handleAction(target.dataset.action, target);
  });
  task.addEventListener('submit', event => {
    event.preventDefault();
    const { step } = current();
    if (event.target.matches('[data-form="answer"]') && !locked(record(step))) handleAction('input-check', event.target);
    else if (event.target.matches('[data-form="gaps"]') && !locked(record(step))) handleAction('gaps-check', event.target);
  });
  task.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.target.matches('[data-gap]')) { event.preventDefault(); if (!locked(record(current().step))) handleAction('gaps-check', event.target); }
  });
  const clearNotice = () => { const box = $('[data-notice]', task); if (box) box.textContent = ''; };
  task.addEventListener('input', event => {
    const t = event.target;
    if (t.matches('[data-draft]') && state.view === 'lesson') { record(current().step).draft = t.value.slice(0, MAX_ANSWER); clearNotice(); save(); }
    else if (t.matches('[data-gap]') && state.view === 'lesson') {
      const { step } = current(); const rec = record(step);
      if (locked(rec)) { rec.gapDrafts[t.dataset.gap] = t.value.slice(0, MAX_GAP); save(); return; }
      rec.picks[t.dataset.gap] = t.value.slice(0, MAX_GAP); rec.results = {}; clearNotice(); t.classList.remove('answer-correct', 'answer-incorrect'); save();
      const btn = $('[data-action="gaps-check"]', task);
      if (btn) btn.disabled = !step.rows.every((_, i) => String(rec.picks[i] ?? '').trim());
    }
    else if (t.matches('[data-note]')) { state.notes[t.dataset.note] = t.value.slice(0, MAX_NOTE); save(); }
  });
  task.addEventListener('change', event => {
    const t = event.target;
    if (t.matches('[data-match]') && state.view === 'lesson') {
      const rec = record(current().step);
      if (t.value) rec.picks[t.dataset.match] = t.value; else delete rec.picks[t.dataset.match];
      rec.results = {};
      render(false, `#match-${t.dataset.match}`);
    }
  });
  $('#theme-toggle').addEventListener('click', () => {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, document.documentElement.dataset.theme); } catch (_) { }
    renderTheme();
  });
  $('#show-report').addEventListener('click', showReport);
  $('#export-state').addEventListener('click', exportState);
  const dialog = $('#reset-dialog');
  $('#reset-state').addEventListener('click', () => { $('.tools').open = false; dialog.returnValue = ''; dialog.showModal(); $('#cancel-reset').focus(); });
  $('#cancel-reset').addEventListener('click', () => dialog.close('cancel'));
  dialog.addEventListener('close', () => { if (dialog.returnValue !== 'confirmed') $('.tools > summary').focus(); });
  document.addEventListener('keydown', event => {
    const tools = $('.tools');
    if (event.key === 'Escape' && tools.open && !dialog.open) { tools.open = false; $('summary', tools).focus(); }
  });
  $('#confirm-reset').addEventListener('click', () => { const rev = Math.max(state.rev || 0, storedRev()); state = newState(); state.rev = rev; warn(''); try { localStorage.removeItem(KEY + '.corrupt'); localStorage.removeItem(KEY + '.newer'); } catch (_) { } dialog.close('confirmed'); save(); render(true); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); });
  const syncMenu = () => { $('#stage-menu').open = !narrow.matches; };
  narrow.addEventListener('change', syncMenu);
  syncMenu();
  window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) sync(); });

  window.Lesson5App = { get state() { return JSON.parse(JSON.stringify(state)); }, goTo(stageId, stepId) { return goTo(stageId, stepId); }, reset() { $('#reset-state').click(); } };
  load();
  render();
})();
