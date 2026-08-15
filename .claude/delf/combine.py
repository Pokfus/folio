#!/usr/bin/env python3
"""Combine the six shipped French decks into ONE importable deck file.

    python3 .claude/delf/combine.py [out.folio-deck.json]

It reads the six `decks/DELF-*` and `decks/DALF-*` files and writes a single
deck with a subdeck per level:

    A1   A2   B1   B2   C1   C2

so a reader adds a whole level at a time and the six stay separable inside one
file rather than being poured together.

THE TREE IS FLAT, AND THAT IS THE DIFFERENCE FROM THE SPANISH ONE.  `dele/
combine.py` nests a direction inside each level, because a DELE deck writes the
study direction into the card's own `sub` -- it is two notes per word, one each
way.  A French deck is ONE note with TWO TEMPLATES, so the direction is not a
subdeck at all and cannot be made one: `sub` is a property of the note, and the
note is both directions.  What replaces it is better and costs nothing, because
app.js already draws a level's two templates as rows of their own underneath it
(the `#<template>` entry ids).  So the reader gets

    A1
      French → English
      English → French

for free, out of a file with one `sub` per level and no `::` in it anywhere.

SIX THINGS IT HAS TO GET RIGHT, and five of them fail silently.

A CARD ID MUST CARRY THE DECK.  Every card is renumbered `u_delfall_N`.  A deck
FILE import only mints fresh card ids when the DECK id already exists, so a
combined deck reusing `u_delfa1_1` would collide with an installed A1 in the
shared `UCARDS` store and study the wrong card -- the fault the Spanish
generator actually had once, between its A1 and A2, where both decks sat on the
shelf with their full counts and nothing threw.  `delfall` is likewise its own
deck id.

THE TYPE BLOCK IS SHARED, and that is asserted rather than assumed.  All six
carry one card type, `delf`, and a level rebuilt against a changed template
would otherwise have its cards silently rendered by another level's -- the two
templates are what make a note two cards, so a mismatch there is not cosmetic.

THE EXAM NAME CHANGES AT C1 and the title has to say so.  A1 to B2 are the
DELF and C1 and C2 are the DALF, a different diploma; a combined deck called
`DELF A1-C2` would be making a claim about the exam that is false for a third
of it.  Read from `delf_level.EXAM` rather than written out, so it cannot drift
from the six files it is built out of.

THE COUNTS IN THE DESCRIPTION ARE COUNTED, never carried over from the six
descriptions and added up.  A figure restated by hand is a figure that goes
stale the next time a level is rebuilt.  Here the note count IS the word count,
which is the other thing the Spanish version cannot do -- there a pair card may
teach two words, so how many WORDS a level teaches is not derivable from the
shipped file at all.

AND IT IS REPRODUCIBLE: no clock is read.  `exportedAt` and the timestamps come
from the newest of the six sources, so re-running with the same inputs writes
the same bytes and a diff means something.

Not part of the site.  The combined file is an ARTEFACT of the six shipped
decks and is deliberately not committed -- it duplicates ~14 MB already in the
repo, and this script regenerates it.
"""
import json, os, sys, hashlib, re

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
DECKS = os.path.abspath(os.path.join(HERE, '..', '..', 'decks'))

from delf_level import EXAM, DECK_FILES, PHRASES

LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']

# THE SEVENTH SUBDECK IS NOT A SEVENTH LEVEL, and the two lists say so.  Every
# figure here that is per level (`title`, the exam runs, the `A1`…`C2` subdeck
# names) walks LEVELS; everything that is per subdeck walks PARTS.  Merged into
# one list the title would ask `EXAM['phrases']` and die -- which is the right
# failure, and is why the tables are kept apart rather than given a row that
# calls the expressions a diploma.
PARTS = LEVELS + [PHRASES]
SUB_NAME = {lv: lv.upper() for lv in LEVELS}
SUB_NAME[PHRASES] = 'Expressions'

DECK_ID = 'delfall'

# app.js's own limits, restated here so this refuses to write a file that cannot
# be imported rather than leaving it to be found on a phone.  UDECK_MAX_CARDS
# counts NOTES -- what the file holds -- not the cards app.js expands them into.
MAX_NOTES = 12000
MAX_BYTES = 48 * 1024 * 1024


def load(lv):
    with open(os.path.join(DECKS, DECK_FILES[lv]), encoding='utf-8') as f:
        return json.load(f)


def title():
    """`DELF A1-B2 & DALF C1-C2 - French`, built from the table, not typed."""
    runs = []
    for lv in LEVELS:
        if runs and runs[-1][0] == EXAM[lv]:
            runs[-1][1].append(lv)
        else:
            runs.append([EXAM[lv], [lv]])
    parts = [f"{ex} {ls[0].upper()}–{ls[-1].upper()}" if len(ls) > 1
             else f"{ex} {ls[0].upper()}" for ex, ls in runs]
    # …and the expressions are named separately, because they are not an exam
    # level and a title that folded them into the runs above would say there is
    # a DALF paper in idiom.
    return ' & '.join(parts) + ' + expressions — French'


def stats(cards):
    """Counted off the cards, never read out of the six descriptions."""
    def has(c, k):
        return bool((c.get('fields') or {}).get(k))
    verbs = sum(1 for c in cards if has(c, 'Conjugation')
                and 'uc-cj-h">Présent' in c['fields']['Conjugation'])
    adjs = sum(1 for c in cards if has(c, 'Conjugation')
               and 'uc-cj-h">Accord' in c['fields']['Conjugation'])
    return dict(
        words=len(cards),
        # A NOUN IS ONE WHOSE HEADWORD CARRIES AN ARTICLE, and the article is
        # MARKUP rather than a word: `emit` writes it as a `uc-art` span so the
        # card can colour it by gender.  Matching `le ` at the head of the
        # string reads as a plain-text field and silently counts none of them.
        nouns=sum(1 for c in cards
                  if 'class="uc-art' in c['fields'].get('French', '')),
        verbs=verbs, adjs=adjs,
        ipa=sum(1 for c in cards if has(c, 'Ipa')),
        exs=sum(1 for c in cards if has(c, 'Examples')),
    )


def desc(s, per_level):
    lvls = [(lv, n) for lv, n in per_level if lv in LEVELS]
    phr = dict(per_level).get(PHRASES, 0)
    per = ', '.join(f'{lv.upper()} {n:,}' for lv, n in lvls[:-1])
    per += f' and {lvls[-1][0].upper()} {lvls[-1][1]:,}'
    n_lvl = sum(n for _, n in lvls)
    return (
        'All six French levels in one deck, a subdeck per level, plus a seventh of the set '
        'expressions no vocabulary list can teach. Add a whole level, or just '
        'one direction of it: each word is a single note carrying two cards — French → English '
        '(see the French, recall the meaning) and English → French (see an English meaning, '
        'recall the French) — so the two directions are listed under each level and study '
        'separately, on schedules of their own, while a correction to a word is a correction '
        'to both. '
        f'The levels teach {per} words — {n_lvl:,} in all — and no word is taught twice, since '
        'each level excludes every word the levels below it contains. '
        + ('' if not phr else
           f'The Expressions subdeck adds {phr:,} more: the things French says as a unit, which '
           'a list of words cannot give you because they are not words. avoir is on the A1 page '
           'and faim is on the A2 page and avoir faim is on neither, and knowing the two halves '
           'does not tell you it means to be hungry rather than to have hunger — the same goes '
           'for tout de suite, du coup, en train de and ça marche. They are not from a list at '
           'all: they are the dictionary\'s own multi-word entries, ranked by how often they '
           'turn up in a corpus of everyday sentences and then read one by one, with the '
           'compound nouns, the regional, the obsolete and sixty-odd ordinary runs of words '
           'thrown out. That subdeck\'s own description says which and why. ')
        # the total belongs to whatever came before it, so it is worded to close
        # the paragraph it follows rather than left as a bare figure sentence
        + (f'Between them that is {s["words"]:,} words and expressions, on '
           f'{s["words"] * 2:,} cards. ' if phr else
           f'{s["words"]:,} in all, on {s["words"] * 2:,} cards. ')
        # NOTE THE `+`: implicit concatenation joins two string LITERALS, and the
        # line above is now a parenthesised expression, so the rest of the
        # paragraph has to be added rather than juxtaposed.
        + 'A1 to B2 are the DELF and C1 and C2 are the DALF, the diplôme approfondi de langue '
        'française — a different diploma under the same authority, France Éducation '
        'international, for the French Ministry of Education. '
        'A NOTE ON THE WORD LISTS, because they are not the exam board\'s. France Éducation '
        'international publishes no vocabulary list for either diploma: it publishes a syllabus '
        'of themes, and the reference work that turns those into words is a commercially '
        'published book. The lists here are a third party\'s, taken from the six level pages of '
        'minddory.com and checked against Wiktionary word by word — a few dozen misspellings, '
        'duplicates and inflected forms standing in for their citation form were repaired, and '
        'each level\'s own description names its own. They are graded by frequency, which was '
        'measured rather than assumed: ranked against a word list built from film and television '
        'subtitles, the six pages\' medians run 700, 1,754, 4,861, 15,490, 18,538 and 21,194, so '
        'each really is rarer vocabulary than the one below it. But that corpus is DIALOGUE, and '
        'the higher the band the more its own character shows — by C2 the page is largely the '
        'vocabulary of genre television rather than the abstract, argumentative French the DALF '
        'is examined on. So the lists have been added to at both ends: the closed classes a '
        'frequency cut cannot see (this deck taught pas and not ne, and je, tu, il, elle, nous '
        'and vous but not on) and, at C1 and C2, the connectives and abstract vocabulary of '
        'argument, written in because no amount of counting subtitles would have found them. '
        'Within each level the cards are ordered roughly by how common the word is in everyday '
        'French, so the words you meet most often come first, with a phrase — which a list of '
        'single words cannot see — placed by how often it turns up in a corpus of everyday '
        'sentences. '
        f'Every noun carries its article, so the gender is learnt with the word ({s["nouns"]:,} '
        'of them), and the article is coloured by gender: le blue, la red. Where the article '
        'elides — l\'arbre, l\'eau, l\'école — it hides the very thing it is there to teach, so '
        'those words also carry un or une, which does not elide. A plural is given where it is '
        'irregular, and not where French simply adds -s; where a noun names a person its '
        'feminine is given too, read from the dictionary and never derived, since -e only looks '
        'like a rule (le serveur, la serveuse). '
        f'Each of the {s["verbs"]:,} verbs carries its full paradigm: the infinitive, the past '
        'participle, the present participle and the auxiliary it takes, then the présent, the '
        'passé composé, the imparfait, the futur simple and the impératif, each in all six '
        'persons from je to ils/elles. The passé composé is the point — it is how a French '
        'speaker talks about the past, and whether a verb takes avoir or être has to be learnt '
        'with the verb. Agreement is printed the way a textbook prints it, je suis allé(e), so '
        f'the bracket teaches the rule rather than hiding it. The {s["adjs"]:,} adjectives carry '
        'their feminine and their agreement table, since French forms the feminine '
        'unpredictably — blanc, blanche; beau, belle; vieux, vieille. '
        'The pronunciation is given in the international phonetic alphabet on the back of every '
        f'card that has one ({s["ipa"]:,} of them), because French spelling does not say how a '
        'word sounds, and there is a speaker button on the word and on every example sentence. '
        f'Real example sentences come with {s["exs"]:,} of the {s["words"]:,} words and '
        'expressions, up to three '
        'apiece, chosen where possible to show three different inflected forms rather than the '
        'same one three times, with the word picked out in colour; the sentence corpus has '
        f'nothing at all for the other {s["words"] - s["exs"]:,}, which are kept because a word '
        'list is not set by a sentence corpus. '
        'Word lists: minddory.com (the lists of words only). Meanings, genders, plurals, '
        'feminines, conjugations and pronunciations: English Wiktionary, via the kaikki.org '
        'extraction (CC BY-SA 4.0). Frequency ordering: a word list built from OpenSubtitles '
        '(hermitdave/FrequencyWords, CC BY-SA 4.0). Example sentences: Tatoeba (tatoeba.org), '
        'CC BY 2.0 FR.'
    )


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        DECKS, 'French-A1-C2.folio-deck.json')

    decks = [(lv, load(lv)) for lv in PARTS]

    # the type block is shared, and that is asserted rather than assumed
    sigs = {lv: hashlib.sha1(json.dumps(d['meta']['types'], sort_keys=True,
                                        ensure_ascii=False).encode()).hexdigest()
            for lv, d in decks}
    if len(set(sigs.values())) != 1:
        raise SystemExit('the six decks no longer share a card-type block: '
                         + json.dumps(sigs, indent=2))
    types = decks[0][1]['meta']['types']

    cards, per_level = [], []
    for lv, d in decks:
        per_level.append((lv, len(d['cards'])))
        for c in d['cards']:
            n = len(cards) + 1
            # A LEVEL WITH NO SUBDECKS OF ITS OWN, asserted: every French card
            # carries an empty `sub`, and one that did not would put a stray
            # nested row in a tree this file says is flat.
            if (c.get('sub') or ''):
                raise SystemExit(f'{lv} card {c["id"]} already has a sub: '
                                 f'{c["sub"]!r}')
            cards.append(dict(c, id=f'u_{DECK_ID}_{n}', num=str(n),
                              category=EXAM.get(lv, 'Expressions'),
                              sub=SUB_NAME[lv]))

    if len(cards) > MAX_NOTES:
        raise SystemExit(f'{len(cards)} notes, over app.js\'s {MAX_NOTES} cap')

    s = stats(cards)
    ts = max(d['meta']['updatedAt'] for _, d in decks)
    doc = {
        'folioDeck': 1,
        'exportedAt': ts,
        'meta': {
            'id': DECK_ID,
            'title': title(),
            'subtitle': f'{s["words"]:,} words and expressions · a subdeck per '
                        'level and one of idiom, both directions in each',
            'desc': desc(s, per_level),
            'author': '',
            'language': 'en',
            'color': decks[0][1]['meta'].get('color', ''),
            'tags': ['french', 'delf', 'dalf', 'a1', 'a2', 'b1', 'b2', 'c1',
                     'c2', 'cefr', 'vocabulary', 'expressions'],
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
    print(f'  {title()}')
    print(f'  {len(cards):,} notes = {len(cards) * 2:,} cards, '
          f'{size / 1048576:.2f} MB '
          f'(caps: {MAX_NOTES:,} notes, {MAX_BYTES / 1048576:.0f} MB)')
    subs = []
    for c in cards:
        if c['sub'] not in subs:
            subs.append(c['sub'])
    print(f'  {len(subs)} subdecks: ' + ', '.join(
        f'{lv} {n:,}' for lv, n in ((s, sum(1 for c in cards if c['sub'] == s))
                                    for s in subs)))
    print('  ' + '  '.join(f'{k} {v:,}' for k, v in s.items()))
    colon_sweep(cards)


def colon_sweep(cards):
    """Is every COLON_GLOSS row still doing something, anywhere on the shelf?

    `build_deck.py` cannot answer this: a level legitimately carries only some of
    the twelve, so a staleness check there fires on every run of every level and
    becomes a warning nobody reads.  Here all seven decks are in hand at once,
    and two opposite faults are visible that are invisible from either end --

      * a KEY still on a card means the fix did not fire at all (the table is
        matched against the FINAL rendered line, so a change to `meaning_lines`
        upstream can move that string out from under it);
      * a row whose replacement appears NOWHERE has gone stale, which is what
        Wiktionary rewording a sense looks like from here.
    """
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        'colon', os.path.join(os.path.dirname(os.path.abspath(__file__)),
                              'build_deck.py'))
    # build_deck runs a whole level on import, so the table is read as TEXT --
    # the same trick check-phrases.js uses on phraselist.py, and for the same
    # reason: the declaration is the thing under test, not the module.
    src = open(spec.origin, encoding='utf-8').read()
    body = src.split('COLON_GLOSS = {', 1)[1].split('\n}', 1)[0]
    table = eval('{' + body + '\n}')                       # noqa: S307 - our own
    blob = json.dumps(cards, ensure_ascii=False)
    live = [k for k in table if k in blob]
    gone = [k for k, v in table.items() if v and v not in blob]
    if live:
        print('  !! COLON_GLOSS did not fire -- these are still on a card:\n    ' +
              '\n    '.join(live))
    if gone:
        print('  !! COLON_GLOSS rows whose replacement is on no card; the source'
              ' has probably reworded them:\n    ' + '\n    '.join(gone))
    if not live and not gone:
        print(f'  colon glosses: all {len(table)} declared rows still resolve')


if __name__ == '__main__':
    main()
