#!/usr/bin/env python3
"""Write the .folio-deck.json file."""
import json, os, re
from collections import Counter

from delf_level import LEVEL, f as lvlf, TITLES, DECK_IDS, DECK_FILES, LISTS

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

# A word the sentence corpus cannot illustrate is SAID, not swapped out.
EX_NOTE = ('Every word also carries three real example sentences'
           if ex3 == n else
           f'Real example sentences come with {n - ex0} of the {n} words, three apiece for '
           f'{ex3} of them and one or two for the rest'
           + (f'; the corpus has nothing at all for the other {ex0}' if ex0 else ''))

DESC = (
    "Both study directions in one deck: French → English (see the French, recall the meaning) "
    "and English → French (see an English meaning, recall the French). Each direction is a card "
    "of its own with its own schedule, so recognising a word and producing it are learnt "
    f"separately. {n} words for the DELF A1, the beginner's French diploma awarded by France "
    "Éducation international for the French Ministry of Education. "
    "A NOTE ON THE WORD LIST, because it is not the exam board's. Unlike the Goethe-Institut, "
    "France Éducation international publishes no vocabulary list for the DELF: it publishes a "
    "syllabus of themes — greetings, numbers, the family, nationalities, the date, the weather, "
    "colours, places — and the reference work that turns those into words is a commercially "
    "published book. The list here is therefore a third party's compilation of roughly the right "
    "size for A1, taken from the A1 page of minddory.com's French vocabulary lists. It was "
    "checked against Wiktionary word by word before anything was built: four of its 384 entries "
    "are not French words at all — exercise for exercice, cinema for cinéma, an uncapitalised "
    "france, and loud, which is English — and four more are the same word printed twice "
    "(chaussure and chaussures, parent and parents, salle de bain and salle de bains). The "
    "typos are corrected, the duplicates merged, and loud is dropped rather than guessed at. "
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
    f"past, and whether a verb takes avoir or être has to be learnt with the verb ({etre} of "
    "them take être). Agreement is printed the way a textbook prints it, je suis allé(e), so the "
    f"bracket teaches the rule rather than hiding it. The {refl} pronominal verbs carry their "
    "pronouns throughout — je me lève, je me suis levé(e) — including in the imperative, where "
    f"French moves the pronoun behind the verb: lève-toi, levez-vous. Adjectives carry their "
    f"feminine and their agreement table ({adjs} of them), since French forms the feminine "
    "unpredictably — blanc, blanche; beau, belle; vieux, vieille — and the few that change "
    f"before a vowel carry that form too ({bvow}: un bel homme, un vieil ami). "
    f"The pronunciation is given in the international phonetic alphabet on the back of every "
    f"card that has one ({ipas} of them), because French spelling does not say how a word "
    "sounds, and there is a speaker button on the word and on every example sentence. "
    + EX_NOTE +
    ", chosen where possible to show three different inflected forms rather than the same one "
    "three times, with the word picked out in colour. "
    "Word list: the A1 list at minddory.com (the list of words only). Meanings, genders, "
    "plurals, feminines, conjugations and pronunciations: English Wiktionary, via the kaikki.org "
    "extraction (CC BY-SA 4.0). Frequency ordering: a word list built from OpenSubtitles "
    "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), "
    "CC BY 2.0 FR."
)

meta = {
    'id': DECK,
    'title': TITLES[LEVEL],
    'subtitle': f'{n} words · both directions, as two cards per word',
    'desc': DESC,
    'author': '',
    'language': 'en',
    'color': '#14468C',
    'tags': ['french', 'delf', LEVEL, 'cefr', 'vocabulary'],
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

out = os.path.abspath(os.path.join('..', '..', 'decks', DECK_FILES[LEVEL]))
with open(out, 'w', encoding='utf-8') as f:
    json.dump(deck, f, ensure_ascii=False)
print('  wrote', out)
print('  notes', n, '= cards', n * 2, '| articles', arts, '| un/une shown', indef,
      '| irregular plurals', plurals, '| feminines', fems, '| before-vowel', bvow,
      '| verbs', verbs, '(être', etre, ')| adjectives', adjs, '| IPA', ipas,
      '| three examples', ex3, '| none', ex0)
print('  bytes', os.path.getsize(out))
