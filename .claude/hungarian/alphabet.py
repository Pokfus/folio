#!/usr/bin/env python3
"""Write the Hungarian alphabet deck: `decks/Hungarian-Alphabet.folio-deck.json`.

    python3 .claude/hungarian/alphabet.py

The first deck of the Hungarian collection, sorted before A1 by `levelRank`'s
"Alphabet" rule.  Hungarian is written in the Latin alphabet, so this deck is not
a gate the way Greek's or Hindi's is; it is where the SOUNDS are learnt, because
the letters a learner already knows do not say what they say in English (`s` is
"sh", `sz` is "s", `c` is "ts", `a` is nearly "aw").

ONE NOTE PER LETTER OF THE HUNGARIAN ALPHABET, IN ITS OWN ORDER -- the 44 letters
the Hungarian spelling rules list, nine of which are written with two or three
characters (cs dz dzs gy ly ny sz ty zs) and each of which is a letter in its own
right, alphabetised as one; then two notes on what no single letter shows: the
stress, always on the first syllable, and the doubled consonant, held long.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's alphabets
give them, never IPA.  `j` and `ly` are one sound, so each says which spelling it
is; `q`, `w`, `x` and `y` are in the alphabet but met only in loanwords and
names, and their notes say so.  Every sound side is unique (asserted), or the
reverse card would have two answers.  The example words are checked against
English Wiktionary (`lex.json`): one that is not a headword stops the build
(except `Ady`, a name, which Wiktionary does not list).  No corpus is read, so a
re-run is byte-identical whenever this file is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hu import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'hu-abc'
COLOR = '#14659F'          # the shelf's measured hue (app.js, `lang-hungarian`)

# (shown, its name -- what the speaker says, sound, example word, its meaning)
LETTERS = [
    ('A a', 'a', 'a short "o" as in British hot, said with the lips a little rounded — '
     'never the a of cat', 'alma', 'apple'),
    ('Á á', 'á', 'a long, open "a" as in father', 'ágy', 'bed'),
    ('B b', 'bé', '"b" as in bed', 'barát', 'friend'),
    ('C c', 'cé', '"ts" as in cats — never a k or an s', 'cukor', 'sugar'),
    ('Cs cs', 'csé', '"ch" as in church', 'család', 'family'),
    ('D d', 'dé', '"d" as in dog', 'drága', 'expensive'),
    ('Dz dz', 'dzé', '"dz" as in adze — a d and a z said as one sound, often held long between '
     'vowels', 'edző', 'coach, trainer'),
    ('Dzs dzs', 'dzsé', '"j" as in jam — mostly in words from other languages', 'dzsem', 'jam'),
    ('E e', 'e', '"e" as in bed, said with the mouth more open, nearly the a of cat',
     'este', 'evening'),
    ('É é', 'é', '"ay" as in say, but long and steady, with no glide into "ee"', 'év', 'year'),
    ('F f', 'ef', '"f" as in fun', 'fej', 'head'),
    ('G g', 'gé', '"g" as in go — always hard, also before e and i', 'gép', 'machine'),
    ('Gy gy', 'gyé', 'a "d" and a "y" run together into one sound, as in British duke or dew',
     'gyerek', 'child'),
    ('H h', 'há', '"h" as in hat; silent at the end of a word (méh, "bee")', 'ház', 'house'),
    ('I i', 'i', '"ee" as in see, but short', 'iskola', 'school'),
    ('Í í', 'í', '"ee" as in see, long', 'ír', 'to write'),
    ('J j', 'jé', '"y" as in yes — j, the usual spelling of this sound', 'jó', 'good'),
    ('K k', 'ká', '"k" as in skin, without a puff of breath', 'kéz', 'hand'),
    ('L l', 'el', '"l" as in leaf, always clear', 'lány', 'girl'),
    ('Ly ly', 'elipszilon', '"y" as in yes — ly, an old spelling of the same sound as j, kept in '
     'certain words (hely, folyó, király) and learnt with each', 'hely', 'place'),
    ('M m', 'em', '"m" as in man', 'ma', 'today'),
    ('N n', 'en', '"n" as in net', 'nap', 'day; sun'),
    ('Ny ny', 'eny', '"ny" as in canyon — an n and a y run together into one sound, like '
     'Spanish ñ', 'nyelv', 'language; tongue'),
    ('O o', 'o', 'a short, closed "o", lips rounded — a pure vowel, not the "ow" of English go',
     'orvos', 'doctor'),
    ('Ó ó', 'ó', 'the same closed "o", long, still with no glide into "w"', 'óra', 'hour; clock'),
    ('Ö ö', 'ö', 'the German ö or the French eu: say "e" as in bed with the lips rounded — short',
     'öt', 'five'),
    ('Ő ő', 'ő', 'the same rounded "ö", long — the double accent marks a long ö', 'ő', 'he, she'),
    ('P p', 'pé', '"p" as in spin, without a puff of breath', 'pénz', 'money'),
    ('Q q', 'kú', 'a "k" — only in foreign names and a few loanwords', 'quad', 'quad bike'),
    ('R r', 'er', 'a rolled or tapped "r", as in Spanish or Scottish English', 'rossz', 'bad'),
    ('S s', 'es', '"sh" as in ship — never the s of see', 'só', 'salt'),
    ('Sz sz', 'esz', '"s" as in see', 'szó', 'word'),
    ('T t', 'té', '"t" as in stop, without a puff of breath', 'tíz', 'ten'),
    ('Ty ty', 'tyé', 'a "t" and a "y" run together into one sound, as in British tune',
     'tyúk', 'hen'),
    ('U u', 'u', '"oo" as in book, short, lips rounded', 'utca', 'street'),
    ('Ú ú', 'ú', '"oo" as in food, long', 'út', 'road, way'),
    ('Ü ü', 'ü', 'the German ü or the French u: say "ee" with the lips rounded — short', 'ül',
     'to sit'),
    ('Ű ű', 'ű', 'the same rounded "ü", long — the double accent marks a long ü', 'űr',
     'space; a void'),
    ('V v', 'vé', '"v" as in van', 'víz', 'water'),
    ('W w', 'dupla vé', 'a "v" — only in foreign names and a few loanwords', 'watt', 'watt'),
    ('X x', 'iksz', '"ks" as in box — in loanwords', 'taxi', 'taxi'),
    ('Y y', 'ipszilon', 'an "ee", written as a letter of its own only in old family names; '
     'everywhere else y is the second half of gy, ly, ny and ty', 'Ady',
     'a family name (Endre Ady, the poet)'),
    ('Z z', 'zé', '"z" as in zoo', 'zöld', 'green'),
    ('Zs zs', 'zsé', '"s" as in pleasure — the French j', 'zsák', 'bag, sack'),
    # what no single letter shows
    ('kávé', 'hangsúly', 'the stress: every word is stressed on its FIRST syllable, whatever its '
     'length — an accent mark never shows stress, only a long vowel (KÁ-vé)', 'kávé', 'coffee'),
    ('tt ssz', 'kettőzött mássalhangzó', 'a doubled consonant is held for longer (itt, "here", '
     'is "it-t", as in cat tail); a doubled two-letter consonant doubles only its first letter '
     '(sz + sz is ssz: asszony)', 'itt', 'here'),
]

FIELDS = ['Letter', 'Name', 'Called', 'Sound', 'Example', 'Word']

SAY_NAME = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>'
SAY_WORD = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
LETTER = '<div class="uc-letter">{{Letter}}' + SAY_NAME + '</div>'
DETAIL = ('<div class="uc-field">{{#Called}}<div class="uc-pos">name</div><div class="uc-gl">'
          '{{Called}}</div><div class="uc-pos uc-gap">sound</div>{{/Called}}'
          '{{^Called}}<div class="uc-pos">sound</div>{{/Called}}<div class="uc-gl">{{Sound}}</div>'
          '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}'
          + SAY_WORD + '</div></div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>')
FRONT_L = LETTER
BACK_L = '{{FrontSide}}<hr>' + DETAIL
FRONT_S = ASK
BACK_S = '{{FrontSide}}<hr>' + LETTER + DETAIL

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
.uc-letter {
  font-size: 60px;
  font-weight: 400;
  line-height: 1.3;
}
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
}
.uc-field {
  display: block;
  width: fit-content;
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
.uc-gap {
  margin-top: 10px;
}
.uc-gl {
  line-height: 1.5;
}
.uc-ex {
  font-size: 21px;
}
.uc-exr {
  margin-left: 6px;
  font-size: 14px;
  opacity: 0.62;
}
.uc-exe {
  margin-left: 6px;
  opacity: 0.62;
}
"""

NOT_IN_WIKTIONARY = {'Ady'}          # a family name


def main():
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hungarian-cache',
                         'lex.json')
    if not os.path.exists(cache):
        raise SystemExit('alphabet.py checks its example words against lex.json: '
                         'run `python3 .claude/hungarian/run.py` once first')
    lex = json.load(open(cache, encoding='utf-8'))
    missing = [w for _, _, _, w, _ in LETTERS if fold(w) not in lex and w not in NOT_IN_WIKTIONARY]
    if missing:
        raise SystemExit('not a Wiktionary headword: ' + ' '.join(missing))
    cards = []
    for i, (shown, name, sound, word, meaning) in enumerate(LETTERS, 1):
        letter = i <= 44
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown),
            'Name': E(name),
            'Called': E(name) if letter else '',
            'Sound': E(sound),
            'Example': (f'<span class="uc-ex">{E(word)}</span>'
                        f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_huabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    desc = (
        f"The Hungarian alphabet and its sounds: {n} notes — the forty-four letters in Hungarian "
        "alphabetical order, capital and small, with each one's Hungarian name; then two notes on "
        "what no single letter shows, the stress and the doubled consonant. The first deck of the "
        "Hungarian collection. Hungarian uses the Latin alphabet, but its letters do not say what "
        "they say in English — s is \"sh\", sz is \"s\", c is \"ts\", a is close to the o of British "
        "hot — and nine of its letters are written with two or three characters (cs, dz, dzs, gy, "
        "ly, ny, sz, ty, zs), each a letter in its own right. The accents are part of the letter: "
        "á, é, í, ó and ú are long vowels, and the double accent of ő and ű marks a long ö and ü. "
        "Both directions: see a letter and recall its sound, or see a sound and recall the letter, "
        "each a card with its own schedule. Every note describes the sound in English words and "
        "gives one everyday word that shows it, with a speaker beside the letter and the word. j "
        "and ly are the same sound, so each note says which spelling it is; q, w, x and y belong to "
        "the alphabet but are met only in loanwords and names, and their notes say so. The sounds "
        "are approximations, as every learner's alphabet gives them; where English has no "
        "equivalent — ö, ü, gy, ty — the card says what to do instead. Sources: the standard "
        "description of Hungarian spelling and pronunciation; the example words are checked "
        "against English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'huabc', 'title': 'Hungarian Alphabet',
        'subtitle': f'The 44 letters and their sounds, then stress and doubled letters ({n} notes) · '
                    'both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['hungarian', 'alphabet'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Hungarian letter', 'speechLang': 'hu-HU',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Hungarian-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
