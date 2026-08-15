#!/usr/bin/env python3
"""Choose the common Spanish phrases and fixed expressions, and rank them by use.

This is the word-choosing stage for the phrases deck, standing where
`parse_pcic.py` + `supplement.py` + `select.py` stand for a DELE level.  It
writes the same three files those do, so `examples.py`, `build_deck.py` and
`emit.py` run over it unchanged and the phrases deck comes out carrying the same
card type as the six levels -- which `combine.py` asserts is byte-identical
before it will put them in one file.

WHERE THE PHRASES COME FROM, and why there is no list to read.  The six levels
take their vocabulary from the Instituto Cervantes' inventories, which name
notions; there is no equivalent published list of the expressions a learner
should know, and inventing one would be asserting a syllabus rather than
reporting one.  So the candidates are WIKTIONARY'S OWN multi-word entries.  That
is a real editorial judgement made by somebody else and it is exactly the one
wanted: a dictionary gives a multi-word string an entry only when it is
lexicalised -- when its meaning is not the sum of its parts, or it is fixed
enough to be looked up -- so `echar de menos` and `a lo mejor` have entries and
`comer pan` does not.  The pool IS the set of Spanish expressions a dictionary
thinks are expressions.

AND `COMMON' IS MEASURED, NOT ASSERTED.  A dictionary records an expression
whether it is said every day or twice a century, and the tail is enormous.  So
every candidate is COUNTED in the Tatoeba sentence corpus this pipeline already
downloads, and the deck is the top of that count.  A phrase nothing in the
corpus says is not shipped at all, whatever its entry looks like -- which is the
opposite of the rule the levels follow, and deliberately so: there the word list
is set by the exam board and the corpus does not get a vote, and here the corpus
IS the word list, because "common" is the whole of what this deck claims.

SIX THINGS IT HAS TO GET RIGHT, and the first two were found by LOOKING AT THE
LIST rather than by any count -- the first cut of this stage produced 400
well-formed cards, every one attested hundreds of times, and its top of the list
read `lo que`, `por qué`, `de que`, `un poco`, `de una`, `más que`, `el que`.

A DICTIONARY GIVES AN ENTRY TO SOME THINGS IT SAYS ARE NOT EXPRESSIONS, and it
says so in the gloss.  Wiktionary's marker for a string whose meaning IS the sum
of its parts is `Used other than figuratively or idiomatically: see ...`, and an
entry carrying nothing else is one the dictionary has explicitly declined to
call an idiom -- `es que`, `para mí`, `a ti`, `lo mismo`.  That is the source's
own judgement and it is exactly the one wanted, so it is read rather than
second-guessed.  It also removes most of a second fault at the same time: those
entries have no meaning to put on a card, and `build_deck` refuses the deck
outright rather than shipping a blank one.

A PHRASE MADE ENTIRELY OF FUNCTION WORDS IS GRAMMAR, NOT VOCABULARY.  `lo que`,
`de que`, `más que`, `el que`, `para que`, `hasta que` and `como si` are the
commonest word pairs in the language and belong in a grammar, not on a
flashcard; a corpus count cannot tell them from an expression, because they are
frequent for the same reason `the` is.  So a candidate must carry at least one
word that is not an article, preposition, conjunction, pronoun, interrogative or
quantifier.  The cost is real and is worth stating: `por qué`, `muy bien` and
`todo el mundo` go with them, being function words that happen to have
lexicalised.  Losing three good expressions out of a pool of two thousand is the
right side of the trade, and the alternative -- a hand-kept list of exceptions --
is a syllabus again.

AND THE PART OF SPEECH NARROWS IT FURTHER.  Wiktionary's `phrase`, `proverb`,
`prep_phrase` and `intj` ARE its expression classes, and a multi-word `verb` or
`adv` is one too (`echar de menos`, `a lo mejor`).  A multi-word `noun`, `adj`,
`pron`, `conj` or `det` is usually a compound or a grammatical unit -- and where
it is not, the sense the entry leads with is often the one a card must not show:
`la vida` is glossed "the game (prostitution)" and `primera vez` "first instance
of sexual intercourse".

THE OTHER THREE.

A PHRASE IS COUNTED AS A RUN OF WHOLE TOKENS.  Matching on the raw string
over-counts every phrase that is also the opening of a longer one and
under-counts nothing, which is the wrong way round; tokenising first at least
stops `de mas` matching inside `de masiado`.  It is still a running-text match,
so `con todo` catches `con todo el mundo` -- stated here rather than repaired,
as it is in `select.py`, because a count that is 20% high is a fine ranking key
and a bad statistic and is only ever used as the former.

A PHRASE ALREADY TAUGHT AS A WORD IS NOT A NEW PHRASE.  The six levels teach
their own multi-word items -- B2 is built partly on connectives like `por
consiguiente` and `en la medida en que` -- so every one of them is excluded,
read out of the SHIPPED deck files by `words_below`, exactly as a level excludes
the levels below it.  Without that the combined deck teaches `a lo mejor` twice
under two different subdecks, which is the one thing its own description
promises it does not do.

A REFLEXIVE PHRASE IS NOT A PHRASE.  `irse de` and friends are the pronominal
verb the levels already teach with a preposition hung off it, so an entry whose
first word is one of them adds nothing.

AND A PROPER NAME IS NOT AN EXPRESSION.  Wiktionary's multi-word Spanish entries
include place names, book titles and taxonomic binomials, none of which is
vocabulary in the sense this deck means.

Not part of the site.
"""
import json, os, re, sys
from collections import Counter
from dele_level import TARGET, f as lvlf, words_below

MIN_COUNT = 3          # a phrase the corpus never says is not a common phrase
MAX_WORDS = 5          # beyond this it is a sentence, not an expression

# Wiktionary's expression classes, plus the two open classes whose multi-word
# entries are expressions (`echar de menos` is a verb, `a lo mejor` an adverb).
# `name` is deliberately absent -- a proper name is not an expression -- and so
# are `noun`, `adj`, `pron`, `conj` and `det`; see the head of this file.
GOOD_POS = {'phrase', 'proverb', 'prep_phrase', 'verb', 'adv', 'intj'}

# Wiktionary's own marker for a string that is NOT an idiom
SOP = 'used other than figuratively'

# A candidate has to carry one word that is not one of these.  It is the closed
# classes and the quantifiers -- what a grammar teaches -- and deliberately not
# a stop list tuned by looking at the output.
FUNCTION = set("""
el la los las un una unos unas lo al del
a ante bajo cabe con contra de desde en entre hacia hasta para por según sin so
sobre tras durante mediante
y e o u ni que pero sino si como cuando donde mientras aunque pues porque
yo tú tu vos él ella usted nosotros nosotras vosotros vosotras ellos ellas
ustedes me te se nos os le les mi mis tus su sus mí ti sí consigo conmigo
contigo este esta esto estos estas ese esa eso esos esas aquel aquella aquello
aquellos aquellas cual cuales quien quienes cuyo cuya
qué quién quiénes cuál cuáles cuándo dónde cómo cuánto cuánta cuántos cuántas
muy más menos tan tanto tanta tantos tantas todo toda todos todas algo alguien
nadie nada ningún ninguno ninguna algún alguno alguna cada otro otra otros otras
mismo misma mismos mismas ya no sí también tampoco aquí ahí allí acá allá
ahora entonces siempre nunca jamás bien mal solo sólo casi
""".split())

# a sense wearing one of these is the wrong thing to teach
BAD_TAGS = {'form-of', 'alt-of', 'obsolete', 'archaic', 'dated', 'historical',
            'vulgar', 'offensive', 'derogatory', 'slang', 'rare', 'uncommon',
            'poetic', 'literary', 'dialectal', 'obscure', 'nonstandard'}

# the pronouns a pronominal verb carries; an entry opening on one is that verb
REFL_START = {'me', 'te', 'se', 'nos', 'os'}

TOKEN = re.compile(r"[a-záéíóúüñ]+", re.I)
WORDY = re.compile(r'^[a-záéíóúüñ]+(?: [a-záéíóúüñ]+)+$', re.I)


def showable(rec):
    """A record with at least one sense that can go on a card.

    A sum-of-parts sense does not count: it is Wiktionary saying the string
    means what its words mean, so there is nothing to teach and nothing to put
    on the back of the card.
    """
    for s in rec.get('senses', []):
        if s.get('form_of') or s.get('alt_of'):
            continue
        if BAD_TAGS & set(s.get('tags', [])):
            continue
        g = (s.get('glosses') or [''])[0].strip()
        if g and SOP not in g.lower():
            return True
    return False


def has_content_word(phrase):
    return any(w not in FUNCTION for w in phrase.split())


def main():
    taught = words_below()
    print('already taught by the six levels:', len(taught))

    # ------------------------------------------------- the candidates
    cand = {}
    kept = 0
    for line in open('kaikki-es.jsonl', encoding='utf-8'):
        try:
            r = json.loads(line)
        except ValueError:
            continue
        w = (r.get('word') or '').strip()
        if ' ' not in w or not WORDY.match(w):
            continue
        if len(w.split()) > MAX_WORDS:
            continue
        if r.get('pos') not in GOOD_POS or not showable(r):
            continue
        k = w.lower()
        if k in taught or k.split()[0] in REFL_START or not has_content_word(k):
            continue
        cand.setdefault(k, []).append(r)
        kept += 1
    print('multi-word entries kept:', kept, 'distinct phrases:', len(cand))

    # ------------------------------------------------- how common each one is
    starts = {p.split()[0] for p in cand}
    maxn = max(len(p.split()) for p in cand)
    count = Counter()
    for line in open('spa_sent.tsv', encoding='utf-8'):
        p = line.rstrip('\n').split('\t')
        if len(p) < 3:
            continue
        ws = TOKEN.findall(p[2].lower())
        for i, x in enumerate(ws):
            if x in starts:        # most tokens open no phrase and cost nothing
                for n in range(2, maxn + 1):
                    if i + n > len(ws):
                        break
                    g = ' '.join(ws[i:i + n])
                    if g in cand:
                        count[g] += 1
    attested = [p for p in cand if count[p] >= MIN_COUNT]
    print(f'attested at least {MIN_COUNT} times in the corpus:', len(attested))

    ranked = sorted(attested, key=lambda p: (-count[p], p))
    want = TARGET['ph']
    if len(ranked) < want:
        raise SystemExit(f'the phrase pool yields only {len(ranked)} and the deck '
                         f'wants {want}. Lower TARGET["ph"] or MIN_COUNT -- do '
                         f'not ship a short deck.')
    final = ranked[:want]

    print('top of the list:', ', '.join(f'{p} ({count[p]})' for p in final[:12]))
    print('bottom of it   :', ', '.join(f'{p} ({count[p]})' for p in final[-8:]))

    json.dump(final, open(lvlf('wordlist.json'), 'w'), ensure_ascii=False, indent=0)
    json.dump(ranked, open(lvlf('ranked.json'), 'w'), ensure_ascii=False, indent=0)
    json.dump({p: cand[p] for p in final}, open(lvlf('wikt.json'), 'w'),
              ensure_ascii=False)
    # a phrase has no base verb to take a paradigm from, so the file the later
    # stages read for one is written empty rather than left absent
    json.dump({}, open(lvlf('wikt_bases.json'), 'w'))
    json.dump({p: count[p] for p in final}, open(lvlf('phrase_counts.json'), 'w'),
              ensure_ascii=False)


if __name__ == '__main__':
    main()
