#!/usr/bin/env python3
"""Every deck in `decks/` as ONE importable file, a language per branch.

    python3 .claude/combine-decks.py [out.json]

WHY THIS IS A THIRD COMBINER AND NOT A FLAG ON ONE OF THE OTHERS.  `dele/
combine.py` and `delf/combine.py` each know their own pipeline -- its levels,
its exam name, its per-level figures -- and neither has any business knowing
about the others.  What this one knows instead is a TABLE (`PARTS` below) of
which shipped file goes where in the tree, and nothing at all about how any of
them was built.  So a pipeline change reaches the language combiner and a new
language reaches this one, and the two do not have to be kept in step.

IT IS BIGGER THAN THE APP USED TO ACCEPT, AND THAT IS THE POINT OF IT.  At
28,252 notes and ~66 MB it is 2.4x the note cap and 1.4x the byte cap that
stood before it, and CLAUDE.md recorded flatly that combining everything was
"not possible as one importable file".  Both caps are guards against a hostile
or runaway file rather than views about how large a deck may usefully be, and
both are set from the largest legitimate deck anyone has brought -- so a
legitimate deck this size is the thing that moves them, which is what happened
twice before.  **The caps are READ out of app.js here** rather than restated,
so this tool and the app can never come to disagree about what will import.

THE FILE IS NOT COMMITTED, like the other two combined files: it is an artefact
of the fifteen decks it combines, every byte of it is already in the repo, and
this regenerates it.  It reads no clock -- `exportedAt` comes from the newest
source -- so the same inputs write the same bytes and a diff means something.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DECKS = os.path.join(ROOT, 'decks')

DECK_ID = 'alldecks'
OUT = 'All-Languages.folio-deck.json'

# ---------------------------------------------------------------- the tree
# (file, language, path under the language).  DECLARED rather than derived: a
# deck appearing in the combined file is a decision, and so is where it sits.
# An empty path means the deck's cards go straight under the language, and a
# deck that already has subdecks of its own keeps them BELOW whatever is named
# here -- which is how the four Spanish levels keep their two directions and
# HSK 3.0 keeps its nine levels, at no cost in this table.
#
# A FILE IN `decks/` THAT IS NOT LISTED IS AN ERROR, not a silent omission:
# combining "every deck" and quietly leaving one out is the failure this whole
# file exists to avoid, and it would look exactly like a smaller shelf.
PARTS = [
    ('DELF-A1-French.folio-deck.json',    'French',   'A1'),
    ('DELF-A2-French.folio-deck.json',    'French',   'A2'),
    ('DELF-B1-French.folio-deck.json',    'French',   'B1'),
    ('DELF-B2-French.folio-deck.json',    'French',   'B2'),
    ('DALF-C1-French.folio-deck.json',    'French',   'C1'),
    ('DALF-C2-French.folio-deck.json',    'French',   'C2'),
    ('French-Phrases.folio-deck.json',    'French',   'Expressions'),
    ('Goethe-A1-German.folio-deck.json',  'German',   'A1'),
    ('Goethe-B1-German.folio-deck.json',  'German',   'B1'),
    ('German-B2-Vocabulary.folio-deck.json', 'German', 'B2'),
    ('German-C1-Vocabulary.folio-deck.json', 'German', 'C1'),
    ('German-C2-Vocabulary.folio-deck.json', 'German', 'C2'),
    ('German-Phrases-Expressions.folio-deck.json', 'German',
     'Phrases and expressions'),
    ('CILS-A1-Italian.folio-deck.json',   'Italian',  'A1'),
    ('CILS-A2-Italian.folio-deck.json',   'Italian',  'A2'),
    ('CILS-B1-Italian.folio-deck.json',   'Italian',  'B1'),
    ('CILS-B2-Italian.folio-deck.json',   'Italian',  'B2'),
    ('CILS-C1-Italian.folio-deck.json',   'Italian',  'C1'),
    ('CILS-C2-Italian.folio-deck.json',   'Italian',  'C2'),
    # The core deck sits after the bands and NOT at the head, which is the
    # Italian combiner's own ordering and its own reasoning: the deck is named
    # for the CILS progression, so the bands lead, and the core deck is named
    # for what it is rather than left to be inferred from where it sits.
    ('Italian-Core-Vocabulary.folio-deck.json', 'Italian', 'Core vocabulary'),
    ('Italian-Phrases-Expressions.folio-deck.json', 'Italian',
     'Phrases and expressions'),
    # Indonesian is named by its PREDICATE and not by a CEFR band, because UKBI
    # does not use one -- and the predicate is what a candidate quotes, so the
    # path carries both the number the deck is studied in and the name the
    # certificate prints.  The eighth is not a predicate; see `.claude/ukbi/`.
    ('UKBI-1-Terbatas-Indonesian.folio-deck.json', 'Indonesian', 'UKBI 1 Terbatas'),
    ('UKBI-2-Marginal-Indonesian.folio-deck.json', 'Indonesian', 'UKBI 2 Marginal'),
    ('UKBI-3-Semenjana-Indonesian.folio-deck.json', 'Indonesian', 'UKBI 3 Semenjana'),
    ('UKBI-4-Madya-Indonesian.folio-deck.json', 'Indonesian', 'UKBI 4 Madya'),
    ('UKBI-5-Unggul-Indonesian.folio-deck.json', 'Indonesian', 'UKBI 5 Unggul'),
    ('UKBI-6-Sangat-Unggul-Indonesian.folio-deck.json', 'Indonesian',
     'UKBI 6 Sangat Unggul'),
    ('UKBI-7-Istimewa-Indonesian.folio-deck.json', 'Indonesian', 'UKBI 7 Istimewa'),
    ('Indonesian-Phrases-and-Expressions.folio-deck.json', 'Indonesian',
     'Phrases and expressions'),
    ('Mandarin-Chinese.folio-deck.json',  'Mandarin', 'HSK 3.0'),
    # Portuguese is the CAPLE ladder, whose own bands ARE the CEFR ones, so the
    # path is the band and nothing more.  The seventh is not a band; see
    # `.claude/caple/`, whose own combiner does not exist -- these seven have
    # only ever been shipped separately, which is why they were missing here.
    ('CAPLE-A1-Portuguese.folio-deck.json', 'Portuguese', 'A1'),
    ('CAPLE-A2-Portuguese.folio-deck.json', 'Portuguese', 'A2'),
    ('CAPLE-B1-Portuguese.folio-deck.json', 'Portuguese', 'B1'),
    ('CAPLE-B2-Portuguese.folio-deck.json', 'Portuguese', 'B2'),
    ('CAPLE-C1-Portuguese.folio-deck.json', 'Portuguese', 'C1'),
    ('CAPLE-C2-Portuguese.folio-deck.json', 'Portuguese', 'C2'),
    ('Portuguese-Phrases-and-Expressions.folio-deck.json', 'Portuguese',
     'Phrases and expressions'),
    ('DELE-A1-Spanish.folio-deck.json',   'Spanish',  'A1'),
    ('DELE-A2-Spanish.folio-deck.json',   'Spanish',  'A2'),
    ('DELE-B1-Spanish.folio-deck.json',   'Spanish',  'B1'),
    ('DELE-B2-Spanish.folio-deck.json',   'Spanish',  'B2'),
    ('DELE-C1-Spanish.folio-deck.json',   'Spanish',  'C1'),
    ('DELE-C2-Spanish.folio-deck.json',   'Spanish',  'C2'),
    ('Spanish-Phrases.folio-deck.json',   'Spanish',  'Expressions'),
]
# The combined files the two language pipelines write.  Skipped rather than
# listed, and named here so the unlisted-file check above can tell "an artefact
# we already know about" from "a deck somebody added and this table missed".
ARTEFACTS = {'French-A1-C2.folio-deck.json', 'Italian-Complete.folio-deck.json',
             'DELE-A1-B2-Spanish.folio-deck.json',
             'DELE-A1-C2-and-Phrases-Spanish.folio-deck.json',
             'Indonesian-UKBI-1-7-and-Expressions.folio-deck.json', OUT}


def app_const(name, src):
    """A cap READ off app.js, so this tool cannot drift from what will import."""
    m = re.search(r'\b' + name + r'\s*=\s*([0-9*\s]+?)[,;]', src)
    if not m:
        raise SystemExit(f'{name} is not in app.js under that name -- it has been '
                         f'renamed, and this tool would otherwise combine to a size '
                         f'the app refuses')
    return eval(m.group(1))                                  # noqa: S307 - digits and *


def main(out=None):
    out = out or os.path.join(DECKS, OUT)
    app = open(os.path.join(ROOT, 'app.js'), encoding='utf-8').read()
    max_notes = app_const('UDECK_MAX_CARDS', app)
    max_bytes = app_const('UDECK_MAX_BYTES', app)
    max_depth = app_const('SUB_MAX_DEPTH', app)
    sep = re.search(r'SUB_SEP\s*=\s*"([^"]+)"', app).group(1)

    on_disk = {f for f in os.listdir(DECKS) if f.endswith('.folio-deck.json')}
    listed = {p[0] for p in PARTS}
    missed = on_disk - listed - ARTEFACTS
    if missed:
        raise SystemExit('a deck in decks/ is not in PARTS, so "every deck" would be '
                         'a lie: ' + ', '.join(sorted(missed)))
    gone = listed - on_disk
    if gone:
        raise SystemExit('PARTS names a file that is not there: ' + ', '.join(sorted(gone)))

    # THE NEWEST SOURCE'S STAMP, TAKEN FROM `meta.updatedAt` AND NOT FROM
    # `exportedAt`.  The two pipelines write that top-level field differently --
    # French an epoch integer, Mandarin an ISO string -- so comparing them raises
    # on the first mixed pair, and picking either convention would silently
    # ignore half the shelf.  `meta.updatedAt` is an integer in every deck.
    cards, types, langs, stamp, splits = [], {}, [], 0, []
    per_part, per_lang = [], {}
    for fn, lang, path in PARTS:
        d = json.load(open(os.path.join(DECKS, fn), encoding='utf-8'))
        if lang not in per_lang:
            langs.append(lang)
            per_lang[lang] = 0

        # EVERY TYPE TRAVELS, AND A COLLIDING ID IS KEPT APART RATHER THAN PICKED
        # BETWEEN.  Two decks sharing a type id with a DIFFERENT definition would
        # otherwise have one deck's cards rendered by the other's templates and
        # CSS -- which looks like a card merely laid out oddly, not like a fault.
        # This used to REFUSE, which was right about the danger and wrong about
        # the remedy: it stopped the whole shelf combining over a difference that
        # harms nobody once the two definitions are separate objects.  A type is
        # scoped per (deck, type) at install (`cssScoped` prefixes every selector
        # with `.uc-card[data-uct="<deckId>__<typeId>"]`), so two ids inside one
        # deck is exactly what that machinery is for, and the cards of the file
        # that lost the name are repointed at the new one.
        #
        # THE SHELF REALLY DOES CARRY ONE, and it is a warning about drift rather
        # than a hypothetical: all six German decks call their type `goethe` with
        # identical fields and identical templates, and their CSS differs by one
        # rule -- Goethe A1 styles `.uc-cj-e` and the other five `.uc-infl`, two
        # names for the same marked inflection, each used by that file's own
        # cards and by no other's.  Merged either way, one deck's 3,546 or the
        # others' 77,000 marked endings would silently lose their colour.
        remap = {}
        for tid, t in (d['meta'].get('types') or {}).items():
            if tid not in types:
                types[tid] = t
                continue
            if types[tid] == t:
                continue
            alt = f'{tid}-{d["meta"]["id"]}'[:32]
            if types.get(alt, t) != t:
                raise SystemExit(f'"{tid}" collides and so does "{alt}"; give one of '
                                 f'the decks a type id of its own')
            t = dict(t, id=alt)
            types[alt] = t
            remap[tid] = alt
            splits.append((fn, tid, alt))

        for c in d['cards']:
            c = dict(c)
            # A CARD ID MUST CARRY THE DECK.  A deck FILE import only mints fresh
            # ids when the DECK id already exists, so reusing `u_delfa1_1` here
            # collides with an installed DELF A1 in the shared UCARDS store and
            # studies the wrong card -- the fault the Spanish generator had
            # between its own levels.
            c['id'] = f'u_{DECK_ID}_{len(cards) + 1}'
            if c.get('type') in remap:
                c['type'] = remap[c['type']]
            own = (c.get('sub') or '').strip()
            parts = [lang] + ([path] if path else []) + ([own] if own else [])
            if len(parts) > max_depth:
                raise SystemExit(f'{sep.join(parts)} is {len(parts)} deep and app.js '
                                 f'takes {max_depth}')
            c['sub'] = sep.join(parts)
            cards.append(c)
            per_lang[lang] += 1
        per_part.append((lang, path, len(d['cards'])))
        stamp = max(stamp, int(d['meta'].get('updatedAt') or 0))

    n = len(cards)
    if n > max_notes:
        raise SystemExit(f'{n:,} notes, over app.js\'s {max_notes:,}')

    doc = {
        'folioDeck': 1,
        'exportedAt': stamp,
        'meta': {
            'id': DECK_ID,
            'title': ' & '.join(langs[:-1]) + ' & ' + langs[-1] + ' — every deck',
            'subtitle': f'{n:,} words and expressions · a branch per language, '
                        f'both directions in each',
            'desc': desc(n, langs, per_lang, per_part),
            'author': 'Folio',
            'language': 'mul',
            'tags': ['vocabulary', 'languages'] + [l.lower() for l in langs],
            'glossMode': 'off',
            'types': types,
            'version': 1,
            'createdAt': stamp,
            'updatedAt': stamp,
        },
        'cards': cards,
        'gloss': {},
    }

    text = json.dumps(doc, ensure_ascii=False)
    size = len(text.encode('utf-8'))
    if size > max_bytes:
        raise SystemExit(f'{size / 1048576:.1f} MB, over app.js\'s '
                         f'{max_bytes / 1048576:.0f} MB cap')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(text)

    print(out)
    print(f'  {doc["meta"]["title"]}')
    print(f'  {n:,} notes = {n * 2:,} cards, {size / 1048576:.2f} MB '
          f'(caps: {max_notes:,} notes, {max_bytes / 1048576:.0f} MB)')
    print(f'  {len(types)} card types: ' + ', '.join(sorted(types)))
    for fn, tid, alt in splits:
        print(f'  ! {fn} defines "{tid}" differently; its cards use "{alt}"')
    for lang in langs:
        bits = ', '.join(f'{p} {c:,}' for l, p, c in per_part if l == lang)
        print(f'  {lang}: {per_lang[lang]:,} — {bits}')
    depth = {}
    for c in cards:
        depth[c['sub'].count(sep) + 1] = depth.get(c['sub'].count(sep) + 1, 0) + 1
    print('  subdeck depth: ' + ', '.join(f'{k} deep {v:,}' for k, v in sorted(depth.items())))


def desc(n, langs, per_lang, per_part):
    """The reader's own first screen.  Every figure is COUNTED off the cards."""
    per = '; '.join(f'{l} {per_lang[l]:,}' for l in langs)
    return (
        f'Every vocabulary deck on this shelf in one file: {" , ".join(langs[:-1])} '
        f'and {langs[-1]}, {n:,} words and expressions between them on {n * 2:,} '
        f'cards.\n\n'
        f'A branch per language, and inside it the levels each deck was published '
        f'as — so adding a language brings its levels, and adding one level brings '
        f'only that. {per}.\n\n'
        f'Every word is one note with two cards, one each way, and each direction '
        f'keeps a schedule of its own. The decks are also published separately if '
        f'you would rather take one at a time; this is the same content, combined, '
        f'and nothing in it has been rewritten.'
    )


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else None)
