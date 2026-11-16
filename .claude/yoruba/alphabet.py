#!/usr/bin/env python3
"""Write the Yoruba alphabet deck: `decks/Yoruba-Alphabet.folio-deck.json`.

    python3 .claude/yoruba/alphabet.py

The first deck of the Yoruba collection, sorted before A1 by `levelRank`'s
"Alphabet" rule.  Yoruba is written in the Latin alphabet, so what a reader has
to learn is not the letters' shapes but WHAT THEY SAY -- and the three things
English spelling has no equivalent for: the letters under a dot (ẹ ọ ṣ), the
double-stop consonants gb and p, and the TONE MARKS, which every card in the
collection prints and which tell words apart (ọkọ "husband", ọkọ̀ "vehicle",
ọkọ́ "hoe").

THE NOTES, in the order Nigerian primers give the alphabet:
  · the 25 letters, one note each (A B D E Ẹ F G GB H I J K L M N O Ọ P R S Ṣ T
    U W Y -- no c, q, v, x or z);
  · the three tones, each with the mark that writes it;
  · the five nasal vowels, written with an n that is not said on its own;
  · the syllabic nasal, an n or m that is a syllable with a tone of its own.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's alphabets
give them, never IPA, for Standard Yoruba -- the standard descriptions (Wikipedia
"Yoruba language" § Phonology and § Writing system, read 2026-11-15).

EACH LETTER'S EXAMPLE WORD is the first word of the A1 deck (dealt by its
frequency in the Yoruba Wikipedia) that begins with that letter (for u, which
begins almost no word of the standard language, the first that has it), with the first
meaning A1 gives it, so the two decks agree and nothing is typed from memory.
The tone and nasal notes name their words; their meanings are read off A1 too,
or for a word A1 does not teach (ọkọ́ "hoe") off English Wiktionary (`lex.json`).
A re-run is byte-identical whenever A1 and `lex.json` are.
"""
import html, json, os, re, sys, unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from yo import strip_tones

E = lambda s: html.escape(s, quote=False)
STAMP = '2026-11-15T00:00:00.000Z'
TYPE_ID = 'yo-abc'
from build_deck import COLOR

HERE = os.path.dirname(os.path.abspath(__file__))
DECKS = os.path.join(HERE, '..', '..', 'decks')

# (letter as shown, its lower-case form as a word begins with it, the sound)
LETTERS = [
    ('A a', 'a', 'the a of father, short and pure'),
    ('B b', 'b', 'b, as in English'),
    ('D d', 'd', 'd, as in English'),
    ('E e', 'e', 'a CLOSE e, like the e of café or the ay of day without its glide into "ee"'),
    ('Ẹ ẹ', 'ẹ', 'an OPEN e, like the e of bet; the dot under it is what tells it from e'),
    ('F f', 'f', 'f, as in English'),
    ('G g', 'g', 'always the hard g of go — never the g of gem'),
    ('GB gb', 'gb', 'ONE sound, a letter of its own: g and b said at the same moment, the back of '
                    'the tongue and the lips closed together and opened together — no English word '
                    'has it'),
    ('H h', 'h', 'h, as in English'),
    ('I i', 'i', 'the ee of see, short and pure'),
    ('J j', 'j', 'the j of jam, often softer, nearer the dg of judge'),
    ('K k', 'k', 'k, as in English'),
    ('L l', 'l', 'l, as in English; before a nasal vowel it is said n'),
    ('M m', 'm', 'm, as in English'),
    ('N n', 'n', 'n, as in English, at the start of a syllable; after a vowel in the same syllable '
                 'it is not said, but marks the vowel as nasal (below)'),
    ('O o', 'o', 'a CLOSE o, like the o of so without its glide into "oo"'),
    ('Ọ ọ', 'ọ', 'an OPEN o, like the o of British hot or the aw of law; the dot is what tells it '
                 'from o'),
    ('P p', 'p', 'NOT an English p: gb\'s voiceless twin, k and p said at the same moment, the '
                 'tongue and the lips closed together and opened together'),
    ('R r', 'r', 'a light tap of the tongue tip, like the r of Spanish pero'),
    ('S s', 's', 's, as in English — never the z sound of rose'),
    ('Ṣ ṣ', 'ṣ', 'the sh of shop; the dot under it is what tells it from s'),
    ('T t', 't', 't, as in English'),
    ('U u', 'u', 'the oo of food, short and pure'),
    ('W w', 'w', 'w, as in English'),
    ('Y y', 'y', 'the y of yes'),
]

# (shown, sound, [example words]) -- the tones, the nasal vowels, the syllabic nasal
MARKS = [
    ('á  (acute)', 'a HIGH tone: the voice held high on the syllable', ['ọkọ́']),
    ('a  (no mark)', 'a MID tone: the voice level, in the middle of its range; most writing leaves '
                     'it unmarked, and so do these decks', ['ọkọ']),
    ('à  (grave)', 'a LOW tone: the voice held low on the syllable', ['ọkọ̀']),
    ('an', 'a NASAL a, said through the nose with no n sound after it; many speakers say it as ọn',
     ['kan']),
    ('ẹn', 'a NASAL ẹ, the e of bet said through the nose; it is found in very few words, ìyẹn '
           '"that" the commonest', ['ìyẹn']),
    ('in', 'a NASAL i, the ee of see said through the nose', ['ẹ̀yin']),
    ('ọn', 'a NASAL ọ, the aw of law said through the nose: how the nasal a is said after b, f, '
           'w, gb and p, and written so there (àwọn); after m no n is written at all (mi, mu)',
     ['àwọn']),
    ('un', 'a NASAL u, the oo of food said through the nose', ['fún']),
    ('ń  ǹ  m', 'a SYLLABIC NASAL: an n (m before b) that is a syllable of its own, with its own '
                'tone mark — a hum, with no vowel', ['ń', 'nǹkan']),
]

FIELDS = ['Letter', 'Sound', 'Example', 'Word']

LETTER = '<div class="uc-letter">{{Letter}}</div>'
DETAIL = ('<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>'
          '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}</div></div>')
ASK = ('<div class="uc-ask">Which letter or mark is this?</div>'
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
  font-size: 52px;
  font-weight: 400;
  line-height: 1.3;
  white-space: pre;
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
.uc-ex + .uc-ex {
  margin-left: 14px;
}
.uc-exe {
  margin-left: 6px;
  opacity: 0.62;
}
"""


def first_meaning(english_html):
    """The first gloss a card's English side gives, to its first comma, semicolon or bracket."""
    m = re.search(r'class="uc-gls?"[^>]*>(?:<li>)?([^<]*)', english_html)
    g = html.unescape(m.group(1)) if m else ''
    return re.split(r'\s*[;(,]', g)[0].strip()


def initial(word):
    w = strip_tones(word).lower()
    return 'gb' if w.startswith('gb') else w[:1]


def main():
    a1 = json.load(open(os.path.join(DECKS, 'Yoruba-A1.folio-deck.json'), encoding='utf-8'))
    deck = [(c['fields']['Word'], first_meaning(c['fields']['English'])) for c in a1['cards']]
    taught = dict(deck)
    lexp = os.path.join(HERE, '..', 'yoruba-cache', 'lex.json')
    lex = json.load(open(lexp, encoding='utf-8'))['lemmas'] if os.path.exists(lexp) else {}

    def meaning(w):
        if w in taught:
            return taught[w]
        L = lex.get(w.lower())
        if not L:
            raise SystemExit(f'no meaning for {w}: run `python3 .claude/yoruba/run.py` first')
        return re.split(r'\s*[;(,]', L['entries'][0]['glosses'][0]['g'])[0].strip()

    def ex(words):
        return ''.join(f'<span class="uc-ex">{E(w)}<span class="uc-exe">{E(meaning(w))}</span></span>'
                       for w in words)

    rows = []
    for shown, low, sound in LETTERS:
        # a single-word headword of more than one letter, so the example is a word, not a pronoun
        hit = next(((w, m) for w, m in deck if initial(w) == low and ' ' not in w
                    and len(strip_tones(w)) > 1 and m), None)
        # Standard Yoruba begins almost no word with u: then the first A1 word that has it
        if not hit:
            hit = next(((w, m) for w, m in deck if ' ' not in w and m and
                        low in strip_tones(w).lower().replace('gb', '#')), None)
        if not hit:
            raise SystemExit(f'A1 has no word beginning with {low}')
        rows.append((shown, sound, ex([hit[0]]), hit[0]))
    for shown, sound, words in MARKS:
        rows.append((shown, sound, ex(words), words[0]))

    cards = []
    for i, (shown, sound, example, word) in enumerate(rows, 1):
        cards.append({'sub': '', 'fields': {
            'Letter': E(shown), 'Sound': E(sound), 'Example': example, 'Word': E(word),
        }, 'id': f'u_yoabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two notes share a sound side: the reverse card is unanswerable'
    desc = (
        f"The Latin alphabet in which Yoruba is written, and the marks on it: {n} notes — the 25 "
        "letters in the order Nigerian primers give them (A B D E Ẹ F G GB H I J K L M N O Ọ P R S "
        "Ṣ T U W Y; there is no c, q, v, x or z), then the three tones and the marks that write "
        "them, the five nasal vowels and the syllabic nasal. The first deck of the Yoruba "
        "collection. Both directions: see a letter or a mark and recall its sound, or see a sound "
        "and recall what writes it, each a card with its own schedule. Most letters sound as an "
        "English reader expects, and the cards say so in a line; the notes that matter are the "
        "ones English has no letter for — Ẹ and Ọ, the OPEN e and o, told from e and o by the dot "
        "beneath (a short vertical line in older printing); Ṣ, the sh of shop; GB and P, each ONE "
        "sound made with the tongue and the lips closed at once (Yoruba's p is never an English "
        "p); and the TONES, which are part of every word: an acute accent for a high tone (á), a "
        "grave for a low one (à), and no mark for a mid tone, so that ọkọ is 'husband', ọkọ̀ "
        "'vehicle' and ọkọ́ 'hoe'. Every word in the collection's level decks carries its tone "
        "marks. Each card gives an everyday word that shows the sound, from the Yoruba A1 deck, "
        "with the meaning A1 gives it. The sounds are approximations, as every learner's alphabet "
        "gives them, for Standard Yoruba. There is no read-aloud button: few devices carry a "
        "Yoruba voice, and one without it reads the letter in English. Sources: the standard "
        "description of Standard Yoruba; the example words and their meanings are English "
        "Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'yoabc', 'title': 'Yoruba Alphabet',
        'subtitle': f'{n} letters, tones and sounds · both directions, as two cards each',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['yoruba', 'alphabet', 'tones'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Yoruba letter', 'speechLang': 'yo-NG',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    out = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    path = os.path.abspath(os.path.join(DECKS, 'Yoruba-Alphabet.folio-deck.json'))
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, ensure_ascii=False)
    print('  wrote', path, os.path.getsize(path), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
