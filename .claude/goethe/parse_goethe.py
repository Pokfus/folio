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

from goethe_level import f as lvlf

PDF = sys.argv[1] if len(sys.argv) > 1 else 'goethe_a1.pdf'

# the alphabetical list; pages 0-7 are the front matter and the Wortgruppenliste
# (which wordgroups.py reads) and 27-28 are the bibliography.
FIRST_PAGE, LAST_PAGE = 8, 26
COLUMN_X = 236          # the example column starts at 237 on every page
SUB_INDENT = 146        # a main entry sits at 143, a sub entry at 148 or 151


def rows():
    import pdfplumber
    out = []
    with pdfplumber.open(PDF) as pdf:
        for pi in range(FIRST_PAGE, LAST_PAGE + 1):
            lines = collections.defaultdict(list)
            for w in pdf.pages[pi].extract_words():
                lines[round(w['top'])].append(w)
            for top in sorted(lines):
                row = sorted(lines[top], key=lambda w: w['x0'])
                head = [w for w in row if w['x0'] < COLUMN_X]
                if not head:
                    continue
                txt = ' '.join(w['text'] for w in head).strip()
                # the running head, the page furniture and the section title
                if not txt or txt in ('Alphabetische', 'wortliste') or txt.startswith('213082'):
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
            else:
                break
            joins.append(r['text'])
            i += 1
        out.append(r)
        i += 1
    print('  joined over two lines:', '; '.join(joins) or 'none')
    return out


ART = ('der', 'die', 'das', 'der/die', 'die/der')

# `Satz, -ä, e` is printed with no article, alone among the nouns; the gender is
# taken from Wiktionary like every other, and it is recorded here rather than
# patched so that the list stays what the PDF says it is.
NO_ARTICLE_NOUN = {'Satz'}


def split_entry(text):
    """`der Baum, -ä, e` -> article `der`, word `Baum`, plural notation `-ä, e`.

    The comma is the boundary, but only when what follows is a plural marker --
    a run of hyphens, umlaut letters, `(pl.)` and the odd bare ending.  Three
    entries carry a comma that is NOT one: `der, die, das` (the article itself),
    `dort, -her, -hin` (two derived adverbs) and `die Ehefrau, -en/der Ehemann,
    ä, er` (a pair, already joined above), so the marker is matched rather than
    the comma split on.
    """
    plural = ''
    m = re.search(r',\s*(-{1,2}[a-zäöüßÄÖÜ]*(?:,\s*(?:-{1,2})?[a-zäöüßÄÖÜ]+)?|–|-)\s*$', text)
    if m and not text.startswith('dort'):
        plural = m.group(1).strip()
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
REWRITE = {'(Kredit)-Karte': ('die', 'Kreditkarte')}


def normalise(e):
    """Fill in `display`, `speak` and the lemmas to look the entry up under."""
    word, art = e['word'], e['article']
    e['reflexive'] = e['pluralonly'] = False
    e['pair'] = ''

    if word in REWRITE:
        art, word = REWRITE[word]
        e['article'], e['word'] = art, word

    # `die Eltern (pl.)` -- a noun that has no singular
    m = re.match(r'^(.*?)\s*\(pl\.\)$', word)
    if m:
        word = m.group(1).strip()
        e['pluralonly'] = True

    # `(sich) anziehen` and `sich kümmern`
    m = re.match(r'^\(sich\)\s+(.*)$|^sich\s+(.*)$', word)
    if m:
        e['reflexive'] = True
        lemma = (m.group(1) or m.group(2)).strip()
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
        art, word, plural = split_entry(text)
        e = normalise({'display': (art + ' ' + word).strip() if art else word,
                       'article': art, 'word': word, 'plural_note': plural,
                       'sub': r['x'] > SUB_INDENT, 'page': r['page'],
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
