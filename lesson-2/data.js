/* Lesson two: offline, teacher-guided Spotlight adventure. */
(() => {
  'use strict';

  const example = (prompt, answers, scene, extra = {}) => ({ prompt, answers, ...(scene ? { scene } : {}), ...extra });
  const choice = (id, title, instruction, prompt, options, answers, scene, explanation, practice, extra = {}) => ({
    id, type: 'choice', title, instruction, prompt, options, answers,
    ...(scene ? { scene } : {}), explanation, example: practice, ...extra
  });
  const input = (id, title, instruction, prompt, answers, scene, explanation, practice, extra = {}) => ({
    id, type: 'input', title, instruction, prompt, answers, placeholder: 'Your answer…',
    ...(scene ? { scene } : {}), explanation, example: practice, ...extra
  });
  const build = (id, title, prompt, words, scene, practice, extra = {}) => ({
    id, type: 'build', title, instruction: 'Собери одно предложение. Нажимай на слова или перетаскивай их, затем проверь.',
    prompt, words, scene,
    reminder: 'Кто? → am / is / are → действие с -ing → остальные слова. I → am; he / she / it → is; you / we / they → are.',
    explanation: 'Порядок: кто + am/is/are + действие с -ing; now обычно ставим в конце.',
    example: practice, ...extra
  });
  const teach = (id, title, instruction, body, extra = {}) => ({ id, type: 'teach', title, instruction, body, ...extra });
  const oral = (id, title, instruction, prompt, scene, extra = {}) => ({
    id, type: 'oral', title, instruction, prompt, ...(scene ? { scene } : {}), ...extra
  });
  const actionPicture = (id, title, prompt, options, answers, practice) => ({
    id, type: 'pictureChoice', title, instruction: 'Прочитай действие и выбери подходящую картинку.',
    prompt, options, answers,
    explanation: 'Сначала найди знакомое действие: draw — рисовать, do homework — делать домашнее задание, climb — взбираться.',
    example: practice
  });
  const location = (id, title) => choice(
    id, title, 'Теперь выбери, где находится кролик.', 'Where is the rabbit?',
    ['Under the table.', 'On the table.', 'Behind the bed.'], ['Under the table.'], 'room',
    'Under — под: кролик находится под столом.',
    example('Look at the rabbit and the box. Complete: The rabbit is climbing ___ the box.', ['onto', 'onto the box'], 'rabbitBox')
  );
  const findRabbit = (id, title) => ({
    id, type: 'hotspot', title, instruction: 'Найди кролика на картинке и нажми прямо на него.',
    scene: 'room', prompt: 'Find the rabbit!', answer: 'rabbit',
    explanation: 'Find the rabbit — найди кролика: нажимай на самого кролика.',
    example: example('What animal can you see?', ['A rabbit', 'rabbit'], 'rabbit')
  });
  const ingPractice = {
    write: ['Убираем немую e, затем добавляем -ing: write → writing.', 'make', 'making'],
    run: ['Один слог, короткий гласный и одна конечная согласная: удваиваем n — running.', 'sit', 'sitting'],
    swim: ['Один слог, короткий гласный и одна конечная согласная: удваиваем m — swimming.', 'run', 'running'],
    sit: ['Один слог, короткий гласный и одна конечная согласная: удваиваем t — sitting.', 'swim', 'swimming'],
    tie: ['Конечные ie заменяем на y, затем добавляем -ing: tie → tying.', 'lie', 'lying'],
    see: ['Конечные ee сохраняем: see → seeing.', 'free', 'freeing'],
    open: ['В open ударение на первом слоге: конечную n не удваиваем — opening.', 'read', 'reading'],
    play: ['Конечную y сохраняем и не удваиваем: play → playing.', 'draw', 'drawing']
  };
  const verbInput = (id, title, base, ing) => {
    const [rule, practiceBase, practiceIng] = ingPractice[base] || ['Добавляем -ing, не меняя основу глагола.', 'play', 'playing'];
    return input(id, title, 'Напиши только форму с -ing.', `${base} → ?`, [ing], null,
      rule, example(`${practiceBase} → ?`, [practiceIng]));
  };
  const grammarCard = (heading, content) => `<section class="grammar-card"><h3>${heading}</h3>${content}</section>`;
  const grammarForm = (parts, sample) => `<div class="grammar-form">${parts.map((part, index) => `${index && part !== '?' ? '<b aria-hidden="true">+</b>' : ''}<span>${part}</span>`).join('')}</div><p class="grammar-example" lang="en">${sample}</p>`;

  window.LessonData = {
    version: 1,
    stages: [
      {
        id: 'words', title: 'Word Rescue', minutes: 6,
        teacher: [
          'Our adventure words need rescuing! Look, say the word, and turn the card over.',
          'If a word is new, choose Practise. We will meet it again at the end. That is how we learn!',
          'Find the rabbit! Touch the rabbit itself. Now, where is it?',
          'Draw a picture. Do homework. Climb a tree. Listen: drawing, doing, climbing. We will discover why in the Academy.',
          'По-русски: сначала вспоминаем слова по картинке. Карточки для практики повторяются; -ing пока узнаём на слух и по действию.'
        ],
        steps: [
          { id: 'words-nine-cards', type: 'flashcards', title: 'Rescue eight words', instruction: 'Скажи слово по картинке и переверни карточку. Отметь «помню» или «потренироваться».', items: [
            { id: 'word-draw-picture', scene: 'draw', word: 'draw a picture', translation: 'рисовать картинку' },
            { id: 'word-find', scene: 'find', word: 'find', translation: 'найти' },
            { id: 'word-rabbit', scene: 'rabbit', word: 'rabbit', translation: 'кролик' },
            { id: 'word-train', scene: 'train', word: 'train', translation: 'поезд' },
            { id: 'word-climb', scene: 'climb', word: 'climb', translation: 'взбираться' },
            { id: 'word-homework', scene: 'homework', word: 'do homework', translation: 'делать домашнее задание' },
            { id: 'word-table', scene: 'table', word: 'table', translation: 'стол' },
            { id: 'word-kind', scene: 'kind', word: 'kind', translation: 'добрый' }
          ] },
          findRabbit('words-find-rabbit', 'Find the rabbit!'),
          location('words-rabbit-location', 'Where is the rabbit?'),
          actionPicture('words-base-draw', 'Action 1 · Draw', 'draw a picture', [
            { text: 'Picture A', scene: 'homework' }, { text: 'Picture B', scene: 'draw' }, { text: 'Picture C', scene: 'climb' }
          ], ['Picture B'], example('Which action means «делать домашнее задание»?', ['do homework'])),
          actionPicture('words-base-homework', 'Action 2 · Homework', 'do homework', [
            { text: 'Picture A', scene: 'climb' }, { text: 'Picture B', scene: 'draw' }, { text: 'Picture C', scene: 'homework' }
          ], ['Picture C'], example('Which action means «рисовать картинку»?', ['draw a picture'])),
          actionPicture('words-base-climb', 'Action 3 · Climb', 'climb a tree', [
            { text: 'Picture A', scene: 'climb' }, { text: 'Picture B', scene: 'homework' }, { text: 'Picture C', scene: 'draw' }
          ], ['Picture A'], example('Which action means «рисовать»?', ['draw'])),
          choice('words-extra-ing', 'Extra rescue · One more action', 'Дополнительное повторение: выбери действие на картинке.',
            'Choose the action.', ['draw a picture', 'climb a tree', 'do homework'],
            ['draw a picture'], 'draw', 'Draw a picture — рисовать картинку. Полное предложение научимся строить в Академии.',
            example('Name this familiar action.', ['watch TV', 'watching TV'], 'watch'),
            { optionalMinutes: 1 })
        ]
      },
      {
        id: 'academy', title: 'Present Continuous Academy', minutes: 15,
        teacher: [
          'First explore every rule and demonstration, then practise. Present Continuous describes an action in progress now.',
          'I am. He, she, it is. You, we, they are. We need both be and the action with ing.',
          'Show the four spelling rules and their limits: ordinary ing, silent e, ie, and consonant doubling. Run, swim and sit double; play, read and open do not.',
          'Build a statement, add not for a negative, and move am/is/are before the subject for a question. Keep the helper in short answers.',
          'По-русски: сначала все правила и примеры, затем упражнения на смысл, местоимения, написание, утверждение, отрицание, вопросы и короткие ответы. Время ориентировочное; можно идти в своём темпе.'
        ],
        steps: [
          teach('academy-now', 'STEP 1 of 5 · What is Present Continuous?', '',
            grammarCard('Действие происходит сейчас', '<p><strong>Present</strong> — настоящее. <strong>Continuous</strong> — продолжающееся. <strong>Present Continuous</strong> — настоящее длительное время.</p><p>Действие уже началось, идёт сейчас и ещё не закончилось. Представь кадр из фильма: что человек делает в эту минуту?</p><p class="grammar-example" lang="en">She <strong>is drawing</strong> a picture now.</p><p>Она сейчас рисует картинку.</p><p class="grammar-example" lang="en">He <strong>is watching</strong> TV now.<br>They <strong>are playing</strong> football now.</p>'),
            { scenes: ['draw', 'watch', 'football'] }),
          teach('academy-when', 'STEP 1 of 5 · When do we use it?', '',
            grammarCard('Когда описываем действие прямо сейчас', '<p>На этом уроке используем это время для действий, которые происходят <strong>в момент разговора</strong>: ты читаешь, девочка рисует, мальчики играют.</p><p><strong>now</strong> — сейчас; <strong>at the moment</strong> — в данный момент. Эти слова помогают понять ситуацию, но не обязаны быть в каждом предложении.</p><p class="grammar-example" lang="en">Look! She is drawing.<br>I am reading at the moment.</p><p><strong>Сейчас:</strong> I am playing football now.<br><strong>Обычно по понедельникам:</strong> I play football on Mondays.</p><p>Сейчас — действие идёт. По понедельникам — привычка, расписание; это другой случай.</p>')),
          teach('academy-formula', 'STEP 2 of 5 · Three building blocks', '',
            grammarCard('Три части предложения', grammarForm(['Кто?', 'am / is / are', 'действие с -ing'], 'She <strong>is</strong> <strong>drawing</strong>.') + '<p><strong>am, is, are</strong> — формы глагола <strong>be</strong>. Выбираем форму по тому, кто делает действие. <strong>verb-ing</strong> — глагол с окончанием -ing. Обе части нужны вместе.</p>') +
            grammarCard('Все семь местоимений', '<div class="pronoun-pairs"><div><p><strong>I → am</strong><br>я</p><p lang="en">I am reading.</p></div><div><p><strong>He → is</strong> — он<br><strong>She → is</strong> — она<br><strong>It → is</strong> — оно</p><p lang="en">He is reading.<br>She is reading.<br>It is climbing.</p></div><div><p><strong>You → are</strong> — ты, вы<br><strong>We → are</strong> — мы<br><strong>They → are</strong> — они</p><p lang="en">You are reading.<br>We are reading.<br>They are reading.</p></div></div><p>Один мальчик — <strong>he → is</strong>. Один кролик — <strong>it → is</strong>. Несколько мальчиков — <strong>they → are</strong>.</p>')),
          teach('academy-contractions', 'STEP 2 of 5 · Short forms', '',
            grammarCard('Полная и короткая формы', '<div class="grammar-word-pairs" lang="en"><p>I am → <strong>I’m</strong></p><p>He is → <strong>He’s</strong></p><p>She is → <strong>She’s</strong></p><p>It is → <strong>It’s</strong></p><p>You are → <strong>You’re</strong></p><p>We are → <strong>We’re</strong></p><p>They are → <strong>They’re</strong></p></div><p>Апостроф показывает, что слова сократились. Смысл остаётся тем же.</p><p class="grammar-example" lang="en">I am reading. = I’m reading.<br>They are playing. = They’re playing.</p>')),
          { id: 'academy-six-morphs', type: 'morph', title: 'STEP 3 of 5 · Add -ing', instruction: '',
            body: grammarCard('Правило 1: обычно добавляем -ing', '<p>Берём глагол без <strong>to</strong> и добавляем <strong>-ing</strong>. Основа остаётся прежней.</p><p class="grammar-example" lang="en">read + ing → <strong>reading</strong><br>play + ing → <strong>playing</strong><br>open + ing → <strong>opening</strong></p>'), items: [
              { base: 'draw', ing: 'drawing' }, { base: 'watch', ing: 'watching' }, { base: 'do', ing: 'doing' },
              { base: 'climb', ing: 'climbing' }, { base: 'read', ing: 'reading' }, { base: 'play', ing: 'playing' }
            ] },
          teach('academy-write-exception', 'STEP 3 of 5 · Drop silent e', '',
            grammarCard('Правило 2: убираем немую e', '<p>Если глагол заканчивается на <strong>одну немую e</strong>, убираем её и добавляем <strong>-ing</strong>. Немая буква e в конце не произносится отдельным звуком.</p><p class="grammar-example" lang="en">write → writ + ing → <strong>writing</strong><br>make → <strong>making</strong><br>ride → <strong>riding</strong></p><p>Но конечные <strong>ee</strong> сохраняем:</p><p class="grammar-example" lang="en">see → <strong>seeing</strong><br>free → <strong>freeing</strong></p>'), { scene: 'write' }),
          teach('academy-ie-rule', 'STEP 3 of 5 · Change ie to y', '',
            grammarCard('Правило 3: ie → y + ing', '<p>Если в конце стоят <strong>две буквы ie</strong>, заменяем их на <strong>y</strong>, затем добавляем <strong>-ing</strong>.</p><p class="grammar-example" lang="en">tie → ty + ing → <strong>tying</strong><br>lie → ly + ing → <strong>lying</strong></p><p><strong>tie</strong> — завязывать; <strong>lie</strong> — лежать. Конец <strong>ie</strong> меняется целиком.</p>')),
          teach('academy-run-exception', 'STEP 3 of 5 · Double the final consonant', '',
            grammarCard('Правило 4: удваиваем последнюю согласную', '<p>В <strong>односложном глаголе</strong> удваиваем последнюю согласную, если перед ней стоит <strong>одна гласная буква</strong> с <strong>коротким гласным звуком</strong>, а в конце — <strong>одна согласная буква</strong>. Затем добавляем <strong>-ing</strong>.</p><p>Слог — один «удар» голоса. Например, <strong>run</strong> произносится одним слогом. Гласные буквы: <strong>a, e, i, o, u</strong>; n, m и t — согласные.</p><p class="grammar-example" lang="en">run → run + n + ing → <strong>running</strong><br>swim → swim + m + ing → <strong>swimming</strong><br>sit → sit + t + ing → <strong>sitting</strong></p><p>В этих словах короткие гласные, а в конце одна согласная: n, m, t.</p>'), { scene: 'run' }),
          teach('academy-doubling-limits', 'STEP 3 of 5 · When not to double', '',
            grammarCard('Короткое слово не всегда удваивает букву', '<p>Конечные <strong>w, x, y</strong> не удваиваем:</p><p class="grammar-example" lang="en">draw → <strong>drawing</strong><br>fix → <strong>fixing</strong><br>play → <strong>playing</strong></p><p>Две гласные буквы перед конечной согласной — не удваиваем: <strong>read → reading</strong>. Две согласные в конце — тоже не удваиваем: <strong>help → helping</strong>.</p>') +
            grammarCard('Если в слове несколько слогов', '<p>Для такого же конца «одна гласная + одна согласная» важно ударение: удваиваем согласную, когда <strong>последний слог ударный</strong>.</p><p class="grammar-example" lang="en">be<strong>gin</strong> → <strong>beginning</strong><br><strong>o</strong>pen → <strong>opening</strong></p><p>В begin ударение в конце, в open — в начале. Поэтому <strong>open не превращается в openning</strong>.</p><p>Отдельная особенность британского английского: <strong>travel → travelling</strong>, с двумя l даже без ударения на последнем слоге. Незнакомую форму можно проверить в словаре.</p>')),
          teach('academy-grow-she', 'STEP 4 of 5 · Grow a sentence', '',
            grammarCard('От трёх частей к целому предложению', grammarForm(['Кто?', 'am / is / are', 'verb-ing', 'подробности'], 'She is drawing a picture now.') + '<p>Сначала кто, затем форма be и действие. После них можно добавить что, где или когда.</p>'),
            { scene: 'draw', animation: ['She', 'She is', 'She is drawing', 'She is drawing a picture', 'She is drawing a picture now.'] }),
          teach('academy-grow-boys', 'STEP 4 of 5 · More than one', '',
            grammarCard('Несколько мальчиков → are', '<p><strong>The boys</strong> — мальчики, их несколько. Можно заменить на <strong>they</strong>, поэтому выбираем <strong>are</strong>.</p><p class="grammar-example" lang="en">The boys <strong>are playing</strong> football now.<br>They <strong>are playing</strong> football now.</p>'),
            { scene: 'football', animation: ['The boys', 'The boys are', 'The boys are playing', 'The boys are playing football', 'The boys are playing football now.'] }),
          teach('academy-assertion', 'STEP 5 of 5 · Affirmative', '',
            grammarCard('Утверждение: сообщаем, что происходит', grammarForm(['Кто?', 'am / is / are', 'verb-ing', 'остальные слова'], 'I <strong>am reading</strong> a book.<br>She <strong>is drawing</strong> a picture.<br>They <strong>are playing</strong> football.') + '<p><strong>Кто</strong> стоит первым. С I выбираем am, с he/she/it — is, с you/we/they — are. В действии обязательно <strong>-ing</strong>.</p>'), { scene: 'draw' }),
          teach('academy-negative', 'STEP 5 of 5 · Negative', '',
            grammarCard('Отрицание: действие не происходит', grammarForm(['Кто?', 'am / is / are', 'not', 'verb-ing', 'остальные слова'], 'I <strong>am not reading</strong>.<br>He <strong>is not watching</strong> TV.<br>They <strong>are not playing</strong>.') + '<p><strong>not</strong> означает «не» и стоит сразу после am, is или are. Сохраняем помощник и -ing.</p>') +
            grammarCard('Короткие отрицательные формы', '<p class="grammar-example" lang="en">I am not → <strong>I’m not</strong><br>is not → <strong>isn’t</strong><br>are not → <strong>aren’t</strong></p><p lang="en">She is not sleeping. = She isn’t sleeping. = She’s not sleeping.<br>They are not playing. = They aren’t playing. = They’re not playing.</p><p>С I говорим <strong>I’m not</strong>. Форму «amn’t» в этом уроке не используем.</p>')),
          teach('academy-question-rule', 'STEP 5 of 5 · Questions', '',
            grammarCard('Вопрос «да или нет»: помощник первым', grammarForm(['Am / Is / Are', 'кто?', 'verb-ing', 'остальные слова', '?'], '<strong>Am I</strong> reading?<br><strong>Is she</strong> drawing?<br><strong>Are they</strong> playing football?') + '<p>Переносим am, is или are перед тем, кто делает действие. Остальная часть предложения сохраняется.</p><p lang="en">She <strong>is</strong> drawing. → <strong>Is</strong> she drawing?<br>They <strong>are</strong> reading. → <strong>Are</strong> they reading?</p>') +
            grammarCard('Вопрос «Что делает?»', grammarForm(['What', 'am / is / are', 'кто?', 'doing', '?'], 'What <strong>are you doing</strong>? — I am reading.<br>What <strong>is she doing</strong>? — She is drawing.') + '<p><strong>What</strong> — что. Вопросительное слово стоит перед помощником. Здесь нужен полный ответ с действием.</p>')),
          teach('academy-short-answers', 'STEP 5 of 5 · Short answers', '',
            grammarCard('Короткий ответ на вопрос «да или нет»', '<div class="short-answer-patterns"><p><strong>Yes,</strong> местоимение + <strong>am / is / are.</strong></p><p><strong>No,</strong> местоимение + <strong>am not / isn’t / aren’t.</strong></p></div><div class="short-answer-list" lang="en"><div><strong>I</strong><span>Yes, I am.</span><span>No, I’m not.</span></div><div><strong>He</strong><span>Yes, he is.</span><span>No, he isn’t.</span></div><div><strong>She</strong><span>Yes, she is.</span><span>No, she isn’t.</span></div><div><strong>It</strong><span>Yes, it is.</span><span>No, it isn’t.</span></div><div><strong>You</strong><span>Yes, you are.</span><span>No, you aren’t.</span></div><div><strong>We</strong><span>Yes, we are.</span><span>No, we aren’t.</span></div><div><strong>They</strong><span>Yes, they are.</span><span>No, they aren’t.</span></div></div><p>В утвердительном коротком ответе помощник <strong>не сокращаем</strong>: <strong>Yes, she is.</strong></p><p>Если тебя спрашивают <strong>Are you reading?</strong>, отвечай о себе: <strong>Yes, I am.</strong> / <strong>No, I’m not.</strong> Для вопроса <strong>Am I reading?</strong> ответ о собеседнике: <strong>Yes, you are.</strong> / <strong>No, you aren’t.</strong></p>')),
          teach('academy-three-form-card', 'STEP 5 of 5 · Keep the three forms', '',
            grammarCard('+ Утверждение', grammarForm(['Кто?', 'am / is / are', 'verb-ing'], 'She is drawing.')) +
            grammarCard('− Отрицание', grammarForm(['Кто?', 'am / is / are', 'not', 'verb-ing'], 'She is not drawing. = She isn’t drawing.')) +
            grammarCard('? Вопрос и ответ', grammarForm(['Am / Is / Are', 'кто?', 'verb-ing', '?'], 'Is she drawing?<br>Yes, she is. / No, she isn’t.'))),

          choice('academy-meaning-now', 'Practice · What does it mean?', '', 'She is reading now.',
            ['Она читает прямо сейчас.', 'Она читает каждый понедельник.', 'Она уже закончила читать.'], ['Она читает прямо сейчас.'], null,
            'Present Continuous описывает действие в процессе: она сейчас читает и ещё не закончила.', example('Choose the time word for an action happening right now: now / every Monday.', ['now'])),
          choice('academy-meaning-routine', 'Practice · Now or every day?', '', 'Which sentence describes an action happening right now?',
            ['I play football every Monday.', 'I am playing football now.', 'I read every day.'], ['I am playing football now.'], null,
            'Am playing + now: действие идёт сейчас. Every Monday и every day говорят о привычке.', example('Complete with the right word: She is reading ___ . (now / every Monday)', ['now'])),
          { id: 'academy-seven-pronouns', type: 'associate', title: 'Practice · All seven pronouns', instruction: '',
            options: ['am', 'is', 'are'], items: [
              { pronoun: 'I', answer: 'am', example: 'I am drawing.' },
              { pronoun: 'He', answer: 'is', example: 'He is watching TV.' },
              { pronoun: 'She', answer: 'is', example: 'She is drawing.' },
              { pronoun: 'It', answer: 'is', example: 'It is climbing.' },
              { pronoun: 'You', answer: 'are', example: 'You are reading.' },
              { pronoun: 'We', answer: 'are', example: 'We are doing homework.' },
              { pronoun: 'They', answer: 'are', example: 'They are playing football.' }
            ], explanation: 'I → am; he/she/it → is; you/we/they → are.',
            example: example('Complete: The rabbit ___ climbing.', ['is']) },
          verbInput('academy-type-drawing', 'Practice · draw + ing', 'draw', 'drawing'),
          verbInput('academy-type-watching', 'Practice · watch + ing', 'watch', 'watching'),
          verbInput('academy-type-doing', 'Practice · do + ing', 'do', 'doing'),
          verbInput('academy-type-playing', 'Practice · play + ing', 'play', 'playing'),
          verbInput('academy-type-opening', 'Practice · open + ing', 'open', 'opening'),
          verbInput('academy-type-running', 'Practice · run + ing', 'run', 'running'),
          verbInput('academy-type-swimming', 'Practice · swim + ing', 'swim', 'swimming'),
          verbInput('academy-type-sitting', 'Practice · sit + ing', 'sit', 'sitting'),
          verbInput('academy-type-writing', 'Practice · write + ing', 'write', 'writing'),
          verbInput('academy-type-tying', 'Practice · tie + ing', 'tie', 'tying'),
          verbInput('academy-type-seeing', 'Practice · see + ing', 'see', 'seeing'),
          choice('academy-spelling-reason', 'Practice · Which spelling is correct?', '', 'Choose the correct pair.',
            ['run → runing; open → openning', 'run → running; open → opening', 'run → running; play → playying'], ['run → running; open → opening'], null,
            'В run удваиваем n. В open последний слог без ударения; y в play не удваиваем.', example('Write the -ing form: sit → ?', ['sitting'])),
          build('academy-build-tv', 'Practice · Build an affirmative', 'Imagine you are the boy. What are you doing?', ['I', 'am', 'watching', 'TV'], 'watch',
            example('Imagine you are reading. Write a sentence beginning with I.', ['I am reading', "I'm reading", 'I am reading now', "I'm reading now"])),
          choice('academy-negative-is', 'Practice · is not', '', 'She is not reading. = She ___ reading.',
            ['isn’t', 'aren’t', 'am not'], ['isn’t'], null, 'Is not можно сократить до isn’t.',
            example('Complete: He is not playing. He ___ playing.', ["isn't", 'is not'])),
          choice('academy-negative-are', 'Practice · are not', '', 'They are not drawing. = They ___ drawing.',
            ['isn’t', 'aren’t', 'am not'], ['aren’t'], null, 'Are not можно сократить до aren’t.',
            example('Complete: We are not reading. We ___ reading.', ["aren't", 'are not'])),
          build('academy-build-negative', 'Practice · Build a negative', 'Say that they are not reading.', ['They', 'are', 'not', 'reading'], null,
            example('Make negative: She is drawing.', ['She is not drawing', "She isn't drawing", "She's not drawing"]),
            { reminder: '', explanation: 'В отрицании not стоит после are: They are not reading.' }),
          input('academy-type-negative', 'Practice · Write a negative', '', 'Make negative: I am reading.', ['I am not reading', "I'm not reading"], null,
            'С I ставим not после am: I am not reading. Коротко: I’m not reading.', example('Make negative: We are playing.', ['We are not playing', "We aren't playing", "We're not playing"])),
          choice('academy-question-she', 'Practice · Ask about her', '', 'Ask about the girl.',
            ['Is she drawing?', 'She is drawing?', 'Are she drawing?'], ['Is she drawing?'], 'draw',
            'Для she выбираем is и ставим его перед she.', example('Turn into a question: She is reading.', ['Is she reading', 'Is she reading now'])),
          choice('academy-question-he', 'Practice · Ask about him', '', 'Ask about the boy.',
            ['He is watching TV?', 'Are he watching TV?', 'Is he watching TV?'], ['Is he watching TV?'], 'watch',
            'Для he выбираем is и ставим его перед he.', example('Turn into a question: He is climbing.', ['Is he climbing', 'Is he climbing now'])),
          choice('academy-question-they', 'Practice · Ask about them', '', 'Ask about the boys.',
            ['Is they playing football?', 'Are they playing football?', 'They are playing football?'], ['Are they playing football?'], 'football',
            'Для they выбираем are; в вопросе are стоит первым.', example('Turn into a question: They are reading.', ['Are they reading', 'Are they reading now'])),
          build('academy-build-question', 'Practice · Build a question', 'Turn into a question: You are reading.', ['Are', 'you', 'reading'], null,
            example('Turn into a question: We are playing.', ['Are we playing']),
            { reminder: '', explanation: 'В вопросе are стоит перед you: Are you reading?' }),
          input('academy-type-what-question', 'Practice · Ask what she is doing', '', 'Ask what she is doing. Start with What.', ['What is she doing'], null,
            'What + is + she + doing: What is she doing?', example('Ask what they are doing. Start with What.', ['What are they doing'])),
          choice('academy-answer-yes', 'Practice · Short answer: yes', '', 'Is she drawing?',
            ['Yes, she is.', 'No, she isn’t.', 'Yes, she are.'], ['Yes, she is.'], 'draw',
            'Девочка рисует: Yes, she is.', example('Is he watching TV?', ['Yes, he is'], 'watch')),
          choice('academy-answer-no', 'Practice · Short answer: no', '', 'Is he reading?',
            ['Yes, he is.', 'No, he isn’t.', 'No, he aren’t.'], ['No, he isn’t.'], 'watch',
            'Мальчик смотрит телевизор, а не читает: No, he isn’t.', example('Is she climbing a tree?', ["No, she isn't", 'No, she is not'], 'draw')),
          choice('academy-answer-i-yes', 'Practice · Answer about yourself', '', 'Are you reading? Answer Yes about yourself.',
            ['Yes, I am.', 'Yes, I’m.', 'Yes, you are.'], ['Yes, I am.'], null,
            'Тебя спросили о тебе: ответь I. В коротком ответе Yes помощник am не сокращаем.', example('Are you playing? Answer Yes about yourself.', ['Yes, I am'])),
          choice('academy-answer-i-no', 'Practice · I am not', '', 'Are you reading? Answer No about yourself.',
            ['No, I isn’t.', 'No, I’m not.', 'No, I aren’t.'], ['No, I’m not.'], null,
            'О себе: No, I am not. Можно сократить: No, I’m not.', example('Are you playing? Answer No about yourself.', ["No, I'm not", 'No, I am not'])),
          choice('academy-answer-we-no', 'Practice · Answer as a group', '', 'Are we playing? Answer No for your group.',
            ['No, we isn’t.', 'No, we aren’t.', 'No, we am not.'], ['No, we aren’t.'], null,
            'О нашей группе: we → are. Отрицательный короткий ответ: No, we aren’t.', example('Are we reading? Answer Yes for your group.', ['Yes, we are']))
        ]
      },
      {
        id: 'actions', title: 'Action Challenge', minutes: 11,
        teacher: [
          'You have your Academy tools. Let us try five small challenge rounds: helpers, ing words, sentences, repairs, and questions.',
          'Read the whole sentence before you choose. Who is doing the action?',
          'When a sentence has a mistake, touch the wrong word. If a helper is missing, touch the gap.',
          'Look carefully: the girls are reading books. They are not doing homework in this picture.',
          'If you need help, ask for it. We can look at the scheme, try a new example, and come back. There is no hurry.',
          'По-русски: каждый экран — одно небольшое задание. Перед сложными заданиями напоминаем схему; помощь не превращается в самостоятельный успех.'
        ],
        steps: [
          choice('actions-gap-i', 'ROUND 1 of 5 · Helper 1', 'Представь, что ты рисуешь. Выбери помощника.', 'I ___ drawing a picture now.',
            ['am', 'is', 'are'], ['am'], 'draw', 'С I нужен помощник am.', example('Complete: I ___ reading.', ['am'])),
          choice('actions-gap-he', 'ROUND 1 of 5 · Helper 2', 'Выбери помощника по слову He.', 'He ___ watching TV.',
            ['am', 'are', 'is'], ['is'], 'watch', 'С he нужен помощник is.', example('Complete: She ___ drawing.', ['is'])),
          choice('actions-gap-we', 'ROUND 1 of 5 · Helper 3', 'Это мы вместе делаем домашнее задание. Выбери помощника.', 'We ___ doing homework.',
            ['is', 'am', 'are'], ['are'], 'homeworkGroup', 'С we нужен помощник are.', example('Complete: They ___ reading.', ['are'])),
          choice('actions-gap-rabbit', 'ROUND 1 of 5 · Helper 4', 'Один кролик взбирается на коробку. Выбери помощника.', 'The rabbit ___ climbing onto the box.',
            ['are', 'is', 'am'], ['is'], 'rabbitBox', 'Один кролик — it, поэтому is.', example('Complete: The boy ___ watching TV.', ['is'], 'watch')),
          verbInput('actions-ing-draw', 'ROUND 2 of 5 · Word 1', 'draw', 'drawing'),
          verbInput('actions-ing-watch', 'ROUND 2 of 5 · Word 2', 'watch', 'watching'),
          verbInput('actions-ing-do', 'ROUND 2 of 5 · Word 3', 'do', 'doing'),
          verbInput('actions-ing-read', 'ROUND 2 of 5 · Word 4', 'read', 'reading'),
          verbInput('actions-ing-climb', 'ROUND 2 of 5 · Word 5', 'climb', 'climbing'),
          verbInput('actions-ing-write', 'ROUND 2 of 5 · Word 6', 'write', 'writing'),
          build('actions-build-she', 'ROUND 3 of 5 · Sentence 1', 'What is she doing now?', ['She', 'is', 'drawing', 'a', 'picture', 'now'], 'draw',
            example('What is he doing now?', ['He is watching TV now', "He's watching TV now", 'He is watching TV', "He's watching TV"], 'watch')),
          build('actions-build-they', 'ROUND 3 of 5 · Sentence 2', 'What are they doing?', ['They', 'are', 'watching', 'TV'], 'watchGroup',
            example('What are the boys doing?', ['They are playing football', "They're playing football", 'They are playing football now', "They're playing football now"], 'football')),
          build('actions-build-homework', 'ROUND 3 of 5 · Sentence 3', 'Imagine these are your hands. What are you doing?', ['I', 'am', 'doing', 'my', 'homework'], 'homeworkPOV',
            example('Imagine you are reading a book. What are you doing?', ['I am reading a book', "I'm reading a book", 'I am reading', "I'm reading"])),
          { id: 'actions-mistake-missing', type: 'mistake', title: 'ROUND 4 of 5 · Repair 1', instruction: 'Найди место пропущенного помощника: нажми на промежуток, затем выбери исправление.',
            scene: 'watch', words: ['He', 'watching', 'TV', 'now'], errorIndex: -1, corrections: ['am', 'is', 'are'], answer: 'is',
            reminder: 'В утверждении нужны все три части: кто + am/is/are + действие с -ing.',
            explanation: 'Между He и watching не хватает is.', example: example('Complete: She ___ reading now.', ['is']) },
          { id: 'actions-mistake-she', type: 'mistake', title: 'ROUND 4 of 5 · Repair 2', instruction: 'Нажми на неверное слово и выбери исправление.',
            scene: 'draw', words: ['She', 'are', 'drawing', 'a', 'picture'], errorIndex: 1, corrections: ['am', 'is', 'are'], answer: 'is',
            reminder: 'Посмотри на «кто»: I → am; he/she/it → is; you/we/they → are.',
            explanation: 'С She нужен is, а не are.', example: example('Complete: He ___ climbing.', ['is'], 'climb') },
          { id: 'actions-mistake-they', type: 'mistake', title: 'ROUND 4 of 5 · Repair 3', instruction: 'Нажми на неверное слово в вопросе и выбери исправление.',
            words: ['Is', 'they', 'doing', 'homework'], errorIndex: 0, corrections: ['Am', 'Is', 'Are'], answer: 'Are',
            reminder: 'Вопрос: am/is/are + кто + действие с -ing. Для they нужен are.',
            explanation: 'Вопрос к they начинается с Are: Are they doing homework?', example: example('Complete the question: ___ we reading?', ['Are']) },
          choice('actions-question-boy', 'ROUND 5 of 5 · Question 1', 'Посмотри и ответь коротко.', 'Is the boy watching TV?',
            ['Yes, he is.', 'No, he isn’t.'], ['Yes, he is.'], 'watch', 'Он смотрит телевизор, поэтому Yes, he is.',
            example('Is she drawing a picture?', ['Yes, she is'], 'draw')),
          choice('actions-question-girls', 'ROUND 5 of 5 · Question 2', 'Посмотри на девочек: ответь на вопрос, а не просто назови действие.', 'Are the girls doing homework?',
            ['Yes, they are.', 'No, they aren’t.'], ['No, they aren’t.'], 'readingGirls', 'Девочки читают книги, а не делают домашнее задание: No, they aren’t.',
            example('Is he reading a book?', ["No, he isn't", 'No, he is not'], 'watch')),
          oral('actions-girls-oral', 'ROUND 5 of 5 · Tell me instead', 'Скажи, что девочки делают на самом деле.', 'What are they doing?', 'readingGirls',
            { teacher: 'Listen for They are reading books or They’re reading books. Ask once more with support only if needed, and record assisted separately.' }),
          build('actions-extra-builder', 'Extra challenge · Another sentence', 'What is he doing now?', ['He', 'is', 'climbing', 'a', 'tree', 'now'], 'benClimb',
            example('What is she doing now?', ['She is drawing a picture now', "She's drawing a picture now", 'She is drawing a picture', "She's drawing a picture"], 'draw'),
            { optionalMinutes: 1 })
        ]
      },
      {
        id: 'week', title: 'My Week', minutes: 7,
        teacher: [
          'Let us open our week! Touch a day, look at the spelling, and say it with me. Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.',
          'Wednesday sounds like WENZ-day. Listen to Thursday and Saturday carefully. If the browser voice is unavailable, I will say every word for you.',
          'What comes after Tuesday? What comes before Friday? What comes after Saturday?',
          'On Monday means в понедельник. On Mondays and every Monday mean по понедельникам or каждый понедельник. Now means сейчас.',
          'I watch TV on Mondays. I am watching TV now. We are only noticing a regular day and an action now; we are not starting another grammar lesson.',
          'По-русски: пять раундов — дни, порядок, соседи дня, действия недели, привычка или сейчас. Названия дней пишем с большой буквы.'
        ],
        steps: [
          { id: 'week-calendar', type: 'calendar', title: 'ROUND 1 of 5 · Seven days', instruction: 'Нажми на каждый день: прочитай крупное слово и повтори произношение за учителем.', items: [
            { word: 'Monday', translation: 'понедельник', pronunciation: '/ˈmʌn.deɪ/ — МАН-дэй' },
            { word: 'Tuesday', translation: 'вторник', pronunciation: '/ˈtjuːz.deɪ/ — ТЬЮЗ-дэй' },
            { word: 'Wednesday', translation: 'среда', pronunciation: '/ˈwenz.deɪ/ — УЭНЗ-дэй; d не читаем' },
            { word: 'Thursday', translation: 'четверг', pronunciation: '/ˈθɜːz.deɪ/ — ТЕРЗ-дэй; th: язык между зубами' },
            { word: 'Friday', translation: 'пятница', pronunciation: '/ˈfraɪ.deɪ/ — ФРАЙ-дэй' },
            { word: 'Saturday', translation: 'суббота', pronunciation: '/ˈsæt.ə.deɪ/ — СЭ-тэ-дэй' },
            { word: 'Sunday', translation: 'воскресенье', pronunciation: '/ˈsʌn.deɪ/ — САН-дэй' }
          ] },
          { id: 'week-order', type: 'order', title: 'ROUND 2 of 5 · Build the week', instruction: 'Поставь все семь дней от понедельника до воскресенья. Можно перетаскивать или нажимать.',
            words: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            reminder: 'Начинаем с Monday. После каждого дня идёт следующий день недели.',
            explanation: 'Порядок недели: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.',
            example: example('What day comes after Monday?', ['Tuesday']) },
          choice('week-after-tuesday', 'ROUND 3 of 5 · Next day 1', 'Выбери день, который идёт после Tuesday.', 'What day comes after Tuesday?',
            ['Thursday', 'Wednesday', 'Monday'], ['Wednesday'], null, 'После Tuesday идёт Wednesday.', example('What day comes after Monday?', ['Tuesday'])),
          choice('week-before-friday', 'ROUND 3 of 5 · Previous day', 'Выбери день, который идёт перед Friday.', 'What day comes before Friday?',
            ['Saturday', 'Wednesday', 'Thursday'], ['Thursday'], null, 'Перед Friday стоит Thursday.', example('What day comes before Tuesday?', ['Monday'])),
          choice('week-after-saturday', 'ROUND 3 of 5 · Next day 2', 'Выбери день, который идёт после Saturday.', 'What day comes after Saturday?',
            ['Sunday', 'Friday', 'Thursday'], ['Sunday'], null, 'После Saturday идёт Sunday.', example('What day comes after Thursday?', ['Friday'])),
          { id: 'week-activities', type: 'activityPairs', title: 'ROUND 4 of 5 · Eight activities', instruction: 'Открой каждую пару: обычное название действия и форма с -ing.',
            body: '<p><strong>on Monday</strong> — в понедельник; <strong>on Mondays</strong> — по понедельникам; <strong>every Monday</strong> — каждый понедельник; <strong>now</strong> — сейчас.</p><p>В календаре у одного дня может быть несколько действий. Читаем пары, не учим новое время.</p>', items: [
              { day: 'Monday', base: 'watch TV', ing: 'watching TV', scene: 'watch' },
              { day: 'Tuesday', base: 'do homework', ing: 'doing homework', scene: 'homework' },
              { day: 'Wednesday', base: 'read a book', ing: 'reading a book', scene: 'read' },
              { day: 'Thursday', base: 'draw a picture', ing: 'drawing a picture', scene: 'draw' },
              { day: 'Friday', base: 'play football', ing: 'playing football', scene: 'football' },
              { day: 'Saturday', base: 'ride a bike', ing: 'riding a bike', scene: 'bike' },
              { day: 'Sunday', base: 'listen to music', ing: 'listening to music', scene: 'music' },
              { day: 'Sunday', base: 'play computer games', ing: 'playing computer games', scene: 'games' }
            ] },
          teach('week-now-contrast', 'ROUND 5 of 5 · A usual day or NOW?', 'Сравни только два смысла: обычно и сейчас.',
            '<p><strong>I watch TV on Mondays.</strong> — Я смотрю телевизор по понедельникам: это привычка.</p><p><strong>I am watching TV now.</strong> — Я смотрю телевизор сейчас: действие идёт в эту минуту.</p><p>Подсказка смысла: <strong>on Mondays / every Monday</strong> — регулярно; <strong>now</strong> — прямо сейчас. Наше главное правило сегодня — am/is/are + -ing для «сейчас».</p>', { scene: 'watch' }),
          choice('week-reading-now', 'ROUND 5 of 5 · Happening now', 'Девочка на картинке читает прямо сейчас. Выбери подходящее предложение.', 'What is happening now?',
            ['She reads books on Mondays.', 'She is reading a book now.'], ['She is reading a book now.'], 'read',
            'Now означает сейчас: she + is + reading.', example('Imagine you are watching TV right now. Write a sentence with I.', ['I am watching TV now', "I'm watching TV now", 'I am watching TV', "I'm watching TV"], 'watch')),
          choice('week-friday-football', 'ROUND 5 of 5 · Every Friday', 'Календарь показывает повторение по пятницам, а не действие в эту минуту.', 'Choose the regular Friday activity.',
            ['He plays football on Fridays.', 'He is playing football now.'], ['He plays football on Fridays.'], 'fridayFootball',
            'On Fridays означает по пятницам: здесь говорим о регулярном дне, не о now.',
            example('Choose the words for «каждый понедельник»: every ___', ['Monday'])),
          oral('week-sunday-oral', 'ROUND 5 of 5 · Your Sunday', 'Расскажи устно об одном своём занятии по воскресеньям. Учитель может помочь со словами.', 'What do you do on Sundays?', null,
            { teacher: 'Accept a simple activity or a short sentence such as I ride a bike on Sundays. Do not introduce a new grammar topic.' }),
          input('week-extra-spelling', 'Extra week · Spell a day', 'Дополнительное задание: напиши день полностью по смыслу фразы.', 'I listen to music every ___ . (в среду)',
            ['Wednesday'], null, 'Wednesday пишем с большой буквы; в произношении d не слышна.',
            example('Write the English day: четверг.', ['Thursday']), { optionalMinutes: 1 })
        ]
      },
      {
        id: 'personality', title: 'Personality Detective', minutes: 5,
        teacher: [
          'Detective time! Listen to the little story. What is the person like? Guess before we reveal the word.',
          'Kind means caring about someone. Helpful means ready to help. A person who helps a friend can be both kind and helpful.',
          'What is he like? This asks about personality, not hair, eyes, clothes or appearance.',
          'Choose a hero. You can say one quality or two: He is kind. He is kind and helpful. She is friendly and funny.',
          'По-русски: обсуждаем характер и поступки. В истории о помощи принимаем и kind, и helpful. Устный вопрос о друге — только по желанию, не часть сокращения маршрута.'
        ],
        steps: [
          { id: 'personality-five-stories', type: 'characters', title: 'Five detective stories', instruction: 'Послушай историю, предположи качество вслух, затем открой слово.',
            body: '<p>Смотрим на поступок, а не на внешность. Сначала предположи слово, потом проверь.</p>', items: [
              { name: 'Tom', word: 'kind', translation: 'добрый', scene: 'kind', story: 'His younger friend drops some books. Tom helps him pick up the fallen books.', contextTranslation: 'Младший друг Тома роняет несколько книг. Том помогает ему поднять упавшие книги.' },
              { name: 'Alex', word: 'rude', translation: 'невежливый, грубый', scene: 'rude', story: 'Alex pushes in front of another child and says, “Go away!” He does not say please or sorry.', contextTranslation: 'Алекс протискивается перед другим ребёнком и говорит: «Уходи!» Он не говорит «пожалуйста» или «извини».' },
              { name: 'Lily', word: 'friendly', translation: 'дружелюбная', scene: 'friendly', story: 'Lily smiles at a new child and says, “Hello! Come and play with us!”', contextTranslation: 'Лили улыбается новому ребёнку и говорит: «Привет! Давай играть с нами!»' },
              { name: 'Sam', word: 'funny', translation: 'смешной, умеет рассмешить', scene: 'funny', story: 'Sam tells a silly joke. His friends laugh and smile.', contextTranslation: 'Сэм рассказывает глупую шутку. Его друзья смеются и улыбаются.' },
              { name: 'Eva', word: 'shy', translation: 'застенчивая', scene: 'shy', story: 'Eva stands in front of her class. She feels nervous about speaking to everyone.', contextTranslation: 'Ева стоит перед своим классом. Она волнуется, когда ей нужно говорить перед всеми.' }
            ] },
          teach('personality-helpful', 'A sixth word · Helpful', 'Сравни два подходящих качества. Оба слова могут описывать одного человека.',
            '<p>Tom helps his younger friend pick up the fallen books.</p><p lang="ru">Том помогает своему младшему другу поднять упавшие книги.</p><p><strong>helpful</strong> — готов помочь, помогает делом.</p><p><strong>kind</strong> — добрый, заботится о другом.</p><p>He is <strong>kind and helpful</strong>. В истории о помощи можно выбрать <strong>kind</strong> или <strong>helpful</strong>: оба ответа подходят.</p>', { scene: 'helpful' }),
          choice('personality-match-help', 'Match 1 · Helping a friend', 'Выбери подходящее качество по поступку. Здесь подходят два ответа.', 'He helps his friend pick up books. What is he like?',
            ['kind', 'rude', 'helpful', 'shy'], ['kind', 'helpful'], 'helpful', 'Помощь другу показывает и доброту (kind), и готовность помочь (helpful).',
            example('A boy tells a joke and makes his friends laugh. What is he like?', ['funny'], 'funny', { contextTranslation: 'Мальчик рассказывает шутку, и его друзья смеются.' }), { contextTranslation: 'Он помогает своему другу поднять книги.' }),
          choice('personality-match-rude', 'Match 2 · No polite words', 'Выбери качество по этой истории.', 'He pushes in and says “Go away!” What is he like?',
            ['friendly', 'rude', 'funny', 'shy'], ['rude'], 'rude', 'Грубые слова и невежливый поступок — rude.',
            example('She welcomes a new child with a smile. What is she like?', ['friendly'], 'friendly', { contextTranslation: 'Она с улыбкой встречает нового ребёнка.' }), { contextTranslation: 'Он протискивается вперёд и говорит: «Уходи!»' }),
          choice('personality-match-funny', 'Match 3 · A silly joke', 'Выбери качество по этой истории.', 'He tells a silly joke. His friends laugh. What is he like?',
            ['shy', 'kind', 'funny', 'rude'], ['funny'], 'funny', 'Тот, кто умеет рассмешить, — funny.',
            example('He pushes in and says “Go away!” What is he like?', ['rude'], 'rude', { contextTranslation: 'Он протискивается вперёд и говорит: «Уходи!»' }), { contextTranslation: 'Он рассказывает глупую шутку. Его друзья смеются.' }),
          choice('personality-match-friendly', 'Match 4 · Welcome!', 'Выбери качество по этой истории.', 'She smiles and invites a new child to play. What is she like?',
            ['rude', 'shy', 'friendly', 'funny'], ['friendly'], 'friendly', 'Приветливость к новому знакомому — friendly.',
            example('She feels nervous about speaking to new children. What is she like?', ['shy'], 'shy', { contextTranslation: 'Она волнуется, когда ей нужно разговаривать с новыми детьми.' }), { contextTranslation: 'Она улыбается и приглашает нового ребёнка поиграть.' }),
          choice('personality-match-shy', 'Match 5 · A quiet hello', 'Выбери качество по этой истории.', 'She feels nervous about speaking in front of her class. What is she like?',
            ['funny', 'friendly', 'rude', 'shy'], ['shy'], 'shy', 'Когда человек стесняется заговорить, он shy.',
            example('He tells a joke and makes his friends laugh. What is he like?', ['funny'], 'funny', { contextTranslation: 'Он рассказывает шутку, и его друзья смеются.' }), { contextTranslation: 'Она волнуется, когда ей нужно говорить перед своим классом.' }),
          teach('personality-question-meaning', 'What’s he like?', 'Этот вопрос — о характере. Прочитай вопрос и короткий ответ.',
            '<p><strong>What’s he like?</strong> = What is he like? — Какой он по характеру?</p><p><strong>What’s she like?</strong> — Какая она по характеру?</p><p>He’s kind. She’s friendly. He’s funny and helpful.</p><p>Это не вопрос о внешности и не вопрос «что он любит».</p>'),
          { id: 'personality-describe-hero', type: 'describe', title: 'Choose a hero · One or two qualities', instruction: 'Выбери героя и одно или два качества. Прочитай получившееся описание вслух.',
            heroes: [
              { name: 'Mia', subject: 'She', scene: 'drawTrain' },
              { name: 'Ben', subject: 'He', scene: 'benClimb' },
              { name: 'Tom', subject: 'He', scene: 'tomHelp' }
            ], adjectives: ['kind', 'rude', 'friendly', 'funny', 'shy', 'helpful'],
            body: '<p>Это твоё описание героя: можно выбрать одно качество или соединить два словом <strong>and</strong>.</p>',
            teacher: 'Ask why the learner chose the qualities. This is a supported description, not a fixed-answer personality test.' },
          oral('personality-friend-oral', 'If you would like · Your friend', 'По желанию расскажи о друге: одно или два качества. Можно пропустить устный вопрос.', 'What is your friend like?', null,
            { teacher: 'This conversational question is optional for the learner in either route; it is NOT one of the four 45-minute omissions. The learner may continue without a manual assessment or automatic success.' })
        ]
      },
      {
        id: 'adventure', title: 'The Big Adventure', minutes: 6,
        teacher: [
          'Our team is Mia, Ben and Tom. Follow their adventure one little scene at a time!',
          'Mia is drawing. What is in her picture? A train! Next, our rabbit has disappeared. Can you find it?',
          'Look up: Ben is climbing a tree. Now Tom helps his younger friend with the books. Is he kind?',
          'Helping is a useful extra word: help, helping. He is helping his friend. You can try saying it with me.',
          'It is Tuesday in our story. What day comes next? Now it is your turn: write two sentences, one at a time. You can answer aloud if writing is difficult.',
          'По-русски: шесть сцен обязательны в обоих маршрутах, включая оба самостоятельных ответа. Только отдельный дополнительный бонус занимает две минуты и убирается в маршруте 45 минут.'
        ],
        steps: [
          choice('adventure-mia-sentence', 'SCENE 1 of 6 · Mia’s picture', 'Выбери предложение, которое подходит к Мие.', 'What is Mia doing now?',
            ['She is drawing a picture.', 'He is watching TV.', 'She are drawing a picture.'], ['She is drawing a picture.'], 'drawTrain',
            'Mia — she: She is drawing a picture.', example('What is Ben doing?', ['He is climbing a tree', "He's climbing a tree", 'He is climbing a tree now', "He's climbing a tree now"], 'benClimb')),
          oral('adventure-mia-train', 'SCENE 1 of 6 · In the picture', 'Назови устно, что Мия рисует.', 'What is she drawing?', 'drawTrain',
            { teacher: 'Accept A train or It is a train. Keep Mia’s drawing visible; record the learner’s oral recall.' }),
          findRabbit('adventure-rabbit-find', 'SCENE 2 of 6 · The missing rabbit'),
          location('adventure-rabbit-location', 'SCENE 2 of 6 · Where is it?'),
          choice('adventure-ben-action', 'SCENE 3 of 6 · Ben in the tree', 'Выбери действие Бена по картинке.', 'What is Ben doing?',
            ['He is watching TV.', 'He is climbing a tree.', 'He is doing homework.'], ['He is climbing a tree.'], 'benClimb',
            'Ben — he, действие — climbing: He is climbing a tree.',
            example('What is Mia doing?', ['She is drawing a train', "She's drawing a train", 'She is drawing a train now', "She's drawing a train now"], 'drawTrain')),
          oral('adventure-tom-helping', 'SCENE 4 of 6 · Tell the action', 'Попробуй сказать, что делает Том. Можно попросить новое слово у учителя.', 'What is Tom doing?', 'tomHelp',
            { body: '<p>Новое слово по желанию: <strong>help → helping</strong> — помогать → помогает сейчас.</p>',
              teacher: 'Optional vocabulary support: say helping if needed. Listen for He is helping his friend or He’s helping his friend. Record assisted if the sentence was modelled first; do not omit the scene in the short route.' }),
          choice('adventure-next-day', 'SCENE 5 of 6 · Tomorrow', 'В истории сегодня Tuesday. Какой день будет следующим?', 'Today is Tuesday. What day comes next?',
            ['Thursday', 'Monday', 'Wednesday'], ['Wednesday'], 'calendarTuesday', 'После Tuesday идёт Wednesday.',
            example('Today is Friday. What day comes next?', ['Saturday'])),
          input('adventure-yourturn-tv', 'SCENE 6 of 6 · Your Turn 1', 'Напиши целое предложение по картинке. Если писать трудно, ответь устно учителю.', 'What are they doing?',
            ['They are watching TV', "They're watching TV", 'They are watching TV now', "They're watching TV now", 'They are watching television', "They're watching television", 'They are watching television now', "They're watching television now", 'The children are watching TV', 'The children are watching TV now', 'The children are watching television', 'The children are watching television now'],
            'watchGroup', 'Несколько детей — they are; watch превращается в watching.',
            example('What are the boys doing?', ['They are playing football', "They're playing football", 'They are playing football now', "They're playing football now", 'The boys are playing football'], 'football'),
            { oralAllowed: true, reminder: 'Проверь: кто? → am/is/are → действие с -ing. На картинке несколько детей; нужен помощник для множественного числа.' }),
          input('adventure-yourturn-homework', 'SCENE 6 of 6 · Your Turn 2', 'Напиши ещё одно целое предложение по новой картинке. Можно ответить устно учителю.', 'What is she doing?',
            ['She is doing her homework', "She's doing her homework", 'She is doing homework', "She's doing homework", 'She is doing her homework now', "She's doing her homework now", 'She is doing homework now', "She's doing homework now", 'The girl is doing her homework', 'The girl is doing homework', 'The girl is doing her homework now', 'The girl is doing homework now'],
            'homework', 'Одна девочка — she is; do превращается в doing. Doing homework и doing her homework подходят.',
            example('What is Mia doing?', ['She is drawing a picture', "She's drawing a picture", 'She is drawing a picture now', "She's drawing a picture now"], 'draw'),
            { oralAllowed: true, reminder: 'Кто? → помощник → действие с -ing → подробности. Проверь, что описываешь именно эту картинку.' }),
          input('adventure-bonus-combined', 'BONUS · Two clues together', 'Дополнительный бонус: соедини день и действие в одном ответе. Назови день после Saturday, затем одним предложением опиши Мию. Раздели части точкой.',
            'What day comes after Saturday? What is Mia doing?',
            ['Sunday. She is drawing a train', "Sunday. She's drawing a train", 'Sunday. She is drawing a train now', "Sunday. She's drawing a train now", 'Sunday. Mia is drawing a train', 'Sunday. Mia is drawing a train now', 'Sunday. She is drawing', "Sunday. She's drawing", 'Sunday. She is drawing now', "Sunday. She's drawing now"],
            'drawTrain', 'После Saturday идёт Sunday; для Мии используем she is + drawing.',
            example('What day comes after Monday? What is Ben doing? Write the day, a full stop, and the sentence.',
              ['Tuesday. He is climbing a tree', "Tuesday. He's climbing a tree", 'Tuesday. Ben is climbing a tree', 'Tuesday. He is climbing a tree now', "Tuesday. He's climbing a tree now"], 'benClimb'),
            { optionalMinutes: 2, oralAllowed: true, reminder: 'Это дополнительное объединение двух знакомых задач. Сначала назови соседний день, затем проверь схему предложения: кто + am/is/are + -ing.' })
        ]
      },
    ]
  };
})();
