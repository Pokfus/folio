#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`danish_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from da import fold
from danish_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-15).  Each with its reason.
EXCLUDE = {
    # A FORM TAUGHT ON ANOTHER CARD: Wiktionary gives each a full entry of its own, and
    # the closed-class rule hands it its whole count, so it was dealt as a word.
    'et': 'the neuter of the article en, taught on its card',
    'mit': 'the neuter of min, whose table shows it', 'dit': 'the neuter of din, whose table shows it',
    'sit': 'the neuter of sin, whose table shows it',
    'mine': 'the plural of min (its noun is "a look, a mine")', 'dine': 'the plural of din',
    'sine': 'the plural of sin',
    'alt': 'the neuter of al, taught as alle', 'andet': 'the neuter of anden, taught there',
    'intet': 'the neuter of ingen, taught there',
    'noget': 'the neuter of nogen "something", taught there; its entry is only the adverb "somewhat"',
    'hvilket': 'the neuter of hvilken, taught there', 'denne': None,
    # ITS COUNT IS ANOTHER WORD'S: a verb's imperative, which `extract.py` hands to the
    # lemma that heads the spelling
    'lad': 'its count is lad! "let!" (lade), not the adjective "lazy"',
    'tag': 'its count is tag! "take!" (tage), not the noun "roof"',
    'hold': 'its count is hold! "hold!" (holde), not the noun "team"',
    'gange': 'the plural of gang "time", taught there; its entry is "to multiply"',
    'hør': 'its count is hør! "listen!" (høre), not the noun "flax"',
    'mangen': 'taught as mange (`ALIAS`)', 'al': 'taught as alle (`ALIAS`)',
    # A FORM OF ANOTHER WORD, filed with a meaning of its own
    'fund': 'its count is fundet, the participle of finde; the noun "a find" is rare beside it',
    'gode': 'its count is the plural of god; the noun "a blessing" is rare beside it',
    'bedste': 'the superlative of god, whose table shows it',
    'vis': 'its count is vist "probably" and på en måde; the noun "manner" is rare',
    # Read off the A2 ranking (2026-11-15).
    # A FORM TAUGHT ON ANOTHER CARD
    'hurtigt': 'the neuter of hurtig (A2)', 'dårligt': 'the neuter of dårlig (A1)',
    'sjovt': 'the neuter of sjov', 'dejligt': 'the neuter of dejlig', 'rent': 'the neuter of ren (A2)',
    'klokken': 'the definite of klokke (A1), "o\'clock"', 'holdt': 'the past of holde (A1)',
    'hørt': 'the participle of høre (A1)', 'luk': 'the imperative of lukke (A1)',
    'fader': 'the formal father, far being taught (A1)',
    # ITS COUNT IS ANOTHER WORD'S
    'live': 'its count is livet, the definite of liv (A1); the verb "to enliven" is rare',
    'læg': 'its count is læg! "put!" (lægge); the noun "calf" is rare beside it',
    'spore': 'its count is sporet, the definite of spor; the noun "spore" is rare',
    'hov': 'its count is the interjection hov! "oops"; the noun "hoof" is rare',
    'oppe': 'its count is the adverb oppe "up", which Wiktionary does not give; its verb is rare',
    'an': 'met only in fixed expressions', 'øh': 'a hesitation sound with no meaning to teach',
    'kæft': 'met in the rude hold kæft "shut up"',
    'forsvind': 'the imperative of forsvinde (A2), filed as an interjection',
    'dér': 'the stressed spelling of der (A1)',
    'aflede': 'its table gives lede\'s forms (leder, ledte), which claim lede\'s and leder\'s count',
    # Read off the B1 ranking (2026-11-15).
    # A FORM TAUGHT ON ANOTHER CARD, or an old or formal spelling of one
    'særligt': 'the neuter of særlig (A2)', 'ordentligt': 'the neuter of ordentlig (B1)', 'dybt': 'the neuter of dyb (B1)',
    'onde': 'the plural of ond (A1); its noun "evil" is rare beside it',
    'hellige': 'the plural of hellig; its verb "to hallow" is rare beside it',
    'lange': 'the plural of lang (A1); its noun is a fish',
    'vore': 'the plural of vor, whose card shows it', 'vort': 'the neuter of vor, whose card shows it',
    'broder': 'the formal brother, bror being taught (A1)', 'moder': 'the formal mother, mor being taught (A1)',
    'kong': 'the title before a king\'s name; konge is taught (A2)',
    'holder': 'its count is holder, the present of holde (A1); the noun "holder" is rare beside it',
    'tvivler': 'its count is the present of tvivle (B1); the noun "doubter" is rare',
    'skifter': 'the present of skifte (A2), filed as the radio "over"',
    'modtaget': 'the participle of modtage, filed as the radio "roger"',
    'lev': 'its count is lev! "live!" (leve); its noun is a Bulgarian coin',
    'lo': 'its count is lo, the past of le (A2); its noun is a threshing floor',
    # ITS COUNT IS NOT FOR ITS ENTRY
    'kædemaske': 'a crochet term; its count is not the deck\'s', 'el': 'its count is el "electricity"; its noun is "alder"',
    'rom': 'its count is Rome; its noun is "rum"', 'van': 'its count is vant "used to"; its noun is a Norse god',
    'mile': 'its count is the English mile; its noun is "a dune"', 'næ': 'the spoken "no"; its noun is "the waning moon"',
    'rage': 'its count is not "to scrape"', 'las': 'its count is not "a rag"', 'lude': 'its count is luder, a swear word',
    'ram': 'its count is ramme "to hit"; its adjective is rare',
    'pinligt': 'its count is "embarrassing"; Wiktionary\'s adverb is "precisely"',
    'service': 'its count is the service; Wiktionary\'s noun is "tableware"',
    'sprut': 'its count is the slang "booze"; its noun is "a squirt"',
    'patte': 'a crude word for a breast', 'fis': 'a fart', 'tisse': 'to pee; childish',
    'åndssvag': 'an insult', 'voldtage': 'not taught in a level deck, though common in the subtitles\' crime drama',
    # Read off the B2 ranking (2026-11-15).
    # A FORM TAUGHT ON ANOTHER CARD, or another spelling of one
    'rimeligt': 'the neuter of rimelig (B2)', 'billigt': 'the neuter of billig (A1)', 'løst': 'the neuter of løs (A2)',
    'sygt': 'the neuter of syg (A1)', 'sindssygt': 'the neuter of sindssyg (B1)',
    'offentligt': 'the neuter of offentlig (B1)', 'pludseligt': 'the neuter of pludselig (B1)',
    'små': 'the plural of lille (A1)', 'dumme': 'the plural of dum (A2); its verb is rare',
    'trætte': 'the plural of træt (A1); its verb "to bicker" is rare', 'kristne': 'the plural of kristen; its verb is rare',
    'benet': 'the definite of ben (A1); its adjective "bony" is rare', 'vesten': 'the definite of vest (B1)',
    'tusinde': 'the longer spelling of tusind (A1)', 'århundred': 'the shorter spelling of århundrede (B1)',
    'hall': 'the English spelling of hal (B1)', 'syne': 'its count is synes (B1); its verb "to inspect" is rare',
    # ITS COUNT IS ANOTHER WORD'S: a present, a past, a participle, an imperative
    'rykker': 'the present of rykke; its noun is "a dunning letter"', 'ryk': 'the imperative of rykke',
    'hang': 'the past of hænge (A2)', 'spar': 'the imperative of spare (B1); its noun is the card suit',
    'pak': 'the imperative of pakke; its noun is found only in compounds', 'fang': 'the imperative of fange (A2)',
    'hiv': 'the imperative of hive (B1)', 'skru': 'the imperative of skrue (B1)', 'øg': 'the imperative of øge (B1)',
    'flyv': 'the imperative of flyve (A2)', 'ødelæg': 'the imperative of ødelægge (A2)',
    'overført': 'the participle of overføre; its adjective "figurative" is rare',
    'stjålen': 'the participle of stjæle (A2); its adjective "stealthy" is rare',
    'sveder': 'the present of svede; its noun is a school detention',
    # ITS COUNT IS NOT FOR ITS ENTRY: English, names, letters
    'green': 'English', 'in': 'English', 'hot': 'English', 'yo': 'English', 'kid': 'English', 'bridge': 'English',
    'die': 'its count is the English word; its noun is "breast milk"', 'my': 'a Greek letter; its count is English "my"',
    'misse': 'its count is the English "miss"; Wiktionary has only "to blink"', 'gus': 'its count is a name',
    'em': 'its count is EM, the championship', 'pentagon': 'its count is the Pentagon',
    'gram': 'its count is the unit; its adjective "irate" is rare', 'bølle': 'its count is "a bully"; its noun is a bilberry bush',
    'hu': 'met only in fixed phrases', 've': 'met only in fixed phrases', 'ho': 'a laugh with no meaning to teach',
    'søren': 'a mild oath', 'tæsk': 'Wiktionary gives it no gender, and its plural use (en gang tæsk) is the count',
    'bilde': 'its count is bilde sig ind "to imagine", which Wiktionary does not give',
    'nødder': 'Wiktionary\'s entry is the slang "breasts"; nød "nut" is its plural\'s word',
    'rap': 'its count is rap music; its entry is a duck\'s quack',
    'neger': 'a slur', 'liderlig': 'crude', 'porno': 'not taught in a level deck', 'voldtægt': 'as voldtage (B1)',
    # Read off the C1 ranking (2026-11-15).
    # A FORM TAUGHT ON ANOTHER CARD, or another spelling of one
    'brutalt': 'the neuter of brutal (B2)', 'besværligt': 'the neuter of besværlig (C1)',
    'negativt': 'the neuter of negativ (B1)', 'samtidigt': 'the neuter of samtidig (B1)',
    'kære': 'its count is the plural of kær (A2); its verb "to appeal" is rare',
    'værsågod': 'the older spelling of værsgo (A1)', 'grev': 'the title before a count\'s name; greve is taught',
    'bestil': 'the imperative of bestille (A2)', 'lid': 'the participle of lide (A1); its noun "trust" is rare',
    # ITS COUNT IS NOT FOR ITS ENTRY: English, names, a dialect
    'out': 'English', 'yes': 'English', 'hi': 'English', 'made': 'English', 'gold': 'English',
    'not': 'English', 'he': 'English', 'as': 'English; its noun is one of the Æsir', 'ask': 'English',
    'eagle': 'English', 'hip': 'English', 'clean': 'English', 'arne': 'its count is the name Arne',
    'old': 'its count is not the school subject', 'moar': 'dialect', 'fas': 'its count is not "a chamfer"',
    'gokke': 'its count is not "to bat"', 'tæv': 'Wiktionary gives it no gender, as tæsk (B2)',
    # CRUDE OR SEXUAL WORDS, SLURS AND INSULTS
    'pikhoved': 'crude', 'diller': 'crude', 'babs': 'crude', 'blowjob': 'crude', 'onanere': 'not taught in a level deck',
    'samleje': 'not taught in a level deck', 'orgasme': 'not taught in a level deck', 'hor': 'not taught in a level deck',
    'tis': 'crude', 'fise': 'crude', 'prut': 'crude', 'prutte': 'crude', 'nederen': 'crude slang',
    'sjuske': 'an insult', 'misfoster': 'an insult', 'pædofil': 'not taught in a level deck',
    'tjald': 'drug slang',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'fanden', 'fandme', 'fuck', 'fucking', 'lort', 'pis', 'pisse', 'røv', 'satan', 'helvede',
          'kraftedeme', 'kælling', 'luder', 'idiot', 'fjols', 'nar', 'bøsse', 'kneppe', 'pik',
          'fisse', 'skide', 'shit', 'svin', 'røvhul', 'dælme', 'sgu', 'fandeme',
          'fandens', 'forbandet', 'pokker', 'pokkers', 'kraftedme', 'fanden',
          'skiderik', 'nosse', 'forpulet', 'tæve', 'stodder', 'helvedes', 'hore', 'mær', 'kusse', 'tøjte'}

# A FILL WORD'S READING: the part of speech its count is for, where Wiktionary lists
# another first.
FILL_POS = {'tro': 'verb', 'nok': 'adv', 'lige': 'adv', 'slå': 'verb', 'prøve': 'verb',
            'helt': 'adv', 'lade': 'verb', 'bede': 'verb', 'vise': 'verb', 'vinde': 'verb',
            'næste': 'adj', 'grund': 'noun', 'gift': 'adj', 'stå': 'verb', 'kende': 'verb',
            'lukke': 'verb', 'ringe': 'verb', 'rejse': 'verb', 'følge': 'verb', 'ende': 'verb',
            'fejl': 'noun',
            # A2 (2026-11-15): the verb or adjective, not a rare noun spelt like it
            'fri': 'adj', 'bringe': 'verb', 'ane': 'verb', 'normal': 'adj', 'kær': 'adj', 'føde': 'verb',
            'føre': 'verb', 'le': 'verb', 'kaste': 'verb', 'fylde': 'verb', 'tvinge': 'verb', 'sej': 'adj',
            'tjekke': 'verb', 'rende': 'verb', 'tælle': 'verb', 'banke': 'verb', 'rive': 'verb',
            'hoppe': 'verb', 'styre': 'verb', 'spænde': 'verb', 'bytte': 'verb',
            # B1 (2026-11-15)
            'ride': 'verb', 'klippe': 'verb', 'putte': 'verb', 'lette': 'verb', 'spare': 'verb',
            'tømme': 'verb', 'skinne': 'verb', 'rode': 'verb',
            # B2 (2026-11-15)
            'arve': 'verb', 'våge': 'verb', 'gylden': 'adj',
            # C1 (2026-11-15)
            'sambo': 'noun'}

# A WORD DEALT BY ANOTHER'S COUNT.  The pronoun `I` "you (plural)" is counted in the
# subtitles under its lower case, the preposition `i`, so it is dealt by its object form's.
SAME_AS = {'I': 'jer'}

# A LEARNER'S WORD WIKTIONARY HEADS UNDER ANOTHER: the card prints the word written in
# the inventory, with the headword's meanings and table.  `mange` "many" is the plural of
# Wiktionary's `mangen` (archaic in the singular); `alle` "all, everyone" of `al`.
ALIAS = {'mange': 'mangen', 'alle': 'al'}


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
            if k in ALIAS:
                via = ALIAS[k]
                tgt = lex[via]
                L = dict(tgt, word=w, freq=tgt['freq'])
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
        if len(k) < 2 and k not in ('i', 'å', 'ø'):
            continue
        # a MULTI-WORD lemma (holde af, for eksempel) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        # AN ALTERNATIVE SPELLING THE LEVEL ALREADY HAS (`nogle` beside `nogen`,
        # `meget` beside `megen`): Wiktionary gives both full entries, glossed
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
