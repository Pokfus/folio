#!/usr/bin/env python3
"""Write the .folio-deck.json file."""
import json, os, re

from cils_level import LEVEL, f as lvlf, TITLES, DECK_IDS, DECK_FILES, LIST_URL

cards = json.load(open(lvlf('cards.json')))
entries = json.load(open(lvlf('entries.json')))

TYPE_ID = 'cils'

# ONE NOTE, TWO CARDS.  The word is a single record and the two directions are
# card TEMPLATES, so a corrected gloss is corrected both ways at once and each
# direction still keeps a schedule of its own -- recognising `la valutazione`
# comes long before producing it.  Card 1 is ITALIAN → ENGLISH, the easier
# direction and the one a reader meets first, so it keeps the bare note id.
#
# The headword is plain text with an EMPTY speaker beside it, never inside it:
# `.uc-tts` is a bordered, filled control, so wrapping the word would put the
# thing a reader is trying to recall inside a grey box -- and where the device
# has no speech engine the site hides an empty control outright, so the word
# still reads.  `data-say` carries the noun WITH its article, which is how the
# word is said and how it has to be learnt.
SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '<div class="uc-word">{{Italian}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Italian</div><div class="uc-field">{{English}}</div>'

# The plural, the feminine and the indefinite article sit with the word they
# belong to, above the rule that divides it from its meaning: `lo studente` /
# `gli studenti` is one fact in two halves, and a line about the WORD reads
# better beside the word than under the translation of it.
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'

# The sentences come FIRST and the paradigm after: an Italian verb's table runs
# to forty-odd forms, and a reader who opens both folds should not have to
# scroll past the whole of it to reach the three sentences that show the word
# in use.
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Conjugation}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Conjugation}}</div></details>{{/Conjugation}}')

FRONT_IT = WORD
BACK_IT = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
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
/* THE ARTICLE IS COLOURED BY THE GENDER IT MARKS, which is the one thing `l'`
   cannot say on its own -- `l'amico` and `l'amica` are spelled alike.  The
   plural on the line below says it too (`gli amici` against `le amiche`); this
   says it at a glance.  Two colours only: Italian has no neuter. */
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
  /* A FLOOR, because Italian's commonest words gloss in one word.  The box hugs
     its contents, and on `io` -> `I` that leaves a narrow stamp adrift in the
     middle of a 680px card under a rule spanning the whole of it, which reads
     as a fault rather than a design.  min() so a narrow phone still gets the
     full width. */
  min-width: min(300px, 100%);
  max-width: 100%;
  margin: 14px auto 0;
  padding: 11px 15px;
  border: 1px solid var(--rule, rgba(0,0,0,0.12));
  border-radius: 11px;
  text-align: left;
  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));
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
.uc-fold > summary {
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.6;
}
.uc-conj {
  margin-top: 10px;
}
/* THE PARADIGM IS A GRID OF BLOCKS, not one long column.  An Italian verb has
   seven tenses of six persons each, which stacked is a card six screens tall;
   two-up it is two.  `minmax(0,1fr)` because a cell holding `avremmo parlato`
   would otherwise claim its own intrinsic width and push the grid wider than
   the card. */
.uc-cjg {
  display: grid;
  gap: 12px 18px;
  grid-template-columns: repeat(auto-fit, minmax(min(210px, 100%), 1fr));
}
.uc-cj {
  min-width: 0;
}
.uc-cjh {
  padding-bottom: 3px;
  border-bottom: 1px solid var(--rule, rgba(0,0,0,0.10));
  font-size: 9.5px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  opacity: 0.5;
}
.uc-cjr {
  display: flex;
  gap: 10px;
  align-items: baseline;
  padding: 1.5px 0;
  font-size: 14px;
}
.uc-cj-p {
  flex: 0 0 auto;
  opacity: 0.55;
}
.uc-cj-f {
  flex: 1 1 auto;
  text-align: right;
  font-weight: 500;
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

FIELDS = ['Italian', 'Word', 'English', 'Forms', 'Conjugation', 'Examples']

DECK = DECK_IDS[LEVEL]
for i, c in enumerate(cards, 1):
    c['id'] = f'u_{DECK}_{i}'
    c['type'] = TYPE_ID

# ---------------------------------------------------------------- the numbers
n = len(cards)


def is_pos(c, name):
    """Whether the card's part-of-speech label opens on this word.

    COUNTED OFF THE LABEL, not off the presence of a form, because a noun and
    an adjective both emit a `plural` row: counting `>plural<` across every card
    put 526 in the description where 362 nouns have one, and 117 feminines where
    11 nouns do.  Both figures are shown to the reader, so both were wrong on
    the page and nowhere else.
    """
    return f'<div class="uc-pos">{name}' in c['fields']['English']


nouns = [c for c in cards if is_pos(c, 'noun')]
adj_cards = [c for c in cards if is_pos(c, 'adjective')]

# **WHAT THE DESCRIPTION SAYS ABOUT THE BAND IS MEASURED FROM THE BAND**, since
# the same prose ships on all six.  Written for A1 it named that band's own
# oddities and its own De Mauro figure -- so the A2 deck went out saying "the A1
# band", quoting `amministrativo` (which is not in it) and reporting 934 of 961
# under a heading reading 995 words.  Every one of those is a sentence about a
# deck other than the one being read.
#
# `entries` is in the order the cards are dealt, so its tail is literally what a
# reader meets last; proper nouns are skipped because a place name says nothing
# about the band's difficulty.  The De Mauro membership is measured in `select`,
# which is where the reference is read, and carried on the entry.
tail_words = ', '.join(e['display'] for e in
                       [x for x in entries if x['pos'] != 'name'][-3:])
nvdb_n = sum(1 for e in entries if e.get('nvdb'))
arts = sum(1 for c in cards if 'uc-art' in c['fields']['Italian'])
plurals = sum(1 for c in nouns if '>plural<' in c['fields']['Forms'])
fems = sum(1 for c in nouns if '>feminine<' in c['fields']['Forms'])
verbs = sum(1 for c in cards if 'Passato prossimo' in c['fields']['Conjugation'])
paradigms = sum(1 for c in cards if c['fields']['Conjugation'])
ess = sum(1 for c in cards if 'ausiliare</span><span class="uc-cj-f">essere' in c['fields']['Conjugation'])
adjs = len(adj_cards)
adjforms = sum(1 for c in adj_cards if c['fields']['Forms'])
ex3 = sum(1 for c in cards if c['fields']['Examples'].count('uc-exi') == 3)
ex0 = sum(1 for c in cards if not c['fields']['Examples'])

# A word the sentence corpus cannot illustrate is SAID, not swapped out: the
# word list is the list, and dropping a word because Tatoeba has no sentence for
# it would let the corpus set the vocabulary.
EX_NOTE = ('Every word also carries three real example sentences'
           if ex3 == n else
           f'Real example sentences come with {n - ex0} of the {n} words, three apiece for '
           f'{ex3} of them and one or two for the rest'
           + (f'; the sentence corpus has nothing at all for the other {ex0}, which are kept '
              'because the word list is what it is and not what the corpus can illustrate'
              if ex0 else ''))

DESC = (
    "Both study directions in one deck: Italian → English (see the Italian, recall the meaning) "
    "and English → Italian (see an English meaning, recall the Italian). Each direction is a card "
    "of its own with its own schedule, so recognising a word and producing it are learnt "
    f"separately. {n} Italian words, for anyone working towards the CILS certification awarded by "
    "the Università per Stranieri di Siena — or towards Italian generally. "
    "WHERE THE WORDS COME FROM, plainly, because it is not what a deck named after an exam "
    "usually means: CILS does not publish a vocabulary list. What the Università per Stranieri "
    "di Siena publishes for each level is a syllabus of grammar and functions — the tenses, the "
    "sentence types, the things a candidate must be able to do — and for vocabulary it asks only "
    "for a basic repertoire suited to everyday situations. There is therefore no official list to "
    f"read, and the words here are a third party's: the {LEVEL.upper()} band of MindDory's Italian "
    f"vocabulary list ({LIST_URL[LEVEL]}), which sorts about 7,200 Italian words into six "
    "CEFR-labelled bands. Those bands are a frequency gradient rather than a graded syllabus, so "
    f"this one carries words a learner at this level would not meet early — {tail_words} are among "
    "the last it deals — while leaving out some they would meet at once, including the greetings. "
    f"What can be said for it is that the words are real and central: {nvdb_n} of the {n} are in "
    "De Mauro's nuovo vocabolario di base, the standard reference for the core of the language. "
    "SO THE ORDER IS DOING THE WORK. The cards are dealt by how common the word actually is in "
    "everyday spoken Italian, taken from a frequency list built from film and television "
    "subtitles, so you meet essere, avere, fare, dire and andare in the first handful and the "
    "administrative vocabulary near the end. "
    f"Every noun carries its definite article, so the gender is learnt with the word ({arts} of "
    "them), and the article is coloured by gender: masculine blue, feminine red. That article is "
    "worth learning as a rule and not as a fact, because Italian picks it by spelling as well as "
    "by gender — il libro but lo studente, lo zio, lo psicologo, and l'amico before a vowel — so "
    f"the deck shows the one each word actually takes. The plural comes with its own article "
    f"({plurals} of them), which is the only place a vowel-initial noun's gender is legible at "
    "all: l'amico and l'amica look alike, gli amici and le amiche do not. The indefinite article "
    f"is given too, since un amico takes no apostrophe and un'amica does. Where a noun names a "
    f"person its feminine is shown ({fems}). "
    f"Each of the {verbs} verbs carries its full paradigm: the infinitive, the past participle, "
    "the gerund and the auxiliary it takes, then the presente, the passato prossimo, the "
    "imperfetto, the futuro, the condizionale, the congiuntivo and the imperativo, each in all "
    "six persons from io to loro. The passato prossimo is the point — it is how Italian talks "
    f"about the past, and whether a verb takes essere or avere has to be learnt with the verb "
    f"({ess} of them take essere). Where it takes essere the participle is shown agreeing, sono "
    "andato/a and siamo andati/e, which is the half that gets forgotten. "
    f"Adjectives carry their feminine and their plurals ({adjforms} of the {adjs} of them), "
    "since an Italian adjective agrees with what it describes. "
    + EX_NOTE +
    ", chosen where possible to show three different inflected forms rather than the same one "
    "three times, with the word picked out in colour and a speaker beside it. "
    f"Word list: MindDory Italian vocabulary list, {LEVEL.upper()} band — the list of words only. Meanings, "
    "genders, plurals, feminines and conjugations: English Wiktionary, via the kaikki.org "
    "extraction (CC BY-SA 4.0). Frequency ordering: a word list built from OpenSubtitles "
    "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), "
    "CC BY 2.0 FR. The core-vocabulary check quoted above: Tullio De Mauro, nuovo vocabolario di "
    "base della lingua italiana (2016), via the public-domain extraction at pettarin/nvdb."
)

meta = {
    'id': DECK,
    'title': TITLES[LEVEL],
    'subtitle': f'{n} words · both directions, as two cards per word',
    'desc': DESC,
    'author': '',
    'language': 'en',
    'color': '#2A6A4B',
    'tags': ['italian', 'cils', LEVEL, 'cefr', 'vocabulary'],
    'glossMode': 'site',
    'types': {
        TYPE_ID: {
            'id': TYPE_ID, 'name': 'Italian vocabulary', 'speechLang': 'it-IT',
            'fields': FIELDS,
            'cards': [
                {'name': 'Italian → English', 'front': FRONT_IT, 'back': BACK_IT},
                {'name': 'English → Italian', 'front': FRONT_EN, 'back': BACK_EN},
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
print('  notes', n, '= cards', n * 2, '| nouns', len(nouns), '(', arts, 'with an article,',
      plurals, 'with a plural,', fems, 'with a feminine ) | verbs', verbs,
      '(essere', str(ess) + ') | paradigm panels', paradigms, '| adjectives', adjs,
      '(', adjforms, 'with their forms ) | three examples', ex3, '| none', ex0)
print('  bytes', os.path.getsize(out))
