#!/usr/bin/env python3
"""Write the .folio-deck.json file."""
import json, os, re
from collections import Counter

from delf_level import (LEVEL, f as lvlf, TITLES, DECK_IDS, DECK_FILES, LISTS,
                        EXAM, PHRASES)

cards = json.load(open(lvlf('cards.json')))
entries = json.load(open(lvlf('entries.json')))

TYPE_ID = 'delf'

# ONE NOTE, TWO CARDS.  The word is a single record and the two directions are
# card TEMPLATES, so a corrected gloss is corrected both ways at once and each
# direction still keeps a schedule of its own -- recognising `l'immeuble` comes
# long before producing it.  Card 1 is FRENCH → ENGLISH, the easier direction and
# the one a reader meets first, so it keeps the bare note id.
#
# The headword is plain text with an EMPTY speaker beside it, never inside it:
# `.uc-tts` is a bordered, filled control, so wrapping the word would put the
# thing a reader is trying to recall inside a grey box -- and where the device has
# no speech engine the site hides an empty control outright, so the word still
# reads.  It says the WORD and not the article, `data-say` carrying the bare
# headword: a speaker reading `le chien` teaches the article's liaison rather than
# the noun, and on the elided ones it would say `l'` twice.
SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '<div class="uc-word">{{French}}' + SAY + '</div>'
IPA = '{{#Ipa}}<div class="uc-ipa">{{Ipa}}</div>{{/Ipa}}'
ASK = '<div class="uc-ask">Say it in French</div><div class="uc-field">{{English}}</div>'

# The plural, the feminine and the indefinite article sit with the word they
# belong to, above the rule that divides it from its meaning: `l'arbre` /
# `un arbre` is one fact in two halves.
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'

# The sentences come FIRST and the paradigm after: a French verb's table runs to
# thirty-odd forms, and a reader who opens both folds should not have to scroll
# past the whole of it to reach the three sentences that show the word in use.
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        # THE SUMMARY IS NOT THE WORD `Conjugation`, because the panel is not a
        # verb's alone: an adjective's agreement opens in the same place, and a
        # heading naming one word class would be wrong on a third of the cards
        # that carry it.  The FIELD keeps its name.
        '{{#Conjugation}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Conjugation}}</div></details>{{/Conjugation}}')

FRONT_FR = WORD
BACK_FR = '{{FrontSide}}' + IPA + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + IPA + FORMS + TAIL

CSS = """.card {
  text-align: center;
  font-size: 17px;
  line-height: 1.6;
}
.uc-ask {
  margin-bottom: 14px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
.uc-word {
  font-size: 38px;
  font-weight: 400;
  line-height: 1.2;
}
.uc-art {
  font-weight: 500;
}
/* le blue, la red.  French has two genders where German has three, so there is
   no third colour here -- and `l'` is coloured by the gender it is hiding, which
   is the whole reason the indefinite article is printed in the forms row. */
.uc-m {
  color: var(--indigo, #3D4E8F);
}
.uc-f {
  color: var(--zh, #C8453C);
}
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
}
/* THE PRONUNCIATION IS ON THE BACK ONLY.  French spelling does not say how a
   word sounds -- `eau`, `oiseau`, `femme`, `août` -- so the transcription earns
   its place; putting it on the front would hand the reader the answer to the
   very recall the card is for. */
.uc-ipa {
  margin-top: 6px;
  font-size: 14px;
  letter-spacing: 0.02em;
  opacity: 0.55;
}
.uc-field {
  display: block;
  width: fit-content;
  /* A FLOOR, because French's commonest words gloss in one word.  The box hugs
     its contents -- right for a list of four senses -- and on `je` -> `I` that
     left an 80px stamp adrift in the middle of a 680px card, under a rule
     spanning the whole of it.  min() so a narrow phone still gets full width. */
  min-width: min(300px, 100%);
  max-width: 100%;
  margin: 14px auto 0;
  padding: 11px 15px;
  border: 1px solid var(--rule, rgba(0,0,0,0.12));
  border-radius: 11px;
  text-align: left;
  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));
}
.uc-sense {
  line-height: 1.6;
}
.uc-pos {
  margin-bottom: 3px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint, #6C6A63);
}
.uc-gl {
  line-height: 1.5;
}
.uc-gls {
  margin: 0;
  padding-left: 0;
  list-style: none;
  line-height: 1.5;
}
.uc-forms {
  margin-top: 8px;
  font-size: 15px;
}
.uc-fi + .uc-fi {
  margin-left: 14px;
}
.uc-fl {
  margin-right: 6px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.5;
}
.uc-fold {
  margin-top: 14px;
  text-align: left;
}
.uc-fold summary {
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.6;
  text-align: center;
}
.uc-conj {
  margin-top: 10px;
  font-size: 13px;
}
.uc-cj-nf {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--rule, rgba(0,0,0,0.10));
}
.uc-cj-nfi i {
  margin-right: 6px;
  font-size: 9.5px;
  font-style: normal;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.5;
}
.uc-cj-nfi b {
  font-weight: 500;
}
.uc-cj-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(178px, 1fr));
  gap: 12px 18px;
  margin-top: 12px;
}
.uc-cj-h {
  margin-bottom: 4px;
  padding-bottom: 3px;
  border-bottom: 1px solid var(--rule, rgba(0,0,0,0.10));
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--zh, #C8453C);
}
.uc-cj-r {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 1px 0;
}
/* the person is in ENGLISH and the form is the whole French phrase -- see
   PERSONS in build_deck.py for why French cannot split the row where German does */
.uc-cj-p {
  flex: 0 0 auto;
  font-size: 10.5px;
  opacity: 0.5;
}
.uc-cj-f {
  flex: 1 1 auto;
  text-align: right;
  font-weight: 500;
}
/* WHAT CHANGES DOWN THE TENSE, in the same red the tense heading above it is
   set in -- so the panel gains no new colour, only a second use of the one it
   has.  Which characters those are is MEASURED per tense rather than taken from
   a table of endings; see `common_prefix` in build_deck.py for why, and for why
   an irregular verb is marked all the way through. */
.uc-cj-e {
  font-weight: 700;
  color: var(--zh, #C8453C);
}
/* An adjective's agreement is a GRID -- masculine/feminine against
   singular/plural -- and flattening that into label/value pairs loses the thing
   the table is for.  `minmax(min-content, 1fr)` and not `minmax(0, 1fr)`: a zero
   floor lets a track shrink below the word in it, and because a cell is `nowrap`
   the cells then OVERLAP rather than overflowing, so the row stays inside the
   card and `overflow-x` finds nothing to scroll.  The German deck records
   finding that at 390px. */
.uc-dt {
  margin-top: 2px;
  overflow-x: auto;
}
.uc-dtr {
  display: grid;
  gap: 6px;
  align-items: baseline;
  padding: 1px 0;
}
.uc-dt2 .uc-dtr {
  grid-template-columns: 62px repeat(2, minmax(min-content, 1fr));
}
.uc-dtw {
  grid-column: 1 / -1;
}
.uc-dth {
  padding-bottom: 2px;
}
.uc-dtl {
  font-size: 10px;
  letter-spacing: 0.02em;
  opacity: 0.5;
}
.uc-dth .uc-dtc {
  font-size: 9.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.45;
}
.uc-dtc {
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
}
.uc-exs {
  margin-top: 10px;
}
.uc-exi {
  padding: 9px 0;
  text-align: center;
}
.uc-exi + .uc-exi {
  border-top: 1px solid var(--rule, rgba(0,0,0,0.10));
}
.uc-exz {
  font-size: 16px;
  line-height: 1.55;
}
.uc-exz b {
  font-weight: 600;
  color: var(--zh, #C8453C);
}
.uc-exe {
  margin-top: 3px;
  font-size: 13px;
  opacity: 0.62;
}
.uc-exsay {
  margin-right: 7px;
}
"""

FIELDS = ['French', 'Word', 'Ipa', 'English', 'Forms', 'Conjugation', 'Examples']

DECK = DECK_IDS[LEVEL]
for i, c in enumerate(cards, 1):
    c['id'] = f'u_{DECK}_{i}'
    c['type'] = TYPE_ID
    c['category'] = TITLES[LEVEL]

# ---------------------------------------------------------------- the numbers
n = len(cards)
arts = sum(1 for c in cards if 'uc-art' in c['fields']['French'])
elided = sum(1 for c in cards if "uc-art" in c['fields']['French'] and "l&#39;" in c['fields']['French'] or "'</span>" in c['fields']['French'])
indef = sum(1 for c in cards if '>with un/une<' in c['fields']['Forms'])
plurals = sum(1 for c in cards if '>plural<' in c['fields']['Forms'])
fems = sum(1 for c in cards if '>feminine<' in c['fields']['Forms'])
bvow = sum(1 for c in cards if '>before a vowel<' in c['fields']['Forms'])
verbs = sum(1 for c in cards if 'Passé composé' in c['fields']['Conjugation'])
etre = sum(1 for c in cards if 'auxiliary</i><b>être' in c['fields']['Conjugation'])
adjs = sum(1 for c in cards if 'Accord' in c['fields']['Conjugation'])
ipas = sum(1 for c in cards if c['fields']['Ipa'])
refl = sum(1 for e in entries if e['reflexive'])
ex3 = sum(1 for c in cards if c['fields']['Examples'].count('uc-exi') == 3)
ex0 = sum(1 for c in cards if not c['fields']['Examples'])

# A word the sentence corpus cannot illustrate is SAID, not swapped out.  THE
# HOW-THEY-WERE-CHOSEN CLAUSE BELONGS TO THE SENTENCES, so it is written here
# rather than appended to whatever this returns: appended, it landed after the
# "nothing at all for the other N" clause and read as though those N words had
# been chosen — which is what a B2 deck with 223 of them made obvious and a B1
# deck with 7 had already been shipping.
# …and a count of one is not a plural.  B2 teaches a single pronominal verb,
# which no level below it does.
REFL_NOTE = (
    '' if not refl else
    (f"The {refl} pronominal verbs carry their pronouns" if refl > 1 else
     "The one pronominal verb carries its pronouns") +
    " throughout — je me lève, je me suis levé(e) — including in the imperative, where French "
    "moves the pronoun behind the verb: lève-toi, levez-vous. ")

# WHAT THE DECK TEACHES ONE OF.  The six levels teach words and the seventh
# teaches set expressions, and every sentence counting them has to say which --
# "three real example sentences for each word" is simply false on a deck whose
# entries are `avoir faim` and `tout de suite`.  One variable rather than two
# copies of the note, since the reasoning in it is the same either way.
UNIT = 'expression' if LEVEL == PHRASES else 'word'
UNITS = UNIT + 's'

_HOW = (', chosen where possible to show three different inflected forms rather than the '
        f'same one three times, with the {UNIT} picked out in colour. ')
EX_NOTE = (f'Every {UNIT} also carries three real example sentences' + _HOW
           if ex3 == n else
           f'Real example sentences come with {n - ex0} of the {n} {UNITS}, three apiece for '
           f'{ex3} of them and one or two for the rest' + _HOW.rstrip(' ')
           # …and a count of one is not a plural, which is the third time this
           # file has met that.  On the levels ex0 ran to 7 and 223; the phrases
           # deck has exactly one and "the other 1" is not English.  NOTE THE
           # BARE SPACE ON THE EMPTY BRANCH: this clause is concatenated with the
           # sentence after it, and dropping the space closed "colour." up
           # against "Word list:" on every deck the corpus illustrates entirely
           # -- which is A2, and is how the six-level diff caught it.
           + (' ' if not ex0 else
              f' The corpus has nothing at all for the other {ex0}. ' if ex0 > 1 else
              ' The corpus has nothing at all for the remaining one. '))

# WHAT THE LIST GOT WRONG IS DESCRIBED FROM WHAT WAS ACTUALLY REPAIRED, never
# written out.  This paragraph named A1's five broken entries and its three
# duplicate pairs as literals, so the A2 deck told its reader about `cinéma` and
# `chaussures` -- words that page does not print -- while saying nothing about
# the ones it does.  `wordlist.py` records each repair as it makes it and this
# reads that back, which is the same rule the checker was fixed to follow.
LEVELS_SAID = {'a1': "the beginner's", 'a2': "the elementary",
               'b1': "the intermediate", 'b2': "the upper-intermediate",
               'c1': "the advanced", 'c2': "the mastery-level"}

# WHAT THE LIST IS, WHERE THAT IS NOT WHAT ITS NAME SAYS.  The six pages are
# graded by FREQUENCY, which was measured rather than assumed: ranked against
# the OpenSubtitles list their medians run 700, 1754, 4861, 15490, 18538 and
# 21194, and the share falling in the commonest five thousand runs 88%, 80%,
# 50%, 11%, 6% and 4% -- monotone both ways, so each page really is rarer
# vocabulary than the one below it.
#
# The corpus that ranking came from is FILM AND TELEVISION SUBTITLES, and the
# higher the band the more that shows: at A1 the commonest words are the
# commonest words whatever the corpus, and by C2 the corpus's own character is
# all that is left.  A reader is owed that, because a deck headed `DALF C2`
# otherwise says these are the words the exam wants.  Written per level and
# only where it is needed; the lower four pages need no such note.
LIST_NOTE = {
    'c1': ("A word of warning about the level, which was measured rather than assumed. The six "
           "lists are graded by how common a word is in a corpus of film and television "
           "subtitles, and by C1 that corpus's own character is beginning to show: the deck "
           "carries the vocabulary of dubbed drama alongside the vocabulary of the exam. That "
           "is what the additions above are for, and they do not make the rest of it a "
           "syllabus. Treat this as advanced French in rough order of usefulness. "),
    'c2': ("A word of warning about the level, because the deck's name and the page it was "
           "built from do not agree. The six lists are graded by how common a word is in a "
           "corpus of film and television subtitles — measured, not assumed — and C2 is the "
           "rarest band, so what is left in it is whatever that corpus has and ordinary French "
           "does not. In practice that is the specialist vocabulary of genre television: "
           "science fiction (hyperespace, téléportation, antimatière, symbiote), hospital "
           "drama (anévrisme, défibrillateur, tachycardie, pneumothorax), crime (légiste, "
           "effraction, perquisition, macchabée) and the occult (exorcisme, sortilège, "
           "grimoire). A DALF C2 candidate is tested on abstract and argumentative register, "
           "and the page has essentially none of it — which is why the additions above were "
           "written in rather than found. Even so, most of this deck is the page: rare French "
           "worth knowing, and not by itself preparation for the examination it is named "
           "after. "),
}
REP = json.load(open(lvlf('repairs.json')))


def _and(xs):
    xs = list(xs)
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' and ' + xs[-1]


# THREE BUCKETS, NOT TWO, and the third is why the row declares its kind.  A
# repair whose target is already on the list is a DUPLICATE however it is
# spelt, so `implquer` beside `impliquer` reads as the same word printed twice
# and belongs there.  What is left splits again: a word spelt wrongly, and a
# word spelt perfectly in the wrong FORM.  Calling `aspects` a misspelling
# would be telling the reader something untrue about a list this paragraph
# exists to be honest about.
_corr = [r for r in REP['fixed'] if not r['merged'] and r.get('kind') != 'form']
_form = [r for r in REP['fixed'] if not r['merged'] and r.get('kind') == 'form']
_dups = [r for r in REP['fixed'] if r['merged']]
_bits = []
if _corr:
    _bits.append(f"{len(_corr)} " + ("is" if len(_corr) == 1 else "are") +
                 " misspelt (" + _and(f"{r['from']} for {r['to']}" for r in _corr) + ")")
if _form:
    _bits.append(f"{len(_form)} " +
                 ("is an inflected form standing" if len(_form) == 1 else
                  "are inflected forms standing") + " in for the word itself (" +
                 _and(f"{r['from']} for {r['to']}" for r in _form) + ")")
if _dups:
    _bits.append(f"{len(_dups)} " + ("is" if len(_dups) == 1 else "are") +
                 " the same word printed twice (" +
                 _and(f"{r['from']} beside {r['to']}" for r in _dups) + ")")
if REP['dropped']:
    # WHAT THE TEST ACTUALLY WAS, and not more.  This read "are not French words
    # in any spelling", which is true of `loud` and `worldview` and false of
    # `argus` (a real noun for the used-car guide), `goder` and B2's `relevant`
    # — all of them real French the extraction simply has no record of.  The
    # honest claim is the one the pipeline can make: the dictionary has nothing
    # to card them from, so they are dropped rather than guessed at.
    _bits.append(_and(REP['dropped']) +
                 " could not be matched to a French dictionary entry")
# each phrase carries its own verb, so the sentence reads whether it has three
# clauses or one -- shared across a list it came out as the fragment "The
# duplicates merged into one card." on the level that has only duplicates
_did = ([] + (["the misspellings are corrected"] if _corr else [])
        + ([("the inflected form is" if len(_form) == 1 else "the inflected forms are") +
            " replaced by the word the level is missing"] if _form else [])
        + ([("the duplicate is" if len(_dups) == 1 else "the duplicates are") +
            " merged into one card"] if _dups else [])
        + ([("the rest is" if len(REP['dropped']) == 1 else "the others are") +
            " dropped rather than guessed at"] if REP['dropped'] else []))
FAULTS = (f"Of its {REP['raw']} entries, " + _and(_bits) + ". " +
          _and(_did).capitalize() + ". " if _bits else
          f"Its {REP['raw']} entries are all real French words, none printed twice. ")

# WHAT WAS ADDED IS SAID AS PLAINLY AS WHAT WAS REPAIRED, and it is the half a
# reader is likelier to want.  A correction leaves the list the same list; an
# addition does not, and a deck that says "the list is a third party's" and then
# quietly teaches two hundred words the third party never printed has told the
# reader something false about its own scope.  Each group carries the reason it
# was added, which is the same arrangement the faults sentence above uses.
_add = {r: ws for r, ws in (REP.get('added') or {}).items() if ws}
_n_add = sum(len(ws) for ws in _add.values())
# THE WARRANT DIFFERS BY LEVEL AND THE SENTENCE HAS TO FOLLOW IT.  At the lower
# levels the additions are DERIVED — the commonest words in French that no deck
# taught, read off the same frequency list the ordering uses — and at C1 and C2
# they are AUTHORED, because the corpus being counted contains none of the
# register a DALF tests and so no frequency method could have found it.  Written
# flat, one explanation would be false on half the deck.
_DERIVED = ("The page is a frequency cut of a corpus of film and television "
            "subtitles, and a frequency cut has no notion of a paradigm, so the "
            "closed classes come through with holes in them: this deck taught pas "
            "and not ne, and je, tu, il, elle, nous and vous but not on. The "
            "additions are the commonest words in French that no level taught, "
            "read off the same frequency list that orders the cards and then "
            "filtered by hand for the proper nouns, English and swearing a "
            "subtitle corpus is full of. ")
_AUTHORED = ("These are not from the frequency list, because they could not be: "
             "the corpus behind it is film and television dialogue, which "
             "contains almost none of the abstract, argumentative French this "
             "diploma is examined on, so no amount of counting it would turn "
             "them up. They are written in, and every one was looked up before "
             "it was written down — five candidates were dropped for having no "
             "dictionary entry at all rather than being guessed at. ")
ADDED = ('' if not _add else
         f"{_n_add} words are ADDED to it, which is worth saying as plainly as "
         "the corrections, since it changes what the deck covers: "
         + _and(list(_add)) + ". "
         + (_AUTHORED if LEVEL in ('c1', 'c2') else _DERIVED)
         + "Nothing the page prints is displaced, the additions sit in the same "
         "frequency order as the rest, and any of them a lower level already "
         "teaches is dropped. ")

# ------------------------------------------------- the phrases deck's own prose
#
# A SEPARATE DESCRIPTION RATHER THAN A BRANCHED ONE, and the reason is that
# almost nothing in the six levels' paragraph is true here.  It names a diploma
# this deck is not for, a published list this deck does not read, a repair table
# this deck does not have, articles on nouns this deck has none of, and a
# conjugation for every verb where this deck's whole limitation is that it has
# none.  Threading a flag through all of that would leave one sentence in three
# saying "except on the phrases deck", which is how the before-vowel and
# zero-être faults got in.  What IS shared is shared as a variable (EX_NOTE,
# UNIT) so the two cannot come apart about the sentences or the licences.
_REFUSED = REP.get('refused') or {}
# EACH REASON IS A NOUN PHRASE AFTER "N for", which is the shape that survives a
# count of one.  Written as clauses ("N because it is …") the list read "16
# because it is the dictionary's first sense is not the ordinary one", and the
# singular categories would have read "1 because they are a whole sentence" the
# moment a second one was refused.  This file has now made the one-is-not-a-
# plural mistake three times; a form that cannot make it is worth more than a
# form that happens not to today.
_WHY = {
    'sequence': "being an ordinary run of words rather than a unit, or a fragment "
                "of a longer expression that is one",
    'gloss': "leading with a dictionary sense that is not the one you will meet, "
             "where the right one is arguable",
    'duplicate': "repeating an expression already here in another person, or "
                 "saying the same thing as one",
    'sentence': "being a whole sentence rather than an expression",
    'form': "being an inflected form or a bare dictionary lemma",
}
_ref_bits = [f"{len(ws)} for {_WHY[why]}"
             for why, ws in _REFUSED.items() if ws]
_n_ref = sum(len(ws) for ws in _REFUSED.values())
# The written-in meanings are COUNTED rather than named, for the reason every
# other figure in this paragraph is: `phraselist.py` decides how many there are
# and a number typed here would be a stale copy of that decision.
_pgf = lvlf('phrase-glosses.json')
_n_gloss = len(json.load(open(_pgf, encoding='utf-8'))) if os.path.exists(_pgf) else 0

# GUARDED FOR THE SAME REASON `DESC` IS, and it is the same mistake made in the
# other direction: written as a plain assignment this one is built on every
# level too, where `_ref_bits` is empty and `_and([])` dies on an index -- so
# adding the seventh deck broke the six.  Neither paragraph may be evaluated
# except on the deck it is for.
PHRASE_DESC = '' if LEVEL != PHRASES else (
    "Both study directions in one deck: French → English (see the French, recall the meaning) "
    "and English → French (see an English meaning, recall the French). Each direction is a card "
    "of its own with its own schedule, so recognising an expression and producing it are learnt "
    f"separately. {n} set expressions — the things French says as a unit, which a vocabulary "
    "list cannot teach you because they are not words. avoir is on any beginner's list and faim "
    "is on any elementary one; avoir faim is on neither, and no amount of learning the two "
    "halves tells you it means to be hungry rather than to have hunger. The same goes for tout "
    "de suite, du coup, en train de, ça marche and n'importe quoi. "
    "WHERE THESE COME FROM, because unlike the six level decks it is not a published list. "
    "They are Wiktionary's own multi-word French entries: a lexicographer has already judged "
    "that a string is worth an entry of its own, which is better evidence than any rule about "
    "shape or length could be. Compound nouns are left out — pomme de terre and chemin de fer "
    "are words that happen to contain a space, and belong on a vocabulary deck rather than "
    "here — as are the obsolete, the regional and the coarse. "
    f"What was left was ranked by how often it turns up in a corpus of everyday sentences, "
    f"everything above the line was read, and {_n_ref} were refused: "
    + _and(_ref_bits) + ". "
    "The refusals matter because the ranking is a rough guide and not a verdict: counting a "
    "phrase means counting a run of words, so pas que scores high and is almost always je ne "
    "pense pas que, and de par matches de partir. "
    + ('' if not _n_gloss else
       f"Where the right meaning was not in doubt the expression was kept and the meaning "
       f"written in instead, which is what happened to {_n_gloss} of them. ")
    +
    "The cards are ordered roughly by how common the expression is, so the ones you will hear "
    "first come first. Each says what it behaves like — an adverbial phrase, a verbal phrase, "
    "an interjection — which is the one thing about a set expression that its translation does "
    "not tell you. "
    # THE LIMITATION, ON THE FIRST SCREEN.  A reader who has met the level decks
    # will look for the conjugation table and has to be told why there is none,
    # rather than left to conclude the deck forgot.
    "ONE THING THIS DECK DOES NOT DO: a verbal expression carries no conjugation table. "
    "avoir faim is conjugated on avoir and faire la vaisselle on faire, and those verbs are "
    "taught with their full paradigms on the level decks; the dictionary records no forms for "
    "the expressions themselves, and inventing thirty of them per card is not something this "
    "deck will do behind your back. Conjugate the verb you already know and leave the rest of "
    "the expression alone. "
    + ('' if not fems else
       (f"The {fems} adjectival phrases that agree carry their feminines "
        if fems > 1 else "The one adjectival phrase that agrees carries its feminine ")
       + "(tout seul, toute seule). ")
    +
    f"The pronunciation is given in the international phonetic alphabet on the back of every "
    f"card that has one ({ipas} of them), because French spelling does not say how a word "
    "sounds, and there is a speaker button on the expression and on every example sentence. "
    + EX_NOTE +
    "Expressions, meanings and pronunciations: English Wiktionary, via the kaikki.org "
    "extraction (CC BY-SA 4.0). Ordering and example sentences: Tatoeba (tatoeba.org), "
    "CC BY 2.0 FR."
)

# A CONDITIONAL EXPRESSION RATHER THAN TWO STATEMENTS, because the paragraph
# below reads `EXAM[LEVEL]` and `LEVELS_SAID[LEVEL]` and the phrases deck is in
# neither table BY DESIGN -- it is not an exam level and must not be given a row
# that says it is.  Written as two assignments this one still evaluates and dies
# with a KeyError; written this way only the branch that is used is built.
DESC = PHRASE_DESC if LEVEL == PHRASES else (
    "Both study directions in one deck: French → English (see the French, recall the meaning) "
    "and English → French (see an English meaning, recall the French). Each direction is a card "
    "of its own with its own schedule, so recognising a word and producing it are learnt "
    f"separately. {n} words for the {EXAM[LEVEL]} {LEVEL.upper()}, {LEVELS_SAID[LEVEL]} French "
    "diploma "
    "awarded by France Éducation international for the French Ministry of Education. "
    "A NOTE ON THE WORD LIST, because it is not the exam board's. Unlike the Goethe-Institut, "
    f"France Éducation international publishes no vocabulary list for the {EXAM[LEVEL]}: it "
    "publishes a "
    "syllabus of themes — greetings, numbers, the family, nationalities, the date, the weather, "
    "colours, places — and the reference work that turns those into words is a commercially "
    # NO SIZE CLAIM, because nothing here measured one.  This read "a third
    # party's compilation of roughly the right size for C2", which is an
    # assertion about the exam's own scope that the pipeline has no way to
    # check -- and which the C1 and C2 notes below then flatly contradict, the
    # deck and the diploma having been shown not to agree.  What CAN be said is
    # where the list came from.
    "published book. The list here is therefore a third party's compilation, taken from the "
    f"{LEVEL.upper()} page of minddory.com's French "
    "vocabulary lists. It was checked against Wiktionary word by word before anything was "
    f"built. {FAULTS}{ADDED}{LIST_NOTE.get(LEVEL, '')}"
    "The cards are ordered roughly by how common the word is in everyday French, so the words "
    "you meet most often come first: the order is taken from a frequency list built from film "
    "and television subtitles, with a phrase — which a list of single words cannot see — placed "
    f"by how often it turns up in a corpus of everyday sentences. "
    f"Every noun carries its article, so the gender is learnt with the word ({arts} of them), "
    "and the article is coloured by gender: le blue, la red. Where the article elides — "
    f"l'arbre, l'eau, l'école — it hides the very thing it is there to teach, so those {indef} "
    "words also carry un or une, which does not elide. A plural is given where it is irregular "
    f"({plurals} of them: le journal, les journaux), and not where French simply adds -s, which "
    f"is a rule rather than a word to learn. Where a noun names a person its feminine is given "
    f"too ({fems}), read from the dictionary and never derived, since -e only looks like a rule "
    "(le serveur, la serveuse). "
    f"Each of the {verbs} verbs carries its full paradigm: the infinitive, the past participle, "
    "the present participle and the auxiliary it takes, then the présent, the passé composé, the "
    "imparfait, the futur simple and the impératif, each in all six persons from je to "
    "ils/elles. The passé composé is the point — it is how a French speaker talks about the "
    "past, and whether a verb takes avoir or être has to be learnt with the verb"
    # A COUNT OF ZERO IS THE BEFORE-VOWEL FAULT AGAIN, one clause along.  Written
    # flat this read "(0 of them take être)", which is a bracket promising a
    # figure and then saying there is none of it -- and on a deck whose six verbs
    # all take avoir the sentence before it is left teaching a distinction the
    # reader will not meet.  Say which auxiliary they take instead.  It bites at
    # C2 and nowhere else, the être verbs being common ones the lower levels take.
    + (f" ({etre} of them take être)" if etre else
       " — here they all take avoir") +
    ". Agreement is printed the way a textbook prints it, je suis allé(e), so the "
    f"bracket teaches the rule rather than hiding it. {REFL_NOTE}Adjectives carry their "
    f"feminine and their agreement table ({adjs} of them), since French forms the feminine "
    "unpredictably — blanc, blanche; beau, belle; vieux, vieille"
    # A CLAUSE FOR A FEATURE THE DECK HAS NONE OF IS NOT PRINTED.  Written flat
    # it read "the few that change before a vowel carry that form too (0: un bel
    # homme, un vieil ami)", which promises something and then says there is
    # none of it -- shipped on A2 and B1 as well as here.
    + (f" — and the few that change before a vowel carry that form too ({bvow}: un bel "
       "homme, un vieil ami). " if bvow else ". ")
    + f"The pronunciation is given in the international phonetic alphabet on the back of every "
    f"card that has one ({ipas} of them), because French spelling does not say how a word "
    "sounds, and there is a speaker button on the word and on every example sentence. "
    + EX_NOTE +
    f"Word list: the {LEVEL.upper()} list at minddory.com (the list of words only). Meanings, "
    "genders, "
    "plurals, feminines, conjugations and pronunciations: English Wiktionary, via the kaikki.org "
    "extraction (CC BY-SA 4.0). Frequency ordering: a word list built from OpenSubtitles "
    "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), "
    "CC BY 2.0 FR."
)

meta = {
    'id': DECK,
    'title': TITLES[LEVEL],
    'subtitle': (f'{n} expressions · both directions, as two cards each'
                 if LEVEL == PHRASES else
                 f'{n} words · both directions, as two cards per word'),
    'desc': DESC,
    'author': '',
    'language': 'en',
    # A COLOUR OF ITS OWN, because it is not one of the six.  The levels share
    # the DELF's own blue and the shelf paints a row in its deck's colour, so a
    # seventh in that blue would read as a seventh level.  This is the same
    # blue's warm complement, which says "beside them" rather than "after them".
    'color': '#A8541E' if LEVEL == PHRASES else '#14468C',
    'tags': (['french', 'phrases', 'expressions', 'idioms', 'vocabulary']
             if LEVEL == PHRASES else
             ['french', 'delf', LEVEL, 'cefr', 'vocabulary']),
    'glossMode': 'site',
    'types': {
        TYPE_ID: {
            'id': TYPE_ID, 'name': 'French vocabulary', 'speechLang': 'fr-FR',
            'fields': FIELDS,
            'cards': [
                {'name': 'French → English', 'front': FRONT_FR, 'back': BACK_FR},
                {'name': 'English → French', 'front': FRONT_EN, 'back': BACK_EN},
            ],
            'css': CSS,
        },
    },
    'version': 1,
    'createdAt': 1786665600000,
    'updatedAt': 1786665600000,
    'forkedFrom': None,
}

deck = {'folioDeck': 1, 'exportedAt': 1786665600000, 'meta': meta,
        'cards': cards, 'gloss': {}}

# **EVERY ENGLISH SIDE UNIQUE, LAST OF ALL.** A note is asked backwards as well as forwards,
# and that direction is only answerable if its English side names one word -- which across the
# shelf it often did not (French among them). The labelling is a pass over the FINISHED deck for
# `merge-directions.py`'s reason: a third of the shelf was supplied ready-made and nothing here
# can rebuild it, so calling the same pass is what keeps a pipeline run and a shipped file the
# same shape. See `.claude/dedupe-glosses.py`.
import importlib.util as _dgu
_dgp = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py')
_dgs = _dgu.spec_from_file_location('dedupe_glosses', _dgp)
_dg = _dgu.module_from_spec(_dgs)
_dgs.loader.exec_module(_dg)
_dgst = _dg.dedupe(deck, 'French')
if _dgst['groups']:
    print('  labelled %d notes in %d groups that shared an English side' % (_dgst['labelled'], _dgst['groups']))

# **A GENDERED NOUN'S FORMS ARE A TABLE, LAST OF ALL.** `plural`, `feminine` and `a, an` set in
# one horizontal run leaves the reader to work out that two of them differ in NUMBER and two in
# GENDER; as a grid the two axes are the two axes. Another pass over the FINISHED deck, for
# `merge-directions.py`'s reason. See `.claude/gender-tables.py`.
import importlib.util as _gtu
_gtp = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'gender-tables.py')
_gts = _gtu.spec_from_file_location('gender_tables', _gtp)
_gt = _gtu.module_from_spec(_gts)
_gts.loader.exec_module(_gt)
_gtst = _gt.tables(deck)
if _gtst['nouns']:
    print('  gridded %d of %d gendered nouns (%d left as a row)'
          % (_gtst['gridded'], _gtst['nouns'], _gtst['skipped']))

out = os.path.abspath(os.path.join('..', '..', 'decks', DECK_FILES[LEVEL]))
with open(out, 'w', encoding='utf-8') as f:
    json.dump(deck, f, ensure_ascii=False)
print('  wrote', out)
print('  notes', n, '= cards', n * 2, '| articles', arts, '| un/une shown', indef,
      '| irregular plurals', plurals, '| feminines', fems, '| before-vowel', bvow,
      '| verbs', verbs, '(être', etre, ')| adjectives', adjs, '| IPA', ipas,
      '| three examples', ex3, '| none', ex0)
print('  bytes', os.path.getsize(out))
