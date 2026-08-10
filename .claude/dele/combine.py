#!/usr/bin/env python3
"""Combine the four shipped DELE decks into ONE importable deck file.

    python3 .claude/dele/combine.py [out.folio-deck.json]

It reads `decks/DELE-*.folio-deck.json` and writes a single deck whose eight
subdecks are the four levels' two directions, in order:

    A1 · Spanish → English      A1 · English → Spanish
    A2 · Spanish → English      A2 · English → Spanish
    B1 · …                      B1 · …
    B2 · …                      B2 · …

so a reader adds exactly the level and direction they want, and the four levels
stay separable inside one file rather than being poured together.

FIVE THINGS IT HAS TO GET RIGHT, and four of them fail silently.

A CARD ID MUST CARRY THE DECK.  Every card is renumbered `u_deleall_N`.  A deck
FILE import only mints fresh card ids when the DECK id already exists, so a
combined deck reusing `u_delea1_1` would collide with an installed A1 in the
shared `UCARDS` store and study the wrong card — the fault this generator has
already had once, between A1 and A2, where both decks sat on the shelf with
their full counts and nothing threw.  `deleall` is likewise its own deck id.

THE SUBDECK IS A STRING ON THE CARD and the deck's subdecks are the DISTINCT
values in CARD ORDER, so the cards are concatenated level by level and the
order above follows.  A sub title may not contain `/`: the entry id is
`u:<deckId>/<title>` and `uDeckIdOf` splits on the first one.

THE TYPE BLOCK IS SHARED.  All four decks carry byte-identical `types`, which
is asserted rather than assumed — a level rebuilt against a changed template
would otherwise have its cards silently rendered by another level's.

THE COUNTS IN THE DESCRIPTION ARE COUNTED, never carried over from the four
descriptions and added up.  A figure restated by hand is a figure that goes
stale the next time a level is rebuilt.

AND IT IS REPRODUCIBLE: no clock is read.  `exportedAt` and the timestamps come
from the newest of the four sources, so re-running with the same inputs writes
the same bytes and a diff means something.

Not part of the site.  The combined file is an ARTEFACT of the four shipped
decks and is deliberately not committed — it duplicates ~28 MB already in the
repo, and this script regenerates it.
"""
import json, os, sys, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
DECKS = os.path.abspath(os.path.join(HERE, '..', '..', 'decks'))

from dele_level import TARGET          # the syllabus sizes, in one place

LEVELS = ['A1', 'A2', 'B1', 'B2']
DECK_ID = 'deleall'
TITLE = 'DELE A1–B2 — Spanish'

# app.js's own limits, restated here so this refuses to write a file that
# cannot be imported rather than leaving it to be found on a phone.
MAX_CARDS = 12000
MAX_BYTES = 48 * 1024 * 1024


def load(level):
    p = os.path.join(DECKS, f'DELE-{level}-Spanish.folio-deck.json')
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def stats(cards):
    """Counted off the cards, not read out of the four descriptions.

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


def desc(s, per_level):
    n = f"{s['cards']:,}"
    sizes = [TARGET[lv.lower()] for lv, _ in per_level]
    return (
        'All four DELE levels in one deck. The eight subdecks can be added and '
        'studied separately, so you take the level you are working at and the '
        'direction you want: for each of A1, A2, B1 and B2, Spanish → English '
        '(see the Spanish, recall the meaning) and English → Spanish (see an '
        'English meaning, recall the Spanish). '
        + 'The four levels teach '
        + ', '.join(f'{c:,}' for c in sizes[:-1]) + f' and {sizes[-1]:,} words '
        f'— {sum(sizes):,} in all, and no word is taught twice, since each '
        'level excludes every word the levels below it contain. They sit on '
        f'{n} cards in each direction, because a masculine and a feminine '
        'headword that are both in the word list share one card. '
        'There is no official published DELE word list, so the vocabulary is '
        "taken from the body that sets the exam: the level's own column of the "
        "Instituto Cervantes' own Plan curricular — its inventories of Nociones "
        'específicas and Nociones generales, which are printed two levels to a '
        'page, A1 beside A2 and B1 beside B2, so each half can be read off on '
        'its own. Those inventories list topics rather than words, so what they '
        'name without writing out is supplied here: at the lower levels the '
        'closed classes (the numbers, the days, the months, the seasons, and '
        'the pronouns, articles, prepositions and conjunctions inventoried '
        'separately under Gramática), and at the upper ones the layer that '
        'structures an argument (the connectives that concede, contrast, '
        'qualify and conclude, most of them as the phrases they are — por '
        'consiguiente, aun cuando, en la medida en que, a diferencia de). The '
        'rest of each level is filled from its own column in order of '
        'frequency. '
        'Within each subdeck the cards are ordered roughly by how common the '
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


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        DECKS, 'DELE-A1-B2-Spanish.folio-deck.json')

    decks = [(lv, load(lv)) for lv in LEVELS]

    # the type block is shared, and that is asserted rather than assumed
    sigs = {lv: hashlib.sha1(json.dumps(d['meta']['types'], sort_keys=True,
                                        ensure_ascii=False).encode()).hexdigest()
            for lv, d in decks}
    if len(set(sigs.values())) != 1:
        raise SystemExit('the four decks no longer share a card-type block: '
                         + json.dumps(sigs, indent=2))
    types = decks[0][1]['meta']['types']

    cards, per_level = [], []
    for lv, d in decks:
        by_sub = {}
        for c in d['cards']:
            by_sub.setdefault(c['sub'], []).append(c)
        per_level.append((lv, sum(1 for c in d['cards'] if c['type'] == 'es-to-en')))
        for sub in by_sub:                       # insertion order = card order
            if '/' in sub:
                raise SystemExit(f'sub title contains a slash: {sub!r}')
            for c in by_sub[sub]:
                n = len(cards) + 1
                cards.append(dict(c, id=f'u_{DECK_ID}_{n}', num=str(n),
                                  category='DELE', sub=f'{lv} · {sub}'))

    if len(cards) > MAX_CARDS:
        raise SystemExit(f'{len(cards)} cards, over app.js\'s {MAX_CARDS} cap')

    s = stats(cards)
    ts = max(d['meta']['updatedAt'] for _, d in decks)
    doc = {
        'folioDeck': 1,
        'exportedAt': ts,
        'meta': {
            'id': DECK_ID,
            'title': TITLE,
            'subtitle': f'{sum(TARGET[l.lower()] for l in LEVELS):,} words '
                        'across all four levels · both directions, as eight '
                        'subdecks',
            'desc': desc(s, per_level),
            'author': '',
            'language': 'en',
            'tags': ['spanish', 'dele', 'a1', 'a2', 'b1', 'b2', 'cefr',
                     'vocabulary'],
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
    if len(text.encode('utf-8')) > MAX_BYTES:
        raise SystemExit(f'{len(text.encode("utf-8"))/1048576:.1f} MB, over '
                         f'app.js\'s {MAX_BYTES/1048576:.0f} MB cap')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(text)

    subs = []
    for c in cards:
        if c['sub'] not in subs:
            subs.append(c['sub'])
    print(f'{out}')
    print(f'  {len(cards):,} cards, {len(text.encode("utf-8"))/1048576:.1f} MB '
          f'(caps: {MAX_CARDS:,} cards, {MAX_BYTES/1048576:.0f} MB)')
    print(f'  {len(subs)} subdecks: ' + ', '.join(subs))
    print('  ' + '  '.join(f'{k} {v:,}' for k, v in s.items()))


if __name__ == '__main__':
    main()
