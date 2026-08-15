#!/usr/bin/env python3
"""Which level is being built, and where its intermediates go.

The stages share one cache directory: the downloaded corpora sit at the root
under their own names, and everything a stage computes is suffixed with the
level, so one level can be built after another without either overwriting the
other's working files.  `dele_level` and `goethe_level` are the same idea; the
three are deliberately separate files, because the Portuguese settings are
Portuguese.

CAPLE — the Centro de Avaliação de Português Língua Estrangeira at the
Universidade de Lisboa — names its exams rather than numbering them, so the
CEFR level and the exam are two different words: A1 is ACESSO, A2 is CIPLE, B1
DEPLE, B2 DIPLE, C1 DAPLE, C2 DUPLE.  The deck is titled by the CEFR level,
which is what a learner searches for, and names the exam in its own description.

THIS DECK TEACHES EUROPEAN PORTUGUESE, and that is a decision that reaches into
every stage rather than a line in the description.  CAPLE is in Lisbon and sets
the exam on the European standard, so `o comboio` is the train and `o autocarro`
the bus; `banheiro` is a lifeguard and not a bathroom; the mood is the
CONJUNTIVO and not the subjuntivo; and `falámos` is the first person plural of
the preterite where Brazil writes `falamos`.  Each of the three corpora had to be
chosen or filtered for it, and each is recorded where it happens:

  · the frequency list is `pt`, NOT `pt_br` -- see `PT_IS_EUROPEAN` below, which
    is the measurement rather than the assumption
  · Wiktionary's Brazil-tagged FORMS are dropped in build_deck.py, which matters
    far more than it sounds: 5,464 of the 6,511 Portuguese verbs carrying a
    conjugation table have one
  · Wiktionary's Brazil-tagged SENSES are demoted in build_deck.py, and Portugal
    ones are not, which is the DELE pipeline's `Spain` rule turned around
  · Tatoeba's Portuguese is about ten to one Brazilian, measured, and the
    example stage filters it -- see `examples.py`, which also states what it
    cannot fix
"""
import json, os

LEVEL = os.environ.get('CAPLE_LEVEL', 'a1').lower()

# CAPLE's own name for the exam at each CEFR level.  Only A1 has a deck so far;
# the rest are here so that adding one is a row in these tables rather than a
# new idea, exactly as the four DELE levels and the three Goethe ones are.
EXAM = {'a1': 'ACESSO', 'a2': 'CIPLE', 'b1': 'DEPLE',
        'b2': 'DIPLE', 'c1': 'DAPLE', 'c2': 'DUPLE'}

TITLES = {'a1': 'CAPLE A1 — Portuguese', 'a2': 'CAPLE A2 — Portuguese',
          'b1': 'CAPLE B1 — Portuguese', 'b2': 'CAPLE B2 — Portuguese',
          'c1': 'CAPLE C1 — Portuguese'}
DECK_IDS = {'a1': 'caplea1', 'a2': 'caplea2', 'b1': 'capleb1', 'b2': 'capleb2',
            'c1': 'caplec1'}
DECK_FILES = {'a1': 'CAPLE-A1-Portuguese.folio-deck.json',
              'a2': 'CAPLE-A2-Portuguese.folio-deck.json',
              'b1': 'CAPLE-B1-Portuguese.folio-deck.json',
              'b2': 'CAPLE-B2-Portuguese.folio-deck.json',
              'c1': 'CAPLE-C1-Portuguese.folio-deck.json'}

# a level is taught on top of the ones below it, so their words are excluded
BELOW = {'a1': [], 'a2': ['a1'], 'b1': ['a1', 'a2'], 'b2': ['a1', 'a2', 'b1'],
         'c1': ['a1', 'a2', 'b1', 'b2']}

# HOW MANY WORDS the level teaches.  A1 matches the DELE and Goethe A1 decks at
# 500, which is also about what the Council of Europe's own A1 descriptors ask
# for: enough to introduce yourself, shop, order, and ask the way.
#
# B2 IS 1,400 AND NOT THE 2,000 THIS TABLE FIRST GUESSED, and the correction is
# the source's rather than a judgement about how much B2 should be.  The
# Referencial's levels are not a widening syllabus: B2's Noções section has the
# same 162 headings as B1's and largely repeats its bullets, so what B2 ADDS,
# once the 2,216 words already taught below are removed, is a pool of ~1,500.
# `select.py` REFUSES to ship a level short of its target rather than quietly
# taking what it can get, so the guess announced itself the first time B2 was
# built; 1,400 leaves it the margin a corpus refresh needs.
#
# AND C1 IS 1,000 ON THE SAME MEASUREMENT, which is the guard earning its keep a
# second time: the same 2,000 was guessed here and the pool is 1,054 once the
# 3,398 words below are removed.  The shape is the source's again -- the
# Referencial describes what a speaker at each level can DO, and by C1 most of
# the doing is done with words the lower levels already have, so the level adds
# specialised vocabulary rather than a fresh thousand of everything.  MEASURE
# THE POOL BEFORE WRITING A NUMBER DOWN; the guess has now been wrong twice.
TARGET = {'a1': 500, 'a2': 500, 'b1': 1000, 'b2': 1400, 'c1': 1000}

# ------------------------------------------------------------------ variety
# WHY THE FREQUENCY LIST IS `pt` AND NOT `pt_br`, measured rather than assumed.
# hermitdave/FrequencyWords publishes both, built from OpenSubtitles, and
# nothing in either file says which variety it is.  Counting the shibboleths
# settles it beyond argument -- these are the figures from the 50k lists:
#
#     word            pt rank / count      pt_br rank / count
#     comboio            1307 / 14127        7044 /  3488     train   (EP)
#     telemovel           873 / 22142       19832 /   752     mobile  (EP)
#     autocarro          1521 / 11869       20141 /   734     bus     (EP)
#     pequeno-almoco     2057 /  8477           - /     0     breakfast (EP)
#     sandes             4527 /  3307           - /     0     sandwich  (EP)
#     trem               7140 /  1824        1123 / 33018     train   (BP)
#     onibus            11732 /   923        1284 / 28182     bus     (BP)
#     celular            8162 /  1536         995 / 37657     mobile  (BP)
#     geladeira         24778 /   303        3804 /  7774     fridge  (BP)
#
# `pequeno-almoco` and `sandes` do not appear in the Brazilian list AT ALL, and
# every Brazilian word is an order of magnitude commoner there.  So `pt` is
# European Portuguese and is what orders this deck.  Re-run the check if the
# lists are ever rebuilt; it is `--variety-check` on run.py.
PT_IS_EUROPEAN = True
FREQ_FILE = 'pt_50k.txt'
# The Brazilian list is fetched too, and not only by `--variety-check`: it is
# what lets `select.py` REPORT a candidate that looks Brazilian, which is how
# `xícara` was found sitting in B1.  It orders nothing.
BR_FREQ_FILE = 'ptbr_50k.txt'


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


ARTICLES = ('o', 'a', 'os', 'as', 'o/a', 'os/as')


def words_below():
    """Every word already taught by a lower level, read from its shipped deck.

    Taken from the deck FILE rather than from a working file, so the exclusion
    is against what actually went out and the two can never drift apart.  A1 is
    the bottom of the ladder and has nothing below it; the function is written
    now so that adding A2 is a table row rather than a new idea.

    A headword may carry TWO words -- `o professor, a professora` -- and both
    are taught, so both are excluded.  Reading only the first would let A2
    re-teach a feminine A1 already covers, which is the fault `dele_level`
    records finding the hard way.

    IT READS `question`, THE PLAIN HEADWORD, AND NOT THE `Portuguese` FIELD
    BESIDE IT -- and that is a correction rather than a preference.  The field
    is the PRINTED form and the printed form is lossy: it sets a reflexive's
    pronoun as a coloured span instead of hyphenating it, so stripping its tags
    gives `sentirse`, which is not a word and matches nothing the next level
    offers.  The level then re-teaches every reflexive below it, with both decks
    looking perfect, since a duplicated word is a well-formed card.  `question`
    is the lemma the whole pipeline is keyed on and cannot drift from it.

    THE TAGS STILL COME OFF, as a fallback and as the lesson: a rule that tests
    the first SPACE-SEPARATED token against a list of articles is, on the HTML,
    testing `<span class="uc-art">o</span>` and never matching, so the word goes
    into the exclusion set with its markup on and does nothing.
    `goethe_level.words_below` has exactly that fault: run over the shipped A1
    deck it returns 394 of its 792 entries still carrying a tag.  It has never
    shipped a wrong deck, because the German A2 and B1 files are deliberately
    not in the repo and A1 has nothing below it -- but it is the same function,
    and it was found by testing it rather than by reading it.
    """
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join('..', '..', 'decks', DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        deck = json.load(open(p, encoding='utf-8'))
        for c in deck['cards']:
            w = c.get('question') or strip_tags(
                (c.get('fields') or {}).get('Portuguese', ''))
            for half in strip_tags(w).split(', '):
                parts = half.split(' ', 1)
                out.add(parts[1] if parts[0] in ARTICLES and len(parts) > 1
                        else half)
    out.discard('')
    return out


def strip_tags(s):
    import re
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s)).strip()
