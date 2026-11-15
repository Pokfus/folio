#!/usr/bin/env python3
"""Write the Amharic fidäl deck: `decks/Amharic-Alphabet.folio-deck.json`.

    python3 .claude/amharic/alphabet.py

The first deck of the Amharic collection, sorted before A1 by `levelRank`'s
"Alphabet" rule.  The level decks print a romanisation under every word, so this
deck is not a gate as Russian's is; it is where the script itself is learnt.

THE SCRIPT IS AN ABUGIDA (fidäl): each character is a consonant with one of
seven vowels, the "orders", and the orders are regular marks on the consonant's
shape.  So the deck teaches the two things a reader actually holds in their head:
  · THE SEVEN ORDERS, one note each, shown across several consonants (ቡ ሉ ሙ: a
    stroke on the right is u), with the vowel and what the mark looks like;
  · THE 34 CONSONANTS, one note each in the traditional order (ሀ ለ ሐ መ ...), the
    first-order letter on the front and its whole row of seven on the back, each
    with Wiktionary's romanisation;
then the labialised -ʷa forms and the punctuation.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's alphabets
give them, never IPA, with the romanisation the level decks use (Wiktionary's
`Module:Ethi-translit`, `am.SYL`).  Where English has no equivalent -- the
ejectives ḳ ṭ č̣ p̣ ṣ -- the card says what to do with the throat instead.
SEVERAL LETTERS ARE SAID ALIKE in Amharic (ሀ ሐ ኀ all h; ሰ ሠ s; አ ዐ; ጸ ፀ): the
romanisation keeps them apart (h ḥ ḫ, s ś, ʾ ʿ, ṣ ṣ́), and so does each one's
reverse card, which names it by that letter.  The descriptions are the standard
ones of modern Amharic (Wikipedia "Amharic" § Phonology and "Ge'ez script", read
2026-11-15).

EACH CONSONANT'S EXAMPLE WORD is the first word of the A1 deck (dealt by its
frequency in the Amharic Wikipedia) that begins with a letter of its row, as A1
prints it -- its romanisation and first meaning -- so the two decks agree and
nothing is typed from memory; for a row A1 has no word in, the commonest such
word of English Wiktionary (`lex.json`).  A re-run is byte-identical whenever `lex.json` is.
"""
import html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from am import SYL, roman

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'am-abc'

ORDER_NAMES = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh']

# (order index, the vowel, what it sounds like, what the mark looks like)
ORDERS = [
    (0, 'ä', 'like the u of cup or the a of about, short; after h and the glottal stop (ሀ, አ) '
             'it is said a', 'the bare shape, with no mark: ለ በ መ'),
    (1, 'u', '"oo" as in food', 'a short stroke on the right side, halfway down: ሉ ቡ ሙ'),
    (2, 'i', '"ee" as in see', 'a short stroke at the foot of the right leg: ሊ ቢ ሚ'),
    (3, 'a', '"a" as in father', 'the right leg lengthened, or a short leg added: ላ ባ ማ'),
    (4, 'e', 'like the a of cake, but one pure vowel without the glide into "ee"',
             'a little ring at the foot of the right leg: ሌ ቤ ሜ'),
    (5, 'ə', 'a short "i" as in bit — or no vowel at all, the bare consonant',
             'a stroke or a kink on the left or the top, which varies most: ል ብ ም'),
    (6, 'o', '"o" as in go, but one pure vowel', 'a ring on the top right, or the left leg '
             'shortened: ሎ ቦ ሞ'),
]
ORDER_SHOWN = ['ለ', 'በ', 'መ']        # the consonants each order is shown on

# The consonants in the traditional order (hä lä ḥä mä śä rä sä ...), with the sound.
SAID_H = 'said h, exactly like ሀ; one of the three h letters Amharic says alike'
CONSONANTS = [
    ('ሀ', '"h" as in hand; with its first order said ha'),
    ('ለ', '"l" as in leaf'),
    ('ሐ', 'ḥ in the romanisation — ' + SAID_H),
    ('መ', '"m" as in man'),
    ('ሠ', 'ś in the romanisation — said s, exactly like ሰ; the two letters are said alike'),
    ('ረ', 'a tapped or rolled "r", as in Spanish pero'),
    ('ሰ', '"s" as in sun'),
    ('ሸ', '"sh" as in ship'),
    ('ቀ', 'an ejective "k" (ḳ, often written q): said far back, with the throat closed and '
          'released in a sharp pop, no breath after it'),
    ('በ', '"b" as in bat'),
    ('ቨ', '"v" as in van; found in words from other languages'),
    ('ተ', '"t" as in top'),
    ('ቸ', '"ch" as in church'),
    ('ኀ', 'ḫ in the romanisation — ' + SAID_H),
    ('ነ', '"n" as in no'),
    ('ኘ', '"ny" as in canyon'),
    ('አ', 'the vowel carrier (ʾ): a word that begins with a vowel is written with it; '
          'a slight catch in the throat, or nothing'),
    ('ከ', '"k" as in kite'),
    ('ኸ', 'like the ch of Scottish loch; rare, and many speakers say it as h'),
    ('ወ', '"w" as in wet'),
    ('ዐ', 'ʿ in the romanisation — a second vowel carrier, said exactly like አ'),
    ('ዘ', '"z" as in zoo'),
    ('ዠ', 'like the s of measure (ž)'),
    ('የ', '"y" as in yes'),
    ('ደ', '"d" as in dog'),
    ('ጀ', '"j" as in jam (ǧ)'),
    ('ገ', '"g" as in go'),
    ('ጠ', 'an ejective "t" (ṭ): the throat closed and released with a sharp pop, no breath '
          'after it'),
    ('ጨ', 'an ejective "ch" (č̣): the throat closed and released with a sharp pop'),
    ('ጰ', 'an ejective "p" (p̣): the throat closed and released with a sharp pop; rare, in '
          'words from Greek'),
    ('ጸ', 'an ejective "ts" (ṣ): the throat closed and released with a sharp pop'),
    ('ፀ', 'ṣ́ in the romanisation — said exactly like ጸ, an ejective "ts"; the two letters '
          'are said alike'),
    ('ፈ', '"f" as in fan'),
    ('ፐ', '"p" as in pen; found mostly in words from other languages'),
]

FIELDS = ['Letter', 'Row', 'Sound', 'Example']

LETTER = '<div class="uc-letter">{{Letter}}</div>'
DETAIL = ('<div class="uc-row">{{Row}}</div>'
          '<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>'
          '{{#Example}}<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}</div>'
          '{{/Example}}</div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>')
FRONT_L = LETTER
BACK_L = '{{FrontSide}}<hr>' + DETAIL
FRONT_S = ASK
BACK_S = '{{FrontSide}}<hr>' + LETTER + DETAIL

CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hindi', 'alphabet.py'),
           encoding='utf-8').read().split('CSS = """', 1)[1].split('"""', 1)[0] + """.uc-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 14px;
  margin-top: 6px;
}
.uc-ri {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 38px;
}
.uc-rc {
  font-size: 30px;
  line-height: 1.25;
}
.uc-rr {
  font-size: 13px;
  opacity: 0.62;
}
"""


def row_html(chars):
    return ''.join(f'<span class="uc-ri"><span class="uc-rc">{E(c)}</span>'
                   f'<span class="uc-rr">{E(roman(c))}</span></span>' for c in chars)


def first_gloss(h):
    m = re.search(r'class="uc-(?:gl|gls)">(?:<li>)?([^<]*)', h)
    return html.unescape(m.group(1)) if m else ''


def example(lex, row_chars, used, a1):
    """The first A1 word (A1 is dealt by frequency) that begins with a letter of this row,
    as that deck prints it; else the commonest such word in Wiktionary."""
    for w, rom, gl in a1:
        if w[:1] in row_chars and w not in used and ' ' not in w and rom and gl:
            used.add(w)
            gl = re.split(r'[;(]', gl)[0].strip().rstrip(',')
            return (f'<span class="uc-ex">{E(w)}</span><span class="uc-exr">{E(rom)}</span>'
                    f'<span class="uc-exe">{E(gl)}</span>')
    best = None
    for k, L in lex.items():
        w = L['word']
        if ' ' in w or w[:1] not in row_chars or w in used or len(w) < 2:
            continue
        ents = [e for e in L['entries'] if e['word'] == w and e['roman'] and e['glosses']
                and e['pos'] in ('noun', 'verb', 'adj', 'adv', 'num', 'pron')
                and not any(g['weak'] for g in e['glosses'][:1])]
        if not ents:
            continue
        cand = (-L['freq'], w, ents[0])
        if best is None or cand[:2] < best[:2]:
            best = cand
    if not best:
        return ''
    _, w, e = best
    used.add(w)
    g = re.split(r'[;(]', e['glosses'][0]['g'])[0].strip().rstrip(',')
    return (f'<span class="uc-ex">{E(w)}</span><span class="uc-exr">{E(e["roman"])}</span>'
            f'<span class="uc-exe">{E(g)}</span>')


def main():
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'amharic-cache', 'lex.json')
    if not os.path.exists(cache):
        raise SystemExit('alphabet.py reads its example words from lex.json: '
                         'run `python3 .claude/amharic/run.py` once first')
    lex = json.load(open(cache, encoding='utf-8'))['lemmas']
    A1 = json.load(open(os.path.join(os.path.dirname(cache), '..', '..', 'decks',
                                     'Amharic-A1.folio-deck.json'), encoding='utf-8'))
    color = A1['meta']['color']
    a1 = [(c['fields']['Word'], html.unescape(c['fields']['Roman']), first_gloss(c['fields']['English']))
          for c in A1['cards']]
    cards = []
    for i, vowel, sound, mark in ORDERS:
        shown = [chr(ord(c) + i) for c in ORDER_SHOWN]
        cards.append({'Letter': E(' '.join(shown)),
                      'Row': row_html([chr(ord(c) + i) for c in 'ለበመሰነከ']),
                      'Sound': (f'<span class="uc-rm">{E(vowel)}</span> · the {ORDER_NAMES[i]} order, '
                                f'{E(sound)}. The mark: {E(mark)}'),
                      'Example': ''})
    used = set()
    for base, sound in CONSONANTS:
        b = ord(base)
        row = [chr(b + o) for o in range(7)]
        rom = SYL[base][0]
        cards.append({'Letter': E(base), 'Row': row_html(row),
                      'Sound': f'<span class="uc-rm">{E(rom)}</span> · {E(sound)}',
                      'Example': example(lex, set(row), used, a1)})
    lab = ['ሏ', 'ሟ', 'ሯ', 'ሷ', 'ቧ', 'ቷ', 'ኗ', 'ዟ', 'ዷ', 'ጧ', 'ፏ']
    cards.append({'Letter': E(' '.join(lab[:3])), 'Row': row_html(lab),
                  'Sound': ('<span class="uc-rm">ʷa</span> · the eighth, labialised form: the '
                            'consonant followed by "wa" (ሏ lʷa, said lwa); a stroke or a bar added '
                            'to the fourth order'),
                  'Example': example(lex, set(lab), used, a1)})
    labk = ['ቈ', 'ቊ', 'ቋ', 'ቌ', 'ቍ', 'ኰ', 'ኲ', 'ኳ', 'ኴ', 'ኵ', 'ጐ', 'ጒ', 'ጓ', 'ጔ', 'ጕ']
    cards.append({'Letter': E('ቋ ኳ ጓ'), 'Row': row_html(labk),
                  'Sound': ('<span class="uc-rm">ḳʷ kʷ gʷ</span> · ḳ, k and g said with rounded '
                            'lips ("kw", "gw"), each with five forms of its own'),
                  'Example': example(lex, set(labk), used, a1)})
    cards.append({'Letter': E('። ፣ ፡'), 'Row': '',
                  'Sound': ('<span class="uc-rm">. , ·</span> · the punctuation: ። ends a sentence '
                            '(a full stop), ፣ is a comma, and ፡, the old word divider, is now '
                            'mostly a space'),
                  'Example': ''})
    out_cards = []
    for n, F in enumerate(cards, 1):
        out_cards.append({'sub': '', 'fields': F, 'id': f'u_amabc_{n}', 'type': TYPE_ID})
    n = len(out_cards)
    sounds = [c['fields']['Sound'] for c in out_cards]
    assert len(set(sounds)) == n, 'two notes share a sound side: the reverse card is unanswerable'
    desc = (
        f"The Ethiopic script (fidäl) in which Amharic is written: {n} notes. The first deck of "
        "the Amharic collection. Fidäl is an abugida: every character is a consonant with one of "
        "seven vowels, the ORDERS, and each order is a regular mark on the consonant's shape — so "
        "the deck teaches the seven orders first (ቡ ሉ ሙ: a stroke on the right is u), then the 34 "
        "consonants in the traditional order (ሀ ለ ሐ መ …), each with its whole row of seven, then "
        "the labialised -wa forms (ሏ ቧ) and the rounded kʷ gʷ ḳʷ, and the punctuation. Both "
        "directions: see a letter and recall its sound, or see a sound and recall the letter, "
        "each a card with its own schedule. Every note gives the romanisation the level decks use "
        "(English Wiktionary's), the sound described in English words and, for a consonant, the "
        "commonest word that begins with it. The sounds are approximations, as every learner's "
        "alphabet gives them; where English has no equivalent — the ejectives ḳ ṭ č̣ p̣ ṣ, said "
        "with the throat closed and released in a pop — the card says what to do instead. Amharic "
        "says several letters alike (ሀ ሐ ኀ are all h; ሰ ሠ; አ ዐ; ጸ ፀ), and words are spelt with "
        "either; the romanisation keeps them apart (h ḥ ḫ, s ś, ʾ ʿ, ṣ ṣ́) and so does this deck. "
        "There is no speaker button: few devices have an Amharic voice. Sources: the standard "
        "description of modern Amharic (Wikipedia, 'Amharic' and 'Ge'ez script'); the "
        "romanisation is English Wiktionary's (Module:Ethi-translit), and the example words, "
        "their romanisations and meanings are English Wiktionary's, via the kaikki.org extraction "
        "(CC BY-SA 4.0), chosen by their frequency in the Amharic Wikipedia."
    )
    meta = {
        'id': 'amabc', 'title': 'Amharic Alphabet (Fidäl)',
        'subtitle': f'{n} orders, letters and signs · both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': color,
        'tags': ['amharic', 'alphabet', 'fidel', 'ethiopic'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Amharic letter', 'speechLang': 'am-ET',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': out_cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Amharic-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
