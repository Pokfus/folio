#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`ukrainian_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, dialectal, a Russianism ...);
  · a one-letter lemma that is not a word (в, у, з, і, а, я, о are, and the
    inventory takes them);
  · the hand list `EXCLUDE`, each line with its reason -- most of them RUSSIAN
    words spelt only with letters the two languages share, which the subtitle
    list carries in quantity (`extract.py`).
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uk import fold
from ukrainian_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'да': "Russian 'yes' and 'and', counted from Russian subtitle lines; Ukrainian says так and і",
    'но': "Russian 'but'; Ukrainian's is але (Wiktionary marks но dialectal)",
    'его': "an entry for 'ego', which takes the count of Russian его 'his, him'",
    'мяти': "its count is мне, Russian 'to me', which is also a form of м'яти",
    'он': "Russian 'he'; the Ukrainian entry is a rare 'over there'",
    'как': "Russian 'how'",
    'нет': "Russian 'no'",
    'вот': "Russian 'here is'",
    'мне': "Russian 'to me'",
    'тебя': "Russian 'you'",
    'меня': "Russian 'me'",
    'она': "Russian 'she'; Ukrainian вона",
    'они': "Russian 'they'; Ukrainian вони",
    'сейчас': "Russian 'now'",
    'хорошо': "Russian 'well'",
    'спасибо': "Russian 'thank you'",
    'надо': "Russian 'must'",
    'потому': "Russian 'because'",
    'тогда': "Russian 'then'",
    'тоже': "Russian 'too'",
    'может': "Russian 'may'",
    'ему': "an entry for 'emu', which takes the count of Russian ему 'to him' (Ukrainian йому)",
    'том': "'volume (book)', whose count is Russian том 'that' (prepositional)",
    'посол': "'ambassador', whose table holds по́сле, the spelling of Russian после 'after'",
    'найти': "Russian 'to find' (Ukrainian знайти, which the fill takes)",
    'ласка': "'weasel; kindness', counted from будь ласка, which is on a card of its own",
    'всі': "the plural of весь, which is on the card of весь",
    'усі': "the plural of увесь, the у-spelling of весь",
    'усе': "the у-spelling of все, which the fill takes",
    'уже': "the у-spelling of вже, which the inventory takes",
    'убити': "the у-spelling of вбити, which the fill takes",
    'вбити': "Wiktionary's entry is only 'to drive in'; the subtitles' count is 'to kill', which it files under убити",
    'паня': "a dated 'lady' whose table holds пані and пане, which have cards of their own",
    'піт': "'sweat', whose table holds по́том, the spelling of Russian потом 'later'",
    # Read off the A2 ranking (2026-11-12).
    'варта': "'guard', whose count is its vocative ва́рто, the spelling of варто 'it is worth'",
    'жалити': "'to sting', whose own forms count 2 of its 858: the rest are forms it shares with others",
    'ту': "a dialectal 'here', whose count is ту, the feminine accusative of той (on A1)",
    'папа': "'pope', whose count is папа 'dad'",
    'нико': "a dialectal 'nobody' whose table holds нико́го, the spelling of Russian никого",
    'боб': "'bobsled', whose count is the name Bob",
    'муж': "Russian 'husband'; Ukrainian чоловік, on A1",
    'мужчина': "Russian 'man'; Ukrainian чоловік, on A1",
    'дальше': "Russian 'further'; Ukrainian далі, which the fill takes",
    'готовити': "counted from Russian готовить; Ukrainian готувати, on A1",
    'явитися': "Russian явиться, glossed only 'to show'; Ukrainian з'явитися",
    'зрозумів': "the past tense of зрозуміти, which the fill takes",
    'вітаю': "the я-form of вітати, which the inventory takes",
    'побачення': "'date, meeting', counted from до побачення, which is on a card of its own",
    # Read off the B1 ranking (2026-11-12).
    'ян': "'yang', whose count is the name Ian / Jan",
    'чан': "'vat', whose count is the name Chan",
    'люк': "'hatch', whose count is the name Luke",
    'майя': "a cotton cloth, whose count is the name Maya",
    'карт': "'go-cart', whose own forms count 22 of its 306: the rest are карта's (A2)",
    'мара': "'phantom', whose own forms count 8 of its 258: the rest are forms it shares",
    'миро': "'chrism', whose own forms count 1 of its 190: the rest are мир's (A2)",
    'никнути': "'to droop', whose own forms count none of its 185",
    'перти': "'to trudge', whose own forms count none of its 182",
    'піп': "'priest', whose table holds попа́ and попу́, the spellings of попа 'bottom'",
    'куча': "glossed 'barn, pigsty'; the count is Russian куча 'heap' (Ukrainian купа, which the fill takes)",
    'кофе': "Russian 'coffee'; Ukrainian кава, on A1",
    'путь': "Russian 'way', counted from Russian lines; Ukrainian шлях, on A2",
    'письмо': "'writing', whose count is Russian письмо 'letter' (Ukrainian лист, on A2)",
    "оп'ять": "Russian опять 'again'; Ukrainian знову",
    'появитися': "Russian появиться; Ukrainian з'явитися",
    'попробувати': "a Russianism; Ukrainian спробувати, on A2",
    'доказати': "Russian доказать 'to prove'; Ukrainian довести, which the fill takes",
    'скучати': "a Russianism; Ukrainian сумувати, which the inventory takes",
    'являтися': "Russian являться; Ukrainian з'являтися",
    'учитель': "the у-spelling of вчитель, on A1",
    'учитися': "the у-spelling of вчитися, on A1",
    'убивати': "the у-spelling of вбивати, on A2",
    'умирати': "the у-spelling of вмирати; помирати is on A2",
    'заспокойся': "the imperative of заспокоїтися, which the fill takes",
    'поїхали': "the past plural of поїхати, on A2",
    'чогось': "the genitive of щось, on A1",
    'типу': "the genitive of тип, on A2",
    'діти': "the plural of дитина, on A1",
    'сучий': "an insult ('son of a bitch')",
    'знов': "the short form of знову, on A1",
    'цінувати': "Wiktionary defines it only as a synonym of цінити",
    'вампир': "a 1928–1933 spelling of вампір",
    'ударити': "the у-spelling of вдарити, which the fill takes",
}

SWEARS = {'блядь', 'бля', 'хуй', 'пизда', 'сука', 'срака', 'дупа', 'гівно', 'лайно', 'курва',
          'засранець', 'придурок', 'ідіот', 'дурень', 'мудак', 'виродок', 'покидьок'}

ONE_LETTER = {'в', 'у', 'з', 'і', 'а', 'я', 'о', 'й'}


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            via = ''
            if L and 'alt_of' in L:
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if len(k) < 2 and k not in ONE_LETTER:
            continue
        if ' ' in k or '-' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
