#!/usr/bin/env python3
"""Combine the six CILS bands, the core deck and the phrases deck into ONE file.

    python3 .claude/cils/combine.py [out.folio-deck.json]

It reads the eight shipped `decks/*.folio-deck.json` and writes a single deck
with a subdeck per level:

    A1  A2  B1  B2  C1  C2  Core vocabulary  Phrases and expressions

**IT NEEDS NO `::` NESTING, WHICH IS THE ONE PLACE IT DIFFERS FROM THE SPANISH
COMBINER AND IS WORTH SAYING.**  DELE writes a level and the two directions
inside it, because a DELE word is TWO notes of two different types and the
direction is the only thing that separates them -- so it has to be a subdeck.
An Italian word is ONE note whose type declares two card TEMPLATES, and app.js
draws a direction row under any level whose notes all sit directly in it, so
`A1` here already offers `Italian → English` and `English → Italian` without
this file naming them.  A `::` level would add a row that says nothing.

FIVE THINGS IT HAS TO GET RIGHT, and four of them fail silently.

A CARD ID MUST CARRY THE DECK.  Every card is renumbered `u_itall_N`.  A deck
FILE import only mints fresh card ids when the DECK id already exists, so a
combined deck reusing `u_cilsa1_1` would collide with an installed A1 in the
shared `UCARDS` store and study the wrong card -- both decks on the shelf with
their full counts, and nothing thrown.

THE TYPE BLOCK IS SHARED, and that is asserted rather than assumed.  A level
rebuilt against a changed template would otherwise have its cards silently
rendered by another level's, which on a language deck means the wrong side of
the card face up.

THE COUNTS IN THE DESCRIPTION ARE COUNTED off the cards, never carried over from
the eight descriptions and added up.  A figure restated by hand goes stale the
next time a level is rebuilt, and nothing reports it.

THE CAPS ARE CHECKED BEFORE THE FILE IS WRITTEN.  `UDECK_MAX_CARDS` counts NOTES
and this deck is within a fifth of it, so it is checked rather than assumed --
and app.js REFUSES an over-size file rather than trimming it, so the failure
would be at the reader's end.

AND IT IS REPRODUCIBLE: no clock is read.  The timestamps come from the newest
of the eight sources, so re-running with the same inputs writes the same bytes
and a diff means something.

Not part of the site.  The combined file is an ARTEFACT of the eight shipped
decks and is deliberately NOT committed -- it duplicates ~21 MB already in the
repo, and this script regenerates it.
"""
import json, os, sys, hashlib, re

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
DECKS = os.path.abspath(os.path.join(HERE, '..', '..', 'decks'))

from cils_level import BANDS, DECK_FILES

# the six bands in CEFR order, then the core deck.  Core sits LAST because the
# deck is named for the CILS progression -- but it is the one to start with for
# everyday words, and the description says so rather than leaving the position
# to imply the opposite.
LEVELS = ([(lv, lv.upper()) for lv in BANDS]
          + [('core', 'Core vocabulary'), ('phrases', 'Phrases and expressions')])
DECK_ID = 'itall'
TITLE = 'Italian — CILS A1–C2, the core vocabulary and common phrases'
# the subdeck count in words, for the subtitle; derived from LEVELS so a
# ninth deck cannot leave a stale number on the shelf
NUMWORD = ('zero one two three four five six seven eight nine ten eleven '
           'twelve').split()[len(LEVELS)] if len(LEVELS) <= 12 else str(len(LEVELS))
SUB_SEP = '::'          # app.js's own subdeck separator; keep the two in step

# app.js's own limits, restated here so this refuses to write a file that cannot
# be imported rather than leaving it to be found on a phone.  MAX_CARDS counts
# NOTES, which is what the deck file holds.
MAX_CARDS = 12000
MAX_BYTES = 48 * 1024 * 1024


def load(level):
    with open(os.path.join(DECKS, DECK_FILES[level]), encoding='utf-8') as f:
        return json.load(f)


def stats(cards):
    """Counted off the cards, not read out of the source descriptions.

    A note carries two cards -- the two templates -- so `notes` is what the file
    holds and `notes * 2` is what a reader studies.  Both are quoted, because a
    reader comparing this with a deck of single cards is owed the distinction.
    """
    def txt(c, f):
        return c['fields'].get(f, '')
    nouns = sum(1 for c in cards if 'uc-art' in txt(c, 'Italian'))
    verbs = sum(1 for c in cards if 'Passato prossimo' in txt(c, 'Conjugation'))
    ess = sum(1 for c in cards
              if 'ausiliare</span><span class="uc-cj-f">essere' in txt(c, 'Conjugation'))
    plurals = sum(1 for c in cards if '>plural<' in txt(c, 'Forms'))
    fems = sum(1 for c in cards if '>feminine<' in txt(c, 'Forms'))
    exs = sum(1 for c in cards if txt(c, 'Examples'))
    ex3 = sum(1 for c in cards if txt(c, 'Examples').count('uc-exi') >= 3)
    return dict(notes=len(cards), nouns=nouns, verbs=verbs, ess=ess,
                plurals=plurals, fems=fems, exs=exs, ex3=ex3)


def desc(s, per_level):
    n = f"{s['notes']:,}"
    named = dict(per_level)
    band = [(lab, k) for lab, k in per_level if len(lab) == 2]
    core = named['Core vocabulary']
    phr = named['Phrases and expressions']
    return (
        'Every Italian deck here in one file, as eight subdecks — the six CILS '
        'bands A1 to C2, the core vocabulary that sits beside them, and a deck '
        'of common phrases and expressions. Add the '
        'whole thing or just one subdeck, and each offers both study directions '
        'as rows of its own: Italian → English (see the Italian, recall the '
        'meaning) and English → Italian (see an English meaning, recall the '
        'Italian). Each direction is a card with its own schedule, so '
        f'recognising a word and producing it are learnt separately — {n} words, '
        f'{s["notes"] * 2:,} cards. '
        'WHICH SUBDECK TO START WITH, since the labels are not quite what they '
        'look like. The six lettered bands are not a CILS syllabus: CILS '
        'publishes no word list at all — what the Università per Stranieri di '
        'Siena sets out for each level is grammar and functions, and for '
        'vocabulary only a basic repertoire for everyday situations — so the '
        'bands here are a third party\'s, MindDory\'s Italian vocabulary list, '
        'which sorts about 7,200 words into six CEFR-labelled bands. Measured, '
        'those bands are a frequency gradient rather than a graded syllabus, cut '
        'from a subtitle corpus: A1 carries amministrazione and istituzione and '
        'not pane, madre, cane or mangiare, and buongiorno, per favore, prego '
        'and arrivederci are in none of the six. '
        f'THE CORE SUBDECK IS THE ANSWER TO THAT, and it is the {core:,} words '
        'the six bands never reach. Its list is not a third party\'s but a '
        'published reference work — Tullio De Mauro\'s nuovo vocabolario di base '
        'della lingua italiana, the roughly 7,000 words an Italian adult uses '
        'without effort. The bands cover 97% of it at A1 and 8% at C2, and not '
        'because the core runs out: 3,799 core words are still untouched when '
        'the C1 band begins. What they miss is the concrete everyday half of the '
        'language — astuccio, aratro, cartolina, farfalla, capanna, borsetta — '
        'words every Italian knows and nobody says on television, one in five of '
        'which does not appear once in 50,000 subtitle words. '
        f'AND THE PHRASES SUBDECK IS THE OTHER THING A WORD LIST CANNOT HOLD: '
        f'{phr:,} expressions, from per favore and di solito to in bocca al lupo '
        'and come si chiama. Every other subdeck here is built from a list of '
        'single words, so between them the seven of them carry 67 multiword '
        'entries and Core none at all — which leaves out the part of the '
        'language a learner needs first and cannot assemble from a dictionary, '
        'because an expression means what it means as a whole. There is no '
        'published list of them, so that subdeck is derived: the multiword '
        'entries of Wiktionary, each counted in a corpus of 981,765 Italian '
        'sentences and kept only where it actually turns up. '
        'So for everyday Italian, start with Phrases and Core; for the exam '
        'bands, start with A1. '
        'The eight teach '
        + ', '.join(f'{k:,}' for _, k in band[:-1])
        + f' and {band[-1][1]:,} words across A1 to C2, {core:,} in Core and '
        f'{phr:,} expressions, and no word is taught twice — each level excludes '
        'everything the levels below it contain. '
        'Within each subdeck the cards are dealt by how common the word is in '
        'everyday spoken Italian, from a frequency list built from film and '
        'television subtitles. That ordering does less well in Core than in the '
        'bands, because the bands have already taken the words the list ranks '
        'cleanly: what is left is disproportionately spellings that are also '
        'some other word\'s inflected form, so credo is dealt early because '
        'Italians say it meaning "I believe" while the card teaches the noun '
        '"creed". The words and their meanings are right; it is their position '
        'that is borrowed. Note too that De Mauro\'s list is descriptive, a '
        'record of what adults know rather than a curriculum, so Core includes '
        'the coarse words and the frequency ordering puts several of them early. '
        f'Every noun carries its definite article, so the gender is learnt with '
        f'the word ({s["nouns"]:,} of them), and the article is coloured by '
        'gender: masculine blue, feminine red. That article is worth learning as '
        'a rule and not as a fact, because Italian picks it by spelling as well '
        'as by gender — il libro but lo studente, lo zio, lo psicologo, and '
        'l\'amico before a vowel — so the deck shows the one each word actually '
        f'takes. The plural comes with its own article ({s["plurals"]:,} of '
        'them), which is the only place a vowel-initial noun\'s gender is '
        'legible at all: l\'amico and l\'amica look alike, gli amici and le '
        'amiche do not. The indefinite article is given too, since un amico '
        'takes no apostrophe and un\'amica does. Where a noun names a person its '
        f'feminine is shown ({s["fems"]:,}). '
        f'Each of the {s["verbs"]:,} verbs carries its full paradigm: the '
        'infinitive, the past participle, the gerund and the auxiliary it takes, '
        'then the presente, the passato prossimo, the imperfetto, the futuro, '
        'the condizionale, the congiuntivo and the imperativo, each in all six '
        'persons from io to loro. The passato prossimo is the point — it is how '
        'Italian talks about the past, and whether a verb takes essere or avere '
        f'has to be learnt with the verb ({s["ess"]:,} of them take essere). '
        'Where it takes essere the participle is shown agreeing, sono andato/a '
        'and siamo andati/e, which is the half that gets forgotten. Adjectives '
        'carry their feminine and their plurals, since an Italian adjective '
        'agrees with what it describes. '
        f'Real example sentences come with {s["exs"]:,} of the {n} words, three '
        f'apiece for {s["ex3"]:,} of them and one or two for the rest, chosen '
        'where possible to show three different inflected forms rather than the '
        'same one three times, with the word picked out in colour and a speaker '
        f'beside it; the sentence corpus has nothing at all for the other '
        f'{s["notes"] - s["exs"]:,}, which are kept because the word lists are '
        'what they are and not what the corpus can illustrate. '
        'Word lists: MindDory Italian vocabulary list, A1–C2 bands — the list of '
        'words only; and Tullio De Mauro, nuovo vocabolario di base della lingua '
        'italiana (2016), via the public-domain extraction at pettarin/nvdb. '
        'Meanings, genders, plurals, feminines and conjugations: English '
        'Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Frequency '
        'ordering: a word list built from OpenSubtitles '
        '(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba '
        '(tatoeba.org), CC BY 2.0 FR.'
    )


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        DECKS, 'Italian-Complete.folio-deck.json')

    decks = [(lv, lab, load(lv)) for lv, lab in LEVELS]

    # the type block is shared, and that is asserted rather than assumed
    sigs = {lab: hashlib.sha1(json.dumps(d['meta']['types'], sort_keys=True,
                                         ensure_ascii=False).encode()).hexdigest()
            for _, lab, d in decks}
    if len(set(sigs.values())) != 1:
        raise SystemExit('the decks no longer share a card-type block: '
                         + json.dumps(sigs, indent=2))
    types = decks[0][2]['meta']['types']

    cards, per_level = [], []
    for lv, lab, d in decks:
        if SUB_SEP in lab:
            raise SystemExit(f'sub title contains {SUB_SEP!r}: {lab!r}')
        per_level.append((lab, len(d['cards'])))
        for c in d['cards']:
            # **THE SUB IS OVERWRITTEN, NOT APPENDED TO.**  Every source deck
            # carries an empty `sub`; a level that grew subdecks of its own
            # would need `lab::<its sub>` here, and this asserts rather than
            # silently flattening them into one.
            if c.get('sub'):
                raise SystemExit(f'{lab} already has subdecks ({c["sub"]!r}); '
                                 'this combiner would flatten them')
            n = len(cards) + 1
            cards.append(dict(c, id=f'u_{DECK_ID}_{n}', sub=lab))

    if len(cards) > MAX_CARDS:
        raise SystemExit(f'{len(cards):,} notes, over app.js\'s {MAX_CARDS:,} cap')
    if len({c['id'] for c in cards}) != len(cards):
        raise SystemExit('a card id occurs twice')

    s = stats(cards)
    ts = max(d['meta']['updatedAt'] for _, _, d in decks)
    doc = {
        'folioDeck': 1,
        'exportedAt': ts,
        'meta': {
            'id': DECK_ID,
            'title': TITLE,
            # DERIVED, never written down: the subtitle said `seven` for a
            # fortnight after the eighth deck was added, while the
            # description beside it -- which counts -- correctly said eight.
            'subtitle': f'{len(cards):,} words · {NUMWORD} subdecks · both '
                        'directions, as two cards per word',
            'desc': desc(s, per_level),
            'author': '',
            'language': 'en',
            'color': decks[0][2]['meta'].get('color', ''),
            'tags': ['italian', 'cils', 'core', 'cefr', 'vocabulary',
                     'a1', 'a2', 'b1', 'b2', 'c1', 'c2'],
            'glossMode': 'site',
            'types': types,
            'version': 1,
            'createdAt': ts,
            'updatedAt': ts,
            'forkedFrom': None,
        },
        'cards': cards,
        'gloss': {},
    }

    text = json.dumps(doc, ensure_ascii=False)
    size = len(text.encode('utf-8'))
    if size > MAX_BYTES:
        raise SystemExit(f'{size / 1048576:.1f} MB, over app.js\'s '
                         f'{MAX_BYTES / 1048576:.0f} MB cap')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(text)

    print(out)
    print(f'  {len(cards):,} notes = {len(cards) * 2:,} cards, '
          f'{size / 1048576:.1f} MB '
          f'(caps: {MAX_CARDS:,} notes, {MAX_BYTES / 1048576:.0f} MB)')
    print(f'  {len(per_level)} subdecks:')
    for lab, k in per_level:
        print(f'    {lab:<16} {k:>6,} words')
    print('  ' + '  '.join(f'{k} {v:,}' for k, v in s.items()))


if __name__ == '__main__':
    main()
