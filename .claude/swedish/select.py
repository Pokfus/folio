#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`swedish_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sv import fold
from swedish_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    # FORMS TAUGHT ON ANOTHER CARD: Wiktionary gives each a full entry of its own, and
    # the closed-class rule hands it its whole count, so it was dealt as a word.
    'ett': 'the neuter of the article en, taught on its card (and the neuter of en "one")',
    'mitt': 'the neuter of min, whose table shows it',
    'ditt': 'the neuter of din, whose table shows it',
    'våra': 'the plural of vår, whose table shows it',
    'era': 'the plural of er "your", whose table shows it (and a noun, "era")',
    'annat': 'the neuter of annan, taught there',
    'vilket': 'the neuter of vilken, taught there',
    'inget': 'the neuter of ingen; ingenting is the inventory\'s "nothing"',
    'nåt': 'the colloquial spelling of något, taught there',
    # NOT A WORD ON ITS OWN AT THIS LEVEL
    'plan': 'two nouns of two genders (ett plan "plane, level", en plan "plan") under one '
            'spelling, which one card cannot give one article',
    'reda': 'met only in ta reda på "to find out"; its entries are "ready" and "order"',
    'va': 'the spoken "what?" and "was"; Wiktionary\'s entry is the abbreviation of vatten och avlopp',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'fan', 'jävla', 'jävel', 'helvete', 'skit', 'fitta', 'kuk', 'hora', 'idiot', 'satan',
          'jävlas', 'skita', 'knulla', 'röv', 'arsle', 'fittig', 'bög', 'skitstövel', 'fanskap',
          'djävul', 'djävla'}

# A FILL WORD'S READING: the part of speech its count is for, where Wiktionary lists
# another first (read off the A1 build, 2026-11-09) -- `tro` is dealt for "to believe",
# not the noun "belief", `ringa` for "to ring, to call", not the adjective "small".
FILL_POS = {'tro': 'verb', 'ringa': 'verb', 'mot': 'prep', 'det': 'pron', 'visa': 'verb',
            'röra': 'verb', 'sticka': 'verb', 'skada': 'verb', 'bry': 'verb'}

# A WORD DEALT BY ANOTHER'S COUNT.  `ska` is the spoken form of the verb whose
# infinitive Wiktionary heads `skola`, and that table claims `ska` and `skulle`,
# so `ska` by its own count would be dealt last of A1 for the commonest modal.
SAME_AS = {'ska': 'skola'}


def gloss_sig(L):
    return tuple(sorted({g['g'] for e in L['entries'] for g in e['glosses'] if not g['weak']}))[:4]


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
                # the common spelling of a word Wiktionary files under another :
                # the card prints the spelling written here and the target's meanings
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            fq = lex[SAME_AS[k]]['freq'] if k in SAME_AS else L['freq']
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': fq, 'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    sigs = {gloss_sig(lex[r['via']] if r['via'] else lex[r['key']]) for r in rows}
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
        if len(k) < 2 and k not in ('i', 'å', 'ö'):
            continue
        # a MULTI-WORD lemma (tycka om, till exempel) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        # AN ALTERNATIVE SPELLING THE LEVEL ALREADY HAS (`sedan` beside `sen`, `något`
        # beside `nåt`): Wiktionary gives both full entries, glossed
        # alike, so a lemma whose glosses are those of a word already chosen is the same word.
        sig = gloss_sig(L)
        if sig in sigs:
            continue
        sigs.add(sig)
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': FILL_POS.get(k, ''),
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
