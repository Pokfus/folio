#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`tamil_level.words_below`).
A word in the inventory may name its parts of speech (`சரி:intj+noun`); every one
named must exist, or the word is reported and dropped.

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ta import fold
from tamil_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    # a verb form Wiktionary also files as a word of its own, whose count is the verb's
    'வந்து': 'the adverbial participle of வா "come", filed as an interjection "a filler word"',
    'போய்': 'the adverbial participle of போ "go", filed as a dismissive interjection',
    'விட்டு': 'the adverbial participle of விடு "leave", filed as a postposition',
    'கொண்டு': 'the adverbial participle of கொள், filed as a particle',
    'பார்த்து': 'the adverbial participle of பார் "see", filed as an adverb',
    'செல்ல': 'the infinitive of செல் "go", filed as an adverb "at a distance"',
    'கொள்ள': 'the infinitive of கொள், filed as an adverb',
    'வர': 'the infinitive of வா "come", filed as a postposition "till"',
    'என்ற': 'the adjectival participle of என் "say", defined only as a synonym',
    'என்பது': 'a verbal noun of என் "say"',
    'என': 'the infinitive of என் "say"; the same gloss as என்று, which the fill keeps',
    # a count that belongs to another word than the meaning Wiktionary gives
    'மாட்டு': 'its count is மாட்டேன் / மாட்டான், the negative future ("will not"), not "to fasten"',
    'மக': 'its count is மக்கள் "people", taught on its own',
    'உறுமு': 'its count is உறுமல் alone, a growl, counted from subtitles',
    'ஆல்': '"banyan"; its count is the instrumental ending -ஆல் written apart',
    'அமை': 'its count is அமையும் "will be formed"; the card would open on "to become still"',
    'கிளி': '"parrot", with no form of its own in the list; its count reaches it through a pointer',
    'மை': '"ink", likewise counted through a pointer',
    'துடை': 'its whole count is துடைக்க, 105 times against 3 for any other form: a subtitle artefact',
    'விழுங்கு': 'its whole count is விழுங்க, 74 times: a subtitle artefact',
    'கழுதை': '"donkey", counted as the insult it also is',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# A FILL WORD whose card means one part of speech (the inventory's `word:pos`).
FILL_POS = {
    'மீது': 'postp',          # "on, upon"; the noun "top" is Wiktionary's first
    'பிறகு': 'postp',         # "after"; the noun is "posteriority"
    'மூலம்': 'postp+noun',    # "by means of, through" first
    'மாதிரி': 'postp+noun',   # "like" first
    'போல்': 'postp',          # "like"; the verb "to resemble" is literary
    'மேல்': 'postp+adj',      # "on, above"
}

# Swearing and insults are never in a level deck.
SWEARS = {'புணர்', 'ஓத்தா', 'தேவடியா', 'பொறுக்கி', 'முட்டாள்', 'மலம்'}


CASE_OF = re.compile(r'^(nominative|accusative|dative|genitive|locative|sociative|instrumental|'
                     r'ablative|vocative|benefactive|oblique)\b[^;]* of ', re.I)


def usable(L):
    gl = [g for e in L['entries'] for g in e['glosses']]
    # a case form Wiktionary files as a pronoun of its own ("sociative of நான்")
    return any(not g['weak'] and not CASE_OF.match(g['g']) for g in gl)


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
                # the common spelling of a word Wiktionary files under another (कुर्सी):
                # the card prints the spelling written here and the target's meanings
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not all(any(e['pos'] == p for e in L['entries'])
                                         for p in pos.split('+'))):
                missing.append(item)
                continue
            seen.add(k)
            if via:
                seen.add(via)         # the fill must not deal the other spelling again
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                         'source': 'inventory', 'topic': topic,
                         'roman': lex[k].get('roman', '') if via else ''})
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
        # a MULTI-WORD lemma (बात करना, के बारे में) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': FILL_POS.get(L['word'], ''),
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
