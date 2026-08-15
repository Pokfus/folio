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
    ('HSK1-Mandarin.folio-deck.json',     'Mandarin', 'HSK 1'),
    ('HSK2-Mandarin.folio-deck.json',     'Mandarin', 'HSK 2'),
    ('Mandarin-Chinese.folio-deck.json',  'Mandarin', 'HSK 3.0'),
    ('DELE-A1-Spanish.folio-deck.json',   'Spanish',  'A1'),
    ('DELE-A2-Spanish.folio-deck.json',   'Spanish',  'A2'),
    ('DELE-B1-Spanish.folio-deck.json',   'Spanish',  'B1'),
    ('DELE-B2-Spanish.folio-deck.json',   'Spanish',  'B2'),
]
# The combined files the two language pipelines write.  Skipped rather than
# listed, and named here so the unlisted-file check above can tell "an artefact
# we already know about" from "a deck somebody added and this table missed".
ARTEFACTS = {'French-A1-C2.folio-deck.json', 'Italian-Complete.folio-deck.json',
             'DELE-A1-B2-Spanish.folio-deck.json', OUT}


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
    cards, types, langs, stamp = [], {}, [], 0
    per_part, per_lang = [], {}
    for fn, lang, path in PARTS:
        d = json.load(open(os.path.join(DECKS, fn), encoding='utf-8'))
        if lang not in per_lang:
            langs.append(lang)
            per_lang[lang] = 0

        # EVERY TYPE TRAVELS, AND A COLLIDING ID IS REFUSED RATHER THAN PICKED
        # BETWEEN.  Two decks sharing a type id with DIFFERENT templates would
        # render one language's cards with another's -- which looks like a card
        # merely laid out oddly, not like a fault, so it must stop the build.
        for tid, t in (d['meta'].get('types') or {}).items():
            if tid in types and types[tid] != t:
                raise SystemExit(f'two decks define the card type "{tid}" differently; '
                                 f'one of them would render with the other\'s templates')
            types[tid] = t

        for c in d['cards']:
            c = dict(c)
            # A CARD ID MUST CARRY THE DECK.  A deck FILE import only mints fresh
            # ids when the DECK id already exists, so reusing `u_delfa1_1` here
            # collides with an installed DELF A1 in the shared UCARDS store and
            # studies the wrong card -- the fault the Spanish generator had
            # between its own levels.
            c['id'] = f'u_{DECK_ID}_{len(cards) + 1}'
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
