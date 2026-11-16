#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`bulgarian_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, dialectal, pre-1945 ...);
  · a one-letter lemma that is not a word (в, с, у, и, а, я, о are, and the
    inventory takes them);
  · the hand list `EXCLUDE`, each line with its reason -- a lemma whose count is
    another word's form, or a word of another language spelt only with letters
    Bulgarian shares (`extract.py`).
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bg import fold
from bulgarian_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-16).  Each with its reason.
EXCLUDE = {
    # the personal pronouns' short and full forms, written out on the card of аз, ти, той ...
    'ме': 'a form of аз, on its card', 'ми': 'a form of аз, on its card',
    'мене': 'a form of аз, on its card', 'мен': 'a form of аз, on its card',
    'теб': 'a form of ти, on its card', 'тебе': 'a form of ти, on its card',
    'го': 'a form of той and то, on their cards', 'него': 'a form of той and то, on their cards',
    'му': 'a form of той and то, on their cards',
    'я': 'a form of тя, on its card', 'нея': 'a form of тя, on its card',
    'ни': 'a form of ние, on its card', 'нас': 'a form of ние, on its card',
    'ви': 'a form of вие, on its card', 'вас': 'a form of вие, on its card',
    'ги': 'a form of те, on its card', 'тях': 'a form of те, on its card',
    'им': 'a form of те, on its card',
    'моя': 'a form of мой (the feminine, and the masculine object), on its card',
    'пара': "'steam', whose own forms count 2,333 of its 174,148: the rest are пари 'money' (A1)",
    'ща': "'to want', a bookish word whose count is щях, щеше, the past of the future particle ще",
    'пръв': "a variant of първи 'first', on this level's own card",
    # Read off the A2 ranking (2026-11-16).
    'бе': "an emphatic particle, whose count is бе 'was', the aorist of съм (A1)",
    'твоя': 'a form of твой (A1), on its card', 'нашия': 'a form of наш (A1), on its card',
    'нашият': 'a form of наш (A1), on its card', 'нашите': 'a form of наш (A1), on its card',
    'вашите': 'a form of ваш (A1), on its card',
    'брава': "'lock (of a door)', whose own forms count 193 of its 32,443: the rest are браво 'bravo'",
    'кос': "'blackbird', whose own forms count 224 of its 29,357: the rest are коса 'hair' (A2)",
    'тоалетен': "'dressing', whose own forms count 47 of its 22,890: the rest are тоалетна 'toilet' (A2)",
    'поява': "'appearance', whose own forms count 496 of its 24,511: the rest are появи, of the verb появя се",
    'окажа': "glossed only 'in idioms'",
    'франк': "'franc', whose count is the name Frank",
    'том': "'volume (book)', whose count is the name Tom",
    'кучи': "an insult (кучи син 'son of a bitch')",
    'рожден': "'birth' as an adjective, counted from рожден ден 'birthday', a phrase",
    # Read off the B1 ranking (2026-11-16).
    'обед': 'a variant spelling of обяд (A1)',
    'тука': 'a colloquial variant of тук (A1)',
    'вашия': 'a form of ваш (A1), on its card', 'неговия': 'a form of негов (A1), on its card',
    'субтитри': "counted from the subtitle files' own credit lines",
    'почин': "'initiative', whose own forms count 8 of its 16,555: the rest are почина 'died'",
    'спека': "'to cake, to dry up', whose own forms count 4 of its 16,313",
    'рея': "'to soar', whose own forms count 256 of its 17,420",
    'гар': "'smoky', whose own forms count 191 of its 13,891",
    'аба': "'coarse woollen cloth', whose own forms count 131 of its 9,314",
    'ахам': "'to cry \"ah!\"', whose own forms count 329 of its 13,261: the rest are the interjection аха",
    'ала': "a bookish 'but'; Bulgarian's everyday word is но (A1)",
    'бон': "'voucher', whose own forms count 1,378 of its 7,435",
    'ре': "the note D, whose count is ре in other words' lines",
    'дон': "'don (a title)', whose count is the name Don",
    'ким': "'caraway', whose count is the name Kim",
    'скот': "'livestock', whose count is the name Scott",
    'лос': "'moose', whose count is Лос Анджелис 'Los Angeles'",
    'док': "'dock', whose count is Doc, a form of address in the subtitles",
    'мак': "'poppy', whose count is the name Mac",
    'стан': "'loom', whose count is the name Stan",
    'дан': "'tribute', whose count is the name Dan",
    'франций': "'francium', whose count is Франция 'France'",
    'индий': "'indium', whose count is Индия 'India'",
    'калифорний': "'californium', whose count is Калифорния 'California'",
    'германий': "'germanium', whose count is Германия 'Germany'",
    'страхувам': "glossed only 'used in страхувам се', a pointer rather than a meaning",
    # Read off the B2 ranking (2026-11-16).
    'лин': 'whose count is the name Lynn',
    'брус': 'whose count is the name Bruce',
    'бек': 'whose count is the name Beck',
    'марс': 'Mars, a proper name',
    'мая': "'yeast', whose count is the name Maya",
    'кен': 'whose count is the name Ken',
    'линкълн': 'a proper name (Lincoln)',
    'форд': 'a proper name (Ford)',
    'клей': "'glue', whose count is the name Clay",
    'дяна': 'whose count is the name Dyana',
    'кат': 'whose count is the name Kat',
    'тара': "'tare', whose count is the name Tara",
    'зина': 'whose count is the name Zina',
    'дев': 'whose count is the name Dev',
    'лъка': 'whose count is the name Luka',
    'тор': "'manure', whose count is the name Thor",
    'лен': "'flax', whose count is the name Len",
    'вал': "'shaft', whose count is the name Val",
    'бей': "'bey', whose count is the name Bey or Bay",
    'ма': 'a particle whose count is a hesitation in the subtitles',
    'ар': "'are (a unit)', whose count is other words' lines",
    'дьо': 'the French particle de, in names',
    'кап': "whose count is cap in other words' lines",
    'ъъ': 'a hesitation noise',
    'ъх': 'a hesitation noise',
    'нейния': 'a form of неин (A1), on its card',
    'техния': 'a form of техен (A1), on its card',
    'единия': 'a form of един (A1), on its card',
    'дребни': 'the plural of дребен, on its card',
    'ела': 'the imperative of дойда (A1)',
    'таз': 'a variant of тази, the feminine of този (A1)',
    'чек': "glossed only 'chequer'",
    'шибаняк': 'a swear word',
    'шибания': 'a swear word',
    'негър': 'a racial slur',
    'цица': 'slang for a breast',
    'дупе': 'slang for the backside',
    'тоба': 'a percussion instrument, whose own forms count 71 of its 5,558',
    'логик': "'logician', whose own forms count 7 of its 4,565: the rest are логика 'logic'",
    'кинт': 'slang for the lev, whose own forms count 41 of its 4,422',
    'китя': "'to adorn', whose own forms count none of its 3,607",
    'опреда': "'to spin (textiles)', whose own forms count none of its 2,668",
    'начета': "'to find a deficit in', whose own forms count none of its 2,615",
    'лича': "'to discern', whose own forms count 3 of its 4,144",
    'каля': "'to temper (metal)', whose own forms count 11 of its 3,584",
    'барна': 'slang, whose own forms count 29 of its 3,671',
    'оказвам': "glossed only 'in idioms'",
    'нищ': "'destitute', whose own forms count 19 of its 3,965: the rest are нищо 'nothing' (A1)",
    'околен': "'nearby', whose own forms count 9 of its 3,300: the rest are около 'around' (A1)",
    'следен': "'following', whose own forms count 142 of its 4,119: the rest are следи, of следя (A2)",
    'поли': "'mountain slopes', whose count is поли, the plural of пола 'skirt' (A2), and the name Polly",
    'съглася': "glossed only 'used in съглася се', a pointer rather than a meaning",
    'касая': "glossed only 'see касае се', a pointer rather than a meaning",
    'наранявания': 'a participle of наранявам, glossed as a form',
    'трябвам': "the personal 'to be needed', beside трябва 'must' (A1); its count is трябва's",
    'брей': "'bryony', whose count is the interjection брей",
    'патя': "'to suffer misfortune', whose own forms count 20 of its 3,814",
}

SWEARS = {'мамка', 'путка', 'шибан', 'шибам', 'еба', 'курва', 'кучка', 'педал', 'лайно', 'гъз',
          'задник', 'копеле', 'идиот', 'глупак', 'тъпак', 'кретен', 'боклук', 'мръсник'}

ONE_LETTER = {'в', 'с', 'у', 'и', 'а', 'я', 'о'}


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
