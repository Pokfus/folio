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


def rows():
    import pdfplumber
    out = []
    with pdfplumber.open(PDF) as pdf:
        for pi in PAGES:
            lines = collections.defaultdict(list)
            for w in pdf.pages[pi].extract_words():
                lines[round(w['top'])].append(w)
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
                    txt = ' '.join(w['text'] for w in head).strip()
                    if not txt or any(p.search(txt) for p in FURNITURE):
                        continue
                    out.append({'page': pi, 'x': head[0]['x0'], 'text': txt})
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
            # `der/die` / `Bekannte, -n`
            elif t in ART:
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
ART = ('der', 'die', 'das', 'der/die', 'die/der', 'der/das', 'das/der')

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
    text = re.sub(r'((?:,\s*|,)[¨\-–][^A-ZÄÖÜ\s]*)[A-ZÄÖÜ][a-zäöüß]+$', r'\1', text)

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
    m = re.search(r',\s*(-{1,2}[a-zäöüßÄÖÜ]*(?:,\s*(?:-{1,2})?[a-zäöüßÄÖÜ]+)?'
                  r'|-?¨-?[a-zäöüß]*|–|-)?\s*[;,]?\s*$', text)
    # A2 drops the hyphen on four entries -- `die Rezeption, en`, `kein, e` --
    # and the ending is then indistinguishable from a word.  Admitted only where
    # the row has ONE comma, which is what keeps it off `der, die, das` (whose
    # `das` it would take for a plural) and off `die Ehefrau, -en/der Ehemann, ä,
    # er` (whose `er`), both A1 entries and both broken by the loose version.
    if not m and text.count(',') == 1:
        m = re.search(r',\s*([a-zäöüß]{1,3})\s*$', text)
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
    if '/' in word and re.search(r'/(der|die|das)\s', word):
        halves = []
        for h in re.split(r'/(?=(?:der|die|das)\s)', word):
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
        e['lemmas'] = [word]
    return e


def main():
    rs = join_wraps(rows())
    entries, seen = [], set()
    letters = 0
    for r in rs:
        text = re.sub(r'\s+', ' ', r['text']).strip()
        if len(text) == 1 and text.isalpha():       # an A-Z section header
            letters += 1
            continue
        text, note, plural_only = strip_notes(text)
        # A2 PRINTS A GENDER PAIR TWO WAYS, over a slash (`der Schüler, - / die
        # Schülerin, -nen`) and over a comma (`der Freund, -e, die Freundin,
        # -nen`).  They are the same thing, so the comma form is rewritten into
        # the slash form the rule below already reads rather than given a second
        # rule of its own.  Four entries.
        text = re.sub(r',\s*(?=(?:der|die|das)\s)', '/', text)
        art, word, plural = split_entry(text)
        e = normalise({'display': (art + ' ' + word).strip() if art else word,
                       'article': art, 'word': word, 'plural_note': plural,
                       'note': note, 'pluralonly_pre': plural_only,
                       'sub': SUB_INDENT is not None and r['x'] > SUB_INDENT,
                       'page': r['page'],
                       'group': ''})
        key = (e['display'], e['sub'])
        if key in seen:
            continue
        seen.add(key)
        entries.append(e)
    print('  section letters dropped:', letters)
    print('  entries:', len(entries),
          '(main', sum(1 for e in entries if not e['sub']),
          '/ sub', sum(1 for e in entries if e['sub']), ')')
    print('  with an article:', sum(1 for e in entries if e['article']),
          ' with a plural notation:', sum(1 for e in entries if e['plural_note']))
    json.dump(entries, open(lvlf('wortliste.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
