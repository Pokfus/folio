#!/usr/bin/env python3
"""Read the word list off the page, repair what is demonstrably broken in it.

The page is a flat bulleted list -- one word per `<li>`, a level chip beside it,
no articles, no parts of speech, no translations -- so parsing is four lines and
everything interesting here is about what the list GETS WRONG.  It is a third
party's compilation rather than an exam board's (see the head of delf_level.py),
so it has no authority to defer to, and it was measured against Wiktionary before
a single card was built.

TWO KINDS OF DEFECT, AND EACH IS FOUND BY A MEASUREMENT RATHER THAN BY EYE.
Both recur at the same rate on every list this site has read, which is the
argument for running the two measurements on a new one rather than trusting
that a longer page was compiled more carefully.

  · A WORD THE FRENCH DICTIONARY HAS NEVER HEARD OF.  Look every entry up in the
    kaikki extraction of English Wiktionary and read what comes back with no
    French record at all.  On the A1 page that is four of 384: `exercise` (the
    English spelling; French is `exercice`), `france` (a proper noun,
    uncapitalised), `cinema` (the accent dropped -- and the list carries
    `cinéma` as well) and `loud`, which is an English adjective and is not a
    French word in any spelling.  On the A2 page it is two of 554: `temperature`
    (the accent dropped again, and `température` is on the list too) and
    `faire du sport`, which is a real French phrase the dictionary simply has no
    entry for and is therefore not a defect at all -- see AUTHORED in
    build_deck.py.  Every other entry is in the dictionary, so the test is sharp
    rather than suggestive, and the ones it names are the ones a reader would
    flinch at.
  · THE SAME WORD TWICE.  Strip the accents off the whole list and read every
    collision, then read every singular/plural pair.  A1 prints `cinema`/
    `cinéma`, `chaussure`/`chaussures`, `parent`/`parents` and `salle de bain`/
    `salle de bains`; A2 prints `temperature`/`température` and four nouns in
    both numbers (`cheveu`, `loisir`, `personne`, `quelque`).  Carded as they
    stand, a reader meets the same word as two cards with two schedules and no
    way to tell which is which.  **A COLLISION IS NOT A DUPLICATE UNTIL IT HAS
    BEEN READ**: A2's `âge`/`âgé` collide and are the noun and the adjective,
    and three more of its words collide with A1's across the level boundary
    (`salé`/`sale`, `sucré`/`sucre`, `sûr`/`sur`) and are six different words.

WHAT IS DELIBERATELY *NOT* REPAIRED, which is the harder half.  `chaussettes`,
`sandales` and `devoirs` are printed only in the plural and are left there: each
is a real French word in a real form, Wiktionary has a record for it, and the
plural is how a learner meets all three (`faire ses devoirs`).  Normalising them
to a singular the list does not print would be editing a syllabus rather than
correcting an error, which is a different act and not one the evidence licenses.
The same goes for `weekend` (beside the hyphenated `week-end`), for `caddie`, and
for the possessives and demonstratives the list gives in several forms at once
(`mon`/`ma`/`mes`, `ce`/`ces`/`cette`) -- those are separate words to learn.

`loud` IS DROPPED RATHER THAN GUESSED AT.  `lourd` is the obvious near-miss and
`allô`... `loud` is not it; neither is `louer`.  Choosing one would be composing
a syllabus entry out of a typo, so the word goes and the run says so.
"""
import json, re, sys

from delf_level import LEVEL, f as lvlf

src = sys.argv[1]
html = open(src, encoding='utf-8').read()

# one `<li>` per word, with the level chip beside it; nothing else on the page
# wears that shape, so the pattern needs no container to anchor to
raw = re.findall(r'<li[^>]*>\s*([^<]+?)\s*<span>' + LEVEL.upper() + r'</span>\s*</li>',
                 html)
raw = [re.sub(r'\s+', ' ', w).strip() for w in raw]
print('  read from the page:', len(raw))
if not raw:
    raise SystemExit('no words found -- the page markup has changed')

# ---------------------------------------------------------------- repairs
# Each row is (what the page prints, what to do, why).  `None` drops the entry;
# a string that is already on the list MERGES the two; any other string is a
# correction.  Every one is justified by one of the two measurements above, and
# the run prints the table so a repair can never happen quietly.
#
# THE TABLE IS PER LEVEL, and that is not tidiness.  A repair is a statement
# about one page: A1 prints `chaussures` beside `chaussure` and A2 does not, so
# a flat table shared across levels would fire a merge on a list that has
# nothing to merge -- silently, since a repair whose source word is absent does
# nothing at all and reports nothing.  Worse in the other direction: a level
# whose list happens to print a word another level's table corrects would have
# that correction applied without anybody having looked at it.  Every row here
# was read off the page it names.
REPAIRS_BY_LEVEL = {
'a1': {
    'exercise': ('exercice', 'the English spelling; no French record'),
    'france':   ('France',   'a proper noun, printed uncapitalised'),
    'loud':     (None,       'an English word; not French in any spelling'),
    'cinema':   ('cinéma',   'the accent dropped, and the list carries cinéma too'),
    # THE ONE REPAIR THE DICTIONARY DOES NOT MAKE FOR US, and it is marked as
    # such.  `renter` IS a French word -- it means to provide someone with an
    # income -- so the no-record test above walks straight past it.  What gives
    # it away is where it lands: last of all 379 words in the subtitle frequency
    # ordering, in a list whose other r-words are `regarder`, `rester`,
    # `restaurant` and `réponse`, and with no word for coming home anywhere in
    # it.  At A1 that is `rentrer`, and the missing second `r` is the whole
    # difference.  Recorded here rather than left, because a beginners' deck
    # teaching a financial verb as an everyday one is the worse error.
    'renter':   ('rentrer',  'a rare verb meaning to yield an income; at A1 the '
                             'word is plainly rentrer'),
    'chaussures':      ('chaussure',     'the list carries the singular too'),
    'parents':         ('parent',        'the list carries the singular too'),
    'salle de bain':   ('salle de bains', 'the list carries both spellings'),
},
'a2': {
    # The A1 page's two kinds of defect, on a longer list and in the same
    # proportion: one accent dropped off a word the list ALSO prints correctly,
    # and four nouns printed in both numbers.
    'temperature': ('température', 'the accent dropped, and the list carries '
                                   'température too'),
    'cheveux':   ('cheveu',   'the list carries the singular too'),
    'loisirs':   ('loisir',   'the list carries the singular too'),
    'personnes': ('personne', 'the list carries the singular too'),
    'quelques':  ('quelque',  'the list carries the singular too'),
    # A THIRD SHAPE OF DUPLICATE, WHICH ONLY THE BUILT CARDS SHOW: the same word
    # printed in both GENDERS.  Neither the no-record test nor the accent sweep
    # nor the singular/plural sweep can see it, because both members are real
    # words in real forms -- what shows it is a card whose Forms row names
    # another card, which is what `joli`/`jolie` and `voisin`/`voisine` do and
    # what `parti`/`partie` (party against part) and `surpris`/`surprise`
    # (surprised against a surprise) deliberately do not.  Read all four before
    # merging any: a feminine form and a feminine noun look identical from the
    # outside.  The masculine keeps the card and prints its feminine, which is
    # what those cards were already doing for eighty other words.
    'jolie':   ('joli',   'the masculine is on the list and prints it as its feminine'),
    'voisine': ('voisin', 'the masculine is on the list and prints it as its feminine'),
    # WHAT LOOKS LIKE A SIXTH ROW AND IS NOT, in two different ways -- both
    # found by stripping the accents off every word and reading each collision
    # rather than by assuming the shape of one was the shape of all.
    #   · WITHIN this list, `âge` and `âgé` collide and are two different words
    #     an accent apart: the noun for age, and the adjective for elderly.
    #     Both stay.
    #   · ACROSS the levels, `salé`, `sucré` and `sûr` are A2 words whose
    #     unaccented partners `sale`, `sucre` and `sur` are A1 words -- salted
    #     against dirty, sugared against sugar, sure against on.  Nothing has to
    #     be done about those at all: `words_below()` excludes an A1 word by its
    #     exact spelling, so all six ship, one pair to a level.
},
}
REPAIRS = REPAIRS_BY_LEVEL.get(LEVEL, {})

# ---------------------------------------------------------------- groups
# What the alphabet cannot say about a word.  These exist for the same reason
# `GROUP_POS` does in the German build: `neuf` is nine and it is also `new`,
# `orange` is a fruit and a colour, and -- the one that would actually have gone
# wrong -- `été` is the summer and is also the past participle of `être`, which
# Wiktionary files first.  A group is a hint about the part of speech, and it
# also gives the deck's own description something true to say about its scope.
GROUPS = {
    'numbers': 'zéro un une deux trois quatre cinq six sept huit neuf dix onze '
               'douze vingt cent'.split(),
    'days':    'lundi mardi mercredi jeudi vendredi samedi dimanche'.split(),
    'months':  'janvier février mars avril mai juin juillet août septembre '
               'octobre novembre décembre'.split(),
    'seasons': 'printemps été automne hiver'.split(),
    'colours': 'blanc bleu gris jaune noir orange rose rouge vert violet'.split(),
}
GROUP_OF = {w: g for g, ws in GROUPS.items() for w in ws}

# ---------------------------------------------------------------- build
entries, seen, log = [], {}, []
dropped = []
for w in raw:
    note = ''
    if w in REPAIRS:
        to, why = REPAIRS[w]
        if to is None:
            dropped.append((w, why))
            continue
        log.append((w, to, why))
        note = why
        w = to
    if w in seen:                      # a repair that merged into an existing row
        seen[w]['merged'] = True
        continue

    # A PRONOMINAL VERB IS LOOKED UP UNDER ITS BARE INFINITIVE.  English
    # Wiktionary files `se laver` under `laver` and marks the reflexive use as a
    # sense, exactly as it files German's `sich freuen` under `freuen` -- so the
    # entry carries both strings and the lookup falls through to the second.
    m = re.fullmatch(r'se ([\w\-\']+)', w)
    lemmas = [w] + ([m.group(1)] if m else [])

    e = {
        'word': w,                     # the bare word, as the corpus would see it
        'display': w,                  # what the card prints; the article is added later
        'speak': w,                    # what the speaker button says; likewise
        'lemmas': lemmas,
        'reflexive': bool(m),
        'phrase': ' ' in w and not m,
        'group': GROUP_OF.get(w, ''),
        'note': note,
        'merged': False,
    }
    seen[w] = e
    entries.append(e)

for w, to, why in log:
    print(f'  repaired  {w!r} -> {to!r}  ({why})')
for w, why in dropped:
    print(f'  dropped   {w!r}  ({why})')
merged = [e['word'] for e in entries if e['merged']]
if merged:
    print('  merged duplicates into:', ', '.join(merged))

# WHAT WAS REPAIRED IS WRITTEN DOWN FOR THE DECK'S OWN DESCRIPTION TO READ.  That
# paragraph named A1's five broken entries and its three duplicates as literals,
# which on the A2 deck told a reader about words its list does not print -- the
# same fault the checker had.  Emitted here, where the repairs actually happen,
# so the prose a reader is shown cannot come apart from what was done.
json.dump({'raw': len(raw),
           'fixed': [{'from': a, 'to': b, 'merged': b in raw} for a, b, _ in log],
           'dropped': [a for a, _ in dropped]},
          open(lvlf('repairs.json'), 'w'), ensure_ascii=False, indent=1)

print('  words:', len(entries),
      f"(reflexive {sum(1 for e in entries if e['reflexive'])},"
      f" phrases {sum(1 for e in entries if e['phrase'])},"
      f" in a group {sum(1 for e in entries if e['group'])})")
json.dump(entries, open(lvlf('wordlist.json'), 'w'), ensure_ascii=False, indent=1)
