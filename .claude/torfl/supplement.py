#!/usr/bin/env python3
"""The words a frequency list cannot be trusted to supply, written out by hand.

WHY THIS FILE EXISTS -- the UKBI generator's reason, and it holds for Russian.
A list built from film subtitles is wrong for a beginner in two directions:

  · IT UNDER-SERVES THE CLOSED SETS.  The days, the months, the numbers past
    `два` and the colours are each a small set whose members are rare one by one
    and indispensable together: `четверг` (Thursday) sums to 4,378 over its whole
    paradigm, below `убийство` (murder) at 48,551.
  · IT OVER-SERVES WHAT FILMS ARE ABOUT.  `убить` (to kill) outranks `купить` (to
    buy) three to one, and `мистер` and `сэр` -- dubbing's renderings of
    English forms of address -- rank above `магазин` (shop).

WHAT DECIDES THE CONTENTS.  The level's scope (`SCOPE` in `torfl_level.py`):
for A1, until the owner's TORFL descriptions are written in, the Council of
Europe's A1 descriptor -- familiar everyday expressions for concrete needs,
introducing yourself, personal details, where you live, people you know, things
you have.  So the sections are the concrete situations that names.  Nothing here
is a word list published by anybody, and the deck's description says so.

THE SYNTAX of an entry: `word`, or `word:pos` where the word has entries of
several parts of speech, or `word#key` where it has several entries of one part
of speech (or one entry of several senses) -- the entry whose gloss contains
`key` is taken and that sense is put first.  `среда#Wednesday` is the day and
not the environment.  `select.py` refuses the build if an entry names nothing.

ASPECT.  A verb is named ONCE, by either member of its pair; `select.py` finds
the partner and makes the pair one note, imperfective first.
"""
from torfl_level import LEVEL

GREETINGS = """
здравствуйте здравствуй привет до_свидания пока:intj спасибо пожалуйста:intj
да:particle нет:particle хорошо:adv извинить доброе_утро добрый_день добрый_вечер
спокойной_ночи как_дела очень_приятно меня_зовут ничего:intj
"""
# `пока` is "bye" as well as "while"; `:intj` takes the greeting, and its gloss
# says both.  `извинить` brings `извинять` with it, and the imperative the
# learner actually says, `извините`, is in its examples and its table.

PEOPLE = """
я ты он она оно мы вы они кто:pron
человек люди мужчина женщина ребёнок мальчик девочка друг подруга
семья мама папа мать отец сын дочь брат сестра муж жена бабушка дедушка
имя фамилия звать жить работать учиться студент студентка врач
работа страна город язык русский английский
"""

NUMBERS = """
ноль один два три четыре пять шесть семь восемь девять десять
одиннадцать двенадцать двадцать тридцать сто тысяча
первый второй третий
"""

TIME = """
время час минута сегодня:adv завтра:adv вчера:adv сейчас теперь
утро день вечер ночь неделя месяц год
рано поздно всегда никогда иногда часто потом уже ещё скоро
понедельник вторник среда#Wednesday четверг пятница суббота воскресенье
январь февраль март апрель май июнь июль август сентябрь октябрь ноябрь декабрь
зима весна лето осень
"""

QUESTIONS = """
что:pron где куда откуда когда:adv как:adv почему сколько какой чей зачем
"""

LINKS = """
в на с:prep из к:prep от до:prep у:prep о:prep для без за:prep под:prep перед после:prep через:prep по:prep
и:conj а:conj но:conj или если потому_что чтобы
не:particle вот:particle тоже очень только здесь там тут:adv сюда туда домой дома:adv
много мало немного можно нельзя надо нужно
это:pron этот тот мой твой наш ваш его:pron её:pron их:pron свой
"""

FOOD = """
еда хлеб вода молоко чай кофе сок вино пиво мясо рыба курица суп сыр масло
яйцо сахар соль яблоко картошка рис завтрак обед ужин есть#eat пить
ресторан кафе стол чашка вкусный
"""

MONEY = """
деньги рубль магазин рынок стоить покупать продавать платить
дорогой#expensive дешёвый карта банк
"""

HOME = """
дом квартира комната кухня окно дверь кровать стул ключ адрес улица этаж
телефон компьютер
"""

TOWN = """
центр площадь парк музей театр кино гостиница вокзал аэропорт метро автобус
такси машина поезд самолёт остановка билет станция
справа слева прямо далеко близко рядом
идти ходить ехать ездить ждать
"""
# The motion verbs: `идти` (one direction, now) and `ходить` (round trips,
# habit) are two notes that point at each other, not a pair -- see `select.py`.

BODY = """
голова рука нога глаз зуб сердце болеть больница аптека лекарство больной
"""

WEATHER = """
погода солнце дождь снег холодно тепло жарко холодный тёплый
"""

COLOURS = """
белый чёрный красный синий зелёный жёлтый
"""

ADJECTIVES = """
хороший плохой большой маленький новый старый молодой красивый интересный
"""

VERBS = """
быть спать читать писать говорить слушать смотреть видеть знать понимать
любить хотеть мочь делать открывать закрывать начинать отдыхать гулять играть
звонить брать давать спрашивать отвечать помогать
"""

SECTIONS_A1 = {
    'greetings': GREETINGS, 'people': PEOPLE, 'numbers': NUMBERS, 'time': TIME,
    'questions': QUESTIONS, 'links': LINKS, 'food': FOOD, 'money': MONEY,
    'home': HOME, 'town': TOWN, 'body': BODY, 'weather': WEATHER,
    'colours': COLOURS, 'adjectives': ADJECTIVES, 'verbs': VERBS,
}

# ---------------------------------------------------------------- A2
# THE SAME SITUATIONS AS A1, TOLD AT GREATER LENGTH, which is what the A2
# descriptor adds: "frequently used expressions related to areas of most
# immediate relevance (e.g. very basic personal and family information,
# shopping, local geography, employment)" and describing "in simple terms
# aspects of [one's] background, immediate environment and matters in areas of
# immediate need".  So employment and local geography come in here, and the
# narration a learner needs to say what happened yesterday.  A word A1 already
# teaches is skipped by `select.py` and need not be kept out by hand.

A2_PEOPLE = '''
родитель внук внучка дядя тётя родственник сосед гость знакомый коллега начальник
возраст взрослый пожилой знакомиться жениться родиться
'''

A2_WORK = '''
профессия инженер учитель продавец водитель официант журналист фирма компания офис
зарплата университет институт урок экзамен задание учебник тетрадь ручка#pen словарь
ответ ошибка понятный трудный лёгкий изучать учить уметь
'''

A2_SHOPPING = '''
одежда платье рубашка брюки юбка куртка пальто шапка обувь размер подарок сумка
продукты покупка бутылка пакет килограмм
'''

A2_FOOD = '''
овощ фрукт помидор огурец апельсин мороженое торт пирог каша колбаса салат
сладкий острый готовить заказывать
'''

A2_HOME = '''
мебель шкаф диван кресло полка лампа холодильник ванная туалет балкон сад
лестница лифт убирать мыть переезжать
'''

A2_TOWN = '''
район мост река озеро море гора лес поле деревня столица север юг восток запад
недалеко напротив угол церковь библиотека почта
'''

A2_TRAVEL = '''
путешествие путешествовать отпуск каникулы паспорт чемодан турист экскурсия граница
лететь летать уезжать опаздывать
'''
# `лететь` and `летать` are the motion pair for flying, as `идти` and `ходить`
# are for walking; `select.py` keeps them two notes.

A2_HEALTH = '''
здоровье болезнь температура спина живот горло ухо нос рот плечо палец волосы
таблетка лечить здоровый уставать
'''

A2_FEELINGS = '''
настроение радость весёлый грустный злой умный глупый спокойный сердиться смеяться
плакать улыбаться удивляться скучать интересоваться мечтать мечта
'''

A2_LEISURE = '''
спорт футбол музыка песня фильм журнал газета картина выставка концерт праздник
день_рождения отдых танцевать петь рисовать плавать бегать
'''

A2_TIME = '''
сначала наконец вдруг однажды сразу давно недавно обычно долго назад будущий век
'''

A2_NATURE = '''
небо ветер облако мороз градус природа дерево цветок трава животное собака кошка
птица лошадь
'''

A2_OPINION = '''
по-моему мнение например хотя также кроме вместо около согласный
'''

A2_QUANTITY = '''
половина тринадцать четырнадцать пятнадцать шестнадцать семнадцать восемнадцать
девятнадцать сорок пятьдесят шестьдесят семьдесят восемьдесят девяносто двести
триста пятьсот миллион четвёртый пятый шестой седьмой восьмой девятый десятый
'''

A2_VERBS = '''
класть ставить садиться вставать ложиться одеваться просыпаться кончаться
повторять переводить объяснять разговаривать советовать приглашать встречать
посылать отправлять дарить менять выбирать курить носить
'''

A2_ADJECTIVES = '''
высокий низкий длинный короткий широкий узкий тяжёлый быстрый медленный громкий
тихий чистый грязный свободный занятый богатый бедный сильный слабый простой
главный известный удобный светлый тёмный свежий готовый разный похожий
иностранный родной любимый серый коричневый розовый голубой
'''

SECTIONS_A2 = {
    'people': A2_PEOPLE, 'work': A2_WORK, 'shopping': A2_SHOPPING, 'food': A2_FOOD,
    'home': A2_HOME, 'town': A2_TOWN, 'travel': A2_TRAVEL, 'health': A2_HEALTH,
    'feelings': A2_FEELINGS, 'leisure': A2_LEISURE, 'time': A2_TIME,
    'nature': A2_NATURE, 'opinion': A2_OPINION, 'quantity': A2_QUANTITY,
    'verbs': A2_VERBS, 'adjectives': A2_ADJECTIVES,
}

SECTIONS = {'a1': SECTIONS_A1, 'a2': SECTIONS_A2}.get(LEVEL, {})


def inventory():
    """[(section, word, pos or None, key or None)], in the order written.

    An underscore joins a multi-word entry, since the lists are split on
    whitespace.
    """
    out, seen = [], set()
    for sec, text in SECTIONS.items():
        for tok in text.split():
            word, pos, key = tok, None, None
            if '#' in word:
                word, key = word.split('#', 1)
            if ':' in word:
                word, pos = word.split(':', 1)
            word = word.replace('_', ' ')
            if (word, pos, key) in seen:
                continue
            seen.add((word, pos, key))
            out.append((sec, word, pos, key))
    return out
