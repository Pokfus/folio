#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`swahili_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal ...);
  · a multi-word lemma (the inventory's to choose: its rank is an estimate);
  · a lemma that is only a phrase or a proverb (the phrases deck's);
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sw import norm
from swahili_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'a': 'the genitive particle -a ("of"): its count is wa / ya / la / cha / za, taught as grammar, not as a word',
    'o-ote': 'the agreeing stem -o -ote "any, all": a grammar point, not a beginner\'s word card',
    'husu': 'its count is kuhusu "about", taught on its own card at a later level',
    'kuna': '"to scrape": its count is kuna "there is", a form of -wa na taught on that card',
    'kuwa': 'the conjunction "that", whose spelling is the infinitive of -wa "to be" (taught as kuwa); A1 teaches kwamba "that"',
    'nina': '"mother" (poetic): its count is nina "I have"',
    'wili': 'the stem -wili "two"; A1 counts with mbili, on its own card',
    'pi': 'a suffix, not a word',
    'ina': '"certainly" (rare): its count is ina "it has"',
    'ke': 'the stem -ke "female" (mke, mwanamke), not a word used alone',
    'huwa': 'the habitual of -wa ("is usually"), a verb form, not a lemma: taught on kuwa',
    'sivyo': 'a negative copula form ("that is not so"), not a verb lemma',
    'ndio': 'a variant spelling of ndiyo, which A1 teaches',
    'mwanaume': 'a variant spelling of mwanamume, which A1 teaches',
}

# Swearing and insults are never in a level deck.
SWEARS = {'malaya', 'mjinga', 'mpumbavu', 'kuma', 'mshenzi', 'fala'}


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


AGREEING = ('adj', 'pron', 'det', 'num', 'particle')


def say_of(L, pos=''):
    """The headword as a card prints and speaks it."""
    ents = [e for e in L['entries'] if not pos or e['pos'] == pos] or L['entries']
    e = ents[0]
    if e['pos'] == 'verb':
        return e['inf'] or 'ku' + L['word']
    if e['canon'] and e['pos'] in AGREEING:
        return e['canon'].lstrip('-')
    return L['word']


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, said, missing = [], set(), set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            k = norm(w.replace('_', ' '))
            L = lex.get(k)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            say = say_of(L, pos)
            if k in seen or say in below:
                continue
            seen.add(k)
            said.add(say)
            rows.append({'key': k, 'word': L['word'], 'say': say, 'freq': L['freq'],
                         'pos': pos or '', 'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    swears = {norm(s) for s in SWEARS}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in swears or k in EXCLUDE or ' ' in k or '-' in k:
            continue
        if not usable(L) or L['freq'] <= 0:
            continue
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        say = say_of(L)
        if say in below or say in said:
            continue
        seen.add(k)
        said.add(say)
        fill.append({'key': k, 'word': L['word'], 'say': say, 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
