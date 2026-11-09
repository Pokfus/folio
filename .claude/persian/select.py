#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`hindi_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fa import fold
from persian_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'رو': 'its count is the spoken را (the object marker), which the inventory teaches, not "face"',
    'می': 'its count is the verb prefix می- written apart by the subtitles, not "wine"',
    'ای': 'its count is the ending -ای written apart and the vocative, not a word to teach alone',
    'منو': 'its count is spoken من رو "me (object)", not "menu"',
    'بهت': 'its count is spoken به تو "to you", not "consternation"',
    'موندن': 'the spoken form of ماندن, which the inventory teaches',
    'واسه': 'the spoken form of برای, which the inventory teaches',
    'آختن': 'its count is آخه "but, after all" (spoken), whose forms it shares',
    'می‌گم': 'a form of گفتن, not a lemma',
    'اینا': 'the spoken form of اینها',
    'تر': 'its count is the comparative suffix -تر written apart',
    'دار': 'its count is the suffix -دار written apart',
    'دریدن': 'its count is دری and other shapes it shares, not the verb',
    'بهترین': 'Wiktionary\'s entry is a pointer, not the superlative of خوب, which that card shows',
    'یکم': 'its count is spoken یه کم "a little", not "first"',
    'آش': 'its count is -اش "his, her" written apart, folded with آ',
    'نبود': 'a form of بودن, taught on its card',
    'بلی': 'the formal spelling of بله, which the inventory teaches',
    'اره': 'its count is آره "yeah" written without the madda (the inventory teaches آره), not "saw"',
    'کل': 'two words share the spelling, kal "bald" and kol "whole"; the count cannot say which',
    'همش': 'a spoken form (همه‌اش "all of it"), not a lemma of the written language',
    'یارو': 'slang, and pejorative',
    'ها': 'its count is the plural suffix -ها written apart by the subtitles, not the interjection',
    'کشتن': 'to kill: the subtitles\' crime drama, not a beginner\'s word',
    'لعنت': 'a curse, counted from subtitles',
    'لعنتی': 'damned, counted from subtitles',
    'اوه': 'an exclamation the subtitles count from every scene',
    'آه': 'a sigh, counted from subtitles',
    'هی': 'hey, counted from subtitles',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'کثافت', 'احمق', 'حرومزاده', 'حرامزاده', 'عوضی', 'لعنتی', 'گه', 'کس', 'کیر', 'جنده',
          'خفه'}


def usable(L):
    gl = [g for e in L['entries'] for g in e['glosses']]
    return any(not g['weak'] for g in gl)


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            item = item.replace('\u200c', '\u200c')
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            via = ''
            if L and 'alt_of' in L:
                # the common spelling of a word Wiktionary files under another (a spelling Wiktionary files under another):
                # the card prints the spelling written here and the target's meanings
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
    for k, L in sorted(lex.items(), key=lambda kv: -kv[1]['freq']):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if len(k) < 2:
            continue
        # a MULTI-WORD lemma (کار کردن, دوست داشتن) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
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
