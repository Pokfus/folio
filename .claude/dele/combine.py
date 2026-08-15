#!/usr/bin/env python3
"""Combine the shipped Spanish decks into importable multi-level deck files.

    python3 .claude/dele/combine.py

It reads `decks/DELE-*.folio-deck.json` and `decks/Spanish-Phrases.folio-deck.json`
and writes deck files whose subdecks NEST, a direction inside a level:

    A1                        B1
      Spanish → English         …
      English → Spanish       B2
    A2                          …
      …

so a reader adds a whole level or one direction of it, and the levels stay
separable inside one file rather than being poured together.

IT WRITES TWO FILES, AND THAT IS FORCED RATHER THAN CHOSEN.  All seven decks
come to about 15,800 cards and 55 MB, against app.js's import caps of 12,000
cards and 48 MB, so one file is not possible at these sizes and shrinking the
content to fit would be answering the wrong question.  The cut is made where the
CEFR itself makes one: A1–B2, the levels a learner works up through, with the
phrases deck; and C1–C2, the two mastery levels.  Each file is a whole deck in
its own right, they share no card, and a reader can import one or both.

SIX THINGS IT HAS TO GET RIGHT, and five of them fail silently.

A CARD ID MUST CARRY THE DECK.  Every card is renumbered `u_<deckid>_N`.  A deck
FILE import only mints fresh card ids when the DECK id already exists, so a
combined deck reusing `u_delea1_1` would collide with an installed A1 in the
shared `UCARDS` store and study the wrong card — the fault this generator has
already had once, between A1 and A2, where both decks sat on the shelf with
their full counts and nothing threw.  Each combined file is likewise its own
deck id, so the two can be installed together.

THE SUBDECK IS A STRING ON THE CARD and the deck's subdecks are the DISTINCT
values in CARD ORDER, so the cards are concatenated level by level and the
order above follows.  NESTING is `::` inside that same string — Anki's deck
separator, which app.js adopted for this in Aug 2026 — so it needs no field of
its own and travels wherever the card does.  A segment may not contain `::`,
and none of these does.

THE TYPE BLOCK IS SHARED.  Every deck carries a byte-identical `types`, which is
asserted rather than assumed — a level rebuilt against a changed template would
otherwise have its cards silently rendered by another level's.  It holds across
the phrases deck too, which is why that deck is emitted by the same `emit.py`.

THE CAPS ARE CHECKED PER FILE, not for the set, and a file over either of them
is refused rather than written and left to fail on a phone.

THE COUNTS IN THE DESCRIPTION ARE COUNTED, never carried over from the source
descriptions and added up.  A figure restated by hand is a figure that goes
stale the next time a level is rebuilt.

AND IT IS REPRODUCIBLE: no clock is read.  `exportedAt` and the timestamps come
from the newest of the sources, so re-running with the same inputs writes the
same bytes and a diff means something.

Not part of the site.  The combined files are ARTEFACTS of the shipped decks and
are deliberately not committed — they duplicate ~55 MB already in the repo, and
this script regenerates them.
"""
import json, os, sys, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
DECKS = os.path.abspath(os.path.join(HERE, '..', '..', 'decks'))

from dele_level import TARGET, DECK_FILES   # the syllabus sizes, in one place

SUB_SEP = '::'          # app.js's own subdeck separator; keep the two in step

# app.js's own limits, restated here so this refuses to write a file that
# cannot be imported rather than leaving it to be found on a phone.
MAX_CARDS = 12000
MAX_BYTES = 48 * 1024 * 1024

# key -> the name its subdeck takes at the top level of a combined file
LABEL = {'a1': 'A1', 'a2': 'A2', 'b1': 'B1', 'b2': 'B2', 'c1': 'C1', 'c2': 'C2',
         'ph': 'Phrases'}

FILES = [
    dict(id='delelow', title='DELE A1–B2 and Phrases — Spanish',
         out='DELE-A1-B2-and-Phrases-Spanish.folio-deck.json',
         parts=['a1', 'a2', 'b1', 'b2', 'ph'],
         other='the C1 and C2 levels, which are a second file of the same shape'),
    dict(id='delehigh', title='DELE C1–C2 — Spanish',
         out='DELE-C1-C2-Spanish.folio-deck.json',
         parts=['c1', 'c2'],
         other='A1 to B2 and the phrases deck, which are a first file of the same shape'),
]


def load(key):
    p = os.path.join(DECKS, DECK_FILES[key])
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def stats(cards):
    """Counted off the cards, not read out of the source descriptions.

    THE CARD COUNT IS NOT THE WORD COUNT, and neither can stand in for the
    other here.  A masculine and a feminine headword that are both in the word
    list share ONE card (`el nino, la nina`), so a forward card may teach two
    words; and a pair whose feminine was NOT selected shows that feminine as a
    form while teaching one word.  The shipped files do not record which of the
    two a pair card is, so how many WORDS a level teaches is not derivable from
    them at all -- it is the level's own target, and is read from `dele_level`
    rather than counted or restated.
    """
    fwd = [c for c in cards if c['type'] == 'es-to-en']
    verbs = sum(1 for c in fwd if c['fields'].get('Conjugation'))
    refl = sum(1 for c in fwd if c['fields'].get('Conjugation')
               and c['fields']['Word'].endswith('se'))
    nouns = sum(1 for c in fwd
                if c['fields']['Spanish'].split(' ')[0] in ('el', 'la', 'los', 'las'))
    pairs = sum(1 for c in fwd if ', ' in c['fields']['Spanish'])
    exs = sum(1 for c in fwd if c['fields'].get('Examples'))
    return dict(cards=len(fwd), verbs=verbs, refl=refl, nouns=nouns,
                pairs=pairs, exs=exs)


def andlist(xs):
    xs = list(xs)
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' and ' + xs[-1]


def desc(spec, s):
    levels = [k for k in spec['parts'] if k != 'ph']
    has_ph = 'ph' in spec['parts']
    names = [LABEL[k] for k in levels]
    sizes = [TARGET[k] for k in levels]
    n = f"{s['cards']:,}"

    what = (f"{andlist(names)} in one deck"
            + (", with a deck of common phrases and expressions beside them. "
               if has_ph else ". "))
    return (
        what +
        'The subdecks nest — a level, and the two study directions inside it — so you '
        'can add a whole level or just the direction you want, and study each on its own: '
        'Spanish → English (see the Spanish, recall the meaning) and English → Spanish '
        '(see an English meaning, recall the Spanish). '
        f"The {'levels' if len(levels) > 1 else 'level'} here teach "
        + andlist([f'{c:,}' for c in sizes]) + f' words — {sum(sizes):,} in all'
        + (f", and the phrases deck adds {TARGET['ph']:,} set expressions. "
           if has_ph else '. ')
        + 'No word is taught twice: each level excludes every word the levels below it '
        'contain'
        + (', and the phrases deck excludes every multi-word item all six levels carry. '
           if has_ph else '. ')
        + f'They sit on {n} cards in each direction, because a masculine and a feminine '
        'headword that are both in the word list share one card. '
        'The six DELE levels are split across two files because all seven together run '
        'past the size a single deck file can be imported at; this one carries '
        + andlist(names + (['the phrases'] if has_ph else [])) + ', and '
        + spec['other'] + '. '
        'There is no official published DELE word list, so the vocabulary is '
        "taken from the body that sets the exam: the level's own column of the "
        "Instituto Cervantes' own Plan curricular — its inventories of Nociones "
        'específicas and Nociones generales, which are printed two levels to a '
        'page, A1 beside A2, B1 beside B2 and C1 beside C2, so each half can be read off '
        'on its own. Those inventories list topics rather than words, so what they '
        'name without writing out is supplied here: at the lower levels the '
        'closed classes (the numbers, the days, the months, the seasons, and '
        'the pronouns, articles, prepositions and conjunctions inventoried '
        'separately under Gramática), and at the middle ones the layer that '
        'structures an argument (the connectives that concede, contrast, '
        'qualify and conclude, most of them as the phrases they are — por '
        'consiguiente, aun cuando, en la medida en que, a diferencia de). By C1 '
        'nothing has to be supplied at all, the column being large enough to fill the '
        'level several times over on its own. The '
        'rest of each level is filled from its own column in order of '
        'frequency. '
        + ('The phrases deck is built differently, because there is no published list of '
           'the expressions a learner should know: its candidates are every multi-word '
           'entry in the Spanish Wiktionary — a dictionary gives a string of words an '
           'entry only when it is an expression in its own right — and which of them are '
           'common is measured by counting each one in a corpus of everyday sentences '
           'rather than asserted. '
           if has_ph else '')
        + 'Within each subdeck the cards are ordered roughly by how common the '
        'word is in everyday Spanish, so the words you will meet most often '
        'come first: the order is taken from a frequency list built from film '
        'and television subtitles, with a reflexive verb placed by the verb it '
        'is formed from and a phrase, which a list of single words cannot see, '
        'placed by how often it turns up in a corpus of everyday sentences. '
        f"Every noun carries its article, so the gender is learnt with the word "
        f"({s['nouns']:,} of them), and its plural sits directly beneath it; a "
        'noun beginning with a stressed a- is given the el it takes in the '
        'singular and the las it takes in the plural (el agua, las aguas). A '
        'noun or adjective with a distinct feminine is taught as a pair rather '
        f"than as two words ({s['pairs']:,} of them): el niño, la niña above "
        'los niños, las niñas, and rojo, roja above rojos, rojas. Where both '
        'halves are in the word list they share one card. '
        f"Each of the {s['verbs']:,} verbs carries its full conjugation: the "
        'non-finite forms, all five simple tenses of the indicative, the '
        'present, both imperfects and the future of the subjunctive, and the '
        'imperative in both its affirmative and its negative. Six persons are '
        'shown, from yo to ellos; the Rioplatense vos is not. Compound tenses '
        'are formed with haber and the past participle, which is given. The '
        f"{s['refl']:,} reflexive verbs are conjugated with their pronouns (me "
        'llamo, te llamas), including the written accent the imperative takes '
        'when the pronoun is attached (llámate, levántense). '
        f"Real example sentences come with {s['exs']:,} of the {n} cards, up to "
        'three apiece, chosen where possible to show three different inflected '
        'forms rather than the same one three times, with the word picked out '
        'in colour and a speaker beside it; the sentence corpus has nothing at '
        f"all for the remaining {s['cards'] - s['exs']:,}, which are kept "
        'because the word list is set by the exam board and not by the corpus. '
        'Word list: Plan curricular del Instituto Cervantes (cvc.cervantes.es). '
        'Meanings, genders, plurals and conjugations: English Wiktionary, via '
        'the kaikki.org extraction (CC BY-SA 4.0). Frequency ordering: a word '
        'list built from OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA '
        '4.0). Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR.'
    )


def build(spec, decks):
    types = decks[spec['parts'][0]]['meta']['types']
    cards = []
    for key in spec['parts']:
        d = decks[key]
        by_sub = {}
        for c in d['cards']:
            by_sub.setdefault(c['sub'], []).append(c)
        for sub in by_sub:                       # insertion order = card order
            if SUB_SEP in sub:
                raise SystemExit(f'sub title contains {SUB_SEP!r}: {sub!r}')
            for c in by_sub[sub]:
                n = len(cards) + 1
                cards.append(dict(c, id=f"u_{spec['id']}_{n}", num=str(n),
                                  category='Spanish',
                                  sub=f'{LABEL[key]}{SUB_SEP}{sub}'))

    if len(cards) > MAX_CARDS:
        raise SystemExit(f"{spec['out']}: {len(cards)} cards, over app.js's "
                         f'{MAX_CARDS} cap')

    s = stats(cards)
    ts = max(decks[k]['meta']['updatedAt'] for k in spec['parts'])
    levels = [k for k in spec['parts'] if k != 'ph']
    words = sum(TARGET[k] for k in levels)
    doc = {
        'folioDeck': 1,
        'exportedAt': ts,
        'meta': {
            'id': spec['id'],
            'title': spec['title'],
            'subtitle': (f'{words:,} words'
                         + (f" and {TARGET['ph']:,} phrases"
                            if 'ph' in spec['parts'] else '')
                         + ' · a subdeck per level, and the two directions inside it'),
            'desc': desc(spec, s),
            'author': '',
            'language': 'en',
            'tags': ['spanish', 'dele', 'cefr', 'vocabulary']
                    + [LABEL[k].lower() for k in spec['parts']],
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
    nbytes = len(text.encode('utf-8'))
    if nbytes > MAX_BYTES:
        raise SystemExit(f"{spec['out']}: {nbytes/1048576:.1f} MB, over app.js's "
                         f'{MAX_BYTES/1048576:.0f} MB cap')
    out = os.path.join(DECKS, spec['out'])
    with open(out, 'w', encoding='utf-8') as f:
        f.write(text)

    subs, nodes = [], []
    for c in cards:
        if c['sub'] not in subs:
            subs.append(c['sub'])
            parts = c['sub'].split(SUB_SEP)
            for i in range(1, len(parts) + 1):
                q = SUB_SEP.join(parts[:i])
                if q not in nodes:
                    nodes.append(q)
    print(f'{out}')
    print(f'  {len(cards):,} cards, {nbytes/1048576:.1f} MB '
          f'(caps: {MAX_CARDS:,} cards, {MAX_BYTES/1048576:.0f} MB)')
    print(f'  {len(nodes)} subdecks ({len(subs)} of them leaves):')
    for q in nodes:
        print('    ' + '  ' * q.count(SUB_SEP) + q.split(SUB_SEP)[-1])
    print('  ' + '  '.join(f'{k} {v:,}' for k, v in s.items()))
    return len(cards), nbytes


def main():
    keys = [k for f in FILES for k in f['parts']]
    decks = {k: load(k) for k in keys}

    # the type block is shared, and that is asserted rather than assumed
    sigs = {k: hashlib.sha1(json.dumps(d['meta']['types'], sort_keys=True,
                                       ensure_ascii=False).encode()).hexdigest()
            for k, d in decks.items()}
    if len(set(sigs.values())) != 1:
        raise SystemExit('the decks no longer share a card-type block: '
                         + json.dumps(sigs, indent=2))

    tot_c = tot_b = 0
    for spec in FILES:
        c, b = build(spec, decks)
        tot_c += c
        tot_b += b
    print(f'\n{len(FILES)} files, {tot_c:,} cards, {tot_b/1048576:.1f} MB in all')


if __name__ == '__main__':
    main()
