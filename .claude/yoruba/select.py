#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining Wiktionary words.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by frequency (the commonest first), each marked with where it came
from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`yoruba_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, dialect, offensive ...);
  · a single letter (the object pronoun's vowel-copy forms é, á, ẹ́ ... take
    their count from any lone vowel in the corpus);
  · a multi-word entry, a phrase or an interjection (a phrases deck's matter);
    a multi-word lemma's count is only its rarest word's, halved;
  · a numeral the inventory does not teach (the ordinals of the date lines,
    keje, kẹjọ ...);
  · from A2 on, AN UNMARKED SPELLING WHOSE MARKED HOMOGRAPH IS COMMONER (`shadowed`):
    iwe "gizzard" beside ìwé "book", ojo "coward" beside òjò "rain", itan "thigh"
    beside ìtàn "history".  Such a word's count is mostly its homograph written
    carelessly, in the half-marked articles, so it is not a frequency at all;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from yo import nfc, key, toned
from yoruba_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-15).  Each with its reason.
EXCLUDE = {
    'ló': 'Wiktionary glosses only "to lose interest"; its count is ló, ní + ó "it is ... that"',
    'tó': 'its count is mostly tó, tí + ó "who / that he", not the verb "to be enough"',
    'in': 'the object pronoun\'s form after i, and the English "in" of the articles',
    'un': 'the object pronoun\'s form after u, which takes the count of any stray "un"',
    'an': 'the object pronoun\'s form after a nasal vowel, which takes the count of any stray "an"',
    'án': 'the object pronoun\'s form after a, written onto the verb',
    'ife': 'its count is the city Ifẹ̀ (Ilé-Ifẹ̀) written without its marks, not "cup"',
    'orílẹ̀': 'its count is orílẹ̀-èdè "country" written with a space; orílẹ̀-èdè is taught',
    'lẹ́hìn': 'a spelling of lẹ́yìn "after, behind", which A1 teaches',
    'baba': 'a spelling of bàbá "father", which A1 teaches',
    'ṣíṣe': 'the verbal noun of ṣe "to do", which A1 teaches',
    # the ordinals past the third take their count from the articles' date lines
    'kẹrin': 'an ordinal ("fourth"); its count is the date lines; the ordinals are left for A2',
    'karùn-ún': 'an ordinal ("fifth"), from the date lines; left for A2',
    'kẹfà': 'an ordinal ("sixth"), from the date lines; left for A2',
    'keje': 'an ordinal ("seventh"), from the date lines; left for A2',
    'kẹjọ': 'an ordinal ("eighth"), from the date lines; left for A2',
    'kẹsàn-án': 'an ordinal ("ninth"), from the date lines; left for A2',
    'kẹwàá': 'an ordinal ("tenth"), from the date lines; left for A2',
    'kẹrìndínlógún': 'an ordinal ("sixteenth"), from the date lines',
    # Read off the A2 ranking (2026-11-16).
    'ún': 'the object pronoun\'s form after u, written onto the verb',
    'ín': 'the object pronoun\'s form after i, written onto the verb',
    'ọ́n': 'the object pronoun\'s form after a nasal ọ',
    'ọn': 'the object pronoun\'s form after a nasal ọ',
    'mí': 'the object pronoun "me" after a mid- or low-tone verb, mi\'s other form; mi is taught',
    'ayélujára': 'Wiktionary glosses first a colonial coin, not "the internet", which its count is',
    'ìmọ̀ràn': 'Wiktionary glosses "understanding of facts"; its count is ìmọ̀ràn "advice"',
    'dájú': 'Wiktionary glosses "to be heartless"; its count is dájú "to be certain"',
    'péré': 'Wiktionary glosses "being luxuriant"; its count is péré "only, just"',
    'dìbò': 'Wiktionary glosses only a kind of divination; its count is dìbò "to vote"',
    'ète': 'Wiktionary glosses "dead skin"; its count is ète "plan, aim"',
    'pàṣípààrọ̀': 'Wiktionary glosses only "metathesis"; its count is "exchange"',
    'àdánidá': 'Wiktionary glosses "abandonment"; its count is àdánidá "natural"',
    'ìbùkún': 'Wiktionary\'s gloss is garbled ("to act of drawing out"); the word is "blessing"',
    'àfojúsùn': 'Wiktionary glosses "fixed gaze"; its count is àfojúsùn "goal, target"',
    'gbòǹgbò': 'Wiktionary glosses "to be protruding"; its count is gbòǹgbò "root"',
    'àgbájọ': 'Wiktionary glosses "raking"; its count is àgbájọ "collection, totality"',
    'pátákó': 'Wiktionary glosses "being hard and flat"; its count is pátákó "board"',
    'ìpọ́njú': 'Wiktionary glosses a darkening of the skin; its count is ìpọ́njú "hardship"',
    'sẹ́nétọ̀': 'Wiktionary defines it only by a pointer to aṣòfin-àgbà',
    'emi': 'its count is èmi "I", taught at A1, written without its mark',
    'yè': 'Wiktionary glosses "mother"; its count is the verb yè "to survive"',
    'odo': 'Wiktionary glosses "core of a syllable"; its count is odò "river", unmarked',
    're': 'the solfège syllable; its count is rẹ̀ and rè unmarked',
    'go': 'its count is the English "go" of the articles',
    'èèyàn': 'a spoken form of ènìyàn "person", taught at A1',
    'míì': 'a short form of mìíràn "other", taught at A1',
    'èkejì': 'the ordinal pronoun "the second one"; kejì "second" is taught at A1',
    'Ẹ̀gbá': 'a people\'s name (the Ẹ̀gbá), from the history articles',
    'Fúlàní': 'a people\'s name, from the history articles',
    'atọ́ka': 'Wiktionary glosses an owl; its count is atọ́ka "index, pointer"',
    'àkókó': 'Wiktionary glosses a woodpecker; its count is àkókò "time", miswritten',
    'ọ̀sìn': 'Wiktionary glosses a vulture; its count is ìsìn / ọ̀sìn "worship, rearing"',
    'egbin': 'Wiktionary glosses an antelope; its count is ẹ̀gbin "filth", miswritten',
    'dan': 'Wiktionary glosses only a counter-charm; its count is dán "to shine", unmarked',
    'gbígbà': 'the verbal noun of gbà "to take, accept", taught at A1',
    'gbígbá': 'the verbal noun of gbá "to hit, to play", taught at A1',
    'jíjẹ': 'the verbal noun of jẹ "to eat", taught at A1',
    'bẹ́rẹ̀': 'Wiktionary glosses an elderly relative; its count is bẹ̀rẹ̀ "to begin", miswritten',
    'Aláké': 'the title of the Ẹ̀gbá king, from the history articles',
}


def shadowed(h, lex, by_key):
    """An unmarked spelling with a marked homograph that is commoner (from A2 on)."""
    if toned(h):
        return False
    return any(o != h and toned(o) and lex[o]['freq'] >= lex[h]['freq'] for o in by_key[key(h)])


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


def main():
    D = json.load(open('lex.json', encoding='utf-8'))
    lex, ptr = D['lemmas'], D['pointers']
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            h = nfc(w.replace('_', ' ')).lower()
            if h not in lex and h in ptr:
                h = nfc(ptr[h]).lower()
            if h in seen or h in below:
                continue
            L = lex.get(h)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(h)
            rows.append({'key': h, 'word': L['word'], 'freq': L['freq'], 'pos': pos,
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    excl = {nfc(s).lower() for s in EXCLUDE}
    by_key = {}
    for h_ in lex:
        by_key.setdefault(key(h_), []).append(h_)
    fill = []
    for h, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if h in seen or h in below or h in excl or ' ' in h or len(h.replace('́', '').replace('̀', '')) <= 1:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        if all(e['pos'] in ('phrase', 'intj', 'num', 'prep_phrase') for e in L['entries']):
            continue
        if LEVEL != 'a1' and shadowed(h, lex, by_key):
            continue
        seen.add(h)
        fill.append({'key': h, 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
