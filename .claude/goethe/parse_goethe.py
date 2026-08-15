#!/usr/bin/env python3
"""The Goethe-Institut's own A1 Wortliste, read out of the PDF it is published in.

WHAT IS TAKEN AND WHAT IS NOT.  The list of words is the exam's SCOPE -- which
words an A1 candidate is expected to know -- and that is what this reads.  The
PDF also prints an example sentence under almost every entry, and none of them
is taken: those are the Goethe-Institut's own authored prose, where the deck's
sentences come from Tatoeba (CC BY 2.0 FR) and its meanings from Wiktionary
(CC BY-SA 4.0).  The DELE pipeline draws the same line around the Instituto
Cervantes' Plan curricular.

THE PDF IS TWO COLUMNS AND THE TEXT LAYER IS ONE.  Extracted as text, a row
comes back as `das Baby, -s  Mein Kind ist noch ein Baby.` -- headword and
example run together, separated by one or two spaces in some rows and by TABS
in others, with nothing to say where one ends.  So the words are read with
their x positions instead and the row is cut at the column boundary.  Measured
over all nineteen list pages rather than guessed: the headword column occupies
x 143-233 and the example column starts at 237, with nothing in between.  That
gap matters -- `die Sehenswürdigkeit,` carries its plural marker `-en` out at
x=233, the furthest right any headword reaches, so a threshold set at 230 (the
obvious round number) silently truncates that one entry.

THE FOUR SHAPES A ROW CAN TAKE, all inventoried over the whole list:
  · a MAIN entry, at x=143 -- 651 of them, 24 being the A-Z section letters
  · a SUB entry, indented to x=148 (one at 151) -- 61 of them.  The Vorwort
    calls these "ableitbare Nebeneinträge", derivable and part of the required
    vocabulary all the same: das Ende under enden, die Antwort under antworten.
    They are taught, as words in their own right.
  · a SLASH JOIN, where a pair runs over two lines: `die Ehefrau, -en/` then
    `der Ehemann, ä, er`.  A line ending in `/` is joined to the next.  Three.
  · a HYPHEN WRAP, where one compound noun is broken over two lines:
    `der Anruf-` then `beantworter`.  Two.  A line ending in `-` is joined to
    the next ONLY when it carries an article, which is what tells it from the
    stem entries that legitimately end in one -- `all-`, `dein-`, `Feier-`,
    `Lieblings-`, `best-` -- none of which does.  Every join is printed, so a
    third kind cannot arrive unnoticed.

WHAT THE NOTATION AFTER THE COMMA IS.  `der Baum, -ä, e` is the plural: umlaut
the stem and add -e, so Bäume.  `das Brötchen, –` is a plural that does not
change.  It is READ but never used to build a card: the deck's plurals come
from Wiktionary, which states the form itself rather than a recipe for it, and
the notation is kept only so the two can be checked against each other.
"""
import collections, json, os, re, sys

import goethe_level
from goethe_level import LEVEL, f as lvlf

PDF = sys.argv[1] if len(sys.argv) > 1 else goethe_level.WORTLISTE[LEVEL][0]

# the alphabetical list, its headword columns and its sub-entry indent all come
# from `goethe_level`, because the two lists are not laid out alike -- see the
# LIST_PAGES / HEAD_COLUMNS comment there.
PAGES = goethe_level.LIST_PAGES[LEVEL]
COLUMNS = goethe_level.HEAD_COLUMNS[LEVEL]
SUB_INDENT = goethe_level.SUB_INDENT[LEVEL]
BRACKET_CONT = goethe_level.BRACKET_CONT[LEVEL]
FURNITURE = [re.compile(p) for p in goethe_level.FURNITURE[LEVEL]]
X_TOL = goethe_level.X_TOL[LEVEL]
REGIONAL = goethe_level.REGIONAL[LEVEL]
VERB_WRAP = goethe_level.VERB_WRAP[LEVEL]
TOP_TOL = 3          # a line's own words sit within 1.5 of each other; two lines are 11 apart

# The Austrian / Swiss variant note, and everything after it.  See the REGIONAL
# comment in `goethe_level`.  Each of the three shapes needs a BRACKET, a COLON
# or the arrow to match, so a bare `A` or `D` in a word can never start one --
# which matters, since the section letters and `das Abitur` are both in reach.
XREF_END = re.compile(
    r'\s*(?:→'                                     # → A: Semmel; CH: Brötli
    # `das Brötchen, - (D)`, and `der Verlag, -e (A: ¨-e)` where what differs
    # abroad is the plural rather than the word
    r'|\((?:D|A|CH)(?:\s*,\s*(?:D|A|CH))*(?:\s*:[^)]*)?\)'
    r'|(?<![^\W\d_])(?:D|A|CH)(?:\s*,\s*(?:D|A|CH))*\s*:'   # D, A: Hausmeister
    r').*$')
# a head line ending in one of these is only half the annotation: the rest wraps
# onto the line under it, inside the same column
PAIR_FEM = re.compile(r'^die\s+([A-ZÄÖÜ][\wÄÖÜäöüß-]*in)\b')


UMLAUT = str.maketrans('äöüÄÖÜ', 'aouAOU')


def femof(t, fem):
    """Is `fem` the feminine of the masculine noun on line `t`?

    A COMPARISON RATHER THAN A CONSTRUCTION, because -in is not a rule.  Adding
    it to the masculine catches `Absender`/`Absenderin` and misses every noun
    that umlauts (`Anwalt`/`Anwältin`, `Arzt`/`Ärztin`, `Koch`/`Köchin`) and
    every weak masculine in -e (`Kollege`/`Kollegin`, `Kunde`/`Kunde`+`in`),
    which B1 prints on eight adjacent pairs; each then ships as a card of its
    own, and Wiktionary glosses a feminine "female equivalent of X" and nothing
    else, so it ships with no meaning at all.  So the feminine's own stem is
    compared with the masculine, allowing the umlaut and the final -e.  Measured
    over the whole list: it joins those eight and nothing else, and there is no
    adjacent masculine/feminine pair it fails to take.
    """
    m = re.match(r'^der\s+([A-ZÄÖÜ][\wÄÖÜäöüß-]*?)\s*(?:,.*)?$', t)
    if not m or not fem.endswith('in'):
        return False
    masc, stem = m.group(1), fem[:-2]
    return stem.translate(UMLAUT) in (masc.translate(UMLAUT),
                                      masc.translate(UMLAUT).rstrip('e'))


MARKER_ONLY = re.compile(r'¨?-(?:|e|n|en|s|er|nen|innen|se)(?:/¨?-(?:|e|n|en|s|er))?')

# a note that has begun and is still running: `der Ober, - (D, A) → Kellner;`
# breaks before `CH: Serviceangestellter`, and the semicolon is what says so
XREF_START = re.compile(r'→|(?<![^\W\d_])(?:D|A|CH)(?:\s*,\s*(?:D|A|CH))*\s*:')

# ...and where the note itself breaks: `die Rente, -n (D, CH) → A,` over
# `CH: Pension`, nine rows, every one ending on a country code and a comma
XREF_CONT = re.compile(r'(?:→|(?<![^\W\d_])(?:D|A|CH)(?:\s*,\s*(?:D|A|CH))*\s*[:,])$')

# A VERB'S PARADIGM RUNS TO FOUR PARTS AND THE LINE OFTEN ENDS BEFORE IT DOES.
# The B1 list prints `abbiegen, biegt ab, bog ab, ist abgebogen`, and where the
# column is too narrow the break falls anywhere in it: after the auxiliary
# (`baden, badet, badete, hat` over `gebadet`, 25 of them), after a finite form
# whose separable prefix or reflexive pronoun wraps (`sich amüsieren, amüsiert`
# over `sich, amüsierte sich, hat sich amüsiert`; `kennenlernen, lernt` over
# `kennen, …`), or anywhere else.  The tail then becomes an entry of its own
# under a lemma no dictionary has -- `gebadet`, `gesungen`, `sich, amüsierte
# sich,` -- and the verb it belongs to loses its Perfekt.
#
# So the test is the PARADIGM'S OWN ARITHMETIC rather than the shape of the
# break: a verb entry is finished when it has four comma-parts and the last of
# them is not a bare auxiliary.  `gießen, gießt, goss, gegossen` is four and
# stops (this list omits its auxiliary, which is a slip in the printing and not
# a wrap); `zu sein, ist zu, war zu, ist` is four and continues, the fourth part
# being the auxiliary alone.  Two guards keep it off the nouns and the adverb
# pairs that also open on an -n word: a plural marker as the second part is a
# noun (`der Wagen, -`), and an article opening the NEXT line means a new
# headword has started, which is what separates `drin, drinnen` / `die Droge,
# -n` from a real continuation.  58 lines join, every one read.
VERB_INF = re.compile(r'^(?:\(sich\)\s+|sich\s+)?[\wÄÖÜäöüß()/. -]*[a-zäöüß]n$')
BARE_AUX = re.compile(r'^(?:(?:hat|ist)(?:/(?:hat|ist))?|es)$')


def verb_wrapped(t, nxt):
    p = [x.strip() for x in t.split(',')]
    # …and the first part may be a PHRASE whose infinitive opens it, which is
    # how `spazieren gehen, geht` and `geboren werden, wird` are printed -- and
    # how `festnehmen nimmt fest,` is, the list omitting its first comma.  The
    # opening word has to be longer than three letters to be an infinitive at
    # all: `in` and `an` end in -n too, and `in Pension gehen/sein (D, A) → …`
    # then reads as a verb paradigm and swallows four rows including a headword.
    first = p[0].split()[0] if p[0] else ''
    if len(p) < 2 or p[0][:1].isupper() or not (
            VERB_INF.fullmatch(p[0])
            or (len(first) > 3 and VERB_INF.fullmatch(first))):
        return False
    if p[0].split()[0] in ART or not p[1] or p[1][:1] in '-¨“':
        return False
    if len(p) >= 4 and not BARE_AUX.fullmatch(p[-1]):
        return False
    return bool(nxt) and nxt.split()[0] not in ART


def fix_glyphs(t):
    """Repair what the PDF's own font mapping gets wrong, before anything reads it.

    TWO CHARACTERS, BOTH MEASURED OVER THE WHOLE LIST AND BOTH ON ONE OR TWO
    ROWS.  The umlaut mark that opens a plural marker comes back as a curly
    LEFT DOUBLE QUOTE on `die Angst, “-e` and as `¨` on the other 300-odd, and a
    quote is not a marker, so that noun shipped with `Angst, “-e` as its lemma
    and no meaning at all.  And the marker's own hyphen is set clear of its
    ending twice (`der Klick, - s`, `die Überweisung, - en`), which reads as a
    marker of `-` followed by a word.  Neither shape occurs in A1 or A2, so this
    is inert there -- verified byte-for-byte rather than assumed.
    """
    return re.sub(r'(,\s*¨?-)\s+(?=[a-zäöüß])', r'\1', t.replace('“', '¨'))


def rows():
    import pdfplumber
    out = []
    with pdfplumber.open(PDF) as pdf:
        for pi in PAGES:
            # A LINE IS A CLUSTER OF TOPS, NOT A ROUNDED ONE.  B1 sets the
            # regional-variant arrow 1.42 points above the headword it belongs
            # to, which `round` files in the next bucket down -- so `→` became a
            # row of its own, and because a row ending in an arrow continues
            # onto the next one it swallowed the REAL headword under it and
            # dropped it as an annotation.  `das Streichholz, ¨-er` went that
            # way.  A line's own words sit within a point and a half of each
            # other and two lines are eleven apart, so the tolerance has a wide
            # margin either side; A1 and A2 set every word of a line on one top
            # and are byte-identical under it.
            lines, key = collections.defaultdict(list), None
            for w in sorted(pdf.pages[pi].extract_words(x_tolerance=X_TOL),
                            key=lambda w: w['top']):
                # the words arrive in top order, so only the bucket just opened
                # can still be within reach of one -- and it is compared against
                # that bucket's FIRST top rather than its last, or a page of
                # closely set lines would chain into one
                if key is None or w['top'] - key > TOP_TOL:
                    key = w['top']
                lines[key].append(w)
            # a page is read one headword column at a time, top to bottom: the
            # A2 list runs two entry columns side by side and is alphabetical
            # DOWN the left pair and then down the right, so reading it row by
            # row would interleave two different letters.
            for lo, hi in COLUMNS:
                for top in sorted(lines):
                    row = sorted(lines[top], key=lambda w: w['x0'])
                    head = [w for w in row if lo <= w['x0'] < hi]
                    if not head:
                        continue
                    txt = fix_glyphs(' '.join(w['text'] for w in head).strip())
                    if not txt or any(p.search(txt) for p in FURNITURE):
                        continue
                    # the column's own left edge travels with the row: the
                    # sub-entry test is RELATIVE to it, and a list with two
                    # headword columns has two different edges to measure from
                    out.append({'page': pi, 'x': head[0]['x0'], 'lo': lo,
                                'text': txt})
    return out


def join_wraps(rs):
    """Fold the slash pairs and the hyphenated compounds back together."""
    out, i, joins = [], 0, []
    while i < len(rs):
        r = dict(rs[i])
        while i + 1 < len(rs):
            t = r['text']
            nxt = rs[i + 1]['text']
            if t.endswith('/'):
                r['text'] = t + nxt
            # `der Anruf-`, and never `der Ausländer, -`: a plural notation of
            # `-` (the plural does not change) also leaves the line ending in a
            # hyphen, so the hyphen has to be hard against the word it breaks.
            elif (re.search(r'[a-zäöüßA-ZÄÖÜ]-$', t) and re.match(r'^(der|die|das)\s', t)
                  and nxt[:1].islower()):
                r['text'] = t[:-1] + nxt
            # FOUR MORE SHAPES, ALL A2's, AND ALL PROVABLY INERT ON A1, whose
            # 712 rows contain not one of them (measured before they were
            # written).
            #
            # A TRAILING COMMA MEANS TWO DIFFERENT THINGS AND ONLY THE MARKER
            # TELLS THEM APART.  A2 prints a verb's principal parts under its
            # infinitive -- `beenden,` / `beendet,` / `hat beendet` -- so a line
            # ending in a comma usually continues, 464 of them.  But the
            # headword column is 64 points wide, so a long noun's PLURAL MARKER
            # is pushed out into the example column and leaves the line ending
            # on the comma that introduced it: `das Doppelzimmer,` followed by
            # `das Dorf, ¨-er` is two entries, not one, and joining them loses a
            # word and invents a compound. What separates that from the pair
            # `der Freund, -e,` / `die Freundin, -nen` -- which must be joined --
            # is that the pair's marker is PRESENT before the final comma.
            # Measured over the whole list: six article-initial lines end in a
            # comma, four carry a marker and are pairs, two do not and are
            # truncations.
            elif t.endswith(',') and not (t.split(' ')[0] in ART
                                          and not re.search(r',\s*[-–¨][^,]*,$', t)):
                r['text'] = t + ' ' + nxt
            # `der/die` / `Bekannte, -n`, and B1's `der Pensionist, -en / die`
            # over `Pensionistin, -nen`, where the pair's second article is the
            # last thing that fits on the line.  A German headword never ENDS on
            # an article, so the test is the same one either way: measured over
            # B1, two lines end on one and both are broken there.  A1's entry for
            # the definite article itself is the exception the second test names:
            # `der, die, das` ends on an article because it is NOTHING BUT
            # articles, and joined it swallows the word under it.
            elif t in ART or (t.split()[-1] in ART
                              and any(w.strip(',') not in ART for w in t.split())):
                r['text'] = t + ' ' + nxt
            # A LINE THAT IS NOTHING BUT A PLURAL MARKER belongs to the word
            # above it: the headword column is narrow and a long compound pushes
            # its marker onto the next line, `die Bedienungsanleitung,` over
            # `-en`.  The set is closed and written out rather than matched as
            # "a hyphen and some letters", which would also take `-weise`, a
            # suffix B1 lists as a headword in its own right.
            elif MARKER_ONLY.fullmatch(nxt):
                r['text'] = t + ' ' + nxt
            # ...and the marker's own HYPHEN may be the last thing on the line,
            # leaving the ending alone below it: `die Rezeption/Reception, -`
            # over `en`, `der Zeitpunkt, -` over `e`.  Three rows, and the hyphen
            # is what makes them unambiguous.
            elif t.endswith('-') and re.match(r'(?:e|n|en|s|er|nen)\b', nxt):
                r['text'] = t + nxt
            # ...or the marker may OPEN the next line, which A2's truncated-noun
            # guard above declines because the article test cannot tell `das
            # Doppelzimmer,` (a marker pushed off the page) from `das
            # Hähnchen/Hühnchen,` over `- (D) → …` (a marker pushed onto the next
            # line).  What tells them apart is the next line itself: six of B1's
            # begin on a marker, and a headword never does.
            elif t.endswith(',') and re.match(r'[-–¨]', nxt):
                r['text'] = t + ' ' + nxt
            # a slash pair broken BEFORE the slash rather than after it:
            # `der Serviceangestellte, -n` over `/ die Serviceangestellte, -`
            elif nxt.startswith('/'):
                r['text'] = t + nxt
            # a bracketed note long enough to wrap, caught on the way IN: a
            # headword's own brackets are always balanced (`(ab)fahren`,
            # `(sich) umdrehen`), so an opening one that does not close on its
            # own line can only be an annotation.  `(hat wollen als` /
            # `Modalverb)`.
            elif nxt.startswith('(') and nxt.count('(') > nxt.count(')'):
                r['text'] = t + ' ' + nxt
            # A GENDER PAIR SET ON TWO LINES WITH NO COMMA TO JOIN THEM ON.  A2
            # prints `der Freund, -e,` over `die Freundin, -nen` and the trailing
            # comma is what folds them; B1 prints `der Absender, -` over `die
            # Absenderin, -nen`, ending on the marker instead, so the two arrive
            # as separate entries -- and the feminine one has no meaning of its
            # own to card, Wiktionary glossing it "female equivalent of Absender"
            # and nothing more.  Forty of them.  The test is the WORD rather than
            # the shape: the second must be the first with `in` on the end, which
            # no two unrelated headwords ever are.
            elif PAIR_FEM.match(nxt) and femof(t, PAIR_FEM.match(nxt).group(1)):
                r['text'] = t + '/' + nxt
            # A VERB'S PARADIGM BROKEN ACROSS A LINE MID-WORD.  The hyphen rule
            # above is A1's and asks for an article, because there the only
            # broken word is a compound noun; B1 breaks the PRINCIPAL PARTS of
            # thirty verbs instead -- `beantworten, beant-` over `wortet,
            # beantwortete,` -- and the tail then becomes an entry of its own
            # under a lemma no dictionary has.  What separates it from the stem
            # entries, which also end in a hyphen and must NOT join, is that a
            # stem is the whole line: `heraus-, raus-` opens on a hyphenated
            # piece where `beantworten,` opens on a word.
            elif (re.search(r',\s*[a-zäöüß]+-$', t)
                  and not t.split(',')[0].rstrip().endswith('-')
                  and nxt[:1].islower()):
                r['text'] = t[:-1] + nxt
            # B1 ONLY: the regional note wraps inside the headword column, so its
            # tail (`Semmel; CH: Brötli`) sits on a line of its own and would be
            # read as a headword.  Joined first and stripped after, which is one
            # rule rather than one for each half.
            elif REGIONAL and (XREF_CONT.search(t)
                               or (t.endswith(';') and XREF_START.search(t))):
                r['text'] = t + ' ' + nxt
            # ...and it may break the other side of the arrow instead, leaving
            # the whole note on its own line: `grillen, …, hat gegrillt (D, A)`
            # over `→ CH: grillieren`.  An arrow can begin nothing else.
            elif REGIONAL and nxt.startswith('→'):
                r['text'] = t + ' ' + nxt
            # ...or the whole note may go to the next line with its country
            # bracket intact: `die Versichertenkarte, -n` over `(D) → A: e-card`.
            # A headword never opens on a bracketed country code.  Ten rows.
            elif REGIONAL and re.match(r'\((?:D|A|CH)[,)]', nxt):
                r['text'] = t + ' ' + nxt
            # ...and the very tail of a long note can be a phrase the note has
            # already named: `pensioniert werden/sein (D, CH) → D, A: in Pension
            # gehen/sein; D: in Rente` breaks once more before `gehen/sein`,
            # which is a headword nowhere and a card for the bare verb.  A row
            # repeating a string the row above already contains cannot be a new
            # entry -- the list never prints one twice running.  Exactly one row
            # in B1 and none in A1 or A2.
            elif REGIONAL and XREF_START.search(t) and nxt in t:
                r['text'] = t + ' ' + nxt
            # ...and the note may break BEFORE its semicolon, leaving the second
            # half of a phrase at the head of the next line: `→ D: in Rente` over
            # `gehen/sein; D, CH: pen-`, which read as a headword ships a card
            # for `gehen/sein`.  The test is that the line carries a note opening
            # after a semicolon and does not itself begin with an article, which
            # is what separates it from `der Flur, -e → Gang; D, CH:`.  Ten rows,
            # every one read.
            elif (REGIONAL and nxt.split()[0] not in ART
                  and re.match(r'[a-zäöüß].*;\s*(?:D|A|CH)[,:]', nxt)):
                r['text'] = t + ' ' + nxt
            # a verb paradigm that has not reached its Perfekt -- see VERB_INF
            elif VERB_WRAP and verb_wrapped(t, nxt):
                r['text'] = t + ' ' + nxt
            # A WORD BROKEN BY A HYPHEN AT THE END OF A LINE, which B1 does to
            # six participles (`hat geant-` over `wortet`, `hat verwen-` over
            # `det`) and to one Swiss variant.  The A1 rule above asks for an
            # article, that list breaking only compound nouns; here the break
            # falls inside a paradigm, so the test is instead that the piece is
            # not the WHOLE line -- which is what a stem entry is (`heraus-`) --
            # and that an article does not open the next line, which is what
            # separates `herein-, rein-` over `die Herkunft` from a real break.
            elif (REGIONAL and re.search(r'\S\s\S*[a-zäöüß]-$', t)
                  and nxt[:1].islower() and nxt.split()[0] not in ART):
                r['text'] = t[:-1] + nxt
            # A LINE THAT IS WHOLLY A BRACKET is a note on the line above it --
            # `das Forum, Foren` over `(Internetforum)`, three of them -- and
            # `strip_notes` takes it off again once the two are one row.
            elif re.fullmatch(r'\([^()]*\)', nxt):
                r['text'] = t + ' ' + nxt
            # A BRACKET OPENS AN ANNOTATION OR A HEADWORD, and the difference is
            # not the bracket.  `(Sg.)`, `(Pl.)`, `(sich),`, `(z. B. Feierabend,`
            # and `(bekommen/` all continue the line above; `(ab)fahren,`,
            # `(ab)fliegen,`, `(aus)tauschen,` and `(an-)/(aus)ziehen,` are
            # entries in their own right -- a verb whose prefix is optional.
            # Only those four both END ON A COMMA (a paradigm is starting) and
            # carry a LETTER straight after a closing bracket (the verb is glued
            # to its prefix); all 23 bracketed lines in the list sort correctly
            # on the pair of tests, and neither alone does it.
            # A1 has no bracketed continuation at all and two shapes of
            # bracketed HEADWORD, so the rule is gated per list -- see
            # `BRACKET_CONT`.
            elif (BRACKET_CONT and nxt.startswith('(')
                  and not (nxt.endswith(',') and re.search(r'\)[a-zäöüß]', nxt))):
                r['text'] = t + ' ' + nxt
            # `einverstanden` / `sein,`: a line that is the bare word `sein` and
            # nothing else can only be the second half of an `X sein` phrase,
            # since the entry for `sein` itself prints its principal parts on
            # the same line (`sein, ist, war,`).  Exactly one of each.
            elif nxt == 'sein,':
                r['text'] = t + ' ' + nxt
            # `mit (+ mitbringen/…` / `-nehmen/-spielen)`: a bracketed note long
            # enough to wrap, caught by its own brackets not yet balancing
            elif t.count('(') > t.count(')'):
                r['text'] = t + ' ' + nxt
            else:
                break
            joins.append(r['text'])
            i += 1
        out.append(r)
        i += 1
    print('  joined over two lines:', '; '.join(joins) or 'none')
    return out


# A SLASH BETWEEN TWO ARTICLES IS ONE NOUN WITH TWO GENDERS, NOT TWO NOUNS, and
# telling it from a gender pair is what this table is for.  `der/die Bekannte`
# and `der/das Blog` look alike and mean different things -- one noun that may be
# either gender against `der Schüler / die Schülerin`, which is two words -- and
# the pair rule in `normalise` matches a slash before an article, so an
# alternative gender left out of here is split into halves and the card comes out
# headed `der` with the noun filed as its partner.  Three A2 entries did exactly
# that (Blog, Comic, Laptop).  Inventoried over both lists rather than guessed:
# A2 prints `der/das` three times and `der/die` five, A1 prints `der/die` twice
# and nothing else.  The reversed spellings are carried for the symmetry the
# `die/der` written for A1 already has; neither list prints one.
# `die/das` and `das/die` were added for B1 (Aug 2026), which prints the two-gender
# form with a COMMA -- `die, das Glace/Glacé`, the Swiss and Austrian word for ice
# cream.  The comma rewrite below turns that into `die/das Glace/Glacé`, and with
# the spelling missing from this tuple the entry was read as the bare word `die`:
# the deck then carried a card headed `die`, glossed as the RELATIVE PRONOUN
# ("which, who, whom, whose") because that is what the lemma `die` resolves to,
# and ranked FIRST in the whole of B1, `die` being one of the commonest words in
# German.  Nothing threw and every count was right.  One entry, and it was the
# first card a B1 reader met.
ART = ('der', 'die', 'das', 'der/die', 'die/der', 'der/das', 'das/der',
       'die/das', 'das/die')

# `Satz, -ä, e` is printed with no article, alone among the nouns; the gender is
# taken from Wiktionary like every other, and it is recorded here rather than
# patched so that the list stays what the PDF says it is.
NO_ARTICLE_NOUN = {'Satz'}


def strip_notes(text):
    """Take the list's own annotations off a row before it is read as a word.

    A TRAILING BRACKETED NOTE IS THE LIST TALKING TO ITS READER, not part of the
    word: `die Feier, -n (z. B. Feierabend, Feiertag)`, `der Bescheid
    (bekommen/geben/sagen)`, `zurück- (fahren, geben, gehen, kommen, laufen)`,
    `wer (wen, wem)`.  It is kept in `note` and off the card, where it would read
    as part of the headword -- and it has to come off BEFORE the plural marker is
    looked for, or the marker is no longer at the end and `die Feier, -n` keeps
    its `-n` on the front of the card.

    THREE THINGS ARE EXEMPT.  `(sich)` is the reflexive marker and is read
    further down.  The bracket must be SPACE-separated, so `vorn(e)`, `da(r)`,
    `die (E-)Mail` and `das (Fahr)Rad`, whose brackets are inside the word, stay
    whole.  And A SINGLE CAPITALISED WORD IN BRACKETS IS PART OF THE TERM: A1's
    `Grad (Celsius)` is the unit's own name, and stripping it would leave a card
    reading `Grad` and break the gloss written for it by hand.  No A2 note is a
    single capitalised word, so that exemption costs the A2 list nothing --
    checked over all twelve of them.
    """
    note, plural_only = '', False
    while True:
        m = re.match(r'^(.*\S)\s+(\((?:[^()]|\([^()]*\))*\))\s*,?$', text)
        if not m or m.group(2) == '(sich)':
            break
        if (re.fullmatch(r'\([A-ZÄÖÜ][a-zäöüß]+\)', m.group(2))
                # ...and only on a row with no plural marker on it, since a
                # capitalised word after one is a note rather than part of the
                # term: `das Forum, Foren (Internetforum)`.  A1's `Grad
                # (Celsius)` and A2's twelve notes all sit on rows with no
                # comma at all, so this costs neither list anything.
                and ',' not in m.group(1)
                # …but a GRAMMATICAL ABBREVIATION is not a term, and one is
                # shaped exactly like a capitalised word once its full stop is
                # dropped.  A2 writes `die See (Sg)` where its other fourteen
                # mass nouns are `(Sg.)`, and the stop is the only thing keeping
                # those off the exemption above -- so the abbreviations are named
                # rather than left to a punctuation mark.  One A2 entry, none in
                # A1, which prints no `(Sg)` of either spelling.
                and not re.fullmatch(r'\((?:Sg|Pl)\.?\)', m.group(2))):
            break
        # `die Eltern (pl.)` is a noun with no singular, `(Pl.)` in A2; the mass
        # nouns are marked `(Sg.)` the same way, which is recorded rather than
        # printed.
        if re.fullmatch(r'\((?:pl|Pl)\.\)', m.group(2)):
            plural_only = True
        note = (m.group(2) + ' ' + note).strip()
        text = m.group(1).strip()
    return text, note, plural_only


def fallback_lemmas(word, art):
    """Further names to try the dump under, after the word as printed.

    A LIST RATHER THAN A REPLACEMENT, so the printed form is always tried first
    and these only ever fill a gap.  Two shapes, both B1's and both harmless
    where they find nothing:

    · a headword offering TWO SPELLINGS over a slash -- `chic/schick`, `das
      Müesli/Müsli`, `der Ski/Schi`, `das Stück/-stück` -- where the dump has one
      of them and the pair as printed is in no dictionary at all;
    · a PLURAL-ONLY noun, which the list prints as the plural because that is the
      word (`die Unterlagen`, `die Zinsen`, `die Zutaten`) and Wiktionary files
      under the singular.  The two endings are tried in the order that keeps
      `Zutaten` -> `Zutat` ahead of `Zutate`.

    Both are NARROWED to what they were written for, which keeps them inert on
    A1 and A2 rather than merely harmless there: a slash inside a PHRASE is not
    an alternative spelling (`auf jeden/keinen Fall` is one expression, and its
    halves are not words), and only an `-en` plural is stripped, since taking a
    bare `n` off every noun that ends in one proposes `Autobah` and `Bah`.
    """
    out = []
    if '/' in word and ' ' not in word:
        out += [p.strip(' -') for p in word.split('/') if p.strip(' -')]
    if art and word.endswith('en'):
        out += [word[:-1], word[:-2]]
    return [w for w in out if w and w != word]


def split_entry(text):
    """`der Baum, -ä, e` -> article `der`, word `Baum`, plural notation `-ä, e`.

    The comma is the boundary, but only when what follows is a plural marker --
    a run of hyphens, umlaut letters, `(pl.)` and the odd bare ending.  Three
    entries carry a comma that is NOT one: `der, die, das` (the article itself),
    `dort, -her, -hin` (two derived adverbs) and `die Ehefrau, -en/der Ehemann,
    ä, er` (a pair, already joined above), so the marker is matched rather than
    the comma split on.
    """
    # THE EXAMPLE'S FIRST WORD CAN BE GLUED TO THE PLURAL MARKER, with no space
    # between them in the PDF's own text stream, so no x position can separate
    # them: `der Supermarkt, ¨-eIch`, `die Ermäßigung,-enFür`.  Six of the 1,161
    # entries, every one a marker run followed straight by a capital, which is
    # where a German sentence starts and where a plural marker never continues.
    # ...but NOT where a slash stands between them, which is B1's way of writing
    # an irregular plural beside the regular one (`die Pizza, -s/Pizzen`): there
    # the capitalised word is the marker's own second half, and cutting it leaves
    # a word ending in a slash.
    text = re.sub(r'((?:,\s*|,)[¨\-–][^A-ZÄÖÜ\s]*(?<!/))[A-ZÄÖÜ][a-zäöüß]+$', r'\1', text)

    # A2 PRINTS A VERB'S PRINCIPAL PARTS UNDER ITS INFINITIVE and A1 does not:
    # `besichtigen, besichtigt, hat besichtigt`, and `müssen, muss, musste` where
    # the modal has no participle in the list.  It prints an adjective's
    # comparison the same way -- `gut, besser, am besten`.  The deck builds both
    # from Wiktionary, which states every form rather than three, so what is
    # wanted here is the first part.  TWO TESTS, because a paradigm is not always
    # three parts: a part opening on an auxiliary (`hat`/`ist`, the only two
    # German has, and `hat/ist` where the verb takes either), or simply more than
    # one comma on an entry that is not a noun -- a noun's commas belong to its
    # plural marker and it carries an article, which is the guard.  `dort, -her,
    # -hin` is the one A1 entry with two commas and no article, and it is
    # excluded by name there already.
    # …and the first word must be LOWERCASE as well as un-articled, because a
    # German noun is capitalised and an infinitive is not.  `Satz, -ä, e` is the
    # one A1 noun printed with no article -- which `NO_ARTICLE_NOUN` below exists
    # to record -- and on the article test alone the rule ate its plural.
    parts = text.split(',')
    first = parts[0].split(' ')[0]
    if (not text.startswith('dort') and first not in ART
            and (first[:1].islower() or first[:1] == '(')     # `(ab)fahren, …`
            and (re.search(r',\s*(hat|ist)(/(hat|ist))?\s', text) or len(parts) > 2)):
        return '', parts[0].strip(), ''

    plural = ''
    # `-ä, e` is A1's spelling of the umlaut plural; A2 writes `¨-e` and, on two
    # entries, `-¨e`, and on two more the bare ending with no hyphen at all
    # (`die Rezeption, en`).  Left as A1 wrote it, 194 A2 nouns keep their
    # notation in the display: `der Anfang, ¨-e` on the front of a card.  The
    # trailing `,?` is for the two whose marker was pushed out of the column
    # altogether and left the comma behind (`das Doppelzimmer,`).
    # A MARKER MAY OFFER AN ALTERNATIVE OVER A SLASH, and B1 writes three shapes
    # of it the pair rule does not already fold: `der Bogen, -/¨-` (the umlaut
    # plural is the second alternative), `die Pizza, -s/Pizzen` (the irregular
    # plural written out beside the regular one) and `der Ski/Schi, -er/-`.  Read
    # without it the slash and everything after it stay on the word, and the
    # lemma is a string no dictionary has.  Held to a marker or a capitalised
    # plural after the slash, so `der Absender, -/die Absenderin, -nen` -- a
    # gender pair, folded elsewhere -- cannot reach it.
    alt = r'(?:/(?:¨?-[a-zäöüß]*|[A-ZÄÖÜ][a-zäöüß]+))?'
    m = re.search(r',\s*(-{1,2}[a-zäöüßÄÖÜ]*' + alt + r'(?:,\s*(?:-{1,2})?[a-zäöüßÄÖÜ]+)?'
                  r'|-?¨-?[a-zäöüß]*' + alt + r'|–|-)?\s*[;,]?\s*$', text)
    # A2 drops the hyphen on four entries -- `die Rezeption, en`, `kein, e` --
    # and the ending is then indistinguishable from a word.  Admitted only where
    # the row has ONE comma, which is what keeps it off `der, die, das` (whose
    # `das` it would take for a plural) and off `die Ehefrau, -en/der Ehemann, ä,
    # er` (whose `er`), both A1 entries and both broken by the loose version.
    if not m and text.count(',') == 1:
        m = re.search(r',\s*([a-zäöüß]{1,3})\s*$', text)
    # B1 WRITES AN IRREGULAR PLURAL OUT IN FULL rather than as a recipe: `das
    # Museum, Museen`, `die Firma, Firmen`, `der Saal, Säle` -- twenty of them,
    # every one a Latin or Greek noun whose plural no marker could describe.
    # Read as a marker they leave the whole `Museum, Museen` as the word and the
    # lemma is looked up under a string no dictionary has.  Held to ONE comma and
    # an article, so `der, die, das` and the joined pairs cannot reach it.
    if not m and text.count(',') == 1 and text.split(' ')[0] in ART:
        m = re.search(r',\s*([A-ZÄÖÜ][a-zäöüßA-ZÄÖÜ]+)\s*$', text)
    if m and not text.startswith('dort') and m.start() > 0:
        plural = (m.group(1) or '').strip()
        text = text[:m.start()].strip()
    parts = text.split(' ', 1)
    if parts[0] in ART and len(parts) > 1:
        return parts[0], parts[1].strip(), plural
    return '', text, plural


# --------------------------------------------------------------- normalising
# WHAT A HEADWORD HAS TO BE TURNED INTO.  Each entry needs three things: what is
# PRINTED on the card, what is SPOKEN, and what to look the word up under in
# Wiktionary.  For most of the 684 the three are the same string; 57 are not,
# and they are inventoried here rather than met one at a time.
#
# THE STEMS ARE THE ONLY ONES THAT NEED A TABLE.  `dies-`, `jed-`, `welch-` and
# ten more are printed as a stem plus a hyphen because the word only ever
# appears with an ending on it, and there is no rule that recovers the lemma:
# `best-` is a form of gut and `meist-` of viel, while `dies-` is its own word.
# Each names the forms to look up, most likely first; build_deck takes the first
# that Wiktionary actually carries, and reports any that finds nothing.
STEM = {
    'all-':      ['all', 'alle'],
    'ander-':    ['ander', 'andere'],
    'best-':     ['best', 'gut'],
    'dein-':     ['dein'],
    'dies-':     ['dieser', 'dies'],
    'ein-':      ['ein'],
    'jed-':      ['jeder', 'jed'],
    'letzt-':    ['letzt', 'letzte'],
    'lieb-':     ['lieb'],
    'meist-':    ['meist', 'viel'],
    'nächst-':   ['nächst', 'nah'],
    'unser-':    ['unser'],
    'welch-':    ['welcher', 'welch'],
    'Feier-':    ['Feier'],
    'Lieblings-': ['Lieblings-', 'Liebling'],

    # --- A2 ---
    # A2 PRINTS AN OPTIONAL PREFIX IN BRACKETS, which A1 never does: `(ab)fahren`
    # is the list teaching `fahren` and `abfahren` in one row.  The bracketed
    # spelling is not a German word and Wiktionary has none of them, so each
    # names the words it stands for, the compound first -- the compound is the
    # one the row is there to add, `fahren` being A1 vocabulary already.
    '(ab)fahren':        ['abfahren', 'fahren'],
    '(ab)fliegen':       ['abfliegen', 'fliegen'],
    '(an-)/(aus)ziehen': ['anziehen', 'ausziehen', 'ziehen'],
    '(aus)tauschen':     ['austauschen', 'tauschen'],
    '(Fahr)Rad':         ['Fahrrad', 'Rad'],
    '(E-)Mail':          ['E-Mail', 'Mail'],
    'vorn(e)':           ['vorne', 'vorn'],
    'da(r)':             ['da'],
    # A2's own stems, read the way A1's are
    'eigen-':      ['eigen'],
    'einig-':      ['einige', 'einig'],
    'geehrt-':     ['geehrt'],
    'manch-':      ['mancher', 'manch'],
    'Geburts-':    ['Geburt'],
    'zurück-':     ['zurück'],
    # a direction word printed with every form it takes, prefix and suffix
    'weg/weg-':     ['weg'],
    'her/her-/-her': ['her'],
    'hin/hin-/-hin': ['hin'],
    'heraus/raus':  ['heraus', 'raus'],
    'herein/rein':  ['herein', 'rein'],
    # THREE NOUNS A2 PRINTS ONLY IN THE PLURAL and Wiktionary files under the
    # singular.  `pluralonly` is already recorded from the list's own `(Pl.)`, so
    # the card still says "plural"; this is only where to look the meaning up.
    'Fundsachen':   ['Fundsache'],
    'Kenntnisse':   ['Kenntnis'],
    'Süßigkeiten':  ['Süßigkeit'],
    # inflected or variant spellings the dump files elsewhere
    'nächste':      ['nächste', 'nächst', 'nah'],
    'tschüs':       ['tschüs', 'tschüss'],
    'leidtun/leid tun': ['leidtun', 'leidtun'],
    'verbieten /verboten sein': ['verbieten'],

    # --- B1 ---
    # B1's own stems, read the way A1's and A2's are: the word the stem is a
    # stem OF, most likely spelling first.
    'beid-':       ['beide', 'beid'],
    'besonder-':   ['besondere', 'besonder'],
    'einzig-':     ['einzig'],
    'erst-':       ['erste', 'erst'],
    'heutig-':     ['heutig'],
    'irgend-':     ['irgend'],
    'kein-':       ['kein'],
    'link-':       ['linke', 'link', 'links'],
    'mittler-':    ['mittlere', 'mittler'],
    'recht-':      ['rechte', 'recht'],
    'selb-':       ['selbe', 'selb', 'derselbe'],
    'sogenannt-':  ['sogenannt'],
    'solch-':      ['solcher', 'solch'],
    'dunkel-':     ['dunkel'],
    'hell-':       ['hell'],
    'Groß-':       ['groß'],
    'Haupt-':      ['Haupt', 'haupt-'],
    'Not-':        ['Not'],
    'Traum-':      ['Traum'],
    'Ferien-':     ['Ferien', 'Ferium'],
    # a direction word printed as a prefix in both its spellings, which is how
    # A2 prints `heraus/raus`; B1 sets a comma between them instead
    'heraus-, raus-':   ['heraus', 'raus'],
    'herein-, rein-':   ['herein', 'rein'],
    'herunter-, runter-': ['herunter', 'runter'],
    # a bracketed prefix or object, the shape A2's `(ab)fahren` records: the
    # compound comes first, being the word the row is there to add
    '(heraus-) finden':      ['herausfinden', 'finden'],
    '(herunter-)fahren':     ['herunterfahren', 'fahren'],
    '(herunter-)laden':      ['herunterladen', 'laden'],
    '(hinunter) runterwerfen': ['runterwerfen', 'hinunterwerfen', 'werfen'],
    '(sich etwas) aussuchen': ['aussuchen'],
    '(sich etwas) kaufen':   ['kaufen'],
    'bio(logisch)':          ['biologisch'],
    'meist(ens)':            ['meistens', 'meist'],
    'nah(e)':                ['nahe', 'nah'],
    'wie viel(e)':           ['wie viel', 'wieviel'],
    '(ein) paar':            ['paar'],
    'Achtung!':              ['Achtung'],
    # two spellings printed side by side, which B1 separates with a comma where
    # A2 uses a slash
    'drin, drinnen':  ['drinnen', 'drin'],
    'lange, lang':    ['lang', 'lange'],
    'vorn, vorne':    ['vorne', 'vorn'],
    'noch mal':       ['nochmal', 'nochmals', 'mal'],
    'ein bisschen':   ['bisschen'],
    'so viel/so viel wie': ['so viel', 'soviel'],
    'was für ein-':   ['was für ein'],
    'leid tun':       ['leidtun'],
    'bekannt geben':  ['bekanntgeben', 'bekannt geben'],
    'stehen bleiben': ['stehenbleiben'],
    # a misprint in the list: the first comma of the paradigm is missing, so the
    # row reads `festnehmen nimmt fest, nahm fest, hat festgenommen`
    'festnehmen nimmt fest': ['festnehmen'],
    # nouns the list prints with a bracketed first half, an alternative spelling
    # or a plural, and which the dump files under one of the pieces
    'das (Back-)Rohr':   ['Backrohr', 'Rohr'],
    'der (Back-)Ofen':   ['Backofen', 'Ofen'],
    'der (Schlag-)Rahm': ['Schlagrahm', 'Rahm'],
    'die (Schlag-)Sahne': ['Schlagsahne', 'Sahne'],
    'das/der (Schlag-)Obers': ['Schlagobers', 'Obers'],
    'der/das (Schlag-)Obers': ['Schlagobers', 'Obers'],
    'das Faschierte':    ['Faschiertes', 'Faschierte'],
    'das Hend(e)l':      ['Hendl', 'Hendel'],
    'der Friede, Frieden': ['Frieden', 'Friede'],
    'der Schreck(en)':   ['Schreck', 'Schrecken'],
    'die Daten (Plural)': ['Daten', 'Datum'],
    'die Fasnacht':      ['Fasnacht', 'Fastnacht'],
    'die e-card':        ['e-card', 'E-Card'],
    'die ec-Karte/EC-Karte': ['EC-Karte', 'ec-Karte'],
    'die Bankomat-Karte': ['Bankomatkarte'],
    'der Kursleiter':    ['Kursleiter'],
    'die Kursleiter':    ['Kursleiterin'],
}

# A phrase is looked up under the word that carries the meaning, where one does.
PHRASE_LEMMA = {
    'an sein': 'sein', 'auf sein': 'sein', 'aus sein': 'sein', 'zu sein': 'sein',
    'weg sein': 'sein', 'Rad fahren': 'Rad fahren', 'weh tun': 'wehtun',
    'was für ein': 'was für ein', 'wie viel': 'wie viel',
    'zum Beispiel/z. B.': 'zum Beispiel', 'der, die, das': 'der',
    'dort, -her, -hin': 'dort', 'Grad (Celsius)': 'Grad',
    'circa/ca.': 'circa', 'gern(e)': 'gern', 'ihr/ihm/ihn': 'ihr',
}

# `(Kredit)-Karte, -n` is printed under `die Karte` as a compound with its first
# half bracketed.  What it teaches is die Kreditkarte, so that is what the card
# says; the printed form is recorded here so the change is visible.
# `der Club, -s /Klub, -s` is A2's one alternative SPELLING over a slash -- two
# ways of writing one word, where every other slash on the list separates two
# words -- and the plural marker inside it defeats both the pair rule and the
# marker pattern.  Rewritten rather than given a rule of its own, which is what
# the Kreditkarte entry beside it already records: one entry is a table.
REWRITE = {'(Kredit)-Karte': ('die', 'Kreditkarte'),
           'Club, -s /Klub': ('der', 'Club')}


def normalise(e):
    """Fill in `display`, `speak` and the lemmas to look the entry up under."""
    word, art = e['word'], e['article']
    e['reflexive'] = e['pluralonly'] = False
    e['pair'] = ''

    if word in REWRITE:
        art, word = REWRITE[word]
        e['article'], e['word'] = art, word

    if e.get('pluralonly_pre'):
        e['pluralonly'] = True

    # THE REFLEXIVE MARKER SITS ON EITHER SIDE OF THE VERB, and which side is a
    # fact about the LIST rather than about the verb: A1 writes `(sich) anziehen`
    # and A2 writes `anziehen (sich)`, for the same word.  Both lists also print
    # a bare `sich` on the handful whose reflexive is obligatory (`sich kümmern`,
    # `sich umziehen`).  Measured: A1 is nine prefixed and one bare, A2 is
    # twenty-five suffixed and one bare -- so a prefix-only rule, which is what
    # A1 needed, leaves twenty-five A2 verbs to be looked up under a lemma with
    # `(sich)` on the end of it, which Wiktionary does not carry.  Nothing throws:
    # the entry simply finds no record and the card comes out bare.
    # A NOTE AFTER THE MARKER SURVIVES `strip_notes`, because by the time the
    # verb's principal parts have been cut off the note is no longer at the end
    # of the row: `informieren (sich) (über), informiert, hat informiert` reaches
    # here as `informieren (sich) (über)`, and the preposition is the list's note
    # rather than part of the verb.  Anchored on `(sich)` rather than stripped
    # generally, because `dabei (sein)` ends in a bracket too and there the verb
    # IS the bracketed word.  One A2 entry, none in A1.
    m = re.match(r'^\(sich\)\s+(.*)$|^sich\s+(.*)$'
                 r'|^(.*?)\s+\(sich\)((?:\s+\([^()]*\))*)$', word)
    if m:
        e['reflexive'] = True
        lemma = (m.group(1) or m.group(2) or m.group(3)).strip()
        if m.group(4):
            e['note'] = (m.group(4).strip() + ' ' + e['note']).strip()
            word = word[:m.end(3)].strip() + ' (sich)'
        e['display'] = word
        e['speak'] = 'sich ' + lemma
        e['lemmas'] = [lemma]
        e['word'] = word
        return e

    # a pair over a slash: `die Ehefrau/der Ehemann`, `der Partner/die Partnerin`
    # B1's slash may carry a space either side of it -- `der Pensionist, -en /
    # die Pensionistin, -nen` -- which, unmatched, leaves the whole row as one
    # word ending in the article `die`.  Gated, because A2 prints `mal / das Mal`
    # with the spaces and means two different words rather than a gender pair,
    # and read loosely that card claims `Mal` is the feminine of `mal`.
    sp = r'\s*' if REGIONAL else ''
    if '/' in word and re.search(r'/' + sp + r'(der|die|das)\s', word):
        halves = []
        for h in re.split(r'/' + sp + r'(?=(?:der|die|das)\s)', word):
            a2, w2, _ = split_entry(re.sub(r',\s*[-–äöüÄÖÜ][^/]*$', '', h).strip())
            # the first half's article was taken off the front of the row before
            # the halves were split, so it comes from the entry rather than the text
            halves.append((a2 or art, w2))
        e['display'] = ', '.join(f'{a} {w}'.strip() for a, w in halves)
        e['pair'] = halves[1][1]
        e['word'] = halves[0][1]
        e['article'] = halves[0][0]
        e['speak'] = e['display']
        e['lemmas'] = [halves[0][1]]
        e['pair_lemma'] = halves[1][1]
        e['pair_article'] = halves[1][0]
        return e

    # a plural notation carrying a slash, `das Wort, -ö, er/-e`, which the
    # marker pattern above will not take because it does not end on one piece
    m = re.match(r'^(.*?),\s*(-[^,]*(?:,\s*[^,/]*)?/-?[a-zäöüß]+)$', word)
    if m:
        word = m.group(1).strip()
        e['plural_note'] = m.group(2)

    e['word'] = word
    e['display'] = (art + ' ' + word).strip() if art else word
    e['speak'] = e['display']
    if e['display'] in STEM:
        e['lemmas'] = STEM[e['display']]
    elif e['display'] in PHRASE_LEMMA:
        e['lemmas'] = [PHRASE_LEMMA[e['display']]]
    elif word in STEM:
        e['lemmas'] = STEM[word]
    elif word in PHRASE_LEMMA:
        e['lemmas'] = [PHRASE_LEMMA[word]]
    else:
        e['lemmas'] = [word] + fallback_lemmas(word, art)
    return e


def main():
    rs = join_wraps(rows())
    entries, seen = [], set()
    letters = xrefs = 0
    for r in rs:
        text = re.sub(r'\s+', ' ', r['text']).strip()
        if len(text) == 1 and text.isalpha():       # an A-Z section header
            letters += 1
            continue
        if REGIONAL:
            # BEFORE the section-letter test would be wrong and after it is
            # right: `A: Marille` opens on a capital A, and cutting the note
            # first would leave a bare `A` to be counted as a section header.
            text = XREF_END.sub('', text).strip(' ;,')
            if not text:
                xrefs += 1
                continue
        text, note, plural_only = strip_notes(text)
        # A2 PRINTS A GENDER PAIR TWO WAYS, over a slash (`der Schüler, - / die
        # Schülerin, -nen`) and over a comma (`der Freund, -e, die Freundin,
        # -nen`).  They are the same thing, so the comma form is rewritten into
        # the slash form the rule below already reads rather than given a second
        # rule of its own.  Four entries.
        text = re.sub(r',\s*(?=(?:der|die|das)\s)', '/', text)
        # …and where the comma joined TWO ARTICLES rather than two halves of a
        # gender pair (`die, das Glace`), the rewrite leaves `die/ das Glace`
        # with a space the article spellings in `ART` do not carry.  Closed up,
        # so `die/das` is recognised as the one two-gender article it is.
        text = re.sub(r'\b((?:der|die|das))/\s+(?=(?:der|die|das)\s)', r'\1/', text)
        art, word, plural = split_entry(text)
        e = normalise({'display': (art + ' ' + word).strip() if art else word,
                       'article': art, 'word': word, 'plural_note': plural,
                       'note': note, 'pluralonly_pre': plural_only,
                       # MEASURED FROM THE COLUMN'S OWN EDGE, not from the page:
                       # an absolute threshold reads every entry in a second
                       # headword column as a sub-entry, which on B1 filed 2,002
                       # of 3,190 that way -- backwards, and not something the
                       # counts alone would have shown as wrong.  A1's column
                       # opens at 0, so its 146 is the number it always was.
                       'sub': (SUB_INDENT is not None
                               and r['x'] > r.get('lo', 0) + SUB_INDENT),
                       'page': r['page'],
                       'group': ''})
        key = (e['display'], e['sub'])
        if key in seen:
            continue
        seen.add(key)
        entries.append(e)
    print('  section letters dropped:', letters)
    if REGIONAL:
        print('  regional-variant notes dropped:', xrefs)
    print('  entries:', len(entries),
          '(main', sum(1 for e in entries if not e['sub']),
          '/ sub', sum(1 for e in entries if e['sub']), ')')
    print('  with an article:', sum(1 for e in entries if e['article']),
          ' with a plural notation:', sum(1 for e in entries if e['plural_note']))
    json.dump(entries, open(lvlf('wortliste.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
