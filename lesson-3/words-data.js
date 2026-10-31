/* Lesson three: vocabulary list. group: 'new' (урок 2) | 'old' (раньше). topic: day | trait | action | phrase | thing | time. */
(() => {
  'use strict';
  const w = (en, ru, group, topic, pic) => {
    const item = { en, ru, group, topic };
    if (pic) { item.image = pic.src; item.imageAlt = pic.alt; }
    return item;
  };
  window.OKS_WORDS = [
    w('before', 'до', 'new', 'time'), w('after', 'после', 'new', 'time'),
    w('rude', 'грубый', 'new', 'trait'), w('shy', 'застенчивый', 'new', 'trait'),
    w('helpful', 'готовый помочь', 'new', 'trait'), w('hero', 'герой', 'new', 'thing'),
    w('next', 'следующий', 'new', 'time'), w('onto', 'на (поверхность)', 'new', 'phrase'),
    w('a box', 'коробка', 'new', 'thing'), w('write', 'писать', 'new', 'action'),
    w('hand', 'рука', 'new', 'thing'),
    w('Monday', 'понедельник', 'new', 'day'), w('Tuesday', 'вторник', 'new', 'day'),
    w('Wednesday', 'среда', 'new', 'day'), w('Thursday', 'четверг', 'new', 'day'),
    w('Friday', 'пятница', 'new', 'day'), w('Saturday', 'суббота', 'new', 'day'),
    w('Sunday', 'воскресенье', 'new', 'day'),
    w('on Monday', 'в понедельник (один раз)', 'new', 'phrase'), w('on Mondays', 'по понедельникам', 'new', 'phrase'),
    w('every Monday', 'каждый понедельник', 'new', 'phrase'),
    w('every day', 'каждый день', 'new', 'time'), w('usually', 'обычно', 'new', 'time'),
    w('often', 'часто', 'new', 'time'), w('always', 'всегда', 'new', 'time'),
    w('ride a bike', 'кататься на велосипеде', 'new', 'action'),
    w('listen to music', 'слушать музыку', 'new', 'action'),
    w('quiet', 'тихий', 'new', 'trait', { src: 'images/trait-quiet.webp', alt: 'Девочка тихо читает на подушке, приложив палец к губам' }), w('pick up', 'поднимать', 'new', 'action'),
    w('go away', 'уходить, уходи!', 'new', 'action'), w('friendly', 'дружелюбный', 'new', 'trait'),
    w('silly', 'глупенький, дурашливый', 'new', 'trait'), w('joke', 'шутка', 'new', 'thing'),
    w('laugh', 'смех, смеяться', 'new', 'action'), w('smile', 'улыбка, улыбаться', 'new', 'action'),
    w('funny', 'смешной, забавный', 'new', 'trait'), w('in front of', 'перед чем-то, перед кем-то', 'new', 'phrase'),
    w('nervous', 'взволнованный (волнуется)', 'new', 'trait'), w('feel nervous', 'волноваться', 'new', 'phrase'),
    w('What is he/she like?', 'какой он/она по характеру?', 'new', 'phrase'),
    w('everybody', 'все', 'new', 'thing'), w('carry', 'нести', 'new', 'action'),
    w('push', 'толкать', 'new', 'action'), w('tell a joke', 'рассказывать шутку', 'new', 'phrase'),

    w('draw a picture', 'рисовать картинку', 'old', 'action'), w('now', 'сейчас', 'old', 'time'),
    w('find', 'находить', 'old', 'action'), w('rabbit', 'кролик', 'old', 'thing'),
    w('train', 'поезд', 'old', 'thing'), w('climb', 'лазить, взбираться', 'old', 'action'),
    w('do homework', 'делать уроки', 'old', 'action'), w('table', 'стол', 'old', 'thing'),
    w('kind', 'добрый', 'old', 'trait', { src: 'images/trait-kind.webp', alt: 'Мальчик улыбается и делится яблоком с одноклассницей' }), w('example', 'пример', 'old', 'thing'),
    w('at the moment', 'в данный момент', 'old', 'time'),
    w('tie', 'завязывать; галстук', 'old', 'action'), w('lie', 'лежать', 'old', 'action'),
    w('fix', 'чинить', 'old', 'action'), w('read', 'читать', 'old', 'action'),
    w('imagine', 'представлять', 'old', 'action'), w('about', 'о, об; про', 'old', 'phrase'),
    w('open', 'открывать', 'old', 'action'), w('ride', 'ездить, ехать', 'old', 'action'),
    w('see', 'видеть', 'old', 'action'), w('sit', 'сидеть', 'old', 'action'),
    w('begin', 'начинать', 'old', 'action'), w('picture', 'картинка, рисунок', 'old', 'thing'),
    w('sleep', 'спать', 'old', 'action'), w('sentence', 'предложение', 'old', 'thing'),
    w('action', 'действие', 'old', 'thing'), w('happen', 'случаться, происходить', 'old', 'action'),
    w('right now', 'прямо сейчас', 'old', 'time'), w('build', 'строить', 'old', 'action'),
    w('ask', 'спрашивать', 'old', 'action')
  ];
})();
