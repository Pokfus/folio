#!/usr/bin/env python3
"""Which level is being built, and where its intermediates go.

The stages share one cache directory: the downloaded corpora sit at the root
under their own names, and everything a stage computes is suffixed with the
level, so one level can be built after another without either overwriting the
other's working files.  The DELE pipeline's `dele_level` is the same idea; the
two are deliberately separate files, because the German settings are German.
"""
import json, os, re

LEVEL = os.environ.get('GOETHE_LEVEL', 'a1').lower()

TITLES = {'a1': 'Goethe A1 — German', 'a2': 'Goethe A2 — German',
          'b1': 'Goethe B1 — German', 'b2': 'German B2 — Vocabulary',
          'c1': 'German C1 — Vocabulary', 'c2': 'German C2 — Vocabulary',
          'phrases': 'German — Phrases & expressions'}
DECK_IDS = {'a1': 'goethea1', 'a2': 'goethea2', 'b1': 'goetheb1',
            'b2': 'germanb2', 'c1': 'germanc1', 'c2': 'germanc2',
            'phrases': 'germanphr'}
DECK_FILES = {'a1': 'Goethe-A1-German.folio-deck.json',
              'a2': 'Goethe-A2-German.folio-deck.json',
              'b1': 'Goethe-B1-German.folio-deck.json',
              'b2': 'German-B2-Vocabulary.folio-deck.json',
              'c1': 'German-C1-Vocabulary.folio-deck.json',
              'c2': 'German-C2-Vocabulary.folio-deck.json',
              'phrases': 'German-Phrases-Expressions.folio-deck.json'}

# THE SHORT LABEL EVERY CARD CARRIES.  It is the level's own name in the ordinary
# case -- `Goethe A1`, `German C2` -- and a level that is not a CEFR level needs
# its own, since `PHRASES` is not a level name and `German PHRASES` is not a
# label.  `build_deck` falls back to the rule where there is no row here.
CATEGORIES = {'phrases': 'German Phrases'}

# WHICH STAGE BUILDS A LEVEL'S WORD LIST.  A level with a published Wortliste
# reads it off the PDF; the three corpus levels select from a frequency list; the
# phrases deck selects from Wiktionary's own multiword entries.  Branching on a
# table rather than on a level's name is what has kept each of these additions to
# a row apiece.
WORDLIST = {'a1': 'pdf', 'a2': 'pdf', 'b1': 'pdf',
            'b2': 'corpus', 'c1': 'corpus', 'c2': 'corpus',
            'phrases': 'phrases'}

# THE EXAM EACH LEVEL IS FOR, in the exam board's own name for it -- read off the
# Wortliste's own title page rather than composed.  C1 and C2 have no entry
# because there is no Goethe word list at those levels to be for; see WORTLISTE
# below.  Membership of this table is what the rest of the pipeline branches on
# whenever the question is really "does this level have a published list?" --
# the deck's category, its description, how many senses a gloss shows -- so a
# level added later answers the rule rather than a list of level names.
EXAM = {'a1': 'Goethe-Zertifikat A1: Start Deutsch 1',
        'a2': 'Goethe-Zertifikat A2',
        'b1': 'Goethe-Zertifikat B1'}

# The Wortliste each level is read from, published by the Goethe-Institut.  A
# further level is a row apiece in these tables plus a `BELOW` entry, exactly as
# the four DELE levels are.
WORTLISTE = {
    'a1': ('goethe_a1.pdf',
           'https://www.goethe.de/pro/relaunch/prf/en/A1_SD1_Wortliste_02.pdf'),
    'a2': ('goethe_a2.pdf',
           'https://www.goethe.de/pro/relaunch/prf/de/'
           'GoetheZertifikat_A2_Wortliste.pdf'),
    'b1': ('b1-wortliste.pdf',
           'https://www.goethe.de/pro/relaunch/prf/de/'
           'Goethe-Zertifikat_B1_Wortliste.pdf'),
    # B2, C1 AND C2 HAVE NO WORTLISTE, AND THAT IS THE EXAM BOARD'S OWN POSITION
    # RATHER THAN A GAP IN THIS CACHE.  The published lists stop at B1.  The Goethe-Institut's
    # C1 Prüfungsziele/Testbeschreibung says so outright, in section 4.4:
    #
    #   "Wortschatz- und Grammatikinventare zum Goethe-Zertifikat C1 gibt es aus
    #    folgenden Gründen nicht: Auf dieser Stufe läßt sich keine verbindliche
    #    Eingrenzung des Wortschatzes vornehmen, da authentische Texte verwendet
    #    werden."
    #
    # -- there is no binding delimitation of the vocabulary at this level, because
    # the exam uses authentic texts.  B2 is the same: its brochure points at the
    # Profile deutsch CD-ROM, a commercial Langenscheidt product, and publishes no
    # list of its own.  All three were checked against the brochures themselves
    # rather than inferred from the download page 404ing.
    #
    # C2 IS THE SAME AND ITS BROCHURE IS QUIETER ABOUT IT: the C2
    # Prüfungsziele's section 4.5 asks for "einen reichen Wortschatz" and states
    # only that the exam's texts need no specialist vocabulary beyond what C2
    # courses teach.  It names no inventory, and none is published.
    #
    # So a B2, C1 or C2 deck cannot BE the list, and must not claim to: it is built
    # from a corpus instead, by `corpus_wordlist.py`, and the deck's own description
    # states in the Institut's words that no such list exists.  A level with no
    # entry here takes that path; `run.py` branches on it.
}

# A2's list REPEATS the A1 vocabulary -- `aus`, `und`, `was` and several hundred
# more are printed in both -- so without this the second deck would teach a
# third of the first one over again.  B1 repeats both.
#
# THE THREE CORPUS LEVELS ARE ONE LADDER AND THE ORDER OF THIS TABLE IS THE ORDER
# THEY MUST BE BUILT IN: B2 takes the most frequent words beyond B1, C1 the most
# frequent beyond B2, C2 beyond C1.  Each reads the SHIPPED deck files of the
# levels under it, so building C1 before B2 exists does not fail -- it quietly
# builds the wrong deck, one tranche too shallow.
BELOW = {'a1': [], 'a2': ['a1'], 'b1': ['a1', 'a2'],
         'b2': ['a1', 'a2', 'b1'],
         'c1': ['a1', 'a2', 'b1', 'b2'],
         'c2': ['a1', 'a2', 'b1', 'b2', 'c1'],
         # the phrases deck sits beside the ladder rather than on top of it, but
         # it excludes all six for the same reason: `zum Beispiel` and `es gibt`
         # are printed in the A1 and B1 Wortlisten and are already carded
         'phrases': ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']}

# SELECTION AND ORDERING ARE TWO DIFFERENT QUESTIONS AND ARE ANSWERED BY TWO
# DIFFERENT MEASURES, which is the distinction these two tables exist to keep
# apart.  SELECTION asks *which words belong at this level*; ORDERING asks *how
# often a learner actually meets one*.
#
# `FREQ` IS SELECTION ONLY, and only `corpus_wordlist.py` reads it: B2, C1 and C2
# are cut out of a newspaper corpus because a subtitle corpus has almost nothing
# to say about the words in question -- `Nachhaltigkeit`, `hinsichtlich` and
# `Rechtsstaat` are rare in dialogue and ordinary in a newspaper.  The rows for
# the levels that read a published Wortliste are unused: their membership is the
# exam board's, not a corpus's.
FREQ = {'a1': ('de_50k.txt', 'subs'), 'a2': ('de_50k.txt', 'subs'),
        'b1': ('de_50k.txt', 'subs'),
        'b2': ('leipzig-news-words.txt', 'leipzig'),
        'c1': ('leipzig-news-words.txt', 'leipzig'),
        'c2': ('leipzig-news-words.txt', 'leipzig'),
        'phrases': ('leipzig-news-words.txt', 'leipzig')}

# `FREQ_BLEND` IS ORDERING, AND IT IS ONE SCALE FOR ALL SEVEN DECKS (Aug 2026, on
# request: "order all cards by (approximate) frequency of use").  It was three
# scales -- subtitles for A1 to B1, the newspaper corpus for B2 to C2, raw
# Tatoeba counts for the phrases -- and a rank in one is not a rank in another,
# so the seven decks could not be read against each other and the combined file
# had no order at all.
#
# A WORD'S FREQUENCY OF USE IS ITS RATE IN BOTH REGISTERS, SUMMED: occurrences
# per million in the subtitle corpus plus occurrences per million in the news
# corpus.  Counts cannot simply be added -- the corpora are 152M and 18M tokens,
# so the raw numbers are on scales an order of magnitude apart -- and a rate is
# what makes a word in one comparable with a word in the other.
#
# WHY THE SUM RATHER THAN EITHER ALONE, measured over the shipped decks: the
# subtitle list is the top 50,000 words only, so it scores 0 for 45% of C2 and
# 30% of C1 and would pile most of those decks at the end in one undifferentiated
# block; the news corpus covers the lower levels well (95% of A1) but flattens the
# spoken vocabulary those exams are about -- `ich` is 38,827 per million in
# subtitles and 1,034 in news, `Tschüss` 79 against 0.6.  Summed, the spoken
# register decides among the very common words and the written register decides
# among the rest, which is what a learner's ladder needs and what neither corpus
# gives on its own.
FREQ_BLEND = [('de_50k.txt', 'subs'), ('leipzig-news-words.txt', 'leipzig')]

# WHERE THE WORDS ARE ON THE PAGE, and it is not the same shape twice.  The A1
# list is ONE pair of columns, a headword at x 143-233 and its example from 237;
# the A2 list is TWO pairs side by side on a wider measure, so a page reads down
# the left pair and then down the right, and a rule written for one list finds
# half of the other.  Measured off the x histogram of every list page rather
# than guessed, which is what `COLUMN_X = 236` records for A1 (a threshold at
# the obvious 230 truncates `die Sehenswürdigkeit, -en`, whose `-en` sits at
# 233).  A2's four columns are 35-99, 105-289, 303-369 and 373 on.
LIST_PAGES = {'a1': range(8, 27), 'a2': range(7, 31), 'b1': range(15, 102)}
# A1's column opens at 140 rather than at 0 because the running head sits in
# the left margin at x 17 and 35 ON THE SAME LINE as the section letter: read
# from 0 the row is `Alphabetische A`, which is neither the head nor the
# letter, and `wortliste ab` swallows a real headword.  It survived only
# because the old line grouping ROUNDED the two apart (111.41 and 111.61); the
# clustering B1 needed puts them together, correctly, and the column is what
# should have separated them all along.  Nothing below 143 is a headword,
# measured over all nineteen pages.
HEAD_COLUMNS = {'a1': [(140, 236)], 'a2': [(30, 100), (300, 370)],
                'b1': [(30, 131), (310, 410)]}

# A1 indents its "ableitbare Nebeneinträge" five points (main 143, sub 148); A2 has no such level --
# its Vorwort says derivable compounds are left out altogether rather than
# printed as sub-entries -- and every headword on its pages starts at the
# column's own x, measured.  None means the whole list is main entries.
#
# B1 HAS SUB-ENTRIES AGAIN AND SETS THEM FLUSH RIGHT, which is a third shape
# rather than a wider version of A1's.  A1's sit five points in from a fixed
# left edge; B1's are aligned to the RIGHT edge of the headword column, so
# `der Abfalleimer, -` opens at x 67 under `der Abfall` and `abhängig` at 97
# under `abhängen` -- there is no single indent to test for.  What every one of
# them has in common is simply that it is not at the column's left edge, where
# all 3,334 main entries and their continuation lines start to the tenth of a
# point.  So the threshold sits just right of that edge and the varying indent
# costs nothing.
SUB_INDENT = {'a1': 6, 'a2': None, 'b1': 10}

GROUP_PAGES = {'a1': range(5, 8), 'a2': range(4, 7), 'b1': range(7, 15)}

# HOW WIDE A GAP STILL COUNTS AS ONE WORD, and B1 needs it narrower than
# pdfplumber's default of 3.  B1 numbers its example sentences -- most entries
# carry two or three -- and sets the `1.` about two and a half points right of
# the headword column, which is inside that default: 130 headwords came back
# with the first example's number welded to their plural marker (`-en1.`,
# `¨-e1.`, `alltäglich1.`) and `die Anzeige, -n` was then read as a headword
# ending in a digit.  The same gap welds the regional-variant arrow to what
# follows it (`→D,`), and one line welded across the whole column gap
# (`BargeldIch`).  1.5 splits all 130 and every one of the 100 tokens it
# separates is one that should be separate, measured over all 87 list pages; an
# intra-word character gap at this size is under half a point, so the margin is
# wide.  A1 and A2 keep the default and are byte-identical either way.
X_TOL = {'a1': 3, 'a2': 3, 'b1': 1.5}

# WHETHER THE LIST MARKS AUSTRIAN AND SWISS VARIANTS, which B1 does and neither
# level below it does.  It prints the standard word, the country it is standard
# in, and what the other two say: `das Brötchen, - (D) → A: Semmel; CH: Brötli`,
# and where the Austrian or Swiss word is itself required it gets an entry of its
# own pointing back (`das Brötli, - (CH) → D: Brötchen; A: Semmel`).  The
# annotation is set INSIDE the headword column and wraps onto a second line
# there, so read plainly it becomes both a suffix on the word and a headword of
# its own -- 137 rows, `Semmel; CH: Brötli` and `D, A: Hausmeister` among them.
#
# The variants are DROPPED rather than carded, and that is a decision: the list
# is what a candidate must know and the entry it belongs to is the word, while
# `A: Marille` is a note about where else that word is said.  A deck teaching
# `Marille` from this list would be teaching it with no meaning of its own and no
# frequency behind it.  Where the Institut means the variant to be known it has
# already given it its own entry, and that entry is carded like any other.
REGIONAL = {'a1': False, 'a2': False, 'b1': True}

# Whether a line OPENING on a bracket can be the continuation of the line above.
# In A2 eighteen of them are -- `(Sg.)`, `(sich),`, `(z. B. Feierabend,` -- and
# four are headwords, a verb with an optional prefix.  In A1 there is no such
# continuation anywhere: every bracketed line is a headword, the eight `(sich)
# anziehen` reflexives and `(Kredit)-Karte, -n`.  So the rule is gated here
# rather than made cleverer, which keeps it inert on A1 BY CONSTRUCTION instead
# of by a re-run -- both of A1's shapes were swallowed by earlier attempts at a
# single predicate.
BRACKET_CONT = {'a1': False, 'a2': True, 'b1': False}

# Whether a verb paradigm may break anywhere in itself rather than only on a
# comma.  B1 does it 58 times -- see `verb_wrapped` -- and the arithmetic rule
# that catches those is gated here rather than applied everywhere, because A2
# prints a bare `abholen` as a headword of its own and the rule joins it to the
# line below.  Inert on A1 and A2 BY CONSTRUCTION, which is the discipline
# BRACKET_CONT already records: a predicate wide enough for one list's shapes is
# not automatically right for another's.
VERB_WRAP = {'a1': False, 'a2': False, 'b1': True}

# page furniture that sits inside a headword column and is not a word
FURNITURE = {
    'a1': (r'^213082|^Alphabetische$|^wortliste$',),
    'a2': (r'^625050|^WORTLISTE$|^\d+ WORTLISTE$|^WORTLISTE \d+$'
           r'|^GOETHE-ZERTIFIKAT|^ALPHABETISCHER',),
    'b1': (r'^\d*_?\d*_?SV$|^\d+ WORTLISTE$|^WORTLISTE \d+$|^WORTLISTE$'
           r'|^ZERTIFIKAT B1$|^\d+ ZERTIFIKAT|^\d+ Alphabetischer( Wortschatz)?$'
           r'|^Alphabetischer Wortschatz$',),
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


ART = ('der', 'die', 'das')


def words_below():
    """Every word already taught by a lower level, read from its shipped deck.

    Taken from the deck FILE rather than from a working file, so the exclusion
    is against what actually went out and the two can never drift apart.  A1 is
    the bottom of the ladder and has nothing below it.

    THE FIELD IS HTML AND WAS READ AS PLAIN TEXT, WHICH BROKE THE EXCLUSION FOR
    EVERY NOUN.  `headword_html` wraps the article so the gender can be coloured
    -- `<span class="uc-art uc-m">der</span> Arbeitsplatz` -- so the test for a
    leading `der`/`die`/`das` matched nothing, the article was never stripped,
    and what went into the set was the whole tag soup, which no headword can ever
    equal.  Nothing threw and every count stayed right; the only symptom was that
    A2 re-taught 341 of A1's words and B1 re-taught 644 of A1's and A2's, which
    is precisely what BELOW exists to prevent and reads, card by card, exactly
    like a deck.  Found by comparing the three shipped decks against each other
    rather than by anything in the run.  Strip the markup FIRST, and split on the
    comma AND the slash, since a pair is printed `der Schüler / die Schülerin`.
    """
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join('..', '..', 'decks', DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        deck = json.load(open(p, encoding='utf-8'))
        for c in deck['cards']:
            w = re.sub(r'<[^>]*>', ' ', (c.get('fields') or {}).get('German', ''))
            # THE WHOLE HEADWORD IS A KEY AS WELL AS ITS HALVES, and without it an
            # entry printed identically by two lists survives (Aug 2026).  A2 and
            # B1 both print `weg/weg-`, and splitting on the slash stored `weg`
            # and `weg-` and never `weg/weg-`, so nothing the exclusion held could
            # equal B1's candidate.  The halves stay -- they are what catches a
            # gender pair, `der Schüler / die Schülerin` -- but they are not
            # enough on their own.  Note this is deliberately NOT a match on a
            # half: A1 prints `hier` and B1 prints `hier/hier-`, which is the
            # adverb AND the separable prefix, and dropping the second because of
            # the first would lose what B1 is teaching.
            whole = w.split()
            if whole and whole[0] in ART and len(whole) > 1:
                whole = whole[1:]
            if whole:
                out.add(' '.join(whole))
            for half in re.split(r'[,/]', w):
                parts = half.split()
                # `der/die Bekannte` splits into a bare article and the word; the
                # article half is not a word this level taught
                if not parts or (len(parts) == 1 and parts[0] in ART):
                    continue
                # strip the ARTICLE and keep the rest: `die Pommes frites` is
                # `Pommes frites`, not `frites`
                out.add(' '.join(parts[1:] if parts[0] in ART and len(parts) > 1
                                 else parts))
    return {normal_key(w) for w in out} | out


# WHERE THE REFLEXIVE MARKER SITS IS A FACT ABOUT THE LIST, AND IT DEFEATED THE
# EXCLUSION ENTIRELY (Aug 2026).  `parse_goethe` already records that A1 prints
# `(sich) anziehen` and A2 prints `anziehen (sich)`; B1 prints a bare `sich
# anziehen`.  Three spellings of one word, so `sich freuen` was taught in A1, A2
# AND B1 -- nineteen reflexives duplicated across the three decks, plus `dort,
# -her, -hin` and `weg/weg-`, whose printed forms differ by a space.  Nothing
# threw, every count was right, and the only symptom was the same card twice.
#
# So the exclusion compares on a NORMALISED key rather than on what was printed:
# the marker is lifted out wherever it sits, the pronoun is dropped, and the
# result is folded.  Both the raw and the normalised forms go into the set, since
# the caller tests a raw `word` against it.
_SICH = re.compile(r'\(sich\)|\bsich\b')


def normal_key(w):
    """One key for one word, whatever the list printed round it."""
    w = _SICH.sub(' ', w)
    w = re.sub(r'[\s ]+', ' ', w).strip(' ,-')
    return w.lower()
