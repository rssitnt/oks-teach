(() => {
  'use strict';

  const IMG = 'images/';
  const sentence = (prompt, answer) => {
    const tail = prompt.includes('— ') ? prompt.split('— ').pop() : prompt.replace(/^\([^)]*\)\s*/, '');
    return tail.replace('___', answer);
  };
  const gap = (id, prompt, answer, extra = []) => {
    const full = sentence(prompt, answer);
    return { id, prompt, answers: [answer, ...extra, full] };
  };
  const picture = (id, file, alt, answer, extra = []) => ({ id, image: IMG + file + '.webp', alt, prompt: 'Что на картинке?', answers: [answer, ...extra] });
  const free = (id, prompt, start) => ({ id, free: true, prompt, start });

  window.Homework4Data = {
    version: 1,
    storageKey: 'oks.lesson4.homework.v1',
    exercises: [
      {
        id: 'pic', lesson: 'этап «Еда» и карточка In the kitchen', title: 'Food and kitchen', kind: 'picture',
        english: 'Look at the picture. Write the word.',
        instruction: 'Посмотри на картинку и напиши слово по-английски. Артикль a писать не обязательно.',
        hint: 'Посмотри в уроке: этап «Еда», карточки Food и More food, а слова для кухни — в этапе «В холодильнике», карточка In the kitchen.',
        items: [
          picture('pic-1', 'food-cheese', 'Кусок жёлтого сыра', 'cheese', ['a cheese']),
          picture('pic-2', 'food-eggs', 'Куриные яйца в корзинке', 'eggs', ['egg', 'an egg']),
          picture('pic-3', 'food-icecream', 'Мороженое в рожке', 'ice cream', ['an ice cream']),
          picture('pic-4', 'food-lemon', 'Жёлтый лимон и половинка лимона', 'lemon', ['a lemon']),
          picture('pic-5', 'food-coconut', 'Кокос и половинка кокоса с белой мякотью', 'coconut', ['a coconut']),
          picture('pic-6', 'food-fridge', 'Белый кухонный холодильник', 'fridge', ['a fridge']),
          picture('pic-7', 'food-cupboard', 'Деревянный кухонный шкаф с посудой', 'cupboard', ['a cupboard'])
        ]
      },
      {
        id: 'sa', lesson: 'карточка Some and any', title: 'Some or any?', kind: 'gap',
        english: 'Write some or any.',
        instruction: 'Впиши some или any. Можно написать только слово или всё предложение.',
        hint: 'Посмотри в уроке: этап «В холодильнике», карточка Some and any. Some — в утверждениях, any — в вопросах и отрицаниях.',
        items: [
          gap('sa-1', 'There is ___ cheese in the fridge.', 'some'),
          gap('sa-2', 'Is there ___ juice in the fridge?', 'any'),
          gap('sa-3', 'There aren’t ___ bananas.', 'any'),
          gap('sa-4', 'There are ___ apples in the fridge.', 'some'),
          gap('sa-5', 'Are there ___ eggs?', 'any'),
          gap('sa-6', 'There is ___ bread in the cupboard.', 'some')
        ]
      },
      {
        id: 'lk', lesson: 'этап «Что мы любим делать»', title: 'I like eating', kind: 'gap',
        english: 'Write like or likes. Then finish the sentences.',
        instruction: 'В первых трёх предложениях впиши like или likes. В последних трёх слова в скобках подскажут, что сделать: впиши форму like и глагол с -ing (можно всё предложение).',
        hint: 'Посмотри в уроке: этап «Что мы любим делать». После I, you, we, they — like, после he, she, it — likes. После like глагол с -ing.',
        items: [
          gap('lk-1', 'They ___ playing football.', 'like'),
          gap('lk-2', 'The cat ___ sleeping in the sun.', 'likes'),
          gap('lk-3', 'My mum ___ cooking.', 'likes'),
          gap('lk-4', '(eat ice cream) He ___ .', 'likes eating ice cream'),
          gap('lk-5', '(eat apples) I ___ .', 'like eating apples'),
          gap('lk-6', '(drink juice) My friend ___ .', 'likes drinking juice')
        ]
      },
      {
        id: 'th', lesson: 'карточка Some and any', title: 'There is or there are?', kind: 'gap',
        english: 'Write is or are.',
        instruction: 'Впиши is или are. Можно написать только слово или всё предложение.',
        hint: 'Посмотри в уроке: этап «В холодильнике», карточка Some and any. There is — один предмет или то, что не считаем (milk, juice, cheese, bread). There are — то, что можно посчитать (eggs, tomatoes, apples).',
        items: [
          gap('th-1', 'There ___ some milk in the fridge.', 'is'),
          gap('th-2', 'There ___ some tomatoes in the fridge.', 'are'),
          gap('th-3', '___ there any juice?', 'Is'),
          gap('th-4', '___ there any bananas?', 'Are'),
          gap('th-5', 'There ___ some bread in the cupboard.', 'is'),
          gap('th-6', 'Are there any eggs? — Yes, there ___.', 'are'),
          gap('th-7', 'There ___ no milk at home.', 'is')
        ]
      },
      {
        id: 'me', lesson: '', title: 'About me', kind: 'free',
        english: 'Write about you and your fridge.',
        instruction: 'Напиши 4 предложения о себе и о своём холодильнике. Эти ответы сайт не проверяет — их посмотрит преподаватель.',
        hint: '',
        items: [
          free('me-1', 'What is your favourite food?', 'My favourite food is ...'),
          free('me-2', 'What do you like doing?', 'I like ...ing ...'),
          free('me-3', 'What is in your fridge?', 'There is some ... / There are some ... in my fridge.'),
          free('me-4', 'What is not in your fridge?', 'There isn’t any ... / There aren’t any ... in my fridge.')
        ]
      }
    ]
  };
})();
