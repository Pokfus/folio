#!/usr/bin/env python3
"""Write the .folio-deck.json file."""
import json, time
from dele_level import LEVEL, f as lvlf, TITLES, DECK_IDS, DECK_FILES

cards = json.load(open(lvlf('cards.json')))
words = json.load(open(lvlf('wordlist.json')))

# Templates.  A conjugation table cannot be a <table>: the deck sanitizer's tag
# allowlist has no table/tr/td, and an unknown tag is UNWRAPPED, so the whole
# paradigm would arrive as one run-on line of words.  It is a CSS grid of divs.
# The word is set as plain text with an EMPTY speaker beside it, not inside it.
# `.uc-tts` is a bordered, filled control, so wrapping the headword put the word
# a reader is trying to recall inside a grey box; and where the device has no
# speech engine the site hides an empty control outright, so the word still reads.
FRONT_ES = ('<div class="uc-word">{{Spanish}}'
            '<span class="uc-tts uc-say" data-say="{{Word}}"></span></div>')
FRONT_EN = '<div class="uc-ask">Say it in Spanish</div><div class="uc-field">{{English}}</div>'

# The plural sits with the singular it belongs to, above the rule that divides
# the word from its meaning -- `el otono` / `los otonos` is one fact in two
# halves, and a line about the word read better beside the word than under the
# translation of it.
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'

# The sentences come FIRST and the paradigm after it.  A verb's conjugation runs
# to seventy-odd forms, so a reader who opens both folds has to scroll past the
# whole of it to reach the three sentences that show the word being used -- and
# the sentences are the part a beginner reads.
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Conjugation}}<details class="uc-fold"><summary>Conjugation</summary>'
        '<div class="uc-conj">{{Conjugation}}</div></details>{{/Conjugation}}')

BACK_ES = ('{{FrontSide}}' + FORMS +
           '<hr><div class="uc-field">{{English}}</div>' + TAIL)
BACK_EN = ('{{FrontSide}}<hr>'
           '<div class="uc-word">{{Spanish}}'
           '<span class="uc-tts uc-say" data-say="{{Word}}"></span></div>'
           + FORMS + TAIL)

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
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
}
.uc-field {
  display: block;
  width: fit-content;
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
  margin-top: 7px;
  font-size: 14px;
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
  grid-template-columns: repeat(auto-fit, minmax(152px, 1fr));
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

FIELDS_ES = ['Spanish', 'Word', 'English', 'Forms', 'Conjugation', 'Examples']
FIELDS_EN = ['English', 'Spanish', 'Word', 'Forms', 'Conjugation', 'Examples']

nverbs = sum(1 for c in cards if c['sub'].startswith('Spanish') and c['fields']['Conjugation'])
nrefl = sum(1 for c in cards if c['sub'].startswith('Spanish')
            and c['fields']['Spanish'].endswith(('arse', 'erse', 'irse')))
n3 = sum(1 for c in cards if c['sub'].startswith('Spanish')
         and c['fields']['Examples'].count('uc-exi') == 3)
ntot = sum(1 for c in cards if c['sub'].startswith('Spanish'))
n0 = sum(1 for c in cards if c['sub'].startswith('Spanish') and not c['fields']['Examples'])
# A word the sentence corpus cannot illustrate is SAID, not swapped out: the
# word list is chosen by the inventory and by frequency, and dropping `matizar`
# because Tatoeba has no sentence for it would be letting the corpus set the
# syllabus.  So the count is stated rather than engineered away.
# The noun, and the reason a covered item can still have no sentence, both
# differ for the phrases deck -- whose list IS set by the corpus, so "the word
# list is set by the exam board and not by the corpus" would be flatly untrue
# there.  What is true is that the two corpus passes ask different questions: a
# phrase is RANKED on how often it turns up in Spanish sentences and ILLUSTRATED
# only from the ones that carry an aligned English translation, so a common
# phrase can still have nothing to show.
_ITEM = 'phrases' if LEVEL == 'ph' else 'words'
_KEPT = (' because a phrase is ranked on how often it appears in Spanish and illustrated only '
         'from the sentences that carry an English translation beside them, and the two are not '
         'the same set'
         if LEVEL == 'ph' else
         ' because the word list is set by the exam board and not by the corpus')
_ONE = 'phrase' if LEVEL == 'ph' else 'word'
EX_NOTE = (f'Every {_ONE} also carries three real example sentences'
           if n3 == ntot else
           f'Every {_ONE} also carries real example sentences, three of them for {n3} of the '
           f'{ntot} and one or two where the corpus had no more'
           if not n0 else
           f'Real example sentences come with {ntot - n0} of the {ntot} {_ITEM}, three apiece for '
           f'{n3} of them and one or two for the rest; the sentence corpus has nothing at all for '
           f'the remaining {n0}, which are kept' + _KEPT)
narts = sum(1 for c in cards if c['sub'].startswith('Spanish')
            and c['fields']['Spanish'].split(' ')[0] in ('el', 'la', 'los', 'las', 'el/la', 'los/las'))
npairs = sum(1 for c in cards if c['sub'].startswith('Spanish')
             and ', ' in c['fields']['Spanish'])

LEVEL_U = LEVEL.upper()
NWORDS = len(words)
NW = f'{NWORDS:,}'
BELOW_NOTE = {
    'a1': '',
    'a2': ' None of them appears in the A1 deck, so the two together come to 1,000 words.',
    'b1': ' None of them appears in the A1 or A2 deck, so the three together come to 2,000 words.',
    'b2': ' None of them appears in the A1, A2 or B1 deck, so the four together come to 4,000 words.',
    'c1': ' None of them appears in the A1, A2, B1 or B2 deck, so the five together come to 6,000 '
          'words.',
    'c2': ' None of them appears in the A1, A2, B1, B2 or C1 deck, so the six together come to '
          '8,000 words.',
    'ph': '',
}[LEVEL]
COLUMN_NOTE = f'the {LEVEL_U} column'
PAIRED_WITH = ('A1 and A2' if LEVEL in ('a1', 'a2') else
               'B1 and B2' if LEVEL in ('b1', 'b2') else 'C1 and C2')
CLOSED_NOTE = (
    "Those inventories list topics rather than words, so the closed classes they name without "
    "writing out — the numbers, the days, the months, the seasons, and the pronouns, articles, "
    "prepositions and conjunctions that are inventoried separately under Gramática — are "
    "supplied here, and the rest of the 500 is filled from the A1 column in order of frequency. "
    if LEVEL == 'a1' else
    "Those inventories list topics rather than words, and the grammar layer is inventoried "
    "separately under Gramática, so the connectives, comparatives and everyday verbs an A2 "
    "candidate is expected to have are supplied here; the rest of the 500 is filled from the A2 "
    "column in order of frequency. "
    if LEVEL == 'a2' else
    "Those inventories list topics rather than words, and what they cannot carry at this level is "
    "the discourse layer — the connectives and markers a B1 candidate is expected to join an "
    "argument with, inventoried separately under Gramática and Tácticas pragmáticas — so those are "
    "supplied here, several of them as the phrases they are (sin embargo, a pesar de, de vez en "
    f"cuando); the rest of the {NW} is filled from the B1 column in order of frequency. "
    if LEVEL == 'b1' else
    "Those inventories list topics rather than words, and what they cannot carry at this level is "
    "the layer that STRUCTURES an argument — the connectives that concede, contrast, qualify and "
    "conclude, inventoried separately under Gramática and Tácticas pragmáticas — so those are "
    "supplied here, most of them as the phrases they are (por consiguiente, aun cuando, en la "
    f"medida en que, a diferencia de); the rest of the {NW} is filled from the B2 column in order "
    "of frequency. "
    if LEVEL == 'b2' else
    # At C1 and C2 the supplement has nothing left to add, and that is a fact
    # about the levels rather than an omission: the closed classes, the
    # comparatives and the whole connective layer are taught by A1 to B2, so
    # anything the earlier supplements carry is already excluded as taught. The
    # C columns are large enough to fill the level several times over on their
    # own -- 6,011 and 6,497 candidate lemmas against the 2,000 taken.
    "Those inventories carry this level on their own: by C1 the closed classes, the comparatives "
    "and the connectives that structure an argument have all been taught by the levels below, so "
    f"nothing has to be supplied from outside the column and the whole {NW} is filled from it in "
    "order of frequency. ")

PHRASE_DESC = (
    "Both study directions in one deck, as subdecks you can add and study separately: "
    "Spanish → English (see the Spanish, recall the meaning) and English → Spanish "
    f"(see an English meaning, recall the Spanish). {NW} set phrases and fixed expressions — the "
    "ones whose meaning is not the sum of their parts, or which are fixed enough to be looked up: "
    "echar de menos, a lo mejor, dar igual, por si acaso. "
    "There is no published list of the expressions a learner should know, the way there is for the "
    "DELE vocabulary, so inventing one would be asserting a syllabus rather than reporting one. "
    "The candidates are instead every MULTI-WORD entry in the Spanish Wiktionary: a dictionary "
    "gives a string of words an entry only when it is an expression in its own right, so echar de "
    "menos has one and comer pan does not. "
    "Which of them are COMMON is then measured rather than asserted, because a dictionary records "
    "an expression whether it is said every day or twice a century: each one is counted in a "
    "corpus of everyday sentences, anything the corpus never says is dropped whatever its entry "
    f"looks like, and the {NW} shipped are the top of that count — so the cards run from the "
    "expressions you will hear today to the ones you will meet occasionally. "
    "None of them appears in the six DELE decks, which teach their own multi-word items, so the "
    "seven can be studied together without teaching anything twice. "
    + EX_NOTE +
    ", with the expression picked out in colour and a speaker beside it. "
    "Meanings: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Example sentences "
    "and the frequency count behind the ordering: Tatoeba (tatoeba.org), CC BY 2.0 FR."
)

DESC = (
    "Both study directions in one deck, as subdecks you can add and study separately: "
    "Spanish → English (see the Spanish, recall the meaning) and English → Spanish "
    f"(see an English meaning, recall the Spanish). {NW} words for level {LEVEL_U} of the DELE, the "
    f"Spanish qualification awarded by the Instituto Cervantes.{BELOW_NOTE} "
    "There is no official published DELE word list, so the vocabulary is taken from the body that "
    f"sets the exam: {COLUMN_NOTE} of the Instituto Cervantes' own Plan curricular — its "
    "inventories of Nociones específicas and Nociones generales, which are printed as two "
    f"columns, {PAIRED_WITH}, so the {LEVEL_U} half can be read off on its own. "
    + CLOSED_NOTE +
    "The cards are ordered roughly by how common the word is in everyday Spanish, so the words you "
    "will meet most often come first: the order is taken from a frequency list built from film and "
    "television subtitles, with a reflexive verb placed by the verb it is formed from and a phrase, "
    "which a list of single words cannot see, placed by how often it turns up in a corpus of "
    "everyday sentences. "
    f"Every noun carries its article, so the gender is learnt with the word ({narts} of them), and "
    "its plural sits directly beneath it; a noun beginning with a stressed a- is given the el it "
    "takes in the singular and the las it takes in the plural (el agua, las aguas). "
    f"A noun or adjective with a distinct feminine is taught as a pair rather than as two words "
    f"({npairs} of them): el niño, la niña above los niños, las niñas, and rojo, roja above rojos, "
    "rojas. Where both halves are in the word list they share one card. "
    f"Each of the {nverbs} verbs carries its full conjugation: the non-finite forms, all five simple "
    "tenses of the indicative, the present, both imperfects and the future of the subjunctive, and "
    "the imperative in both its affirmative and its negative. Six persons are shown, from yo to "
    "ellos; the Rioplatense vos is not. Compound tenses are formed with haber and the past "
    f"participle, which is given. The {nrefl} reflexive verbs are conjugated with their pronouns "
    "(me llamo, te llamas), including the written accent the imperative takes when the pronoun is "
    "attached (llámate, levántense). "
    + EX_NOTE +
    ", chosen where possible to show three different inflected forms rather than the same one "
    "three times, with the word picked out in colour and a speaker beside it. "
    "Word list: Plan curricular del Instituto Cervantes (cvc.cervantes.es). "
    "Meanings, genders, plurals and conjugations: English Wiktionary, via the kaikki.org extraction "
    "(CC BY-SA 4.0). Frequency ordering: a word list built from OpenSubtitles (hermitdave/"
    "FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR."
)

meta = {
    'id': DECK_IDS[LEVEL],
    'title': TITLES[LEVEL],
    'subtitle': ('500 words · both directions, as two subdecks' if LEVEL == 'a1' else
                 '500 more words, none of them in A1 · both directions, as two subdecks'
                 if LEVEL == 'a2' else
                 f'{NW} more words, none of them in A1 or A2 · both directions, as two subdecks'
                 if LEVEL == 'b1' else
                 f'{NW} more words, none of them in A1, A2 or B1 · both directions, as two subdecks'
                 if LEVEL == 'b2' else
                 f'{NW} more words, none of them in A1, A2, B1 or B2 · both directions, as two '
                 'subdecks'
                 if LEVEL == 'c1' else
                 f'{NW} more words, none of them in A1, A2, B1, B2 or C1 · both directions, as two '
                 'subdecks'
                 if LEVEL == 'c2' else
                 f'{NW} set phrases and expressions, ranked by how often they are said · both '
                 'directions, as two subdecks'),
    'desc': PHRASE_DESC if LEVEL == 'ph' else DESC,
    'author': '',
    'language': 'en',
    'tags': (['spanish', 'phrases', 'expressions', 'idioms', 'vocabulary']
             if LEVEL == 'ph' else ['spanish', 'dele', LEVEL, 'cefr', 'vocabulary']),
    'glossMode': 'site',
    'types': {
        'es-to-en': {'id': 'es-to-en', 'name': 'Spanish → English', 'speechLang': 'es-ES',
                     'fields': FIELDS_ES, 'front': FRONT_ES, 'back': BACK_ES, 'css': CSS},
        'en-to-es': {'id': 'en-to-es', 'name': 'English → Spanish', 'speechLang': 'es-ES',
                     'fields': FIELDS_EN, 'front': FRONT_EN, 'back': BACK_EN, 'css': CSS},
    },
    'version': 1,
    'createdAt': 1786665600000,
    'updatedAt': 1786665600000,
    'forkedFrom': None,
}

deck = {'folioDeck': 1, 'exportedAt': 1786665600000, 'meta': meta,
        'cards': cards, 'gloss': {}}

# stages run with the cache as the working directory: .claude/dele-cache/
import os
out = os.path.abspath(os.path.join('..', '..', 'decks', DECK_FILES[LEVEL]))
with open(out, 'w', encoding='utf-8') as f:
    json.dump(deck, f, ensure_ascii=False)
print('wrote', out)
print('cards', len(cards), 'words', NWORDS, 'verbs with conjugation', nverbs, 'nouns with article', narts,
      'gendered pairs', npairs)
print('bytes', os.path.getsize(out))
