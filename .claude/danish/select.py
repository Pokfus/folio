#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`danish_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from da import fold
from danish_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-15).  Each with its reason.
EXCLUDE = {
    # A FORM TAUGHT ON ANOTHER CARD: Wiktionary gives each a full entry of its own, and
    # the closed-class rule hands it its whole count, so it was dealt as a word.
    'et': 'the neuter of the article en, taught on its card',
    'mit': 'the neuter of min, whose table shows it', 'dit': 'the neuter of din, whose table shows it',
    'sit': 'the neuter of sin, whose table shows it',
    'mine': 'the plural of min (its noun is "a look, a mine")', 'dine': 'the plural of din',
    'sine': 'the plural of sin',
    'alt': 'the neuter of al, taught as alle', 'andet': 'the neuter of anden, taught there',
    'intet': 'the neuter of ingen, taught there',
    'noget': 'the neuter of nogen "something", taught there; its entry is only the adverb "somewhat"',
    'hvilket': 'the neuter of hvilken, taught there', 'denne': None,
    # ITS COUNT IS ANOTHER WORD'S: a verb's imperative, which `extract.py` hands to the
    # lemma that heads the spelling
    'lad': 'its count is lad! "let!" (lade), not the adjective "lazy"',
    'tag': 'its count is tag! "take!" (tage), not the noun "roof"',
    'hold': 'its count is hold! "hold!" (holde), not the noun "team"',
    'gange': 'the plural of gang "time", taught there; its entry is "to multiply"',
    'hør': 'its count is hør! "listen!" (høre), not the noun "flax"',
    'mangen': 'taught as mange (`ALIAS`)', 'al': 'taught as alle (`ALIAS`)',
    # A FORM OF ANOTHER WORD, filed with a meaning of its own
    'fund': 'its count is fundet, the participle of finde; the noun "a find" is rare beside it',
    'gode': 'its count is the plural of god; the noun "a blessing" is rare beside it',
    'bedste': 'the superlative of god, whose table shows it',
    'vis': 'its count is vist "probably" and på en måde; the noun "manner" is rare',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'fanden', 'fandme', 'fuck', 'fucking', 'lort', 'pis', 'pisse', 'røv', 'satan', 'helvede',
          'kraftedeme', 'kælling', 'luder', 'idiot', 'fjols', 'nar', 'bøsse', 'kneppe', 'pik',
          'fisse', 'skide', 'shit', 'svin', 'røvhul', 'dælme', 'sgu', 'fandeme'}

# A FILL WORD'S READING: the part of speech its count is for, where Wiktionary lists
# another first.
FILL_POS = {'tro': 'verb', 'nok': 'adv', 'lige': 'adv', 'slå': 'verb', 'prøve': 'verb',
            'helt': 'adv', 'lade': 'verb', 'bede': 'verb', 'vise': 'verb', 'vinde': 'verb',
            'næste': 'adj', 'grund': 'noun', 'gift': 'adj', 'stå': 'verb', 'kende': 'verb',
            'lukke': 'verb', 'ringe': 'verb', 'rejse': 'verb', 'følge': 'verb', 'ende': 'verb',
            'fejl': 'noun'}

# A WORD DEALT BY ANOTHER'S COUNT.  The pronoun `I` "you (plural)" is counted in the
# subtitles under its lower case, the preposition `i`, so it is dealt by its object form's.
SAME_AS = {'I': 'jer'}

# A LEARNER'S WORD WIKTIONARY HEADS UNDER ANOTHER: the card prints the word written in
# the inventory, with the headword's meanings and table.  `mange` "many" is the plural of
# Wiktionary's `mangen` (archaic in the singular); `alle` "all, everyone" of `al`.
ALIAS = {'mange': 'mangen', 'alle': 'al'}


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
            if k in ALIAS:
                via = ALIAS[k]
                tgt = lex[via]
                L = dict(tgt, word=w, freq=tgt['freq'])
            elif L and 'alt_of' in L:
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
        if len(k) < 2 and k not in ('i', 'å', 'ø'):
            continue
        # a MULTI-WORD lemma (holde af, for eksempel) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        # AN ALTERNATIVE SPELLING THE LEVEL ALREADY HAS (`nogle` beside `nogen`,
        # `meget` beside `megen`): Wiktionary gives both full entries, glossed
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
