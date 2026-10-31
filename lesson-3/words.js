(() => {
  'use strict';
  const KEY = 'oks.lesson3.words';
  const THEME_KEY = 'oks.lesson3.theme';
  const WORDS = Array.isArray(window.OKS_WORDS) ? window.OKS_WORDS : [];
  const ROUND = 10, BUILD_ROUND = 8, PAIRS = 6, TEACHER_N = 20, MAX_BUILD_LEN = 14;
  let rand = Math.random;

  /* ---------- чистая логика ---------- */
  const shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  // Выбор n без повторов; чем больший вес, тем вероятнее слово.
  const weightedSample = (items, weight, n) => items
    .map(item => ({ item, key: Math.pow(Math.max(rand(), 1e-12), 1 / Math.max(weight(item), 0.01)) }))
    .sort((a, b) => b.key - a.key).slice(0, n).map(x => x.item);
  // Близкие по смыслу слова: не попадают в один вопрос. Правило 1: общий корень в русском переводе.
  // Правило 2: небольшая явная таблица для синонимов без общего корня.
  const SYNONYMS = [['now', 'right now', 'at the moment'], ['ride', 'ride a bike'], ['kind', 'helpful', 'friendly'], ['nervous', 'feel nervous']];
  const stems = ru => new Set((ru.toLowerCase().match(/[а-яё]{4,}/g) || []).map(t => t.slice(0, 5)));
  const related = (a, b) => {
    if (SYNONYMS.some(g => g.includes(a.en) && g.includes(b.en))) return true;
    const sa = stems(a.ru);
    for (const t of stems(b.ru)) if (sa.has(t)) return true;
    return false;
  };
  const makeQuestion = (word, all) => {
    const picks = [];
    const same = shuffle(all.filter(x => x.topic === word.topic));
    const other = shuffle(all.filter(x => x.topic !== word.topic));
    for (const x of same.concat(other)) {
      if (picks.length >= 3) break;
      if (x.ru !== word.ru && !related(word, x) && !picks.some(p => related(p, x))) picks.push(x);
    }
    return { word, answer: word.ru, options: shuffle([word.ru, ...picks.map(p => p.ru)]) };
  };
  const canBuild = w => w.en.length <= MAX_BUILD_LEN;
  const letters = en => Array.from(en.replace(/\s+/g, ''));

  /* ---------- хранилище ---------- */
  let memoryOnly = false;
  let memory = { v: 1, words: {} };
  const readRaw = () => {
    let parsed;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === null) return { v: 1, words: {} };
      parsed = JSON.parse(raw);
      const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
      if (!object(parsed) || parsed.v !== 1 || !object(parsed.words) || !Object.values(parsed.words).every(object)) throw new Error('shape');
    } catch (_) {
      memoryOnly = true;
      showWarning('Сохранённый прогресс не прочитан. Исходная запись оставлена без изменений. Новые ответы работают только до закрытия страницы.');
      return memory;
    }
    // Старый ключ слова «draw a picture» (до правки списка слов): переносим прогресс, если нового ещё нет.
    if (Object.prototype.hasOwnProperty.call(parsed.words, 'drawing a picture')) {
      if (!Object.prototype.hasOwnProperty.call(parsed.words, 'draw a picture')) parsed.words['draw a picture'] = parsed.words['drawing a picture'];
      delete parsed.words['drawing a picture'];
    }
    return parsed;
  };
  const load = () => (memoryOnly ? memory : readRaw());
  const update = fn => {
    const data = load();
    fn(data);
    memory = data;
    if (memoryOnly) return;
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (_) { memoryOnly = true; showWarning('Браузер не даёт сохранять прогресс. Он будет работать, пока открыта страница.'); }
  };
  const entry = (data, en) => {
    const e = data.words[en];
    return e && typeof e === 'object' ? e : { s: '', ok: 0, bad: 0 };
  };
  const statusOf = (data, en) => { const s = entry(data, en).s; return s === 'known' || s === 'review' ? s : ''; };
  const mark = (en, ok) => update(data => {
    const e = entry(data, en);
    e.ok = (e.ok | 0) + (ok ? 1 : 0); e.bad = (e.bad | 0) + (ok ? 0 : 1);
    e.s = ok ? 'known' : 'review'; e.t = Date.now();
    data.words[en] = e;
  });
  // В режиме «только в памяти» исходные байты сначала уходят в <ключ>.corrupt, потом пишется чистая структура.
  const resetAll = () => {
    if (!memoryOnly) { update(data => { data.words = {}; }); return !memoryOnly; }
    memory = { v: 1, words: {} };
    try {
      const raw = localStorage.getItem(KEY);
      if (raw !== null) localStorage.setItem(KEY + '.corrupt', raw);
      localStorage.setItem(KEY, JSON.stringify(memory));
    } catch (_) { showWarning('Браузер не даёт сохранять прогресс. Сброс действует, пока открыта страница.'); return false; }
    memoryOnly = false;
    showWarning('');
    return true;
  };
  const weight = (word, data) => {
    const e = entry(data, word.en), s = statusOf(data, word.en);
    if (s === 'review') return 12 + Math.min(e.bad | 0, 4);
    if ((e.bad | 0) > (e.ok | 0)) return 6;
    if (s === 'known') return 1;
    return 2.5;
  };
  const pickTeacherWords = (n = TEACHER_N) => {
    const data = load();
    return weightedSample(WORDS, w => weight(w, data), Math.min(n, WORDS.length));
  };

  /* ---------- разметка ---------- */
  const $ = s => document.querySelector(s);
  const h = (tag, attrs, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
    return el;
  };
  const btn = (text, onclick, cls, extra) => h('button', Object.assign({ type: 'button', class: cls || '', onclick }, extra), text);
  const add = (parent, ...kids) => parent.append(...kids.flat().filter(k => k != null && k !== false));
  // Сообщение для экранного диктора: сначала очищаем область, чтобы одинаковый текст тоже прозвучал снова.
  let announceTimer = null;
  const announce = text => {
    const l = $('#live');
    if (!l) return;
    l.textContent = '';
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { l.textContent = text; }, 40);
  };
  function showWarning(text) { const el = $('#storage-warning'); if (el) { el.textContent = text; el.hidden = !text; } }

  /* ---------- состояние интерфейса ---------- */
  const MODES = [['cards', 'Карточки'], ['quiz', 'Быстрый выбор'], ['build', 'Собери слово'], ['pairs', 'Пары']];
  const FILTERS = [['all', 'Все'], ['new', 'Новые'], ['old', 'Прежние'], ['review', 'Повторить']];
  const ui = { mode: 'cards', filter: 'all', teacher: false };
  let session = null;
  let timerId = null, showTimer = false;
  const stopTimer = () => { if (timerId) { clearInterval(timerId); timerId = null; } };

  const poolFor = (filter = ui.filter) => {
    const data = load();
    return WORDS.filter(w => filter === 'all' || (filter === 'review' ? statusOf(data, w.en) === 'review' : w.group === filter));
  };
  const counts = () => {
    const data = load();
    let known = 0, review = 0;
    for (const w of WORDS) { const s = statusOf(data, w.en); if (s === 'known') known++; else if (s === 'review') review++; }
    return { known, review };
  };
  function renderSummary() {
    const c = counts(), total = WORDS.length;
    const p = $('#summary-text');
    p.replaceChildren(h('strong', {}, `Знаю: ${c.known} из ${total}`), ` · Повторить: ${c.review}`);
    const pct = total ? Math.round(c.known / total * 100) : 0;
    $('#summary-bar').style.width = pct + '%';
    $('.progress-bar').setAttribute('aria-valuenow', String(pct));
  }
  function renderControls() {
    $('#controls').hidden = ui.teacher;
    $('#modes').replaceChildren(...MODES.map(([id, label]) => btn(label, () => setMode(id), '', { 'aria-pressed': String(ui.mode === id) })));
    const c = counts();
    $('#filters').replaceChildren(...FILTERS.map(([id, label]) => btn(id === 'review' ? `${label} (${c.review})` : label, () => setFilter(id), '', { 'aria-pressed': String(ui.filter === id) })));
    const t = $('#teacher-toggle');
    t.setAttribute('aria-pressed', String(ui.teacher));
    t.textContent = ui.teacher ? 'Выйти из режима учителя' : 'Режим учителя';
  }
  function setMode(id) { ui.mode = id; ui.teacher = false; session = null; render(true); }
  function setFilter(id) { ui.filter = id; session = null; render(); const f = document.querySelector('#filters [aria-pressed="true"]'); if (f) f.focus({ preventScroll: true }); }
  function toggleTeacher() { ui.teacher = !ui.teacher; session = null; render(true); }

  function render(focusPanel) {
    const old = document.activeElement;
    const hadFocus = old && old !== document.body && (old.closest('#panel') || old.closest('#controls'));
    stopTimer();
    renderSummary();
    renderControls();
    const panel = $('#panel');
    panel.replaceChildren();
    if (ui.teacher) renderTeacher(panel);
    else if (ui.mode === 'cards') renderCards(panel);
    else if (ui.mode === 'quiz') renderQuiz(panel);
    else if (ui.mode === 'build') renderBuild(panel);
    else renderPairs(panel);
    // Перерисовка убирает кнопку, на которой был фокус: возвращаем его в панель, чтобы он не уходил на страницу целиком.
    if (focusPanel || (hadFocus && !document.body.contains(old))) panel.focus({ preventScroll: true });
  }
  const focusPrimary = sel => { const t = document.querySelector(sel) || document.querySelector('#panel .result button'); if (t && !t.disabled) t.focus({ preventScroll: true }); };
  const emptyPool = () => h('div', {}, h('h2', {}, 'Здесь пока пусто'),
    h('p', {}, 'В этом наборе нет слов. Выберите «Все» или поработайте в других режимах, чтобы появились слова для повторения.'),
    btn('Показать все слова', () => setFilter('all'), 'primary'));
  const wordList = items => h('ul', { class: 'word-list' }, items.map(w => h('li', {}, h('b', { lang: 'en' }, w.en), h('span', {}, w.ru))));

  /* ---------- карточки ---------- */
  function renderCards(panel) {
    const pool = poolFor();
    if (!pool.length && !(session && session.kind === 'cards')) return add(panel, emptyPool());
    if (!session || session.kind !== 'cards') session = { kind: 'cards', queue: shuffle(pool), i: 0, flipped: false, known: 0, again: [] };
    const s = session;
    if (s.i >= s.queue.length) {
      add(panel, h('div', { class: 'result' }, h('h2', {}, 'Круг пройден'),
        h('div', { class: 'score' }, `${s.known} из ${s.queue.length}`), h('p', {}, 'слов вы знаете.'),
        s.again.length ? [h('h3', {}, 'Нужно повторить'), wordList(s.again)] : h('p', {}, 'Ничего повторять не нужно. Отлично!'),
        h('div', { class: 'button-row center' },
          s.again.length ? btn('Повторить только эти', () => { session = { kind: 'cards', queue: shuffle(s.again), i: 0, flipped: false, known: 0, again: [] }; render(true); }, 'primary') : null,
          btn('Новый круг', () => { session = null; render(true); }))));
      announce('Круг пройден');
      return;
    }
    const w = s.queue[s.i];
    const flip = () => { s.flipped = !s.flipped; render(); $('#flip').focus({ preventScroll: true }); };
    const answer = h('p', { class: 'answer-line' + (s.flipped ? '' : ' hidden-answer'), 'aria-live': 'polite' }, s.flipped ? w.ru : 'Нажмите на карточку, чтобы увидеть перевод');
    const picture = w.image ? h('img', { class: 'word-image', src: w.image, alt: w.imageAlt || '', width: 640, height: 480, loading: 'lazy', decoding: 'async' }) : null;
    const next = ok => { mark(w.en, ok); if (ok) s.known++; else s.again.push(w); s.i++; s.flipped = false; render(); focusPrimary('#flip'); };
    add(panel, 
      h('div', { class: 'meta' }, h('span', {}, `Карточка ${s.i + 1} из ${s.queue.length}`), h('span', {}, `Знаю: ${s.known}`)),
      h('button', { type: 'button', id: 'flip', class: 'flipcard', onclick: flip, 'aria-label': `Слово ${w.en}. ${s.flipped ? 'Перевод: ' + w.ru : 'Нажмите, чтобы показать перевод'}` },
        picture, h('div', { class: 'big-word', lang: 'en' }, w.en), answer),
      h('div', { class: 'button-row big' },
        btn('Повторить', () => next(false), 'bad'), btn('Знаю', () => next(true), 'good')));
  }

  /* ---------- быстрый выбор ---------- */
  function startQuiz(list) {
    const data = load();
    const base = list || weightedSample(poolFor(), w => weight(w, data), ROUND);
    if (!base.length) { session = null; return; }
    session = { kind: 'quiz', qs: base.map(w => makeQuestion(w, WORDS)), i: 0, right: 0, wrong: [], picked: null, t0: Date.now() };
  }
  function renderQuiz(panel) {
    if (!poolFor().length && !(session && session.kind === 'quiz')) return add(panel, emptyPool());
    if (!session || session.kind !== 'quiz') startQuiz();
    const s = session;
    if (s.i >= s.qs.length) {
      add(panel, h('div', { class: 'result' }, h('h2', {}, 'Раунд закончен'),
        h('div', { class: 'score' }, `${s.right} из ${s.qs.length}`),
        s.wrong.length ? [h('p', {}, 'Эти слова добавлены в «Повторить»:'), wordList(s.wrong)] : h('p', {}, 'Без ошибок. Отлично!'),
        h('div', { class: 'button-row center' },
          s.wrong.length ? btn('Повторить ошибки', () => { startQuiz(s.wrong); render(true); }, 'primary') : null,
          btn('Ещё раунд', () => { startQuiz(); render(true); }, s.wrong.length ? '' : 'primary'))));
      announce(`Раунд закончен: ${s.right} из ${s.qs.length}`);
      return;
    }
    const q = s.qs[s.i];
    const answered = s.picked != null;
    const choose = opt => {
      if (answered) return;
      s.picked = opt;
      s.answeredAt = Date.now();
      const ok = opt === q.answer;
      mark(q.word.en, ok);
      if (ok) s.right++; else s.wrong.push(q.word);
      render();
      const nx = $('#next'); if (nx) nx.focus({ preventScroll: true });
      announce(ok ? 'Верно!' : `Не совсем. ${q.word.en} — ${q.answer}`);
    };
    const choices = h('div', { class: 'choices' }, q.options.map(opt => {
      let cls = '', extra = {};
      if (answered) {
        if (opt === q.answer) cls = 'is-right';
        else if (opt === s.picked) cls = 'is-wrong';
        extra = { 'aria-disabled': 'true' };
      }
      return btn(opt, () => choose(opt), cls, extra);
    }));
    add(panel, 
      h('div', { class: 'meta' }, h('span', {}, `Вопрос ${s.i + 1} из ${s.qs.length}`), h('span', {}, `Верно: ${s.right}`), showTimer ? h('span', { id: 'qtimer' }, '0 с') : null),
      h('div', { class: 'question-word', lang: 'en' }, q.word.en),
      choices,
      answered ? h('div', { class: 'feedback ' + (s.picked === q.answer ? 'correct' : 'wrong') },
        s.picked === q.answer ? 'Верно!' : `Не совсем. ${q.word.en} — ${q.answer}`) : null,
      answered ? h('div', { class: 'button-row' }, btn(s.i + 1 >= s.qs.length ? 'Показать результат' : 'Дальше', () => { s.i++; s.picked = null; s.t0 = Date.now(); render(); focusPrimary('.choices button'); }, 'primary', { id: 'next' })) : null,
      h('label', { class: 'timer-opt' }, h('input', { type: 'checkbox', checked: showTimer, onchange: e => { showTimer = e.target.checked; render(); focusPrimary('.timer-opt input'); } }), 'Показывать секундомер'));
    if (showTimer) {
      const tick = () => { const el = $('#qtimer'); if (el) el.textContent = Math.floor(((answered ? s.answeredAt : Date.now()) - s.t0) / 1000) + ' с'; };
      tick(); if (!answered) timerId = setInterval(tick, 1000);
    }
  }

  /* ---------- собери слово ---------- */
  function startBuild(list) {
    const data = load();
    const base = list || weightedSample(poolFor().filter(canBuild), w => weight(w, data), BUILD_ROUND);
    if (!base.length) { session = null; return; }
    session = { kind: 'build', words: base, i: 0, ok: 0, wrong: [], cur: null };
  }
  function newBuildCard(s) {
    const w = s.words[s.i];
    s.cur = { w, tiles: shuffle(letters(w.en).map((ch, idx) => ({ ch, idx }))), placed: [], hint: false, miss: false, state: '', gaveUp: false };
  }
  function renderBuild(panel) {
    if (!poolFor().filter(canBuild).length && !(session && session.kind === 'build')) return add(panel, emptyPool());
    if (!session || session.kind !== 'build') startBuild();
    const s = session;
    if (s.i >= s.words.length) {
      add(panel, h('div', { class: 'result' }, h('h2', {}, 'Раунд закончен'),
        h('div', { class: 'score' }, `${s.ok} из ${s.words.length}`),
        s.wrong.length ? [h('p', {}, 'Эти слова добавлены в «Повторить»:'), wordList(s.wrong)] : h('p', {}, 'Все слова собраны сразу. Отлично!'),
        h('div', { class: 'button-row center' },
          s.wrong.length ? btn('Повторить ошибки', () => { startBuild(s.wrong); render(true); }, 'primary') : null,
          btn('Ещё раунд', () => { startBuild(); render(true); }, s.wrong.length ? '' : 'primary'))));
      announce(`Раунд закончен: ${s.ok} из ${s.words.length}`);
      return;
    }
    if (!s.cur || s.cur.w !== s.words[s.i]) newBuildCard(s);
    const c = s.cur, w = c.w, target = letters(w.en);
    const done = c.state === 'right' || c.gaveUp;
    const finish = (ok) => { mark(w.en, ok); if (ok) s.ok++; else s.wrong.push(w); };
    const place = idx => {
      if (done || c.placed.includes(idx)) return;
      c.placed.push(idx);
      if (c.placed.length === target.length) {
        const got = c.placed.map(i => c.tiles.find(t => t.idx === i).ch).join('');
        if (got === target.join('')) { c.state = 'right'; finish(!c.miss && !c.hint); }
        else { c.state = 'wrong'; c.miss = true; }
      }
      render(); focusFirstTile();
      if (c.state === 'right') announce(`Верно! ${w.en}`);
      else if (c.state === 'wrong') announce('Пока не так. Сотрите буквы и попробуйте ещё.');
    };
    const erase = all => { if (done) return; c.placed = all ? [] : c.placed.slice(0, -1); c.state = ''; render(); focusFirstTile(); };
    // слоты по словам фразы
    let pos = 0;
    const slotWords = w.en.split(/\s+/).map(part => h('span', { class: 'slot-word' }, Array.from(part).map(() => {
      const idx = c.placed[pos++];
      const t = idx == null ? null : c.tiles.find(x => x.idx === idx);
      return h('span', { class: 'slot' }, t ? t.ch : '');
    })));
    const answerText = c.placed.map(i => c.tiles.find(t => t.idx === i).ch).join('');
    add(panel, 
      h('div', { class: 'meta' }, h('span', {}, `Слово ${s.i + 1} из ${s.words.length}`), h('span', {}, `Собрано сразу: ${s.ok}`)),
      h('p', { class: 'eyebrow' }, 'Соберите по-английски'),
      h('div', { class: 'big-word' }, w.ru),
      h('div', { class: 'slots' + (c.state === 'right' ? ' is-right' : c.state === 'wrong' ? ' is-wrong' : ''), lang: 'en', role: 'img', 'aria-label': `Собрано: ${answerText || 'пока ничего'}` }, slotWords),
      h('p', { class: 'hint-line' }, c.hint ? `Слово начинается с «${target[0]}»` : ''),
      h('div', { class: 'tiles', role: 'group', 'aria-label': 'Буквы', lang: 'en' }, c.tiles.map(t => btn(t.ch, () => place(t.idx), '', { disabled: done || c.placed.includes(t.idx), 'data-ch': t.ch }))),
      c.state === 'wrong' ? h('div', { class: 'feedback wrong' }, 'Пока не так. Сотрите буквы и попробуйте ещё.') : null,
      c.state === 'right' ? h('div', { class: 'feedback correct' }, `Верно! ${w.en}`) : null,
      c.gaveUp ? h('div', { class: 'feedback wrong' }, `Правильно: ${w.en}`) : null,
      h('div', { class: 'button-row' },
        done ? btn(s.i + 1 >= s.words.length ? 'Показать результат' : 'Дальше', () => { s.i++; s.cur = null; render(); focusFirstTile(); }, 'primary', { id: 'next' }) : [
          btn('Подсказка', () => { c.hint = true; render(); focusFirstTile(); }, '', { disabled: c.hint }),
          btn('Стереть', () => erase(false), '', { disabled: !c.placed.length }),
          btn('Стереть всё', () => erase(true), '', { disabled: !c.placed.length }),
          btn('Не знаю', () => { c.gaveUp = true; finish(false); render(); const nx = $('#next'); if (nx) nx.focus({ preventScroll: true }); announce(`Правильно: ${w.en}`); }, 'quiet')]),
      h('p', { class: 'hint-line' }, 'Можно нажимать буквы на клавиатуре; Backspace стирает.' + (s.layoutNote ? ' Включена русская раскладка: буква выбрана по клавише. Лучше переключить её на английскую.' : '')));
    if (done) { const nx = $('#next'); if (nx) nx.focus({ preventScroll: true }); }
    s.api = { place, erase };
  }
  function focusFirstTile() { const t = document.querySelector('.tiles button:not(:disabled)') || document.querySelector('#panel button:not(:disabled)') || $('#panel'); if (t) t.focus({ preventScroll: true }); }
  document.addEventListener('keydown', e => {
    if (document.querySelector('dialog[open]')) return;
    if (ui.teacher || ui.mode !== 'build' || !session || session.kind !== 'build' || !session.cur || !session.api) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName)) return;
    const c = session.cur;
    if (e.key === 'Backspace') { e.preventDefault(); session.api.erase(false); return; }
    if (e.key === ' ') { if (document.activeElement && document.activeElement.closest('.tiles')) e.preventDefault(); return; }
    if (e.key.length !== 1) return;
    // Не латинская буква (например русская раскладка): берём физическую клавишу KeyA..KeyZ и подсказываем про раскладку.
    let ch = e.key.toLowerCase(), fresh = false;
    if (/[^\u0000-\u007F]/.test(e.key) && /^Key[A-Z]$/.test(e.code)) {
      ch = e.code.slice(3).toLowerCase();
      if (/[\u0400-\u04FF]/.test(e.key) && !session.layoutNote) { session.layoutNote = true; fresh = true; announce('Включена русская раскладка. Лучше переключить её на английскую.'); }
    }
    const t = c.tiles.find(x => !c.placed.includes(x.idx) && x.ch.toLowerCase() === ch);
    if (t) { e.preventDefault(); session.api.place(t.idx); }
    else if (fresh) { render(); focusFirstTile(); }
  });

  /* ---------- пары ---------- */
  function startPairs() {
    const data = load();
    const pool = poolFor();
    const uniq = []; const seenRu = new Set();
    for (const w of weightedSample(pool, w => weight(w, data), pool.length)) {
      if (!seenRu.has(w.ru) && uniq.length < PAIRS) { seenRu.add(w.ru); uniq.push(w); }
    }
    if (!uniq.length) { session = null; return; }
    session = { kind: 'pairs', words: uniq, en: shuffle(uniq), ru: shuffle(uniq), matched: new Set(), pickEn: null, pickRu: null, mismatch: null, missed: new Set(), tries: 0 };
  }
  function renderPairs(panel) {
    if (!poolFor().length && !(session && session.kind === 'pairs')) return add(panel, emptyPool());
    if (!session || session.kind !== 'pairs') startPairs();
    const s = session;
    const total = s.words.length;
    if (s.matched.size === total) {
      const clean = total - s.missed.size;
      add(panel, h('div', { class: 'result' }, h('h2', {}, 'Все пары найдены'),
        h('div', { class: 'score' }, `${clean} из ${total}`), h('p', {}, `без ошибок. Попыток: ${s.tries}.`),
        s.missed.size ? [h('p', {}, 'Эти слова добавлены в «Повторить»:'), wordList(s.words.filter(w => s.missed.has(w.en)))] : null,
        h('div', { class: 'button-row center' }, btn('Новые пары', () => { startPairs(); render(true); }, 'primary'))));
      announce('Все пары найдены');
      return;
    }
    const pick = (side, w) => {
      if (s.matched.has(w.en)) return;
      if (s.mismatch) { s.pickEn = null; s.pickRu = null; s.mismatch = null; }
      if (side === 'en') s.pickEn = s.pickEn === w ? null : w; else s.pickRu = s.pickRu === w ? null : w;
      if (s.pickEn && s.pickRu) {
        s.tries++;
        if (s.pickEn === s.pickRu) {
          s.matched.add(w.en);
          if (!s.missed.has(w.en)) mark(w.en, true);   // слово с ошибкой уже отмечено «повторить» один раз
          s.pickEn = s.pickRu = null; announce('Совпало');
        } else {
          for (const x of [s.pickEn, s.pickRu]) if (!s.missed.has(x.en)) { s.missed.add(x.en); mark(x.en, false); }
          s.mismatch = [s.pickEn, s.pickRu]; announce('Не совпало');
        }
      }
      render();
      const keep = document.querySelector(`[data-side="${side}"][data-w="${CSS.escape(w.en)}"]`);
      if (keep && !keep.disabled) keep.focus({ preventScroll: true });
      else focusPrimary('.pairs .col.en button:not(:disabled)');   // пара найдена: следующее несовпавшее слово
    };
    const col = (side, list) => h('div', { class: 'col ' + side, role: 'group', 'aria-label': side === 'en' ? 'English' : 'По-русски' },
      list.map(w => {
        const isMatched = s.matched.has(w.en);
        const picked = side === 'en' ? s.pickEn === w : s.pickRu === w;
        const mis = s.mismatch && s.mismatch.includes(w) && ((side === 'en' && s.mismatch[0] === w) || (side === 'ru' && s.mismatch[1] === w));
        const cls = isMatched ? 'matched' : mis ? 'mismatch' : picked ? 'picked' : '';
        return h('button', { type: 'button', class: cls, 'data-side': side, 'data-w': w.en, lang: side === 'en' ? 'en' : 'ru', disabled: isMatched, 'aria-pressed': picked ? 'true' : 'false', onclick: () => pick(side, w) }, side === 'en' ? w.en : w.ru);
      }));
    add(panel, 
      h('div', { class: 'meta' }, h('span', {}, `Найдено пар: ${s.matched.size} из ${total}`), h('span', {}, `Попыток: ${s.tries}`)),
      h('p', { class: 'eyebrow' }, 'Нажмите слово слева и его перевод справа'),
      h('div', { class: 'pairs' }, col('en', s.en), col('ru', s.ru)),
      s.mismatch ? h('div', { class: 'feedback wrong', role: 'status' }, 'Не совпало. Выберите другую пару.') : null);
  }

  /* ---------- режим учителя ---------- */
  function newTeacherSession(words, retry) {
    session = { kind: 'teacher', words, i: 0, shown: false, know: [], dont: [], retry: !!retry, copied: '' };
  }
  const teacherText = list => 'Повторить к следующему уроку:\n' + list.map(w => `${w.en} — ${w.ru}`).join('\n');
  function copyText(text, done) {
    const fallback = () => {
      const ta = h('textarea', { class: 'textarea-copy', readonly: true }); ta.value = text;
      document.body.append(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) { /* нет доступа */ }
      ta.remove(); done(ok);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), fallback);
    else fallback();
  }
  function renderTeacher(panel) {
    add(panel, h('div', { class: 'teacher-banner' }, h('span', {}, 'Режим учителя'), btn('Выйти', toggleTeacher, 'quiet')));
    if (!session || session.kind !== 'teacher') {
      add(panel, h('h2', {}, 'Проверка слов'),
        h('p', {}, `Случайные ${Math.min(TEACHER_N, WORDS.length)} слов из ${WORDS.length}. Чаще попадаются слова, в которых ученик ошибался. Займёт около 5 минут.`),
        h('div', { class: 'button-row' }, btn('Начать проверку', () => { newTeacherSession(pickTeacherWords()); render(true); }, 'primary', { id: 'start' })));
      return;
    }
    const s = session;
    if (s.i >= s.words.length) {
      const text = teacherText(s.dont);
      add(panel, h('div', { class: 'result' }, h('h2', {}, 'Итог проверки'),
        h('div', { class: 'score' }, `${s.know.length} из ${s.words.length}`), h('p', {}, 'слов ученик знает.'),
        s.dont.length ? [h('h3', {}, 'Не знает'), wordList(s.dont)] : h('p', {}, 'Все слова известны. Отлично!'),
        h('div', { class: 'button-row center' },
          s.dont.length ? btn('Повторить только их', () => { newTeacherSession(shuffle(s.dont), true); render(true); }, 'primary') : null,
          s.dont.length ? btn('Копировать список', () => copyText(text, ok => { const f = $('#copy-note'); f.textContent = ok ? 'Список скопирован. Можно вставить в сообщение ученику.' : 'Не удалось скопировать. Выделите текст ниже и скопируйте вручную.'; if (!ok) f.after(h('textarea', { class: 'textarea-copy', readonly: true }, text)); })) : null,
          btn('Новый набор', () => { session = null; render(true); }))),
        h('p', { id: 'copy-note', class: 'hint-line', role: 'status' }, ''));
      announce('Проверка закончена');
      return;
    }
    const w = s.words[s.i];
    const answer = ok => {
      mark(w.en, ok); (ok ? s.know : s.dont).push(w); s.i++; s.shown = false; render();
      focusPrimary('#show');
    };
    add(panel, 
      h('div', { class: 'meta' }, h('span', {}, `${s.retry ? 'Повтор: ' : ''}слово ${s.i + 1} из ${s.words.length}`), h('span', {}, `Знает: ${s.know.length} · Не знает: ${s.dont.length}`)),
      h('div', { class: 'big-word', lang: 'en' }, w.en),
      h('p', { class: 'answer-line' + (s.shown ? '' : ' hidden-answer'), 'aria-live': 'polite' }, s.shown ? w.ru : 'Ответ скрыт'),
      h('div', { class: 'button-row' }, btn('Показать ответ', () => { s.shown = true; render(); }, '', { id: 'show', disabled: s.shown })),
      h('div', { class: 'button-row big' }, btn('Не знает', () => answer(false), 'bad', { id: 'dont' }), btn('Знает', () => answer(true), 'good', { id: 'know' })),
      h('p', { class: 'hint-line' }, 'Клавиши: 1 — не знает (левая кнопка), 2 — знает (правая), пробел — показать ответ (пока он скрыт).'));
  }
  document.addEventListener('keydown', e => {
    if (document.querySelector('dialog[open]')) return;
    if (!ui.teacher || !session || session.kind !== 'teacher' || session.i >= session.words.length) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const click = id => { const b = $(id); if (b && !b.disabled) { e.preventDefault(); b.click(); } };
    if (e.key === '1') click('#dont'); else if (e.key === '2') click('#know');
    else if (e.key === ' ' && !session.shown && (document.activeElement === document.body || document.activeElement === $('#panel'))) click('#show');
  });

  /* ---------- тема, сброс, запуск ---------- */
  function applyThemeLabel() {
    const dark = document.documentElement.dataset.theme === 'dark';
    const b = $('#theme-toggle');
    b.textContent = dark ? 'Светлая тема' : 'Тёмная тема';
    b.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  }
  function init() {
    applyThemeLabel();
    if (!document.querySelector('h1')) {   // в words.html нет заголовка первого уровня
      const wrap = document.querySelector('main'), title = h('h1', { class: 'page-title' }, 'Тренажёр слов');
      if (wrap) wrap.prepend(title);
    }
    $('#theme-toggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* не сохраняем */ }
      applyThemeLabel();
    });
    $('#teacher-toggle').addEventListener('click', toggleTeacher);
    const dlg = $('#reset-dialog');
    const confirmReset = () => {
      const saved = resetAll();
      session = null; render(true);
      announce(saved ? 'Прогресс сброшен' : 'Прогресс сброшен только на этой странице: браузер не даёт сохранять');
    };
    const closeDlg = () => { if (dlg.close) dlg.close(); };
    $('#reset').addEventListener('click', () => {
      if (dlg.showModal) dlg.showModal();
      else if (window.confirm('Сбросить весь прогресс?')) { confirmReset(); }
    });
    $('#cancel-reset').addEventListener('click', closeDlg);
    $('#confirm-reset').addEventListener('click', () => { closeDlg(); confirmReset(); });
    try { localStorage.getItem(KEY); } catch (_) { memoryOnly = true; showWarning('Браузер не даёт сохранять прогресс. Он будет работать, пока открыта страница.'); }
    if (new URLSearchParams(location.search).get('teacher') === '1') ui.teacher = true;
    if (!WORDS.length) { $('#panel').textContent = 'Не удалось загрузить слова. Обновите страницу.'; return; }
    render();
  }

  // Для проверок: чистая логика без интерфейса.
  window.OksWords = { makeQuestion, related, weightedSample, pickTeacherWords, canBuild, letters, shuffle, weight, mark, load, resetAll, setRandom: f => { rand = f; }, KEY };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
