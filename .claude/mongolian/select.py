#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`mongolian_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, Inner Mongolian ...);
  · a key of two letters or fewer: a short word takes its count from the
    endings the fallback peels more than from its use;
  · a multi-word entry, a phrase, an interjection or a numeral (the numbers are
    the inventory's, the phrases a phrases deck's);
  · a name of a people or a language the inventory does not teach (the
    encyclopaedia's history articles rank them high);
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mn import key, verb_stem
from mongolian_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-16).  Each with its reason.
EXCLUDE = {
    'нийх': 'its count is нийслэл "capital" and нийт "total" peeled, not "to blow (one\'s nose)"',
    'тул': 'its count is тулд "in order to, because", not the taimen (a fish)',
    'хув': 'its count is хувь "share" and хувьсгал "revolution" peeled, not "amber"',
    'хур': 'its count is хурал "meeting" and хурд "speed" peeled, not "precipitation"',
    'гэдэг': 'a participle of гэх "to say" ("called"), which A1 teaches',
    'ирсэн': 'the past participle of ирэх "to come", which A1 teaches',
    'үүний': 'the genitive of энэ "this", which A1 teaches',
    'дэлхийн': 'the genitive of дэлхий "earth, world", a word of its own',
    'үндэсний': 'the genitive of үндэс "root, nation", a word of its own',
    'хүрээлэн': 'Wiktionary glosses "garden"; its count is хүрээлэн "institute" in the names of '
                'institutions',
    'хэмээх': 'the formal "to say", a second word for гэх, which A1 teaches',
    'онгоц': 'Wiktionary glosses "trough" first; its count is нисэх онгоц "aeroplane" and усан '
             'онгоц "ship", and A1 teaches нисэх онгоц',
    'зүй': 'its count is the "-logy" of the names of sciences, not "rule, principle"',
}


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


def main():
    D = json.load(open('lex.json', encoding='utf-8'))
    lex, ptr = D['lemmas'], D['pointers']
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = key(w)
            if k not in lex and k in ptr:
                k = ptr[k]
            if k in seen or k in below:
                continue
            L = lex.get(k)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            rows.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'pos': pos,
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    excl = {key(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in below or k in excl or ' ' in k or len(k) <= 2:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        if all(e['pos'] in ('phrase', 'intj', 'num') for e in L['entries']):
            continue
        if all(g['g'][:1].isupper() for e in L['entries'] for g in e['glosses'] if not g['weak']):
            continue                     # a people, a language, a name: "German", "Han Chinese"
        seen.add(k)
        fill.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
