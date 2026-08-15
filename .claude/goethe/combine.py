#!/usr/bin/env python3
"""Combine the seven shipped German decks into ONE importable deck file.

    python3 .claude/goethe/combine.py [out.folio-deck.json]

It reads the six level decks and the phrases deck out of `decks/` and writes a
single deck with a subdeck apiece:

    A1   A2   B1   B2   C1   C2   Phrases & expressions

so a reader adds the whole thing or just the level they are on, and the seven
stay separable inside one file rather than being poured together.

IT NEEDS NO NESTING, WHERE THE DELE COMBINER DOES, and the difference is worth
knowing before anyone copies that file's shape here.  A Spanish word is two
NOTES, one per direction, so direction has to be carried in the subdeck string
and the levels nest one level deep.  A German word is ONE note with two card
TEMPLATES, so app.js offers `German → English` and `English → German` as rows
under each subdeck on its own account -- the axis is already expressed at the
level where the two actually differ, and `sub` is free to hold nothing but the
level.

FIVE THINGS IT HAS TO GET RIGHT, and four of them fail silently.

A CARD ID MUST CARRY THE DECK.  Every note is renumbered `u_germanall_N`.  A deck
FILE import only mints fresh card ids when the DECK id already exists, so a
combined deck reusing `u_goethea1_1` would collide with an installed A1 in the
shared `UCARDS` store and study the wrong card.  `germanall` is likewise its own
deck id.

THE SUBDECK IS A STRING ON THE CARD and the deck's subdecks are the DISTINCT
values in CARD ORDER, so the cards are concatenated level by level and the order
above follows.  It costs the file nothing: `sub` rides on the note and travels
wherever the note does.

THE TYPE BLOCK IS SHARED, which is asserted rather than assumed -- a level
rebuilt against a changed template would otherwise have its cards silently
rendered by another level's.  All seven decks are written by one `emit.py`, so
they agree by construction until somebody edits one.

THE COUNTS IN THE DESCRIPTION ARE COUNTED, never carried over from the seven
descriptions and added up.  A figure restated by hand goes stale the next time a
level is rebuilt, and this file has already had that fault once, in the other
direction: for a fortnight every level's own description said A1.

AND IT IS REPRODUCIBLE: no clock is read.  `exportedAt` and the timestamps come
from the newest of the seven sources, so re-running with the same inputs writes
the same bytes and a diff means something.

Not part of the site.  The combined file is an ARTEFACT of the seven shipped
decks and is deliberately not committed -- it duplicates ~43 MB, six of the seven
sources are themselves uncommitted, and this script regenerates it.
"""
import json, os, sys, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
DECKS = os.path.abspath(os.path.join(HERE, '..', '..', 'decks'))

from goethe_level import DECK_FILES

# The order the subdecks come out in, which is the order the cards are
# concatenated in.  Phrases last: it is not a level and sits beside the ladder.
LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'phrases']
SUBS = {'a1': 'A1', 'a2': 'A2', 'b1': 'B1', 'b2': 'B2', 'c1': 'C1', 'c2': 'C2',
        'phrases': 'Phrases & expressions'}
DECK_ID = 'germanall'
SUB_SEP = '::'          # app.js's own subdeck separator; keep the two in step
TITLE = 'German A1–C2 — Vocabulary & phrases'

# app.js's own limits, restated here so this refuses to write a file that cannot
# be imported rather than leaving it to be found on a phone.  THE CARD CAP COUNTS
# NOTES, which is what a deck file's `cards` array holds -- so 13,000-odd here is
# 27,000-odd cards to study.
MAX_CARDS = 16000
MAX_BYTES = 48 * 1024 * 1024


def load(level):
    with open(os.path.join(DECKS, DECK_FILES[level]), encoding='utf-8') as f:
        return json.load(f)


def stats(cards):
    """Counted off the notes rather than read out of the seven descriptions."""
    def has(c, k):
        return bool(c['fields'].get(k))
    return dict(
        notes=len(cards),
        arts=sum(1 for c in cards if 'uc-art' in c['fields']['German']),
        plurals=sum(1 for c in cards if '>plural<' in c['fields']['Forms']),
        fems=sum(1 for c in cards if '>feminine<' in c['fields']['Forms']),
        comps=sum(1 for c in cards if '>comparative<' in c['fields']['Forms']),
        paradigms=sum(1 for c in cards if has(c, 'Conjugation')),
        exs=sum(1 for c in cards if has(c, 'Examples')),
    )


def desc(s, per_level):
    n = f"{s['notes']:,}"
    sizes = ', '.join(f'{SUBS[lv]} {c:,}' for lv, c in per_level)
    return (
        'Every German deck in one file. There is a subdeck per level and one for the phrases, so '
        'you can add the whole thing or just the level you are on; inside each, both study '
        'directions are offered separately — German → English (see the German, recall the '
        'meaning) and English → German (see an English meaning, recall the German) — and each '
        'direction is a card of its own with its own schedule, so recognising a word and '
        'producing it are learnt apart. '
        f'{n} words and expressions in all: {sizes}. '
        'No word is taught twice, since every level excludes what the levels below it contain. '
        'A1, A2 and B1 are the Goethe-Institut\'s own published Wortlisten, read off the PDFs it '
        'prints for those exams — the alphabetical lists and the Wortgruppenlisten of numbers, '
        'days, months and colours the alphabet leaves out. There is no published list above B1, '
        'and that is the exam board\'s own position: its C1 brochure says no binding delimitation '
        'of the vocabulary can be made at that level, because the exam uses authentic texts, and '
        'the B2 and C2 brochures name no inventory either. So B2, C1 and C2 do not claim to be '
        'lists. They are one ladder cut into three equal tranches of the vocabulary a reader will '
        'actually meet in written German: the most frequent words beyond B1, taken from a corpus '
        'of one million sentences of German news (the Leipzig Corpora Collection\'s '
        'deu_news_2024, 17.6 million words). Only the ranking is taken from it — not one of its '
        'sentences appears here. Proper names, inflected forms, regional words and compounds that '
        'can be read off their parts are left out, the last on the Institut\'s own reasoning that '
        'a candidate at these levels is expected to decode them rather than to have learnt them. '
        'The phrases deck is what none of the six can hold: an expression earns its own dictionary '
        'entry when its meaning is not the sum of its parts, so it is every German entry in '
        'Wiktionary whose headword is more than one word. Verbal idioms are the heart of it — '
        'jemandem auf den Keks gehen, durch den Kakao ziehen, Schwein haben — alongside the '
        'greetings, the prepositional phrases and the proverbs. '
        'Everything here is ordered by roughly how often it is used, on one scale across all '
        'seven subdecks: how often a word turns up per million words of film and television '
        'dialogue, plus how often it turns up per million words of newspaper German. Neither '
        'corpus does the job alone — the spoken one barely knows the vocabulary of the upper '
        'levels and the written one flattens the everyday words the lower ones are about — so '
        'the two are added, and the spoken register decides among the very common words while '
        'the written register decides among the rest. A frequency list cannot see an expression '
        'at all, so the phrases are counted in a corpus of 777,128 German sentences and put on '
        'the same scale. '
        f'Every noun carries its article, so the gender is learnt with the word ({s["arts"]:,} of '
        'them), and the article is coloured by gender: der blue, die red, das green. Its plural '
        f'sits directly beneath it ({s["plurals"]:,}), and where a noun names a person its '
        f'feminine is given too ({s["fems"]:,}). {s["paradigms"]:,} cards carry a full paradigm '
        'in a panel of their own: a verb\'s infinitive, past participle and auxiliary, then the '
        'present, the Präteritum, the Perfekt and the imperative in all six persons; a noun\'s '
        'four cases against singular and plural, each with its article declined beside it; an '
        'adjective\'s three declensions, after der, after ein and with no article at all. '
        'Throughout, the part of the word that is actually changing is picked out in colour, so '
        'the table shows its own lesson rather than listing six spellings of one word. '
        f'Adjectives carry their comparative and superlative ({s["comps"]:,} of them), since '
        'German umlauts them unpredictably — groß, größer, am größten. Real example sentences '
        f'come with {s["exs"]:,} of the {n}, up to three apiece, chosen where possible to show '
        'three different inflected forms rather than the same one three times, with the word '
        'picked out in colour and a speaker beside it. '
        'Word lists for A1, A2 and B1: the Goethe-Zertifikat Wortlisten (goethe.de) — the lists '
        'of words only; the example sentences printed beside them in those documents are the '
        'Goethe-Institut\'s own and are not reproduced here. Word selection for B2, C1 and C2: '
        'the Leipzig Corpora Collection, deu_news_2024 (wortschatz-leipzig.de), used for word '
        'frequencies only. Meanings, genders, plurals, feminines, conjugations and the phrase '
        'list: English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0). Example '
        'sentences and phrase ordering: Tatoeba (tatoeba.org), CC BY 2.0 FR.'
    )


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        DECKS, 'German-A1-C2-Complete.folio-deck.json')

    decks = [(lv, load(lv)) for lv in LEVELS]

    # the type block is shared, and that is asserted rather than assumed
    sigs = {lv: hashlib.sha1(json.dumps(d['meta']['types'], sort_keys=True,
                                        ensure_ascii=False).encode()).hexdigest()
            for lv, d in decks}
    if len(set(sigs.values())) != 1:
        raise SystemExit('the seven decks no longer share a card-type block: '
                         + json.dumps(sigs, indent=2))
    types = decks[0][1]['meta']['types']

    cards, per_level = [], []
    for lv, d in decks:
        sub = SUBS[lv]
        if SUB_SEP in sub:
            raise SystemExit(f'sub title contains {SUB_SEP!r}: {sub!r}')
        per_level.append((lv, len(d['cards'])))
        for c in d['cards']:
            n = len(cards) + 1
            cards.append(dict(c, id=f'u_{DECK_ID}_{n}', num=str(n), sub=sub))

    if len(cards) > MAX_CARDS:
        raise SystemExit(f'{len(cards)} notes, over app.js\'s {MAX_CARDS} cap')

    s = stats(cards)
    ts = max(d['meta']['updatedAt'] for _, d in decks)
    doc = {
        'folioDeck': 1,
        'exportedAt': ts,
        'meta': {
            'id': DECK_ID,
            'title': TITLE,
            'subtitle': f'{s["notes"]:,} words and expressions · a subdeck per '
                        'level, and both study directions inside it',
            'desc': desc(s, per_level),
            'author': '',
            'language': 'en',
            'tags': ['german', 'goethe', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2',
                     'cefr', 'vocabulary', 'phrases'],
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
        raise SystemExit(f'{size/1048576:.1f} MB, over app.js\'s '
                         f'{MAX_BYTES/1048576:.0f} MB cap')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(text)

    print(f'{out}')
    print(f'  {len(cards):,} notes = {len(cards)*2:,} cards, {size/1048576:.1f} MB '
          f'(caps: {MAX_CARDS:,} notes, {MAX_BYTES/1048576:.0f} MB)')
    print('  subdecks: ' + ', '.join(f'{SUBS[lv]} {c:,}' for lv, c in per_level))
    print('  ' + '  '.join(f'{k} {v:,}' for k, v in s.items()))


if __name__ == '__main__':
    main()
