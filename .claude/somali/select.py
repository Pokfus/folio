#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining Wiktionary words.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by frequency (the commonest first), each marked with where it came
from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`somali_level.words_below`).
AN INVENTORY WORD NOT IN THE LEXICON BUT NAMED BY A POINTER (an alternative
spelling Wiktionary files under another page) resolves to that page.

THE FILL TAKES only Wiktionary's own entries (never a hand gloss: a hand row is
dealt only when the inventory names it), and never:
  · a lemma whose every sense is weak (rare, dialect, offensive ...);
  · a lemma of two letters or fewer (`ka`, `ku`, `u`, `oo`: the particles and
    prepositions are counted in every sentence, and they are taught where the
    inventory names them);
  · a multi-word entry, a phrase, an interjection or a numeral the inventory does
    not teach;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from so import key
from somali_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-16).  Each with its reason.
EXCLUDE = {
    'badhan': 'its count is badan "many" (Wiktionary files badan as its alternative); badan is taught',
    'jir': 'Wiktionary\'s "exist" takes the count of jira, jiray, jirta, the auxiliary of every past habitual',
    'ah': 'the copula "be": its count is ah in every relative clause (oo ah, ah "being"); not a word to drill alone',
    'waxa': 'the focus marker waxa(a), written onto the pronouns (waxaa, waxay, wuxuu); a grammar word',
    'waa': 'the topic marker of the statement; a grammar word, not a meaning',
    'sida': 'Wiktionary glosses "this"; its count is sida "like, as", which it does not have',
    'doon': 'the count is the future auxiliary doonaa; the verb doon "want" is taught by the inventory',
    'xarunta': 'a definite form (xarun + -ta) filed as its own noun, glossed "the leading figure"',
    'nidaamka': 'a definite form (nidaam + -ka) filed as its own noun',
    'qalabka': 'a definite form (qalab + -ka) filed as its own noun',
    'jirka': 'a definite form (jir + -ka) filed as its own noun; jidh "body" is taught',
    'dhaqdhaqaaqa': 'a definite form of dhaqdhaqaaq',
    'bisha': 'the definite form of bil "month" (bisha), glossed "date"; bil is taught',
    'jeer': 'Wiktionary glosses "hippopotamus"; its count is jeer "time, occasion" (mar ... jeer)',
    'doonta': 'a form of doon "want", filed as a noun',
    'bangiga': 'a definite form of banki "bank"',
    'jidka': 'a definite form of jid "road", taught',
    'calanka': 'a definite form of calan "flag"',
    'heesta': 'a definite form of hees "song"',
    'dugsi': 'Wiktionary glosses "warm" as an adjective; its count is dugsi "school" (the noun)',
    'qalab': 'filed as an adjective "tangible"; its count is qalab "equipment" (the noun)',
    'ayaan': 'Wiktionary glosses "good luck"; its count is the focus particle ayaan (ayaa + aan)',
    'waan': 'the focus particle waa + aan, written as one; a grammar word',
    'waxey': 'a spelling of waxay "they (focus)"; a grammar word',
    'ahay': 'a form of ah "be" ("am"), filed as its own verb',
    'dil': 'Wiktionary glosses "beat!"; its count is dil "kill", from the history articles',
    'gaal': 'a word for a non-Muslim that can be a slur; not a level word',
    'addoon': 'slavery vocabulary, from the history articles; not a beginner\'s word',
    'gumeys': 'from the history articles ("colonise"); not a beginner\'s word',
    'hantiwadaag': 'from the history articles ("socialism"); not a beginner\'s word',
    'guray': 'Wiktionary glosses "a left-handed person"; its count is guray, a verb form ("moved")',
    'cagaar': 'Wiktionary glosses a grass (buffelgrass); cagaaran "green" is taught',
    'male': 'its count is the English "male" of the articles and male "consideration" is rare',
    'mug': 'its count is the stray English "mug"; Wiktionary glosses "capacity"',
    'booy': 'Wiktionary glosses "cry"; its count is the English "boy" written so in names',
    'marin': 'Wiktionary glosses "to rub"; its count is mariin "time, occasion" and marin "passage"',
    'talin': 'its count is talin "advice" (the noun), glossed only as the verb "to urge"',
    'duul': 'Wiktionary glosses "band, group"; its count is the verb duul "to fly, to invade"',
    'qabo': 'a spelling of qabow "cold" or of qab "hold"; both are counted',
    'xaq': 'Wiktionary glosses "allegation"; its count is xaq "right, truth"',
    'gaar': 'Wiktionary has only the verb "to reach" (gaadh); its count is gaar ah "special, particular"',
    'iman': 'the infinitive of yimaad "to come", taught; filed as its own verb',
    'xarun': 'Wiktionary glosses only a historical state\'s government; its count is xarun "centre, headquarters"',
    'sheeko': 'Wiktionary glosses only "conversation"; its count is sheeko "story"',
    'xoog': 'filed as an adjective "strong"; its count is xoog "strength, force" (the noun)',
    'uun': 'Wiktionary glosses "create (of God)"; its count is the particle uun "only, just"',
    'baa': 'the focus marker baa; a grammar word, as waa is',
    'iska': 'the reflexive is + the preposition ka, written as one; glossed only "yourself"',
    'qoy': 'its count is qoyska "the family" (qoys + -ka), not the verb "to be wet"',
    'dusha': 'the definite form of dul "top" (dul + -sha), filed as a preposition',
    'rag': 'Wiktionary glosses "man"; the word is the plural "men", and nin "man" is taught',
}


def usable(L):
    return any(not g['weak'] and not e['hand'] for e in L['entries'] for g in e['glosses'])


def main():
    D = json.load(open('lex.json', encoding='utf-8'))
    lex, ptr = D['lemmas'], D['pointers']
    back = {s: t for t, ss in ptr.items() for s in ss}
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            h = key(w.replace('_', ' '))
            if h not in lex and h in back:
                h = back[h]
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
    fill = []
    for h, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if h in seen or h in below or h in EXCLUDE or ' ' in h or len(h) <= 2:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        if all(e['pos'] in ('phrase', 'intj', 'num') for e in L['entries'] if not e['hand']):
            continue
        seen.add(h)
        fill.append({'key': h, 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN THE LEXICON (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
