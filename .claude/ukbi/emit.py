#!/usr/bin/env python3
"""Write the .folio-deck.json file."""
import json, os

from ukbi_level import (LEVEL, f as lvlf, TITLES, DECK_IDS, DECK_FILES,
                        PREDICATES, TARGET, SCOPE)

cards = json.load(open(lvlf('cards.json'), encoding='utf-8'))
entries = json.load(open(lvlf('entries.json'), encoding='utf-8'))

TYPE_ID = 'ukbi'

# A FIXED TIMESTAMP, so that re-running the generator on unchanged inputs writes
# the same bytes.  Reading the clock here would make every rebuild a diff.
STAMP = 1786665600000

# ONE NOTE, TWO CARDS.  The word is a single record and the two directions are
# card TEMPLATES, so a corrected meaning is corrected both ways at once and each
# direction still keeps a schedule of its own -- recognising `mengerti` comes
# long before producing it.  Card 1 is INDONESIAN → ENGLISH, the easier
# direction and the one a reader meets first, so it keeps the bare note id.
SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '{{Indonesian}}'
ASK = ('<div class="uc-ask">Say it in Indonesian</div>'
       '<div class="uc-field">{{English}}</div>')

# The affix family sits with the word it belongs to and above the rule that
# divides the word from its meaning: `lihat` / `melihat` / `dilihat` is one fact
# in three parts, and it is a fact about the WORD rather than about the
# translation of it.
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'

TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}')

FRONT_ID = WORD
BACK_ID = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
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
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
}
.uc-field {
  display: block;
  width: fit-content;
  /* A FLOOR, because Indonesian's commonest words gloss in one word.  The box
     hugs its contents, which is right for a list of three senses, and on
     `dan` -> `and` that would otherwise leave a narrow stamp adrift in the
     middle of a 680px card under a rule spanning the whole of it. */
  min-width: min(300px, 100%);
  max-width: 100%;
  margin: 14px auto 0;
  padding: 11px 15px;
  border: 1px solid var(--rule, rgba(0,0,0,0.12));
  border-radius: 11px;
  text-align: left;
  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));
}
.uc-sense + .uc-sense {
  margin-top: 9px;
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
  padding-left: 18px;
  line-height: 1.5;
}
/* THE AFFIX FAMILY.  A row rather than a table: Indonesian has no paradigm to
   lay out in a grid -- no person, no number, no tense -- only a handful of
   derived forms, and three or four labelled words read better in a line than in
   a two-column table with two rows in it.  It wraps on a narrow screen. */
.uc-forms {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 16px;
  margin-top: 12px;
  font-size: 15px;
}
.uc-fi b {
  font-weight: 500;
}
.uc-fl {
  margin-right: 5px;
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.5;
}
/* the form the card is actually asking for, so a reader can see at a glance
   which of the family is the headword */
.uc-fhead b {
  font-weight: 700;
  color: var(--zh, #C8453C);
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

FIELDS = ['Indonesian', 'Word', 'English', 'Forms', 'Examples']

DECK = DECK_IDS[LEVEL]
for i, c in enumerate(cards, 1):
    c['id'] = f'u_{DECK}_{i}'
    c['type'] = TYPE_ID

# ---------------------------------------------------------------- the numbers
n = len(cards)
fams = sum(1 for c in cards if c['fields']['Forms'])
phrases = sum(1 for e in entries if ' ' in e['word'])
ex3 = sum(1 for e in entries if e['examples'] == 3)
ex0 = sum(1 for e in entries if e['examples'] == 0)
passives = sum(1 for e in entries
               if any(l == 'passive' for _f, l in e['forms']))
# THE EXAMPLES ARE THIS DECK'S OWN, taken in the deck's own order (commonest
# first), not four phrases typed out for level 1 -- which is the same fault
# `SCOPE` records one field up, and it would name `terima kasih` in a deck that
# does not contain it.
PHRASE_EG = ', '.join([e['word'] for e in entries if ' ' in e['word']][:4])

NAME, PERINGKAT, BAND = PREDICATES[LEVEL]
# EVERY CLAIM THE DESCRIPTION MAKES ABOUT THE LEVEL COMES FROM HERE, not from a
# sentence typed once for level 1; see the note on `SCOPE` in `ukbi_level.py` for
# what shipped before it did.
SC = SCOPE[LEVEL]
from_inv = json.load(open(lvlf('wordlist.json'),
                          encoding='utf-8')).get('from_inventory', 0)

EX_NOTE = (f'Every word also carries three real example sentences'
           if ex0 == 0 and ex3 == n else
           f'Real example sentences come with {n - ex0} of the {n} words, three apiece '
           f'for {ex3} of them'
           + (f'; the sentence corpus has nothing at all for the other {ex0}, which are '
              'kept because a word is chosen for being worth knowing and not for being '
              'well covered by a sentence bank' if ex0 else ''))

DESC = (
    "Both study directions in one deck: Indonesian → English (see the Indonesian, "
    "recall the meaning) and English → Indonesian (see an English meaning, recall the "
    "Indonesian). Each direction is a card of its own with its own schedule, so "
    f"recognising a word and producing it are learnt separately. {n} words for "
    f"{NAME}, a predicate of the UKBI, the Uji Kemahiran Berbahasa Indonesia — "
    "the Indonesian language proficiency test set by the Badan Pengembangan dan "
    "Pembinaan Bahasa. "
    f"UKBI reports a score from 251 to 800 and one of seven predicates; {NAME} is "
    f"{SC['rank']}, peringkat {PERINGKAT}, a score of {BAND}, and its official "
    f"descriptor — the phrase it turns on is '{SC['quote']}' — describes a candidate "
    f"here as {SC['gloss']}. "
    + ("The words already taught by the level"
       + ("s" if int(LEVEL) > 2 else "")
       + " below this one are left out, so nothing here repeats them. "
       if int(LEVEL) > 1 else "") +
    "WHERE THESE WORDS COME FROM, since it matters and since it is not what the other "
    "exam decks do: UKBI publishes no vocabulary list. It is a proficiency test rather "
    "than a syllabus, and the Badan Bahasa describes what a candidate at each predicate "
    "can do rather than which words they should know; the BIPA competency standards "
    "(Permendikbud 27/2017) are written the same way. So this word list is not an "
    "official one and is not presented as one. It was assembled from two things that "
    f"can be stated. {from_inv} of the {n} come from a vocabulary written to the "
    f"level's own descriptor — {SC['topics']} — and the other {n - from_inv} are the "
    "commonest words of everyday Indonesian, taken from a frequency list built from "
    "film and television subtitles. The cards are ordered by that frequency, so the "
    "words you meet most often come first. "
    # THE CAVEAT GETS HEAVIER AS THE LEVELS CLIMB, and it has to say so.  The
    # inventory is written to a descriptor and runs out; the corpus does not, so
    # the higher the level the more of the list the subtitles choose -- 122 of 500
    # at level 1 against 1,357 of 1,500 at level 4.  The sentence above is true at
    # every level and stops being the whole truth once the corpus is choosing most
    # of the words, because a subtitle corpus is an accurate record of what people
    # say in films and a poor guide to what a candidate needs.  Fires on the
    # measurement rather than on the level number.
    + ("A frequency list of subtitles is an accurate record of what people say in "
       "films and a rougher guide to what a candidate needs, and at this level it "
       f"chooses {round(100 * (n - from_inv) / n)} per cent of the words, so expect "
       "some of what films talk about among them. "
       if n - from_inv > from_inv else "") +
    "Everything here is standard Indonesian, bahasa baku, because that is what UKBI "
    "tests: where a colloquial form is far commoner in speech the standard one is what "
    "is taught — tidak rather than nggak, tetapi rather than tapi, and di mana as two "
    "words rather than the dimana that the test marks wrong. "
    + ("The familiar-but-standard pronouns aku and kamu are taught alongside the formal "
       "saya and Anda, because Indonesian chooses its pronoun by who is being spoken "
       "to. " if LEVEL == '1' else "") +
    f"Indonesian has no gender, no plural agreement and no verb conjugation, so a card "
    "carries none. What it carries instead is the affix family, which is the part of the "
    f"language that cannot be guessed: {fams} of the words show their relatives labelled "
    f"— lihat, melihat, dilihat as root, active and passive — and {passives} of them show "
    "a passive, which Indonesian uses far more readily than English does. The prefix "
    "assimilates and swallows the root's first consonant, so tulis becomes menulis while "
    "nanti stays menanti, and there is no rule a learner can apply; the forms are read "
    "from a dictionary rather than derived. "
    f"{phrases} of the entries are phrases rather than single words — {PHRASE_EG} — "
    "which a list of single words cannot see at all. "
    + EX_NOTE +
    ", with the word picked out in colour and a speaker beside the sentence and the "
    "headword. "
    "Level: UKBI predicate descriptors, ukbi.kemendikdasmen.go.id. Meanings, affix "
    "families and parts of speech: English Wiktionary, via the kaikki.org extraction "
    "(CC BY-SA 4.0). Frequency ordering: a word list built from OpenSubtitles "
    "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba "
    "(tatoeba.org), CC BY 2.0 FR."
)

meta = {
    'id': DECK,
    'title': TITLES[LEVEL],
    'subtitle': f'{n} words · both directions, as two cards per word',
    'desc': DESC,
    'author': '',
    'language': 'en',
    'color': '#B32821',
    'tags': ['indonesian', 'bahasa indonesia', 'ukbi', NAME.lower(),
             f'level {LEVEL}', 'vocabulary'],
    'glossMode': 'site',
    'types': {
        TYPE_ID: {
            'id': TYPE_ID, 'name': 'Indonesian vocabulary', 'speechLang': 'id-ID',
            'fields': FIELDS,
            'cards': [
                {'name': 'Indonesian → English', 'front': FRONT_ID, 'back': BACK_ID},
                {'name': 'English → Indonesian', 'front': FRONT_EN, 'back': BACK_EN},
            ],
            'css': CSS,
        },
    },
    'version': 1,
    'createdAt': STAMP,
    'updatedAt': STAMP,
    'forkedFrom': None,
}

deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta,
        'cards': cards, 'gloss': {}}

out = os.path.abspath(os.path.join('..', '..', 'decks', DECK_FILES[LEVEL]))
with open(out, 'w', encoding='utf-8') as fh:
    json.dump(deck, fh, ensure_ascii=False)
print('  wrote', out)
print(f'  notes {n} = cards {n * 2} | affix families {fams} | with a passive {passives}'
      f' | phrases {phrases} | three sentences {ex3} | none {ex0}')
print('  bytes', os.path.getsize(out))
