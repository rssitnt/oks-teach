/* Lesson three: teacher-guided Spotlight 4 route. Declarative data for lesson.js. Photos reused from lesson two; generated illustrations live in images/ (see assets.json). */
(() => {
  'use strict';

  const IMG = '../lesson-2/images/';
  const GEN = 'images/';
  const images = {
    bike: [IMG + 'bike.webp', 'Мальчик едет на велосипеде'],
    music: [IMG + 'music.webp', 'Девочка в наушниках слушает музыку'],
    read: [IMG + 'read.webp', 'Девочка лежит на кровати и читает книгу'],
    football: [IMG + 'football.webp', 'Два мальчика играют в футбол на поле'],
    games: [IMG + 'games.webp', 'Мальчик играет в компьютерную игру'],
    shy: [GEN + 'trait-shy.webp', 'Девочка стоит перед классом, прижимает тетрадь и смотрит вниз'],
    rude: [GEN + 'trait-rude.webp', 'Мальчик отбирает мяч и грубо отталкивает расстроенную девочку'],
    friendly: [GEN + 'trait-friendly.webp', 'Девочка улыбается и машет рукой новой однокласснице у калитки'],
    funny: [GEN + 'trait-funny.webp', 'Мальчик рассказывает шутку, дети вокруг смеются'],
    helpful: [IMG + 'helpLibrary.webp', 'Мальчик помогает малышу поднять упавшие книги'],
    nervous: [GEN + 'trait-nervous.webp', 'Мальчик за партой волнуется и кусает губу'],
    silly: [GEN + 'trait-silly.webp', 'Мальчик с ведром на голове корчит рожицу, девочка хихикает'],
    kind: [GEN + 'trait-kind.webp', 'Мальчик улыбается и делится яблоком с одноклассницей'],
    quiet: [GEN + 'trait-quiet.webp', 'Девочка тихо читает на подушке, приложив палец к губам'],
    weekMon: [GEN + 'week-monday.webp', 'Девочка в наушниках слушает музыку на диване'],
    weekTue: [GEN + 'week-tuesday.webp', 'Девочка в шлеме едет на велосипеде по парку'],
    weekWed: [GEN + 'week-wednesday.webp', 'Мальчик лежит на ковре и читает книгу'],
    weekThu: [GEN + 'week-thursday.webp', 'Мальчик на диване играет в видеоигру с джойстиком'],
    weekFri: [GEN + 'week-friday.webp', 'Два мальчика играют в футбол на лугу']
  };

  const fig = (key, caption) => '<figure><img src="' + images[key][0] + '" alt="' + images[key][1] + '" width="640" height="480" loading="lazy" decoding="async"><figcaption lang="en">' + caption + '</figcaption></figure>';
  const teach = (id, title, body, extra = {}) => ({ id, type: 'teach', title, body, ...extra });
  const info = (id, title, body, links, extra = {}) => ({ id, type: 'info', title, body, links, ...extra });
  const choice = (id, title, prompt, options, answer, hint, explain, extra = {}) => ({
    id, type: 'choice', title, instruction: 'Выбери один ответ.', prompt, options, answers: [answer], hint, explain, ...extra
  });
  const input = (id, title, prompt, answers, hint, explain, extra = {}) => ({
    id, type: 'input', title, instruction: 'Напиши ответ по-английски.', prompt, answers, hint, explain, ...extra
  });
  const FORM = { instruction: 'Впиши пропущенную форму глагола (можно всё предложение).' };
  const build = (id, title, words, hint, explain, extra = {}) => ({
    id, type: 'build', title, instruction: 'Собери предложение: нажимай на слова по порядку.', words, hint, explain, ...extra, answers: [words.join(' ').replace(/^./, c => c.toUpperCase()), ...(extra.answers || [])]
  });
  const sort = (id, title, instruction, boxes, items, hint, explain, extra = {}) => ({
    id, type: 'sort', title, instruction, boxes, items: items.map(([text, box]) => ({ text, box })), hint, explain, ...extra
  });
  const match = (id, title, instruction, options, rows, hint, explain, extra = {}) => ({
    id, type: 'match', title, instruction, options, rows: rows.map(([prompt, answer]) => ({ prompt, answer })), hint, explain, ...extra
  });
  const gaps = (id, title, instruction, rows, hint, explain, extra = {}) => ({
    id, type: 'gaps', title, instruction, rows: rows.map(([before, verb, after, answers]) => ({ before, verb, after, answers })), hint, explain, ...extra
  });
  const oral = (id, title, prompt, cue, extra = {}) => ({ id, type: 'oral', title, instruction: 'Говорим вместе с учителем.', prompt, cue, ...extra });

  const BOXES = [
    { id: 'habit', label: 'Каждый день / обычно', note: 'Present Simple' },
    { id: 'now', label: 'Сейчас', note: 'Present Continuous' }
  ];
  const nowAnswer = (id, scene, prompt, options, answer, hint, explain) =>
    choice(id, 'Что происходит на фото?', prompt, options, answer, hint, explain, { scene, instruction: 'Посмотри на фото и выбери ответ.' });

  window.Lesson3Data = {
    version: 1,
    images,
    stages: [
      {
        id: 'words', title: 'Разминка: слова', minutes: 10,
        steps: [
          info('words-warmup', 'Проверка слов',
            '<p>Сначала проверим слова из прошлых уроков.</p><ul><li><strong>20 случайных слов за 5 минут</strong> — режим учителя.</li><li><strong>Игра «Пары»</strong> — 3 минуты.</li></ul><p>Тренажёр откроется в новой вкладке. Когда закончите, вернитесь сюда и нажмите «Дальше».</p>',
            [{ href: '/lesson-3/words.html', text: 'Открыть тренажёр слов', primary: true, blank: true }])
        ]
      },
      {
        id: 'days', title: 'Дни недели', minutes: 8,
        steps: [
          teach('days-list', 'Days of the week',
            '<div class="day-grid" lang="en"><span>Monday<small>понедельник</small></span><span>Tuesday<small>вторник</small></span><span>Wednesday<small>среда</small></span><span>Thursday<small>четверг</small></span><span>Friday<small>пятница</small></span><span>Saturday<small>суббота</small></span><span>Sunday<small>воскресенье</small></span></div><p>Дни недели в английском всегда пишутся с большой буквы.</p>'),
          build('days-build-week', 'Собери неделю', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'Неделя начинается с Monday и заканчивается Sunday.', 'Порядок: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.', { instruction: 'Расставь дни недели по порядку.' }),
          choice('days-missing-choice', 'Какого дня не хватает?', 'Monday, Tuesday, ___, Thursday', ['Friday', 'Sunday', 'Wednesday'], 'Wednesday',
            'После вторника (Tuesday) идёт среда.', 'Среда — Wednesday: она стоит между Tuesday и Thursday.'),
          input('days-missing-input', 'Впиши пропущенный день', 'Friday, ___, Sunday', ['Saturday'],
            'Между пятницей и воскресеньем — суббота.', 'Суббота — Saturday. Совет: дни недели пишут с большой буквы.'),
          choice('days-before-after', 'Before / after', 'What day comes before Friday?', ['Saturday', 'Thursday', 'Monday'], 'Thursday',
            'Before — до, перед. Что идёт перед пятницей?', 'Перед пятницей (Friday) — четверг (Thursday). Saturday идёт after Friday, то есть после.'),
          teach('days-on-every', 'on Monday · on Mondays · every Monday',
            '<div class="grammar-card"><div class="compare-rows" lang="en"><p><strong>on Monday</strong> — в этот понедельник, один раз<br><span>Our test is on Monday.</span></p><p><strong>on Mondays</strong> — по понедельникам, обычно<br><span>I listen to music on Mondays.</span></p><p><strong>every Monday</strong> — каждый понедельник<br><span>I ride a bike every Monday.</span></p></div><p>Перед <strong>every</strong> предлог <strong>on</strong> не нужен.</p></div>'),
          choice('days-on-choice', 'Выбери нужный вариант', 'Наша вечеринка — в эту пятницу: The party is ___ .', ['on Fridays', 'every Friday', 'on Friday'], 'on Friday',
            'Одна конкретная пятница, один раз — без -s.', 'Одна конкретная пятница: on Friday. По пятницам — on Fridays, каждую пятницу — every Friday.'),
          choice('days-every-fill', 'Выбери вариант', 'She reads a book ___ . (каждую субботу)', ['every Saturday', 'on Saturday', 'every Saturdays'], 'every Saturday',
            'Посмотри на русское слово в скобках: «каждую» значит…?', 'Every + день без -s: every Saturday. Предлог on рядом с every не ставим.'),
          match('days-match', 'Соедини по смыслу', 'К каждой русской фразе выбери английскую.', ['on Monday', 'on Mondays', 'every Friday'], [
            ['в этот понедельник (один раз)', 'on Monday'], ['по понедельникам', 'on Mondays'], ['каждую пятницу', 'every Friday']],
            'Один раз — без -s. «По понедельникам» — on Mondays. «Каждую» — every.', 'On Monday — один раз. On Mondays и every Monday значат почти одно и то же: привычка. Каждую пятницу — every Friday: слово every уже значит «каждую».')
        ]
      },
      {
        id: 'grammar', title: 'Present Simple и Present Continuous', minutes: 20,
        steps: [
          teach('gram-boxes', 'Две коробки',
            '<div class="two-boxes"><div class="box-card"><h3>Коробка 1 · каждый день / обычно</h3><p class="grammar-example" lang="en">every Monday · on Mondays<br>usually · often · always</p><p class="word-line" lang="en">usually — обычно · often — часто · always — всегда · every day — каждый день</p><p><strong>Present Simple</strong>: делаю регулярно.</p><p lang="en">I listen to music on Mondays.</p></div><div class="box-card"><h3>Коробка 2 · сейчас</h3><p class="grammar-example" lang="en">now · at the moment<br>right now</p><p><strong>Present Continuous</strong>: делаю прямо в эту минуту.</p><p lang="en">I am listening to music now.</p></div></div><p>Сначала ищем слово-подсказку, потом выбираем коробку.</p>'),
          sort('gram-sort-words', 'Слова-подсказки', 'Положи каждое слово в нужную коробку: выбери слово, затем коробку.', BOXES, [
            ['every Monday', 'habit'], ['now', 'now'], ['on Mondays', 'habit'], ['usually', 'habit'],
            ['at the moment', 'now'], ['often', 'habit'], ['right now', 'now'], ['always', 'habit']],
            'Now, at the moment, right now — всё про эту минуту. Остальные слова — про привычку.',
            'Every Monday, on Mondays, usually, often, always — повторяется (Каждый день / обычно). Now, at the moment, right now — происходит сейчас.'),
          sort('gram-sort-sentences', 'Предложения', 'Куда подходит предложение? Найди слово-подсказку.', BOXES, [
            ['I listen to music on Mondays.', 'habit'], ['The cat is sleeping now.', 'now'], ['He plays football every Sunday.', 'habit'],
            ['My mum is reading a book right now.', 'now'], ['We often read books.', 'habit'], ['I am drawing a picture right now.', 'now']],
            'Ищи: every, on Mondays, often — привычка; now, at the moment, right now — сейчас.',
            'Если есть every / on Mondays / often — это каждый день или обычно. Если now / at the moment / right now — это сейчас, и глагол с -ing.'),
          oral('gram-recall', 'Вспомни сам', 'How do we make Present Simple? And Present Continuous?', 'Как строится «каждый день»? А «сейчас»? Попробуй вспомнить сам, не подглядывая: 1) что стоит после I / you / we / they? 2) что добавляем после he / she / it? 3) что нужно для «сейчас»? Если не вспомнил — не страшно, дальше будет карточка.'),
          teach('gram-forms', 'Как строится предложение: вспоминаем',
            '<div class="grammar-card"><h3>Коробка 1 · Present Simple (каждый день)</h3><p class="formula" lang="en">I / you / we / they + <b>глагол</b></p><div class="form-table" lang="en"><p><span>I play</span><span>you play</span><span>we play</span><span>they play</span></p><p class="with-s"><span>he plays</span><span>she plays</span><span>it plays</span></p></div><p class="memo">Запомни: <strong lang="en">he / she / it</strong> просит <strong>-s</strong>.</p><p>Особые: watch → <strong lang="en">watches</strong>, go → <strong lang="en">goes</strong>, do → <strong lang="en">does</strong>, study → <strong lang="en">studies</strong>.</p></div><div class="grammar-card"><h3>Коробка 2 · Present Continuous (сейчас)</h3><p class="formula" lang="en">am / is / are + <b>глагол + -ing</b></p><div class="form-table" lang="en"><p><span>I am playing</span></p><p><span>he is playing</span><span>she is playing</span><span>it is playing</span></p><p><span>you are playing</span><span>we are playing</span><span>they are playing</span></p></div><p class="memo">Запомни: <strong lang="en">I</strong> — <strong lang="en">am</strong>, <strong lang="en">he / she / it</strong> — <strong lang="en">is</strong>, <strong lang="en">you / we / they</strong> — <strong lang="en">are</strong>.</p><p>-ing: play → <strong lang="en">playing</strong>, watch → <strong lang="en">watching</strong>, ride → <strong lang="en">riding</strong> (убираем -e), run → <strong lang="en">running</strong> (удваиваем n).</p></div><div class="grammar-card"><h3>Для справки</h3><p lang="en">She doesn’t ride a bike on Sundays. · Does she ride a bike? · She isn’t riding a bike now.</p></div>'),
          choice('gram-choice-sat', 'Выбери форму', 'She ___ a bike on Saturdays.', ['is riding', 'ride', 'rides'], 'rides',
            'On Saturdays — по субботам, это привычка. Она — she, значит нужен -s.', 'On Saturdays — привычка, поэтому Present Simple. Для she добавляем -s: rides.'),
          choice('gram-choice-now', 'Выбери форму', 'She ___ a bike now.', ['rides', 'is riding', 'ride'], 'is riding',
            'Слово now — сейчас. Нужны is и -ing.', 'Now — действие в эту минуту: is + riding.'),
          choice('gram-choice-sunday', 'Выбери форму', 'They ___ football every Sunday.', ['play', 'are playing', 'plays'], 'play',
            'Every Sunday — привычка. Для they глагол без -s.', 'Every Sunday — Present Simple. Для they глагол не меняем: play.'),
          choice('gram-choice-moment', 'Выбери форму', 'I ___ to music at the moment.', ['listen', 'am listening', 'listens'], 'am listening',
            'At the moment — сейчас. С I используем am.', 'At the moment — в данный момент: am + listening.'),
          choice('gram-choice-school', 'Выбери форму', 'He ___ to school every day.', ['go', 'is going', 'goes'], 'goes',
            'Every day — каждый день. Для he глагол go меняется особым образом.', 'Every day — привычка. Для he: go → goes.'),
          input('gram-input-ride', 'Поставь глагол в нужную форму', '(read) My mother ___ a book on Sundays.', ['reads', 'My mother reads a book on Sundays', 'reads a book', 'reads a book on Sundays'],
            'Это привычка или «сейчас»? Посмотри на слово-подсказку. Что нужно после my mother (это she)?', 'On Sundays — привычка. My mother — это she, поэтому добавляем -s: reads.', FORM),
          input('gram-input-now', 'Поставь глагол в нужную форму', '(watch) He ___ TV now.', ['is watching', 'is watching TV now', 'He is watching TV now', "he's watching", 'is watching TV', 'He is watching TV', 'is watching the TV', "He's watching TV", "He's watching TV now"],
            'Это привычка или «сейчас»? Посмотри на слово-подсказку. Какая форма нужна для «сейчас»?', 'Сейчас: is + watching.', FORM),
          input('gram-input-play', 'Поставь глагол в нужную форму', '(play) We ___ football on Sundays.', ['play', 'We play football on Sundays', 'We play', 'we play football', 'play football', 'play football on Sundays'],
            'Это привычка или «сейчас»? Посмотри на слово-подсказку. Что нужно после we?', 'On Sundays — привычка. После we глагол без -s: play.', FORM),
          input('gram-input-listen', 'Поставь глагол в нужную форму', '(draw) I ___ a picture now.', ['am drawing', 'I am drawing', "I'm drawing", 'am drawing a picture', 'I am drawing a picture', "I'm drawing a picture", 'am drawing a picture now', 'I am drawing a picture now'],
            'Это привычка или «сейчас»? Посмотри на слово-подсказку. Какое слово нужно с I: am, is или are?', 'Now — сейчас: am + drawing.', FORM),
          gaps('gram-gaps', 'Вставь глаголы в предложения', 'Поставь глагол из скобок в нужную форму: Present Simple или Present Continuous.', [
            ['My brother', 'play', 'computer games every Friday.', ['plays']],
            ['The girl', 'listen', 'to music right now.', ['is listening']],
            ['I', 'ride', 'my bike at the moment.', ['am riding']],
            ['We', 'read', 'books on Wednesdays.', ['read']],
            ['They', 'watch', 'TV now.', ['are watching']],
            ['The boy', 'go', 'to school every day.', ['goes']]],
            'Ищи слово-подсказку. Every Friday, on Wednesdays, every day — привычка: обычная форма (для he/she добавь -s). Right now, at the moment, now — сейчас: am / is / are + -ing.',
            'Привычка — Present Simple: plays, read, goes. Сейчас — Present Continuous: is listening, am riding, are watching.'),
          input('gram-fix-play', 'Исправь ошибку', 'I am play football every Sunday.', ['I play football every Sunday'],
            'Это привычка или «сейчас»? Посмотри на слово-подсказку. Нужны ли здесь am и -ing?', 'Every Sunday — Present Simple: I play football every Sunday.', { instruction: 'Перепиши предложение правильно.' }),
          input('gram-fix-school', 'Исправь ошибку', 'She go to the park every day.', ['She goes to the park every day'],
            'Every day — привычка. Для she глагол go меняется.', 'Every day — привычка, а she просит -s: She goes to the park every day.', { instruction: 'Перепиши предложение правильно.' }),
          input('gram-fix-now', 'Исправь ошибку', 'They are play football now.', ['They are playing football now'],
            'Now — сейчас. После are нужен глагол с -ing.', 'После am/is/are глагол получает -ing: are playing.', { instruction: 'Перепиши предложение правильно.' }),
          build('gram-build-saturday', 'Составь предложение', ['she', 'rides', 'a', 'bike', 'on', 'Saturdays'],
            'Кто → что делает → что → когда.', 'Порядок: She rides a bike on Saturdays. Можно и так: On Saturdays she rides a bike.', { answers: ['On Saturdays she rides a bike'] }),
          build('gram-build-now', 'Составь предложение', ['I', 'am', 'listening', 'to', 'music', 'now'],
            'I → am → глагол с -ing → остальное → now.', 'Порядок: I am listening to music now. Можно и так: Now I am listening to music.', { answers: ['Now I am listening to music'] }),
          teach('gram-week', 'Моя неделя',
            '<div class="week-story" lang="en"><p><strong>On Mondays</strong> I listen to music.</p><p><strong>Every Tuesday</strong> I ride a bike.</p><p><strong>On Wednesdays</strong> I read a book.</p><p><strong>On Thursdays</strong> I play computer games.</p><p><strong>On Fridays</strong> I play football.</p></div><div class="trait-grid week-grid">' + fig('weekMon', 'Monday') + fig('weekTue', 'Tuesday') + fig('weekWed', 'Wednesday') + fig('weekThu', 'Thursday') + fig('weekFri', 'Friday') + '</div><p>Это рассказ про привычки каждую неделю (on Mondays — по понедельникам, every Tuesday — каждый вторник) — коробка 1.</p><p>Это неделя разных детей: представь, что «I» — каждый из них.</p>'),
          choice('gram-week-tuesday', 'Моя неделя', 'On Wednesdays my sister ___ a book.', ['reads', 'read', 'is reading'], 'reads',
            'On Wednesdays — по средам, это привычка. My sister — это she, значит нужен -s.', 'On Wednesdays — привычка, поэтому Present Simple. My sister — это she, добавляем -s: reads.'),
          choice('gram-week-friday', 'Моя неделя', 'Every Thursday my brother ___ computer games.', ['play', 'is playing', 'plays'], 'plays',
            'Every Thursday — каждый четверг, это привычка. My brother — это he, значит нужен -s.', 'Every Thursday — привычка, поэтому Present Simple. My brother — это he, добавляем -s: plays.'),
          nowAnswer('gram-now-music', 'music', 'What is she doing now?', ['She is listening to music.', 'She listens to music every day.', 'She is sleeping.'], 'She is listening to music.',
            'Посмотри на картинку: девочка сейчас в наушниках.', 'Действие видно сейчас, поэтому is + listening. Every day — это про привычку.'),
          nowAnswer('gram-now-read', 'read', 'What is she doing now?', ['She reads every day.', 'She is reading a book.', 'She is drawing a picture.'], 'She is reading a book.',
            'Что она делает в эту минуту? Нужны is и -ing.', 'Сейчас: She is reading a book.'),
          nowAnswer('gram-now-football', 'football', 'What are they doing now?', ['They play football on Sundays.', 'They are playing football.', 'They are riding bikes.'], 'They are playing football.',
            'Мальчики играют сейчас, на фото. Для they — are.', 'Сейчас: They are playing football. On Sundays — это про привычку.'),
          nowAnswer('gram-now-games', 'games', 'What is he doing at the moment?', ['He plays football.', 'He is writing.', 'He is playing computer games.'], 'He is playing computer games.',
            'At the moment — сейчас; смотри, что на экране.', 'At the moment → is + playing.'),
          nowAnswer('gram-now-bike', 'bike', 'What is the boy doing right now?', ['He rides a bike on Tuesdays.', 'He is riding a bike.', 'He is listening to music.'], 'He is riding a bike.',
            'Right now — прямо сейчас. Нужны is и riding.', 'Right now → He is riding a bike.'),
          oral('gram-oral-week', 'Расскажи про свою неделю', 'On Mondays I ... Every Tuesday I ...', 'Скажи 2–3 предложения про свои привычки по дням недели. Можно про музыку, велосипед, книги, футбол.'),
          oral('gram-oral-now', 'Что ты делаешь сейчас?', 'What are you doing now?', 'Например: I am … Потом скажи, что делает твой друг: He/She is …')
        ]
      },
      {
        id: 'traits', title: 'Характер людей', minutes: 7,
        steps: [
          teach('traits-words', 'What is he / she like?',
            '<p><strong lang="en">What is he / she like?</strong> — Какой он? Какая она? <span lang="en">She is shy.</span></p><div class="trait-grid">' + fig('shy', 'shy<small>застенчивый</small>') + fig('rude', 'rude<small>грубый</small>') + fig('friendly', 'friendly<small>дружелюбный</small>') + fig('funny', 'funny<small>смешной, забавный</small>') + fig('helpful', 'helpful<small>готовый помочь</small>') + fig('nervous', 'nervous<small>взволнованный (волнуется)</small>') + fig('silly', 'silly<small>глупенький, дурашливый</small>') + fig('kind', 'kind<small>добрый</small>') + fig('quiet', 'quiet<small>тихий</small>') + '</div>'),
          match('traits-match-heroes', 'What is he like?', 'Прочитай описание и выбери, какой это человек.', ['shy', 'rude', 'friendly', 'helpful', 'funny'], [
            ['He picks up the books for a little boy. He always helps.', 'helpful'],
            ['She smiles and says hello to everybody.', 'friendly'],
            ['He tells jokes and everybody laughs.', 'funny'],
            ['She is very quiet and does not speak in front of the class.', 'shy'],
            ['He says “Go away!” to the other children.', 'rude']],
            'Найди в каждом описании главное слово и вспомни карточки выше.', 'Описание подсказывает характер: помогает — helpful, шутит — funny, здоровается — friendly, стесняется — shy, грубит — rude.'),
          input('traits-input-silly', 'What is he like?', 'What is he like?', ['He is silly', 'He is very silly', 'He is funny', 'He is very funny', "He's silly", "He's very silly", "He's funny", "He's very funny"],
            'Посмотри на картинку: мальчик с ведром на голове корчит рожицу. Ответ начинается с He is …', 'Он дурачится, как маленький: He is silly. Слово funny (забавный) тоже подходит.', { instruction: 'Ответь полным предложением: He is …', scene: 'silly' }),
          oral('traits-oral-friend', 'Какой твой друг?', 'What is your friend like? — My friend is ...', 'Выбери 1–2 слова: friendly, funny, kind, helpful, shy, quiet. Скажи так: He/She is … and …')
        ]
      },
      {
        id: 'homework', title: 'Дз из школы', minutes: 15,
        steps: [
          info('homework-school', 'Школьное дз делаем вместе',
            '<p>В школе задали:</p><ul><li>🎵 <b>Учебник, стр. 32, упр. 3</b> — песенка «Sing along!» (текст на следующем экране)</li><li>✏️ <b>Сборник, стр. 44, упр. 7 и 8</b> — сделать (упр. 7 — на сайте, упр. 8 — ответить вслух)</li></ul><p>Пройдём всё по шагам: после каждого шага отметь, как получилось.</p>', []),
          teach('homework-read', 'Учебник, стр. 32 — Sing along!',
            '<p>Песенка про почтальона Пита. Читай вслух по куплетам.</p>'
            + '<div class="song-card" lang="en">'
            + '<p>Postman Pete, what’s in your bag?<br>A parcel or a letter?<br>Postman Pete, what’s in your bag?<br>A card — or something better?</p>'
            + '<p class="song-indent">Oh, my postman’s very special,<br>He whistles and he sings!<br>I wait for him each morning,<br>I love the things he brings!</p>'
            + '<p>Postman Pete, what’s in your bag?<br>A postcard or a prize?<br>Postman Pete, what’s in your bag?<br>Give me a surprise!</p>'
            + '</div>'
            + '<p><b>My favourite kind of person!</b> — так называется песенка: «Мой любимый человек». Прочитай все три куплета и жми «Дальше».</p>'),
          gaps('homework-wb7', 'Сборник: упр. 7 — скажи наоборот', 'Скажи наоборот: сделай предложения отрицательными, как в образце. Образец из сборника: She has to wash the dishes. — She doesn’t have to wash the dishes.', [
            ['He', 'has to cook', 'supper.', ['doesn’t have to cook', 'does not have to cook']],
            ['They', 'have to come', 'to school on Sunday.', ['don’t have to come', 'do not have to come']],
            ['We', 'have to work', 'at night.', ['don’t have to work', 'do not have to work']],
            ['She', 'has to go', 'to work by train.', ['doesn’t have to go', 'does not have to go']],
            ['I', 'have to get up', 'early at the weekend.', ['don’t have to get up', 'do not have to get up']]],
            'He / She / It → doesn’t have to … · I / We / They → don’t have to … После have to глагол не меняется.',
            'Ответы: He doesn’t have to cook supper. · They don’t have to come to school on Sunday. · We don’t have to work at night. · She doesn’t have to go to work by train. · I don’t have to get up early at the weekend.'),
          oral('homework-wb8', 'Сборник: упр. 8 — ответь кратко',
            'Ответь о себе кратко, как в образце: Yes, I do. / No, I don’t.',
            'Отвечай вслух полным кратким ответом: про маму — Yes, she does. / No, she doesn’t. Потом отметь, как получилось.',
            { body: '<div class="wb-tasks" lang="en">'
              + '<p><b>1.</b> Do you have to go to school in summer? — <i>Yes, I do. / No, I don’t.</i></p>'
              + '<p><b>2.</b> Does your mum have to wear a uniform? — <i>Yes, she does. / No, she doesn’t.</i></p>'
              + '<p><b>3.</b> Do you have to get up early on weekdays?</p>'
              + '<p><b>4.</b> Does your mum have to work at night?</p>'
              + '<p><b>5.</b> Do your grandparents have to go to work?</p>'
              + '<p><b>6.</b> Does your friend have to go to school?</p>'
              + '</div>' })
        ]
      }
    ]
  };
})();
