#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`hungarian_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hu import fold
from hungarian_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY


# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    # A FORM OF A WORD THE DECK TEACHES, which Wiktionary also files as a word of its own:
    # taught on the card whose table shows it.
    'volt': 'the past of van ("was"), taught there; its own entries are "former", a particle and the unit',
    'volna': 'the conditional of van ("would be"), taught there',
    'amit': 'the accusative of ami, taught there',
    'nézd': 'the imperative of néz, taught there',
    'kérlek': "a form of kér (\"I ask you\"), glossed only as a pointer",
    'vége': 'the "its" form of vég, glossed only as a pointer; vég is dealt itself',
    'őt': 'the accusative of ő, taught on its card',
    'szerinte': 'the "his, her" form of szerint, taught there',
    'oh': 'an English spelling; Hungarian writes ó',
    # Read off the A2 ranking (2026-11-12).  Forms whose every sense is a pointer (the card
    # came out with no English at all), each taught on its lemma's card:
    'neve': 'the "his, her" form of név (A1)',
    'élete': 'the "his, her" form of élet (A1)',
    'életem': 'the "my" form of élet (A1)',
    'keze': 'the "his, her" form of kéz (A1)',
    'része': 'the "his, her" form of rész (A1)',
    'feje': 'the "his, her" form of fej (A1)',
    'apám': 'the "my" form of apa (A1)',
    'szeretlek': 'a form of szeret (A1), "I love you"',
    'mit': 'the accusative of mi (A1); its own entry glosses only "why"',
    'egyet': 'the accusative of egy (A1)',
    'annak': 'the dative of az (A1)',
    'arról': 'the delative of az (A1)',
    'állj': 'the imperative of áll (A1)',
    'nézze': 'the formal imperative of néz (A1)',
    'vigyázz': 'the imperative of vigyáz, which the level deals itself',
    'köszönjük': 'a form of köszön ("we thank"), which the level deals itself',
    'emlékezik': 'the same verb as emlékszik (A1), glossed only "to commemorate"',
    'gyermek': 'the full form of gyerek (A1), the same word',
    # A spelling whose subtitle count belongs to a sense Wiktionary does not give:
    'halló': 'the telephone "hello?", but Wiktionary glosses only "auditory, hearing"',
    'bocs': 'the colloquial "sorry", but Wiktionary glosses only "bear cub"',
    'tőlem': '"from me", but Wiktionary glosses only "for all I care"',
    'frank': 'the subtitles\' name Frank, but Wiktionary glosses only "Frankish"',
    # Swearing:
    'francba': 'a curse ("damn!, shit!")',
    'fenébe': 'a curse ("damn!, shit!")',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'kurva', 'basz', 'baszik', 'bassza', 'kibaszott', 'szar', 'fasz', 'picsa', 'geci',
          'segg', 'seggfej', 'baszd', 'kurvaanyád', 'buzi', 'köcsög', 'faszfej', 'rohadt',
          'rohadék', 'szemét', 'hülye', 'idióta', 'barom', 'szarság', 'pöcs', 'pina'}


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
                # the common spelling of a word Wiktionary files under another (`hová`):
                # the card prints the spelling written here and the target's meanings
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            # an inventory word whose own spelling is also a FORM of another lemma (`kérem`
            # "please" is `kér`'s "I ask for it") lost that count in the split: it is dealt by
            # the larger of its lemma count and its own spelling's
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': max(L['freq'], L.get('own', 0)),
                         'pos': pos or '',
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
        if len(k) < 2 and k not in ('a', 'ő', 's'):
            continue
        # a MULTI-WORD lemma (jó reggelt) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        # AN ALTERNATIVE SPELLING THE LEVEL ALREADY HAS: Wiktionary sometimes gives both full
        # entries, glossed alike, so a lemma whose glosses are those of a word already chosen
        # is the same word.
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
