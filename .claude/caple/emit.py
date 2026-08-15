#!/usr/bin/env python3
"""Write the .folio-deck.json file."""
import json
import os
import re

from caple_level import (LEVEL, EXAM, f as lvlf, TITLES, DECK_IDS, DECK_FILES,
                         BELOW, TARGET)

cards = json.load(open(lvlf('cards.json')))
words = json.load(open(lvlf('wordlist.json')))

TYPE_ID = 'caple'

# ONE NOTE, TWO CARDS.  The word is a single record and the two directions are
# card TEMPLATES, so a corrected gloss is corrected both ways at once and each
# direction still keeps a schedule of its own -- recognising `o frigorífico`
# comes long before producing it.  Card 1 is PORTUGUESE → ENGLISH, the easier
# direction and the one a reader meets first, so it keeps the bare note id.
#
# The alternative is what the DELE decks do, a note per direction, which is two
# records for one word and lets a corrected meaning drift between them.
#
# The headword is plain text with an EMPTY speaker beside it, never inside it:
# `.uc-tts` is a bordered, filled control, so wrapping the word would put the
# thing a reader is trying to recall inside a grey box -- and where the device
# has no speech engine the site hides an empty control outright, so the word
# still reads.
SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '<div class="uc-word">{{Portuguese}}' + SAY + '</div>'
ASK = ('<div class="uc-ask">Say it in Portuguese</div>'
       '<div class="uc-field">{{English}}</div>')

# The plural, the feminine and the comparative sit with the word they belong to,
# above the rule that divides it from its meaning: `o comboio` / `os comboios`
# is one fact in two halves, and a line about the WORD reads better beside the
# word than under the translation of it.
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'

# The sentences come FIRST and the paradigm after: a Portuguese verb's table runs
# to seventy-odd forms -- it has a personal infinitive and a future subjunctive
# that Spanish and French have lost -- and a reader who opens both folds should
# not have to scroll past the whole of it to reach the three sentences that show
# the word in use.
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        # THE SUMMARY IS NOT THE WORD `Conjugation`: the panel carries a noun's
        # plural and an adjective's forms as well, and a heading naming one word
        # class would be wrong on most of the cards that show it.  The FIELD
        # keeps its name, which is what an already-installed copy is keyed on.
        '{{#Conjugation}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Conjugation}}</div></details>{{/Conjugation}}')

FRONT_PT = WORD
BACK_PT = ('{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>'
           + TAIL)
FRONT_EN = ASK
BACK_EN = '{{FrontSide}}<hr>' + WORD + FORMS + TAIL

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
.uc-field {
  display: block;
  width: fit-content;
  /* A FLOOR, because Portuguese's commonest words gloss in one word.  The box
     hugs its contents, which is right for a list of four senses -- and on
     `eu` -> `I` that leaves a narrow stamp adrift in the middle of a 680px card,
     under a rule spanning the whole of it, which reads as a fault rather than a
     design.  min() so a narrow phone still gets the full width. */
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
.uc-sense + .uc-sense {
  margin-top: 9px;
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
.uc-cj-mood {
  margin: 14px 0 8px;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--zh, #C8453C);
}
.uc-cj-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
  gap: 10px 16px;
}
.uc-cj-h {
  margin-bottom: 4px;
  padding-bottom: 3px;
  border-bottom: 1px solid var(--rule, rgba(0,0,0,0.10));
  font-size: 11px;
  font-weight: 600;
  opacity: 0.75;
}
.uc-cj-r {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 1px 0;
}
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
/* THE CLITIC PRONOUN.  It stands where a hyphen used to, so it is carrying
   information the letters no longer carry -- which is why it is a weight as
   well as a colour: on a phone in bright sun, in high-contrast mode, or to a
   reader who cannot separate these two hues, `chamome` with no bold in it is
   just a misspelling.
   VERMILION, on request, where this was indigo for a day.  It is the colour the
   mood headings and the example bolding already use, so the card now says one
   thing in one colour -- and the two cannot be confused for each other, a mood
   heading being 10px letterspaced capitals on a line of its own and the pronoun
   two letters inside a word.  Its own reading is unambiguous on these cards
   whichever hue it takes: only a reflexive verb shows one, and a verb never
   carries the gender-coloured article that is the deck's other use of colour. */
.uc-cl {
  color: var(--zh, #C8453C);
  font-weight: 700;
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

FIELDS = ['Portuguese', 'Word', 'English', 'Forms', 'Conjugation', 'Examples']

n = len(cards)
verbs = sum(1 for c in cards if 'Conjuntivo' in c['fields']['Conjugation'])
paradigms = sum(1 for c in cards if c['fields']['Conjugation'])
arts = sum(1 for c in cards if 'uc-art' in c['fields']['Portuguese'])
pairs = sum(1 for c in cards if ', ' in
            re.sub(r'<[^>]+>', '', c['fields']['Portuguese']))
plurals = sum(1 for c in cards if '>plural<' in c['fields']['Forms'])
refl = sum(1 for c in cards if c['question'].endswith('-se'))
ex3 = sum(1 for c in cards if c['fields']['Examples'].count('uc-exi') == 3)
ex0 = sum(1 for c in cards if not c['fields']['Examples'])

LEVEL_U = LEVEL.upper()
NW = f'{len(words):,}'

# DERIVED FROM `BELOW`, NOT A ROW PER LEVEL.  It was a table keyed by level and
# C1 fell straight through it with a KeyError -- the loud failure, and the good
# one, but a table that has to be extended by hand for every new level is a
# table that will one day be extended wrongly instead of not at all.  The levels
# it names and the total it quotes both come from `caple_level`, so they cannot
# disagree with what the decks actually teach.
_COUNT = {2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six'}
_below = [l.upper() for l in BELOW.get(LEVEL, [])]
if not _below:
    BELOW_NOTE = ''
else:
    _names = (_below[0] if len(_below) == 1
              else ', '.join(_below[:-1]) + ' or ' + _below[-1])
    _total = sum(TARGET[l] for l in BELOW[LEVEL]) + TARGET[LEVEL]
    BELOW_NOTE = (f' None of them appears in the {_names} deck, so the '
                  f'{_COUNT[len(_below) + 1]} together come to {_total:,} words.')

# A word the sentence corpus cannot illustrate is SAID, not swapped out: the
# word list is set by the inventory and by frequency, and dropping a word
# because Tatoeba has no European sentence for it would be letting the corpus
# set the syllabus.  So the count is stated rather than engineered away.
EX_NOTE = ('Every word also carries three real example sentences'
           if ex3 == n else
           f'Real example sentences come with {n - ex0} of the {n} words, three '
           f'apiece for {ex3} of them and one or two for the rest'
           if ex0 else
           f'Every word also carries real example sentences, three of them for '
           f'{ex3} of the {n}')
if ex0:
    EX_NOTE += (f'; the sentence corpus has nothing at all for the remaining '
                f'{ex0}, which are kept because the word list is set by the '
                f'reference inventory and not by the corpus')

DESC = (
    "Both study directions in one deck, as two cards per word: Portuguese → "
    "English (see the Portuguese, recall the meaning) and English → Portuguese "
    "(see an English meaning, recall the Portuguese). "
    f"{NW} words for level {LEVEL_U} of the Common European Framework, which is "
    f"the level of {EXAM[LEVEL]}, the exam awarded by CAPLE — the Centro de "
    "Avaliação de Português Língua Estrangeira at the Universidade de Lisboa."
    + BELOW_NOTE + " "

    "THIS DECK TEACHES EUROPEAN PORTUGUESE. CAPLE sets its exams on the "
    "European standard, so the train is o comboio and the bus o autocarro; the "
    "mood is the conjuntivo and not the subjuntivo; and the first person plural "
    "of the preterite is falámos, not falamos. That choice reaches into every "
    "part of the deck rather than sitting in this description: the frequency "
    "ordering is taken from the European half of the subtitle corpus and not "
    "the Brazilian one, Wiktionary's Brazil-marked verb forms and word senses "
    "are excluded, and example sentences carrying a Brazilian marker are "
    "rejected. Where the reference inventory gives both a European and a "
    "Brazilian word for the same thing — it writes them together, as uma "
    "chávena/xícara de — the deck teaches the European one. "

    "There is no published CAPLE word list — the exam board publishes exam "
    "specifications and no vocabulary inventory — so the words are taken from "
    "the reference description CAPLE's own resources page points at: the "
    f"Referencial Camões PLE, the Instituto Camões' level-by-level account of "
    f"Portuguese, whose {LEVEL_U} inventory of Noções is read for the topical "
    "vocabulary and whose Funções and Gramática sections supply the greetings, "
    "the courtesy formulas and the closed classes that a list of notions names "
    "without ever writing out. Only the inventory of words is taken; none of "
    "the Referencial's own prose appears in this deck. "

    "The cards are ordered roughly by how common the word is in everyday "
    "European Portuguese, so the words you will meet most often come first: the "
    "order comes from a frequency list built from film and television "
    "subtitles, with a reflexive verb placed by the verb it is formed from. "

    f"Every noun carries its article, so the gender is learnt with the word "
    f"({arts} of them), and its plural sits directly beneath it; the article is "
    "coloured for its gender. A noun or adjective with a distinct feminine is "
    f"taught as a pair rather than as two words ({pairs} of them): o professor, "
    "a professora above os professores, as professoras. "

    f"Each of the {verbs} verbs carries its full conjugation — the non-finite "
    "forms, all six simple tenses of the indicative, the three of the "
    "conjuntivo, both imperatives, and the personal infinitive, which is the "
    "one tense Portuguese has that no other Romance language does. Six persons "
    "are shown, from eu to eles; você and vocês are named on the third-person "
    "rows, which is where they take their verb and the single most confusing "
    f"thing about the Portuguese verb for a beginner. The {refl} reflexive "
    "verbs are conjugated the European way, with the pronoun after the verb "
    "rather than in front of it, including the first person plural that drops "
    "its -s before -nos and the future and conditional, where the pronoun goes "
    "inside the verb. The pronoun is picked out in colour so its three "
    "positions can be seen at a glance; in ordinary writing it is joined to the "
    "verb with hyphens, as chamo-me, levanta-te, chamamo-nos and chamar-me-ei. "

    + EX_NOTE +
    ", chosen where possible to show three different inflected forms rather "
    "than the same one three times, with the word picked out in colour and a "
    "speaker beside it. Tatoeba's Portuguese is overwhelmingly Brazilian, so "
    "sentences carrying a Brazilian marker are rejected outright; what remains "
    "is mostly variety-neutral rather than positively European, which is a "
    "limit of the corpus and not something the filter can repair. "

    "Word list: Referencial Camões PLE (instituto-camoes.pt). Meanings, "
    "genders, plurals and conjugations: English Wiktionary, via the kaikki.org "
    "extraction (CC BY-SA 4.0). Frequency ordering: a word list built from "
    "OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA 4.0). Example "
    "sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR."
)

meta = {
    'id': DECK_IDS[LEVEL],
    'title': TITLES[LEVEL],
    'subtitle': f'{NW} words · European Portuguese · both directions',
    'desc': DESC,
    'author': '',
    'language': 'en',
    'tags': ['portuguese', 'european portuguese', 'caple',
             EXAM[LEVEL].lower(), LEVEL, 'cefr', 'vocabulary'],
    'glossMode': 'site',
    'types': {
        TYPE_ID: {
            'id': TYPE_ID,
            'name': 'Portuguese vocabulary',
            # European Portuguese, so the voice is pt-PT and not pt-BR.  A
            # device with only a Brazilian voice will use it; the tag is what
            # asks for the right one where there is a choice.
            'speechLang': 'pt-PT',
            'fields': FIELDS,
            'cards': [
                {'name': 'Portuguese → English', 'front': FRONT_PT, 'back': BACK_PT},
                {'name': 'English → Portuguese', 'front': FRONT_EN, 'back': BACK_EN},
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

# stages run with the cache as the working directory: .claude/caple-cache/
out = os.path.abspath(os.path.join('..', '..', 'decks', DECK_FILES[LEVEL]))
with open(out, 'w', encoding='utf-8') as f:
    json.dump(deck, f, ensure_ascii=False)
print('  wrote', out)
print(f'  notes {n}  (x2 cards)   verbs with a paradigm {paradigms}'
      f'   nouns with an article {arts}   pairs {pairs}   reflexives {refl}')
print(f'  examples: three {ex3}, none {ex0}')
print('  bytes', os.path.getsize(out))
