#!/usr/bin/env python3
"""Write the Persian alphabet deck: `decks/Persian-Alphabet.folio-deck.json`.

    python3 .claude/persian/alphabet.py

The first deck of the Persian collection, sorted before A1 by `levelRank`'s
"Alphabet" rule.  The level decks print a romanisation under every word, so
this deck is not a gate as Russian's is; it is where the script itself is
learnt.

ONE NOTE PER LETTER, IN THE ALPHABET'S ORDER -- the thirty-two letters (the
Arabic alphabet's twenty-eight and the four Persian adds: پ چ ژ گ), then آ,
the three short-vowel marks, the doubling mark, the hamza and the -an ending
that a beginner meets in لطفاً.  Each letter shows its FOUR SHAPES (alone, and
joined at the start, middle and end of a word), since the shape a reader meets
is almost never the one in the alphabet chart; the seven letters that never
join to the letter after them say so instead.  Since the beginner pass
(2026-11-19) four more notes stand where they teach: the silent و of خوا, the
final ه that is the vowel e, the final ی read â, and the half-space (U+200C).

WHAT THE SOUNDS ARE.  An English comparison QUOTED from Wikipedia's
Help:IPA/Persian at a pinned revision, never IPA and never typed from memory
(the table's own comment has the list), with the romanisation the level decks
use (Wiktionary's Iranian one: â, x for kh, š, ž, ġ).  PERSIAN SPELLS SOME
SOUNDS WITH SEVERAL LETTERS -- s with س ث ص, z with ز ذ ض ظ, t with ت ط, h
with ه ح, and in Tehran one sound for غ ق.  Each such card names the others,
and its sound side is told apart by the example word it asks for, so the
reverse card has one answer.  No corpus is read, and a re-run is
byte-identical whenever `lex.json` is.

THE IDS ARE IN THE TABLE, not the position: a note's number is pinned in
`persian-ids.json` and `persian-fix.js --check` holds the deck to it.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fa import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'fa-abc'
COLOR = '#008763'
ZWJ = '\u200d'

# WHERE EVERY SOUND SIDE COMES FROM (2026-11-19, the beginner pass).  Until then the comparisons
# were "the standard description of modern Iranian Persian", which no reader could check, and
# three of them were not the Iranian sound at all: â was "a as in father" (the key's DARI cell;
# the Farsi one is "off, but longer"), ġ "like the French r", o "a short version of go"; and
# seven letters were "found only in words from Arabic", which no source here says and صد
# "hundred" contradicts.  Now:
#   · an English comparison is the FARSI cell of Wikipedia's Help:IPA/Persian (revision
#     1379048408) for that sound -- boy, pen, tall, sock, joy, chip, hat, loch (Scottish), den,
#     jazz, vision, shake, fast, cat, gate, land, man, neck, oven, yard; bat, "between bait and
#     bet", story, "off, but longer", beat, cool; bay, goal -- and "letters with one sound" are the
#     letters that key lists in one row (ت ط · س ص ث · ز ذ ض ظ · ه ح · ع ء), غ and ق by its note
#     ("In the modern Tehrani accent ... the phonemes of غ and ق are allophones");
#   · what a letter does in a word is a sentence of "Persian alphabet" (revision 1385657500):
#     the four added letters, the seven that "do not connect to the following letter", the
#     "silent alef which carries the short vowel", ه and و as "proxy letters" for a final vowel,
#     tanvin ("the word ends in an alveolar nasal sound without the addition of the letter nun"),
#     the non-joiner ("Certain morphemes (such as the plural ending -hâ) ... are separated from
#     the word using the zero-width non-joiner");
#   · the readings of the words named are the English Wiktionary's (xâhar, hattâ, četowr).
#
# (id, letter, its Persian name (what the speaker says), romanisation, joins forward?,
#  sound, example word, its meaning).  THE ID IS THE NUMBER IN THE NOTE'S ID AND IS PINNED
#  (`persian-ids.json`): 1 to 39 are the notes as first shipped, in the alphabet's order; a
#  note added later takes the next free number wherever it stands in the list.
LETTERS = [
    (1, 'ا', 'الف', 'â', False, 'the long vowel â: "o" as in off, but longer. At the START of a word '
     'alef is silent and carries the short vowel that follows it (اسب asb)', 'باد', 'wind'),
    (2, 'ب', 'ب', 'b', True, '"b" as in boy', 'برادر', 'brother'),
    (3, 'پ', 'پ', 'p', True, '"p" as in pen — one of the four letters Persian added to the Arabic '
     'alphabet (پ چ ژ گ)', 'پدر', 'father'),
    (4, 'ت', 'ت', 't', True, '"t" as in tall; ط is a second letter for the same sound', 'تو', 'you'),
    (5, 'ث', 'ث', 's', True, '"s" as in sock — the same sound as س and ص: three letters, one sound',
     'ثانیه', 'second (of time)'),
    (6, 'ج', 'جیم', 'j', True, '"j" as in joy', 'جا', 'place'),
    (7, 'چ', 'چ', 'č', True, '"ch" as in chip — a letter Persian added', 'چای', 'tea'),
    (8, 'ح', 'ح', 'h', True, '"h" as in hat — the same sound as ه: two letters, one sound', 'حال',
     'state, condition'),
    (9, 'خ', 'خ', 'x', True, 'the "ch" of Scottish loch', 'خانه', 'house'),
    (10, 'د', 'دال', 'd', False, '"d" as in den', 'در', 'door'),
    (11, 'ذ', 'ذال', 'z', False, '"z" as in jazz — the same sound as ز, ض and ظ: four letters, one '
     'sound', 'ذهن', 'mind'),
    (12, 'ر', 'ر', 'r', False, 'a flapped or rolled r', 'روز', 'day'),
    (13, 'ز', 'ز', 'z', False, '"z" as in jazz; ذ, ض and ظ are three more letters for the same sound',
     'زن', 'woman'),
    (14, 'ژ', 'ژ', 'ž', False, 'the "si" of vision — a letter Persian added', 'ژاکت', 'jacket'),
    (15, 'س', 'سین', 's', True, '"s" as in sock; ث and ص are two more letters for the same sound',
     'سال', 'year'),
    (16, 'ش', 'شین', 'š', True, '"sh" as in shake', 'شب', 'night'),
    (17, 'ص', 'صاد', 's', True, '"s" as in sock — the same sound as س and ث', 'صبح', 'morning'),
    (18, 'ض', 'ضاد', 'z', True, '"z" as in jazz — the same sound as ز, ذ and ظ', 'ضعیف', 'weak'),
    (19, 'ط', 'طا', 't', True, '"t" as in tall — the same sound as ت', 'طلا', 'gold'),
    (20, 'ظ', 'ظا', 'z', True, '"z" as in jazz — the same sound as ز, ذ and ض', 'ظهر', 'noon'),
    (21, 'ع', 'عین', '\'', True, 'a catch in the throat (a glottal stop), the sound in the middle of '
     'Cockney "water" — the same sound as the hamze ء. The romanisation writes it \' inside or at '
     'the end of a word (ساعت sâ\'at) and leaves it out at the start', 'عکس', 'photograph'),
    (22, 'غ', 'غین', 'ġ', True, 'like the "g" of got, but deeper in the throat; in Tehran the same '
     'sound as ق', 'غذا', 'food'),
    (23, 'ف', 'ف', 'f', True, '"f" as in fast', 'فردا', 'tomorrow'),
    (24, 'ق', 'قاف', 'ġ', True, 'like the "g" of got, but deeper in the throat — in Tehran the same '
     'sound as غ, and the same ġ in the romanisation', 'قهوه', 'coffee'),
    (25, 'ک', 'کاف', 'k', True, '"c" as in cat', 'کتاب', 'book'),
    (26, 'گ', 'گاف', 'g', True, '"g" as in gate — a letter Persian added', 'گل', 'flower'),
    (27, 'ل', 'لام', 'l', True, '"l" as in land', 'لب', 'lip'),
    (28, 'م', 'میم', 'm', True, '"m" as in man', 'ماه', 'moon, month'),
    (29, 'ن', 'نون', 'n', True, '"n" as in neck', 'نان', 'bread'),
    (30, 'و', 'واو', 'v · u · o · ow', False, '"v" as in oven; the long vowel u, "oo" as in cool '
     '(دور dur); o as in story in a few words (تو to, دو do); ow, the "oa" of goal (چطور četowr). '
     'After خ it may be silent (خواهر xâhar)', 'وقت', 'time'),
    (41, 'خوا', 'خوا', 'xâ', None, 'the silent و: in خوا the و is written and not said, so it is '
     'read xâ, never xvâ (خواستن xâstan "to want", خواب xâb "sleep")', 'خواهر', 'sister'),
    (31, 'ه', 'ه', 'h', True, '"h" as in hat; ح is a second letter for the same sound. At the END of '
     'a word it is usually silent and stands for a vowel (the next card)', 'هوا', 'air, weather'),
    (40, ZWJ + 'ه', 'ه', 'e', None, 'the silent ه at the END of a word: not h but the vowel e, '
     'between the vowels of bait and bet (بچه bače "child", سه se "three")', 'خانه', 'house'),
    (32, 'ی', 'ی', 'y · i · ey', True, '"y" as in yard; the long vowel i, "ea" as in beat (سیب sib); '
     'ey, the "ay" of bay (کی key "when")', 'یک', 'one'),
    (42, ZWJ + 'ی', 'ی', 'â', None, 'ی at the END of a few words from Arabic is read â, like alef',
     'حتی', 'even'),
    # آ and the marks
    (33, 'آ', 'آ', 'â', False, 'alef with the madda above: the long vowel â ("o" as in off, but '
     'longer) at the START of a word, where plain alef would carry a short vowel', 'آب', 'water'),
    (34, 'بَ', 'زبر', 'a', None, 'zebar, the stroke above: the short vowel a, as in bat; usually not '
     'written', 'بد', 'bad'),
    (35, 'بِ', 'زیر', 'e', None, 'zir, the stroke below: the short vowel e, between the vowels of bait '
     'and bet; usually not written. The same unwritten e links a word to the word that describes '
     'it — the ezafe: کتابِ من ketâb-e man "my book"', 'دل', 'heart'),
    (36, 'بُ', 'پیش', 'o', None, 'piš, the small و above: the short vowel o, as in story; usually not '
     'written', 'گل', 'flower'),
    (37, 'بّ', 'تشدید', '—', None, 'tašdid, the small w-shape above: the consonant is DOUBLED; '
     'usually not written, and the romanisation writes the letter twice', 'اول', 'first'),
    (38, 'ء', 'همزه', '\' ', None, 'hamze: a catch in the throat, the same sound as ع; written on its '
     'own or sitting on ا, و or ی', 'سؤال', 'question'),
    (39, 'اً', 'تنوین', 'an', None, 'tanvin, the double stroke on alef: the word ends in -an with no ن '
     'written; the stroke itself is often left off (لطفا)', 'لطفاً', 'please'),
    (43, 'می‌روم', 'نیم‌فاصله', '—', None, 'the half-space (zero-width non-joiner): no sound. It '
     'ends a letter\'s join without leaving a gap, between a word and a prefix or an ending written '
     'with it (می‌روم mi-ravam "I go"); the romanisation shows it as a hyphen', 'آن‌ها', 'they'),
]

# Example words whose romanisation is not on their Wiktionary entry in a form the
# level decks use; written here in the same system.
ROMAN_BY_HAND = {'گل': 'gol', 'بد': 'bad', 'دل': 'del', 'لطفاً': 'lotfan', 'سؤال': "so'âl"}

FIELDS = ['Letter', 'Name', 'Shapes', 'Sound', 'Clue', 'Example', 'Word']

SAY_NAME = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>'
SAY_WORD = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>'
LETTER = ('<div class="uc-letter">{{Letter}}' + SAY_NAME + '</div>'
          '{{#Shapes}}<div class="uc-shapes">{{Shapes}}</div>{{/Shapes}}')
DETAIL = ('<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>'
          '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}'
          + SAY_WORD + '</div></div>')
ASK = ('<div class="uc-ask">Which letter is this?</div>'
       '<div class="uc-field"><div class="uc-gl">{{Sound}}</div>'
       '<div class="uc-pos uc-gap">the letter in</div><div class="uc-gl">{{Clue}}</div></div>')
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
  font-size: 64px;
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
.uc-exe {
  margin-left: 6px;
  opacity: 0.62;
}
/* the four shapes of a Persian letter, right to left */
.uc-shapes {
  margin-top: 4px;
  font-size: 15px;
  opacity: 0.75;
}
.uc-shape + .uc-shape {
  margin-right: 14px;
}
.uc-sl {
  margin-left: 5px;
  font-size: 9.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.6;
}
.uc-sf {
  font-size: 24px;
}
"""


def shapes(letter, joins):
    """Alone, start, middle, end -- written with the zero-width joiner so each shape renders as
    it does inside a word.  A letter that never joins the letter AFTER it has two shapes only."""
    if joins is None:
        return ''
    if joins:
        sh = [('alone', letter), ('start', letter + ZWJ), ('middle', ZWJ + letter + ZWJ),
              ('end', ZWJ + letter)]
    else:
        sh = [('alone', letter), ('after a letter', ZWJ + letter)]
    out = ''.join(f'<span class="uc-shape"><span class="uc-sf">{E(f)}</span>'
                  f'<span class="uc-sl">{E(l)}</span></span>' for l, f in sh)
    note = '' if joins else '<div class="uc-sl">never joins the letter after it</div>'
    return f'<div dir="rtl" lang="fa">{out}</div>{note}'


def main():
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'persian-cache', 'lex.json')
    lex = json.load(open(cache, encoding='utf-8')) if os.path.exists(cache) else {}
    if not lex:
        raise SystemExit('alphabet.py reads the example words\' romanisation from lex.json: '
                         'run `python3 .claude/persian/run.py` once first')
    cards, missing = [], []
    assert len({r[0] for r in LETTERS}) == len(LETTERS), 'an id is used twice'
    for i, shown, name, rom, joins, sound, word, meaning in LETTERS:
        L = lex.get(fold(word)) or {}
        wr = ROMAN_BY_HAND.get(word, '') \
            or next((e['roman'] for e in L.get('entries', []) if e.get('roman')), '')
        if not wr:
            missing.append(word)
        cards.append({'sub': '', 'fields': {
            'Letter': f'<span dir="rtl" lang="fa">{E(shown)}</span>',
            'Name': E(name),
            'Shapes': shapes(shown, joins),
            'Sound': (f'<span class="uc-rm">{E(rom)}</span> · ' if rom != '—' else '') + E(sound),
            'Clue': f'<span class="uc-rm">{E(wr)}</span><span class="uc-exe">{E(meaning)}</span>',
            'Example': (f'<span class="uc-ex" dir="rtl" lang="fa">{E(word)}</span>'
                        + (f'<span class="uc-exr">{E(wr)}</span>' if wr else '')
                        + f'<span class="uc-exe">{E(meaning)}</span>'),
            'Word': E(word),
        }, 'id': f'u_faabc_{i}', 'type': TYPE_ID})
    n = len(cards)
    fronts = [c['fields']['Sound'] + c['fields']['Clue'] for c in cards]
    assert len(set(fronts)) == n, 'two letters share a sound side: the reverse card is unanswerable'
    if missing:
        raise SystemExit('no romanisation for: ' + ' '.join(missing))
    days = -(-2 * n // 10)
    desc = (
        f"The Persian alphabet: {n} notes — the thirty-two letters in the alphabet's order (the "
        "twenty-eight of Arabic and the four Persian added, پ چ ژ گ), each followed by what it "
        "does that its name does not say (the silent و of خواهر, the final ه that is a vowel, the "
        "final ی read â), then آ, the three short-vowel marks, the doubling mark, the hamza, the "
        "-an ending of لطفاً and the half-space of می‌روم. The first deck of the Persian "
        "collection. Both directions: see a letter and recall its sound, or see a sound and recall "
        "the letter, each a card with its own schedule. "
        f"AT THE DEFAULT PACE of ten new cards a day the {n} notes are {2 * n} cards and take "
        f"{days} days; A1 can be started beside it, since every word card prints its romanisation. "
        "Persian is written right to left, and most letters join the letters on both sides, "
        "changing shape as they do, so each letter is shown in its four shapes — alone, and at "
        "the start, middle and end of a word; the seven that never join the letter after them "
        "(ا د ذ ر ز ژ و) say so. Every note gives the romanisation the level decks use, the sound "
        "compared with an English word, and one everyday word that shows it, with a speaker "
        "beside the letter and the word. Persian spells some sounds with more than one letter — s "
        "with س ث ص, z with ز ذ ض ظ, t with ت ط, h with ه ح, and in Tehran one sound for غ and ق "
        "— and each such card names the others; the sound side names the word it asks for, so "
        "every card has one answer. THE SHORT VOWELS ARE USUALLY NOT WRITTEN, which is why the "
        "level decks romanise every word: four A1 words in five have a vowel the script does not "
        "show. The sounds are those of modern Iranian (Tehran) Persian. Sources. The English "
        "comparisons are the Farsi cells of Wikipedia's Help:IPA/Persian (revision 1379048408), "
        "as are the groups of letters with one sound; the four added letters, the seven that do "
        "not join, the silent alef, the final ه, tanvin and the half-space are sentences of "
        "Wikipedia's \"Persian alphabet\" (revision 1385657500), both CC BY-SA 4.0; the example "
        "words' romanisations are English Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
    )
    meta = {
        'id': 'faabc', 'title': 'Persian Alphabet',
        'subtitle': f'{n} letters and signs · both directions, as two cards per letter',
        'desc': desc, 'author': '', 'language': 'en', 'color': COLOR,
        'tags': ['persian', 'farsi', 'alphabet'], 'glossMode': 'site',
        'types': {TYPE_ID: {
            'id': TYPE_ID, 'name': 'Persian letter', 'speechLang': 'fa-IR',
            'fields': FIELDS,
            'cards': [{'name': 'Letter → sound', 'front': FRONT_L, 'back': BACK_L},
                      {'name': 'Sound → letter', 'front': FRONT_S, 'back': BACK_S}],
            'css': CSS,
        }},
        'version': 1, 'createdAt': STAMP, 'updatedAt': STAMP, 'forkedFrom': None,
    }
    deck = {'folioDeck': 1, 'exportedAt': STAMP, 'meta': meta, 'cards': cards, 'gloss': {}}
    out = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..',
                                       'decks', 'Persian-Alphabet.folio-deck.json'))
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(deck, fh, ensure_ascii=False)
    print('  wrote', out, os.path.getsize(out), 'bytes', n, 'notes')


if __name__ == '__main__':
    main()
