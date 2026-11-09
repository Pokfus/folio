#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`bengali_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bn import fold
from bengali_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'করার': '"agreement, condition" -- its count is করা\'s genitive, করার "of doing"',
    'হয়': '"either", a conjunction; its count is হওয়া\'s commonest form, হয় "is"',
    'হয়ে': '"through"; its count is হওয়া\'s participle, হয়ে "having become"',
    'হতে': '"from" (literary); its count is হওয়া\'s infinitive, হতে "to be"',
    'করে': '"by means of"; its count is করা\'s participle and present, করে "having done; does"',
    'ধরে': '"for (a time)"; its count is ধরা\'s participle',
    'হেই': '"that (out of sight)"; its count is the subtitles\' English "hey"',
    'তার': '"wire"; its count is তার "his, her", taught on the card of সে',
    'ভাল': 'the older spelling of ভালো, which the inventory teaches',
    'এখান': '"here" as a bare stem; its count is এখানে, taught on its own',
    'হিসেব': 'Wiktionary files it as a regional form of হিসাব',
    'মত': 'the older spelling of মতো "like", which the inventory teaches',
    'নাই': 'the older spelling of নেই, which the inventory teaches',
    'বাহির': 'the literary form of বাইরে "outside", which the inventory teaches',
    'ভালবাসা': 'the older spelling of ভালোবাসা, dealt on its own',
    'প্লীজ': 'the English "please" in Bengali letters; the inventory teaches দয়া করে',
    'নই': '"river; new"; its count is নই "(I) am not", the negative of হওয়া',
    'দে': '"with" (dialect); its count is দে "give!", an imperative of দেওয়া',
    'গেলা': '"to swallow"; its count is গেল "went", a past form of যাওয়া',
    'জান': '"life; darling"; its count is জান "(you) know", a form of জানা',
    'বওয়া': '"to carry; to flow"; its count is the forms it shares with বলা and হওয়া',
    'কাছ': 'the bare stem of কাছে "near", which the inventory teaches',
    'আয়': '"income"; its count is আয় "come!", an imperative of আসা',
    'তা': '"oblique base of সে" in Wiktionary\'s one sense; the card would teach a pointer',
    'দায়িত্ব': '"responsibility" -- but Wiktionary\'s entry carries চেষ্টা\'s senses ("attempt, endeavour")',
    'মিস': '"Miss"; its count is the subtitles\' English "miss"',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'শালা', 'শালী', 'হারামি', 'হারামজাদা', 'কুত্তা', 'কুত্তার বাচ্চা', 'বাল', 'চুদা',
          'মাগী', 'বেজন্মা', 'শুয়োর', 'গাধা'}

# A PRONOUN'S CASE FORM IS ON THE PRONOUN'S CARD: Wiktionary gives `আমাদের`, `তোমাকে`,
# `তাদের` entries of their own whose one sense is "objective of আমরা", and the fill
# would deal each as a word.  The card of আমি shows আমাকে and আমার.
CASEFORM = re.compile(r'^(objective|genitive|possessive|locative|oblique)[^;]* of \S+( \([^)]*\))?$')


def caseform(L):
    gl = [g['g'] for e in L['entries'] for g in e['glosses']]
    return bool(gl) and all(CASEFORM.match(g) for g in gl)


def usable(L):
    gl = [g for e in L['entries'] for g in e['glosses']]
    return any(not g['weak'] for g in gl)


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
            via, roman = '', ''
            if L and 'alt_of' in L:
                roman = L.get('roman', '')
                # the common spelling of a word Wiktionary files under another (নেই):
                # the card prints the spelling written here and the target's meanings
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            # the spelling the inventory wrote is the one printed (কী, not the fold's কি)
            rows.append({'key': k, 'via': via, 'word': w if fold(w) == fold(L['word']) else L['word'],
                         'roman': roman, 'freq': L['freq'], 'pos': pos or '',
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
        if len(k) < 2 and k not in ('এ', 'ও'):
            continue
        # a STEM (আছ-) or an affix is not a word a learner meets bare
        if k.endswith('-') or k.startswith('-'):
            continue
        if caseform(L):
            continue
        # a MULTI-WORD lemma (কথা বলা, মনে করা) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'roman': '', 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
