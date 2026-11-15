#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`amharic_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, offensive ...);
  · a key of two letters or fewer: a one-syllable word takes its count from
    the corpus's prefixes and particles more than from its use;
  · a multi-word entry, a phrase or an interjection (a phrases deck's matter);
  · a numeral the inventory does not teach (ሃያ አንድ "twenty-one" ...);
  · AN INFINITIVE WHOSE VERB HAS ITS OWN ENTRY (`infinitive_twin`): Wiktionary
    sometimes glosses an infinitive page ("መግዛት: to buy") as well as its verb
    ("ገዛ: to buy"); the verb is taught and the infinitive goes on its card;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from am import key
from amharic_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-15).  Each with its reason.
EXCLUDE = {
    'ምንጭ': 'its count is the "ምንጭ" (Sources) heading under the articles, not "well, spring"',
    'አቆጣጠር': 'its count is the Wikipedia formula "የዘመን አቆጣጠር" (calendar), not an A1 word',
    'ኩል': 'its count is በኩል "through, by way of", not "antimony"',
    'መንፈስ': 'Wiktionary files only the verb "to blow"; its count is the noun መንፈስ "spirit"',
    'ዘርፍ': 'Wiktionary glosses "garment"; its count is ዘርፍ "sector, field"',
    'አባይ': 'Wiktionary glosses "fake"; its count is the Abay, the Blue Nile',
    'ገብ': 'its count is the forms of ገባ "to enter", not "newcomer"',
    'ሐይ': 'its count is ኀይል "strength" and names, not "beast"',
    'መሆን': 'the infinitive of ሆነ, which A1 teaches; it goes on that card',
    'መግባት': 'the infinitive of ገባ "to enter", which A1 teaches; it goes on that card',
    'መስራት': 'the infinitive of ሠራ "to do, to make", which A1 teaches',
    'መያዝ': 'the infinitive of ያዘ "to hold"; the verb is taught',
    'አገራት': 'the plural of አገር "country", which A1 teaches',
    'የንግድ': 'ንግድ "trade" with የ- "of", not a word of its own',
    'ሳለ': 'Wiktionary glosses only "to cough"; its count is ሳለ "while", the conjunction',
    'መሪ': 'Wiktionary glosses "pilot, conductor"; its count is መሪ "leader"',
    'ሩሲያ': 'a country name',
    'ግሪክ': 'a people\'s name, from the encyclopaedia\'s history articles',
    'ፕሬዚዳንት': 'a second spelling of ፕሬዝዳንት "president"',
    'ቀዳማዊ': 'a regnal title ("the First"), from the history articles',
    'ዳግማዊ': 'a regnal title ("the Second"), from the history articles',
    'የሥራ': 'ሥራ "work" with የ- "of", not a word of its own',
    'የሴት': 'ሴት "woman" with የ- "of", not a word of its own',
    'የውጭ': 'ውጭ "outside" with የ- "of", not a word of its own',
    'የፖለቲካ': 'ፖለቲካ "politics" with የ- "of", not a word of its own',
    # the months of the Ethiopian calendar: a set, left for A2
    'መስከረም': 'a month; the months are a set, left for A2',
    'ጥቅምት': 'a month; the months are a set, left for A2',
    'ኅዳር': 'a month; the months are a set, left for A2',
    'ታህሳስ': 'a month; the months are a set, left for A2',
    'ጥር': 'a month; the months are a set, left for A2',
    'የካቲት': 'a month; the months are a set, left for A2',
    'መጋቢት': 'a month; the months are a set, left for A2',
    'ሚያዝያ': 'a month; the months are a set, left for A2',
    'ግንቦት': 'a month; the months are a set, left for A2',
    'ሰኔ': 'a month; the months are a set, left for A2',
    'ሐምሌ': 'a month; the months are a set, left for A2',
    'ነሐሴ': 'a month; the months are a set, left for A2',
    'ጳጉሜ': 'a month; the months are a set, left for A2',
}


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


def first_gloss(L, pos='verb'):
    for e in L['entries']:
        if e['pos'] == pos and e['glosses']:
            return e['glosses'][0]['g'].lower()
    return ''


def verb_index(lex):
    """first gloss -> the key of a verb whose headword is not an infinitive (mä-, ma-)."""
    out = {}
    for k, L in lex.items():
        if k.startswith(('mE', 'ma')):
            continue
        g = first_gloss(L)
        if g:
            out.setdefault(g, k)
    return out


def infinitive_twin(k, L, vidx):
    """The verb an infinitive lemma (መግዛት "to buy") doubles, where that verb has its own entry."""
    if not k.startswith(('mE', 'ma')):
        return None
    if not all(e['pos'] == 'verb' for e in L['entries']):
        return None
    return vidx.get(first_gloss(L))


def main():
    D = json.load(open('lex.json', encoding='utf-8'))
    lex, ptr = D['lemmas'], D['pointers']
    vidx = verb_index(lex)
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = key(w)
            if k not in lex and k in ptr:
                k = ptr[k]
            if k in seen or k in below:
                continue
            L = lex.get(k)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            rows.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'pos': pos,
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    excl = {key(s) for s in EXCLUDE}
    seen_twins = {vidx.get(first_gloss(lex[r['key']])) for r in rows}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in below or k in excl or ' ' in k or len(k) <= 2:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        if all(e['pos'] in ('phrase', 'intj', 'num') for e in L['entries']):
            continue
        twin = infinitive_twin(k, L, vidx)
        if twin and (twin in seen or twin in below):
            continue
        seen.add(k)
        fill.append({'key': k, 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
