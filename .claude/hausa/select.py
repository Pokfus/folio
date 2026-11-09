#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining Wiktionary words.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`hausa_level.words_below`).

THE FILL TAKES ONLY WIKTIONARY'S WORDS -- never a hand gloss, which exists for the
inventory alone -- and leaves out:
  · a proper name (a person, a place, a day: the days are the inventory's);
  · a word whose every sense is weak (rare, archaic, dialectal ...);
  · a multi-word entry, which is the phrases deck's;
  · the hand list `EXCLUDE`, each line with its reason -- read off the ranking.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ha import norm
from hausa_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'mashi': 'its count is the dialect "mishi / mashi" (to him), not "spear"',
    'bana': 'its count is "ba na" (I do not) written as one word, not "this year"',
    'baka': 'its count is "ba ka" (you do not) written as one word, not "bow" or "mouth"',
    'dau': 'a short form of ɗauka, which the inventory teaches',
    'dari': 'its count is ɗari "hundred" typed without its hook',
    'guɗa': 'its count is "guda" (a single, one) matched without the hook, not "ululation"',
    'kanta': 'its count is "kanta" (herself; on her), the noun kai with a suffix',
    'maya': 'its count is not the weevil: a run of joined and mistyped words',
    'sako': 'its count is saƙo "message" typed without its hook, not the gourd pod',
    'tabo': 'its count is taɓo / taɓa "touch" typed without the hook, not "scar"',
    'mishi': 'its count is the dialect "mishi" (to him)',
    'miki': 'its count is the pronoun "miki" (to you, a woman), not "vulture"',
    'banda': 'its count is "banda" (apart from, except), not the dried meat',
    'fashe': 'its count is the verb "to burst, to break", not the children\'s game',
    'wau': 'its count is not the Arabic letter',
    'goge': 'its count is the verb "to rub, to polish", not the fiddle',
    'maye': 'its count is the verb "to replace", not "drunkenness"',
    'karuwa': 'its count is ƙaruwa "increase" typed without its hook',
    'aboka': 'its count is abokan, the plural abokai with the linker, cut to a wrong stem',
    'kafa': 'its count is ƙafa "foot" typed without its hook; ƙafa is taught',
    'ƴar': 'a spelling pointer (Niger standard spelling of \'yar), not a meaning',
    'ƴan': 'a spelling pointer (Niger standard spelling of \'yan), not a meaning',
    'matukar̃': 'a variant spelling of matuƙar, a conjunction better met in a sentence',
    'sin': 'the Arabic letter, counted from the Hausa word "sin" in running text',
    'bil': 'a rare loan ("bill, invoice") whose count is joined and mistyped words',
    'karama': 'its count is ƙarama, the feminine of ƙarami, typed without its hook',
    'shin': 'the question particle Wiktionary glosses only by its use; taught badly as a word',
}

# Swearing and insults are never in a level deck.
SWEARS = set()


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses']) \
        and any(e['pos'] != 'name' for e in L['entries'])


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = norm(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            rows.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    excl = {norm(s) for s in EXCLUDE} | {norm(s) for s in SWEARS}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in below or k in excl or ' ' in k:
            continue
        if any(e['src'] == 'hand' for e in L['entries']):
            continue
        if L['word'][:1].isupper() or not usable(L) or L['freq'] < 1:
            continue
        seen.add(k)
        fill.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if len(rows) < TARGET[LEVEL]:
        print(f'  SHORT of the target {TARGET[LEVEL]}')
    if missing:
        print('  NOT IN WIKTIONARY OR hand.py (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
