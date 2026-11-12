#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`vietnamese_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vi import fold
from vietnamese_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY


# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'ngươi': 'the archaic "thou" of period dramas, which is where the subtitles count it',
    'thằng': 'a disparaging classifier for a man or a boy; met in insults more than anywhere',
    'chuyện đó': 'two words, "that matter", and Wiktionary\'s entry adds a sexual sense',
    # read off the A2 ranking (2026-11-12)
    'the': 'counted as the English article; the Vietnamese word is a kind of silk gauze',
    'ok': 'English',
    'ben': 'counted as the name Ben; the Vietnamese words are "a cabin" and "to be comparable"',
    'kim': 'counted as the name Kim; the card would lead with "metal, one of the Five Phases"',
    'sam': 'counted as the name Sam; the Vietnamese words are a horseshoe crab and purslane',
    'mi': 'counted mostly as the archaic "thou" of period dramas; the card would lead with "eyelashes"',
    'huynh': 'the "elder brother" of martial-arts dramas, where the subtitles count it',
    'đô': 'counted as "dollar", a sense Wiktionary does not give it',
    'y': 'counted as a letter and as the literary "he", neither a word to learn here',
    'u': 'counted as a letter; "mother" is Northern and old-fashioned',
    'ô': 'mostly the letter\'s name and an interjection; the card would lead with "black"',
    'mai': 'counted as "tomorrow" (short for ngày mai, taught in A1); the card would lead with "early morning"',
    'ban': 'its everyday senses (committee, daytime) sit under a feudal-court gloss that leads the card',
    'thể': 'counted inside có thể (A1) and không thể; alone it is a grammar word with no gloss to learn',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck -- nor the two pronouns that are
# insults outside close friendship (`mày` "you", `tao` "I", as one says them to a
# child, an intimate or someone being abused): a beginner's pronouns are the kinship
# words, and the subtitles' count of these two is mostly quarrels.
SWEARS = {'mày', 'tao', 'chết tiệt'}


def usable(L):
    gl = [g for e in L['entries'] for g in e['glosses']]
    return any(not g['weak'] for g in gl)


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    # a word taught below under one spelling is not dealt again under its other (A1 teaches
    # `cảm ơn`, which Wiktionary files under `cám ơn`; the A2 fill dealt `cám ơn`)
    below |= {L['alt_of'] for k, L in lex.items() if k in below and 'alt_of' in L}
    below |= {k for k, L in lex.items() if L.get('alt_of') in below}
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
                # the common spelling of a word Wiktionary files under another (cảm ơn, filed under cám ơn):
                # the card prints the spelling written here and the target's meanings
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            if via:
                seen.add(via)        # the fill must not deal `cám ơn` beside `cảm ơn`
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
