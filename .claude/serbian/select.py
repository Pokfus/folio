#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`serbian_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, dialectal, Croatian or Bosnian
    only, Ijekavian ...);
  · a form of a personal pronoun (`me`, `ga`, `njega`, `tobom`): Wiktionary
    gives many their own entries, and the pronoun's card already shows them;
  · a one-letter lemma that is not a word (`u`, `s`, `i`, `a`, `o` are);
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sr import fold, pronoun_forms, PRONOUN_CASES
from serbian_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-16).  Each with its reason.
EXCLUDE = {
    'je': "the third-person present of biti ('is'), on biti's card",
    'si': "the second-person present of biti, on biti's card",
    'jeste': "the emphatic third-person present of biti, on biti's card",
    'bilo': "the neuter past participle of biti ('was'), on biti's card",
    'sam': "counted mostly as biti's 'I am'; the adjective 'alone' is a minor share",
    'deca': "the plural of dete, on dete's card",
    'ljudi': "the plural of čovek, on čovek's card",
    'svi': "the plural of sav, on sav's card",
    'one': "the feminine plural of on, on the pronoun cards",
    'puta': "the genitive of put ('times'), on put's card",
    'god': "the particle of kad god, ko god ('-ever'), counted from those phrases",
    'nem': "'mute', whose count is nema 'there is no'",
    'tko': "the Croatian 'who'; Serbian says ko, on A1",
    'kući': "'home(wards)', the dative of kuća, on kuća's card",
    'mnom': "the instrumental of ja, on ja's card",
    'te': "counted as the clitic of ti ('you'), on ti's card; the conjunction is a minor share",
    'red': "'order, row', counted from u redu 'all right'",
    's': "the short form of sa 'with', on A1",
    'sad': "the short form of sada 'now', on A1",
    'koga': "the genitive and accusative of ko, on ko's card",
    'čemu': "the dative of šta, on šta's card",
    'nikada': "the long form of nikad, on A1",
    'treba': "'girl, chick', whose count is treba 'it is needed', the third person of trebati (on A1)",
    'kada': "'bathtub', whose count is kada 'when', the long form of kad (on A1)",
    'drago': "the neuter of drag, counted from drago mi je 'I'm glad', on drag's card",
}

SWEARS = {'sranje', 'jebati', 'kurac', 'pička', 'govno', 'kurva', 'pizda', 'drkati', 'jebeni',
          'kučka', 'peder', 'seronja', 'debil', 'idiot', 'kreten', 'budala', 'glupan', 'dupe',
          'guzica', 'šupak', 'sisa', 'kurvin'}

ONE_LETTER = {'u', 's', 'i', 'a', 'o', 'k'}


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    pron = set()
    for p in PRONOUN_CASES:
        pron |= {fold(x) for x in pronoun_forms(p)} - {p}
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
                for _ in range(3):         # `ćerka` -> `kćerka` -> `kći`
                    if 'alt_of' not in lex.get(via, {}):
                        break
                    via = lex[via]['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])) \
                    or not usable(L):
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
        if k in seen or k in below or k in swears or k in excl or k in pron:
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
        print('  NOT IN WIKTIONARY, OR NOT SERBIAN THERE (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
