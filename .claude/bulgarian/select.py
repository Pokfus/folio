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
