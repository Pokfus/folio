#!/usr/bin/env python3
"""The phrases deck's word list: every set expression, in one pass over the dump.

This stage stands in for FOUR of the ordinary pipeline's -- parse_referencial,
supplement, extract_kaikki and select -- and the reason is that none of what
they do applies here.  Those three read an inventory of WORDS and then choose a
few hundred of them under a cascade written to stop the closed classes competing
with nouns on raw frequency.  A phrases deck has no inventory to read (the
Referencial names a set expression only where one happens to be the natural way
to say a notion) and nothing to choose from: the pool IS the deck.  So the whole
of the work is deciding what counts as a set expression, and that is what this
file is about.

WHAT COUNTS.  A multi-word Portuguese entry qualifies when Wiktionary either
files it under a part of speech that only a phrase can have -- `phrase`,
`proverb`, `prep_phrase`, `intj` -- or tags one of its senses `idiomatic`.  Two
tests rather than one, because each misses what the other catches: `de vez em
quando` is an ADVERB and `pão e circo` a NOUN, so a POS test alone loses both,
while `não sei` and `com certeza` are filed as phrases and carry no idiomatic
tag, so the tag alone loses those.  Together they take 1,735 entries.

AND WHAT THE PAIR OF THEM KEEPS OUT IS THE POINT: an ordinary multi-word
compound.  `cartão de crédito`, `conta bancária`, `banda desenhada` and `fim de
semana` are all in the dump, all multi-word, and none of them is in this deck --
they are nouns that happen to be spelled with a space, and a card teaching `fim
de semana` teaches a reader nothing they could not get from `fim` and `semana`.
An expression is precisely an entry whose meaning is not the sum of its words,
which is what `idiomatic` and the phrase parts of speech between them assert.

THE ORDER IS THE CORPUS COUNT, and it has to be, because the frequency list that
orders every other deck here CANNOT SEE A PHRASE AT ALL: hermitdave's lists are
segmented, so `de vez em quando` appears in them as four separate ordinary words
and its own rank is simply absent.  `select.py` solves that for the handful of
phrases in a word deck by counting them in Tatoeba and calibrating the count
onto the subtitle list's scale through the single words that carry both; here
every entry is a phrase, there are no single words to calibrate against, and
calibration would in any case be a monotone function of the count and change
nothing.  So the count is used directly.

COUNTED ON WORD BOUNDARIES, NEVER AS A SUBSTRING -- the pipeline's own recorded
`poder com` / `poder comprar` fault, and it is worth more here than there
because a short phrase is common: `a par` matched 7,847 times as a substring, of
which essentially all are `a parte` and `a partir`.  On boundaries it is 21.

MOST OF THEM ARE NOT IN THE CORPUS AT ALL, and that is the subject rather than a
gap: 715 of the 1,342 have no Tatoeba occurrence, because an idiom is literary
and a sentence-pair corpus is conversational.  The Mandarin deck records exactly
the same of its chengyu -- 361 of 5,227 appear even once.  It is stated in the
deck's own description rather than repaired, and it is why the deck is NOT
truncated to the phrases the corpus can rank: doing that would let the corpus
choose the syllabus, which is the DELE pipeline's own finding and the reason
`select.py` no longer swaps out a word Tatoeba cannot illustrate.

Writes, for the stages that follow:

    wikt-phr.json      the records, exactly as extract_kaikki would have
    wordlist-phr.json  the phrases, ordered
    family-phr.json    phrase -> `expression` or `proverb`, for the subdecks
"""
import json
import re
from collections import Counter

from caple_level import SUBS, f as lvlf, headwords_below

DUMP = 'kaikki-pt.jsonl'
CORPUS = 'por_sentences_detailed.tsv'

# A part of speech only a phrase can have.  `intj` is in it because Wiktionary
# files the greetings and the exclamations there -- `com licença`, `ora bolas` --
# and a one-word interjection cannot reach this stage anyway, every candidate
# having a space in it by the time the test runs.
PHRASE_POS = {'phrase', 'proverb', 'prep_phrase', 'intj'}

# WHICH SUBDECK.  Wiktionary gives a proverb a part of speech of its own, so the
# split is read off the record rather than guessed from the shape of the words.
# An entry filed BOTH ways goes to Proverbs: the saying is the larger claim.
PROVERB_POS = 'proverb'

# A sense nobody should be taught from, and the same list `select.py` keeps for
# the same reason -- except that `literary` is NOT in it here.  A word deck has
# no business teaching a literary form of an everyday word; a proverb collection
# is substantially literary by nature, and dropping the tag would take out a
# good part of what the deck is for.
BAD_TAGS = {'vulgar', 'slang', 'offensive', 'derogatory', 'archaic', 'obsolete',
            'dated', 'historical', 'rare', 'obscure'}

# ---------------------------------------------------------------- variety
# THE BRAZIL FILTER IS AN ENTRY-LEVEL ONE HERE, where in the word decks it is a
# SENSE-level demotion -- and the difference follows from what is being taught.
# A word usually means the same thing on both sides of the Atlantic and differs
# in one sense, so the sense is demoted and the word ships.  An expression is a
# whole idiom: where every reading Wiktionary gives it is marked Brazil, the
# expression is not said in Portugal at all and there is nothing left to teach.
#
# 178 of the 1,735 go that way, and 15 more by hand below.  It is much the
# largest filter here, which is what a corpus of idioms should look like: set
# expressions are the most regionally divided part of a language, far more so
# than its nouns.
def all_brazil(recs):
    seen = False
    for r in recs:
        for s in r.get('senses', []):
            if not s.get('glosses') or BAD_TAGS & set(s.get('tags', [])):
                continue
            seen = True
            if 'Brazil' not in s.get('tags', []):
                return False
    return seen


# An expression whose WORDS are Brazilian, which the tag cannot see because the
# entry itself is filed as Portuguese generally.  Each names the European word
# the deck teaches instead, in the shape `select.py`'s own table uses, and none
# was recalled: the first two came from sweeping the pool for the shibboleths
# `caple_level` already lists, and the thirteen after them from the ratio sweep
# further down, which is that sweep widened to the whole frequency list after
# the narrow one proved to be why they were missed.
BRAZILIAN = {
    # THE HEADER OF `caple_level` NAMES THIS EXACT WORD: in Portugal a
    # `banheiro` is a LIFEGUARD, and the room is `a casa de banho`.  So the
    # phrase does not merely sound foreign in Lisbon, it asks a stranger to
    # point out a man on a beach.
    'onde fica o banheiro': 'onde é a casa de banho',
    # `grana` is Brazilian slang for money; Portugal's is `massa`, and the
    # thing this phrase means is said here as `custar os olhos da cara` --
    # which is in the deck, under `custar o olho da cara`.
    'grana preta': 'massa',

    # ---- found by the ratio sweep below, which the first hand sweep could not
    # do: it used the seven shibboleth PAIRS `run.py` checks the corpora with,
    # and every one of these turns on a word that is not among them.  Each is a
    # phrase whose entry Wiktionary files as Portuguese generally, so no tag can
    # see it; each was read, and each names Portugal's counterpart.
    #
    # THE EUROPEAN COUNTERPART IS USUALLY NOT IN THE DUMP, so most of these are
    # `varal`'s case rather than `xícara`'s: the drop loses the concept instead
    # of swapping the words, and is deliberately not repaired by writing the
    # European phrase in, which would be this file composing entries instead of
    # reading them.  Where the counterpart IS already a card here the drop costs
    # nothing at all, and those say so.
    #
    # A LAWN IS `relva` IN PORTUGAL and `grama` is a gram -- which is why
    # `grama` is not one of `check-caple`'s Brazilian markers and why the first
    # sweep was blind to this.  Measured over the two corpora: relva 2,705
    # European against 632 Brazilian, grama 776 against 7,403, and relvado
    # 749 against 0 where gramado is 0 against 2,089.
    'a grama do vizinho é sempre mais verde': 'a relva do vizinho é sempre mais verde',
    # THE ONE WHOSE COUNTERPART IS ALREADY IN THE DECK, and therefore the one
    # that was a plain duplicate: `ora bolas` and `oras bolas` are one entry
    # apiece in the dump under the same two glosses, and both shipped.  `oras`
    # has ZERO European hits against 473 Brazilian.
    'oras bolas': 'ora bolas',
    'oras bolas caçarolas': 'ora bolas',
    # The rest all turn on a word with ZERO European hits in a 50k list, which
    # is as strong as this measurement gets: a word common in Brazil and absent
    # from a European corpus of the same size is a variety marker and not a
    # rarity.  `sumiço` 1,109, `pingando` 688, `mané` 1,529, `eita` 744,
    # `cê` 1,552, `capim` 465, `cômico` 698.
    'tomar chá de sumiço': 'desaparecer',
    'alagado pingando': 'encharcado',
    'que mané': 'qual quê',
    'eita, piula': 'ora bolas',
    'cê é louco': 'tu és doido',
    'comer capim pela raiz': 'comer erva pela raiz',
    # A SPELLING RATHER THAN A WORD, and Wiktionary says so itself: its `cómico`
    # entry glosses it "European Portuguese standard spelling of cômico".  The
    # proverb exists only under the Brazilian spelling, and respelling somebody
    # else's headword is not this file's to do.
    'seria cômico se não fosse trágico': 'seria cómico se não fosse trágico',
    # `fumaça` 642 European against 10,742 Brazilian; Portugal's word is `fumo`,
    # and `não há fumo sem fogo` is nowhere in the dump.
    'não há fumaça sem fogo': 'não há fumo sem fogo',
    'e lá vai fumaça': 'e lá vai fumo',
    # `paletó` 105 against 2,034.  The Portuguese idiom is `ir desta para
    # melhor`, which the deck already teaches.
    'vestir o paletó de madeira': 'ir desta para melhor',
}

# BRAZILIAN CLITIC PLACEMENT, which is a fact about the word order rather than
# about the words.  European Portuguese puts an unstressed pronoun AFTER its
# verb -- `amo-te` -- and Brazil puts it in front, so an entry spelled `eu te
# amo` is not the way the sentence is said in Portugal at all.  Anchored to a
# SUBJECT PRONOUN at the start, which is the only position where the reading is
# unambiguous: `se`, `o`, `a` and `nos` are also a conjunction, two articles and
# a preposition, and mid-phrase proclisis is perfectly ordinary after a negative
# or a conjunction (`não se sabe`, `se não me engano`), both of which are real
# expressions this deck teaches.
#
# IT IS NOT A RULE ABOUT SENTENCES, which the first draft made it and which
# would have been wrong: the pool holds a dozen more subject-initial entries and
# they are either proverbs (`você é o que você come`, `você colhe o que
# planta`), idioms (`eu poderia comer um cavalo`) or exactly the phrasebook
# lines a deck of common phrases is for (`eu não falo português`, `eu tenho uma
# pergunta`).  A sentence can be a phrase; Brazilian word order cannot.
PROCLISIS_RX = re.compile(r'^(eu|tu|ele|ela|nós|vós|eles|elas|você|vocês)\s+'
                          r'(?:me|te|se|nos|vos|lhe|lhes)\s', re.I)


def qualifies(recs):
    """A multi-word entry that is a set expression rather than a compound."""
    for r in recs:
        if r.get('pos') in PHRASE_POS:
            return True
        for s in r.get('senses', []):
            if 'idiomatic' in s.get('tags', []):
                return True
    return False


# --------------------------------------------------------------- the sweep
raw = {}
n = bad = 0
for line in open(DUMP, encoding='utf-8'):
    n += 1
    try:
        r = json.loads(line)
    except Exception:
        bad += 1
        continue
    if r.get('lang_code') != 'pt':
        continue
    w = r.get('word') or ''
    # multi-word, and nothing carrying the dump's own punctuation furniture
    if ' ' not in w or re.search(r'[\[\]?/]', w):
        continue
    raw.setdefault(w, []).append(r)

raw = {k: v for k, v in raw.items() if qualifies(v)}

# A PROPER NAME IS NOT AN EXPRESSION, and where an entry has one BESIDE a real
# phrase record the name is noise that can win: `Feliz Natal` is "Merry
# Christmas" and also a municipality in Mato Grosso, and which of the two the
# card would print comes down to the order the dump happens to list them in.
# Dropped where there is something else to say, KEPT where it is all there is --
# `Lugar Nenhum` is filed only as a name and is tagged idiomatic, and "the
# middle of nowhere" is exactly the kind of thing this deck is for.  Four
# entries, all four read.
for k, recs in raw.items():
    rest = [r for r in recs if r.get('pos') != 'name']
    if rest and len(rest) != len(recs):
        raw[k] = rest
print('  lines scanned :', n, '(unparseable:', bad, ')')
print('  multi-word set expressions in the dump:', len(raw))

TAUGHT = headwords_below()
drop = Counter()
pool = {}
for k, recs in raw.items():
    if k in TAUGHT:
        drop['already taught by a CAPLE level'] += 1
    elif k in BRAZILIAN:
        drop['Brazilian wording'] += 1
    elif all_brazil(recs):
        drop['every sense marked Brazil'] += 1
    elif PROCLISIS_RX.match(k):
        drop['Brazilian clitic placement'] += 1
    elif not any(s.get('glosses') and not (BAD_TAGS & set(s.get('tags', [])))
                 and not (s.get('form_of') or s.get('alt_of'))
                 for r in recs for s in r.get('senses', [])):
        drop['no showable meaning'] += 1
    else:
        pool[k] = recs

for reason, cnt in drop.most_common():
    print(f'  dropped, {reason}: {cnt}')
print(f'    ({len(BRAZILIAN)} named by hand)')
print('  pool:', len(pool))

# ------------------------------------------------------- the variety report
# REPORTED AUTOMATICALLY, DROPPED BY HAND -- `select.py`'s rule, and the reason
# is the same one it gives: a ratio measures how often Brazilians say a word,
# which is not the same question as whether the word is Brazilian.  Run as an
# automatic drop over this pool at 8x it takes `custar o olho da cara`, which is
# ordinary European Portuguese, because `cara` is simply a common word (62,852
# European hits).  So it prints and a person decides.
#
# THE ZERO-HIT CASE IS THE ONE THAT CAN BE TRUSTED, and it is the line the hand
# table above was drawn at: a word common in Brazil and wholly absent from a
# European list of the same size is a variety marker rather than a rarity.  Of
# the 78 phrases still flagged at 8x none is one of those.
#
# WHAT IS LEFT IS DELIBERATELY LEFT, and two of them are why.  `em suma` is
# flagged because `suma` happens to be a token, and it is ordinary European
# Portuguese for "in short".  `grão a grão enche a galinha o papo` is flagged on
# `papo` and is a proverb of Portugal's own.  A second tier bounded by a low
# absolute European count (22 phrases under 1,200 hits) does hold real
# Brazilianisms -- `tô ligado`, four on `botar`, `chutar o balde` -- and it holds
# those two as well, so taking it wholesale would cost the deck a Portuguese
# proverb to remove a Brazilian one.  Read the report, do not automate it.
#
# THE FIRST HAND SWEEP USED THE SEVEN SHIBBOLETH PAIRS `run.py` CHECKS WITH, and
# every leak it missed turned on a word outside that list -- which is what this
# replaces: the pool is swept against the whole frequency list instead, so a
# Brazilian phrase can only get through by being commonly said in Portugal too.
# Anything printed here that is not in BRAZILIAN above has been read and kept.
def variety_report(keys):
    def load(p):
        d = {}
        for i, line in enumerate(open(p, encoding='utf-8')):
            t = line.split()
            if len(t) == 2:
                d.setdefault(t[0], int(t[1]))
        return d
    try:
        eu, br = load('pt_50k.txt'), load('ptbr_50k.txt')
    except OSError:
        print('  variety sweep: frequency lists missing, skipped')
        return
    tok = re.compile(r'[a-zà-öø-ÿ]+', re.I)
    flagged = []
    for k in keys:
        worst = None
        for t in set(tok.findall(k.lower())):
            c1, c2 = eu.get(t, 0), br.get(t, 0)
            # Too rare in Brazil to be evidence of anything either way.
            if c2 < 400:
                continue
            ratio = 999.0 if not c1 else c2 / c1
            if ratio >= 8 and (worst is None or ratio > worst[0]):
                worst = (ratio, t, c1, c2)
        if worst:
            flagged.append((worst[0], worst[1], worst[2], worst[3], k))
    flagged.sort(reverse=True)
    zero = [f for f in flagged if f[2] == 0]
    print(f'  variety sweep: {len(flagged)} shipped phrases carry a word said '
          f'>=8x more often in Brazil, {len(zero)} of them a word with NO '
          f'European hits at all')
    for ratio, t, c1, c2, k in flagged[:12]:
        r = 'inf' if c1 == 0 else f'{ratio:.0f}x'
        print(f'    {r:>5}  {t:<12} EU {c1:>6} BR {c2:>6}   {k}')
    if len(flagged) > 12:
        print(f'    ... and {len(flagged) - 12} more')

# ------------------------------------------------------------ the subdecks
family = {k: (PROVERB_POS if any(r.get('pos') == PROVERB_POS for r in recs)
              else 'expression')
          for k, recs in pool.items()}
print('  ', dict(Counter(family.values())))

# -------------------------------------------------------------- the order
# ON WORD BOUNDARIES.  Only a token that STARTS some phrase is worth looking
# past, so the inner loop costs nothing on the overwhelming majority of words.
tok = re.compile(r"[a-zà-öø-ÿ]+", re.I)
pset = set(pool)
starts = {p.split()[0] for p in pset}
maxn = max(len(p.split()) for p in pset)
hits = Counter()
for line in open(CORPUS, encoding='utf-8'):
    p = line.rstrip('\n').split('\t')
    if len(p) < 3:
        continue
    ws = tok.findall(p[2].lower())
    for i, x in enumerate(ws):
        if x in starts:
            for m in range(2, maxn + 1):
                if i + m > len(ws):
                    break
                j = ' '.join(ws[i:i + m])
                if j in pset:
                    hits[j] += 1

# Expressions first and proverbs after, each block by corpus count, then
# alphabetically so the 715 the corpus never sees have an order at all rather
# than whichever one a dict iteration happens to give.
order = list(SUBS)
final = sorted(pool, key=lambda k: (order.index(family[k]), -hits[k], k))

seen = sum(1 for k in final if hits[k])
print(f'  in the sentence corpus: {seen} of {len(final)} '
      f'({len(final) - seen} appear nowhere in it)')
print('  first twelve:', ', '.join(final[:12]))
variety_report(final)

json.dump(pool, open(lvlf('wikt.json'), 'w'), ensure_ascii=False)
json.dump(final, open(lvlf('wordlist.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(family, open(lvlf('family.json'), 'w'), ensure_ascii=False, indent=0)

# THE FIGURES THE DECK'S OWN DESCRIPTION QUOTES, written down rather than typed
# into it.  How many the CAPLE levels already teach, how many are dropped as
# Brazilian and how many the corpus has never seen are all measured HERE and
# stated THERE, and a description carrying its own copy of a number is a
# description that goes quietly out of date the first time the dump is
# refreshed.  `noCorpus` is NOT the same as the count of cards with no example
# -- a phrase can be in the corpus and still lose every sentence it appears in
# to the Brazilian filter or to a missing English pair, which is 186 of them --
# so the two are kept apart and the description uses each for its own claim.
json.dump({'taught': drop['already taught by a CAPLE level'],
           'brazil': drop['every sense marked Brazil'],
           # The hand table is counted APART from the tag filter above it, and
           # the description says each in its own sentence: one is what the
           # dictionary marks and the other is what it does not.
           'hand': drop['Brazilian wording'],
           'noCorpus': len(final) - seen},
          open(lvlf('stats.json'), 'w'), ensure_ascii=False)
