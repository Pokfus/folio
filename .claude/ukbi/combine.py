#!/usr/bin/env python3
"""Combine the seven shipped UKBI decks into ONE importable deck file.

    python3 .claude/ukbi/combine.py [out.folio-deck.json]

It reads `decks/UKBI-*.folio-deck.json` and writes a single deck with a subdeck
per level, so a reader adds a whole predicate or the lot, and the seven stay
separable inside one file rather than being poured together:

    1 Terbatas        5 Unggul
    2 Marginal        6 Sangat Unggul
    3 Semenjana       7 Istimewa
    4 Madya

SIX THINGS IT HAS TO GET RIGHT, and five of them fail silently.

THE SUBDECKS ARE FLAT, AND THE DIRECTIONS ARE A LEVEL BELOW THEM.  This is the
one substantial difference from the DELE combiner, which nests a direction
inside each level.  There a word is TWO notes, one per direction, so the
direction can be written into `sub`; here a word is ONE note carrying two card
TEMPLATES, and `sub` is a property of the NOTE, so it cannot name a direction
at all.  It does not need to: app.js draws a DIRECTION ROW under any level
whose notes are all filed directly in it, so each of the seven levels gets
`Indonesian → English` and `English → Indonesian` for free -- and the deck row
above them correctly gets none, a second pair over the whole deck being the
same cards offered twice under a name that says nothing new.  **Nesting the
directions here would need the file to carry two notes per word, which is the
duplication the one-note shape was adopted to remove.**

A CARD ID MUST CARRY THE DECK.  Every note is renumbered `u_ukbiall_N`.  A deck
FILE import only mints fresh card ids when the DECK id already exists, so a
combined deck reusing `u_ukbi1_1` would collide with an installed level 1 in
the shared `UCARDS` store and study the wrong card.  `ukbiall` is likewise its
own deck id, so the combined deck and the seven separate ones can sit on one
shelf without either disturbing the other's schedule.

THE FILE HOLDS NOTES AND THE CAP COUNTS NOTES, which is why this fits at all.
9,750 notes carry 19,500 cards to study -- over `UDECK_MAX_CARDS` read as a
count of cards, and comfortably inside it read as what it actually is, a bound
on what the FILE holds.  See the note beside that constant in app.js.

THE TYPE BLOCK IS SHARED.  All seven decks carry byte-identical `types`, which
is asserted rather than assumed -- a level rebuilt against a changed template
would otherwise have its cards silently rendered by another level's.

THE COUNTS IN THE DESCRIPTION ARE COUNTED, never carried over from the seven
descriptions and added up.  A figure restated by hand is a figure that goes
stale the next time a level is rebuilt.  Only the per-level word counts come
from a table (`ukbi_level.TARGET`), because a level's size is a decision rather
than a measurement and the shipped file cannot tell you what it was.

AND IT IS REPRODUCIBLE: no clock is read.  `exportedAt` and the timestamps come
from the newest of the seven sources, so re-running with the same inputs writes
the same bytes and a diff means something.

Not part of the site.  The combined file IS committed, unlike the DELE
combiner's, and that is a deliberate difference rather than an oversight: it
was asked for as a download, so it needs a permanent home beside the seven it
is made of.  The cost is ~7 MB of duplication, which is what being downloadable
without running a script costs.  `check-combined.js` regenerates it and looks at
it in a browser.
"""
import json, os, sys, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
DECKS = os.path.abspath(os.path.join(HERE, '..', '..', 'decks'))

from ukbi_level import PREDICATES, TARGET, DECK_FILES, SCOPE

LEVELS = ['1', '2', '3', '4', '5', '6', '7']
DECK_ID = 'ukbiall'
SUB_SEP = '::'          # app.js's own subdeck separator; keep the two in step
TITLE = 'UKBI 1–7 — Indonesian'
COLOR = '#B32821'       # all seven carry it; asserted below rather than assumed

# app.js's own limits, restated here so this refuses to write a file that
# cannot be imported rather than leaving it to be found on a phone.  Both are
# about the FILE: `MAX_CARDS` bounds the entries in it, which for a two-way
# deck is notes rather than cards to study.
MAX_NOTES = 12000
MAX_BYTES = 48 * 1024 * 1024


def load(level):
    with open(os.path.join(DECKS, DECK_FILES[level]), encoding='utf-8') as f:
        return json.load(f)


def stats(cards):
    """Counted off the notes, never read out of the seven descriptions."""
    fams = sum(1 for c in cards if c['fields'].get('Forms'))
    passives = sum(1 for c in cards if '>passive<' in c['fields'].get('Forms', ''))
    phrases = sum(1 for c in cards if ' ' in c['fields']['Word'])
    exn = [c['fields'].get('Examples', '').count('uc-exi') for c in cards]
    return dict(notes=len(cards), fams=fams, passives=passives, phrases=phrases,
                ex3=sum(1 for k in exn if k >= 3), ex0=sum(1 for k in exn if k == 0),
                exany=sum(1 for k in exn if k))


def desc(s):
    n, sizes = s['notes'], [TARGET[l] for l in LEVELS]
    return (
        'All seven UKBI levels in one deck, a subdeck per level. Each level '
        'carries both study directions — Indonesian → English (see the '
        'Indonesian, recall the meaning) and English → Indonesian (see an '
        'English meaning, recall the Indonesian) — as two cards of one word, '
        'each with a schedule of its own, so recognising a word and producing '
        'it are learnt separately and you can add a whole level or just one '
        'direction of it. '
        'UKBI is the Uji Kemahiran Berbahasa Indonesia, the Indonesian '
        'language proficiency test set by the Badan Pengembangan dan Pembinaan '
        'Bahasa. It reports a score from 251 to 800 and one of seven '
        'predicates: Terbatas, Marginal, Semenjana, Madya, Unggul, Sangat '
        'Unggul and Istimewa. UKBI itself numbers those from the TOP down, as '
        'peringkat I to VII, so Istimewa is I and Terbatas is VII; the '
        'subdecks here are numbered in the order they are studied, from the '
        'bottom, and each carries the predicate name a candidate actually '
        'quotes. '
        'The seven levels teach ' + ', '.join(f'{c:,}' for c in sizes[:-1])
        + f' and {sizes[-1]:,} words — {sum(sizes):,} in all, and no word is '
        'taught twice, since each level excludes every word the levels below '
        f'it contain. They sit on {n:,} words in each direction. '
        'Istimewa, the highest, is smaller than Sangat Unggul below it, which '
        'is a fact about the sources rather than about the predicate: both of '
        'the things the list is assembled from run out there, and everything '
        'either can still supply is in it. '
        'WHERE THESE WORDS COME FROM, since it matters and since it is not '
        'what the other exam decks do: UKBI publishes no vocabulary list. It '
        'is a proficiency test rather than a syllabus, and the Badan Bahasa '
        'describes what a candidate at each predicate can do rather than which '
        'words they should know; the BIPA competency standards (Permendikbud '
        '27/2017) are written the same way. So this word list is not an '
        'official one and is not presented as one. Each level was assembled '
        "from two things that can be stated: a vocabulary written to that "
        "level's own published descriptor, and the commonest words of everyday "
        'Indonesian taken from a frequency list built from film and television '
        'subtitles. Within each subdeck the cards are ordered by that '
        'frequency, so the words you meet most often come first. The higher '
        'the level the more of it the subtitles choose, and a subtitle corpus '
        'is an accurate record of what people say in films and a rougher guide '
        'to what a candidate needs — at the top two levels the count behind '
        'most of the words is too small to rank one against another with any '
        'confidence, so treat the sequence there as a rough guide and not a '
        'ranking. '
        'Everything here is standard Indonesian, bahasa baku, because that is '
        'what UKBI tests: where a colloquial form is far commoner in speech '
        'the standard one is what is taught — tidak rather than nggak, tetapi '
        'rather than tapi, and di mana as two words rather than the dimana '
        'that the test marks wrong. The familiar-but-standard pronouns aku and '
        'kamu are taught alongside the formal saya and Anda, because '
        'Indonesian chooses its pronoun by who is being spoken to. '
        'Indonesian has no gender, no plural agreement and no verb '
        'conjugation, so a card carries none. What it carries instead is the '
        'affix family, which is the part of the language that cannot be '
        f'guessed: {s["fams"]:,} of the words show their relatives labelled — '
        f'lihat, melihat, dilihat as root, active and passive — and '
        f'{s["passives"]:,} of them show a passive, which Indonesian uses far '
        "more readily than English does. The prefix assimilates and swallows "
        "the root's first consonant, so tulis becomes menulis while nanti "
        'stays menanti, and there is no rule a learner can apply; the forms '
        'are read from a dictionary rather than derived. Fewest families are '
        'shown at the highest level, and that is what that level is: its '
        'vocabulary is the derived morphology itself — the -isme, -itas, '
        'ke-…-an and peN-…-an forms — rather than the roots those are built '
        'on, and those roots are in the levels below. '
        f'{s["phrases"]:,} of the entries are phrases rather than single words, '
        'which a list of single words cannot see at all. '
        f'Real example sentences come with {s["exany"]:,} of the {n:,} words, '
        f'three apiece for {s["ex3"]:,} of them, with the word picked out in '
        'colour and a speaker beside the sentence and the headword; the '
        f'sentence corpora have nothing at all for the other {s["ex0"]:,}, '
        'which are kept because a word is chosen for being worth knowing and '
        'not for being well covered by a sentence bank. '
        'Level descriptors: ukbi.kemendikdasmen.go.id. Meanings, affix '
        'families and parts of speech: English Wiktionary, via the kaikki.org '
        'extraction (CC BY-SA 4.0). Frequency ordering: a word list built from '
        'OpenSubtitles (hermitdave/FrequencyWords, CC BY-SA 4.0). Example '
        'sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR; English Wiktionary\'s '
        'own usage examples (CC BY-SA 4.0); and Global Voices news articles '
        'via the OPUS collection (CC BY 3.0), which are human translations '
        'aligned sentence by sentence automatically, so a few of the sentences '
        'taken from them may not line up exactly with their English. They are '
        'used only where the other two sources have nothing.'
    )


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        DECKS, 'UKBI-1-7-Indonesian.folio-deck.json')

    decks = [(lv, load(lv)) for lv in LEVELS]

    # the type block is shared, and that is asserted rather than assumed
    sigs = {lv: hashlib.sha1(json.dumps(d['meta']['types'], sort_keys=True,
                                        ensure_ascii=False).encode()).hexdigest()
            for lv, d in decks}
    if len(set(sigs.values())) != 1:
        raise SystemExit('the seven decks no longer share a card-type block: '
                         + json.dumps(sigs, indent=2))
    types = decks[0][1]['meta']['types']
    # …and so is the colour, which is a fact about the deck rather than about a
    # level, so a level that had quietly changed it would leave the combined
    # deck wearing whichever level happened to be read first.
    cols = {lv: d['meta'].get('color') for lv, d in decks}
    if set(cols.values()) != {COLOR}:
        raise SystemExit(f'the seven decks no longer share {COLOR}: '
                         + json.dumps(cols, indent=2))

    # THE DIRECTION ROWS COME FROM THE TEMPLATES, so a level that had stopped
    # carrying two of them would give up its two rows in silence -- the deck
    # would import, study and count perfectly with half of what was asked for.
    tpl = types[next(iter(types))]['cards']
    if len(tpl) != 2:
        raise SystemExit(f'the card type carries {len(tpl)} templates, not 2: '
                         'there would be no direction rows under the levels')

    cards = []
    for lv, d in decks:
        name = PREDICATES[lv][0]
        sub = f'{lv} {name}'
        if SUB_SEP in sub:
            raise SystemExit(f'sub title contains {SUB_SEP!r}: {sub!r}')
        for c in d['cards']:
            if c.get('sub'):        # the seven are flat; a nested one would need a plan
                raise SystemExit(f'level {lv} now has subdecks of its own: {c["sub"]!r}')
            n = len(cards) + 1
            cards.append(dict(c, id=f'u_{DECK_ID}_{n}', sub=sub))

    if len(cards) > MAX_NOTES:
        raise SystemExit(f'{len(cards)} notes, over app.js\'s {MAX_NOTES} cap')

    s = stats(cards)
    ts = max(d['meta']['updatedAt'] for _, d in decks)
    doc = {
        'folioDeck': 1,
        'exportedAt': ts,
        'meta': {
            'id': DECK_ID,
            'title': TITLE,
            'subtitle': f'{sum(TARGET[l] for l in LEVELS):,} words across all '
                        'seven levels · a subdeck per level, both directions '
                        'inside it',
            'desc': desc(s),
            'author': '',
            'language': 'en',
            'color': COLOR,
            'tags': ['indonesian', 'bahasa indonesia', 'ukbi', 'terbatas',
                     'marginal', 'semenjana', 'madya', 'unggul',
                     'sangat unggul', 'istimewa', 'vocabulary'],
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
        raise SystemExit(f'{nbytes/1048576:.1f} MB, over app.js\'s '
                         f'{MAX_BYTES/1048576:.0f} MB cap')
    with open(out, 'w', encoding='utf-8') as f:
        f.write(text)

    subs = []
    for c in cards:
        if c['sub'] not in subs:
            subs.append(c['sub'])
    print(f'{out}')
    print(f'  {len(cards):,} notes = {len(cards)*2:,} cards, '
          f'{nbytes/1048576:.1f} MB (caps: {MAX_NOTES:,} notes, '
          f'{MAX_BYTES/1048576:.0f} MB)')
    print(f'  {len(subs)} subdecks, each with {len(tpl)} direction rows:')
    for q in subs:
        k = sum(1 for c in cards if c['sub'] == q)
        print(f'    {q:<18} {k:>5,} words')
        for t in tpl:
            print(f'      {t["name"]}')
    print('  ' + '  '.join(f'{k} {v:,}' for k, v in s.items()))


if __name__ == '__main__':
    main()
