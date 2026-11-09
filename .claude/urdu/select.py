#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`urdu_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ur import fold
from urdu_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'ہے': 'its count is ہونا "to be" (ہے "is"); Wiktionary files the spelling only as a vocative particle',
    'ہیں': 'its count is ہونا "to be" (ہیں "are"); Wiktionary files the spelling only as an interjection',
    'گے': 'its count is the future ending -گے; the entry is the English loan "gay"',
    'پھرنا': 'its count is پھر "again, then", which Wiktionary has no Urdu entry for',
    'اسی': 'its count is اسی "this very", the emphatic of اس; the entry is the number eighty',
    'بے': 'a prefix (un-, -less), and the name of a letter',
    'سا': 'its count is a dozen shapes of the suffix -سا; taught as a word it misleads (as in Hindi)',
    'پہ': 'a synonym of پر, which the inventory teaches',
    'پتا': 'its count is پتا "knowledge, clue", the other spelling of پتہ, which the fill takes',
    'دار': 'its count is the suffix -دار (-holder); the entries are rare nouns',
    'افراد': 'a plural (of فرد, "individual"), glossed by Wiktionary as "kinds"',
    'چکنا': 'its count is the auxiliary چکا "already done", a construction taught after A1',
    'علی': 'its count is the name Ali; the entry is an Arabic preposition used only in set phrases',
    'خان': 'its count is a surname',
    'حسین': 'its count is the name Husain',
    'شیخ': 'its count is a surname and a title; the entry opens on "stingy"',
    'نوازنا': 'its count is the name Nawaz',
    'شریف': 'its count is a surname',
    'پوشیدہ': "counted from the subtitle files' own boilerplate: 251st there, 4,365th in written Urdu",
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'سالا', 'کمینہ', 'حرامی', 'کتیا', 'حرامزادہ', 'کمبخت', 'سالی', 'بیوقوف', 'الو', 'بکواس'}


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
            via = ''
            if L and 'alt_of' in L:
                # the common spelling of a word Wiktionary files under another:
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
        if len(k) < 2 and k not in ('و',):
            continue
        # a MULTI-WORD lemma (بات کرنا, کے بارے میں) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 0.5:
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
