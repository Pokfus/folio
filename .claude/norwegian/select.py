#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`norwegian_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nb import fold
from norwegian_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-15).  Each with its reason.
EXCLUDE = {
    # FORMS TAUGHT ON ANOTHER CARD
    'et': 'the neuter of the article en, taught on its card',
    'ei': 'the feminine of the article en, taught on its card (its own entry is a rare "not")',
    'hele': 'the definite of hel "whole" (A1), whose count it is; its own entry is a rare noun',
    'godt': 'the neuter of god (A1), used as the adverb "well"; bra and vel teach it',
    # Read off the A2 ranking (2026-11-15).
    # A FORM TAUGHT ON ANOTHER CARD
    'gode': 'the definite and plural of god (A1); its noun "a benefit" takes its count',
    'hvite': 'the plural of hvit (A1); its noun "egg white" takes its count',
    'raskt': 'the neuter of rask, taught in A2', 'enkelt': 'the neuter of enkel, taught in A2',
    'fullt': 'the neuter of full, taught in A2', 'ene': 'the definite of en (A1)',
    'sett': 'the past participle of se (A1); its noun "a set" takes its count',
    'huse': 'its count is huset, the definite of hus (A1)',
    'kule': 'its count is kule, the plural of kul "cool" (A2)',
    'kong': 'its count is kongen, the definite of konge "king" (A2); its own entry is "a boil"',
    'faste': 'its count is fast "firm, fixed", whose plural it shares',
    'bar': 'its plural is bare "only" (A1), whose count it takes',
    'purke': 'slang for the police in the subtitles; its entry is "a sow"',
    'and': 'its count is the English word in the subtitles; its entry is "a duck"',
    # Read off the B1 ranking (2026-11-15).
    # A FORM OR A SPELLING TAUGHT ON ANOTHER CARD
    'dypt': 'the neuter of dyp, taught in B1', 'normalt': 'the neuter of normal, taught in B1',
    'varmt': 'the neuter of varm (A1)', 'sterkt': 'the neuter of sterk (A2)',
    'fritt': 'the neuter of fri (A2)', 'rødt': 'the neuter of rød (A1)',
    'sykt': 'the neuter of syk (A1), here the slang "really"', 'dobbelt': 'the neuter of dobbel (A2)',
    'søte': 'its count is the plural of søt (A2); its entry is "to sweeten"',
    'syke': 'the plural of syk (A1)', 'halve': 'the definite of halv (A1)',
    'onde': 'the definite of ond, taught in B1', 'gale': 'the plural of gal (A2); its entry is "to crow"',
    'hellige': 'the plural of hellig, taught in B1', 'lyse': 'the plural of lys (A2)',
    'jorden': 'the definite of jord (A2)', 'elsket': 'the participle of elske (A1)',
    'framtid': 'the second spelling of fremtid (A2)', 'leite': 'the second spelling of lete (A1)',
    'hand': 'the second spelling of hånd (A1)', 'sort': 'the second spelling of svart (A1)',
    'fader': 'the formal father, far being taught (A1)', 'mang': 'the base form of mange (A1), met only in phrases',
    'lee': 'lee på seg "to move", which shares bevege\'s English side; rare beside it',
    # A COUNT THAT IS ANOTHER WORD'S
    'verk': 'its count is verken "neither" (A2); its entry is "an ache"',
    'trette': 'its count is tretten "thirteen"; its entry is "a quarrel"',
    'våk': 'its count is våken "awake"; its entry is "a buzzard"',
    'helle': 'its count is heller "rather" (A1); its entry is "a flat stone"',
    'gasse': 'its count is gassen "the gas"; its entry is "a gander"',
    'los': 'its count is Los Angeles; its entry is "a pilot"', 'hitle': 'its count is the name Hitler',
    'texas': 'the state', 'adam': 'the name', 'lind': 'the name Linda\'s count', 'hank': 'the name',
    'eve': 'the name', 'more': 'the English word', 'carte': 'met only in à la carte',
    'morse': 'its count is morsen, the spoken "mum"; its entry is Morse code',
    'dump': 'its count is dumpe "to fail" and dum (A2)', 'el': 'a prefix-like clipping of elektrisitet',
    'fjor': 'met only in i fjor', 'hjel': 'met only in i hjel', 'rede': 'met only in gjøre rede for',
    'bure': 'its count is bure inne "to lock up", which its entry does not give',
    'dyrt': 'the neuter of dyr (A1)', 'sale': 'its count is salt (A1); its entry is "to saddle"',
    'lake': 'the English word, and laken "a sheet"; its entry is "brine"',
    'voldta': 'not taught in a level deck, though common in the subtitles\' crime drama (as Swedish)',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'faen', 'helvete', 'jævla', 'jævel', 'jævlig', 'dritt', 'drite', 'satan', 'fitte',
          'kuk', 'hore', 'idiot', 'pikk', 'ræva', 'rævhøl', 'rasshøl', 'drittsekk', 'pokker',
          'fanden', 'djevel', 'homo', 'knulle', 'pule', 'shit', 'fuck', 'dust', 'dritings',
          'ræv', 'pisse', 'fanken', 'pupp', 'kjerring'}

# A FILL WORD'S READING: the part of speech its count is for, where Wiktionary lists
# another first.
FILL_POS = {'alt': 'pron',     # "everything", not "an alto"
            'å': 'particle',     # the infinitive marker, not the letter
            'tro': 'verb', 'skje': 'verb', 'huske': 'verb', 'vise': 'verb', 'prøve': 'verb',
            'stå': 'verb', 'glemme': 'verb', 'vente': 'verb', 'virke': 'verb', 'falle': 'verb',
            'kaste': 'verb', 'bry': 'verb',            # the verb, not a noun spelt like it
            'grunn': 'noun',     # "reason, ground", not the adjective "shallow"
            'død': 'adj',        # "dead"; the noun "death" is Wiktionary's first
            'egen': 'det',       # "own", not "peculiar"
            # A2 (2026-11-15): the verb, not a noun spelt like it
            'røre': 'verb', 'vare': 'verb', 'banke': 'verb', 'spore': 'verb', 'hoppe': 'verb',
            'føre': 'verb', 'råde': 'verb', 'dekke': 'verb', 'ri': 'verb', 'rekke': 'verb',
            'pleie': 'verb', 'bringe': 'verb', 'rive': 'verb', 'rømme': 'verb', 'skifte': 'verb',
            'sikte': 'verb', 'skille': 'verb', 'skjære': 'verb', 'skuffe': 'verb',
            'kul': 'adj',        # "cool", not "a lump"
            'konge': 'noun',     # "king"; Wiktionary's first is the slang adjective
            'gift': 'adj',       # "married", not "poison"
            # B1 (2026-11-15)
            'trosse': 'verb', 'spy': 'verb', 'øse': 'verb'}

# A WORD DEALT BY ANOTHER'S COUNT.
# `hel` "whole" is met as its definite `hele` (hele dagen), and that spelling's count went to
# a rare noun `hele` "a whole" by the noun-headword rule: hel by its own count was 324.
SAME_AS = {'hel': 'hele'}


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
            if L and 'alt_of' in L and L.get('kind') == 'form':
                # a form of another word is no card's headword, unless it is a word a learner
                # meets as one and its meaning is written in build_deck.FORM_WORDS (hans "his")
                from build_deck import FORM_WORDS
                if k in FORM_WORDS:
                    seen.add(k)
                    rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['own'],
                                 'pos': L['pos'], 'source': 'inventory', 'topic': topic})
                    continue
                L = None
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
    sigs = {gloss_sig(lex[r['via']] if r['via'] else lex[r['key']]) for r in rows
            if 'entries' in (lex[r['via']] if r['via'] else lex[r['key']])}
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
        # a MULTI-WORD lemma (av og til, i dag) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        # AN ALTERNATIVE SPELLING THE LEVEL ALREADY HAS (two spellings Wiktionary gives full entries): Wiktionary gives both full entries, glossed
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
