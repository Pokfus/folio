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
'b1': {
    # The same two defects a third time, and on this page BOTH misspellings have
    # their correct form on the list as well, so all six rows are merges.
    'implquer':   ('impliquer',   'a letter dropped, and the list carries impliquer too'),
    'questioner': ('questionner', 'a letter dropped, and the list carries questionner too'),
    'études':     ('étude',     'the list carries the singular too'),
    'médias':     ('média',     'the list carries the singular too'),
    'sentiments': ('sentiment', 'the list carries the singular too'),
    'soldes':     ('solde',     'the list carries the singular too'),
    # A THIRD KIND, AND THE ONE THE OTHER TWO SWEEPS CANNOT SEE: an entry printed
    # in an INFLECTED FORM whose base word is not on the list at all.  Both come
    # out as cards -- `l'aspects` with `un aspects` beside it, ungrammatical
    # twice over on a card whose subject is the article -- and neither sweep
    # looks for them, the no-record test because the form has a record and the
    # duplicate test because there is nothing to collide with.
    #
    # This is NOT A1's `chaussettes` case, though the Wiktionary records are
    # identical (a bare `plural of X` and nothing else).  Those stay because the
    # plural is how the word is met -- `faire ses devoirs`, a pair of socks --
    # where `un aspect` is ordinary French and an adjective's citation form is
    # the masculine singular by universal convention.  A list heading an
    # adjective at its feminine plural has made a mistake, not a choice.  The
    # difference is a fact about the WORD and is settled by reading it: is the
    # plural how the word is normally met?  `PLURAL_ONLY` in build_deck.py is
    # where a yes is written down, and it is hand-written for exactly that
    # reason -- a plural in that table cards as `les chaussettes` and one
    # outside it as `l'aspects`.
    'aspects':    ('aspect',  'the plural of a countable noun whose singular is '
                              'the citation form; the list has no aspect', 'form'),
    'profondes':  ('profond', 'the feminine plural of an adjective; the citation '
                              'form is the masculine singular', 'form'),
    # AND THE FOUR THAT LOOK LIKE PAIRS AND ARE NOT, read before being left.
    # `équilibre`/`équilibré` and `limite`/`limité` collide once the accents are
    # stripped and are the noun and the adjective in each case -- balance against
    # balanced, limit against limited.  `préparer` and `se préparer` are the bare
    # verb and the pronominal, which the A2 list settled: different verbs, both
    # kept, and `examples.py` routes a reflexive sentence to the pronominal card.
    # Every one of the four plurals above, by contrast, has a single Wiktionary
    # record reading `plural of X` and nothing else.
},
'b2': {
    # THE LONGEST LIST HAS THE MOST FAULTS AND NOT A HIGHER RATE OF THEM: 33 of
    # 1,673, which is 2.0% against A1's 8 of 384 at 2.1%.  What is new is that
    # the page is ALPHABETICAL and every defect sits immediately beside its own
    # correct spelling -- `aboroder` after `aborder`, `emettre` before
    # `émettre`, `tenacité` before `ténacité` -- which is far better evidence of
    # what was meant than any guess, and which makes most of these merges.
    #
    # · THE SAME SPELLING FAULTS, all with the correct form on the list too.
    'aboroder':      ('aborder',      'a letter added, and the list carries aborder too'),
    'circumstance':  ('circonstance', 'the English spelling; the list carries circonstance too'),
    'emettre':       ('émettre',      'the accent dropped, and the list carries émettre too'),
    'neutral':       ('neutre',       'the English spelling; the list carries neutre too'),
    'profonément':   ('profondément', 'a letter dropped, and the list carries profondément too'),
    'rationnaliser': ('rationaliser', 'a doubled n, and the list carries rationaliser too'),
    'tenacité':      ('ténacité',     'the accent dropped, and the list carries ténacité too'),
    'uniformer':     ('uniformiser',  'not a French verb; uniformiser is, and is on the list too'),
    'vulnerable':    ('vulnérable',   'the accent dropped, and the list carries vulnérable too'),
    # · AND FOUR WHOSE CORRECT FORM IS NOT ON THE LIST, so each is a genuine
    #   correction rather than a merge and the level would otherwise lack the
    #   word.  `philanthrope` is on the list and the noun for the thing is not.
    'budgeter':      ('budgéter',     'the accent dropped; the list has no budgéter'),
    'philanthrophie':('philanthropie','an h too many; the list has philanthrope and not the noun'),
    'relativer':     ('relativiser',  'not a French verb; relativiser is, and is not on the list'),
    'vociferer':     ('vociférer',    'the accent dropped; the list has no vociférer'),
    # · TWO SPELLING VARIANTS Wiktionary files as alternatives rather than as
    #   words, so each would card glossed by a pointer to the form it is a
    #   variant of.  `oxymore` is the French word and `oxymoron` the Greek and
    #   English one; `ressurgir` is the spelling with the ordinary prefix.
    'oxymoron':      ('oxymore',      'the English and Greek form; the French word is oxymore'),
    'resurgir':      ('ressurgir',    'the variant spelling; Wiktionary files it under ressurgir'),
    # · THE REAL BUT WRONG WORD, which is A1's `renter` shape and the reason
    #   that row exists.  `explicit` IS a French noun -- the closing words of a
    #   medieval manuscript -- so no sweep here can see it, and a B2 list
    #   printing it beside `explicite` plainly means the adjective.
    'explicit':      ('explicite',    'a real but codicological noun; beside explicite on the '
                                      'list, plainly the adjective'),
    # · THE SAME-WORD-TWICE FAULT, in its three shapes.  Read before merging:
    #   `contraste`/`contrasté`, `controverse`/`controversé`, `stéréotype`/
    #   `stéréotypé`, `enthousiasme`/`enthousiasmé`, `contrainte`/`contraint`,
    #   `étendue`/`étendu`, `composant`/`composante` and `dominant`/`dominante`
    #   all collide the same way and are NOT merged -- each is a noun beside an
    #   adjective, or two nouns, with real independent records.
    'capacités':     ('capacité',     'the list carries the singular too'),
    'notions':       ('notion',       'the list carries the singular too'),
    'principes':     ('principe',     'the list carries the singular too'),
    'globale':       ('global',       'the masculine is on the list and prints it as its feminine'),
    'potentielle':   ('potentiel',    'the masculine is on the list and prints it as its feminine'),
    'progressive':   ('progressif',   'the masculine is on the list and prints it as its feminine'),
    'marginaux':     ('marginal',     'the masculine plural; the singular is on the list too'),
    # · AND TWO WHOSE OTHER READING IS A RARE NOUN, which is what makes them
    #   dangerous rather than merely duplicated: left alone the form-of record
    #   loses to the noun and the card teaches it.  `volatile` would come out
    #   as a fowl and `revenue` as game leaving the forest to graze.
    'volatile':      ('volatil',      'the feminine, printed beside its masculine; the only '
                                      'other reading is a rare noun for a bird'),
    'revenue':       ('revenu',       'a verb form, printed beside the noun; the only other '
                                      'reading is a rare hunting term'),
    # · AN INFLECTED FORM PRINTED AS A HEADWORD, B1's class again in four
    #   shapes.  `implique` resolves to a word B1 already teaches, so repairing
    #   it makes the entry vanish rather than card a conjugated form; the other
    #   three would leave the level without the word altogether.  `déchets` is
    #   NOT here: waste is normally met in the plural, so it stays and is
    #   written into `PLURAL_ONLY` instead, which is A1's `chaussettes` answer.
    'implique':      ('impliquer',    'the third-person singular; impliquer is taught at B1',
                                      'form'),
    'proportionne':  ('proportionner','the third-person singular; neither proportionner nor '
                                      'proportionné is on the list', 'form'),
    'essentielle':   ('essentiel',    'the feminine of an adjective; the list has no essentiel',
                                      'form'),
    'tortueuse':     ('tortueux',     'the feminine of an adjective; the list has no tortueux',
                                      'form'),
    'avatars':       ('avatar',       'a plural whose singular is how the word is met; the '
                                      'list has no avatar', 'form'),
    # · AND FOUR DROPPED RATHER THAN GUESSED AT, which is A1's `loud` rule.
    #   `malentente` is the sharpest of them: it is not French, and BOTH
    #   candidates are real words meaning different things -- `malentendu` is a
    #   misunderstanding and `mésentente` a falling-out -- so choosing either
    #   composes a syllabus entry out of a typo.  `relevance` and `relevant`
    #   are printed one after the other and are English; the French word for
    #   the first is `pertinence`, which this list already teaches, and the
    #   second is a real French participle nobody teaches at B2.
    'malentente':    (None, 'not French; malentendu and mésentente are both real and mean '
                            'different things'),
    'relevance':     (None, 'an English word; the list already teaches pertinence'),
    'relevant':      (None, 'the English word, printed after relevance; the French participle '
                            'means something else and has no gloss of its own'),
    'worldview':     (None, 'an English word, with no French spelling anywhere near it'),
},
'c1': {
    # THE LIST IS GRADED, WHICH WAS MEASURED BEFORE ANY OF THIS WAS WRITTEN,
    # because the page does not read like one: its commonest words are
    # `seigneur`, `bordel`, `inspecteur` and `commandant`, and it carries
    # `droïde` and `réplicateurs`.  Ranked against the subtitle frequency list
    # the six levels run 700, 1754, 4861, 15490, 18538 and 21194 by median, and
    # 88%, 80%, 50%, 11%, 6% and 4% of each falls in the commonest five
    # thousand -- monotone both ways.  So C1 is a real level and its odd
    # entries are the commonest of a rare vocabulary, not a rag-bag.  Its
    # defect rate is A1's: 28 of 3,220 have no record at all, 0.9%.
    #
    # · THE ACCENT DROPPED, and unlike B2 the correct spelling is mostly NOT on
    #   the page, so these are corrections rather than merges.
    'coincidence':  ('coïncidence',  'the diaeresis dropped'),
    'controle':     ('contrôle',     'the circumflex dropped'),
    'echec':        ('échec',        'the accent dropped'),
    'enquete':      ('enquête',      'the circumflex dropped'),
    'federal':      ('fédéral',      'the accent dropped'),
    'serieusement': ('sérieusement', 'the accents dropped'),
    'credo':        ('crédo',        'the accent dropped; Wiktionary files the accented form'),
    'edition':      ('édition',      'the accent dropped, and the list carries édition too'),
    'eloigne':      ('éloigné',      'the accents dropped, and the list carries éloigné too'),
    # · AND THE `œ` LIGATURE, which French writes as ONE letter and which a
    #   list typed as `oe` therefore spells with a letter the word has not got.
    #   Neither has any record at all until it is repaired.
    'manoeuvre':    ('manœuvre',     'oe for the ligature œ, which French writes as one letter'),
    'écoeurant':    ('écœurant',     'oe for the ligature œ, which French writes as one letter'),
    # · THE ENGLISH SPELLING OF A FRENCH WORD, A1's `exercise` shape.
    'zodiac':       ('zodiaque',     'the English spelling; the French word is zodiaque'),
    'jihad':        ('djihad',       'the English transliteration; Wiktionary files it under djihad'),
    # · A SINGULAR THE DICTIONARY HAS NOT GOT, which is B1's inflected-form
    #   fault seen from the other side: here the LIST prints the singular and
    #   the word is met in the plural.  Both go into `PLURAL_ONLY` so they card
    #   as `les oreillons` rather than `l'oreillons`.
    'oreillon':     ('oreillons',    'mumps is a plural in French; the singular has no record',
                                     'form'),
    'ossement':     ('ossements',    'bones is a plural in French; the singular has no record',
                                     'form'),
    'pourparler':   ('pourparlers',  'talks is a plural in French; the singular has no record',
                                     'form'),
    # · TWO SPELLINGS OF ONE WORD, both printed.  Wiktionary calls `répartie`
    #   the post-1990 spelling OF `repartie`, so the pointer runs that way and
    #   the merge follows it rather than the other way about.
    'répartie':     ('repartie',     'the post-1990 spelling; the list prints both'),
    # · THE FEMININE OF AN ADJECTIVE, printed as the headword.  Six more have
    #   their masculine on the page and are merged into it; these fourteen do
    #   not, so each is a correction and the level would otherwise lack the
    #   word.  Read before merging: `gaine` beside `gain` is NOT one of these —
    #   a sheath is not a gain — and nor are `corse`/`corsé`, `forge`/`forgé`,
    #   `gène`/`gêne`, `planque`/`planqué`, `ravage`/`ravagé` and
    #   `tourmente`/`tourmenté`, which are a noun beside an adjective each.
    'ambitieuse':   ('ambitieux',    'the feminine; the list has no ambitieux', 'form'),
    'criminelle':   ('criminel',     'the feminine; the list has no criminel', 'form'),
    'défensive':    ('défensif',     'the feminine; the list has no défensif', 'form'),
    'dorsale':      ('dorsal',       'the feminine; the list has no dorsal', 'form'),
    'égyptienne':   ('égyptien',     'the feminine; the list has no égyptien', 'form'),
    'exclusive':    ('exclusif',     'the feminine; the list has no exclusif', 'form'),
    'flippante':    ('flippant',     'the feminine; the list has no flippant', 'form'),
    'irrationnelle':('irrationnel',  'the feminine; the list has no irrationnel', 'form'),
    'latérale':     ('latéral',      'the feminine; the list has no latéral', 'form'),
    'majeure':      ('majeur',       'the feminine; the list has no majeur', 'form'),
    'partielle':    ('partiel',      'the feminine; the list has no partiel', 'form'),
    'précieuse':    ('précieux',     'the feminine; the list has no précieux', 'form'),
    'routière':     ('routier',      'the feminine; the list has no routier', 'form'),
    'universelle':  ('universel',    'the feminine; the list has no universel', 'form'),
    # · SIX WHOSE MASCULINE IS ON THE PAGE, so each is a merge rather than a
    #   correction.  `impériale` and `internationale` are also real nouns — the
    #   top deck of a bus, the anthem — and beside their masculines on a
    #   vocabulary list they are plainly the feminine.
    'bourgeoise':   ('bourgeois',    'the masculine is on the list and prints it as its feminine'),
    'explosive':    ('explosif',     'the masculine is on the list and prints it as its feminine'),
    'impériale':    ('impérial',     'the masculine is on the list and prints it as its feminine'),
    'internationale':('international','the masculine is on the list and prints it as its feminine'),
    'navale':       ('naval',        'the masculine is on the list and prints it as its feminine'),
    'piquante':     ('piquant',      'the masculine is on the list and prints it as its feminine'),
    # · AND FOUR PLURALS, one of them a merge.
    'manœuvres':    ('manœuvre',     'the list carries the singular too'),
    'issus':        ('issu',         'the plural; the list has no issu', 'form'),
    'œuvres':       ('œuvre',        'the plural; the list has no œuvre', 'form'),
    'ripoux':       ('ripou',        'the plural; the list has no ripou', 'form'),
    # · AND FOURTEEN DROPPED RATHER THAN GUESSED AT.  Four are not words at all
    #   (`valpi`), or are English (`gloss`, `mart`, `serial`, `stifler`); two
    #   are half of a Latin tag the list prints without its other half (`alter`
    #   ego, a `priori`); two are proper nouns; two are franchise vocabulary a
    #   subtitle corpus would carry; and `vénére` has three candidates a single
    #   character apart — `vénère`, `vénéré` and `vénérer` — meaning furious,
    #   revered and to revere.
    'alter':        (None, 'half of alter ego; not a French word on its own'),
    'priori':       (None, 'half of a priori; not a French word on its own'),
    'valpi':        (None, 'not a word in any language reachable here'),
    'gloss':        (None, 'an English word; French has glose and brillant à lèvres, which are '
                           'different things'),
    'mart':         (None, 'an English word'),
    'serial':       (None, 'an English word; the French is feuilleton or série'),
    'stifler':      (None, 'an English verb given a French ending; the French is étouffer'),
    'gibraltar':    (None, 'a place name rather than vocabulary'),
    'gémeau':       (None, 'a proper noun, the zodiac sign Gémeaux'),
    'orient':       (None, 'a proper noun, l’Orient, printed uncapitalised'),
    'droïde':       (None, 'science-fiction vocabulary; no record in the dictionary'),
    'réplicateurs': (None, 'science-fiction vocabulary; no record in the dictionary'),
    'goder':        (None, 'a real but rare verb about fabric puckering; nothing here can say '
                           'that is what a C1 list means by it'),
    'vénére':       (None, 'three candidates a single character apart, meaning furious, revered '
                           'and to revere'),
},
'c2': {
    # THE SMALLEST LIST AND THE ONE LEAST LIKE A SYLLABUS.  Its sweeps are the
    # cleanest of the six -- one accent twin, one plural, two only-pointer
    # entries -- and that is not a sign of quality: at 376 entries there is
    # simply less to collide with.  What IS wrong with it is not a defect rate
    # at all and no repair can reach it; see `LIST_NOTE` in emit.py, which is
    # what the deck tells its reader.
    'eventreur':    ('éventreur', 'the accent dropped, and the list carries éventreur too'),
    # · FRANCHISE VOCABULARY, which the lower lists carry at a hundredth of this
    #   rate (C1 has `droïde` and `réplicateurs` in 3,220).  None has a record.
    'cardassien':   (None, 'a Star Trek people; no record in the dictionary'),
    'romulien':     (None, 'a Star Trek people; no record in the dictionary'),
    'phaseur':      (None, 'a Star Trek weapon; no record in the dictionary'),
    'phaseurs':     (None, 'the same word again, in the plural'),
    'métamorphe':   (None, 'a shapeshifter in dubbed science fiction; no record'),
    # · PROPER NOUNS, printed uncapitalised.
    'excalibur':    (None, 'a proper noun, the sword'),
    'prométhée':    (None, 'a proper noun, the titan'),
    'nobel':        (None, 'a proper noun, the prize and the man'),
    'argo':         (None, 'a proper noun, the ship'),
    # · AND THE REST: two English words, a Latin half-binomial, half of a
    #   French phrase the list prints without its other half, a real but
    #   unrecorded common noun, and one neologism nothing here can confirm.
    'maxim':        (None, 'an English word'),
    'mystic':       (None, 'an English word; the French is mystique'),
    'sapiens':      (None, 'half of homo sapiens; not a French word on its own'),
    'emblée':       (None, 'half of d’emblée; not a word on its own'),
    'argus':        (None, 'l’argus is a real French noun for the used-car price guide, and the '
                           'dictionary has no record of it'),
    'intraçable':   (None, 'a neologism with no record; untraceable is normally introuvable'),
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
        # THE KIND IS DECLARED, NOT DETECTED.  The deck's own description tells
        # the reader what was wrong with the list, and the two faults do not
        # read alike: `implquer` is misspelt, where `aspects` is spelt
        # perfectly and is the wrong FORM of the word.  Structurally they are
        # hard to tell apart -- the citation form happens to be a prefix of the
        # plural and not of the typo, which holds for these four and would fail
        # on the first suppletive one -- and this table is hand-written with
        # every row read off the page, so the row says which it is.
        to, why, *kind = REPAIRS[w]
        if to is None:
            dropped.append((w, why))
            continue
        log.append((w, to, why, kind[0] if kind else 'spelling'))
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

for w, to, why, kind in log:
    print(f'  repaired  {w!r} -> {to!r}  [{kind}]  ({why})')
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
           'fixed': [{'from': a, 'to': b, 'merged': b in raw, 'kind': k}
                     for a, b, _, k in log],
           'dropped': [a for a, _ in dropped]},
          open(lvlf('repairs.json'), 'w'), ensure_ascii=False, indent=1)

print('  words:', len(entries),
      f"(reflexive {sum(1 for e in entries if e['reflexive'])},"
      f" phrases {sum(1 for e in entries if e['phrase'])},"
      f" in a group {sum(1 for e in entries if e['group'])})")
json.dump(entries, open(lvlf('wordlist.json'), 'w'), ensure_ascii=False, indent=1)
