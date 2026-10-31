/* Lesson four: teacher-guided Spotlight 4 route (food, like + -ing, some/any). Declarative data for lesson.js. Illustrations live in images/ (see assets.json). */
(() => {
  'use strict';

  const GEN = 'images/';
  const images = {
    apple: [GEN + 'food-apple.webp', 'Одно красное яблоко'],
    banana: [GEN + 'food-banana.webp', 'Жёлтый банан'],
    beans: [GEN + 'food-beans.webp', 'Миска фасоли'],
    biscuits: [GEN + 'food-biscuits.webp', 'Стопка золотистого печенья'],
    bread: [GEN + 'food-bread.webp', 'Батон хлеба'],
    butter: [GEN + 'food-butter.webp', 'Пачка жёлтого масла'],
    cheese: [GEN + 'food-cheese.webp', 'Кусок жёлтого сыра'],
    chicken: [GEN + 'food-chicken.webp', 'Жареная курица на тарелке'],
    coconut: [GEN + 'food-coconut.webp', 'Кокос и половинка кокоса с белой мякотью'],
    cupboard: [GEN + 'food-cupboard.webp', 'Деревянный кухонный шкаф с посудой'],
    eggs: [GEN + 'food-eggs.webp', 'Куриные яйца в корзинке'],
    flour: [GEN + 'food-flour.webp', 'Деревянная миска с белой мукой'],
    fridge: [GEN + 'food-fridge.webp', 'Белый кухонный холодильник'],
    icecream: [GEN + 'food-icecream.webp', 'Мороженое в рожке'],
    juice: [GEN + 'food-juice.webp', 'Стакан апельсинового сока'],
    lemon: [GEN + 'food-lemon.webp', 'Жёлтый лимон и половинка лимона'],
    mango: [GEN + 'food-mango.webp', 'Спелый манго — жёлтый, красный и зелёный'],
    milk: [GEN + 'food-milk.webp', 'Стакан молока и кувшин'],
    oliveoil: [GEN + 'food-oliveoil.webp', 'Кувшин золотого оливкового масла'],
    oranges: [GEN + 'food-oranges.webp', 'Три оранжевых апельсина'],
    pineapple: [GEN + 'food-pineapple.webp', 'Целый ананас с зелёными листьями'],
    potatoes: [GEN + 'food-potatoes.webp', 'Несколько коричневых картофелин'],
    saltpepper: [GEN + 'food-saltpepper.webp', 'Стеклянная солонка и деревянная перечница'],
    sugar: [GEN + 'food-sugar.webp', 'Миска белого сахара с деревянной ложкой и кубиками'],
    sweets: [GEN + 'food-sweets.webp', 'Разноцветные конфеты'],
    tomatoes: [GEN + 'food-tomatoes.webp', 'Спелые красные помидоры']
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
  const FILL = { instruction: 'Впиши пропущенную форму глагола (можно всё предложение).' };
  const build = (id, title, words, hint, explain, extra = {}) => ({
    id, type: 'build', title, instruction: 'Собери предложение: нажимай на слова по порядку.', words, hint, explain, ...extra, answers: [words.join(' ').replace(/^./, c => c.toUpperCase()), ...(extra.answers || [])]
  });
  const sort = (id, title, instruction, boxes, items, hint, explain, extra = {}) => ({
    id, type: 'sort', title, instruction, boxes, items: items.map(([text, box]) => ({ text, box })), hint, explain, ...extra
  });
  const match = (id, title, instruction, options, rows, hint, explain, extra = {}) => ({
    id, type: 'match', title, instruction, options, rows: rows.map(([prompt, answer]) => ({ prompt, answer })), hint, explain, ...extra
  });
  const oral = (id, title, prompt, cue, extra = {}) => ({ id, type: 'oral', title, instruction: 'Говорим вместе с учителем.', prompt, cue, ...extra });

  window.Lesson4Data = {
    version: 1,
    images,
    stages: [
      {
        id: 'food', title: 'Еда', minutes: 17,
        steps: [
          teach('food-words', 'Food',
            '<p><strong lang="en">Food</strong> — еда. Что мы едим и пьём?</p><div class="trait-grid">' + fig('apple', 'apple<small>яблоко</small>') + fig('banana', 'banana<small>банан</small>') + fig('bread', 'bread<small>хлеб</small>') + fig('butter', 'butter<small>масло</small>') + fig('cheese', 'cheese<small>сыр</small>') + fig('chicken', 'chicken<small>курица</small>') + fig('eggs', 'eggs<small>яйца</small>') + fig('juice', 'juice<small>сок</small>') + fig('milk', 'milk<small>молоко</small>') + fig('sweets', 'sweets<small>конфеты</small>') + fig('tomatoes', 'tomatoes<small>помидоры</small>') + fig('icecream', 'ice cream<small>мороженое</small>') + '</div>'),
          teach('food-more', 'More food',
            '<p><strong lang="en">More food</strong> — ещё слова про еду. Что мы кладём в салат, а что — в тесто?</p><div class="trait-grid">' + fig('lemon', 'lemon<small>лимон</small>') + fig('beans', 'beans<small>бобы</small>') + fig('mango', 'mango<small>манго</small>') + fig('coconut', 'coconut<small>кокос</small>') + fig('flour', 'flour<small>мука</small>') + fig('pineapple', 'pineapple<small>ананас</small>') + fig('oliveoil', 'olive oil<small>оливковое масло</small>') + fig('sugar', 'sugar<small>сахар</small>') + fig('saltpepper', 'salt &amp; pepper<small>соль и перец</small>') + fig('potatoes', 'potatoes<small>картошка</small>') + fig('biscuits', 'biscuits<small>печенье</small>') + fig('oranges', 'oranges<small>апельсины</small>') + '</div>'),
          match('food-match', 'What is it?', 'Прочитай описание и выбери слово.', ['banana', 'milk', 'ice cream', 'butter', 'eggs', 'tomatoes'], [
            ['It is white. We drink it. It comes from a cow.', 'milk'],
            ['It is yellow. We put it on bread.', 'butter'],
            ['Hens lay them. We fry them for breakfast.', 'eggs'],
            ['It is long and yellow. Monkeys love it.', 'banana'],
            ['They are red and round. We put them in salad.', 'tomatoes'],
            ['It is cold and sweet. We eat it in summer.', 'ice cream']],
            'Найди в описании главное: цвет, откуда это, что мы делаем с этим.', 'Белое, пьём, от коровы — milk. Жёлтое, на хлеб — butter. Их несёт курица — eggs. Длинный и жёлтый — banana. Красные и круглые, в салат — tomatoes. Холодное и сладкое, летом — ice cream.'),
          match('food-match2', 'What is it? More words', 'Прочитай описание и выбери слово.', ['potatoes', 'lemon', 'oranges', 'mango', 'flour', 'coconut'], [
            ['It is yellow and sour. We put it in tea.', 'lemon'],
            ['It is sweet and juicy inside. It has a big stone.', 'mango'],
            ['They grow under the ground. We make chips from them.', 'potatoes'],
            ['It is brown and hard outside. Inside it has white flesh and water.', 'coconut'],
            ['They are orange and round. There is a lot of juice in them.', 'oranges'],
            ['It is white. We make bread and cakes with it.', 'flour']],
            'Найди в описании главное: цвет, вкус, где растёт, что мы делаем с этим.', 'Жёлтый и кислый, в чай — lemon. Сладкий, с большой косточкой — mango. Растут под землёй, из них чипсы — potatoes. Коричневый и твёрдый, внутри белая мякоть и вода — coconut. Оранжевые, круглые, много сока — oranges. Белое, из него хлеб и пироги — flour.'),
          oral('food-oral', 'Моя любимая еда', 'What is your favourite food? — My favourite food is ...',
            'Скажи по образцу: My favourite food is ice cream. Можно перечислить: I like apples and cheese.')
        ]
      },
      {
        id: 'likes', title: 'Что мы любим делать', minutes: 13,
        steps: [
          teach('likes-forms', 'I like eating.',
            '<p><strong lang="en">like + глагол-ing</strong> — нравится что-то делать.</p><ul><li><strong lang="en">I like eating apples.</strong> — Я люблю есть яблоки.</li><li><strong lang="en">He likes eating apples.</strong> — Он любит есть яблоки. Не забудь <strong>-s</strong>!</li><li><strong lang="en">I don’t like drinking milk.</strong> — Я не люблю пить молоко.</li><li><strong lang="en">Do you like swimming?</strong> — <strong lang="en">Yes, I do. / No, I don’t.</strong></li></ul><p>Правописание: make → mak<strong>ing</strong> (e убегает), run → run<strong>n</strong>ing (удваиваем n), play → play<strong>ing</strong> (просто добавляем).</p>'),
          build('likes-build', 'Собери предложение', ['he', 'likes', 'eating', 'apples'],
            'Кто? He — значит у like появится -s. Что он любит? eating apples.', 'He likes eating apples. — Он любит есть яблоки.'),
          sort('likes-sort', 'like или likes?', 'Выбери правильную форму.', [
            { id: 'like', label: 'I / you / we / they', note: 'like' },
            { id: 'likes', label: 'he / she / it', note: 'likes (-s)' }], [
            ['I ___ reading.', 'like'],
            ['She ___ dancing.', 'likes'],
            ['We ___ swimming.', 'like'],
            ['My mum ___ cooking.', 'likes'],
            ['They ___ playing football.', 'like'],
            ['The cat ___ sleeping in the sun.', 'likes']],
            'I, you, we, they — like. He, she, it — likes.', 'После he/she/it у like появляется -s: My mum likes cooking.'),
          choice('likes-choice', 'Выбери вариант', 'My friend ___ drinking juice.', ['like', 'likes', 'liking'], 'likes',
            'My friend — это он. После he/she/it у like появляется -s.', 'My friend likes drinking juice. — Мой друг любит пить сок.'),
          input('likes-input', 'Что он любит?', '(eat ice cream) He ___ .', ['likes eating ice cream', 'He likes eating ice cream', 'likes eating ice-cream', 'He likes eating ice-cream'],
            'He — значит likes. После likes глагол с -ing: eating.', 'He likes eating ice cream. — Он любит есть мороженое.', FILL),
          oral('likes-oral', 'Что ты любишь?', 'Do you like swimming? — Yes, I do. / No, I don’t.',
            'Спроси учителя: Do you like swimming? Do you like reading? Do you like dancing? Ответь: Yes, I do. / No, I don’t. А потом скажи про себя: I like …')
        ]
      },
      {
        id: 'someany', title: 'В холодильнике', minutes: 15,
        steps: [
          teach('someany-forms', 'Some and any',
            '<p><strong lang="en">some</strong> — немного: в утверждениях. <strong lang="en">any</strong> — в вопросах и отрицаниях.</p><ul><li><strong lang="en">There is some milk in the fridge.</strong> — В холодильнике есть молоко.</li><li><strong lang="en">There isn’t any juice.</strong> — Сока нет.</li><li><strong lang="en">Are there any eggs?</strong> — <strong lang="en">Yes, there are.</strong> — Яйца есть?</li></ul><p><strong lang="en">There is</strong> — один предмет или то, что не считаем (milk, juice, cheese). <strong lang="en">There are</strong> — то, что можно посчитать (eggs, tomatoes, apples).</p>'),
          teach('someany-kitchen', 'In the kitchen',
            '<p>На кухне еда живёт в двух местах.</p><div class="trait-grid">' + fig('fridge', 'fridge<small>холодильник</small>') + fig('cupboard', 'cupboard<small>кухонный шкаф</small>') + '</div><ul><li><strong lang="en">The milk is in the fridge.</strong> — Молоко в холодильнике. Там холодно.</li><li><strong lang="en">The bread and the sugar are in the cupboard.</strong> — Хлеб и сахар — в шкафу.</li><li>Спроси: <strong lang="en">Is there any bread in the cupboard?</strong> — <strong lang="en">Yes, there is.</strong></li></ul>'),
          sort('someany-sort', 'some или any?', 'Выбери слово.', [
            { id: 'some', label: 'Утверждение', note: 'There is / There are some …' },
            { id: 'any', label: 'Вопрос или отрицание', note: 'Is/Are there any …? not … any' }], [
            ['There is ___ milk.', 'some'],
            ['Is there ___ juice?', 'any'],
            ['There aren’t ___ bananas.', 'any'],
            ['There are ___ apples.', 'some'],
            ['Are there ___ eggs?', 'any'],
            ['There is ___ cheese.', 'some']],
            'Просто «есть что-то» — some. Вопрос или «нет» — any.', 'В утверждениях стоит some, в вопросах и отрицаниях — any.'),
          choice('there-choice', 'Выбери вариант', 'Look at the fridge. There ___ some cheese.', ['are', 'am', 'is'], 'is',
            'Cheese мы не считаем по кусочкам — это There is.', 'There is some cheese. — Cheese здесь неисчисляемое, поэтому is.'),
          choice('any-choice', 'Выбери вариант', 'There aren’t ___ tomatoes in the fridge.', ['some', 'any', 'a'], 'any',
            'Это отрицание (aren’t) — в отрицаниях живёт any.', 'There aren’t any tomatoes. — В отрицании после not стоит any.'),
          input('fridge-input', 'В холодильнике', '(eggs) There ___ some eggs in the fridge.', ['are', 'There are some eggs in the fridge', 'There are some eggs'],
            'Яиц много — они считаются: There are. Не забудь some.', 'There are some eggs in the fridge. — В холодильнике есть яйца.'),
          oral('someany-oral', 'Наш холодильник', 'What do we have at home? — We have some … / We don’t have any …',
            'Ответь: We have some apples and cheese. We don’t have any juice. Что у вас дома есть, а чего нет?')
        ]
      },
      {
        id: 'extra', title: 'Some, any, no', minutes: 8,
        steps: [
          teach('extra-forms', 'Считаем коробки, а не молоко',
            '<p><strong>Молоко посчитать нельзя, а коробку молока — можно!</strong></p><ul><li>Не считаем: milk, bread, cheese, water, chocolate. Говорим <strong lang="en">some milk</strong> — без <strong>a</strong> и без <strong>-s</strong>.</li><li>А теперь считаем коробки, бутылки и куски: <strong lang="en">a carton of milk</strong>, <strong lang="en">two bottles of water</strong>, <strong lang="en">a loaf of bread</strong>, <strong lang="en">a piece of cheese</strong>, <strong lang="en">a bar of chocolate</strong>, <strong lang="en">a glass of juice</strong>.</li><li><strong lang="en">no</strong> = совсем нет: <strong lang="en">There is no milk.</strong> = <strong lang="en">There isn’t any milk.</strong> Let’s buy some!</li></ul>'),
          sort('extra-sort-count', 'Считаем или нет?', 'Выбери: можно это посчитать?', [
            { id: 'count', label: 'Можно посчитать', note: '' },
            { id: 'uncount', label: 'Не считаем', note: '' }], [
            ['an apple', 'count'],
            ['some milk', 'uncount'],
            ['two apples', 'count'],
            ['some bread', 'uncount'],
            ['three eggs', 'count'],
            ['some cheese', 'uncount'],
            ['two tomatoes', 'count']],
            'Яблоки и яйца считаем по одному. Молоко, хлеб и сыр — только в коробках, буханках и кусках.', 'Коробку, бутылку, кусок посчитать можно: two bottles of water. Само молоко — нет: some milk.'),
          match('extra-match-box', 'Сколько и чего?', 'Соедини, что с чем идёт.', ['a glass of juice', 'a piece of cheese', 'a carton of milk', 'a bar of chocolate', 'a bottle of water', 'a loaf of bread'], [
            ['Молоко — в коробке', 'a carton of milk'],
            ['Вода — в бутылке', 'a bottle of water'],
            ['Хлеб — батон', 'a loaf of bread'],
            ['Сыр — кусочек', 'a piece of cheese'],
            ['Шоколад — плитка', 'a bar of chocolate'],
            ['Сок — стакан', 'a glass of juice']],
            'Мы считаем не молоко, а коробки: a carton of milk. Так же: бутылка воды, батон хлеба, кусок сыра.', 'a carton of milk — коробка молока, a bottle of water — бутылка воды, a loaf of bread — батон, a piece of cheese — кусок сыра, a bar of chocolate — плитка шоколада, a glass of juice — стакан сока.'),
          choice('extra-no-choice', 'Выбери вариант', 'There is ___ milk at home. Let’s buy some!', ['any', 'many', 'no'], 'no',
            'no = совсем нет, ни капли. Значит, пора покупать!', 'There is no milk. = There isn’t any milk. — Молока нет совсем, идём в магазин.')
        ]
      },
      {
        id: 'table', title: 'За столом и в магазине', minutes: 7,
        steps: [
          oral('table-oral', 'За столом', 'Can I have some juice, please? — Here you are.',
            'Попроси вежливо: Can I have some water / milk / bread, please? Учитель отвечает: Here you are! Ты говоришь: Thank you!'),
          choice('shop-choice', 'В магазине', 'How ___ is the cake? — It’s one hundred roubles.', ['many', 'much', 'old'], 'much',
            'Спрашиваем о цене: How much is it?', 'How much is the cake? — Сколько стоит торт? Цену спрашивают How much.'),
          oral('shop-oral', 'В магазине', 'How much is the ice cream? — It’s fifty roubles.',
            'Сыграем в магазин: ты продавец, я покупатель. How much is the ice cream? — It’s fifty roubles. Потом поменяйтесь ролями.')
        ]
      }
    ]
  };
})();
