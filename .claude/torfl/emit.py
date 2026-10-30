#!/usr/bin/env python3
"""Write the .folio-deck.json file.

ONE NOTE, TWO CARDS -- the Goethe / CAPLE / CILS shape.  The word is a single
record and the two directions are card TEMPLATES, so a corrected gloss is
corrected both ways at once and each direction keeps a schedule of its own.
Card 1 is RUSSIAN -> ENGLISH, the easier direction and the one met first.

The speaker beside the headword reads the `Word` field, which carries no stress
marks: the marks are for the reader's eye, and a combining accent sent to a
speech engine is a character it may stumble on.
"""
import json, os, re

from torfl_level import (LEVEL, f as lvlf, TITLES, DECK_IDS, DECK_FILES, NAMES,
                         TARGET, SCOPE)

STAMP = '2026-10-30T00:00:00.000Z'
TYPE_ID = 'torfl'
FIELDS = ['Russian', 'Word', 'English', 'Forms', 'Table', 'Examples']

SAY = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
WORD = '<div class="uc-word">{{Russian}}' + SAY + '</div>'
ASK = '<div class="uc-ask">Say it in Russian</div><div class="uc-field">{{English}}</div>'
FORMS = '{{#Forms}}{{Forms}}{{/Forms}}'
TAIL = ('{{#Examples}}<details class="uc-fold"><summary>In a sentence</summary>'
        '<div class="uc-exs">{{Examples}}</div></details>{{/Examples}}'
        '{{#Table}}<details class="uc-fold"><summary>All forms</summary>'
        '<div class="uc-conj">{{Table}}</div></details>{{/Table}}')
FRONT_RU = WORD
BACK_RU = '{{FrontSide}}' + FORMS + '<hr><div class="uc-field">{{English}}</div>' + TAIL
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
  /* A FLOOR, because Italian's commonest words gloss in one word.  The box hugs
     its contents, and on `я` -> `I` that leaves a narrow stamp adrift in the
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
/* THE PARADIGM IS A GRID OF BLOCKS, not one long column.  An aspect pair is
   six blocks (present, past and imperative of one verb; future, past and
   imperative of the other) and an adjective four, which stacked is a card
   several screens tall; two-up it is half that.  `minmax(0,1fr)` so a long cell
   cannot push the grid wider than the card. */
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
.uc-sense + .uc-sense {
  margin-top: 9px;
}
"""


def main():
    cards = json.load(open(lvlf('cards.json'), encoding='utf-8'))
    entries = json.load(open(lvlf('entries.json'), encoding='utf-8'))
    DECK = DECK_IDS[LEVEL]
    for i, c in enumerate(cards, 1):
        c['id'] = f'u_{DECK}_{i}'
        c['type'] = TYPE_ID

    n = len(cards)
    pairs = sum(1 for e in entries if e['pair'])
    nouns = sum(1 for e in entries if e['pos'] == 'noun')
    from_inv = sum(1 for e in entries if e['source'] == 'inventory')
    ex3 = sum(1 for e in entries if e['examples'] == 3)
    ex0 = sum(1 for e in entries if e['examples'] == 0)
    phrases = [e['word'] for e in entries if e['phrase']][:3]
    EN, RU, ABBR = NAMES[LEVEL]
    SC = SCOPE[LEVEL]
    # A DECK'S DESCRIPTION SAYS WHICH DESCRIPTOR IT WAS BUILT TO -- the UKBI
    # fault (levels shipped quoting another level's descriptor) the other way
    # round: until TORFL's own descriptions are written into `SCOPE`, A1 quotes
    # the Council of Europe's, and says so.
    if SC['source'] == 'cefr':
        scope_txt = (f"TORFL's {EN} level is aligned to A1 of the Common European Framework of "
                     f"Reference, whose global descriptor begins '{SC['quote']}' — a learner here "
                     f"is {SC['gloss']}. ")
    else:
        scope_txt = (f"TORFL's own description of the level — '{SC['quote']}' — describes a "
                     f"candidate here as {SC['gloss']}. ")
    EX_NOTE = ('Every word carries three real example sentences'
               if ex3 == n else
               f'Real example sentences come with {n - ex0} of the {n} words, three apiece for '
               f'{ex3} of them')
    DESC = (
        "Both study directions in one deck: Russian → English (see the Russian, recall the "
        "meaning) and English → Russian (see an English meaning, recall the Russian). Each "
        "direction is a card of its own with its own schedule, so recognising a word and "
        f"producing it are learnt separately. {n} words for the {EN} level ({RU}, {ABBR}) of "
        "TORFL, the Test of Russian as a Foreign Language (ТРКИ), the Russian state "
        f"examination, which corresponds to CEFR {LEVEL.upper()}. " + scope_txt +
        ("The words already taught by the levels below this one are left out. "
         if LEVEL != 'a1' else "") +
        "WHERE THESE WORDS COME FROM, since it matters: TORFL's lexical minimum for each level "
        "is published as a book under copyright rather than as an open list, so this deck is "
        "not the exam board's vocabulary and does not claim to be. It is assembled from two "
        f"things that can be stated. {from_inv} of the {n} come from a vocabulary written "
        f"for the level's scope — {SC['topics']} — and the other {n - from_inv} are the "
        "commonest remaining words of everyday Russian, taken from a frequency list built from "
        "film and television subtitles and counted by the WHOLE word, every case and every "
        "tense added together, since a list of word forms ranks книгу above книга. The cards "
        "are dealt by that frequency, so the words you meet most often come first. "
        "Every headword and every form is printed with its stress mark, as Russian dictionaries "
        "for learners print them, because Russian stress is free and moves (рука́, ру́ку) and "
        "nothing in the spelling shows it; the example sentences are printed as they were "
        f"written, without stress. {pairs} of the verbs are taught as aspect pairs on one card, "
        "imperfective first (де́лать / сде́лать), each with its own conjugation, since a Russian "
        "verb is learnt as a pair; the verbs of motion that make round trips (ходи́ть, е́здить) "
        "are cards of their own beside идти́ and е́хать, because the difference is the lesson. "
        f"The {nouns} nouns show their gender, their genitive singular and their nominative "
        "plural, from which the rest of the declension follows, and every word that inflects "
        "has its whole table behind the All forms fold. " +
        (f"{len([e for e in entries if e['phrase']])} of the entries are set phrases rather "
         f"than single words — {', '.join(phrases)}. " if phrases else "") +
        EX_NOTE + ", with the word picked out in colour and a speaker beside the sentence and "
        "the headword. There is no transliteration: learn the alphabet first with the Russian "
        "alphabet deck, which is the first deck in this collection. "
        "Sources. Level: " + ("the Common European Framework of Reference (Council of Europe), "
                              "global scale" if SC['source'] == 'cefr' else
                              "TORFL's published level descriptions") +
        ". Meanings, forms, stress and aspect: English Wiktionary, via the kaikki.org "
        "extraction (CC BY-SA 4.0). Frequency: a word list built from OpenSubtitles "
        "(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), "
        "CC BY 2.0 FR."
    )

    meta = {
        'id': DECK, 'title': TITLES[LEVEL],
        'subtitle': f'{n} words · both directions, as two cards per word',
        'desc': DESC, 'author': '', 'language': 'en', 'color': '#2E5C9A',
        'tags': ['russian', 'torfl', 'трки', EN.lower(), LEVEL, 'vocabulary'],
        'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Russian vocabulary', 'speechLang': 'ru-RU',
            'fields': FIELDS,
            'cards': [
                {'name': 'Russian → English', 'front': FRONT_RU, 'back': BACK_RU},
                {'name': 'English → Russian', 'front': FRONT_EN, 'back': BACK_EN},
            ],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}

    # EVERY ENGLISH SIDE UNIQUE, LAST OF ALL -- the shelf-wide pass, so that the
    # English -> Russian card has one answer.  See `.claude/dedupe-glosses.py`.
    import importlib.util as ilu
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dedupe-glosses.py')
    spec = ilu.spec_from_file_location('dedupe_glosses', p)
    dg = ilu.module_from_spec(spec)
    spec.loader.exec_module(dg)
    st = dg.dedupe(deck, 'Russian')
    if st['groups']:
        print('  labelled %d notes in %d groups that shared an English side'
              % (st['labelled'], st['groups']))

    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                       '..', '..', 'decks', DECK_FILES[LEVEL]))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out)
    print(f'  notes {n} = cards {n * 2} | pairs {pairs} | nouns {nouns} | from the inventory '
          f'{from_inv} | three sentences {ex3} | none {ex0} | bytes {os.path.getsize(out)}')


if __name__ == '__main__':
    main()
