#!/usr/bin/env python3
"""Write the Urdu alphabet deck: `decks/Urdu-Alphabet.folio-deck.json`.

    python3 .claude/urdu/alphabet.py

The first deck of the Urdu collection, sorted before A1 by `levelRank`'s
"Alphabet" rule -- the Hindi collection's arrangement (the owner's decision for
Hindi, 2026-11-09, "a script deck, yes"), taken for Urdu.  The level decks
print a romanisation under every word, so this deck is not a gate; it is where
the script itself is learnt.

ONE NOTE PER LETTER, IN THE URDU ORDER -- the forty letters of the alphabet as
Urdu primers list them (alif madd beside alif, nun ghunna beside nun, the two
he's and the two ye's), then the five marks a dictionary writes and running
text leaves out (zabar, zer, pesh, tashdid, jazm), shown on ب, then the eleven
ASPIRATED pairs a consonant makes with do-chashmi he (بھ, پھ ... گھ), which a
primer teaches with the alphabet because a reader meets them on every line.
A joining letter shows its four shapes -- alone, at the start, in the middle
and at the end of a word -- since the shape changes and the reader must know
all four; a letter that joins only from the right shows two.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's
alphabets give them, never IPA, with the romanisation the level decks use
(Wiktionary's: ā ī ū, ṭ ḍ ṛ for the retroflex letters, ś, x, ġ, ź, q).  Where
English has no equivalent -- the retroflex letters, the breathy (aspirated)
consonants, the dental t and d -- the card says what to do with the tongue or
the breath instead of pretending.  Urdu writes the sounds of Arabic words with
letters that in Urdu sound alike (s: س ث ص; z: ز ذ ض ظ; t: ت ط; h: ہ ح), so
each sound side carries the letter's NAME, which is how a speaker tells them
apart ("z, written zo'e"), and the reverse card has one answer.  The examples'
romanisations are English Wiktionary's (`lex.json`), so the two decks agree.
No corpus is read for the content, so a re-run is byte-identical whenever
`lex.json` is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ur import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'ur-abc'
COLOR = '#58288A'
ZWJ = '‍'

J, R, N, F = 'join', 'right', 'none', 'final'     # how a letter joins its neighbours
# (letter, joins, its name in Urdu (spoken), name romanised, sound romanised, the sound,
#  example word, its meaning)
LETTERS = [
    ('ا', R, 'الف', 'alif', '', 'carries the vowel at the start of a word (a, i or u, by the '
     'mark above or below it); in the middle or at the end of a word it is a long "a" as in '
     'father', 'اب', 'now'),
    ('آ', R, 'الف مد', 'alif madd', 'ā', 'alif with the wavy madd above: a long "a" as in '
     'father at the START of a word', 'آم', 'mango'),
    ('ب', J, 'بے', 'be', 'b', '"b" as in bat', 'بچہ', 'child'),
    ('پ', J, 'پے', 'pe', 'p', '"p" as in spin — no puff of breath after it', 'پانی', 'water'),
    ('ت', J, 'تے', 'te', 't', 'a soft "t" with the tongue against the back of the upper teeth, '
     'no puff of breath — the dental t', 'تین', 'three'),
    ('ٹ', J, 'ٹے', 'ṭe', 'ṭ', 'a hard "t" with the tongue tip curled back to the roof of the '
     'mouth — the retroflex t, the little ط above marks it', 'ٹکٹ', 'ticket'),
    ('ث', J, 'ثے', 'se', 's', '"s" as in sun; written se, in words from Arabic', 'ثابت', 'proven, firm'),
    ('ج', J, 'جیم', 'jīm', 'j', '"j" as in jam', 'جگہ', 'place'),
    ('چ', J, 'چے', 'che', 'c', '"ch" as in church, with no puff of breath after it', 'چائے', 'tea'),
    ('ح', J, 'بڑی حے', 'baṛī he', 'h', '"h" as in hand; written baṛī he, "big he", in words from '
     'Arabic', 'حصہ', 'part, share'),
    ('خ', J, 'خے', 'xe', 'x', 'like the ch of Scottish loch', 'خوش', 'happy'),
    ('د', R, 'دال', 'dāl', 'd', 'a soft "d" with the tongue against the upper teeth — the '
     'dental d', 'دن', 'day'),
    ('ڈ', R, 'ڈال', 'ḍāl', 'ḍ', 'a hard "d" with the tongue tip curled back — the retroflex d',
     'ڈاکٹر', 'doctor'),
    ('ذ', R, 'ذال', 'zāl', 'z', '"z" as in zoo; written zāl, in words from Arabic', 'ذریعہ',
     'means, way'),
    ('ر', R, 'رے', 're', 'r', 'a tapped "r", the tongue flicking once behind the teeth, as in '
     'Spanish pero', 'رات', 'night'),
    ('ڑ', R, 'ڑے', 'ṛe', 'ṛ', 'a flap: the tongue tip curls back and flicks forward against the '
     'roof of the mouth, between d and r; never starts a word', 'لڑکا', 'boy'),
    ('ز', R, 'زے', 'ze', 'z', '"z" as in zoo; written ze, the everyday z', 'زبان',
     'tongue, language'),
    ('ژ', R, 'ژے', 'źe', 'ź', '"s" as in measure; rare, in words from Persian and French',
     'ٹیلی ویژن', 'television'),
    ('س', J, 'سین', 'sīn', 's', '"s" as in sun; written sīn, the everyday s', 'سال', 'year'),
    ('ش', J, 'شین', 'śīn', 'ś', '"sh" as in shop', 'شہر', 'city'),
    ('ص', J, 'صاد', "su'ād", 's', "\"s\" as in sun; written su'ād, in words from Arabic", 'صبح',
     'morning'),
    ('ض', J, 'ضاد', "zu'ād", 'z', "\"z\" as in zoo; written zu'ād, in words from Arabic", 'ضرورت',
     'need'),
    ('ط', J, 'طوئے', "to'e", 't', "the soft dental \"t\"; written to'e, in words from Arabic",
     'طرف', 'side, direction'),
    ('ظ', J, 'ظوئے', "zo'e", 'z', "\"z\" as in zoo; written zo'e, in words from Arabic", 'ظاہر',
     'clear, evident'),
    ('ع', J, 'عین', "'ain", "'", "'ain: in Urdu mostly silent, colouring the vowel beside it (a "
     "throat sound in Arabic)", 'عورت', 'woman'),
    ('غ', J, 'غین', 'ġain', 'ġ', 'a gargled "g", like the French r', 'غلط', 'wrong'),
    ('ف', J, 'فے', 'fe', 'f', '"f" as in fan', 'فون', 'phone'),
    ('ق', J, 'قاف', 'qāf', 'q', 'a "k" made further back, in the throat (from Arabic)', 'قلم', 'pen'),
    ('ک', J, 'کاف', 'kāf', 'k', '"k" as in skin — no puff of breath after it', 'کتاب', 'book'),
    ('گ', J, 'گاف', 'gāf', 'g', '"g" as in go', 'گاؤں', 'village'),
    ('ل', J, 'لام', 'lām', 'l', '"l" as in leaf, light and clear', 'لال', 'red'),
    ('م', J, 'میم', 'mīm', 'm', '"m" as in man', 'ماں', 'mother'),
    ('ن', J, 'نون', 'nūn', 'n', '"n" as in name', 'نام', 'name'),
    ('ں', F, 'نون غنہ', 'nūn ġunna', '̃', 'nūn ġunna, n without its dot: the vowel before it is '
     'said through the nose, as in French bon; only at the end of a word', 'ہاں', 'yes'),
    ('و', R, 'واؤ', "vā'o", 'v', '"v", softer than English v, close to w; or a vowel — ū as in '
     'food, o as in go (one pure vowel), au as in law', 'وقت', 'time'),
    ('ہ', J, 'چھوٹی ہے', 'choṭī he', 'h', '"h" as in hand; written choṭī he, "little he", the '
     'everyday h; at the end of a word often a short "a" (بچہ bacca)', 'ہاتھ', 'hand'),
    ('ھ', J, 'دو چشمی ہے', 'do-caśmī he', 'h', 'do-caśmī he, "two-eyed he": a breath after the '
     'consonant before it, which it never leaves — it writes the aspirated pairs below',
     'بھائی', 'brother'),
    ('ء', N, 'ہمزہ', 'hamza', '', 'hamza: a break between two vowels that meet, each said in '
     'turn; written alone or above a letter (ئ ؤ ۂ)', 'کئی', 'several'),
    ('ی', J, 'چھوٹی یے', 'choṭī ye', 'y', '"y" as in yes; or a vowel — ī as in see, e as in '
     'cake (one pure vowel), ai; at the end of a word ī', 'یاد', 'memory'),
    ('ے', F, 'بڑی یے', 'baṛī ye', 'e', 'baṛī ye, "big ye": only at the end of a word, said e '
     'as in cake or ai', 'آگے', 'forward'),
    # the marks a dictionary writes and running text leaves out, shown on ب
    ('بَ', N, 'زبر', 'zabar', 'a', 'zabar, the stroke above: a short neutral "a" as in about '
     'after the letter', 'اب', None),
    ('بِ', N, 'زیر', 'zer', 'i', 'zer, the stroke below: a short "i" as in bit after the letter',
     'دن', None),
    ('بُ', N, 'پیش', 'peś', 'u', 'peś, the little و above: a short "u" as in put after the letter',
     'خوش', None),
    ('بّ', N, 'تشدید', 'taśdīd', '', 'taśdīd, the little w above: the letter is doubled, held '
     'twice as long', 'بچہ', None),
    ('بْ', N, 'جزم', 'jazm', '', 'jazm, the little circle above: NO vowel after the letter',
     'وقت', None),
    # the aspirated pairs: a consonant and do-chashmi he, said as one sound with a breath
    ('بھ', N, 'بھ', 'bh', 'bh', '"b" followed by a breathy h, as in the middle of clubhouse',
     'بھائی', 'brother'),
    ('پھ', N, 'پھ', 'ph', 'ph', '"p" with a strong puff of breath, as in pit said firmly — never '
     'the f of phone', 'پھل', 'fruit'),
    ('تھ', N, 'تھ', 'th', 'th', 'the soft dental t with a strong puff of breath — never the th '
     'of thin', 'تھوڑا', 'a little'),
    ('ٹھ', N, 'ٹھ', 'ṭh', 'ṭh', 'the curled-back ṭ with a strong puff of breath', 'ٹھیک',
     'all right, fine'),
    ('جھ', N, 'جھ', 'jh', 'jh', '"j" followed by a breathy h', 'جھوٹ', 'a lie'),
    ('چھ', N, 'چھ', 'ch', 'ch', '"ch" with a strong puff of breath, as in the middle of '
     'church-hill', 'چھوٹا', 'small'),
    ('دھ', N, 'دھ', 'dh', 'dh', 'the soft dental d followed by a breathy h', 'دودھ', 'milk'),
    ('ڈھ', N, 'ڈھ', 'ḍh', 'ḍh', 'the curled-back ḍ followed by a breathy h', 'ڈھونڈنا',
     'to look for'),
    ('ڑھ', N, 'ڑھ', 'ṛh', 'ṛh', 'the flap ṛ followed by a breathy h; never starts a word',
     'پڑھنا', 'to read, to study'),
    ('کھ', N, 'کھ', 'kh', 'kh', '"k" with a strong puff of breath, as in kit said firmly',
     'کھانا', 'food; to eat'),
    ('گھ', N, 'گھ', 'gh', 'gh', '"g" followed by a breathy h, as in the middle of doghouse',
     'گھر', 'house, home'),
]

# THE MARKS' EXAMPLES are written WITH the mark, on the word the level deck teaches
# without it, so the card shows where the mark goes; their meaning is the word's.
MARKED = {'زبر': ('اَب', 'now'), 'زیر': ('دِن', 'day'), 'پیش': ('خُوش', 'happy'),
          'تشدید': ('بَچّہ', 'child'), 'جزم': ('وَقْت', 'time')}

FIELDS = ['Letter', 'Joins', 'Name', 'Sound', 'Example', 'Word']

SAY_NAME = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>'
SAY_WORD = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
LETTER = ('<div class="uc-letter">{{Letter}}' + SAY_NAME + '</div>'
          '{{#Joins}}<div class="uc-joins">{{Joins}}</div>{{/Joins}}')
DETAIL = ('<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>'
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
.uc-rm {
  font-weight: 600;
}
.uc-ex {
  font-size: 21px;
}
.uc-exr {
  margin-left: 6px;
  font-size: 14px;
  opacity: 0.62;
}
.uc-ur {
  font-family: "Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", "Urdu Typesetting", "Noto Naskh Arabic", "Geeza Pro", "Segoe UI", serif;
  unicode-bidi: isolate;
}
.uc-letter {
  line-height: 2;
}
.uc-letter .uc-say {
  margin-left: 0;
  margin-right: 14px;
}
.uc-joins {
  margin-top: 2px;
  font-size: 26px;
  line-height: 2;
  opacity: 0.75;
  word-spacing: 0.5em;
}
.uc-ex {
  line-height: 2.1;
}
.uc-exe {
  margin-left: 6px;
  opacity: 0.62;
}
"""


def ur(s):
    return f'<span class="uc-ur" dir="rtl" lang="ur">{E(s)}</span>'


def joins(ch, how):
    """The letter's shapes: alone, first, middle, last -- or alone and last, for a right-joiner."""
    if how == J:
        forms = [ch, ch + ZWJ, ZWJ + ch + ZWJ, ZWJ + ch]
    elif how == R:
        forms = [ch, ZWJ + ch]
    else:
        return ''
    return ' '.join(ur(x) for x in forms)


def main():
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'urdu-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' romanisation from lex.json: '
                         'run `python3 .claude/urdu/run.py` once first')
    cards, missing = [], []
    for i, (ch, how, name, nrom, rom, sound, word, meaning) in enumerate(LETTERS, 1):
        if name in MARKED:
            shown_word, meaning = MARKED[name]
        else:
            shown_word = word
        L = lex.get(fold(word)) or {}
        wr = next((e['roman'] for e in L.get('entries', []) if e.get('roman')), '')
        if not wr:
            missing.append(word)
        head = f'<span class="uc-rm">{E(rom)}</span> · ' if rom and rom != '̃' else ''
        # a letter's own name leads its sound unless the sound already names it
        named = sound.startswith(nrom) or f'written {nrom}' in sound
        cards.append({'sub': '', 'fields': {
            'Letter': ur(ch),
            'Joins': joins(ch, how) if how != F else ur(ZWJ + ch),
            'Name': E(name),
            'Sound': head + ('' if named else f'{E(nrom)}: ') + E(sound),
            'Example': (f'<span class="uc-ex">{ur(shown_word)}</span>'
                        + (f'<span class="uc-exr">{E(wr)}</span>' if wr else '')
                        + f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_urabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    sounds = [c['fields']['Sound'] for c in cards]
    assert len(set(sounds)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    if missing:
        raise SystemExit('no Wiktionary romanisation for: ' + ' '.join(missing))
    desc = (
        f"The Urdu alphabet: {n} notes — the forty letters in the order Urdu primers give them "
        "(alif madd beside alif, nūn ġunna beside nūn, the two he's and the two ye's), the five "
        "marks a dictionary writes over and under the letters and everyday writing leaves out "
        "(zabar, zer, peś, taśdīd, jazm), and the eleven breathy pairs a consonant makes with "
        "do-caśmī he (بھ, پھ … گھ), which a reader meets on every line. The first deck of the "
        "Urdu collection. Urdu is written right to left, and most letters join the next one and "
        "change shape as they do, so each card shows the letter alone and then at the start, in "
        "the middle and at the end of a word (a letter that never joins the letter after it, such "
        "as ا or د, shows two shapes). Both directions: see a letter and recall its sound, or see "
        "a sound and recall the letter, each a card with its own schedule. Urdu keeps the "
        "spellings of Arabic words with letters that in Urdu sound alike — three s's, four z's, "
        "two t's and two h's — so every sound side names its letter, as a speaker does when "
        "spelling a word aloud. Every note gives the romanisation the level decks use, the "
        "sound described in English words and one everyday word that shows it, with a speaker "
        "beside the letter and the word (whether it speaks depends on an Urdu voice being "
        "installed on your device). The sounds are approximations, as every learner's alphabet "
        "gives them; where English has no equivalent — the breathy consonants, the curled-back "
        "ṭ, ḍ and ṛ against the soft dental t and d — the card says what to do with the tongue "
        "or the breath instead. The letters are drawn in your device's Urdu typeface, Nastaliq "
        "where it has one. Sources: the standard description of Urdu's alphabet and sounds; the "
        "example words' romanisations are English Wiktionary's, via the kaikki.org extraction "
        "(CC BY-SA 4.0)."
    )
    meta = {
        'id': 'urabc', 'title': 'Urdu Alphabet',
        'subtitle': f'{n} letters, marks and pairs · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['urdu', 'alphabet', 'nastaliq'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Urdu letter', 'speechLang': 'ur-PK',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Urdu-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
