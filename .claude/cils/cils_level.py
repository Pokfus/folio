#!/usr/bin/env python3
"""Which level is being built, where its intermediates go, and what its word list IS.

The stages share one cache directory: the downloaded corpora sit at the root
under their own names, and everything a stage computes is suffixed with the
level, so one level can be built after another without either overwriting the
other's working files.  `dele_level` and `goethe_level` are the same idea; the
three are deliberately separate files, because the Italian settings are Italian.

WHAT THIS LIST IS, AND WHAT IT IS NOT.  This matters more here than on either of
the other two exam decks, and it is written down at the top of the pipeline
rather than left in a commit message, because everything downstream inherits it.

The Goethe-Institut publishes a Wortliste for its A1 exam and the Instituto
Cervantes publishes the Plan curricular inventories, so those two decks can say
"this is the exam board's own vocabulary" and mean it.  **CILS PUBLISHES NO WORD
LIST.**  What the Università per Stranieri di Siena publishes for each level is a
syllabus of STRUCTURES AND FUNCTIONS -- the tenses, the sentence types, the
speech acts -- and for the lexicon it says only that a candidate needs "un
repertorio lessicale di base" for everyday situations.  Measured against that
document there is nothing to read a word list off.

So the list here is a THIRD PARTY'S, and it is named as one everywhere it is
shown to a reader.  It is MindDory's A1 Italian band
(minddory.com/italian-vocabulary-list/a1), and three things about it were
measured before a card was built, because they decide how the deck has to be
worded and ordered:

  · **THE SIX BANDS ARE A FREQUENCY GRADIENT, NOT A CEFR SYLLABUS.**  Ranked
    against a subtitle frequency list, the median rank per band runs 1,679 /
    4,986 / 7,672 / 9,253 / 19,395 / 21,216 from A1 to C2 -- a clean gradient,
    and the six bands are strictly DISJOINT (every pairwise intersection is 0).
    That is what a frequency list cut into six looks like.

  · **THE FREQUENCY IS A WRITTEN REGISTER'S.**  The A1 band carries
    `amministrativo`, `amministrazione`, `adeguato`, `ipotesi`, `istituzione`,
    `valutazione`, `integrazione` and `internazionale`, and does not carry
    `pane`, `rosso`, `madre`, `mangiare`, `bere`, `cane` or `gatto`.  Of the
    seven weekdays it has one, of twelve colours two, of four common animals
    none.

  · **`buongiorno`, `buonasera`, `arrivederci`, `per favore`, `prego` and
    `scusi` are in NONE of the six bands at all** -- not A1, not C2, nowhere in
    7,208 words.  No vocabulary list built for teaching omits `buongiorno`.

  · **AND THE UPPER BANDS ARE PARTLY NOT ITALIAN.**  De Mauro's basic vocabulary
    covers 97% of A1, 92% of A2, 83% of B1, 71% of B2 and 24% of C1, which is
    what a frequency gradient looks like and is fine.  What C1 also shows -- the
    first band big enough for it to be visible -- is that a band cut out of a
    SUBTITLE corpus sweeps in whatever is frequent in subtitles: `metropolis`,
    `paranoid`, `faust`, `faber` and `graves` are a film, a song and three
    surnames, each with 260-470 subtitle hits and no Italian dictionary entry.
    It also carries the list's own misspellings (`colonello`, `milionare`) and
    accents it has dropped (`assurdita`, `elite`).  `parse_cils.RESPELL` repairs
    the spellings and `build_deck.REFUSED` turns the non-words away with a
    reason each; both are hand-read tables, and both are printed on every run.

None of that makes the list useless: it is 961 real Italian words, every one of
them worth knowing, and it is what was asked for.  It makes it a list that must
be NAMED rather than attributed to an exam board, and ORDERED, which is what
`select.py` does -- the cards are dealt by how common the word is in everyday
spoken Italian, so `essere`, `fare`, `casa` and `acqua` come first and
`amministrativo` comes near the end.  The deck's own description says all of
this to the reader in plain words.  See the note on NVDB below for the
cross-check that is reported on every run.
"""
import json, os, re

LEVEL = os.environ.get('CILS_LEVEL', 'a1').lower()

# the six MindDory bands, as distinct from the derived `core` level below
BANDS = ('a1', 'a2', 'b1', 'b2', 'c1', 'c2')

TITLES = {'a1': 'CILS A1 — Italian', 'a2': 'CILS A2 — Italian',
          'b1': 'CILS B1 — Italian', 'b2': 'CILS B2 — Italian',
          'c1': 'CILS C1 — Italian', 'c2': 'CILS C2 — Italian',
          'core': 'Italian core vocabulary — De Mauro',
          'phrases': 'Italian phrases and expressions'}
DECK_IDS = {'a1': 'cilsa1', 'a2': 'cilsa2', 'b1': 'cilsb1',
            'b2': 'cilsb2', 'c1': 'cilsc1', 'c2': 'cilsc2', 'core': 'itcore',
            'phrases': 'itphrase'}
DECK_FILES = {lvl: f'CILS-{lvl.upper()}-Italian.folio-deck.json' for lvl in BANDS}
# NEITHER of these is a CILS band and neither is named as one -- see the notes below
DECK_FILES['core'] = 'Italian-Core-Vocabulary.folio-deck.json'
DECK_FILES['phrases'] = 'Italian-Phrases-Expressions.folio-deck.json'

# The page each level's words are read off.  A further level is a row here plus
# a `BELOW` entry, exactly as the four DELE levels and the three Goethe ones are
# -- there is nothing else to change.  `core` has no page: its words are DERIVED,
# which is the whole point of it.
LIST_URL = {lvl: f'https://minddory.com/italian-vocabulary-list/{lvl}' for lvl in BANDS}

# The count the page's own title states, which `parse_cils.py` asserts what it
# extracted against.  A page that quietly changes under us is the one failure a
# scrape cannot otherwise see: the words would still be words and the deck would
# still build.
EXPECT = {'a1': 961, 'a2': 995, 'b1': 970, 'b2': 1011, 'c1': 2842, 'c2': 429}

# MEASURED, NOT ASSUMED: the six bands share no word at all, so a higher level
# cannot re-teach a lower one and this table has nothing to do.  It is written
# anyway, and `words_below` with it, because the exclusion is what the two
# sibling pipelines rely on and a later list that DOES overlap would otherwise
# be found by a reader rather than by the build.
BELOW = {'a1': [], 'a2': ['a1'], 'b1': ['a1', 'a2'], 'b2': ['a1', 'a2', 'b1'],
         'c1': ['a1', 'a2', 'b1', 'b2'], 'c2': ['a1', 'a2', 'b1', 'b2', 'c1'],
         # …and `core` sits on top of all six, which is what it is FOR
         'core': list(BANDS),
         # `phrases` sits on top of everything: the six bands carry 67 multiword
         # entries between them (`prima di`, `in grado di`, `per sempre`) and
         # this must not teach one of them a second time.
         'phrases': list(BANDS) + ['core']}

# **THE `core` LEVEL, AND WHY IT EXISTS.**  Measured across the finished six:
# De Mauro's basic vocabulary covers 97% of A1 and 8% of C2, and the obvious
# reading -- that A1 to B2 use the core up and leave the upper bands nothing --
# is FALSE.  When C1 begins, 3,799 core words are still untouched, more than
# C1's own size; the list simply never goes and gets them.  The two sets are
# almost exactly the same size (7,171 against 7,180) and overlap by 57%.
#
# What the list misses is De Mauro's *alta disponibilità* stratum: concrete
# everyday vocabulary everyone knows and nobody says on screen -- `astuccio`,
# `aratro`, `cartolina`, `farfalla`, `salvietta`, `capanna`, `scalpello`,
# `borsetta`.  One in five of the words it misses appears ZERO times in 50,000
# subtitle words, against one in fifty of the ones it carries.  What it spends
# those slots on instead is screen vocabulary -- `obitorio`, `narcotico`,
# `guardiamarina`, `carburatore` -- at a median subtitle rank of 20,425.
#
# Two explanations were tested and dropped rather than asserted: DERIVATION
# (that the upper bands are `-ità`/`-zione`/`-mente` forms of core words)
# accounts for 6-16%, and LEMMATISATION (that feminines and participles like
# `subdola` are core words in disguise) for twelve words in the whole corpus.
#
# So this level is the remainder: every word in De Mauro that the six bands
# never reach, built by the same pipeline and ordered the same way.  Its word
# list is not a third party's at all -- it is a published reference work, which
# makes it the best-sourced of the seven.
NVDB_FILE = 'nvdb.words.txt'

# **THE `phrases` LEVEL.**  The eighth deck and the only one whose word list
# nobody published: no exam board and no reference work sets out "the common
# Italian expressions", so it is DERIVED -- see `build_phrase_list.py`, which is
# where the content decision lives and is documented.  What it is FOR is the one
# layer all eight of the others structurally cannot carry: every one of them is
# built from a list of SINGLE WORDS, so between them the seven shipped decks hold
# 67 multiword entries and the core deck none at all.
#
# `PHRASE_MIN` is how many of the Tatoeba corpus's 981,765 sentences a phrase
# must appear in to count as common.  At 2 the deck is ~1,400 expressions and the
# tail is still `alla fin fine`, `che palle`, `dopo di te`; at 1 it is ~1,850 and
# admits phrases with a single attestation, which is not evidence of anything.
# Below that the corpus has never seen it, which also means the card would carry
# no example sentence.
PHRASE_FILE = 'phrases.words.txt'
PHRASE_MIN = 2


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


def words_below():
    """Every word already taught by a lower level, read from its shipped deck.

    Taken from the deck FILE rather than from a working file, so the exclusion
    is against what actually went out and the two can never drift apart -- the
    rule `goethe_level` records.

    **THE HEADWORD FIELD CARRIES THE ARTICLE ON A NOUN (`la casa`), AND THIS
    STRIPPED IT IN ITS DOCSTRING AND NOT IN ITS CODE.**  So the set came back
    full of `il diavolo` while `select` tests a bare `diavolo` against it, and
    the exclusion has matched nothing since the day it was written.  Nothing
    reported it, because the six MindDory bands are strictly disjoint and the
    correct answer really was "nothing to drop" every time: a rule that never
    fires looks exactly like a rule with nothing to do.  It matters the moment a
    level is built on top of the others rather than beside them.

    The article is required to be followed by a SPACE, or by the apostrophe it
    elides on -- without that, `^i` eats the `i` of `in` and leaves `n`.

    **AND `select` MUST ASK THIS TWICE, BEFORE AND AFTER THE SPELLING SETTLES.**
    Testing only the word as the LIST PRINTS IT is right for a word that arrives
    spelt correctly and useless for one this pipeline has REPAIRED: C1 prints
    `risolver`, no band carries that, so it passes -- and the truncated-infinitive
    rule then adopts `risolvere`, which A1 has taught since it was built.  The
    accent rule does the same for `dignita` -> `dignità`.  Fifteen words shipped
    twice that way, each as two cards with one front, one meaning and two
    schedules.  Nothing in a single band can see it, the six being disjoint; only
    the combined deck holds two bands at once, and `check-combined.js` is what
    found it.

    **AND THE ARTICLE IS ONLY AN ARTICLE ON A NOUN.**  A noun's headword prints
    the article that carries its gender (`il credo`) and the word being taught is
    the bare noun; an expression that OPENS on an article (`lo stesso`, `l'altro
    ieri`, `il silenzio e d'oro`) is the article's as much as anything else's, and
    stripping it says the phrases deck teaches `stesso` -- which A1 does, as a
    determiner meaning "same".  Two different entries reported as one word taught
    twice.  Measured over all eight shipped decks before it was written: every
    article-prefixed headword in the seven vocabulary decks is a noun, and all 23
    of the non-nouns are in the phrases deck, so the POS separates them exactly.
    """
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join('..', '..', 'decks', DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        deck = json.load(open(p, encoding='utf-8'))
        for c in deck['cards']:
            f = c.get('fields') or {}
            w = f.get('Word', '')
            if w:
                m = _POS_RX.search(f.get('English', ''))
                out.add(strip_article(w, m.group(1) if m else ''))
    return out


_ART = re.compile(r"^(?:il|lo|la|i|gli|le)\s+|^l'", re.I)
_POS_RX = re.compile(r'uc-pos">([^<]*)<')
# ANCHORED, because `noun` is a substring of `pronoun` -- so a bare containment
# test files `il quale` as a noun, strips its article and reports it as A1's
# determiner `quale` taught twice.  The printed forms are `noun`, `noun,
# masculine`, `noun, masculine or feminine` and `proper noun`, so the prefix is
# what separates them.
_NOUN_RX = re.compile(r'(?:proper )?noun\b', re.I)


def strip_article(w, pos=None):
    """`la casa` -> `casa`, `l'amico` -> `amico`, `in` -> `in`.

    Only on a NOUN: `lo stesso` is an adverb whose article is part of it.  With
    no POS supplied the article is stripped, which is the old behaviour and the
    right default for a bare word off a list.
    """
    w = w.strip()
    if pos is not None and not _NOUN_RX.match(pos.strip()):
        return w.lower()
    return _ART.sub('', w, count=1).strip().lower()
