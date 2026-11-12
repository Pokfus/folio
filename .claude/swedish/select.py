#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`swedish_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sv import fold
from swedish_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    # FORMS TAUGHT ON ANOTHER CARD: Wiktionary gives each a full entry of its own, and
    # the closed-class rule hands it its whole count, so it was dealt as a word.
    'ett': 'the neuter of the article en, taught on its card (and the neuter of en "one")',
    'mitt': 'the neuter of min, whose table shows it',
    'ditt': 'the neuter of din, whose table shows it',
    'våra': 'the plural of vår, whose table shows it',
    'era': 'the plural of er "your", whose table shows it (and a noun, "era")',
    'annat': 'the neuter of annan, taught there',
    'vilket': 'the neuter of vilken, taught there',
    'inget': 'the neuter of ingen; ingenting is the inventory\'s "nothing"',
    'nåt': 'the colloquial spelling of något, taught there',
    # NOT A WORD ON ITS OWN AT THIS LEVEL
    'plan': 'two nouns of two genders (ett plan "plane, level", en plan "plan") under one '
            'spelling, which one card cannot give one article',
    'reda': 'met only in ta reda på "to find out"; its entries are "ready" and "order"',
    'va': 'the spoken "what?" and "was"; Wiktionary\'s entry is the abbreviation of vatten och avlopp',
    # Read off the A2 ranking (2026-11-12).
    # A FORM TAUGHT ON ANOTHER CARD (an adjective's neuter used as an adverb, where the
    # adjective is taught; a plural; a definite), dealt by the closed-class rule's count
    'svårt': 'the neuter of svår (A1)', 'stort': 'the neuter of stor (A1)',
    'nytt': 'the neuter of ny (A1)', 'sent': 'the neuter of sen (A1)',
    'dåligt': 'the neuter of dålig (A1)', 'tidigt': 'the neuter of tidig (A1)',
    'klart': 'the neuter of klar, taught in A2', 'viktigt': 'the neuter of viktig, taught in A2',
    'konstigt': 'the neuter of konstig, taught in A2', 'snabbt': 'the neuter of snabb, taught in A2',
    'hårt': 'the neuter of hård, taught in A2', 'enkelt': 'the neuter of enkel, taught in A2',
    'fullt': 'the neuter of full, taught in A2', 'farligt': 'the neuter of farlig, taught in A2',
    'underbart': 'the neuter of underbar, taught in A2', 'trevligt': 'the neuter of trevlig, taught in A2',
    'eget': 'the neuter of egen, taught in A2', 'egna': 'the plural of egen, taught in A2',
    'vilka': 'the plural of vilken (A1)', 'själva': 'the plural of själv (A1)',
    'välkomna': 'the plural of välkommen (A1)', 'vita': 'a form of vit (A1); its noun is "egg white"',
    'gånger': 'the plural of gång (A1)', 'peng': 'the singular of pengar (A1), rare beside it',
    'slutet': 'the definite of slut "end"; Wiktionary\'s entry is the participle "closed"',
    'värre': '"worse", the comparative of dålig; Wiktionary\'s adverb is the slang "very"',
    'fader': 'the formal father, far being taught (A1)',
    # NOT A WORD THE COUNT IS FOR
    'stiftsstad': 'its table claims stan, the spoken "the town" (stad, A1)',
    'dan': 'the spoken dagen "the day"; Wiktionary\'s entry is a rare adjective',
    'fint': 'the neuter of fin (A1); Wiktionary\'s entry is "a feint"',
    'ok': 'the spelling of okej (A1); Wiktionary\'s entry is "a yoke"',
    'jack': 'the English name; Wiktionary\'s entry is "a gash"',
    'henry': 'the English name; Wiktionary\'s entry is the unit of inductance',
    'max': 'a name and a clipping; no everyday meaning a card can teach',
    'morse': 'met only in i morse "this morning"; Wiktionary\'s entry is Morse code',
    'vis': 'met in på sätt och vis; its adjective "wise" is rare',
    'dr': 'an abbreviation', 'ers': 'archaic, met only in Ers Majestät',
    'ihåg': 'met only in komma ihåg, which is the phrases deck\'s',
    'käften': 'met only in the rude håll käften "shut up"',
    'vackert': 'the neuter of vacker, taught in A2',
    'värsta': '"worst", the superlative of dålig; Wiktionary\'s entry is the slang intensifier',
    'bar': 'its plural is bara "only" (A1), whose count it takes',
    'nick': 'the English name Nick; "a nod" is rare beside it',
    'snut': 'slang for polis (A1); Wiktionary\'s first sense is "a snout"',
    # Read off the B1 ranking (2026-11-12).
    # A FORM TAUGHT ON ANOTHER CARD
    'rent': 'the neuter of ren (A2)', 'öppet': 'the neuter of öppen (A2)',
    'lågt': 'the neuter of låg (A2)', 'starkt': 'the neuter of stark (A2)',
    'försiktigt': 'the neuter of försiktig (A2)', 'snällt': 'the neuter of snäll (A2)',
    'vitt': 'the neuter of vit (A1)', 'brunt': 'the neuter of brun (A1)',
    'sjukt': 'the neuter of sjuk (A1), here the slang "incredibly"',
    'djupt': 'the neuter of djup, taught in B1', 'normalt': 'the neuter of normal, taught in B1',
    'still': 'the adverb of stilla, taught in B1',
    'ena': 'the definite of en (A1)', 'ende': 'the masculine of enda (A1)',
    'långa': 'the plural of lång (A1); its noun is a fish', 'glada': 'the plural of glad (A1); its noun is a bird',
    'sjuka': 'the plural of sjuk (A1)', 'hela': 'the definite of hel (A1); its verb "to heal" is rare',
    'kläde': 'the singular of kläder (A2), rare beside it', 'stycken': 'the plural of stycke, glossed "instances"',
    'broder': 'the formal brother, bror being taught (A1)', 'fars': 'the genitive of far (A1); its noun is "a farce"',
    'led': 'the past of lida and leda (A2); its adjective "tired" is rare',
    'raka': 'the plural of rak "straight"; its noun is a road\'s straight',
    'käft': 'met in the rude håll käften (excluded in A2)',
    # NAMES, AND WORDS THE SUBTITLES' COUNT IS NOT FOR
    'bill': 'the English name', 'don': 'the name and title', 'lisa': 'the name', 'linda': 'the name',
    'grace': 'the name', 'donna': 'the name', 'lady': 'the English title, in names',
    'al': 'the name; Wiktionary\'s entry is "alder"', 'and': 'the English word; its noun is "a wild duck"',
    'rom': 'Rome; its noun is "roe"', 'oliv': 'the name Oliver\'s count; its noun is "olive"',
    'japan': 'the country; Wiktionary\'s lower-case entry is "a Japanese person"',
    'matt': 'the name Matt; its adjective is rare', 'pari': 'Paris\'s count; its noun is a finance term',
    'labb': 'the clipped "lab" is not its entry, "a skua"', 'kar': 'the spoken karl; its noun is "a tub"',
    'å': 'the spoken att and the interjection; its noun "a stream" is rare',
    'ar': 'a unit of area, its count a misspelling of är', 'lo': 'a lynx, its count the intensifier',
    'rya': 'a rug; no everyday use', 'rådslå': 'formal and rare; its count is råd\'s',
    'gode': 'the definite of god "good"; its noun is a pagan priest',
    'korka': 'its count is korkad "stupid"; the verb "to cork" is rare',
    'fix': 'met in fix idé; its noun is a drug dose', 'bot': 'met in råda bot på',
    'grann': 'met in lite grann "a little"; its "pretty" is dated',
    'hacka': 'a pickaxe or a stammer, neither the count\'s',
    'strunta': 'met only in strunta i, the phrases deck\'s', 'go': 'dialect; its noun is the game',
    'wow': 'English', 'ah': 'an interjection with no meaning to teach',
    'våran': 'the spoken vår (A1), which Wiktionary gives no meaning of its own',
    'rött': 'the neuter of röd (A1)', 'grymt': 'the neuter of grym, taught in B1',
    'sena': 'the plural of sen (A1); its noun is "a tendon"', 'as': 'its count is not "carrion"',
    'sistone': 'met only in på sistone',
    'verkligt': 'the neuter of verklig, taught in B1',
    'toa': 'the clipped toalett (A1); Wiktionary gives it no meaning of its own', 'king': 'English slang',
    'våldta': 'not taught in a level deck, though common in the subtitles\' crime drama',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'fan', 'jävla', 'jävel', 'helvete', 'skit', 'fitta', 'kuk', 'hora', 'idiot', 'satan',
          'jävlas', 'skita', 'knulla', 'röv', 'arsle', 'fittig', 'bög', 'skitstövel', 'fanskap',
          'djävul', 'djävla', 'jävlar', 'jävligt', 'skitsnack'}

# A FILL WORD'S READING: the part of speech its count is for, where Wiktionary lists
# another first (read off the A1 build, 2026-11-09) -- `tro` is dealt for "to believe",
# not the noun "belief", `ringa` for "to ring, to call", not the adjective "small".
FILL_POS = {'tro': 'verb', 'ringa': 'verb', 'mot': 'prep', 'det': 'pron', 'visa': 'verb',
            'röra': 'verb', 'sticka': 'verb', 'skada': 'verb', 'bry': 'verb',
            # read off the A2 build (2026-11-12): the verb, not a rare noun spelt like it
            'räcka': 'verb', 'stämma': 'verb', 'gömma': 'verb', 'kräva': 'verb', 'föda': 'verb',
            'fylla': 'verb', 'äga': 'verb', 'suga': 'verb', 'driva': 'verb', 'råka': 'verb',
            'bete': 'verb',
            'gift': 'adj',      # "married", not "poison"
            'tuff': 'adj', 'egen': 'pron', 'grund': 'noun', 'öde': 'noun',
            # B1 (2026-11-12)
            'strid': 'noun', 'knapp': 'noun', 'ström': 'noun', 'rulla': 'verb', 'vars': 'pron',
            'ro': 'noun', 'kram': 'noun', 'sörja': 'verb'}

# A WORD DEALT BY ANOTHER'S COUNT.  `ska` is the spoken form of the verb whose
# infinitive Wiktionary heads `skola`, and that table claims `ska` and `skulle`,
# so `ska` by its own count would be dealt last of A1 for the commonest modal.
SAME_AS = {'ska': 'skola'}


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
        if len(k) < 2 and k not in ('i', 'å', 'ö'):
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
