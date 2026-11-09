#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`greek_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gr import fold
from greek_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    # THE ARTICLE'S FORMS: taught on the card of `ο`, whose table shows every one.
    # Wiktionary files each as a pronoun too ("it", "him", "her"), and the
    # indeclinable rule hands the pronoun the article's whole count, so `το` would be
    # dealt as A1's commonest word and taught as "it".  (`του`, `της`, `τους` stay:
    # "his", "her", "their" are the inventory's possessives.)
    'το': 'the article (neuter), taught on the card of ο',
    'τα': 'the article (neuter plural), taught on the card of ο',
    'τον': 'the article (masculine accusative), taught on the card of ο',
    'την': 'the article (feminine accusative), taught on the card of ο',
    'τη': 'the article (feminine accusative), taught on the card of ο',
    'τις': 'the article (feminine accusative plural), taught on the card of ο',
    'των': 'the article (genitive plural), taught on the card of ο',
    'οι': 'the article (nominative plural), taught on the card of ο',
    'η': 'the article (feminine), taught on the card of ο',
    'απ': "an interjection; its count is απ', the elided από",
    'κύριε': 'the vocative of κύριος, taught there',
    'δε': "the short form of δεν, which its count is; Wiktionary's own entry is the conjunction δε 'on the other hand'",
    'δυο': 'the unaccented spelling of δύο, taught there',
    'συμβαίνω': 'its only sense is a pointer to συμβαίνει, which is dealt itself',
    'φέρω': 'its count is φέρω, the dependent form of φέρνω "to bring"',
    'χρόνιος': 'its count is χρόνια "years", the plural of χρόνος',
    'καλό': 'the neuter of καλός, taught there; filed as a noun "good", it takes the adjective\'s count',
    'κακό': 'the neuter of κακός, taught there, for the same reason',
    'νέα': 'the plural "news" is filed as a singular, and its count is the feminine of νέος',
    'νέο': '"a piece of news"; its count is the neuter of νέος, taught there',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'μαλάκας', 'γαμώ', 'γαμιέμαι', 'πούστης', 'σκατά', 'πουτάνα', 'γαμημένος', 'αρχίδι',
          'μουνί', 'καριόλης', 'καριόλα', 'κώλος', 'μαλακία', 'βλάκας', 'ηλίθιος', 'γαμιόλης',
          'πουτανιά', 'κωλόπαιδο', 'γαμήσι', 'πούτσα', 'ψόφος'}


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
                # the common spelling of a word Wiktionary files under another (कुर्सी):
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
        if len(k) < 2 and k not in ('ή', 'ο'):
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
        # AN ALTERNATIVE SPELLING THE LEVEL ALREADY HAS (`ημέρα` beside `μέρα`, `αγαπάω`
        # beside `αγαπώ`, `μην` beside `μη`): Wiktionary gives both full entries, glossed
        # alike, so a lemma whose glosses are those of a word already chosen is the same word.
        sig = gloss_sig(L)
        if sig in sigs:
            continue
        sigs.add(sig)
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
