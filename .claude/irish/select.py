#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`irish_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the corpus's count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ga import fold
from irish_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-12): the Irish Wikipedia's own vocabulary.  Each with its reason.
EXCLUDE = {
    # WIKIPEDIA'S SCAFFOLDING: its section headings, counted once per article
    'tagairt': 'the heading Tagairtí "References" on most articles',
    'nasc': 'the heading Naisc sheachtracha "External links" on most articles',
    # PLACE NAMES' PIECES: Baile Átha Cliath "Dublin", Cill Dara, Cill Chainnigh ...
    'áth': 'a ford, counted from Baile Átha Cliath', 'cliath': 'counted from Baile Átha Cliath',
    'cill': 'a church, counted from the place names Cill Dara, Cill Mhantáin ...',
    # A RARE WORD WHOSE COUNT IS ANOTHER'S
    'fál': 'a hedge, whose genitive fáil is the spelling of fáil "getting" (faigh)',
    'fuaigh': '"to sew", whose table shares fuair, the past of faigh',
    'iúl': 'whose genitive iúil is the spelling of Iúil "July"',
    'ab': 'an abbot; its count is the copula form ab',
    # MET ONLY IN A PHRASE, which the inventory teaches whole (tar éis, i ndiaidh ...)
    'éis': 'met only in tar éis', 'diaidh': 'met only in i ndiaidh', 'réir': 'met only in de réir',
    'measc': 'met only in i measc', 'feadh': 'met only in ar feadh',
    'leith': 'met in ar leith, i leith; its own noun is a flatfish',
    'láthair': 'met mostly in i láthair "present"',
    'maidir': 'met only in maidir le "as regards"', 'déanaí': 'met only in le déanaí "recently"',
    # A VERBAL NOUN, shown on its verb's card
    'déanamh': 'the verbal noun of déan', 'dul': 'the verbal noun of téigh',
    # Read off the A2 ranking (2026-11-12).
    # PLACE NAMES' AND PERSONAL NAMES' PIECES, counted from the encyclopaedia's places and people
    'tiobraid': 'counted from Tiobraid Árann "Tipperary"', 'doire': 'counted from Doire "Derry"',
    'corcach': 'counted from Corcaigh "Cork"', 'ros': 'counted from place names (Ros Comáin ...)',
    'cluain': 'counted from place names (Cluain Meala ...)', 'ráth': 'counted from place names (Ráth Luirc ...)',
    'eo': 'counted from Maigh Eo "Mayo"', 'ára': 'counted from Árainn, Oileáin Árann',
    'franc': 'its count is an Fhrainc "France"', 'rúise': 'its count is na Rúise "of Russia"',
    'fine': 'counted from Fine Gael, the party', 'art': 'counted from the name Art',
    'gall': 'counted from place names (Dún na nGall ...)',
    # A RARE WORD WHOSE COUNT IS ANOTHER'S
    'bail': 'its table shares baile "town"', 'at': '"to swell", whose count is atá, the relative of bí',
    'cál': 'kale, whose genitive is the spelling of cáil "fame"', 'ríog': 'its count is ríoga "royal"',
    'dligh': 'its count is dlí "law"', 'coim': 'a waist; no count of its own',
    'gair': 'its count is gairm "vocation" and gairid "short"',
    # MET ONLY IN A PHRASE
    'aice': 'met only in in aice le "beside"', 'son': 'met only in ar son "for the sake of"',
    'dheas': 'met only in ó dheas "southwards"', 'ais': 'met only in ar ais, le hais',
    'chóir': 'met only in ar chóir', 'annáil': 'met only in its plural annála "annals"',
    # THE COPULA'S RELATIVE FORMS: grammar, not a word to learn at this level
    'dar': 'a copula form', 'darb': 'a copula form', 'darbh': 'a copula form',
    'gurb': 'a copula form', 'gurbh': 'a copula form', 'inar': 'a copula form',
    # A VERBAL NOUN of a verb A1 or A2 teaches, shown on the verb's card
    'fáil': 'the verbal noun of faigh (A1)', 'rá': 'the verbal noun of abair (A1)',
    'teacht': 'the verbal noun of tar (A1)', 'imeacht': 'the verbal noun of imigh (A1)',
    'tarlú': 'the verbal noun of tarlaigh (A1)', 'coinneáil': 'the verbal noun of coinnigh, taught in A2',
    'athrú': 'the verbal noun of athraigh, taught in A2', 'dearna': 'the dependent past of déan (A1)',
    'cinn': 'a rare verb whose count is cinn, the plural of ceann (A1)',
    'ionas': 'met only in ionas go, taught whole in A2', 'éigean': 'met in ar éigean; its count shares éigin',
    'tom': 'counted from the name Tom', 'géineas': 'a genus, counted from the encyclopaedia\'s taxonomy stubs',
    'airm': 'its count is airm, the genitive and plural of arm "army, weapon"',
    'clóigh': '"to tame"; its count is cló "print"', 'méad': 'met only in phrases (dá mhéad, cé mhéad)',
    'gabháil': 'the verbal noun of gabh, which this level teaches',
    'alt': 'a joint; its count is alt "an article", a sense Wiktionary does not list',
    # Read off the B1 ranking (2026-11-12).
    # PLACE NAMES' AND PERSONAL NAMES' PIECES
    'macha': 'counted from Ard Mhacha "Armagh"', 'sligeach': 'counted from Sligeach "Sligo"',
    'caiseal': 'counted from Caiseal "Cashel"', 'tuaim': 'counted from Tuaim "Tuam"',
    'iúr': 'counted from an tIúr "Newry"', 'ísiltír': 'counted from an Ísiltír "the Netherlands"',
    'polannach': 'its count is Polannach "Polish"', 'aodh': 'counted from the name Aodh',
    'ceallach': 'counted from the name Ceallach', 'colm': 'counted from the name Colm',
    'colmán': 'counted from the name Colmán', 'flann': 'counted from the name Flann',
    'tuathal': 'counted from the name Tuathal', 'oscar': 'counted from Oscar, the name and the award',
    'bran': 'counted from the name Bran', 'fiann': 'counted from Fianna Fáil, the party',
    'fiach': 'counted from the name Fiach', 'láirig': 'a thigh; counted from place names',
    'ara': 'counted from Árainn', 'lia': 'counted from Lia Fáil',
    # A RARE WORD WHOSE COUNT IS ANOTHER'S
    'garma': 'its count is not "a beam"', 'airí': 'its count is airí, the plural of aire "minister"',
    'lear': 'met in thar lear "abroad"; its own noun is rare', 'druid': 'a starling; its count is the verb "close"',
    'alla': 'its count is not "a shout"', 'tál': 'an adze; rare', 'án': 'rare and literary',
    'neas': 'rare', 'achair': 'its count is achair, the genitive of achar', 'los': 'its count is not "a tip"',
    'cis': 'rare', 'bob': 'its count is the English word', 'col': 'met in col ceathrar "cousin"',
    'teir': 'rare', 'dubha': 'the plural of dubh (A1)', 'teo': 'the plural and comparative of te (A1)',
    'tig': 'the Munster spelling of tigh',
    'srath': 'counted from place names (Srath an Urláir ...)', 'tulach': 'counted from place names (Tulach Mhór ...)',
    'deo': 'met only in go deo "for ever"',
    # MET ONLY IN A PHRASE; THE COPULA'S FORMS
    'arna': 'met only in arna mhárach', 'deara': 'met only in faoi deara', 'té': 'met only in an té',
    'arb': 'a copula form', 'arbh': 'a copula form', 'níorbh': 'a copula form', 'nárbh': 'a copula form',
    'murab': 'a copula form',
    # Read off the B2 ranking (2026-11-12): Wiktionary gives these only a pointer, no meaning
    'pé': 'glossed only as a pointer', 'tapaidh': 'glossed only as a pointer (to tapa, A2)',
    'itear': 'a form of ith (A1)', 'stiúraigh': 'glossed only as a pointer (to stiúir)',
    'soiléire': 'glossed only as a pointer (to soiléir, B1)', 'sonraí': 'glossed only as a pointer (to sonra)',
    # NAMES AND PLACE NAMES' PIECES
    'gráinne': 'counted from the name Gráinne', 'eithne': 'counted from the name Eithne',
    'guaire': 'counted from the name Guaire', 'cadhan': 'counted from the surname Ó Cadhain',
    'leitir': 'counted from place names (Leitir Ceanainn ...)', 'corcair': 'its count is Corcaigh "Cork"',
    'ráthaigh': 'counted from place names (Ráth ...)', 'ráthach': 'counted from place names (Ráth ...)',
    'fail': 'counted from Inis Fáil', 'sanas': 'its count is not "the Annunciation"',
    # PHRASE-ONLY WORDS, LETTER NAMES, FORMS, RARE WORDS WITH ANOTHER'S COUNT
    'muin': 'met in ar muin', 'aisc': 'met in ar aisce "free"', 'aisce': 'met in ar aisce "free"',
    'dhea': 'met only in mar dhea', 'éindí': 'met only in in éindí', 'cuimhin': 'met only in is cuimhin le',
    'ear': 'a letter name', 'ex': 'a letter name', 'hé': 'its count is not the interjection',
    'thú': 'a form of tú (A1)', 'lenar': 'a preposition-and-relative form',
    'mion': 'met mostly as the prefix mion-', 'sár': 'its count is the prefix sár-',
    'barrach': 'its count is not "tow (of flax)"', 'arc': 'its count is not "a piglet"',
    'car': 'its count is not "to love"', 'feis': 'its senses are not the everyday "festival"',
    'ana': 'rare', 'éar': 'rare', 'maig': 'rare', 'aom': 'rare', 'igín': 'rare', 'gallach': 'rare',
    'leachtach': 'rare', 'gríofa': 'rare', 'dos': 'its count is not "a tuft"', 'hap': 'rare',
    'seanóir': 'its first sense is slang', 'doimhne': 'glossed only as a pointer (to doimhneacht)',
    'foláir': 'met only in ní foláir "must"',
    'rinn': 'a point, a star; counted from place names (Rinn Mhic Gormáin ...)', 'fód': 'a sod; rare',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'cac', 'striapach', 'bastard', 'damnú', 'focáil', 'raicleach'}

# A FILL WORD'S READING: the part of speech its count is for, where Wiktionary lists another first.
FILL_POS = {'inis': 'verb', 'meall': 'verb'}   # A2: "to tell", not "island", which place names count

SAME_AS = {}


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
        if len(k) < 2 and k not in ('i', 'ó', 'é', 'í'):
            continue
        # a MULTI-WORD lemma (tycka om, till exempel) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        # AN ALTERNATIVE SPELLING THE LEVEL ALREADY HAS (`sedan` beside `sen`, `något`
        # beside `nåt`): Wiktionary gives both full entries, glossed
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
