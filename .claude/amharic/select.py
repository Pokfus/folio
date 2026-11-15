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
    ("ገዛ: to buy"); the verb is taught and the infinitive goes on its card.  From
    A2 on the two are matched on their first sense, whichever level the verb is on;
  · from A2 on, an "of" adjective (`of_adjective`): የባህል "cultural" is ባህል with
    የ- "of", where the noun has its own entry;
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
    # Read off the A2 ranking (2026-11-15).
    'ጁላይ': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'ሰፕቴምበር': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'ኤፕሪል': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'ጁን': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'ማርች': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'መይ': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'ኖቬምበር': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'ኦገስት': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'ፌብሩዋሪ': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'ኦክቶበር': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'ዲሴምበር': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'ጃንዩዌሪ': 'a Western month\'s borrowed name; the decks teach the Ethiopian months',
    'ኢጣልያ': 'a country name',
    'ፊታውራሪ': 'an old title, from the history articles',
    'አቡነ': 'the title "Abune" before a bishop\'s name; ጳጳስ "bishop" is the word',
    'ጠይት': 'the name of a Ge\'ez letter, from the articles on the script',
    'ጥቅሶች': 'the plural of ጥቅስ "quotation", which is taught',
    'ደሞዝ': 'a spelling of ደመወዝ "wage", which A2 teaches',
    'ደሀ': 'a spelling of ድሀ "poor", which A2 teaches',
    'እባት': 'a spelling of አባት "father", taught at A1',
    'ሌት': 'a short form of ሌሊት "night", taught at A1',
    'ንፋስ': 'a spelling of ነፋስ "wind", taught at A1',
    'ኡነት': 'a spelling of እውነት "truth", taught at A1',
    'ጦም': 'a spelling of ጾም "fast", which A2 teaches',
    'መጠበቅ': 'the infinitive of ጠበቀ "to wait for", taught at A1',
    'መጀመር': 'the infinitive of ጀመረ "to start", taught at A1',
    'መቁረጥ': 'the infinitive of ቆረጠ "to cut", which A2 teaches',
    'መታገል': 'the infinitive of ታገለ "to struggle", which is taught',
    'ጠራ': 'Wiktionary glosses only "to be clear"; its count is ጠራ "to call"',
    'ዝቅተኛ': 'Wiktionary glosses only "inferior"; its count is ዝቅተኛ "low, lowest"',
    'ላለ': 'Wiktionary glosses only a rare verb; its count is ላለ "for one who is" (ለ- + ያለ)',
    'ላት': 'its count is the plural ending -at of other words (ቃላት), not "fat tail"',
    'ከልብ': 'its count is ከልብ "sincerely" (ከ- + ልብ "heart"), not the rare "dog"',
    'ጭራ': 'Wiktionary glosses only "flyswatter"; its count is ጭራ "tail"',
    'መስታዎት': 'a spelling of መስታወት "mirror, glass", which is taught',
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


def first_sense(L, pos='verb'):
    """The first gloss up to its first comma or semicolon: "to kill, to murder" -> "to kill"."""
    import re
    return re.split(r'[,;]', first_gloss(L, pos))[0].strip()


def of_adjective(k, L, lex):
    """የባህል "cultural" is ባህል "culture" with የ- "of": an adjective entry that is only a
    noun with the genitive prefix, where the noun has its own entry (from A2 on; the
    possessive pronouns የኔ, የኛ ... are not, their remainder being no noun)."""
    if not k.startswith('yE') or len(k) < 5:
        return False
    if not all(e['pos'] == 'adj' for e in L['entries']):
        return False
    R = lex.get(k[2:])
    return bool(R) and any(e['pos'] == 'noun' for e in R['entries'])


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
    # from A2 on the twins are matched on their first sense ("to kill, to murder" and "to
    # kill"), and an infinitive is skipped whenever its verb has an entry at all, taught at
    # this level, another, or neither: A1 shipped on the whole-gloss rule, kept so it stands.
    sidx = {}
    for k_, L_ in lex.items():
        if not k_.startswith(('mE', 'ma')) and first_sense(L_):
            sidx.setdefault(first_sense(L_), k_)
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
        if LEVEL != 'a1':
            if k.startswith(('mE', 'ma')) and all(e['pos'] == 'verb' for e in L['entries']) \
                    and sidx.get(first_sense(L)):
                continue
            if of_adjective(k, L, lex):
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
