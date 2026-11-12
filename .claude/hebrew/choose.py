"""Which of a key's words a card teaches -- shared by `select.py` and `build_deck.py`.

A key is an unpointed spelling, and under it Wiktionary may file several words
(`ספר`: sefer "book", safar "he counted", sapar "barber").  A card teaches ONE
POINTED WORD, with every entry that has the same pointed form (`שָׁלוֹם` the noun
"peace" and the greeting "hello" are one word, and one card).

THE CHOICE, in order:
  1. the inventory's pointed form (`שם=שָׁם`), else its part of speech (`יכול:verb`);
  2. `PICK` below, a hand choice with its reason (a pointed form, and a part of speech after a
     colon where the word's readings should open on that one);
  3. the word whose OWN forms are commonest: an entry's `score` from `extract.py`
     (what the surfaces only it holds earn), and for a closed-class word -- which
     has no forms but itself -- the count of the spelling itself.  `אתה` is the
     pronoun "you", not the verb "come" whose table merely contains `שאתה`.
An entry whose every sense is weak (archaic, Biblical, rare ...) is never chosen
while another is not.
"""
import unicodedata

CLOSED = {'adv', 'prep', 'conj', 'particle', 'pron', 'det', 'num', 'intj', 'contraction'}

# Each with its reason, read off the A1 ranking.
PICK = {
    'בוקר': 'בֹּקֶר',     # "morning"; the cowboy's and the passive verb's forms outscore it
    'ערב': 'עֶרֶב',       # "evening"
    'כסף': 'כֶּסֶף',      # "money, silver", not the silversmith
    'צבע': 'צֶבַע',       # "colour"; the verb "painted" holds more forms
    'אורז': 'אֹרֶז',      # "rice", not the packer
    'שקל': 'שֶׁקֶל',      # "shekel" (A1 money); the verb "weigh" holds more forms
    'חלב': 'חָלָב',       # "milk"
    'מלח': 'מֶלַח',       # "salt"
    'רעב': 'רָעֵב',       # "hungry"
    'קצר': 'קָצָר',       # "short"
    'עייף': 'עָיֵף',      # "tired", the adjective
    'שחור': 'שָׁחֹר',     # "black"
    'שמח': 'שָׂמֵחַ',     # "happy", the adjective
    'חולה': 'חוֹלֶה',
    'חום': 'חֹם',         # "heat, fever" (the body topic); "brown" is the colour word
    'מספר': 'מִסְפָּר',   # "number"
    'כאב': 'כְּאֵב',      # "pain" (the body topic); the verb "hurt" follows on its own card if dealt
    'גר': 'גָּר',         # "to live, reside"
    'חברה': 'חֲבֵרָה',    # "friend (female), girlfriend"; "company" is the other word
    'עד': 'עַד',          # "until"
    'אל': 'אֶל',          # "to, towards"; "god" holds the forms
    'בעל': 'בַּעַל',      # "husband, owner"
    'אם': 'אִם',          # "if"; "mother" holds the forms (A1 teaches אמא)
    'עם': 'עִם',          # "with"
    'כי': 'כִּי',
    'טוב': 'טוֹב:adj',     # "good" first; the noun, adverb and interjection of the word follow
    'מכר': 'מָכַר',
    'אחר': 'אַחֵר',       # "other"; the preposition "after" is the rarer reading
    'בטח': 'בֶּטַח',      # "sure, of course", not the verb "trust"
    'רב': 'רַב',          # "many, much; rabbi", not "to contend"
    'פרק': 'פֶּרֶק',      # "chapter, episode"; "park" is פארק
    # A2 (2026-11-12), read off the A2 ranking
    'גב': 'גַּב',          # "back"; the cistern holds the forms
    'צר': 'צַר',          # "narrow" (צר לי, I'm sorry), not "to shape"
    'קיים': 'קַיָּם',      # "existing, exists", not "to bring into existence"
    'זקן': 'זָקֵן:adj',    # "old, elderly"; the beard and the verb are other words
    'חזק': 'חָזָק',        # "strong", not "to be strong"
    'שכן': 'שָׁכֵן:noun',  # "neighbour", not "to dwell"
    'נעל': 'נַעַל',        # "shoe", not "to put on (a shoe)"
    'פחד': 'פַּחַד',       # "fear", the noun
    'עור': 'עוֹר',         # "skin", not "to blind"
    'דומה': 'דּוֹמֶה',     # "similar", not "to imagine"
    'גן': 'גַּן',          # "garden", not "gene"
    'פרס': 'פְּרָס',       # "prize", not "to slice" or the vulture
    'שלם': 'שָׁלֵם',       # "whole, complete"
    'מרכז': 'מֶרְכָּז',     # "centre", not "to centralise"
    'צמא': 'צָמֵא:adj',    # "thirsty"
    'כיוון': 'כִּוּוּן',    # "direction"; the verb's count is מכיוון "since", which its table holds
    'סתם': 'סְתָם',       # "just, merely, for no reason", not the verb "to stop up"
}


# A POINTED FORM IS COMPARED IN ONE ORDER OF ITS MARKS (A2, 2026-11-12): a dagesh and a vowel under one
# letter may be typed in either order, and `גַּן` as typed here did not equal the extraction's NFC `גַּן`,
# so the pick silently fell through to the gene.
PICK = {k: unicodedata.normalize('NFC', v) for k, v in PICK.items()}


def usable(e):
    return any(not g['weak'] for g in e['glosses'])


def score(e, L):
    return L.get('own', 0) if e['pos'] in CLOSED else e.get('score', 0)


def choose(L, pos='', pick=''):
    """The entries of the word a card teaches: the lead entry first, then the others that share
    its pointed form, in Wiktionary's order."""
    ents = [e for e in L['entries'] if usable(e)] or L['entries']
    lead = None
    pick = unicodedata.normalize('NFC', pick or '')
    if pick:
        lead = next((e for e in ents if e['p'] == pick and (not pos or e['pos'] == pos)), None) \
            or next((e for e in L['entries'] if pos and e['p'] == pick and e['pos'] == pos), None) \
            or next((e for e in ents if e['p'] == pick), None) \
            or next((e for e in L['entries'] if e['p'] == pick), None)
    if not lead and pos:
        cands = [e for e in ents if e['pos'] == pos] \
            or [e for e in L['entries'] if e['pos'] == pos]   # a festival's sense is tagged Judaism
        lead = max(cands, key=lambda e: score(e, L)) if cands else None
    if not lead and L['word'] in PICK:
        pp, _, ppos = PICK[L['word']].partition(':')
        lead = next((e for e in ents if e['p'] == pp and (not ppos or e['pos'] == ppos)), None)
    if not lead:
        best = max(score(e, L) for e in ents)
        lead = next(e for e in ents if score(e, L) == best)
    # the same pointed word, of the same origin: `שָׁלוֹם` "peace" and "hello" are one word; `כִּי`
    # "because" and `כִּי` "vulture" are two that happen to be spelt and said alike
    p = lead['p']
    group = [lead] + [e for e in ents if e is not lead and p and e['p'] == p and e['etym'] == lead['etym']]
    return group
