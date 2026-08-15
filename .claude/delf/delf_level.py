#!/usr/bin/env python3
"""Which level is being built, and where its intermediates go.

The stages share one cache directory: the downloaded corpora sit at the root
under their own names, and everything a stage computes is suffixed with the
level, so one level can be built after another without either overwriting the
other's working files.  `goethe_level` and `dele_level` are the same idea; the
three are deliberately separate files, because the French settings are French.

WHERE THE WORDS COME FROM, AND WHY THIS IS NOT THE GOETHE ARRANGEMENT.  The
Goethe-Institut publishes a Wortliste for each of its exams, so that deck teaches
the exam board's own list and the pipeline's only job is to read it off the PDF.
FRANCE EDUCATION INTERNATIONAL PUBLISHES NO SUCH LIST FOR THE DELF.  What it
publishes is a syllabus of THEMES -- the alphabet, numbers, family, nationality,
professions, the date, the weather, colours, places -- and the referential that
turns those into words (Beacco et al., `Niveau A1 pour le francais`, Didier) is a
commercially published book rather than a free document.

So the word list here is a THIRD PARTY'S compilation, and that difference is not
a footnote: it changes what the pipeline is allowed to do with the list.  The
Goethe pipeline's standing rule is that the list is the syllabus -- a word the
sentence corpus cannot illustrate still ships, because the exam board sets the
scope and the corpus does not get a vote.  That rule rests on the list being
AUTHORITATIVE, and this one is not: measured against Wiktionary before a card was
built, four of its 384 entries are not French words at all (see REPAIRS in
wordlist.py).  A compilation with typos in it has no authority to defer to, so
the defects are repaired, every repair is declared in that table with its reason,
and the deck's own description says whose list this is.  Nothing is repaired on a
hunch: an entry is only touched where the dictionary has no record of it, or
where the list carries the same word twice.
"""
import json, os

LEVEL = os.environ.get('DELF_LEVEL', 'a1').lower()

TITLES = {'a1': 'DELF A1 — French', 'a2': 'DELF A2 — French',
          'b1': 'DELF B1 — French', 'b2': 'DELF B2 — French'}
DECK_IDS = {'a1': 'delfa1', 'a2': 'delfa2', 'b1': 'delfb1', 'b2': 'delfb2'}
DECK_FILES = {'a1': 'DELF-A1-French.folio-deck.json',
              'a2': 'DELF-A2-French.folio-deck.json',
              'b1': 'DELF-B1-French.folio-deck.json',
              'b2': 'DELF-B2-French.folio-deck.json'}

# The page each level's list is read from.  A further level is a row here plus a
# `BELOW` entry, exactly as the four DELE levels and the three Goethe ones are --
# and the same site publishes A2 (554 words), B1 (893) and B2 (1,673), so the
# table is written for four rather than one.
LISTS = {
    'a1': ('minddory-a1.html', 'https://minddory.com/french-vocabulary-list/a1'),
    'a2': ('minddory-a2.html', 'https://minddory.com/french-vocabulary-list/a2'),
    'b1': ('minddory-b1.html', 'https://minddory.com/french-vocabulary-list/b1'),
    'b2': ('minddory-b2.html', 'https://minddory.com/french-vocabulary-list/b2'),
}

# A LEVEL IS TAUGHT ON TOP OF THE ONES BELOW IT, and the higher lists repeat the
# lower ones -- the A2 page carries `avoir`, `bonjour` and several hundred more
# that A1 has already taught.  Read from the shipped deck FILE rather than from a
# working file, so the exclusion is against what actually went out.
BELOW = {'a1': [], 'a2': ['a1'], 'b1': ['a1', 'a2'], 'b2': ['a1', 'a2', 'b1']}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


def words_below():
    """Every word already taught by a lower level, read from its shipped deck.

    Taken from the deck FILE for the reason `goethe_level.words_below` is: the
    exclusion is then against what a reader actually has, and the two cannot
    drift apart.  A1 is the bottom of the ladder and has nothing below it; the
    function is written now so that adding A2 is a table row rather than an idea.

    THE STORED FORM IS THE BARE WORD, NOT THE HEADWORD.  A French noun is carded
    with its article (`le chien`, `l'arbre`) and a pronominal verb with its
    pronoun (`se laver`), so a plain string comparison against the next level's
    list would match nothing at all and every word would be taught twice.
    """
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join('..', '..', 'decks', DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        deck = json.load(open(p, encoding='utf-8'))
        for c in deck['cards']:
            w = (c.get('fields') or {}).get('Word', '').strip()
            if w:
                out.add(w)
    return out
