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
join to the letter after them say so instead.

WHAT THE SOUNDS ARE.  An approximation in English words, as learner's
alphabets give them, never IPA, with the romanisation the level decks use
(Wiktionary's Iranian one: â, x for kh, š, ž, ġ).  PERSIAN SPELLS SOME SOUNDS
WITH SEVERAL LETTERS -- s with س ث ص, z with ز ذ ض ظ, t with ت ط, h with ه ح,
the gargled g with غ ق -- the extra letters kept from the Arabic words that
brought them.  Each such card says so, and its sound side is told apart by
the example word it asks for, so the reverse card has one answer.  The
descriptions are the standard ones of modern Iranian (Tehran) Persian; no
corpus is read, and a re-run is byte-identical whenever `lex.json` is.
"""
import html, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fa import fold

E = lambda s: html.escape(s, quote=True)
STAMP = '2026-11-09T00:00:00.000Z'
TYPE_ID = 'fa-abc'
COLOR = '#008763'
ZWJ = '\u200d'

# (letter, its Persian name (what the speaker says), romanisation, joins forward?,
#  sound, example word, its meaning)
ONE = 'one of the letters for '
LETTERS = [
    ('ا', 'الف', 'â', False, '"a" as in father, long; at the START of a word alef only carries '
     'the short vowel that follows it (اسب asb)', 'باد', 'wind'),
    ('ب', 'ب', 'b', True, '"b" as in bed', 'برادر', 'brother'),
    ('پ', 'پ', 'p', True, '"p" as in pen — one of the four letters Persian added to the Arabic '
     'alphabet', 'پدر', 'father'),
    ('ت', 'ت', 't', True, '"t" as in ten — the everyday t', 'تو', 'you'),
    ('ث', 'ث', 's', True, '"s" — ' + ONE + 's (with س and ص), found only in words from Arabic',
     'ثانیه', 'second (of time)'),
    ('ج', 'جیم', 'j', True, '"j" as in jam', 'جا', 'place'),
    ('چ', 'چ', 'č', True, '"ch" as in church — a letter Persian added', 'چای', 'tea'),
    ('ح', 'ح', 'h', True, '"h" — ' + ONE + 'h (with ه), found only in words from Arabic', 'حال',
     'state, condition'),
    ('خ', 'خ', 'x', True, '"kh", rasped at the back of the mouth as in Scottish loch', 'خانه',
     'house'),
    ('د', 'دال', 'd', False, '"d" as in dog', 'در', 'door'),
    ('ذ', 'ذال', 'z', False, '"z" — ' + ONE + 'z (with ز, ض and ظ), found only in words from Arabic',
     'ذهن', 'mind'),
    ('ر', 'ر', 'r', False, '"r" said with one light tap of the tongue, as in Spanish pero', 'روز',
     'day'),
    ('ز', 'ز', 'z', False, '"z" as in zoo — the everyday z', 'زن', 'woman'),
    ('ژ', 'ژ', 'ž', False, 'the "s" of pleasure — a letter Persian added', 'ژاکت', 'jacket'),
    ('س', 'سین', 's', True, '"s" as in sun — the everyday s', 'سال', 'year'),
    ('ش', 'شین', 'š', True, '"sh" as in ship', 'شب', 'night'),
    ('ص', 'صاد', 's', True, '"s" — ' + ONE + 's (with س and ث), found only in words from Arabic',
     'صبح', 'morning'),
    ('ض', 'ضاد', 'z', True, '"z" — ' + ONE + 'z (with ز, ذ and ظ), found only in words from Arabic',
     'ضعیف', 'weak'),
    ('ط', 'طا', 't', True, '"t" — ' + ONE + 't (with ت), found only in words from Arabic', 'طلا',
     'gold'),
    ('ظ', 'ظا', 'z', True, '"z" — ' + ONE + 'z (with ز, ذ and ض), found only in words from Arabic',
     'ظهر', 'noon'),
    ('ع', 'عین', '\'', True, 'a catch in the throat, as in the middle of uh-oh, or nothing at all; '
     'found only in words from Arabic', 'عکس', 'photograph'),
    ('غ', 'غین', 'ġ', True, 'a gargled "g" at the back of the throat, like the French r; in Iran '
     'said exactly as ق', 'غذا', 'food'),
    ('ف', 'ف', 'f', True, '"f" as in fan', 'فردا', 'tomorrow'),
    ('ق', 'قاف', 'ġ', True, 'the same gargled "g" as غ — in Iran the two letters sound alike; ق is '
     'the one in most words from Arabic', 'قهوه', 'coffee'),
    ('ک', 'کاف', 'k', True, '"k" as in kit', 'کتاب', 'book'),
    ('گ', 'گاف', 'g', True, '"g" as in go — a letter Persian added', 'گل', 'flower'),
    ('ل', 'لام', 'l', True, '"l" as in leaf', 'لب', 'lip'),
    ('م', 'میم', 'm', True, '"m" as in man', 'ماه', 'moon, month'),
    ('ن', 'نون', 'n', True, '"n" as in no', 'نان', 'bread'),
    ('و', 'واو', 'v · u · o', False, '"v" as in van; also the long vowel "oo" as in food (دور dur), '
     'and "o" in a few words (تو to, و o "and")', 'وقت', 'time'),
    ('ه', 'ه', 'h', True, '"h" as in hat — the everyday h; at the END of a word usually silent, '
     'marking a final e (خانه xâne)', 'هوا', 'air, weather'),
    ('ی', 'ی', 'y · i', True, '"y" as in yes; also the long vowel "ee" as in see (سیب sib)', 'یک',
     'one'),
    # آ and the marks
    ('آ', 'آ', 'â', False, 'alef with the madda above: "a" as in father at the START of a word, '
     'where plain alef would carry a short vowel', 'آب', 'water'),
    ('بَ', 'زبر', 'a', None, 'zebar, the stroke above: the short vowel "a", as in cat; usually not '
     'written', 'بد', 'bad'),
    ('بِ', 'زیر', 'e', None, 'zir, the stroke below: the short vowel "e", as in bed; usually not '
     'written, and also the ezafe that links two words (کتابِ من ketâb-e man "my book")', 'دل',
     'heart'),
    ('بُ', 'پیش', 'o', None, 'piš, the small و above: the short vowel "o", as in a short version of '
     'go; usually not written', 'گل', 'flower'),
    ('بّ', 'تشدید', '—', None, 'tašdid, the small w-shape above: the consonant is DOUBLED, held a '
     'moment longer; usually not written', 'بچه', 'child'),
    ('ء', 'همزه', '\' ', None, 'hamze: a catch in the throat, as ع; written on its own or sitting on '
     'ا, و or ی', 'سؤال', 'question'),
    ('اً', 'تنوین', 'an', None, 'tanvin, the double stroke on alef: the ending "-an" of adverbs from '
     'Arabic', 'لطفاً', 'please'),
]

# Example words whose romanisation is not on their Wiktionary entry in a form the
# level decks use; written here in the same system.
ROMAN_BY_HAND = {'گل': 'gol', 'بد': 'bad', 'دل': 'del', 'بچه': 'bačče', 'لطفاً': 'lotfan',
                 'سؤال': "so'âl"}

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
    for i, (shown, name, rom, joins, sound, word, meaning) in enumerate(LETTERS, 1):
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
    desc = (
        f"The Persian alphabet: {n} notes, in the alphabet's order — the thirty-two letters (the "
        "twenty-eight of Arabic and the four Persian added, پ چ ژ گ), then آ, the three short-vowel "
        "marks, the doubling mark, the hamza and the -an ending of لطفاً. The first deck of the "
        "Persian collection. Both directions: see a letter and recall its sound, or see a sound "
        "and recall the letter, each a card with its own schedule. Persian is written right to "
        "left, and most letters join the letters on both sides, changing shape as they do, so "
        "each letter is shown in its four shapes — alone, and at the start, middle and end of a "
        "word; the seven that never join the letter after them (ا د ذ ر ز ژ و) say so. Every note "
        "gives the romanisation the level decks use, the sound described in English words, and "
        "one everyday word that shows it, with a speaker beside the letter and the word. Persian "
        "spells some sounds with more than one letter — s with س ث ص, z with ز ذ ض ظ, t with ت ط, "
        "h with ه ح, the gargled g with غ ق — keeping the extra letters in words that came from "
        "Arabic; their cards say which is the everyday one, and the sound side names the word "
        "it asks for, so every card has one answer. The short vowels are usually NOT written, "
        "which is why the level decks romanise every word. The sounds are those of modern "
        "Iranian (Tehran) Persian, approximated in English as every learner's alphabet does. "
        "Sources: the standard description of modern Iranian Persian; the example words' "
        "romanisations are English Wiktionary's, via the kaikki.org extraction (CC BY-SA 4.0)."
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
