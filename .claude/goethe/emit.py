#!/usr/bin/env python3
"""Write the .folio-deck.json file."""
import json, os, re
from collections import Counter

from goethe_level import LEVEL, f as lvlf, TITLES, DECK_IDS, DECK_FILES, WORTLISTE

cards = json.load(open(lvlf('cards.json')))
entries = json.load(open(lvlf('entries.json')))

TYPE_ID = 'goethe'

# ONE NOTE, TWO CARDS.  The word is a single record and the two directions are
# card TEMPLATES, so a corrected gloss is corrected both ways at once and each
# direction still keeps a schedule of its own -- recognising `die Entschuldigung`
# comes long before producing it.  Card 1 is GERMAN → ENGLISH, the easier
# direction and the one a reader meets first, so it keeps the bare note id.
#
# The headword is plain text with an EMPTY speaker beside it, never inside it:
# `.uc-tts` is a bordered, filled control, so wrapping the word would put the
# thing a reader is trying to recall inside a grey box -- and where the device
# has no speech engine the site hides an empty control outright, so the word
# still reads.
SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '<div class="uc-word">{{German}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in German</div><div class="uc-field">{{English}}</div>'

# The plural, the feminine and the comparative sit with the word they belong to,
# above the rule that divides it from its meaning: `das Haus` / `die Häuser` is
# one fact in two halves, and a line about the WORD reads better beside the word
# than under the translation of it.
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'

# The sentences come FIRST and the paradigm after: a German verb's table runs to
# thirty-odd forms, and a reader who opens both folds should not have to scroll
# past the whole of it to reach the three sentences that show the word in use.
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        # THE SUMMARY IS NOT THE WORD `Conjugation`, because the panel is no
        # longer a verb's alone: a noun's declension and an adjective's three
        # paradigms open in the same place, and a heading naming one word class
        # would be wrong on most of the cards that carry it.  The FIELD keeps its
        # name, which is what every already-installed copy of this deck is keyed
        # on and what `check-goethe.js` reads.
        '{{#Conjugation}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Conjugation}}</div></details>{{/Conjugation}}')

FRONT_DE = WORD
BACK_DE = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
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
.uc-n {
  color: var(--good, #3F7D50);
}
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
}
.uc-field {
  display: block;
  width: fit-content;
  /* A FLOOR, because German's commonest words gloss in one word.  The box hugs its
     contents -- the Mandarin decks' shape, and right for a list of four senses --
     and on `ich` -> `I` that left an 80px stamp adrift in the middle of a 680px
     card, under a rule spanning the whole of it, which reads as a fault rather
     than a design.  min() so a narrow phone still gets the full width. */
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
  grid-template-columns: repeat(auto-fit, minmax(158px, 1fr));
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
/* A DECLENSION IS A GRID AND A CONJUGATION IS A LIST, which is why the panel
   holds two shapes rather than one.  A verb's tense is a column of person and
   form; a noun's or an adjective's paradigm is CASE against NUMBER or GENDER,
   and flattening that into label/value pairs loses the thing the table is for.
   The columns are sized off `--uc-dtc` so one rule serves the noun's two and the
   adjective's four; `minmax(0,1fr)` because a cell holding `des Krankenhauses`
   would otherwise claim its own intrinsic width and push the grid wider than
   the card.  A wide paradigm scrolls inside its own block rather than widening
   the card, which is the site's own rule for a wide table. */
.uc-dtg {
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}
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
/* `minmax(min-content, 1fr)` AND NOT `minmax(0, 1fr)`, which is the whole of why
   this table works on a phone.  A zero floor lets a track shrink below the word
   in it, and because a cell is `nowrap` the cells then OVERLAP rather than
   overflowing -- so the row stays inside the card, `overflow-x` finds nothing to
   scroll, and a 390px screen showed `ein wirklicheeine wirklicheein
   wirklicheswirklichen`.  A min-content floor makes the grid as wide as its
   widest cell, which pushes it past the card and hands it to the scroller above.
   Found by looking at the card at 390px; every assertion passed throughout,
   because the fault was in the layout and not in the markup. */
.uc-dt1 .uc-dtr {
  grid-template-columns: 62px minmax(min-content, 1fr);
}
.uc-dt2 .uc-dtr {
  grid-template-columns: 62px repeat(2, minmax(min-content, 1fr));
}
.uc-dt3 .uc-dtr {
  grid-template-columns: 58px repeat(3, minmax(min-content, 1fr));
}
.uc-dt4 .uc-dtr {
  grid-template-columns: 58px repeat(4, minmax(min-content, 1fr));
}
/* a four-column paradigm needs the panel's whole width, so it opts out of the
   two-up grid rather than being squeezed into half of it */
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

FIELDS = ['German', 'Word', 'English', 'Forms', 'Conjugation', 'Examples']

DECK = DECK_IDS[LEVEL]
for i, c in enumerate(cards, 1):
    c['id'] = f'u_{DECK}_{i}'
    c['type'] = TYPE_ID

# ---------------------------------------------------------------- the numbers
n = len(cards)
nouns = sum(1 for c in cards if 'noun' in c['fields']['English'])
# the panel is no longer a verb's alone, so count what it actually holds:
# a verb's tenses, a noun's declension, an adjective's three paradigms
paradigms = sum(1 for c in cards if c['fields']['Conjugation'])
verbs = sum(1 for c in cards if 'Präteritum' in c['fields']['Conjugation'])
plurals = sum(1 for c in cards if '>plural<' in c['fields']['Forms'])
fems = sum(1 for c in cards if '>feminine<' in c['fields']['Forms'])
comps = sum(1 for c in cards if '>comparative<' in c['fields']['Forms'])
arts = sum(1 for c in cards if 'uc-art' in c['fields']['German'])
sep = sum(1 for c in cards if re.search(r'uc-cj-f">\w+ (?:ab|an|auf|aus|ein|mit|nach|vor|zu|zurück|fern|los|weiter|weg|her|hin)<',
                                        c['fields']['Conjugation']))
refl = sum(1 for e in entries if e['reflexive'])
ex3 = sum(1 for c in cards if c['fields']['Examples'].count('uc-exi') == 3)
ex0 = sum(1 for c in cards if not c['fields']['Examples'])
groups = sum(1 for e in entries if e['group'])

# A word the sentence corpus cannot illustrate is SAID, not swapped out: the
# word list is the exam board's and dropping a word because Tatoeba has no
# sentence for it would let the corpus set the syllabus.
EX_NOTE = ('Every word also carries three real example sentences'
           if ex3 == n else
           f'Real example sentences come with {n - ex0} of the {n} words, three apiece for '
           f'{ex3} of them and one or two for the rest'
           + (f'; the sentence corpus has nothing at all for the other {ex0}, which are kept '
              'because the word list is set by the exam board and not by the corpus' if ex0 else ''))

DESC = (
    "Both study directions in one deck: German → English (see the German, recall the meaning) "
    "and English → German (see an English meaning, recall the German). Each direction is a card "
    f"of its own with its own schedule, so recognising a word and producing it are learnt "
    f"separately. {n} words for the Goethe-Zertifikat A1: Start Deutsch 1, the German "
    "qualification awarded by the Goethe-Institut. "
    "The vocabulary is the exam board's own published word list, read out of the Wortliste the "
    "Goethe-Institut prints for that exam: its alphabetical list of about 650 words, including "
    "the derivable sub-entries it marks (das Ende under enden, die Antwort under antworten), "
    f"plus the {groups} words of its Wortgruppenliste — the numbers, the days, the months, the "
    "seasons, the colours, the compass points and the units — which the alphabet leaves out, so "
    "that a deck built from the list alone would have no word for Monday in it. "
    "The cards are ordered roughly by how common the word is in everyday German, so the words "
    "you meet most often come first: the order is taken from a frequency list built from film "
    "and television subtitles, with a phrase — which a list of single words cannot see — placed "
    "by how often it turns up in a corpus of everyday sentences. "
    f"Every noun carries its article, so the gender is learnt with the word ({arts} of them), and "
    "the article is coloured by gender: der blue, die red, das green. Its plural sits directly "
    f"beneath it ({plurals} of them). Where a noun names a person its feminine is given too "
    f"({fems}), on the exam board's own instruction that beside der Lehrer, die Lehrerin is part "
    "of the required vocabulary even though the list does not print it. "
    f"Each of the {verbs} verbs carries its full paradigm: the infinitive, the past participle "
    "and the auxiliary it takes, then the present, the Präteritum, the Perfekt and the "
    "imperative, each in all six persons from ich to sie/Sie. The Perfekt is the point — it is "
    "how a German speaker talks about the past, and whether a verb takes haben or sein has to be "
    f"learnt with the verb. A separable verb is shown as it is really said, ich fahre ab rather "
    f"than ich abfahre, and the {refl} reflexive verbs carry their pronouns (ich freue mich, du "
    "freust dich). The polite imperative is given as well as the du and ihr forms: seien Sie "
    f"ruhig, fahren Sie ab. Adjectives carry their comparative and superlative ({comps} of them), "
    "since German umlauts them unpredictably — groß, größer, am größten. "
    + EX_NOTE +
    ", chosen where possible to show three different inflected forms rather than the same one "
    "three times, with the word picked out in colour and a speaker beside it. "
    "Word list: Goethe-Zertifikat A1 Start Deutsch 1 Wortliste (goethe.de) — the list of words "
    "only; the example sentences printed beside them in that document are the Goethe-Institut's "
    "own and are not reproduced here. Meanings, genders, plurals, feminines and conjugations: "
    "English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency ordering: a word "
    "list built from OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: "
    "Tatoeba (tatoeba.org), CC BY 2.0 FR."
)

meta = {
    'id': DECK,
    'title': TITLES[LEVEL],
    'subtitle': f'{n} words · both directions, as two cards per word',
    'desc': DESC,
    'author': '',
    'language': 'en',
    'color': '#8A5A2B',
    'tags': ['german', 'goethe', LEVEL, 'cefr', 'vocabulary'],
    'glossMode': 'site',
    'types': {
        TYPE_ID: {
            'id': TYPE_ID, 'name': 'German vocabulary', 'speechLang': 'de-DE',
            'fields': FIELDS,
            'cards': [
                {'name': 'German → English', 'front': FRONT_DE, 'back': BACK_DE},
                {'name': 'English → German', 'front': FRONT_EN, 'back': BACK_EN},
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

out = os.path.abspath(os.path.join('..', '..', 'decks', DECK_FILES[LEVEL]))
with open(out, 'w', encoding='utf-8') as f:
    json.dump(deck, f, ensure_ascii=False)
print('  wrote', out)
print('  notes', n, '= cards', n * 2, '| nouns with an article', arts, '| plurals', plurals,
      '| feminines', fems, '| verbs', verbs, '| paradigm panels', paradigms,
      '| comparatives', comps,
      '| three examples', ex3, '| none', ex0)
print('  bytes', os.path.getsize(out))
