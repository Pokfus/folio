#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`) and the POINTED word it teaches
(`choose.choose`), so two words of one spelling can be two cards.

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`hebrew_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, Biblical ...) -- the
    subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma (the prefix words ו ה ב כ ל מ ש);
  · a lemma of several words, which is the inventory's to choose;
  · the hand list `EXCLUDE`, each line with its reason, and swearing.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from he import fold
from hebrew_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY
from choose import choose, usable, PICK


def pick_pos(L):
    """The part of speech a hand pick names (`PICK`), which the card then opens on."""
    return PICK.get(L['word'], '').partition(':')[2]

# Read off the A1 ranking (2026-11-12).  Each with its reason.
EXCLUDE = {
    'יא': 'a vocative particle used before slurs; its count is the subtitles\' Arabic "ya"',
    'אד': 'its count is the English name Ed, not "vapour"',
    'שש': 'Wiktionary has no number "six" under this spelling, only "linen" and "rejoice"',
    'שאת': 'its count is ש + את ("that you"), not "tumour"',
    'הכיל': 'its count is הכל "everything", which it shares, not "to contain"',
    'ביית': 'its count is לבית "to the house", which it shares, not "to tame"',
    'שוהם': 'its count is the name Shoham, not "onyx"',
    'קטון': 'its count is קטן "small" (the inventory\'s), whose forms it shares',
    'ברר': 'its count is ברור "clear", whose forms it shares, not "to sort"',
    'בז': 'its count is shapes of other words, not "to despise"',
    'אנוש': 'its count is shapes of אנשים and אנושי, not "mortal"',
    'שהה': 'its count is שהיה "that was", which it shares, not "to stay"',
    'אי': 'its count is אי in אי אפשר "impossible", not "island"',
    'זימן': 'its count is מזמן "long ago", which it shares, not "to summon"',
    'יידע': 'its count is יודע "knows", which it shares, not "to inform"',
    'לשם': 'Wiktionary\'s only entry is a precious stone; the count is לשם "(to) there"',
    'היינו': 'its count is "we were" (a form of היה), not "that is to say"',
    'ולא': 'ו + לא "and not", written as one word',
    'לדעת': 'its count is the infinitive "to know" (a form of ידע), not "according to"',
    'משנה': 'its count is לא משנה "it doesn\'t matter" (a form of שינה), not "deputy"',
    'אימת': 'its count is אמת "truth" and אימא, whose shapes it shares, not "to verify"',
    'הרג': 'to kill: the subtitles\' crime drama, not a beginner\'s word (the Persian rule)',
    'רצח': 'to murder: the subtitles\' crime drama',
    'ירה': 'to shoot: the subtitles\' crime drama',
    'דן': 'its count is the name Dan, not "to discuss"',
    'כלך': 'its count is כ + לך and כלכך written short, not the plant "ferula"',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'זין', 'כוס', 'חרא', 'זונה', 'מזדיין', 'לעזאזל', 'מטומטם', 'אידיוט', 'דפוק', 'תחת',
          'שרמוטה', 'בן זונה', 'זיין', 'דפק', 'מניאק', 'חארה'}


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pick = item.partition('=')
            w, _, pos = w.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            L = lex.get(k)
            if not L or 'entries' not in L:
                missing.append(item)
                continue
            if pos and not any(e['pos'] == pos for e in L['entries']) or \
                    pick and not any(e['p'] == pick for e in L['entries']):
                missing.append(item)
                continue
            ents = choose(L, pos, pick)
            p = ents[0]['p']
            if (k, p) in seen or L['word'] + '|' + p in below:
                continue
            seen.add((k, p))
            rows.append({'key': k, 'pick': p, 'word': L['word'], 'freq': L['freq'],
                         'pos': pos or pick_pos(L),
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    keys = {k for k, _ in seen}
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in keys or k in swears or k in excl or len(k) < 2 or ' ' in k:
            continue
        if not any(usable(e) for e in L['entries']) or L['freq'] < 1:
            continue
        ents = choose(L)
        if all(e['pos'] in ('phrase', 'proverb', 'name') for e in ents):
            continue
        p = ents[0]['p']
        if L['word'] + '|' + p in below:
            continue
        keys.add(k)
        fill.append({'key': k, 'pick': p, 'word': L['word'], 'freq': L['freq'], 'pos': pick_pos(L),
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key'], r['pick']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
