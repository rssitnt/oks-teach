(() => {
  'use strict';

  const images = {
    'animal-cow': ['images/animal-cow.webp', 'Мишка в жилетке с ромбами и пятнистая корова на зелёном лугу', 800, 597],
    'animal-horse': ['images/animal-horse.webp', 'Мишка в жилетке с ромбами и рыжая лошадь у деревянной изгороди', 800, 597],
    'animal-sheep': ['images/animal-sheep.webp', 'Мишка в жилетке с ромбами и белая пушистая овца на лугу', 800, 597],
    'animal-pig': ['images/animal-pig.webp', 'Мишка в жилетке с ромбами и розовая свинья у деревянного загона', 800, 597],
    'animal-goat': ['images/animal-goat.webp', 'Мишка в жилетке с ромбами и серо-белая коза с рожками на лугу', 800, 597],
    'animal-hen': ['images/animal-hen.webp', 'Мишка в жилетке с ромбами и рыжая курица около курятника', 800, 597],
    'animal-duck': ['images/animal-duck.webp', 'Мишка в жилетке с ромбами и жёлтая утка у пруда', 800, 597],
    'animal-donkey': ['images/animal-donkey.webp', 'Мишка в жилетке с ромбами и серый осёл с длинными ушами у сарая', 800, 597],
    'product-milk': ['images/product-milk.webp', 'Мишка за деревянным столом: кувшин и стакан молока, рядом корова', 800, 597],
    'product-eggs': ['images/product-eggs.webp', 'Мишка держит корзинку с яйцами, рядом курица', 800, 597],
    'product-wool': ['images/product-wool.webp', 'Мишка вяжет полосатый шарф из цветных клубков шерсти, рядом пушистая овца', 800, 597],
    'season-spring': ['images/season-spring.webp', 'Весна: мишка среди цветущих деревьев и цветов, над лугом радуга', 800, 597],
    'season-summer': ['images/season-summer.webp', 'Лето: мишка на берегу моря, рядом арбуз и спасательный круг, светит солнце', 800, 597],
    'season-autumn': ['images/season-autumn.webp', 'Осень: мишка с красным зонтиком в резиновых сапогах среди жёлтых листьев и луж', 800, 597],
    'season-winter': ['images/season-winter.webp', 'Зима: мишка в шапке и шарфе в снегу, рядом снеговик и санки', 800, 597],
    'much-cows': ['images/much-cows.webp', 'Много коров и телят пасутся на большом лугу, мишка машет рукой, вдали красный амбар', 800, 597],
    'much-milk': ['images/much-milk.webp', 'Мишка возле деревянного ведра и большого кувшина, полных молока, позади корова', 800, 597],
    'much-apples': ['images/much-apples.webp', 'Мишка в яблоневом саду среди ящиков, полных красных яблок', 800, 597],
    'much-flour': ['images/much-flour.webp', 'Мишка в кухне замешивает тесто, вокруг облако белой муки и мешки с мукой', 800, 597],
    'goldi-wood': ['images/goldi-wood.webp', 'Златовласка с рюкзачком идёт по лесной тропинке, вдали домик медведей', 800, 597],
    'goldi-house': ['images/goldi-house.webp', 'Три медведя — мама, папа и малыш — у своего лесного домика', 800, 597],
    'goldi-porridge': ['images/goldi-porridge.webp', 'Три медведя за столом, перед каждым тарелка горячей каши с паром', 800, 597],
    'goldi-bears': ['images/goldi-bears.webp', 'Семья медведей за завтраком у окна в бревенчатом доме', 800, 597],
    'hero-lesson5': ['images/hero-lesson5.webp', 'Три мишки — коричневый, серый и кремовый — машут рукой на весеннем лугу, на фоне красный амбар', 1280, 714]
  };
  const pic = (key, word, ru) => '<figure class="pic-card"><img src="' + images[key][0] + '" alt="' + images[key][1] + '" width="' + images[key][2] + '" height="' + images[key][3] + '" loading="lazy" decoding="async"><figcaption lang="en">' + word + '<small>' + ru + '</small></figcaption></figure>';
  const grid = cards => '<div class="pic-grid">' + cards.join('') + '</div>';
  const hero = () => '<figure class="hero-pic"><img src="' + images['hero-lesson5'][0] + '" alt="' + images['hero-lesson5'][1] + '" width="' + images['hero-lesson5'][2] + '" height="' + images['hero-lesson5'][3] + '" decoding="async"></figure>';
  const teach = (id, title, body, extra = {}) => ({ id, type: 'teach', title, body, ...extra });
  const info = (id, title, body, links, extra = {}) => ({ id, type: 'info', title, body, links, ...extra });
  const choice = (id, title, prompt, options, answer, hint, explain, extra = {}) => ({
    id, type: 'choice', title, instruction: 'Выбери один ответ.', prompt, options, answers: [answer], hint, explain, ...extra
  });
  const input = (id, title, prompt, answers, hint, explain, extra = {}) => ({
    id, type: 'input', title, instruction: 'Напиши ответ по-английски.', prompt, answers, hint, explain, ...extra
  });
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

  window.Lesson5Data = {
    version: 1,
    images,
    stages: [
      {
        id: 'animals', title: 'Домашние животные', minutes: 10,
        steps: [
          teach('animals-farm', 'On the farm',
            hero() + '<p><strong lang="en">A farm</strong> — ферма. Кто живёт на ферме? Читай слова вслух.</p>' + grid([
              pic('animal-cow', 'cow', 'корова'), pic('animal-horse', 'horse', 'лошадь'), pic('animal-sheep', 'sheep', 'овца'), pic('animal-pig', 'pig', 'свинья'),
              pic('animal-goat', 'goat', 'коза'), pic('animal-hen', 'hen', 'курица'), pic('animal-duck', 'duck', 'утка'), pic('animal-donkey', 'donkey', 'осёл')]) +
            '<p>Эти слова ты уже знаешь: <strong lang="en">cat</strong> — кошка, <strong lang="en">dog</strong> — собака, <strong lang="en">rabbit</strong> — кролик.</p>'),
          teach('animals-give', 'What does it give?',
            '<p>Животные на ферме нам что-то дают.</p>' + grid([
              pic('product-milk', 'A cow gives us milk.', 'Корова даёт нам молоко.'), pic('product-eggs', 'A hen gives us eggs.', 'Курица даёт нам яйца.'), pic('product-wool', 'A sheep gives us wool.', 'Овца даёт нам шерсть.')]) +
            '<p><strong lang="en">wool</strong> — шерсть. Из неё делают тёплые вещи.</p>'),
          match('animals-match', 'Какое это животное?', 'Соедини русское слово с английским.', ['sheep', 'donkey', 'cow', 'duck', 'pig', 'horse', 'hen', 'goat'], [
            ['корова', 'cow'], ['лошадь', 'horse'], ['овца', 'sheep'], ['свинья', 'pig'], ['коза', 'goat'], ['курица', 'hen'], ['утка', 'duck'], ['осёл', 'donkey']],
            'Вспомни карточки: cow, horse, sheep, pig, goat, hen, duck, donkey.', 'корова — cow, лошадь — horse, овца — sheep, свинья — pig, коза — goat, курица — hen, утка — duck, осёл — donkey.'),
          match('animals-give-match', 'Что оно даёт?', 'Выбери, что даёт животное.', ['wool', 'milk', 'eggs'], [
            ['A cow gives us ...', 'milk'], ['A hen gives us ...', 'eggs'], ['A sheep gives us ...', 'wool']],
            'Корова — молоко, курица — яйца, овца — шерсть.', 'A cow gives us milk. A hen gives us eggs. A sheep gives us wool.'),
          input('animals-input', 'Что даёт курица?', 'A hen gives us ___ .', ['eggs', 'A hen gives us eggs'],
            'Курица несёт яйца. Во множественном числе: eggs.', 'A hen gives us eggs. — Курица даёт нам яйца.', { instruction: 'Впиши слово по-английски.' }),
          oral('animals-oral', 'Какое животное ты любишь?', 'Which animal do you like? — I like horses.',
            'Скажи: I like cows. I like horses. Можно добавить, что оно даёт: A cow gives us milk.')
        ]
      },
      {
        id: 'seasons', title: 'Времена года', minutes: 10,
        steps: [
          teach('seasons-four', 'Four seasons',
            '<p><strong lang="en">A season</strong> — время года. Их четыре, и они идут по кругу.</p>' + grid([
              pic('season-spring', 'spring', 'весна'), pic('season-summer', 'summer', 'лето'), pic('season-autumn', 'autumn', 'осень'), pic('season-winter', 'winter', 'зима')]) +
            '<p lang="en"><strong>spring → summer → autumn → winter</strong></p>'),
          teach('seasons-weather', 'In summer it is hot.',
            '<ul><li><strong lang="en">In summer it is hot.</strong> — Летом жарко. <strong lang="en">I like swimming in summer.</strong></li><li><strong lang="en">In spring it is warm.</strong> — Весной тепло. <strong lang="en">There are flowers.</strong> — Есть цветы.</li><li><strong lang="en">In autumn there is rain.</strong> — Осенью идёт дождь. <strong lang="en">There are yellow leaves.</strong></li><li><strong lang="en">In winter it is cold.</strong> — Зимой холодно. <strong lang="en">There is snow.</strong> — Есть снег.</li></ul><p><strong lang="en">leaves</strong> — листья (один лист — <span lang="en">a leaf</span>). <strong lang="en">hot</strong> — жарко, <strong lang="en">warm</strong> — тепло, <strong lang="en">cold</strong> — холодно.</p>' + grid([
              pic('season-spring', 'In spring it is warm.', 'Весной тепло.'), pic('season-summer', 'In summer it is hot.', 'Летом жарко.'), pic('season-autumn', 'In autumn there is rain.', 'Осенью идёт дождь.'), pic('season-winter', 'In winter it is cold.', 'Зимой холодно.')])),
          build('seasons-build', 'По порядку', ['spring', 'summer', 'autumn', 'winter'],
            'Начни с весны. После лета идёт осень.', 'Spring, summer, autumn, winter — весна, лето, осень, зима.',
            { instruction: 'Собери времена года по порядку, начни с весны.' }),
          sort('seasons-sort', 'Лето или зима?', 'Выбери, к какому времени года это относится.', [
            { id: 'summer', label: 'Summer', note: '' },
            { id: 'winter', label: 'Winter', note: '' }], [
            ['It is hot.', 'summer'], ['It is cold.', 'winter'], ['I like swimming.', 'summer'], ['There is snow.', 'winter'], ['We eat ice cream.', 'summer'], ['We play in the snow.', 'winter']],
            'Hot и swimming — это лето. Cold и snow — это зима.', 'Летом жарко, мы плаваем и едим мороженое. Зимой холодно, есть снег.',
            { body: grid([pic('season-summer', 'summer', 'лето'), pic('season-winter', 'winter', 'зима')]) }),
          match('seasons-match', 'Какое время года?', 'Соедини предложение с временем года.', ['winter', 'spring', 'autumn', 'summer'], [
            ['There are flowers.', 'spring'], ['It is hot.', 'summer'], ['There are yellow leaves.', 'autumn'], ['There is snow.', 'winter']],
            'Flowers — весной, leaves — осенью, hot — летом, snow — зимой.', 'Цветы — spring, жарко — summer, жёлтые листья — autumn, снег — winter.',
            { body: grid([pic('season-spring', 'spring', 'весна'), pic('season-summer', 'summer', 'лето'), pic('season-autumn', 'autumn', 'осень'), pic('season-winter', 'winter', 'зима')]) }),
          gaps('seasons-gaps', 'Впиши слово', 'Впиши слово, подсказка в скобках. Можно писать всё предложение.', [
            ['In summer it is', 'hot / cold', '.', ['hot']],
            ['In winter it is', 'hot / cold', '.', ['cold']],
            ['In spring there are', 'flowers / snow', '.', ['flowers']],
            ['In autumn there are yellow', 'leaf / leaves', '.', ['leaves']],
            ['I like', 'swim', 'in summer.', ['swimming']]],
            'Прочитай всё предложение и выбери слово по смыслу. После like — глагол с -ing.', 'In summer it is hot. In winter it is cold. In spring there are flowers. In autumn there are yellow leaves. I like swimming in summer.'),
          oral('seasons-oral', 'Твоё любимое время года', 'What is your favourite season? — My favourite season is summer.',
            'Скажи: My favourite season is ... In ... it is ... I like ...ing in ... Например: I like swimming in summer.')
        ]
      },
      {
        id: 'much', title: 'Much, many, a lot of', minutes: 13,
        steps: [
          teach('much-count', 'Считаем или нет?',
            '<p>Помнишь урок про еду? Одни слова можно посчитать, другие — нет.</p><ul><li><strong>Считаем:</strong> <span lang="en">eggs, apples, tomatoes, cows, horses</span> — их можно посчитать, их много (во множественном числе).</li><li><strong>Не считаем:</strong> <span lang="en">milk, sugar, juice, flour</span> — только some milk, без -s.</li></ul>' + grid([
              pic('much-cows', 'cows', 'коровы — считаем'), pic('much-apples', 'apples', 'яблоки — считаем'), pic('much-milk', 'milk', 'молоко — не считаем'), pic('much-flour', 'flour', 'мука — не считаем')])),
          sort('much-sort', 'Считаем или нет?', 'Выбери, можно ли это посчитать.', [
            { id: 'count', label: 'Можно посчитать', note: '' },
            { id: 'uncount', label: 'Не считаем', note: '' }], [
            ['eggs', 'count'], ['milk', 'uncount'], ['cows', 'count'], ['sugar', 'uncount'], ['apples', 'count'], ['juice', 'uncount'], ['horses', 'count'], ['flour', 'uncount']],
            'Яйца, яблоки, коров и лошадей можно посчитать. Молоко, сахар, сок и муку — нет.', 'Считаем: eggs, cows, apples, horses. Не считаем: milk, sugar, juice, flour.'),
          teach('much-rule', 'Many и much',
            '<ul><li><strong lang="en">many</strong> + то, что считаем (много): <strong lang="en">many eggs, many cows, many apples</strong></li><li><strong lang="en">much</strong> + то, что не считаем: <strong lang="en">much milk, much sugar, much juice, much flour</strong></li></ul><p>Вопросы: <strong lang="en">How many cows are there on the farm?</strong> — Сколько коров? <strong lang="en">How much milk does the cow give?</strong> — Сколько молока?</p>' + grid([
              pic('much-cows', 'many cows', 'много коров'), pic('much-apples', 'many apples', 'много яблок'), pic('much-milk', 'much milk', 'много молока'), pic('much-flour', 'much flour', 'много муки')])),
          teach('much-alot', 'A lot of',
            '<p><strong lang="en">a lot of</strong> — много. Подходит и к тем словам, что считаем, и к тем, что не считаем. В обычных предложениях говорим a lot of.</p><ul><li><strong lang="en">There are a lot of cows on the farm.</strong></li><li><strong lang="en">There is a lot of milk in the fridge.</strong></li></ul>' + grid([
              pic('much-cows', 'There are a lot of cows on the farm.', 'На ферме много коров.'), pic('much-milk', 'There is a lot of milk.', 'Много молока.')]) + '<p>Когда «мало» или «нет», чаще говорим many и much:</p><ul><li><strong lang="en">There aren’t many horses.</strong> — Лошадей немного.</li><li><strong lang="en">There isn’t much milk.</strong> — Молока немного.</li><li><strong lang="en">Do you eat many apples? Do you drink much milk?</strong></li></ul>'),
          choice('much-choice-many', 'Many или much?', 'How ___ eggs are there in the box?', ['much', 'many', 'a lot of'], 'many',
            'Eggs можно посчитать. Для того, что считаем, в вопросе — many.', 'How many eggs are there in the box? — Сколько яиц в коробке? Яйца считаем, значит many.'),
          choice('much-choice-much', 'Many или much?', 'There isn’t ___ milk in the jug.', ['many', 'much', 'a'], 'much',
            'Milk не считаем — это much. В отрицании (isn’t) говорим much.', 'There isn’t much milk in the jug. — В кувшине мало молока. Milk не считаем, значит much.'),
          input('much-input-much', 'Сколько молока?', 'How ___ milk does the cow give?', ['much', 'How much', 'How much milk does the cow give'],
            'Milk не считаем. Сколько молока? — How much milk?', 'How much milk does the cow give? — Сколько молока даёт корова?', { instruction: 'Впиши much или many.', scene: 'much-milk' }),
          input('much-input-neg', 'На ферме', 'There aren’t ___ horses on this farm.',
            ['many', 'a lot of', 'There aren’t many horses on this farm', 'There aren’t a lot of horses on this farm', 'There are not many horses on this farm', 'There are not a lot of horses on this farm'],
            'Horses можно посчитать. В отрицании подойдёт many (или a lot of).', 'There aren’t many horses on this farm. — На этой ферме мало лошадей.', { instruction: 'Впиши many или a lot of. Подойдут оба.' }),
          input('much-input-is', 'В холодильнике', 'There ___ a lot of milk in the fridge.',
            ['is', 'There is a lot of milk in the fridge', 'There’s a lot of milk in the fridge', 'There’s'],
            'Milk не считаем: There is.', 'There is a lot of milk in the fridge. — В холодильнике много молока.', { instruction: 'Впиши is или are.' }),
          build('much-build', 'Собери вопрос', ['how', 'many', 'cows', 'are', 'there', 'on', 'the', 'farm'],
            'Сначала How many, потом то, что считаем, и are there. В конце — on the farm.', 'How many cows are there on the farm? — Сколько коров на ферме?', { scene: 'much-cows' }),
          gaps('much-gaps', 'Much, many, a lot of', 'Впиши слово, подсказка в скобках. Можно писать всё предложение.', [
            ['How', 'much / many', 'cows are there on the farm?', ['many']],
            ['How', 'much / many', 'milk does the cow give?', ['much']],
            ['There aren’t', 'much / many', 'horses.', ['many', 'a lot of']],
            ['There isn’t', 'much / many', 'sugar.', ['much', 'a lot of']],
            ['There are', 'a lot of / much', 'hens on the farm.', ['a lot of']]],
            'Cows и horses считаем — many. Milk и sugar не считаем — much. В обычном предложении — a lot of.', 'How many cows are there on the farm? How much milk does the cow give? There aren’t many horses. There isn’t much sugar. There are a lot of hens on the farm.'),
          oral('much-oral', 'Говорим про ферму и еду', 'How many cows are there on the farm? — There are a lot of cows.',
            'Ответь: There are a lot of cows. There aren’t many horses. Потом спроси: How much milk does the cow give? Do you eat many apples? Do you drink much milk? — Yes, I do. / No, I don’t.', { scene: 'much-cows' })
        ]
      },
      {
        id: 'book', title: 'Учебник стр. 34–36', minutes: 12,
        steps: [
          teach('book-intro', 'Что читаем: Goldilocks and the Three Bears',
            '<p>Учебник, стр. 34–36. <strong lang="en">Goldilocks and the Three Bears</strong> — «Златовласка и три медведя». Сначала песенка, потом сценка, потом задания.</p><p>Новые слова:</p><ul class="word-list"><li><strong lang="en">golden</strong> — золотой</li><li><strong lang="en">curls</strong> — кудри</li><li><strong lang="en">naughty</strong> — непослушный</li><li><strong lang="en">lovely</strong> — чудесный</li><li><strong lang="en">wood, woods</strong> — лес</li><li><strong lang="en">walk</strong> — прогулка (<span lang="en">take a walk</span> — пойти погулять)</li><li><strong lang="en">bear</strong> — медведь</li><li><strong lang="en">porridge</strong> — каша</li><li><strong lang="en">pot</strong> — кастрюля</li><li><strong lang="en">hot</strong> — горячий</li><li><strong lang="en">outside</strong> — на улицу, на улице</li><li><strong lang="en">sun</strong> — солнце</li></ul>', { scene: 'goldi-bears' }),
          teach('book-song-1', 'Let’s Sing! — куплеты 1–2',
            '<p>Стр. 34. Читай вслух по куплетам.</p><div class="song-card" lang="en">'
            + '<p>Goldie, Goldie, Goldilocks<br>Is as pretty as can be.<br>Her mother tells her every day:<br>“Now, listen to me!”</p>'
            + '<p class="song-indent">Goldie, Goldie, Goldilocks<br>With long golden curls.<br>Through the wood she takes a walk –<br>The naughty girl!</p></div>', { scene: 'goldi-wood' }),
          teach('book-song-2', 'Let’s Sing! — куплеты 3–4',
            '<p>Продолжаем петь.</p><div class="song-card" lang="en">'
            + '<p>Goldie, Goldie, Goldilocks<br>With long golden curls.<br>Through the wood she takes a walk –<br>The naughty …, the naughty … girl!</p>'
            + '<p class="song-indent">Goldie, Goldie, Goldilocks<br>Is on her way to school.<br>She says, “The woods look lovely!”<br>And she breaks her mother’s rule!</p></div>'),
          teach('book-scene', 'Стр. 35 — сценка',
            '<p>Читаем по ролям: <span lang="en">Narrator</span> — рассказчик, <span lang="en">Daddy</span> — папа, <span lang="en">Mummy</span> — мама.</p><div class="scene-card" lang="en">'
            + '<p><b>Narrator:</b> Now in the wood<br>There live three bears!<br>Mummy, Daddy and Baby.</p>'
            + '<p><b>Daddy:</b> Let’s take a walk.</p>'
            + '<p><b>Narrator:</b> Daddy says …<br>And Mummy says …</p>'
            + '<p><b>Mummy:</b> Well, maybe:<br>I’ve got some porridge<br>In this pot.<br>It’s very nice –<br>But it’s very hot!<br>We can eat it<br>When we all return.<br>Let’s go outside<br>And get some sun!</p></div>', { scene: 'goldi-porridge' }),
          match('book-match', 'Упр. 1. Match and say', 'Соедини слова из упражнения 1 и скажи вслух: golden curls, naughty girl…', ['girl', 'curls', 'porridge', 'woods'], [
            ['golden', 'curls'], ['naughty', 'girl'], ['lovely', 'woods'], ['hot', 'porridge']],
            'Вспомни песенку: golden curls, the naughty girl, the woods look lovely. А что бывает hot в сценке?', 'golden curls — золотые кудри, naughty girl — непослушная девочка, lovely woods — чудесный лес, hot porridge — горячая каша.'),
          gaps('book-gaps', 'Упр. 2. Complete the sentences',
            'Впиши пропущенные слова: в каждом пропуске нужен предлог — to, with, on, through или in. В книге в третьем предложении два пропуска, здесь они стоят отдельными строками.', [
            ['Mother says: “Listen', 'предлог', 'me.”', ['to']],
            ['Goldilocks is a girl', 'предлог', 'long golden curls.', ['with']],
            ['Goldilocks is', 'предлог', 'her way to school.', ['on']],
            ['Goldilocks is on her way', 'предлог', 'school.', ['to']],
            ['Goldilocks takes a walk', 'предлог', 'the woods.', ['through', 'in']],
            ['Three bears live', 'предлог', 'the wood.', ['in']]],
            'Смотри в песенку и сценку: Listen to me. A girl with … curls. On her way to school. Through the wood. Three bears live in the wood.',
            'Mother says: “Listen to me.” Goldilocks is a girl with long golden curls. Goldilocks is on her way to school. Goldilocks takes a walk through the woods (можно и in the woods). Three bears live in the wood.',
            { body: '<div class="exercise-card" lang="en"><p>1 Mother says: “Listen … me.”</p><p>2 Goldilocks is a girl … long golden curls.</p><p>3 Goldilocks is … her way … school.</p><p>4 Goldilocks takes a walk … the woods.</p><p>5 Three bears live … the wood.</p></div>' }),
          oral('book-talk', 'Упр. 3. Talk with your classmate', 'Ответь на вопросы по песенке и сценке.',
            'Ищи ответы в тексте: песенка, первый куплет — вопрос 1; второй куплет — вопрос 2; сценка, первая строка — вопрос 3; Mummy — вопросы 4 и 5. Отвечай полным коротким ответом.',
            { scene: 'goldi-house', body: '<ol class="talk-list" lang="en"><li>What does Goldilocks’ mother tell her every day?</li><li>Where does she take a walk?</li><li>Who lives in the wood?</li><li>What do the bears have for breakfast?</li><li>Why can’t they eat the porridge?</li></ol>' })
        ]
      },
      {
        id: 'school', title: 'Дз из школы', minutes: 15,
        steps: [
          info('school-reserve', 'Школьное дз делаем вместе',
            '<p>Здесь будут задания из школы. Сейчас их ещё нет: когда учитель их получит, они появятся в уроке.</p><p>Пока можно сделать одно из двух:</p><ul><li>повторить любимый этап урока;</li><li>спокойно прочитать Goldilocks вслух.</li></ul>', []),
          oral('school-reading', 'Читаем Goldilocks вслух', 'Read the song and the scene aloud.',
            'Прочитай песенку (стр. 34) и сценку (стр. 35) вслух. Можно по ролям с учителем: Narrator, Daddy, Mummy. Если хочется, выбери любой этап урока и повтори его.')
        ]
      }
    ]
  };
})();
