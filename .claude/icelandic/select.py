#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`icelandic_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from isl import fold
from icelandic_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-15).  Each with its reason.
EXCLUDE = {
    # A FORM TAUGHT ON ANOTHER CARD
    'allt': 'the neuter of allur "all" (A1), whose card teaches it',
    'gott': 'the neuter of góður "good" (A1)',
    'eitt': 'the neuter of einn "one" (A1); its own entry is a rare adverb "alone"',
    # A COUNT THAT IS ANOTHER WORD'S
    'ger': 'its count is gera "to do" (A1)\'s forms (ger, gert); its entry is "yeast"',
    'sama': 'its count is sami "the same"\'s forms; its entry is a rare adverb "indifferently"',
    # Read off the A2 ranking (2026-11-16).
    'hey': 'its count is the English interjection; its entry is "hay"',
    'næsta': 'the feminine and neuter of næstur "next", taught in A2',
    'betra': 'its count is betra "better", the neuter of betri (góður, A1); its entry is "to improve"',
    'gær': 'met only in í gær "yesterday" (A1)',
    'aftann': 'its count is aftan "from behind"; its entry is a poetic "evening"',
    'reiða': 'its count is reiða, a form of reiður "angry" (A2); its entry is "to carry on horseback"',
    'minna': 'its count is minna "less", the comparative of lítill (A1); its entry is "to remind"',
    'ber': 'its count is ber, the present of bera "to carry" (A2), and ber "a berry"; its entry is "bare"',
    'síður': 'its count is síður "less, rather" (the comparative adverb) and síða "a page"; its entry is "long, low-hanging"',
    # Read off the B1 ranking (2026-11-16).
    'sumur': 'the singular of sumir "some" (A2), whose card teaches it',
    'má': 'its count is má, the present of mega "may" (A1); its entry is "to blur"',
    'dá': 'its count is mostly deyja "to die" (A1)\'s forms (dáinn, dáið); its entries are "a coma" and a literary "to adore"',
    'parís': 'its count is the city, Paris; its entry is "hopscotch"',
    'mattur': 'its own spelling is met once in the subtitles; its count is other words\' forms',
    'æja': 'its count is the interjection æ; its entry is a rare "to stop to rest"',
    'gella': 'its count is the slang "a babe"; its entry is "a cod tongue"',
    'var': 'its count is var, the past of vera "to be" (A1); its entry is "cautious"',
    'húfur': 'its count is húfa "a cap" (A2)\'s forms; its entry is "a ship\'s hull"',
    'þinur': 'its count is þinn "your" (A1)\'s forms; its entry is "a fir"',
    'me': 'its count is the English word; its entry is "baa"',
    'skutla': 'its count is the slang "a babe"; its entry is "a shuttle"',
    'dauðans': 'the genitive of dauði "death" (A2), used as an intensifier',
    'seyðir': 'met only in set phrases; á seyði is taught on seyði',
    'pat': 'its count is the name Pat; its entry is "a gesture"',
    'ver': 'its count is ver, the present of verja and vera\'s forms; its entry is "a line in the water"',
    'totta': 'its count is a sexual sense',
    'fær': 'its count is fær, the present of fá "to get" (A1); its entry is "able"',
    'nauðga': 'not taught in a level deck, though common in the subtitles\' crime drama (as Norwegian\'s voldta)',
    # Read off the B2 ranking (2026-11-16).
    # A COUNT THAT IS ANOTHER WORD'S, OR A WORD MET ONLY IN A SET PHRASE
    'gat': 'its count is gat, the past of geta "can" (A1); its entry is "a hole"',
    'lagður': 'its count is the participle of leggja "to lay" (A1); its entry is "a tuft of wool"',
    'borinn': 'the participle of bera "to carry" (A2)',
    'gula': 'its count is gulur "yellow" (A1)\'s forms; its entry is "jaundice"',
    'ranga': 'its count is rangur "wrong" (A2)\'s forms; its entry is "the reverse side"',
    'móður': 'its count is móður, the genitive of móðir "mother" (A1); its entry is "anger"',
    'falda': 'its count is falinn "hidden"\'s forms; its entry is "to hem"',
    'stríður': 'its count is stríð "war" (A2)\'s forms; its entry is "unwieldy"',
    'skyldur': 'its count is skyldur, the plural of skylda "duty" (B1); its entry is "related"',
    'met': 'its count is met "a record" and meta\'s forms, which its entry ("counterweights") does not give',
    'kefja': 'its own spelling is not met in the subtitles; its count is other words\' forms',
    'kringja': 'its count is í kring and kringum (A2); its entry is "to round"',
    'kínverji': 'its count is Kínverji "a Chinese person"; its entry is "a firecracker"',
    'gemsi': 'its count is the slang "a mobile phone"; its entry is "a year-old sheep"',
    'emm': 'the name of a letter', 'ess': 'the name of a letter',
    'alfa': 'a Greek letter', 'delta': 'a Greek letter',
    'eð': 'met only in hvort eð er', 'kennsl': 'met only in bera kennsl á "to recognise"',
    'blasa': 'met only in blasa við', 'runka': 'met only in a sexual phrase',
    'not': 'its count is the English word; its entry is "use"', 'for': 'the English word; its entry is "mud"',
    'lost': 'the English word; its entry is "a shock"', 'ok': 'the English word; its entry is "a yoke"',
    'patt': 'its count is the name Pat; its entry is "stalemate"',
    'je': 'an interjection with no meaning to teach', 'au': 'an interjection with no meaning to teach',
    # SLANG, OR SEXUAL
    'ljóska': 'its count is the slang "a blonde"', 'sæta': 'its count is the slang "a pretty girl"',
    'graður': 'its count is the slang "horny"', 'káfa': 'sexual', 'fróa': 'its count is a sexual sense',
    'mök': 'sexual', 'kynmök': 'sexual', 'nauðgun': 'excluded with nauðga (B1)',
    'svertingi': 'a dated term for a black person, now offensive',
    'öfuguggi': 'an insult (a slur on gay men)',
    # Read off the C1 ranking (2026-11-16).
    # A COUNT THAT IS ANOTHER WORD'S, OR A WORD MET ONLY IN A SET PHRASE
    'verður': 'its count is verður, the present of verða "to become" (A1); its entries are "a meal" and "worthy"',
    'lá': 'its count is lá, the past of liggja "to lie" (A2); its entry is "to blame"',
    'mat': 'its count is mat, a case of matur "food" (A1); its entry is "an evaluation"',
    'manna': 'its count is manna, the genitive plural of maður (A1); its entry is "to man"',
    'men': 'its count is the English word and menn (maður\'s plural); its entry is "a necklace"',
    'endur': 'its count is endur "ducks" (önd\'s plural, B2); its entry is met only in set phrases',
    'æður': 'its count is æð "a vein" (C1)\'s forms; its entry is "wadeable"',
    'daglegt': 'the neuter of daglegur, taught in C1',
    'æs': 'its own spelling is not met in the subtitles', 'arða': 'its own spelling is barely met in the subtitles',
    'skefjar': 'met only in set phrases', 'kinka': 'met only in kinka kolli "to nod"',
    'mannavillt': 'met only in fara mannavillt', 'mund': 'met only in set phrases',
    'pæla': 'its count is the colloquial "to think about", which its entry ("to hoe") does not give',
    'jóna': 'its count is the slang "a joint"; its entry is "to ionise"',
    'kurt': 'its count is the name Kurt', 'adda': 'its count is the name Adda', 'bambi': 'the name Bambi',
    'at': 'the English word; its entry is "a fight"', 'il': 'the English and French word; its entry is "a sole"',
    'ið': 'its own spelling is a fragment (iði, -ið)', 'des': 'a musical note\'s name (D flat)',
    'es': 'a musical note\'s name (E flat)', 'beta': 'a Greek letter', 'þeta': 'a Greek letter',
    'ómega': 'a Greek letter',
    # SEXUAL, OR A SLUR
    'standpína': 'sexual', 'samfarir': 'sexual', 'elskast': 'sexual', 'tott': 'sexual',
    'barna': 'sexual ("to get pregnant")', 'sæða': 'sexual', 'snípur': 'sexual', 'hreðjar': 'sexual',
    'tittlingur': 'its count is the slang sense; its entry is "a small bird"',
    'skvísa': 'slang for a woman', 'surtur': 'a racial slur', 'munnmök': 'sexual',
    'hylma': 'met only in hylma yfir "to cover up"', 'art': 'its count is the English word; its entry is "a nature"',
    'set': 'its count is the English word; its entry is "a seat"',
    'aðsig': 'met only in set phrases',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'fjandi', 'andskoti', 'helvíti', 'djöfull', 'fokk', 'skítur', 'tík', 'hóra', 'drulla',
          # A2 (2026-11-16): curses and insults
          'fjandans', 'fjári', 'fífl', 'hálfviti', 'auli', 'rass', 'kjaftæði', 'bjáni',
          # B1 (2026-11-16)
          'hommi', 'pissa', 'fáviti', 'rassgat', 'píka', 'drullusokkur', 'skratti', 'fjárans',
          # B2 (2026-11-16)
          'tæfa', 'ansans', 'árans', 'helvískur', 'mella', 'flón', 'heimskingi', 'kúkur', 'úrþvætti',
          # C1 (2026-11-16)
          'fokking', 'perri', 'lessa', 'viðrini', 'ári', 'kúka', 'prumpa', 'hóruhús', 'freta'}

# A FILL WORD'S READING: the part of speech its count is for, where Wiktionary lists
# another first.
FILL_POS = {'sá': 'pron',       # "that (one)", not "to sow"
            'rétt': 'adv',      # "right, correctly", not "a sheep fold"
            'hætta': 'verb', 'horfa': 'verb', 'ræða': 'verb',   # the verb, not a noun spelt like it
            # A2 (2026-11-16): the verb, not a noun spelt like it
            'renna': 'verb', 'velta': 'verb', 'kanna': 'verb', 'kveðja': 'verb', 'vísa': 'verb',
            'skella': 'verb', 'hrífa': 'verb', 'greiða': 'verb', 'enda': 'verb',
            'meðal': 'prep',     # "among", not "a medicine"
            # B1 (2026-11-16): the verb, not a noun spelt like it, and the reverse
            'skemma': 'verb', 'jafna': 'verb', 'stytta': 'verb', 'hella': 'verb', 'spá': 'verb',
            'sturta': 'noun',    # "a shower", not "to pour down"
            'þyrla': 'noun',     # "a helicopter", not "to whirl"
            'rita': 'verb'}      # B2: "to write", not "a kittiwake"

# A WORD DEALT BY ANOTHER'S COUNT.
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
        if len(k) < 2 and k not in ('í', 'á', 'ó', 'ú', 'æ'):
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
