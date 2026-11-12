#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`zulu_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, slang ...);
  · a lemma of two letters or fewer: a one- or two-letter verb stem (-ma, -za, -ya,
    -sa) takes its count from the corpus's prefixes and particles, not its use;
  · a proper noun's spelling (`iAfrika`), a borrowed month or place;
  · a verbal noun (`ukugula` "illness", `ukupheka` "cooking") whose verb has its
    own entry: its count is the verb's infinitive, and the verb teaches it (from
    A2 on; A1 shipped with four, ukuqala ukuphela ukulwa ukukhanya, kept so its
    card ids stand);
  · from B1 on, a lemma that is only an interjection or a phrase: the phrases
    deck (`phrases.py`) teaches those whole;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zu import fold
from zulu_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'umthombo': 'its count is the "Imithombo" (Sources) heading under every Wikipedia article',
    'tha': 'its count is the corpus\'s -tha endings and particles, not the verb "to pour"',
    'aba': 'its count is the class 2 prefix aba- of abantu and every other class 2 noun',
    'isinye': 'its count is the number one\'s forms (esisodwa, sinye), not the noun',
    'isibili': 'its count is the number two\'s forms, not the noun',
    'isithathu': 'its count is the number three\'s forms, not the noun',
    'isi': 'an empty headword: its count is the class 7 prefix',
    'iphakathi': 'its count is phakathi "among, inside", the adverb',
    'nya': 'its count is the -nya of other words; the verb is a vulgar one',
    'iningizimu': 'a compass point the inventory\'s level does not reach; its count is place names',
    'isifunda': 'Wikipedia\'s stub formula ("yisifunda ...") for every district',
    'isifundazwe': 'Wikipedia\'s stub formula ("kwesifundazwe ...") for every province',
    'umasipala': 'Wikipedia\'s stub formula for every municipality',
    'woreda': 'an Ethiopian district, from the stubs',
    'imelika': 'a country name',
    'igibhithe': 'a country name',
    'ujuni': 'a month, borrowed; the months are a set, left for A2',
    'ujulayi': 'a month, borrowed; the months are a set, left for A2',
    'ujanuwari': 'a month, borrowed; the months are a set, left for A2',
    'umashi': 'a month, borrowed; the months are a set, left for A2',
    'umzulu': 'a Zulu person: taught with isiZulu at A2, not by the stubs\' count',
    'isingisi': 'the English language, from the stubs; left for A2 with the languages',
    'iphalamende': 'parliament, from the stubs: not an A1 word',
    'umeyi': 'mayor, from the stubs: not an A1 word',
    'igoli': 'Johannesburg (eGoli) more often than "goal", in this corpus',
    'impumalanga': 'a compass point, its count the province of that name',
    'intshonalanga': 'a compass point, its count place names',
    'inyakatho': 'a compass point, its count place names',
    'hlinzeka': 'Wiktionary glosses only "to get skinned; to get murdered"; its count is the everyday "to provide"',
    'isiko': 'Wiktionary\'s first gloss is "cut, incision"; its count is isiko "custom, culture"',
    'izinga': 'Wiktionary glosses "ridge; tree ring"; its count is izinga "level, standard"',
    'icala': 'Wiktionary glosses "side"; its count is icala "case, offence"',
    'indima': 'Wiktionary glosses "patch of ground"; its count is indima "role, part"',
    'isici': 'Wiktionary glosses "defect"; its count is isici "feature"',
    'duma': 'the relative "tasteless"; its count is the verb -duma "to be famous"',
    'imvamisa': 'its count is ngokuvamile "usually", the adverb',
    'vamisa': 'its count is ngokuvamile "usually", not "to standardize"',
    'ikhona': 'its count is ikhona "it is there", not the noun "corner"',
    'ingaphandle': 'its count is ngaphandle "outside", the adverb',
    'ilisho': 'its count is the forms of -sho "to say", not "rickshaw"',
    'isine': 'its count is the number four\'s forms, not the noun',
    # Read off the A2 ranking (2026-11-12).
    'impela': 'Wiktionary files it as the noun "truth"; its count is the adverb impela "really, indeed"',
    'jika': 'Wiktionary glosses only "to hang"; the everyday -jika is "to turn"',
    'ungqo': 'its count is ngqo "straight, directly", not "policeman"',
    'inzima': 'its count is the forms of -nzima "difficult", not "black ox"',
    'isihlanu': 'its count is the number five\'s forms, not the noun',
    'isondo': 'Wiktionary glosses "hoof"; its count is isondo "wheel"',
    'uve': 'a bird whose three letters take their count from other words',
    'umhlophe': 'its count is the colour -mhlophe (A1), not "white beast"',
    'fishane': 'a variant of -fushane, taught at A1',
    'dlwengula': 'its count is crime reports; not a word the level needs',
    'ingquza': 'anatomical vocabulary the level does not need',
    'isende': 'anatomical vocabulary the level does not need',
    'okujwayelekile': 'a whole relative form ("which is usual") filed as an adjective, not a stem',
    # Read off the B1 ranking (2026-11-12).
    'fisha': 'a synonym of -fuphi, which B1 also teaches',
    'umese': 'a variant spelling of ummese "knife", taught at A2',
    'ukwindla': 'a variant of ikwindla "autumn", taught at A2',
    'makhaza': 'a variant of amakhaza "cold", taught at A1',
    'izitha': 'the plural of isitha "enemy", taught at A2',
    'izipho': 'its count is the plural of isipho "gift" (A2), not "claw"',
    'iphahla': 'its count is uphahla "roof", not "twin"',
    'yini': 'glossed only as "copulative of -ni", a form, not a word to learn',
    'ubomvu': 'its count is the colour -bomvu (A1), not "red soil"',
    'umnyama': 'its count is the colour -mnyama (A1), not "darkness"',
    'insundu': 'its count is the colour -nsundu (A1), not "dark-brown beast"',
    'isinzima': 'its count is the forms of -nzima "difficult" (A1), not "weight"',
    'hlobonga': 'sexual vocabulary the level does not need',
    'umdlwenguli': 'crime vocabulary the level does not need',
    'umqwayizi': 'sexual vocabulary the level does not need',
    'umdidi': 'anatomical vocabulary the level does not need',
    'isibunu': 'anatomical vocabulary the level does not need',
    'qimba': 'not a word the level needs',
}


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


def verbal_noun_of(k, L, lex):
    """The verb an uku-/ukw- noun is the infinitive of, where the verb has its own entry."""
    if not (k.startswith('uku') or k.startswith('ukw')) or len(k) < 6:
        return None
    if not all(e['pos'] == 'noun' for e in L['entries']):
        return None
    stem = k[3:]
    V = lex.get(stem)
    if V and any(e['pos'] == 'verb' for e in V['entries']):
        return stem
    return None


def main():
    D = json.load(open('lex.json', encoding='utf-8'))
    lex, ptr = D['lemmas'], D['pointers']
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
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
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in below or k in excl or ' ' in k or len(k) <= 2:
            continue
        if L['word'][:1] != L['word'][:1].lower() or any(ch.isupper() for ch in L['word'][1:]):
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        if all(e['pos'] == 'phrase' for e in L['entries']):
            continue
        if LEVEL not in ('a1', 'a2') and all(e['pos'] in ('phrase', 'intj') for e in L['entries']):
            continue                  # from B1 on, the phrases deck teaches them (phrases.py)
        if LEVEL != 'a1' and verbal_noun_of(k, L, lex):
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
