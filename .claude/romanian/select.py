#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`ro_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ro import fold
from ro_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-09).  Each with its reason.  Most are a
# closed-class headword whose spelling is also a commoner word's FORM, so the
# indeclinable-own-spelling rule (`extract.py`) handed it that form's count.
EXCLUDE = {
    'e': "its count is e, the short form of este 'is'; the card would open on the letter",
    'o': "its count is the article o 'a' and the pronoun o 'her', taught on un and el",
    'ai': "its count is ai 'you have', a form of avea",
    'au': "its count is au 'they have', a form of avea",
    'mă': "its count is the pronoun mă 'me', not the interjection",
    'mi': "its count is the clitic mi 'to me', not the note E",
    'ia': "its count is ia 'takes / take!', a form of lua",
    'bună': "its count is the feminine of bun 'good'; the greeting is a phrase",
    'mea': "taught on the card of meu, whose feminine it is",
    'vârtejire': "a rare noun whose generated table claims forms of vârteja",
    'ziua': "taught as zi 'day', whose definite form it is",
    'seara': "taught as seară 'evening', whose definite form it is",
    'noaptea': "taught as noapte 'night', whose definite form it is",
    'mie': "its count is the pronoun mie 'to me'; the number is the inventory's",
    'of': "an interjection the subtitles count from English lines",
    'k': "a letter, counted from text messages",
    'hei': "an interjection, counted from subtitles",
    'naiba': "the devil, in an oath (la naiba)",
    # read off the A2 ranking (2026-11-09)
    'geac': "its count is geacă 'jacket', whose forms it shares; the noun is a flag",
    'hain': "its count is haină 'coat', whose forms it shares",
    'tom': "its count is Tom, the name in every other subtitle line",
    'secund': "its count is secundă 'second (of time)', whose forms it shares",
    'mor': "its count is mor 'I die', a form of muri; the entry is a bear's growl",
    'cina': "its count is cină 'dinner', whose definite form it is",
    'câte': "a form of cât, taught in A1",
    'făcut': "the past participle of face, shown on its card",
    'revedere': "counted from la revedere, taught in A1",
    'gura': "its count is gura 'the mouth', a form of gură",
    'dimineața': "taught as dimineață 'morning', whose definite form it is",
    'uf': "an interjection, counted from subtitles",
    'ah': "an interjection, counted from subtitles",
    'adaptare': "counted from the subtitle files' own credit line (Adaptare: ...)",
    'fost': "the past participle of fi, shown on its card",
    'cui': "the dative of cine, shown on its card",
}

# Swearing and insults are never in a level deck.
SWEARS = {'rahat', 'dracu', 'drac', 'târfă', 'cur', 'nenorocit', 'idiot', 'cretin', 'tâmpit',
          'fraier', 'futu', 'pizdă', 'pulă', 'muie', 'bou', 'jigodie', 'bulangiu', 'curvă'}


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
        if len(k) < 2:
            continue
        # a CONTRACTION (n-am, s-a, i-am) is two words joined, taught by its parts
        if '-' in k:
            continue
        # a MULTI-WORD lemma (bună ziua, de la) is the inventory's to choose; the
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
